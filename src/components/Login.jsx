"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { BrainCircuit, Lock, Mail, AlertTriangle, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-[#0F2942]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-slate-300/30 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-100 p-8 md:p-10 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-[#0F2942] flex items-center justify-center text-white shadow-xl shadow-slate-200 mb-4 transition-transform hover:scale-105">
            <BrainCircuit className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#0F2942] tracking-tight">
            Skilizee<span className="text-slate-400">.ai</span>
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black mt-1">
            Director Suite Sign-In
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-medium animate-shake">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.io"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 focus:border-[#0F2942]/30 focus:bg-white rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 focus:border-[#0F2942]/30 focus:bg-white rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#0F2942] hover:bg-[#163a5d] text-white rounded-2xl text-sm font-black tracking-wide shadow-xl shadow-slate-200 hover:shadow-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <p className="text-[11px] text-slate-400 font-bold">
            Authorized Personnel Only
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            Need access? Contact school system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
