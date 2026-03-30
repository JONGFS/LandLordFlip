import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type { SceneItem } from './VideoComposition';
import { renderFrameToCanvas, preloadPhotos } from './renderFrame';

export interface ExportOptions {
  scenes: SceneItem[];
  photoUrls: string[];
  audioUrl: string | null;
  fps: number;
  width: number;
  height: number;
  totalFrames: number;
  onProgress: (percent: number) => void;
}

export async function exportToMp4(opts: ExportOptions): Promise<Blob> {
  const { scenes, photoUrls, audioUrl, fps, width, height, totalFrames, onProgress } = opts;

  // Pre-load all photos
  onProgress(0);
  const photos = await preloadPhotos(photoUrls);

  // Prepare audio data if available
  let audioBuffer: AudioBuffer | null = null;
  let canEncodeAudio = false;

  if (audioUrl) {
    try {
      const audioCtx = new AudioContext({ sampleRate: 48000 });
      const res = await fetch(audioUrl, { mode: 'cors' });
      const arrBuf = await res.arrayBuffer();
      audioBuffer = await audioCtx.decodeAudioData(arrBuf);
      await audioCtx.close();

      // Check if AAC encoding is supported
      if (typeof AudioEncoder !== 'undefined') {
        const support = await AudioEncoder.isConfigSupported({
          codec: 'mp4a.40.2',
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: audioBuffer.sampleRate,
          bitrate: 128_000,
        });
        canEncodeAudio = !!support.supported;
      }
    } catch {
      audioBuffer = null;
      canEncodeAudio = false;
    }
  }

  // Create muxer
  const muxerOpts: ConstructorParameters<typeof Muxer>[0] = {
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height,
    },
    fastStart: 'in-memory',
  };
  if (canEncodeAudio && audioBuffer) {
    muxerOpts.audio = {
      codec: 'aac',
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate,
    };
  }
  const muxer = new Muxer(muxerOpts);

  // Create video encoder
  let videoEncoderDone: () => void;
  const videoEncoderPromise = new Promise<void>((resolve) => { videoEncoderDone = resolve; });
  let videoError: Error | null = null;

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta ?? undefined);
    },
    error: (e) => { videoError = new Error(e.message); },
  });

  videoEncoder.configure({
    codec: 'avc1.640028',
    width,
    height,
    bitrate: 6_000_000,
    framerate: fps,
  });

  // Render frames
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  const PROGRESS_VIDEO_WEIGHT = canEncodeAudio ? 80 : 95;

  for (let frame = 0; frame < totalFrames; frame++) {
    if (videoError) throw videoError;

    renderFrameToCanvas(
      ctx as unknown as CanvasRenderingContext2D,
      frame, fps, scenes, photos, width, height,
    );

    const videoFrame = new VideoFrame(canvas, {
      timestamp: Math.round((frame / fps) * 1_000_000),
      duration: Math.round(1_000_000 / fps),
    });
    videoEncoder.encode(videoFrame, { keyFrame: frame % (fps * 2) === 0 });
    videoFrame.close();

    // Throttle progress updates
    if (frame % 10 === 0 || frame === totalFrames - 1) {
      onProgress(Math.round(((frame + 1) / totalFrames) * PROGRESS_VIDEO_WEIGHT));
    }

    // Yield to avoid blocking the main thread too long
    if (frame % 30 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  await videoEncoder.flush();
  videoEncoder.close();
  videoEncoderDone!();
  await videoEncoderPromise;

  // Encode audio if available
  if (canEncodeAudio && audioBuffer) {
    await encodeAudio(muxer, audioBuffer, totalFrames / fps, (p) => {
      onProgress(PROGRESS_VIDEO_WEIGHT + Math.round(p * (95 - PROGRESS_VIDEO_WEIGHT)));
    });
  }

  onProgress(98);

  // Finalize
  muxer.finalize();
  const buffer = (muxer.target as ArrayBufferTarget).buffer;

  onProgress(100);
  return new Blob([buffer], { type: 'video/mp4' });
}

async function encodeAudio(
  muxer: InstanceType<typeof Muxer>,
  audioBuffer: AudioBuffer,
  videoDurationSec: number,
  onProgress: (fraction: number) => void,
): Promise<void> {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const totalSamples = Math.min(
    audioBuffer.length,
    Math.ceil(videoDurationSec * sampleRate),
  );

  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => {
      muxer.addAudioChunk(chunk, meta ?? undefined);
    },
    error: (e) => { console.error('AudioEncoder error:', e); },
  });

  audioEncoder.configure({
    codec: 'mp4a.40.2',
    numberOfChannels,
    sampleRate,
    bitrate: 128_000,
  });

  // Process in chunks of 1024 samples
  const chunkSize = 1024;
  const totalChunks = Math.ceil(totalSamples / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const offset = i * chunkSize;
    const length = Math.min(chunkSize, totalSamples - offset);

    // Planar layout: all samples for ch0, then all for ch1, etc.
    const planar = new Float32Array(length * numberOfChannels);
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const channelData = audioBuffer.getChannelData(ch);
      for (let s = 0; s < length; s++) {
        planar[ch * length + s] = channelData[offset + s];
      }
    }

    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate,
      numberOfFrames: length,
      numberOfChannels,
      timestamp: Math.round((offset / sampleRate) * 1_000_000),
      data: planar,
    });

    audioEncoder.encode(audioData);
    audioData.close();

    if (i % 50 === 0) {
      onProgress(i / totalChunks);
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  await audioEncoder.flush();
  audioEncoder.close();
  onProgress(1);
}
