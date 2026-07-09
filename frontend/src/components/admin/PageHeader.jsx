import React from "react";

export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200/80 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {children && <div className="mt-4 sm:mt-0 flex items-center gap-3">{children}</div>}
    </div>
  );
}
