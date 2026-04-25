"use client";

import { useSettingsSnapshot } from "@/lib/storage";
import { Camera, CheckCircle2, Hash, Globe, MonitorPlay, User, MessageCircle, Heart, Send, Bookmark, MoreHorizontal, Share2, Repeat2 } from "lucide-react";

export default function SocialPreview({ format, script, persona }) {
  const settings = useSettingsSnapshot();

  const getPreview = () => {
    if (format.includes("instagram_reel") || format.includes("youtube_short")) {
      return <InstagramReelPreview script={script} persona={persona} settings={settings} />;
    }
    if (format.includes("x_thread")) {
      return <TwitterThreadPreview script={script} persona={persona} settings={settings} />;
    }
    if (format.includes("linkedin") || format.includes("blog")) {
      return <LinkedInPreview script={script} persona={persona} settings={settings} />;
    }
    return <InstagramReelPreview script={script} persona={persona} settings={settings} />;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-bg-elevated/10 rounded-[3rem] min-h-[600px] border border-border/30">
      <div className="w-full max-w-[340px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] transform hover:scale-[1.03] transition-all duration-700 ease-out">
        {getPreview()}
      </div>
      <div className="mt-10 flex flex-col items-center gap-2">
        <p className="text-[10px] font-black text-txt uppercase tracking-[0.2em] flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Real-Time Social Simulator
        </p>
        <p className="text-[9px] font-bold text-txt-muted uppercase tracking-widest">Visualizing your institutional voice</p>
      </div>
    </div>
  );
}

function InstagramReelPreview({ script, persona, settings }) {
  const safeScript = script || "";
  const schoolName = settings?.schoolName || "Your School Name";
  const lines = safeScript.split("\n").filter(l => l.trim().length > 0 && !l.includes("["));
  const mainCaption = lines[0] || "Director's Insight...";

  return (
    <div className="aspect-[9/16] bg-black rounded-[3.5rem] overflow-hidden relative border-[10px] border-bg-card shadow-2xl flex flex-col ring-1 ring-white/10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-bg-card rounded-b-2xl z-20 flex items-center justify-center">
        <div className="w-8 h-1 bg-white/10 rounded-full" />
      </div>
      
      <div className="absolute inset-0 grad-primary opacity-20 animate-pulse" />
      
      <div className="mt-auto p-8 space-y-4 relative z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md font-black text-xs uppercase">
            {schoolName.substring(0, 2)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white flex items-center gap-1.5 truncate max-w-[150px]">
              {schoolName} <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400" />
            </p>
            <p className="text-[10px] text-white/70">Original Audio • {persona.replace('_', ' ')}</p>
          </div>
          <button className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-md">Follow</button>
        </div>
        
        <p className="text-sm text-white line-clamp-3 font-medium leading-relaxed drop-shadow-sm">
          {mainCaption}
        </p>

        <div className="flex items-center gap-2 text-[10px] font-bold text-white/90 bg-white/10 w-fit px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <MonitorPlay className="w-3.5 h-3.5 text-red-500" /> Trending Topics
        </div>
      </div>

      <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center text-white z-10">
        <Action icon={Heart} label="1.2k" />
        <Action icon={MessageCircle} label="48" />
        <Action icon={Send} label="" />
        <Action icon={MoreHorizontal} label="" />
      </div>
    </div>
  );
}

function TwitterThreadPreview({ script, persona, settings }) {
  const safeScript = script || "";
  const schoolName = settings?.schoolName || "School Name";
  const handle = schoolName.toLowerCase().replace(/\s+/g, '');
  const tweets = safeScript.split("\n\n").filter(t => t.trim().length > 0 && !t.includes("[")).slice(0, 3);

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-2xl overflow-hidden min-h-[550px] flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between bg-bg-elevated/5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm uppercase">
            {schoolName.substring(0, 2)}
          </div>
          <div>
            <p className="text-sm font-black text-txt flex items-center gap-1">
              {schoolName} <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            </p>
            <p className="text-[11px] text-txt-muted">@{handle}</p>
          </div>
        </div>
        <Hash className="w-5 h-5 text-slate-400" />
      </div>

      <div className="divide-y divide-border/50 flex-1">
        {tweets.map((tweet, i) => (
          <div key={i} className="p-6 space-y-4 hover:bg-bg-elevated/10 transition-colors">
            <p className="text-[15px] text-txt-secondary leading-relaxed whitespace-pre-wrap font-medium">
              {tweet.replace(/^\d+\.?\s*/, "")}
            </p>
            <div className="flex items-center justify-between text-txt-muted pt-2 max-w-[240px]">
              <MessageCircle className="w-4.5 h-4.5 hover:text-blue-500 transition-colors" />
              <Repeat2 className="w-4.5 h-4.5 hover:text-green-500 transition-colors" />
              <Heart className="w-4.5 h-4.5 hover:text-red-500 transition-colors" />
              <Share2 className="w-4.5 h-4.5 hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedInPreview({ script, persona, settings }) {
  const safeScript = script || "";
  const schoolName = settings?.schoolName || "Your Institution";
  const vision = settings?.schoolVision?.substring(0, 40) || "Shaping the future of education";
  const content = safeScript.split("\n\n").filter(c => c.trim().length > 0 && !c.includes("[")).slice(0, 1);

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-2xl overflow-hidden min-h-[550px] flex flex-col">
      <div className="p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-primary shadow-sm font-black text-lg uppercase tracking-tighter">
          {schoolName.substring(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-txt truncate">{schoolName}</p>
          <p className="text-[10px] text-txt-muted font-bold truncate mt-0.5 uppercase tracking-wider">{vision}...</p>
          <p className="text-[9px] text-txt-muted flex items-center gap-1.5 mt-1 font-bold">2h • <Globe className="w-2.5 h-2.5" /> Public</p>
        </div>
        <button className="text-primary font-black text-xs hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">+ Follow</button>
      </div>

      <div className="px-7 py-2">
        <p className="text-[14px] text-txt-secondary leading-relaxed font-medium">
          {content[0]}
        </p>
        <button className="text-[11px] font-black text-primary mt-3 uppercase tracking-widest">...see more</button>
      </div>

      <div className="mt-6 flex-1 grad-primary opacity-[0.03] border-y border-border/50 flex flex-col items-center justify-center gap-4 py-12">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border border-border/50 flex items-center justify-center text-primary/20">
          <Globe className="w-8 h-8" />
        </div>
        <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">Institutional Update</p>
      </div>

      <div className="p-5 border-t border-border flex items-center justify-between text-txt-muted bg-bg-elevated/5">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors cursor-pointer"><Heart className="w-4.5 h-4.5" /> <span className="text-[9px] font-black uppercase tracking-tighter">Like</span></div>
          <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors cursor-pointer"><MessageCircle className="w-4.5 h-4.5" /> <span className="text-[9px] font-black uppercase tracking-tighter">Comment</span></div>
        </div>
        <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors cursor-pointer"><Share2 className="w-4.5 h-4.5" /> <span className="text-[9px] font-black uppercase tracking-tighter">Repost</span></div>
      </div>
    </div>
  );
}

function Action({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="p-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
        <Icon className="w-6 h-6" />
      </div>
      {label && <span className="text-[10px] font-bold drop-shadow-md">{label}</span>}
    </div>
  );
}
