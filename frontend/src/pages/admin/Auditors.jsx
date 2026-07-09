import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import CreateAuditorCard from "../../components/CreateAuditorCard";
import { Spinner } from "../../components/Loader";
import { rotateAuditorKey } from "../../services/auditorService";
import api from "../../services/api";

export default function Auditors({ showToast }) {
  const [auditors, setAuditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotatingId, setRotatingId] = useState(null);

  const fetchAuditors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/metrics/internal/");
      setAuditors(res.data?.data?.auditors || []);
    } catch (err) {
      console.error(err);
      showToast?.("Failed to load auditor directory", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAuditors();
  }, [fetchAuditors]);

  const handleRotateKey = async (auditorId) => {
    try {
      setRotatingId(auditorId);
      await rotateAuditorKey(auditorId);
      showToast?.("Auditor key rotated successfully", "success");
      fetchAuditors();
    } catch (err) {
      console.error(err);
      showToast?.("Failed to rotate auditor key", "error");
    } finally {
      setRotatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Auditor Management"
        description="Register external auditors, authorize credentials, and manage PEKS public/private key pairs."
      />

      <CreateAuditorCard onCreated={fetchAuditors} showToast={showToast} />

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="pb-5 border-b border-gray-100 mb-5">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Registered Auditors</h2>
          <p className="text-xs text-gray-500 mt-1">
            Organization details, active key versions, and credential actions.
          </p>
        </div>

        {loading ? (
          <div className="py-10">
            <Spinner text="Loading auditors..." />
          </div>
        ) : auditors.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 text-sm">No auditors registered in the directory.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-400 font-medium font-mono text-[10px] tracking-wider uppercase">
                    <th className="py-3.5 pl-4">Auditor</th>
                    <th className="py-3.5">Organization</th>
                    <th className="py-3.5">Key Information</th>
                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditors.map((auditor) => (
                    <tr key={auditor.auditor_id} className="hover:bg-gray-50 transition">
                      <td className="py-4 pl-4">
                        <p className="text-sm font-semibold text-gray-900">{auditor.name}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {auditor.auditor_id}</p>
                      </td>
                      <td className="py-4 text-sm text-gray-700">
                        {auditor.organization || "External authority"}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-700">
                          Key Version {auditor.active_key_version || 1}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRotateKey(auditor.auditor_id)}
                            disabled={rotatingId === auditor.auditor_id}
                            className="text-xs bg-white hover:bg-gray-50 text-blue-600 border border-gray-300 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 font-medium"
                            type="button"
                          >
                            {rotatingId === auditor.auditor_id ? "Rotating..." : "Rotate Key"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
