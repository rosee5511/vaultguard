"use client";

import React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useMasterPassword } from "@/context/MasterPasswordContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sun, Moon, Monitor, Trash2, Download, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const { autoLockMinutes, setAutoLockMinutes, rememberDevice, setRememberDevice } = useMasterPassword();

  const handleExport = () => {
    toast.success("Export feature coming soon");
  };

  const handleImport = () => {
    toast.success("Import feature coming soon");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires email confirmation");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your vault preferences</p>
        </div>

        <Card glass className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "dark" as const, label: "Dark", icon: Moon },
              { value: "system" as const, label: "System", icon: Monitor },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === option.value
                    ? "border-vault-500 bg-vault-50 dark:bg-vault-900/20"
                    : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <option.icon className={`h-5 w-5 ${theme === option.value ? "text-vault-600" : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${theme === option.value ? "text-vault-700" : "text-gray-600 dark:text-gray-400"}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card glass className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-elevated flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-lock</p>
                  <p className="text-xs text-gray-500">Lock vault after inactivity</p>
                </div>
              </div>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated px-3 py-2 text-sm"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Never</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-elevated flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Remember this device</p>
                  <p className="text-xs text-gray-500">Stay unlocked on this device</p>
                </div>
              </div>
              <button
                onClick={() => setRememberDevice(!rememberDevice)}
                className={`w-12 h-6 rounded-full transition-colors ${rememberDevice ? "bg-vault-500" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${rememberDevice ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </Card>

        <Card glass className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
          <div className="space-y-3">
            <Button variant="secondary" fullWidth leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
              Export Encrypted Backup
            </Button>
            <Button variant="secondary" fullWidth leftIcon={<Upload className="h-4 w-4" />} onClick={handleImport}>
              Import Encrypted Backup
            </Button>
          </div>
        </Card>

        <Card className="p-5 border-red-200 dark:border-red-900/30">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <Button variant="danger" fullWidth leftIcon={<Trash2 className="h-4 w-4" />} onClick={handleDeleteAccount}>
            Delete Account & All Data
          </Button>
        </Card>

        <Button variant="ghost" fullWidth onClick={logout} className="text-gray-500">
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}