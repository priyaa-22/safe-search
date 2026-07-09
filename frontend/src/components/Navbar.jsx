import React, { useState } from "react";

export default function Navbar({ activeTab, setActiveTab, role, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isInternal = role === "internal" || role === "admin";


  return (
    <nav className="w-full sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-sm text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base text-gray-800 tracking-tight">
              Encrypted Search
            </p>
            <p className="text-[10px] text-gray-500 font-medium">
              SSE/PEKS Protocol
            </p>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-2 items-center">
          {isInternal && (
            <>
              <TabButton
                active={activeTab === "upload"}
                onClick={() => setActiveTab("upload")}
                label="Encrypted Documents"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 03-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                }
              />
              <TabButton
                active={activeTab === "storage"}
                onClick={() => setActiveTab("storage")}
                label="Storage Map"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                }
              />
            </>
          )}

          <TabButton
            active={activeTab === "search"}
            onClick={() => setActiveTab("search")}
            label="Search Operations"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          <TabButton
            active={activeTab === "metrics"}
            onClick={() => setActiveTab("metrics")}
            label="Security Analytics"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9-7H16a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2z" />
              </svg>
            }
          />

          <div className="h-5 w-[1px] bg-gray-200 mx-3"></div>

          <span className={`text-xs px-3 py-1.5 rounded-xl font-medium border ${
            role === "admin"
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : isInternal 
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}>
            {role === "admin" ? "Super Administrator" : isInternal ? "Internal Analyst" : "External Auditor"}
          </span>

          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition duration-150 cursor-pointer flex items-center gap-1.5 font-medium"
          >
            Logout
          </button>
        </div>

        {/* HAMBURGER BUTTON (Mobile Only) */}
        <button
        className="md:hidden text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
        onClick={() => setMenuOpen(!menuOpen)}
      >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-100 shadow-md animate-[fadeIn_0.2s_ease-out]">
          {isInternal && (
            <>
              <MobileTabButton
                active={activeTab === "upload"}
                onClick={() => {
                  setActiveTab("upload");
                  setMenuOpen(false);
                }}
                label="Encrypted Documents"
              />
              <MobileTabButton
                active={activeTab === "storage"}
                onClick={() => {
                  setActiveTab("storage");
                  setMenuOpen(false);
                }}
                label="Storage Map"
              />
            </>
          )}

          <MobileTabButton
            active={activeTab === "search"}
            onClick={() => {
              setActiveTab("search");
              setMenuOpen(false);
            }}
            label="Search Operations"
          />

          <MobileTabButton
            active={activeTab === "metrics"}
            onClick={() => {
              setActiveTab("metrics");
              setMenuOpen(false);
            }}
            label="Security Analytics"
          />

          <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
            <span className={`text-xs text-center py-2 rounded-lg font-medium border ${
              role === "admin"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : isInternal 
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {role === "admin" ? "Super Administrator" : isInternal ? "Internal Analyst" : "External Auditor"}
            </span>

            <button
              onClick={logout}
              className="w-full text-center text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 py-2.5 rounded-lg transition duration-150 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ================= NAV BUTTONS HELPER COMPONENTS ================= */

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition duration-200 cursor-pointer flex items-center gap-2 ${
        active
          ? "bg-slate-900 text-white border border-slate-900 shadow-sm font-semibold"
          : "text-slate-600 hover:text-slate-900 border border-transparent hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
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
    >
      {label}
    </button>
  );
}
