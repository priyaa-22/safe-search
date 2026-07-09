import React from "react";

export default function StatCard({ title, value, icon: Icon, description, trend, trendType }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        {(description || trend) && (
          <p className="text-xs text-gray-400">
            {trend && (
              <span className={`font-semibold mr-1 ${
                trendType === "success" ? "text-emerald-600" : trendType === "danger" ? "text-rose-600" : "text-gray-500"
              }`}>
                {trend}
              </span>
            )}
            {description}
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-700">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
