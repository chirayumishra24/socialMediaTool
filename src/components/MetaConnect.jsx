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
  ExternalLink,
} from "lucide-react";

export default function MetaConnect() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/meta/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({ connected: false, configured: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Check for OAuth callback result in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authResult = params.get("meta_auth");
      if (authResult === "success") {
        fetchStatus();
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/meta/auth");
      const data = await res.json();
      if (data.loginUrl) {
        window.location.href = data.loginUrl;
      }
    } catch {
      alert("Failed to initiate Meta connection. Check console for details.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Meta account? This will remove all stored tokens.")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/meta/auth", { method: "DELETE" });
      await fetchStatus();
    } catch {
      alert("Failed to disconnect.");
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
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>

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
