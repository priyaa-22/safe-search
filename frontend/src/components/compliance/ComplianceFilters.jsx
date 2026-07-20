import React from "react";
import { Filter, RefreshCw, Download, Search } from "lucide-react";
import { TextInput, SelectInput, Button } from "../ui";

export default function ComplianceFilters({
  filters,
  onChange,
  onReset,
  onExport,
  totalCount = 0,
}) {
  const severityOptions = [
    { value: "ALL", label: "All Severities" },
    { value: "CRITICAL", label: "Critical" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
    { value: "INFO", label: "Informational" },
  ];

  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "SUCCESS", label: "Success" },
    { value: "FAILED", label: "Failed" },
    { value: "DENIED", label: "Denied / Blocked" },
  ];

  const eventOptions = [
    { value: "ALL", label: "All Event Types" },
    { value: "INTERNAL_SEARCH", label: "Internal Search (SSE)" },
    { value: "EXTERNAL_SEARCH", label: "External Search (PEKS)" },
    { value: "USER_LOGIN", label: "User Login" },
    { value: "AUDITOR_CREATED", label: "Auditor Created" },
    { value: "KEY_ROTATED", label: "Key Rotated" },
    { value: "CREDENTIAL_DOWNLOADED", label: "Credential Downloaded" },
    { value: "UNAUTHORIZED_ATTEMPT", label: "Unauthorized Attempt" },
    { value: "LOGS_EXPORTED", label: "Logs Exported" },
  ];

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Enterprise Audit Filters</h3>
            <p className="text-xs text-gray-500">
              Filtered Results: <span className="font-semibold text-gray-900 font-mono">{totalCount}</span> records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </Button>

          {onExport && (
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                onClick={() => onExport("csv")}
                className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => onExport("excel")}
                className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </Button>
              <Button
                variant="primary"
                onClick={() => onExport("pdf")}
                className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Search Keyword
          </label>
          <div className="relative">
            <TextInput
              value={filters.search || ""}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Action, IP, user..."
              className="pl-8 text-xs"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Severity Level
          </label>
          <SelectInput
            value={filters.severity || "ALL"}
            onChange={(e) => onChange({ severity: e.target.value })}
            options={severityOptions}
            className="text-xs"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Event Category
          </label>
          <SelectInput
            value={filters.event || "ALL"}
            onChange={(e) => onChange({ event: e.target.value })}
            options={eventOptions}
            className="text-xs"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Execution Status
          </label>
          <SelectInput
            value={filters.status || "ALL"}
            onChange={(e) => onChange({ status: e.target.value })}
            options={statusOptions}
            className="text-xs"
          />
        </div>

        {/* User filter */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Username
          </label>
          <TextInput
            value={filters.user || ""}
            onChange={(e) => onChange({ user: e.target.value })}
            placeholder="e.g. admin, officer..."
            className="text-xs"
          />
        </div>

        {/* Organization filter */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Organization
          </label>
          <TextInput
            value={filters.organization || ""}
            onChange={(e) => onChange({ organization: e.target.value })}
            placeholder="e.g. PwC, KPMG..."
            className="text-xs"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            From Date
          </label>
          <TextInput
            type="date"
            value={filters.start_date || ""}
            onChange={(e) => onChange({ start_date: e.target.value })}
            className="text-xs"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            To Date
          </label>
          <TextInput
            type="date"
            value={filters.end_date || ""}
            onChange={(e) => onChange({ end_date: e.target.value })}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
