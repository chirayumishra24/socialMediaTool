"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Link2,
  Unlink,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Instagram,
  Facebook,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function MetaConnect({ onStatusChange }) {
  const toast = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/meta/status");
      const data = await res.json();
      setStatus(data);
      onStatusChange?.(data);
    } catch (err) {
      console.error("Failed to fetch Meta status:", err);
      setStatus({ connected: false, configured: false });
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    fetchStatus();

    // Check for OAuth callback result in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authResult = params.get("meta_auth");
      if (authResult === "success") {
        fetchStatus();
        toast.success("Meta Connected", "Instagram and Facebook channels linked successfully.");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [fetchStatus, toast]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/meta/auth");
      const data = await res.json();
      if (data.loginUrl) {
        window.location.href = data.loginUrl;
      }
    } catch {
      toast.error("Meta Connection Error", "Failed to initiate Meta OAuth. Check API credentials.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/meta/auth", { method: "DELETE" });
      await fetchStatus();
      setShowDisconnectConfirm(false);
      toast.success("Disconnected", "Meta credentials removed successfully.");
    } catch {
      toast.error("Disconnect Failed", "Could not remove Meta account. Try again.");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          <span className="text-sm text-slate-500 font-semibold">Checking Meta connection...</span>
        </div>
      </div>
    );
  }

  const tokenHealthColors = {
    healthy: "text-emerald-600 bg-emerald-50",
    expiring_soon: "text-amber-600 bg-amber-50",
    expired: "text-rose-600 bg-rose-50",
  };

  const tokenHealthIcons = {
    healthy: CheckCircle2,
    expiring_soon: Clock,
    expired: AlertTriangle,
  };

  const tokenHealthLabels = {
    healthy: "Connected",
    expiring_soon: "Expiring Soon",
    expired: "Token Expired",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">Meta Platform Connection</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Instagram &amp; Facebook</p>
          </div>
        </div>

        {status?.connected && (
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${tokenHealthColors[status.tokenHealth] || tokenHealthColors.healthy}`}>
            {(() => {
              const Icon = tokenHealthIcons[status.tokenHealth] || CheckCircle2;
              return <Icon className="w-3.5 h-3.5" />;
            })()}
            {tokenHealthLabels[status.tokenHealth] || "Connected"}
          </div>
        )}
      </div>

      {/* Not Connected State */}
      {!status?.connected && (
        <div className="space-y-4">
          {!status?.configured && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Setup Required</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Add <code className="bg-amber-100 px-1 rounded">META_APP_ID</code> and{" "}
                    <code className="bg-amber-100 px-1 rounded">META_APP_SECRET</code> to your{" "}
                    <code className="bg-amber-100 px-1 rounded">.env.local</code> file.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={connecting || !status?.appConfigured}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {connecting ? "Connecting..." : "Connect Meta Account"}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Connects your Instagram Business account and Facebook Page for publishing, analytics, and scheduling.
          </p>
        </div>
      )}

      {/* Connected State */}
      {status?.connected && (
        <div className="space-y-4">
          {/* Connected Accounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Instagram */}
            {status.instagram && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center gap-3">
                  {status.instagram.profilePic ? (
                    <img
                      src={status.instagram.profilePic}
                      alt={status.instagram.username}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      IG
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-800">@{status.instagram.username}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {(status.instagram.followers || 0).toLocaleString()} followers
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Facebook */}
            {status.facebook && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    FB
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{status.facebook.pageName}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">Facebook Page</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Token Health Details */}
          {status.tokenHealth === "expiring_soon" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Token expires in <strong>{status.daysUntilExpiry} days</strong>. It will auto-refresh, but if it fails,
                you&apos;ll need to reconnect.
              </p>
            </div>
          )}

          {status.tokenHealth === "expired" && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-700">
                Token has expired. Click <strong>Reconnect</strong> to refresh your connection.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {status.tokenHealth === "expired" ? (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${connecting ? "animate-spin" : ""}`} />
                Reconnect
              </button>
            ) : (
              <button
                onClick={fetchStatus}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Status
              </button>
            )}

            <button
              onClick={() => setShowDisconnectConfirm(true)}
              disabled={disconnecting}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>

          {/* Themed Disconnect Confirmation Modal */}
          {showDisconnectConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowDisconnectConfirm(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Disconnect Meta Account</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Are you sure you want to unlink?</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  This will remove your stored Instagram and Facebook access tokens. Scheduled broadcast jobs will be paused until re-linked.
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    disabled={disconnecting}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md shadow-rose-200 dark:shadow-none cursor-pointer disabled:opacity-50"
                  >
                    {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                    <span>Confirm Disconnect</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connected At */}
          {status.connectedAt && (
            <p className="text-[10px] text-slate-400 text-center">
              Connected {new Date(status.connectedAt).toLocaleDateString()} •{" "}
              Last refreshed {status.lastRefreshedAt
                ? new Date(status.lastRefreshedAt).toLocaleDateString()
                : "never"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
