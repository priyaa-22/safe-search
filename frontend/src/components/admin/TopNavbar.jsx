import React, { useState, useRef, useEffect } from "react";
import { Bell, Menu, ChevronDown, User, LogOut } from "lucide-react";

export default function TopNavbar({ user, logout, navigate, onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (username) => {
    if (!username) return "SA";
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200/80 shadow-xs">
      {/* Left side: Hamburger (mobile only) & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 md:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* SecureMatch Logo - visible only when sidebar is hidden (mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-sm">SecureMatch</span>
        </div>
      </div>

      {/* Right side: Actions & User Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer text-left font-sans"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm shadow-xs font-mono">
              {getInitials(user?.username)}
            </div>

            {/* User Info (hidden on small mobile) */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">
                {user?.username || "Admin"}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 leading-none">
                  {user?.role === "Administrator" ? "Super Administrator" : (user?.role || "Super Administrator")}
                </span>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 animate-[fadeIn_0.15s_ease-out] z-50">
              <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || "Admin"}</p>
                <p className="text-xs text-gray-500 font-medium truncate">{user?.role === "Administrator" ? "Super Administrator" : (user?.role || "Super Administrator")}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/admin/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer text-left font-sans font-medium"
              >
                <User className="w-4 h-4 text-gray-400" />
                Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left font-sans font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
