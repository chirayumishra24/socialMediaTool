"use client";

import { Camera, Hash, Globe, MonitorPlay, User, MessageCircle, Heart, Send, Bookmark, MoreHorizontal, Share2, Repeat2 } from "lucide-react";

export default function SocialPreview({ format, script, persona }) {
  const getPreview = () => {
    if (format.includes("instagram_reel") || format.includes("youtube_short")) {
      return <InstagramReelPreview script={script} persona={persona} />;
    }
    if (format.includes("x_thread")) {
      return <TwitterThreadPreview script={script} persona={persona} />;
    }
    if (format.includes("linkedin") || format.includes("blog")) {
      return <LinkedInPreview script={script} persona={persona} />;
    }
    return <InstagramReelPreview script={script} persona={persona} />; // Default
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-bg-elevated/20 rounded-3xl min-h-[500px]">
      <div className="w-full max-w-[340px] shadow-2xl shadow-black/20 transform hover:scale-[1.02] transition-transform duration-500">
        {getPreview()}
      </div>
      <p className="mt-8 text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Live Social Mockup
      </p>
    </div>
  );
}

function InstagramReelPreview({ script, persona }) {
  // Extract hook or first line
  const lines = script.split("\n").filter(l => l.trim().length > 0 && !l.includes("["));
  const mainCaption = lines[0] || "Director's Insight...";

  return (
    <div className="aspect-[9/16] bg-black rounded-[3rem] overflow-hidden relative border-[8px] border-bg-card shadow-inner flex flex-col">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-bg-card rounded-b-2xl z-20" />
      
      {/* Background Visual (Placeholder Gradient) */}
      <div className="absolute inset-0 grad-primary opacity-30 animate-pulse" />
      
      {/* Content Overlay */}
      <div className="mt-auto p-6 space-y-4 relative z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">Your School Director <span className="text-[10px] bg-primary px-1.5 py-0.5 rounded">Follow</span></p>
            <p className="text-[10px] text-white/60">Original Audio • Trending</p>
          </div>
        </div>
        
        <p className="text-sm text-white line-clamp-3 font-medium leading-relaxed">
          {mainCaption}
        </p>

        <div className="flex items-center gap-2 text-[10px] font-bold text-white/80 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          <MonitorPlay className="w-3.5 h-3.5 text-red-500" /> Educational Insights
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-3 bottom-24 flex flex-col gap-6 items-center text-white z-10">
        <Action icon={Heart} label="14.2k" />
        <Action icon={MessageCircle} label="842" />
        <Action icon={Send} label="" />
        <Action icon={MoreHorizontal} label="" />
      </div>
    </div>
  );
}

function TwitterThreadPreview({ script, persona }) {
  const tweets = script.split("\n\n").filter(t => t.trim().length > 0 && !t.includes("[")).slice(0, 3);

  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden min-h-[500px]">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-bold text-txt">School Director</p>
            <p className="text-[11px] text-txt-muted">@Director_Edu</p>
          </div>
        </div>
        <Hash className="w-5 h-5 text-slate-500" />
      </div>

      <div className="divide-y divide-border/50">
        {tweets.map((tweet, i) => (
          <div key={i} className="p-5 space-y-3">
            <p className="text-sm text-txt-secondary leading-relaxed whitespace-pre-wrap">
              {tweet.replace(/^\d+\.?\s*/, "")}
            </p>
            <div className="flex items-center justify-between text-txt-muted pt-2 max-w-[200px]">
              <MessageCircle className="w-4 h-4" />
              <Repeat2 className="w-4 h-4" />
              <Heart className="w-4 h-4" />
              <Share2 className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedInPreview({ script, persona }) {
  const content = script.split("\n\n").filter(c => c.trim().length > 0 && !c.includes("[")).slice(0, 1);

  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden min-h-[500px]">
      <div className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-primary shadow-sm"><User className="w-7 h-7" /></div>
        <div className="flex-1">
          <p className="text-sm font-bold text-txt">Your School Director</p>
          <p className="text-[11px] text-txt-muted">Visionary Leader in K-12 Education</p>
          <p className="text-[10px] text-txt-muted flex items-center gap-1.5 mt-0.5">2h • <Globe className="w-2.5 h-2.5" /></p>
        </div>
        <button className="text-primary font-bold text-xs">+ Follow</button>
      </div>

      <div className="px-5 py-2">
        <p className="text-[13px] text-txt-secondary leading-loose">
          {content[0]}
        </p>
        <button className="text-[11px] font-bold text-txt-muted mt-2">...see more</button>
      </div>

      {/* LinkedIn Media Area */}
      <div className="mt-4 aspect-video grad-primary opacity-10 border-y border-border flex items-center justify-center">
        <Globe className="w-12 h-12 text-primary opacity-20" />
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between text-txt-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"><Heart className="w-4 h-4" /> <span className="text-[10px] font-bold">Like</span></div>
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"><MessageCircle className="w-4 h-4" /> <span className="text-[10px] font-bold">Comment</span></div>
        </div>
        <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"><Share2 className="w-4 h-4" /> <span className="text-[10px] font-bold">Repost</span></div>
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
