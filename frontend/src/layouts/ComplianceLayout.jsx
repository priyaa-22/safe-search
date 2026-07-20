import React, { useState } from "react";
import { Badge } from "../components/ui";

export default function ComplianceLayout({ children, logout, navigate, currentPath }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Compliance Dashboard", path: "/compliance", icon: "shield" },
    { label: "Audit Logs", path: "/compliance/audit-logs", icon: "file" },
    { label: "Auditor Activity", path: "/compliance/auditor-activity", icon: "users" },
    { label: "Compliance Reports", path: "/compliance/reports", icon: "activity" },
  ];

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="w-full sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-sm text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => goTo("/compliance")}
            className="flex items-center gap-2 select-none cursor-pointer"
            type="button"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm sm:text-base text-gray-800 tracking-tight">
                SecureMatch Governance
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                Compliance Officer Portal
              </p>
            </div>
          </button>

          <div className="hidden lg:flex gap-1.5 items-center">
            {navItems.map((item) => (
              <TabButton
                key={item.path}
                active={currentPath === item.path}
                onClick={() => goTo(item.path)}
                label={item.label}
                icon={<NavIcon name={item.icon} />}
              />
            ))}

            <div className="h-5 w-[1px] bg-gray-200 mx-2"></div>

            <Badge variant="success" className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
              Compliance Officer
            </Badge>

            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition duration-150 cursor-pointer font-medium ml-1"
              type="button"
            >
              Logout
            </button>
          </div>

          <button
            className="lg:hidden text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-100 shadow-md animate-[fadeIn_0.2s_ease-out]">
            {navItems.map((item) => (
              <MobileTabButton
                key={item.path}
                active={currentPath === item.path}
                onClick={() => goTo(item.path)}
                label={item.label}
              />
            ))}
            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
              <Badge variant="success" className="w-full justify-center py-2 bg-emerald-50 text-emerald-700">
                Compliance Officer
              </Badge>
              <button
                onClick={logout}
                className="w-full text-center text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 py-2.5 rounded-lg transition duration-150 cursor-pointer"
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative animate-[fadeIn_0.3s_ease-out]">
        {children}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-medium transition duration-200 cursor-pointer flex items-center gap-1.5 ${
        active
          ? "bg-slate-900 text-white border border-slate-900 shadow-sm font-semibold"
          : "text-slate-600 hover:text-slate-900 border border-transparent hover:bg-slate-100"
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function NavIcon({ name }) {
  const paths = {
    shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    file: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    activity: "M13 10V3L4 14h7v7l9-11h-7z",
  };

  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={paths[name]} />
    </svg>
  );
}

function MobileTabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-slate-900 border border-slate-900 text-white font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
      type="button"
    >
      {label}
    </button>
  );
}
