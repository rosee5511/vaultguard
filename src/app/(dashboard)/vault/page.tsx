"use client";

import React, { useState } from "react";
import { useMasterPassword } from "@/context/MasterPasswordContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AccountCard } from "@/components/vault/AccountCard";
import { AccountForm } from "@/components/vault/AccountForm";
import { useVault } from "@/hooks/useVault";
import { VaultAccount, AccountFormData, VaultFilters } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Star, Archive, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function VaultPage() {
  const { masterPassword, isVerified } = useMasterPassword();
  const { accounts, isLoading, addAccount, updateAccount, deleteAccount, toggleFavorite, toggleArchive, filterAccounts } = useVault(masterPassword || "");

  const [filters, setFilters] = useState<VaultFilters>({
    category: "all",
    searchQuery: "",
    sortBy: "date",
    sortOrder: "desc",
    showFavorites: false,
    showArchived: false,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<VaultAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const filtered = filterAccounts(filters);

  const handleAdd = async (data: AccountFormData) => {
    const result = await addAccount(data);
    if (result.success) {
      toast.success("Account added successfully");
      return { success: true };
    }
    toast.error(result.error || "Failed to add account");
    return { success: false };
  };

  const handleEdit = async (data: AccountFormData) => {
    if (!editingAccount) return { success: false };
    const result = await updateAccount(editingAccount.id, data);
    if (result.success) {
      toast.success("Account updated");
      setEditingAccount(null);
      return { success: true };
    }
    toast.error(result.error || "Failed to update");
    return { success: false };
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteAccount(deleteConfirm.id, deleteConfirm.name);
    if (result.success) {
      toast.success("Account deleted");
      setDeleteConfirm(null);
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const openEdit = (account: VaultAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please verify your master password</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password Vault</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} accounts</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Account
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search accounts..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, showFavorites: !f.showFavorites }))}
              className={`p-2.5 rounded-xl border transition-all ${filters.showFavorites ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600" : "border-gray-200 dark:border-dark-border text-gray-400"}`}
            >
              <Star className="h-4 w-4" fill={filters.showFavorites ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, showArchived: !f.showArchived }))}
              className={`p-2.5 rounded-xl border transition-all ${filters.showArchived ? "bg-gray-100 dark:bg-dark-elevated border-gray-300 dark:border-gray-600 text-gray-600" : "border-gray-200 dark:border-dark-border text-gray-400"}`}
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={200} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-dark-elevated flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No accounts found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {accounts.length === 0 ? "Add your first account to get started" : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={openEdit}
                  onDelete={(id, name) => setDeleteConfirm({ id, name })}
                  onToggleFavorite={toggleFavorite}
                  onToggleArchive={toggleArchive}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <AccountForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingAccount ? handleEdit : handleAdd}
          initialData={editingAccount}
        />

        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Account" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} className="flex-1" leftIcon={<Trash2 className="h-4 w-4" />}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}