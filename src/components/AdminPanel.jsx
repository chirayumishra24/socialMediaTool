"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Trash2, Edit2, ShieldAlert, Check, RefreshCw, X, UserPlus, Users, Lock, Mail, User } from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState({
    linkedin: false,
    social_media: false,
    podcast: false,
    admin: false
  });
  const [isAdminRole, setIsAdminRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          "x-admin-email": user?.email || ""
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setEmail("");
    setPassword("");
    setName("");
    setRoles({
      linkedin: false,
      social_media: false,
      podcast: false,
      admin: false
    });
    setIsAdminRole(false);
    setError("");
  };

  const startEdit = (editingUser) => {
    setIsEditing(true);
    setEmail(editingUser.email);
    setPassword(editingUser.password || "");
    setName(editingUser.name || "");
    setRoles({
      linkedin: editingUser.roles.includes("linkedin"),
      social_media: editingUser.roles.includes("social_media"),
      podcast: editingUser.roles.includes("podcast"),
      admin: editingUser.roles.includes("admin")
    });
    setIsAdminRole(editingUser.isAdmin || false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and Password are required.");
      return;
    }

    setError("");
    setSuccess("");

    // Build roles array based on checkboxes
    const rolesArray = Object.keys(roles).filter(k => roles[k]);
    if (isAdminRole && !rolesArray.includes("admin")) {
      rolesArray.push("admin");
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user?.email || ""
        },
        body: JSON.stringify({
          email,
          password,
          name,
          roles: rolesArray,
          isAdmin: isAdminRole
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save user");
      }

      setSuccess(isEditing ? "User updated successfully!" : "User created successfully!");
      resetForm();
      fetchUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (deleteEmail) => {
    if (deleteEmail.toLowerCase() === "pa2@skillizee.io") {
      setError("Cannot delete primary system administrator!");
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${deleteEmail}?`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(deleteEmail)}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": user?.email || ""
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete user");
      }

      setSuccess("User deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0F2942] text-white p-8 rounded-3xl shadow-xl shadow-slate-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-slate-300" />
            Role & User Management
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Create users, set passwords, and manage permissions for Skilizee products.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Notification Toast */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm font-semibold flex items-center gap-2.5 animate-slide-in">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-semibold flex items-center gap-2.5 animate-shake">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100 p-6 md:p-8 space-y-6 self-start">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-[#0F2942] tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-slate-400" />
              {isEditing ? "Edit User Access" : "Add New Member"}
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {isEditing ? "Modify permissions or credentials" : "Create login and allocate roles"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Display Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0F2942]/30 focus:bg-white rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="john@school.io"
                  disabled={isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0F2942]/30 focus:bg-white rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="User@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0F2942]/30 focus:bg-white rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Tool Allocation Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Allocate Product Access</label>
              
              <div className="space-y-2">
                {[
                  { id: "linkedin", label: "LinkedIn Growth Tool" },
                  { id: "social_media", label: "Social Media Tool (AI Agent)" },
                  { id: "podcast", label: "Podcast Suite (Coming Soon)" }
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-xl cursor-pointer select-none transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={roles[item.id]}
                      onChange={() => handleRoleChange(item.id)}
                      disabled={email.toLowerCase() === "pa2@skillizee.io"}
                      className="w-4.5 h-4.5 text-[#0F2942] bg-slate-100 border-slate-300 rounded focus:ring-[#0F2942] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  </label>
                ))}

                <label
                  className="flex items-center gap-3 p-3 bg-[#0F2942]/5 border border-[#0F2942]/10 rounded-xl cursor-pointer select-none transition-all"
                >
                  <input
                    type="checkbox"
                    checked={isAdminRole}
                    onChange={() => setIsAdminRole(!isAdminRole)}
                    disabled={email.toLowerCase() === "pa2@skillizee.io"}
                    className="w-4.5 h-4.5 text-[#0F2942] bg-slate-100 border-slate-300 rounded focus:ring-[#0F2942] cursor-pointer"
                  />
                  <span className="text-xs font-black text-[#0F2942] uppercase tracking-wide">Administrator Status</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#0F2942] hover:bg-[#163a5d] text-white rounded-xl text-xs font-black tracking-wide shadow-md shadow-slate-100 transition-all cursor-pointer text-center"
              >
                {isEditing ? "Update Access" : "Add User"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Users Table Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100 p-6 md:p-8 space-y-6 overflow-hidden">
          <div>
            <h2 className="text-lg font-black text-[#0F2942] tracking-tight">Active Team Directory</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Review active members, access roles, and edit details.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Credentials</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Permissions</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-slate-800">{u.name}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <code className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-slate-600 font-mono">
                          {u.password}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.isAdmin && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#0F2942]/10 text-[#0F2942]">
                              Admin
                            </span>
                          )}
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                r === "linkedin"
                                  ? "bg-sky-100 text-sky-700"
                                  : r === "social_media"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {r === "social_media" ? "Social" : r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            title="Edit Permissions"
                            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(u.email)}
                            disabled={u.email.toLowerCase() === "pa2@skillizee.io"}
                            title={u.email.toLowerCase() === "pa2@skillizee.io" ? "Cannot delete primary admin" : "Delete User"}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-xs font-bold text-slate-400">
                      {loading ? "Loading team database..." : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
