import React, { useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import TopNavbar from "../components/admin/TopNavbar";

export default function AdminLayout({ children, user, logout, navigate, currentPath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar - static on desktop, collapsable drawer on mobile */}
      <Sidebar
        currentPath={currentPath}
        navigate={navigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        logout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          user={user}
          logout={logout}
          navigate={navigate}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Content Wrapper */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
