import React, { useState, useEffect } from "react";
import { X, User, Shield, Briefcase, Mail, Key } from "lucide-react";

export default function IdentityModal({ isOpen, onClose, onSave, identity, mode }) {
  if (!isOpen) return null;

  const isView = mode === "view";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Internal Analyst");
  const [organization, setOrganization] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");

  useEffect(() => {
    if (identity && (isEdit || isView)) {
      setFullName(identity.fullName || "");
      setUsername(identity.username || "");
      setEmail(identity.email || "");
      setRole(identity.role || "Internal Analyst");
      setOrganization(identity.organization || "");
      setOrgCode(identity.orgCode || "");
      setStatus(identity.status || "Active");
    } else {
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("Internal Analyst");
      setOrganization("");
      setOrgCode("");
      setStatus("Active");
    }
    setError("");
  }, [identity, mode, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isView) {
      onClose();
      return;
    }

    if (!fullName.trim()) return setError("Full Name is required");
    if (isCreate && !username.trim()) return setError("Username is required");
    if (isCreate && !password) return setError("Temporary Password is required");
    if (isCreate && password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (role === "External Auditor" && !organization.trim()) {
      return setError("Organization Name is required for External Auditors");
    }

    const payload = {
      fullName,
      email,
      role,
      status,
    };

    if (isCreate) {
      payload.username = username;
      payload.password = password;
    }

    if (role === "External Auditor") {
      payload.organization = organization;
      payload.orgCode = orgCode;
    } else {
      payload.organization = "";
      payload.orgCode = "";
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs font-sans px-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-snug">
              {isView ? "Identity Profile" : isCreate ? "Create New Identity" : "Edit Identity Configuration"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isView ? "Review platform roles and metadata." : "Configure secure access permissions."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-450" /> Full Name
            </label>
            <input
              type="text"
              disabled={isView}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase">
              Username
            </label>
            <input
              type="text"
              disabled={isView || isEdit}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 font-mono disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g. john.doe"
            />
            {isEdit && (
              <p className="text-[10px] text-gray-400 font-medium">
                Username identity codes are immutable.
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-450" /> Email Address (Optional)
            </label>
            <input
              type="email"
              disabled={isView}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g. john@securematch.io"
            />
          </div>

          {/* Role selection */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gray-450" /> Assigned Role
            </label>
            <select
              disabled={isView}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 disabled:bg-gray-50 disabled:text-gray-500 cursor-pointer"
            >
              <option value="Internal Analyst">Internal Analyst</option>
              <option value="Compliance Officer">Compliance Officer</option>
              <option value="External Auditor">External Auditor</option>
              <option value="Read Only Analyst">Read Only Analyst</option>
            </select>
          </div>

          {/* External Auditor specific organization fields */}
          {role === "External Auditor" && (
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-1">
                <label className="text-xs text-gray-550 font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Organization Name
                </label>
                <input
                  type="text"
                  disabled={isView}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="e.g. PricewaterhouseCoopers"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-550 font-bold font-mono tracking-wider uppercase">
                  Organization Code (Optional)
                </label>
                <input
                  type="text"
                  disabled={isView}
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 font-mono"
                  placeholder="e.g. PWC-01"
                />
              </div>
            </div>
          )}

          {/* Password fields (Create mode only) */}
          {isCreate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gray-405" /> Temp Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Status selection (Edit / View modes only) */}
          {(isEdit || isView) && (
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-bold font-mono tracking-wider uppercase">
                Access Status
              </label>
              <select
                disabled={isView}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-200 bg-white rounded-xl p-3 text-sm focus:border-black focus:outline-none text-gray-800 disabled:bg-gray-50 disabled:text-gray-500 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition cursor-pointer"
            type="button"
          >
            {isView ? "Close" : "Cancel"}
          </button>
          {!isView && (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl text-sm transition cursor-pointer"
              type="submit"
            >
              {isCreate ? "Create Identity" : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
