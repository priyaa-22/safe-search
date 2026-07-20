import React from "react";
import { X, Shield, Clock, User, Globe, Server, Code, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge, StatusBadge, Button } from "../ui";

export default function AuditLogDrawer({ isOpen, onClose, log }) {
  if (!isOpen || !log) return null;

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return <Badge variant="rose" className="uppercase font-mono text-[10px]">CRITICAL</Badge>;
      case "HIGH":
        return <Badge variant="amber" className="uppercase font-mono text-[10px]">HIGH</Badge>;
      case "MEDIUM":
        return <Badge variant="warning" className="uppercase font-mono text-[10px]">MEDIUM</Badge>;
      case "LOW":
        return <Badge variant="blue" className="uppercase font-mono text-[10px]">LOW</Badge>;
      default:
        return <Badge variant="gray" className="uppercase font-mono text-[10px]">INFO</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-[slideInRight_0.3s_ease-out]">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100/60 text-emerald-700 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Audit Event Details</h3>
                <p className="text-xs text-gray-500 font-mono">ID: #{log.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Status & Severity */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-150 rounded-2xl">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Severity Level
                </span>
                {getSeverityBadge(log.severity)}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Execution Status
                </span>
                <StatusBadge status={log.status === "SUCCESS" ? "Active" : log.status === "DENIED" ? "Locked" : "Disabled"} />
              </div>
            </div>

            {/* Core Info List */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Action Event</span>
                  <span className="font-bold text-gray-900 text-sm">{log.event || log.action}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Performed By</span>
                  <span className="font-semibold text-gray-800">{log.user || "System User"}</span>
                  <span className="text-gray-400 block text-[11px]">{log.organization || "SecureMatch Org"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Timestamp</span>
                  <span className="font-mono text-gray-800">{log.timestamp}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Network IP Address</span>
                  <span className="font-mono text-gray-800">{log.ip_address || "127.0.0.1"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Server className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Endpoint API</span>
                  <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                    {log.endpoint || "/api/compliance/"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Code className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-400 font-medium block">Key Version & Browser</span>
                  <span className="font-semibold text-gray-800">Key Version v{log.key_version || 1}</span>
                  <span className="text-gray-400 block text-[11px] truncate max-w-[280px]">
                    {log.user_agent || "Mozilla/5.0 (X11; Linux x86_64)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata JSON Block */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-2">Cryptographic Metadata</span>
              <pre className="p-4 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-2xl overflow-x-auto max-h-48">
                {JSON.stringify(log.metadata || { description: log.details || log.event }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <Button variant="secondary" onClick={onClose} className="w-full text-xs py-2.5">
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
