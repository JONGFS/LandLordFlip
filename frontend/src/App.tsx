/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Check,
  Loader2,
  ChevronRight,
  Plus,
  X,
  Download,
  RefreshCw,
  LayoutGrid,
  MapPin,
  DollarSign,
  Maximize,
  Sparkles,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────────

type Screen = 'input' | 'loading' | 'results';

interface PhotoFile {
  id: string;
  previewUrl: string;
  file: File;
  label: string;
}

interface ScriptVariant {
  hook: string;
  body_copy: string;
  cta: string;
}

interface SceneItem {
  photo_index: number;
  overlay_text: string;
  duration_sec: number;
  voiceover_segment: string;
}

interface GenerationResult {
  job_id: string;
  hooks: string[];
  scripts: ScriptVariant[];
  selected_script_index: number;
  market_positioning: {
    target_audience: string;
    video_angle: string;
    key_selling_points: string[];
    constraints: string[];
  };
  scene_sequence: SceneItem[];
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_notes: string[];
  voiceover_url: string | null;
  video_url: string | null;
}

interface FormData {
  title: string;
  price: string;
  neighborhood: string;
  square_footage: string;
  beds: string;
  baths: string;
  amenities: string[];
  target_renter: string;
  leasing_special: string;
  photos: PhotoFile[];
}

// ── Components ─────────────────────────────────────────────────────────────────

const Navbar = ({ onReset }: { onReset: () => void }) => (
  <nav className="flex items-center justify-between py-6 px-8 max-w-7xl mx-auto w-full">
    <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
      <span className="logo text-2xl font-bold tracking-tight">
        LandlordFlip<span className="text-coral">.</span>
      </span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
      <a href="#" className="hover:text-white transition-colors">How it works</a>
      <a href="#" className="hover:text-white transition-colors">Pricing</a>
    </div>
    <button className="btn-coral text-sm">Get Started</button>
  </nav>
);

const InputForm = ({
  onGenerate,
}: {
  onGenerate: (data: FormData) => void;
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [leasingSpecial, setLeasingSpecial] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [targetRenter, setTargetRenter] = useState('Young Professional');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const amenityOptions = ['Gym', 'Pool', 'Parking', 'Pet Friendly', 'Furnished', 'Rooftop'];
  const targetOptions = ['Student', 'Young Professional', 'Budget Renter'];

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: PhotoFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      file,
      label: file.name.replace(/\.[^.]+$/, ''),
    }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 6));
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const handleSubmit = () => {
    onGenerate({
      title,
      price,
      neighborhood,
      square_footage: squareFootage,
      beds,
      baths,
      amenities,
      target_renter: targetRenter,
      leasing_special: leasingSpecial,
      photos,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-8 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
      {/* Left Column: Form */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-medium">Listing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Listing Title</label>
              <input
                type="text"
                placeholder="Modern Loft in SoHo"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Rent Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="3,200"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full input-field pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Neighborhood</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Manhattan, NY"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full input-field pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Square Footage</label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="850"
                  value={squareFootage}
                  onChange={e => setSquareFootage(e.target.value)}
                  className="w-full input-field pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Beds</label>
              <input
                type="text"
                placeholder="2"
                value={beds}
                onChange={e => setBeds(e.target.value)}
                className="w-full input-field"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Baths</label>
              <input
                type="text"
                placeholder="1"
                value={baths}
                onChange={e => setBaths(e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map(option => (
              <button
                key={option}
                onClick={() => toggleAmenity(option)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                  amenities.includes(option)
                    ? 'bg-coral border-coral text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Target Renter</label>
          <div className="grid grid-cols-3 gap-4">
            {targetOptions.map(option => (
              <button
                key={option}
                onClick={() => setTargetRenter(option)}
                className={`p-4 card-surface text-center transition-all border ${
                  targetRenter === option ? 'border-coral ring-1 ring-coral' : 'border-white/10'
                }`}
              >
                <div className="text-xs font-medium">{option}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Leasing Special (Optional)</label>
          <input
            type="text"
            placeholder="e.g. First month free on 12-month lease"
            value={leasingSpecial}
            onChange={e => setLeasingSpecial(e.target.value)}
            className="w-full input-field"
          />
        </div>
      </div>

      {/* Right Column: Upload */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-medium">Property Photos</h2>
          <div
            className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-coral" />
            </div>
            <div className="text-center">
              <p className="font-medium">Drag and drop photos</p>
              <p className="text-xs text-white/40 mt-1">PNG, JPG up to 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {photos.map((photo, idx) => (
            <div key={photo.id} className="space-y-2 group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden relative border border-white/10">
                <img src={photo.previewUrl} alt={photo.label} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] uppercase tracking-tighter font-bold">
                  0{idx + 1}
                </div>
              </div>
              <p className="w-full text-[11px] text-white/60 text-center truncate">{photo.label}</p>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.02] transition-colors"
            >
              <Plus className="w-5 h-5 text-white/20" />
              <span className="text-[10px] text-white/20 uppercase font-bold">Add Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Full Width Button */}
      <div className="lg:col-span-2 pt-8">
        <button
          onClick={handleSubmit}
          disabled={!title || !price || !neighborhood}
          className="w-full btn-coral py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-coral/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate Promos <ChevronRight className="w-5 h-5" />
        </button>
        {(!title || !price || !neighborhood) && (
          <p className="text-center text-xs text-white/30 mt-3">
            Title, price, and neighborhood are required.
          </p>
        )}
      </div>
    </div>
  );
};

const STAGE_LABELS: Record<string, string> = {
  pending: 'Queuing your request',
  Analyst: 'Analyzing your listing',
  'Hook Writer': 'Writing opening hooks',
  Director: 'Building your storyboard',
  Critic: 'Scoring the result',
  Voiceover: 'Generating voiceover',
  Rendering: 'Rendering your video',
};

const LoadingState = ({
  jobId,
  onComplete,
  onError,
}: {
  jobId: string;
  onComplete: (result: GenerationResult) => void;
  onError: (msg: string) => void;
}) => {
  const stages = [
    { key: 'Analyst', label: 'Listing Agent', sub: 'Analyzing your listing' },
    { key: 'Hook Writer', label: 'Hook Agent', sub: 'Writing opening hooks' },
    { key: 'Director', label: 'Storyboard Agent', sub: 'Mapping photos to scenes' },
    { key: 'Critic', label: 'Critic Agent', sub: 'Scoring the result' },
    { key: 'Voiceover', label: 'Voice Service', sub: 'Generating narration' },
    { key: 'Rendering', label: 'Render Engine', sub: 'Assembling your video' },
  ];

  const [currentStage, setCurrentStage] = useState<string>('pending');

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const res = await fetch(`${API_BASE}/api/status/${jobId}`);
          const data = await res.json();

          if (cancelled) return;
          setCurrentStage(data.stage || data.status);

          if (data.status === 'done') {
            onComplete(data.result);
            return;
          }
          if (data.status === 'error') {
            onError(data.error || 'Unknown error');
            return;
          }
        } catch {
          // network blip — keep polling
        }
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [jobId, onComplete, onError]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8">
      <div className="max-w-md w-full card-surface p-10 space-y-8 text-center">
        <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-coral animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-medium">Crafting your promos</h2>
          <p className="text-sm text-white/40">
            {STAGE_LABELS[currentStage] ?? 'Processing…'}
          </p>
        </div>
        <div className="space-y-4 text-left pt-4">
          {stages.map((stage, i) => {
            const stageIdx = stages.findIndex(s => s.key === currentStage);
            const myIdx = i;
            const status =
              stageIdx === -1
                ? 'pending'
                : myIdx < stageIdx
                ? 'done'
                : myIdx === stageIdx
                ? 'loading'
                : 'pending';

            return (
              <div key={stage.key} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      status === 'done'
                        ? 'bg-green-500/20 text-green-500'
                        : status === 'loading'
                        ? 'bg-coral/20 text-coral'
                        : 'bg-white/5 text-white/20'
                    }`}
                  >
                    {status === 'done' ? (
                      <Check className="w-4 h-4" />
                    ) : status === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${status === 'pending' ? 'text-white/20' : 'text-white'}`}>
                      {stage.label}
                    </p>
                    <p className="text-[11px] text-white/40">{stage.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ResultsView = ({
  result,
  photos,
  onReset,
}: {
  result: GenerationResult;
  photos: PhotoFile[];
  onReset: () => void;
}) => {
  const scores = [
    { label: 'Confidence', value: result.confidence_score },
    { label: 'Selling Points', value: result.market_positioning.key_selling_points.length * 20 },
    { label: 'Hooks', value: result.hooks.length * 33 },
  ];

  const getPhotoSrc = (index: number) => {
    if (photos[index]) return photos[index].previewUrl;
    return `https://picsum.photos/seed/promo${index}/1080/1920`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-8 pb-20 space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-medium">Your Promos are Ready</h2>
          <p className="text-sm text-white/40">
            Audience: <span className="text-white/70">{result.market_positioning.target_audience}</span>
            {' · '}Angle: <span className="text-white/70">{result.market_positioning.video_angle}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="card-surface px-6 py-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold text-coral">{result.confidence_score}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Confidence</div>
          </div>
          <div className="card-surface px-6 py-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold text-coral">{result.hooks.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Hooks</div>
          </div>
          <div className="card-surface px-6 py-3 text-center min-w-[120px]">
            <div className="text-2xl font-bold text-coral">{result.scene_sequence.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Scenes</div>
          </div>
        </div>
      </div>

      {/* Video cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {result.scripts.map((script, idx) => (
          <div key={idx} className="space-y-6">
            <div className="text-[11px] uppercase tracking-widest text-white/40 font-bold text-center">
              {result.hooks[idx] ?? `Variant ${idx + 1}`}
            </div>
            <div className="aspect-[9/16] card-surface overflow-hidden relative group cursor-pointer border-white/10 hover:border-coral/50 transition-colors">
              <img
                src={getPhotoSrc(idx)}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-8 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center self-end">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="space-y-4">
                  <div className="bg-coral px-3 py-1 rounded text-[10px] font-bold uppercase w-fit tracking-wider">
                    Hook
                  </div>
                  <h3 className="text-xl font-medium leading-tight">{script.hook}</h3>
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{script.body_copy}</p>
                  <p className="text-xs text-coral font-semibold">{script.cta}</p>
                  {result.scene_sequence.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {result.scene_sequence.slice(0, 3).map((scene, si) => (
                        <div key={si} className="w-12 h-16 rounded bg-white/10 border border-white/20 overflow-hidden">
                          <img
                            src={getPhotoSrc(scene.photo_index)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {result.video_url && idx === result.selected_script_index ? (
                <a
                  href={`${API_BASE}${result.video_url}`}
                  download
                  className="btn-coral w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Video
                </a>
              ) : (
                <button className="btn-coral w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                  <Download className="w-4 h-4" /> Download Assets
                </button>
              )}
              <button
                onClick={onReset}
                className="btn-ghost w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Critic feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-surface p-6 space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-green-400 font-bold">Strengths</h4>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-white/70 flex gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-surface p-6 space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-yellow-400 font-bold">Weaknesses</h4>
          <ul className="space-y-2">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-white/70">{w}</li>
            ))}
          </ul>
        </div>
        <div className="card-surface p-6 space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-coral font-bold">Improvement Notes</h4>
          <ul className="space-y-2">
            {result.improvement_notes.map((n, i) => (
              <li key={i} className="text-sm text-white/70">{n}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center pt-8">
        <button
          onClick={onReset}
          className="text-white/40 hover:text-coral transition-colors text-sm font-medium underline underline-offset-8"
        >
          Generate Another
        </button>
      </div>
    </motion.div>
  );
};

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedPhotos, setSubmittedPhotos] = useState<PhotoFile[]>([]);

  const handleGenerate = async (data: FormData) => {
    setError(null);
    setScreen('loading');

    const form = new globalThis.FormData();
    form.append('title', data.title);
    form.append('price', data.price);
    form.append('neighborhood', data.neighborhood);
    form.append('square_footage', data.square_footage);
    form.append('beds', data.beds);
    form.append('baths', data.baths);
    form.append('amenities', JSON.stringify(data.amenities));
    form.append('target_renter', data.target_renter);
    form.append('leasing_special', data.leasing_special);
    data.photos.forEach(p => form.append('photos', p.file));

    setSubmittedPhotos(data.photos);

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Generation failed');
      setJobId(json.job_id);
    } catch (err: any) {
      setError(err.message);
      setScreen('input');
    }
  };

  const handleComplete = (res: GenerationResult) => {
    setResult(res);
    setScreen('results');
  };

  const handleError = (msg: string) => {
    setError(msg);
    setScreen('input');
  };

  const handleReset = () => {
    setScreen('input');
    setJobId(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-coral/30 selection:text-coral">
      <Navbar onReset={handleReset} />

      {error && (
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        </div>
      )}

      <main className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {screen === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <InputForm onGenerate={handleGenerate} />
            </motion.div>
          )}

          {screen === 'loading' && jobId && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState
                jobId={jobId}
                onComplete={handleComplete}
                onError={handleError}
              />
            </motion.div>
          )}

          {screen === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ResultsView result={result} photos={submittedPhotos} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-coral/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-coral/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
