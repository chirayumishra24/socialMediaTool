"use client";

import React, { useEffect, useState } from "react";
import { 
  ArrowRight, Zap, BarChart3, PenTool, Globe, Sparkles, 
  MessageSquare, ShieldCheck, UserCheck, Radio, Calendar, 
  Headphones, Star, ChevronDown, Check, HelpCircle, Search, Mail
} from "lucide-react";

export default function LandingPage({ onSignInClick }) {
  const [activeTab, setActiveTab] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  
  // Prompt builder selector states
  const [platform, setPlatform] = useState("LinkedIn");
  const [goal, setGoal] = useState("Build Authority");
  const [tone, setTone] = useState("Professional");
  const [format, setFormat] = useState("Headline & Hook");
  const [audience, setAudience] = useState("B2B Professionals");
  const [campaign, setCampaign] = useState("Free Trial");

  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  const handleGeneratePrompt = () => {
    setGenerating(true);
    setGeneratedText("");
    setTimeout(() => {
      setGenerating(false);
      setGeneratedText(
        `✨ AI Generated Concept for ${platform}: A high-converting ${format} written in a ${tone} tone targeting ${audience} to achieve "${goal}". Ready for production.`
      );
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-x-hidden font-sans text-slate-800 selection:bg-indigo-200">
      
      {/* Background Decorative Circles & Blurred Shapes */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-100/40 via-purple-100/20 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-20 left-[-100px] w-96 h-96 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-[-100px] w-96 h-96 rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />

      {/* GLOBAL NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[1rem] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[0.9rem] flex items-center justify-center">
              <span className="bg-gradient-to-tr from-purple-500 to-indigo-600 bg-clip-text text-transparent text-sm font-black">S</span>
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#0B192C] tracking-tight leading-none">Skilizee<span className="text-slate-400">.ai</span></h1>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-1">Director Suite</p>
          </div>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-black text-slate-500 uppercase tracking-wider">
          <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#showcase" className="hover:text-indigo-600 transition-colors">Showcase</a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>

        {/* Login Button */}
        <button
          onClick={onSignInClick}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          Sign In
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Headline & Filter Widget */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0077b5]">
              Get a 100% Guarantee on Organic Growth
            </p>
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-[#0B192C] tracking-tight leading-[1.05]">
              Free & Optimized <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                AI Content Generation
              </span>
            </h2>
          </div>

          {/* Prompt builder glass pane search widget */}
          <div className="relative rounded-[2.2rem] bg-white/40 backdrop-blur-xl border border-white/60 p-6 md:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              
              <FilterSelect label="Platform" val={platform} setVal={setPlatform} options={["LinkedIn", "Instagram", "TikTok", "YouTube"]} />
              <FilterSelect label="Content Goal" val={goal} setVal={setGoal} options={["Build Authority", "Generate Leads", "Promote Launch", "Viral Reach"]} />
              <FilterSelect label="Tone of Voice" val={tone} setVal={setTone} options={["Professional", "Casual/Fun", "Inspiring", "Bold/Direct"]} />
              <FilterSelect label="Post Format" val={format} setVal={setFormat} options={["Headline & Hook", "Long-form Story", "Video Script", "Short Explainer"]} />
              <FilterSelect label="Target Audience" val={audience} setVal={setAudience} options={["B2B Professionals", "Parents & Families", "Tech Enthusiasts", "Local Community"]} />
              <FilterSelect label="Campaign Type" val={campaign} setVal={setCampaign} options={["Free Trial", "Enterprise Campaign", "Seasonal Promo", "Personal Growth"]} />

            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-white/40 pt-5">
              <div className="flex-1 min-w-0 text-left">
                {generating ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                    <span className="animate-spin">🌀</span>
                    <span>AI Engine formulating concept...</span>
                  </div>
                ) : generatedText ? (
                  <p className="text-xs font-bold text-[#0B192C] bg-white/60 p-2.5 rounded-xl border border-white/80 leading-relaxed animate-fade-in">
                    {generatedText}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Adjust the filters above to test the content optimization engine. Click the search trigger on the right to formulate.
                  </p>
                )}
              </div>

              {/* Large circular search action button */}
              <button
                onClick={handleGeneratePrompt}
                disabled={generating}
                className="w-14 h-14 rounded-full bg-[#0B192C] text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg hover:scale-105 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Professional Graphic illustration in background */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-[320px] md:w-[450px] h-[320px] md:h-[450px] rounded-[2.5rem] overflow-hidden border border-white/60 bg-white/30 backdrop-blur-md shadow-2xl p-4">
            <img
              src="/landing_hero_professional.png"
              alt="Skilizee AI Creative Command Center"
              className="w-full h-full object-cover rounded-3xl z-10"
            />

            {/* Floating inbox alert badge */}
            <div className="absolute top-[10%] right-[10%] z-20 bg-white border border-white/60 shadow-lg p-3 rounded-2xl flex items-center justify-center">
              <div className="relative">
                <Mail className="w-6 h-6 text-orange-500" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  2
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 2: ABOUT & STATISTICS */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left stats & details */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">About Skilizee Suite</p>
              <h3 className="text-3xl font-black text-[#0B192C] mt-2">About Skilizee & Reach Metrics</h3>
            </div>

            <div className="flex gap-12">
              <div>
                <p className="text-4xl font-black text-[#0B192C]">1210+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Campaigns Staged</p>
              </div>
              <div>
                <p className="text-4xl font-black text-[#0B192C]">143+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active Orgs</p>
              </div>
            </div>

            <p className="text-slate-500 font-semibold leading-relaxed max-w-xl text-sm">
              Skilizee Director Suite is established to bridge the gap between creative signals and enterprise publishing. We help organizations coordinate campaigns, research hooks, and publish content seamlessly across social graphs.
            </p>

            {/* Map visual simulation */}
            <div className="pt-6">
              <svg className="w-full max-w-[500px] h-32 opacity-70" viewBox="0 0 100 40">
                {/* SVG simulated world map outline */}
                <path d="M10,15 Q15,10 20,18 T30,12 T45,22 T60,10 T80,18 T95,15" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="20" cy="18" r="2.5" fill="#f59e0b" />
                <circle cx="45" cy="22" r="3.5" fill="#ef4444" />
                <circle cx="80" cy="18" r="2.5" fill="#10b981" />
                <path d="M20,18 L45,22 L80,18" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </svg>
            </div>
          </div>

          {/* Right sidebar info blocks */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <div className="bg-white/80 border border-slate-100 p-5 rounded-2xl shadow-sm">
              <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">Direct API Delivery</p>
              <p className="text-sm font-bold text-slate-700 mt-2 leading-relaxed">
                Direct publishing to social graphs without manual browser tokens.
              </p>
            </div>

            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-md space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                CTR BOOST 10%
              </p>
              <p className="text-lg font-black leading-tight">
                Submit campaign requests 6 months in advance for 10% higher CTR.
              </p>
              <button
                onClick={onSignInClick}
                className="w-full bg-white text-orange-600 rounded-xl py-3 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Start Campaign
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: WHY CHOOSE SKILIZEE? */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left column badges & descriptions */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Why Skilizee?</p>
              <h3 className="text-3xl font-black text-[#0B192C] mt-2">Why Choose Skilizee?</h3>
            </div>

            {/* Custom vector icon badges instead of emojis */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                <Globe className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                <Radio className="w-5 h-5 text-pink-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                <span className="text-2xl font-black text-[#0B192C]">&gt;50</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                  Platform APIs <br /> integrated
                </span>
              </div>
              <div className="bg-indigo-600 text-white rounded-2xl p-5">
                <p className="text-sm font-black leading-snug">
                  Integrated LLMs — one of the most powerful creator AI combinations in the world.
                </p>
              </div>
            </div>
          </div>

          {/* Right column illustration cards with custom generated images instead of emojis */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Tile 1 */}
            <div className="rounded-[2.2rem] bg-white border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                <img
                  src="/landing_rocket.png"
                  alt="Organic Growth Rocket"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 text-left space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-xs font-black text-slate-800 leading-snug">
                  Abundance of grants & formats for all creators.
                </p>
                <span className="text-[9px] font-bold text-slate-400 block">Grants optimized</span>
              </div>
            </div>

            {/* Tile 2 */}
            <div className="rounded-[2.2rem] bg-white border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                <img
                  src="/landing_lightning.png"
                  alt="Lightning Speed AI Processing"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 text-left space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-xs font-black text-slate-800 leading-snug">
                  Affordable AI processing cycles.
                </p>
                <span className="text-[9px] font-bold text-slate-400 block">Low overhead</span>
              </div>
            </div>

            {/* Tile 3 */}
            <div className="rounded-[2.2rem] bg-white border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden p-2">
                <img
                  src="/landing_brain.png"
                  alt="Synapse Brain Intelligence"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 text-left space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-xs font-black text-slate-800 leading-snug">
                  High academic rating and brand authority.
                </p>
                <span className="text-[9px] font-bold text-slate-400 block">Validated concepts</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200/50">
        <div className="text-center space-y-4 mb-12">
          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Have Questions?</p>
          <h3 className="text-3xl font-black text-[#0B192C]">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          <FaqRow
            q="How does the SSO redirect work?"
            a="When logging in, Skilizee generates an encoded SSO token and routes you across Vercel deployments. It automatically signs in and cleans the URL parameter."
            isOpen={openFaq === 0}
            onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
          />
          <FaqRow
            q="What does the Headline Tuning Panel optimize?"
            a="It checks character length limits, lists keyword tags, and performs predictive scoring (up to 100) to maximize click-through rates."
            isOpen={openFaq === 1}
            onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
          />
          <FaqRow
            q="Are campaigns secure?"
            a="Yes. Firebase security rules guard user sessions and credentials. The admin accounts are seed-protected against unauthorized modifications."
            isOpen={openFaq === 2}
            onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-[#0B192C] text-white py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <span className="text-sm font-black tracking-tight">Skilizee.ai Director Suite</span>
          </div>

          <p className="text-xs text-slate-400 font-semibold">
            © 2026 Skilizee.ai. All rights reserved. Authorized Personnel Only.
          </p>
        </div>
      </footer>

    </div>
  );
}

/* Selector select field dropdown component */
function FilterSelect({ label, val, setVal, options }) {
  return (
    <div className="text-left space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
        {label}
      </label>
      <div className="relative">
        <select
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full bg-white/80 border border-white/80 rounded-xl px-3 py-2.5 text-[11px] font-extrabold text-slate-700 outline-none appearance-none cursor-pointer pr-8 hover:bg-white"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* FAQ accordion helper */
function FaqRow({ q, a, isOpen, onClick }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all text-left">
      <button
        onClick={onClick}
        className="w-full p-5 flex items-center justify-between font-extrabold text-slate-800 hover:text-indigo-600 cursor-pointer"
      >
        <span className="text-sm leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-50">
          {a}
        </div>
      )}
    </div>
  );
}
