import React, { useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import IdentitySearch from "../../components/iam/IdentitySearch";
import IdentityFilters from "../../components/iam/IdentityFilters";
import IdentityTable from "../../components/iam/IdentityTable";
import IdentityModal from "../../components/iam/IdentityModal";
import DisableIdentityDialog from "../../components/iam/DisableIdentityDialog";
import DeleteIdentityDialog from "../../components/iam/DeleteIdentityDialog";
import EmptyState from "../../components/iam/EmptyState";
import LoadingSkeleton from "../../components/iam/LoadingSkeleton";
import { Plus } from "lucide-react";
import useIdentity from "../../hooks/useIdentity";

export default function IAM({ showToast }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const {
    identities,
    loading,
    createIdentity,
    updateIdentity,
    disableIdentity,
    deleteIdentity,
  } = useIdentity(searchQuery, selectedRole, selectedStatus, showToast);

  // Modals & Dialogs State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedIdentity, setSelectedIdentity] = useState(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSaveIdentity = async (payload) => {
    try {
      if (modalMode === "create") {
        await createIdentity(payload);
      } else if (modalMode === "edit") {
        await updateIdentity(selectedIdentity.id, payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisableConfirm = async (id, newStatus) => {
    try {
      await disableIdentity(id, newStatus);
      setDisableDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteIdentity(id);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSelectedRole("");
    setSelectedStatus("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Identity & Access Management"
        description="Manage SecureMatch identities, assigned roles and platform access."
      />

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
          <IdentitySearch value={searchQuery} onChange={setSearchQuery} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <IdentityFilters
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onReset={handleResetFilters}
            />
            <button
              onClick={() => {
                setModalMode("create");
                setSelectedIdentity(null);
                setModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-xl transition cursor-pointer text-sm"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Create Identity
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : identities.length === 0 ? (
          <EmptyState />
        ) : (
          <IdentityTable
            identities={identities}
            onView={(identity) => {
              setModalMode("view");
              setSelectedIdentity(identity);
              setModalOpen(true);
            }}
            onEdit={(identity) => {
              setModalMode("edit");
              setSelectedIdentity(identity);
              setModalOpen(true);
            }}
            onToggleDisable={(identity) => {
              setSelectedIdentity(identity);
              setDisableDialogOpen(true);
            }}
            onDelete={(identity) => {
              setSelectedIdentity(identity);
              setDeleteDialogOpen(true);
            }}
          />
        )}
      </div>

      {/* Identity Configuration Modal */}
      <IdentityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveIdentity}
        identity={selectedIdentity}
        mode={modalMode}
      />

      {/* Disable confirmation dialog */}
      <DisableIdentityDialog
        isOpen={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
        onConfirm={handleDisableConfirm}
        identity={selectedIdentity}
      />

      {/* Delete confirmation dialog */}
      <DeleteIdentityDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        identity={selectedIdentity}
      />
    </div>
  );
}
