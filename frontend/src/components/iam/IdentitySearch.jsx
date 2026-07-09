import React from "react";
import { Search } from "lucide-react";

export default function IdentitySearch({ value, onChange }) {
  return (
    <div className="relative flex-grow font-sans">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-450">
        <Search className="w-4.5 h-4.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm focus:border-black focus:outline-none text-gray-800 transition shadow-xs placeholder-gray-450 font-medium"
        placeholder="Search identities (name, username, org, role)..."
      />
    </div>
  );
}
