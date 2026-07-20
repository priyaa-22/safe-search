import React from "react";
import {
  ShieldCheck,
  FileText,
  Users,
  Activity,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";

export default function ComplianceSidebar({ currentPath, navigate, isOpen, setIsOpen, logout }) {
  const menuItems = [
    { name: "Compliance Dashboard", path: "/compliance", icon: ShieldCheck },
    { name: "Audit Logs", path: "/compliance/audit-logs", icon: FileText },
    { name: "Auditor Activity", path: "/compliance/auditor-activity", icon: Users },
    { name: "Compliance Reports", path: "/compliance/reports", icon: Activity },
    { name: "My Profile", path: "/compliance/profile", icon: User },
    { name: "Settings", path: "/compliance/settings", icon: Settings },
  ];

  const handleLinkClick = (path) => {
    navigate(path);
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white tracking-tight">SecureMatch</p>
              <p className="text-[10px] text-emerald-400 font-medium font-mono uppercase tracking-wider">Compliance Officer</p>
            </div>
          </div>
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleLinkClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-md"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
