import React from "react";
import {
  Home,
  Shield,
  Building,
  Folder,
  Search,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar({ currentPath, navigate, isOpen, setIsOpen, logout }) {
  const menuItems = [
    { name: "Control Center", path: "/admin", icon: Home },
    { name: "Identity & Access Management", path: "/admin/iam", icon: Shield },
    { name: "Auditor Management", path: "/admin/auditors", icon: Building },
    { name: "Encrypted Documents", path: "/admin/documents", icon: Folder },
    { name: "Search Operations", path: "/admin/search", icon: Search },
    { name: "Security Analytics", path: "/admin/metrics", icon: BarChart3 },
    { name: "System Settings", path: "/admin/settings", icon: Settings },
    { name: "My Security Profile", path: "/admin/profile", icon: User },
  ];

  const handleLinkClick = (path) => {
    navigate(path);
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white tracking-tight">SecureMatch</p>
              <p className="text-[10px] text-slate-500 font-medium font-mono uppercase tracking-wider">Admin Portal</p>
            </div>
          </div>
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
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
                    ? "bg-blue-600 text-white font-semibold shadow-md"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
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
