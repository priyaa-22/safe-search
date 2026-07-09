import React, { useState } from "react";

export default function AdminLayout({ children, logout, navigate, currentPath }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Control Center", path: "/admin", icon: "home" },
    { label: "Identities", path: "/admin/iam", icon: "shield" },
    { label: "Auditors", path: "/admin/auditors", icon: "user" },
    { label: "Documents", path: "/admin/documents", icon: "folder" },
    { label: "Search Operations", path: "/admin/search", icon: "search" },
    { label: "Security Analytics", path: "/admin/metrics", icon: "chart" },
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
            onClick={() => goTo("/admin")}
            className="flex items-center gap-2 select-none cursor-pointer"
            type="button"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm sm:text-base text-gray-800 tracking-tight">
                Encrypted Search
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                SSE/PEKS Protocol
              </p>
            </div>
          </button>

          <div className="hidden md:flex gap-2 items-center">
            {navItems.map((item) => (
              <TabButton
                key={item.path}
                active={currentPath === item.path}
                onClick={() => goTo(item.path)}
                label={item.label}
                icon={<NavIcon name={item.icon} />}
              />
            ))}

            <div className="h-5 w-[1px] bg-gray-200 mx-3"></div>

            <span className="text-xs px-3 py-1.5 rounded-xl font-medium border bg-blue-50 border-blue-200 text-blue-700">
              Super Administrator
            </span>

            <button
              onClick={logout}
              className="text-xs text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition duration-150 cursor-pointer font-medium"
              type="button"
            >
              Logout
            </button>
          </div>

          <button
            className="md:hidden text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
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
          <div className="md:hidden px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-100 shadow-md animate-[fadeIn_0.2s_ease-out]">
            {navItems.map((item) => (
              <MobileTabButton
                key={item.path}
                active={currentPath === item.path}
                onClick={() => goTo(item.path)}
                label={item.label}
              />
            ))}
            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
              <span className="text-xs text-center py-2 rounded-lg font-medium border bg-blue-50 border-blue-200 text-blue-700">
                Super Administrator
              </span>
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
      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition duration-200 cursor-pointer flex items-center gap-2 ${
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
    home: "M3 12l9-9 9 9M5 10v10h14V10",
    shield: "M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z",
    user: "M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8M20 8v6M23 11h-6",
    folder: "M3 7h6l2 2h10v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6h6zm6 0V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v10h6zm6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4h6z",
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
