"use client";

import React, { useEffect, useRef } from "react";
import { ArrowRight, Zap, BarChart3, PenTool, Globe, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";

export default function LandingPage({ onSignInClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 65;
    const connectionDistance = 140;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Interactive Particle Network Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />

      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-600/5 blur-[130px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">Skilizee.ai</h1>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">AI Agent Portal</span>
          </div>
        </div>

        <button
          onClick={onSignInClick}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/50 rounded-xl text-xs font-black transition-all cursor-pointer hover:border-slate-350 active:scale-95"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">Next-Gen Executive Agent</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight md:leading-none mb-6">
          Automate Your Social <span className="bg-gradient-to-r from-indigo-500 via-violet-600 to-pink-500 bg-clip-text text-transparent">Presence with AI</span>
        </h2>

        <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto font-medium mb-10 leading-relaxed">
          The central executive hub for automated content research, AI copywriting, approvals, and analytics tracking in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={onSignInClick}
            className="w-full sm:w-auto px-8 py-4 bg-[#0F2942] hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2.5 group cursor-pointer active:scale-98"
          >
            Launch Executive Suite
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="https://linkedin-tool-one.vercel.app/"
            className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold border border-slate-200/50 hover:border-slate-350 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            Open LinkedIn Tool
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-indigo-500/20 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:bg-white text-left transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Content Studio</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Generate platform-optimized social posts, hashtags, and threads with advanced Gemini AI models built directly into the studio.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-violet-500/20 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:bg-white text-left transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-500 mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Trend Discovery</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Research real-time trending news and viral topics across industries to keep your audience engaged and stay ahead of the competition.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-pink-500/20 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 hover:bg-white text-left transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Analytics Lab</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Analyze content performance, tracking metrics, clicks, and impressions with modern visualizations and clean growth charting.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/60 py-8 mt-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <p>© 2026 Skilizee.io. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Role Management Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
