import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { downloadAuditorLogsPdf, rotateAuditorKey } from "../services/auditorService";
import CreateAuditorCard from "./CreateAuditorCard";
import { SkeletonStats } from "./Loader";
import {
  PageHeader,
  InfoCard,
  ContentCard,
  Button,
  Modal,
  SelectInput,
} from "./ui";

export default function MetricsPage({ role, showToast, autoRefreshMs = 15000 }) {
  const resolvedRole = role?.toLowerCase() || "internal";
  const isInternal = [
    "internal",
    "admin",
    "administrator",
    "super administrator",
    "compliance officer",
  ].includes(resolvedRole);

  const [internalData, setInternalData] = useState(null);
  const [externalData, setExternalData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Key rotation display state
  const [rotatedKeyInfo, setRotatedKeyInfo] = useState(null);
  const [rotatingId, setRotatingId] = useState(null);
  const [downloadingLogsId, setDownloadingLogsId] = useState(null);
  const [selectedAuditorId, setSelectedAuditorId] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMetrics = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      if (isInternal) {
        const res = await api.get("/api/metrics/internal/");
        setInternalData(res.data?.data || {});
      } else {
        const res = await api.get("/api/metrics/external/");
        setExternalData(res.data?.data || {});
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Failed to load metrics");
      if (!silent) {
        showToast?.("Failed to fetch system metrics", "error");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [isInternal, showToast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchMetrics({ silent: true });
    }, autoRefreshMs);

    return () => window.clearInterval(intervalId);
  }, [autoRefreshMs, fetchMetrics]);

  useEffect(() => {
    if (!isInternal) {
      return;
    }

    const auditors = internalData?.auditors || [];
    if (!auditors.length) {
      if (selectedAuditorId) {
        setSelectedAuditorId("");
      }
      return;
    }

    const selectedExists = auditors.some(
      (auditor) => String(auditor.auditor_id) === String(selectedAuditorId)
    );

    if (!selectedAuditorId || !selectedExists) {
      setSelectedAuditorId(String(auditors[0].auditor_id));
    }
  }, [internalData, isInternal, selectedAuditorId]);

  const handleDeleteAuditor = async (auditorId) => {
    if (!window.confirm("Are you sure you want to delete this auditor? This action cannot be undone.")) {
      return;
    }
    try {
      await api.delete(`/api/auditor/${auditorId}/delete/`);
      showToast("Auditor deleted successfully", "success");
      fetchMetrics();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete auditor", "error");
    }
  };

  const handleRotateKey = async (auditorId) => {
    try {
      setRotatingId(auditorId);
      const res = await rotateAuditorKey(auditorId);
      const payload = res.data || {};
      
      setRotatedKeyInfo({
        privateKey: payload.new_private_key,
        publicKey: payload.new_public_key,
        version: payload.new_key_version
      });

      showToast("Key rotated successfully. Save the new private key!", "success");
      fetchMetrics();
    } catch (err) {
      console.error("Rotation failed:", err);
      showToast("Failed to rotate key", "error");
    } finally {
      setRotatingId(null);
    }
  };

  const handleDownloadLogsPdf = async (auditor) => {
    try {
      setDownloadingLogsId(auditor.auditor_id);
      const blobData = await downloadAuditorLogsPdf(auditor.auditor_id);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SecureMatch_Auditor_${auditor.name}_Logs.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast?.("Auditor logs PDF downloaded", "success");
    } catch (err) {
      console.error("Log PDF download failed:", err);
      showToast?.(err.message || "Failed to download auditor logs PDF", "error");
    } finally {
      setDownloadingLogsId(null);
    }
  };

  const handleCopyRotated = async () => {
    if (rotatedKeyInfo?.privateKey) {
      await navigator.clipboard.writeText(rotatedKeyInfo.privateKey);
      setCopied(true);
      showToast("Private key copied to clipboard", "success");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">System Metrics</h1>
        <div className="py-8">
          <SkeletonStats />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-red-650 font-medium mb-4">{error}</p>
          <Button
            variant="primary"
            onClick={fetchMetrics}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const safe = (val, fallback = 0) => (val !== undefined && val !== null ? val : fallback);
  const safeDate = (date) => (date ? new Date(date).toLocaleString() : "No indexes found");

  /* =========================
     EXTERNAL VIEW
  ========================= */
  if (!isInternal) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-[fadeIn_0.3s_ease-out]">
        <PageHeader
          title="System Metrics"
          description="External Auditor Metrics (Restricted access)"
        />

        <InfoCard
          title="Total Encrypted Documents"
          value={safe(externalData?.total_documents)}
          description="Total documents catalogued in SecureMatch"
          className="max-w-sm"
          icon={<span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>}
        />
      </div>
    );
  }

  /* =========================
     INTERNAL VIEW
  ========================= */
  const systemMetrics = internalData?.system_metrics || {};
  const auditors = internalData?.auditors || [];
  const isSuperAdministrator = ["admin", "administrator", "super administrator"].includes(resolvedRole);
  const selectedAuditor = auditors.find(
    (auditor) => String(auditor.auditor_id) === String(selectedAuditorId)
  );

  const modalFooter = (
    <>
      <Button
        variant="secondary"
        onClick={handleCopyRotated}
      >
        {copied ? "Copied ✔" : "Copy Private Key"}
      </Button>

      <Button
        variant="primary"
        onClick={() => {
          setRotatedKeyInfo(null);
          setCopied(false);
        }}
        className="bg-emerald-600 hover:bg-emerald-500"
      >
        Completed & Saved Securely
      </Button>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-[fadeIn_0.3s_ease-out] space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Analytics & Metrics"
        description="Real-time performance metrics, key directories, and secure searchable indexes."
      />

      <div className="flex justify-end">
        <span className="text-xs text-slate-500 font-mono">
          Auto-refresh: {Math.round(autoRefreshMs / 1000)}s
          {lastUpdated ? ` • Last sync ${lastUpdated.toLocaleTimeString()}` : ""}
        </span>
      </div>

      {isSuperAdministrator && (
        <ContentCard>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900">Export Auditor Logs</h3>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Download the latest auditor search activity as a PDF from the Security Analytics page.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <SelectInput
                value={selectedAuditorId}
                onChange={(event) => setSelectedAuditorId(event.target.value)}
                options={
                  auditors.length
                    ? auditors.map((auditor) => ({
                        value: String(auditor.auditor_id),
                        label: `${auditor.name} (ID: ${auditor.auditor_id})`,
                      }))
                    : [{ value: "", label: "No auditors available" }]
                }
                className="min-w-72"
                disabled={auditors.length === 0}
              />
              <Button
                variant="secondary"
                onClick={() => selectedAuditor && handleDownloadLogsPdf(selectedAuditor)}
                disabled={!selectedAuditor || downloadingLogsId === selectedAuditor.auditor_id}
                className="whitespace-nowrap"
              >
                {selectedAuditor && downloadingLogsId === selectedAuditor.auditor_id
                  ? "Downloading..."
                  : "Download Logs PDF"}
              </Button>
            </div>
          </div>
        </ContentCard>
      )}

      {/* CREATE AUDITOR */}
      <CreateAuditorCard onCreated={fetchMetrics} showToast={showToast} />

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="Total Vaulted Documents"
          value={safe(systemMetrics.total_documents)}
          description="At-rest repository records"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
        />
        <InfoCard
          title="Symmetric SSE Tokens"
          value={safe(systemMetrics.total_tokens)}
          description="Computed HMAC index entries"
          icon={<svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>}
        />
        <InfoCard
          title="Avg External Lookup"
          value={`${safe(systemMetrics.avg_external_search_ms)} ms`}
          description="Average response time"
          icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <InfoCard
          title="Queries (Last 24h)"
          value={safe(systemMetrics.external_searches_last_24h)}
          description="Audit operational search volume"
          icon={<svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUDITOR OVERVIEW */}
        <ContentCard>
          <h3 className="font-bold mb-5 text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Auditor Authority Key Directory
          </h3>

          {auditors.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <p className="text-slate-500 text-sm">No auditors registered in the directory.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {auditors.map((auditor) => (
                <div
                  key={auditor.auditor_id}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition duration-150"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {auditor.name}
                    </p>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-2xs font-mono text-slate-500">ID: {auditor.auditor_id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-2xs font-mono text-emerald-600 font-semibold">Key Version: {safe(auditor.active_key_version, 1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleDownloadLogsPdf(auditor)}
                      disabled={downloadingLogsId === auditor.auditor_id}
                      className="px-3 py-1.5 shadow-sm text-xs text-slate-700"
                    >
                      {downloadingLogsId === auditor.auditor_id ? "Downloading..." : "Logs PDF"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleRotateKey(auditor.auditor_id)}
                      disabled={rotatingId === auditor.auditor_id}
                      className="px-3 py-1.5 shadow-sm text-xs text-blue-600"
                    >
                      {rotatingId === auditor.auditor_id ? "Rotating..." : "Rotate Key"}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteAuditor(auditor.auditor_id)}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* SECURITY & DIAGNOSTICS */}
        <div className="space-y-6">
          <ContentCard>
            <h3 className="font-bold mb-5 text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Diagnostics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex-1">
                <p className={`text-2xl font-bold font-mono ${safe(systemMetrics.failed_external_searches_last_24h) > 0 ? "text-rose-600" : "text-blue-600"}`}>
                  {safe(systemMetrics.failed_external_searches_last_24h)}
                </p>
                <p className="text-slate-500 text-xs mt-1.5 uppercase font-mono tracking-wider font-semibold">
                  Failed Audit Signatures (24h)
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex-1">
                <p className="text-2xl font-bold font-mono text-blue-600">
                  {safe(systemMetrics.external_tokens)}
                </p>
                <p className="text-slate-500 text-xs mt-1.5 uppercase font-mono tracking-wider font-semibold">
                  PEKS External Index Tokens
                </p>
              </div>
            </div>
          </ContentCard>

          <ContentCard>
            <h3 className="font-bold mb-4 text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Index Health Sync
            </h3>

            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-slate-500">Last Index Update</span>
                <span className="font-mono text-slate-800 break-all">{safeDate(systemMetrics.last_index_update)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-slate-500">Total Search Tokens</span>
                <span className="font-mono text-slate-800 break-all">{safe(systemMetrics.total_tokens)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Active Master Seed Version</span>
                <span className="font-mono text-slate-800 break-all text-xs font-semibold">HKDF-SHA256 (Base Seed v1)</span>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>

      {/* ROTATED KEY MODAL */}
      <Modal
        isOpen={!!rotatedKeyInfo}
        onClose={() => {
          setRotatedKeyInfo(null);
          setCopied(false);
        }}
        title={`🔑 Rotated Keypair Ready (Version ${rotatedKeyInfo?.version || ""})`}
        footer={modalFooter}
        className="max-w-xl"
      >
        <p className="text-xs text-rose-650 font-mono mb-4 font-semibold">
          WARNING: Save this private key now. It cannot be displayed again!
        </p>

        <textarea
          readOnly
          value={rotatedKeyInfo?.privateKey || ""}
          className="w-full h-44 border border-gray-250 bg-gray-50 p-3 rounded-xl font-mono text-2xs text-slate-800 mb-4 select-all custom-scrollbar focus:outline-none"
        />
      </Modal>
    </div>
  );
}
