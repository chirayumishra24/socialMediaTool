"use client";

import { useAuth } from "@/lib/AuthContext";
import { AlertTriangle, LogOut, ArrowRight, ShieldAlert, Sparkles, MessageSquare, Radio } from "lucide-react";

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function AccessDenied() {
  const { user, logout } = useAuth();

  const appLinks = [
    {
      id: "social_media",
      name: "Social Media Tool (AI Agent)",
      desc: "Executive Hub, news discovery & content studio",
      url: process.env.NEXT_PUBLIC_SOCIAL_MEDIA_URL || "https://social-media-tool-three.vercel.app",
      icon: MessageSquare,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      id: "linkedin",
      name: "LinkedIn Growth Tool",
      desc: "AI profile auditing & organic publishing calendar",
      url: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin-tool-one.vercel.app",
      icon: LinkedInIcon,
      color: "bg-[#0077b5]/5 text-[#0077b5] border-[#0077b5]/10"
    },
    {
      id: "podcast",
      name: "AI Podcast Tool",
      desc: "Podcast scripting, audio creation & automation",
      url: process.env.NEXT_PUBLIC_PODCAST_URL || "https://skillizee-products.web.app/",
      icon: Radio,
      color: "bg-purple-50 text-purple-600 border-purple-100"
    }
  ];

  const allowedApps = appLinks.filter(app => user?.roles?.includes(app.id) || user?.isAdmin);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[#0F2942]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-100 p-8 md:p-12 relative z-10">
        {/* Error icon and header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Denied</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md font-medium">
            Your email <strong className="text-slate-700 font-bold">{user?.email}</strong> does not have access permissions for the <strong className="text-[#0F2942] font-black">Social Media Tool</strong>.
          </p>
        </div>

        {/* List of tools they can access */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            Your Accessible Platforms ({allowedApps.length})
          </h3>
          
          {allowedApps.length > 0 ? (
            <div className="grid gap-3">
              {allowedApps.map((app) => {
                const Icon = app.icon;
                const ssoToken = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : "";
                const redirectUrl = ssoToken ? `${app.url}?sso=${ssoToken}` : app.url;

                return (
                  <a
                    key={app.id}
                    href={redirectUrl}
                    className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 hover:border-slate-200 rounded-2xl group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${app.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-none group-hover:text-slate-900">
                          {app.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 font-semibold leading-tight">
                          {app.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
              <p className="text-xs font-bold text-slate-400">
                You do not have permission for any tools. Please contact system admin.
              </p>
            </div>
          )}
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-50">
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">
              Role Management
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">
              Admin Contact: <span className="text-[#0F2942]">pa2@skillizee.io</span>
            </p>
          </div>
          
          <button
            onClick={logout}
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-100 transition-all self-stretch sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
