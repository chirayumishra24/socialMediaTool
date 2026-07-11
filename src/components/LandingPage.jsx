"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  ArrowRight, Zap, BarChart3, PenTool, Globe, Sparkles, 
  MessageSquare, ShieldCheck, UserCheck, Radio, Calendar, 
  Headphones, Star, ChevronDown, Check, HelpCircle, Gift
} from "lucide-react";

export default function LandingPage({ onSignInClick }) {
  const canvasRef = useRef(null);
  const [activeShowcase, setActiveShowcase] = useState("social");
  const [openFaq, setOpenFaq] = useState(null);
  
  // Fun features state
  const [wordIndex, setWordIndex] = useState(0);
  const [liveCreators, setLiveCreators] = useState(1482);
  const [showBlastEffect, setShowBlastEffect] = useState(false);
  const confettiArrayRef = useRef([]);

  const rotatingWords = ["Social Copywriter", "LinkedIn Growth", "AI Podcast Studio", "Campaign Analytics"];

  useEffect(() => {
    // 1. Word rotation interval
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);

    // 2. Simulated live creators ticker
    const creatorInterval = setInterval(() => {
      setLiveCreators((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(creatorInterval);
    };
  }, []);

  // Play a soft synth chime using Web Audio API (zero dependencies)
  const playSoundEffect = (freq = 587.33) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime); // Chime tone
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("AudioContext not supported or blocked by user gesture:", e);
    }
  };

  // Confetti Blast function
  const triggerConfettiBlast = () => {
    playSoundEffect(880); // Play high chime sound
    setShowBlastEffect(true);
    setTimeout(() => setShowBlastEffect(false), 2000);

    // Spawn 120 colorful confetti particles in the active canvas
    const colors = ["#ff007f", "#00f0ff", "#ffde00", "#7000ff", "#00ff66"];
    for (let i = 0; i < 120; i++) {
      confettiArrayRef.current.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2.5,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        gravity: 0.35,
        opacity: 1
      });
    }
  };

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

      // 1. Draw connecting lines
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

      // 2. Draw default background particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // 3. Draw and update active Confetti Blast
      const confettiArray = confettiArrayRef.current;
      for (let i = confettiArray.length - 1; i >= 0; i--) {
        const c = confettiArray[i];
        c.vy += c.gravity;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        c.opacity -= 0.012;

        if (c.opacity <= 0) {
          confettiArray.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.opacity;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
      }

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

  const faqs = [
    {
      q: "How does the Single Sign-On (SSO) work?",
      a: "Once you log into Skilizee.io using your administrator-approved email and password, a secure authorization token is stored in your browser. When you switch to the LinkedIn or Podcast tools, the system automatically authenticates you without requiring password inputs again."
    },
    {
      q: "Can I manage different permissions for my team members?",
      a: "Yes! As an administrator, you have access to the Admin Panel. From there, you can add new members, update passwords, and explicitly assign which tools (LinkedIn, Social Media, or Podcast) each member can access."
    },
    {
      q: "How does the LinkedIn profile auditing feature work?",
      a: "Our profile auditor evaluates your current LinkedIn headline, summary, and experience sections using Gemini AI. It suggests immediate changes to maximize professional keyword indexing. All audits are saved in a snapshot history log so you can compare progress."
    },
    {
      q: "Is it safe to run multiple micro-frontends on different hosting accounts?",
      a: "Absolutely. Both projects share the same secure Firestore database backend. By adding your database credentials to the Vercel project settings, user accounts and role changes immediately sync across domains."
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
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        {/* Dynamic Ticker Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-md shadow-indigo-500/5 mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-slate-600">
            <strong className="text-indigo-600 font-extrabold">{liveCreators.toLocaleString()}</strong> creators live scripting updates
          </span>
          <span className="text-slate-350">|</span>
          <button 
            onClick={triggerConfettiBlast}
            className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer outline-none focus:ring-0 active:scale-95 transition-transform"
          >
            <Gift className="w-3.5 h-3.5 text-indigo-500" />
            <span>Surprise Me</span>
          </button>
        </div>

        {/* Dynamic Rotator Title */}
        <h2 className="text-4xl md:text-7.5xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-tight md:leading-[1.05] mb-6">
          Connect Your Brand. <br />
          Scale Your{" "}
          <span className="relative inline-block overflow-hidden h-[1.1em] align-top text-left w-[360px] md:w-[650px] transition-all">
            {rotatingWords.map((word, idx) => (
              <span
                key={idx}
                className={`absolute left-0 top-0 w-full transition-all duration-700 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent transform ${
                  wordIndex === idx 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-8 opacity-0 pointer-events-none"
                }`}
              >
                {word}
              </span>
            ))}
          </span>
        </h2>

        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
          Access your premium AI tools under a single sign-on experience. Automate LinkedIn outreach, draft social updates, and record studio-grade podcasts from a unified console.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={() => {
              playSoundEffect(523.25); // Launch sound
              onSignInClick();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-[#0F2942] hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2.5 group cursor-pointer active:scale-98"
          >
            Launch Executive Suite
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#tools-section"
            className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold border border-slate-200/50 hover:border-slate-350 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            Explore Tools
          </a>
        </div>

        {/* Social Proof Logo Grid */}
        <div className="max-w-5xl mx-auto border-t border-slate-200/50 pt-10 pb-16">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
            TRUSTED BY PROFESSIONAL CREATORS & MANAGERS AT
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="text-sm font-black text-slate-650 tracking-tight">LINKEDIN</span>
            <span className="text-sm font-black text-slate-650 tracking-tight">SPOTIFY</span>
            <span className="text-sm font-black text-slate-650 tracking-tight">VERCEL</span>
            <span className="text-sm font-black text-slate-650 tracking-tight">DRIBBBLE</span>
            <span className="text-sm font-black text-slate-650 tracking-tight">PRODUCT HUNT</span>
          </div>
        </div>

        {/* Tab Selection Section */}
        <div id="tools-section" className="scroll-mt-24 pt-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
              One Workspace. Three Specialized Engines.
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-bold leading-relaxed">
              Toggle the tabs below to preview the features, layout structure, and action points of each Skilizee module.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 max-w-3xl mx-auto p-2 bg-slate-100/50 border border-slate-200/30 rounded-3xl backdrop-blur-xl">
            {tools.map(tool => {
              const Icon = tool.icon;
              const isSelected = activeShowcase === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    playSoundEffect(isSelected ? 392 : 440);
                    setActiveShowcase(tool.id);
                  }}
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

        {/* Testimonials Section */}
        <section className="py-16 max-w-6xl mx-auto text-left">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
              Loved by Top Content Creators
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-bold leading-relaxed">
              Read how writers, podcast producers, and campaign coordinators use Skilizee to streamline content workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2rem] bg-white border border-slate-200/50 shadow-lg shadow-slate-150/30 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  "The profile auditor is brilliant. Evaluate your headline once, click apply improvements, and you're set. My LinkedIn organic reach grew by over 300% in a month."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black text-[#0077b5]">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">John Doe</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Growth Advisor, LinkedIn Authority</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-slate-200/50 shadow-lg shadow-slate-150/30 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  "Skilizee completely automated my content workflow. I run trend research, compile post drafts inside the studio, cast podcast voice actors, and schedule it all in under an hour."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xs font-black text-purple-650">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Alice Smith</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Podcast Producer & Campaign Lead</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 max-w-4xl mx-auto text-left">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-bold leading-relaxed">
              Everything you need to know about credentials, platform security, and user roles.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between font-black text-xs text-slate-800 hover:text-slate-900 cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-50 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

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
