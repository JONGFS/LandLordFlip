import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Image, BarChart3, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Scripts',
    description: 'Generate high-converting video scripts tailored to your listing in seconds.',
  },
  {
    icon: Image,
    title: 'Smart Photo Mapping',
    description: 'Our storyboard agent matches your photos to the perfect scenes automatically.',
  },
  {
    icon: Zap,
    title: 'Hook Generation',
    description: 'Attention-grabbing opening lines designed to stop the scroll and drive inquiries.',
  },
  {
    icon: BarChart3,
    title: 'Performance Scoring',
    description: 'Every promo is scored on hook strength, leasing appeal, and urgency.',
  },
];

export default function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between py-6 px-8 max-w-7xl mx-auto w-full">
        <span className="logo text-2xl font-bold tracking-tight">
          LandlordFlip<span className="text-coral">.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogin} className="btn-ghost text-sm">Sign In</button>
          <button onClick={onSignUp} className="btn-coral text-sm">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col items-center justify-center text-center px-8 pt-12 pb-20 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/10 border border-coral/20 text-coral text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Rental Marketing
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Turn any listing into<br />
          <span className="text-coral">scroll-stopping</span> content
        </h1>

        <p className="text-white/50 text-lg mt-6 max-w-2xl leading-relaxed">
          Upload your property photos, enter listing details, and let our AI agents generate
          high-converting promo videos, hooks, and scripts — ready to post in minutes.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={onSignUp}
            className="btn-coral py-3.5 px-8 text-sm flex items-center gap-2 shadow-xl shadow-coral/10"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogin}
            className="btn-ghost py-3.5 px-8 text-sm"
          >
            Sign In
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-12 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-coral">3x</div>
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mt-1">Faster Leasing</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <div className="text-3xl font-bold text-coral">9.2</div>
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mt-1">Avg Hook Score</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <div className="text-3xl font-bold text-coral">60s</div>
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mt-1">Per Promo</div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium">Everything you need to fill vacancies</h2>
          <p className="text-white/40 text-sm mt-3">Four AI agents work together to create content that converts.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="card-surface p-6 space-y-4"
            >
              <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-coral" />
              </div>
              <h3 className="text-sm font-semibold">{feature.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-8 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-medium">How it works</h2>
          <p className="text-white/40 text-sm mt-3">Three steps from listing to launch.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Add your listing', desc: 'Enter property details, upload photos, and select your target renter.' },
            { step: '02', title: 'AI generates promos', desc: 'Our agents craft hooks, scripts, and storyboards in under a minute.' },
            { step: '03', title: 'Post and lease', desc: 'Download your assets and share across social platforms instantly.' },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="text-center space-y-3"
            >
              <div className="text-4xl font-bold text-coral/30">{item.step}</div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-8 pb-24 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-surface p-12 space-y-6"
        >
          <h2 className="text-3xl font-medium">Ready to fill your vacancies faster?</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Join landlords and property managers who are using AI to lease units before the competition.
          </p>
          <button
            onClick={onSignUp}
            className="btn-coral py-3.5 px-10 text-sm inline-flex items-center gap-2 shadow-xl shadow-coral/10"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white/30">
          <span className="logo text-sm font-bold text-white/50">
            LandlordFlip<span className="text-coral">.</span>
          </span>
          <span>&copy; 2026 LandlordFlip. All rights reserved.</span>
        </div>
      </footer>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-coral/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-coral/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
