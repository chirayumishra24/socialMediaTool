"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  ArrowRight, Zap, BarChart3, PenTool, Globe, Sparkles, 
  MessageSquare, ShieldCheck, UserCheck, Radio, Calendar, 
  Headphones, Star, ChevronRight 
} from "lucide-react";

export default function LandingPage({ onSignInClick }) {
  const canvasRef = useRef(null);
  const [activeShowcase, setActiveShowcase] = useState("social");

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

  const ssoToken = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : "";
  
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin-tool-one.vercel.app";
  const finalLinkedinUrl = ssoToken ? `${linkedinUrl}?sso=${ssoToken}` : linkedinUrl;

  const podcastUrl = process.env.NEXT_PUBLIC_PODCAST_URL || "http://localhost:3002";
  const finalPodcastUrl = ssoToken ? `${podcastUrl}?sso=${ssoToken}` : podcastUrl;

  const tools = [
    {
      id: "social",
      title: "Social Media Tool (AI Agent)",
      badge: "Automation Hub",
      icon: MessageSquare,
      image: "/social_media_agent.png",
      headline: "Automate your research, script generation, and workflow approvals",
      desc: "An intelligent workspace designed to eliminate copywriting and analytics bottlenecks. From discovery of trending global topics to drag-and-drop editorial calendars.",
      colorClass: "from-indigo-500 to-blue-600",
      bgClass: "bg-indigo-50 border-indigo-100 text-indigo-600",
      features: [
        "Interactive AI Content Studio with real-time preview",
        "Advanced Trend Discovery matching your brand niche",
        "Drag-and-Drop Publishing Calendar",
        "Collaborative Campaign Approval Board"
      ],
      action: onSignInClick,
      actionText: "Launch Social Media Tool"
    },
    {
      id: "linkedin",
      title: "LinkedIn Growth Tool",
      badge: "Organic Reach",
      icon: UserCheck,
      image: "/linkedin_growth.png",
      headline: "Supercharge your profile authority and professional network",
      desc: "Perfect your public profile using AI audits and publish authority-building updates. Seamlessly schedule posts to maximize organic engagement on LinkedIn.",
      colorClass: "from-blue-500 to-cyan-500",
      bgClass: "bg-blue-50 border-blue-100 text-[#0077b5]",
      features: [
        "In-depth Profile Auditing with snapshot history logs",
        "High-Converting Viral Hook & post generator",
        "Analytics Dashboard tracking weekly impressions",
        "NextAuth compliant secure connection integration"
      ],
      action: () => window.location.href = finalLinkedinUrl,
      actionText: "Launch LinkedIn Growth Tool"
    },
    {
      id: "podcast",
      title: "AI Podcast Tool",
      badge: "Audio Studio",
      icon: Radio,
      image: "/podcast_creator.png",
      headline: "Produce studio-quality voice scripts and audio narrations",
      desc: "Generate scripts, cast voice profiles, and export high-fidelity audio streams in seconds. Elevate your brand storytelling with voice narration automation.",
      colorClass: "from-purple-500 to-pink-500",
      bgClass: "bg-purple-50 border-purple-100 text-purple-600",
      features: [
        "AI-Powered Podcast scriptwriting workstation",
        "Voice Casting & multi-lingual speech output options",
        "Narration Queue with audio waveform previews",
        "Single-click export to audio publishing platforms"
      ],
      action: () => window.location.href = finalPodcastUrl,
      actionText: "Launch AI Podcast Tool"
    }
  ];

  const currentTool = tools.find(t => t.id === activeShowcase);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-600/5 blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">Skilizee.io</h1>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Creator Portal</span>
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
          <Zap className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">All-In-One Creator Suite</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-tight md:leading-none mb-6">
          Connect Your Brand. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">Scale Your Organic Growth.</span>
        </h2>

        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
          Access your premium AI tools under a single sign-on experience. Automate LinkedIn outreach, draft social updates, and record studio-grade podcasts from a unified console.
        </p>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 max-w-3xl mx-auto p-2 bg-slate-100/50 border border-slate-200/30 rounded-3xl backdrop-blur-xl">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isSelected = activeShowcase === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveShowcase(tool.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isSelected 
                    ? "bg-[#0F2942] text-white shadow-xl shadow-slate-900/10" 
                    : "text-slate-650 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tool.title}
              </button>
            );
          })}
        </div>

        {/* Showcase Area */}
        {currentTool && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left bg-white/40 border border-slate-200/60 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl shadow-slate-100 max-w-6xl mx-auto mb-24 transition-all">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${currentTool.bgClass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {currentTool.badge}
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {currentTool.headline}
              </h3>

              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                {currentTool.desc}
              </p>

              {/* Feature Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentTool.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={currentTool.action}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#0F2942] hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-900/5 transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
                >
                  {currentTool.actionText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-6 relative rounded-[2rem] overflow-hidden border border-slate-200/50 bg-slate-50 flex items-center justify-center shadow-xl shadow-slate-100">
              <img 
                src={currentTool.image} 
                alt={currentTool.title} 
                className="w-full object-cover transition-transform duration-700 hover:scale-103"
              />
            </div>

          </div>
        )}

        {/* Global Security / Admin Section */}
        <div className="max-w-4xl mx-auto border-t border-slate-200/60 pt-16 text-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">
            Engineered For Seamless Operations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800">Unified Role Gate</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Roles are validated dynamically on each request to prevent unauthorized tab navigation.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 mx-auto">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800">Single Sign-On (SSO)</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Log in once on the central portal and navigate between linked apps without typing passwords again.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 mx-auto">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800">Dynamic Admin Panel</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Administrators can grant permissions, change passwords, and manage accounts instantly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/60 py-8 mt-12 bg-slate-50 text-slate-400 text-xs text-center font-semibold">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Skilizee.io. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="mailto:pa2@skillizee.io" className="hover:text-[#0077b5]">Contact Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
