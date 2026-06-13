"use client";

import React from "react";
import { useMasterPassword } from "@/context/MasterPasswordContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useVault } from "@/hooks/useVault";
import { useSecurity } from "@/hooks/useSecurity";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const { masterPassword, isVerified } = useMasterPassword();
  const { accounts, isLoading } = useVault(masterPassword || "");
  const { analysis } = useSecurity(accounts);

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyze and improve your password security
          </p>
        </div>

        {isLoading ? (
          <Skeleton height={150} />
        ) : (
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Security Score</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Based on password strength, uniqueness, and age
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: analysis.securityScore >= 80 ? "#22c55e" : analysis.securityScore >= 60 ? "#eab308" : "#ef4444" }}>
                  {analysis.securityScore}
                </div>
                <p className="text-xs text-gray-400">out of 100</p>
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-gray-100 dark:bg-dark-elevated overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: analysis.securityScore >= 80 ? "#22c55e" : analysis.securityScore >= 60 ? "#eab308" : "#ef4444" }}
                initial={{ width: 0 }}
                animate={{ width: `${analysis.securityScore}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => <Skeleton key={i} height={80} />)
          ) : (
            <>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.totalAccounts}</div>
                <p className="text-xs text-gray-500 mt-1">Total Accounts</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.strongPasswords}</div>
                <p className="text-xs text-gray-500 mt-1">Strong</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">{analysis.weakPasswords}</div>
                <p className="text-xs text-gray-500 mt-1">Weak</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500">{analysis.duplicatePasswords}</div>
                <p className="text-xs text-gray-500 mt-1">Duplicates</p>
              </Card>
            </>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h2>
          {isLoading ? (
            <Skeleton height={200} />
          ) : analysis.recommendations.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">All Good!</h3>
              <p className="text-sm text-gray-500 mt-1">No security issues found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {analysis.recommendations.map((rec) => (
                <Card key={rec.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rec.severity === "critical" ? "bg-red-50 dark:bg-red-900/20" :
                      rec.severity === "high" ? "bg-orange-50 dark:bg-orange-900/20" :
                      rec.severity === "medium" ? "bg-amber-50 dark:bg-amber-900/20" :
                      "bg-blue-50 dark:bg-blue-900/20"
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        rec.severity === "critical" ? "text-red-600" :
                        rec.severity === "high" ? "text-orange-600" :
                        rec.severity === "medium" ? "text-amber-600" :
                        "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{rec.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rec.severity === "critical" ? "bg-red-100 text-red-700" :
                          rec.severity === "high" ? "bg-orange-100 text-orange-700" :
                          rec.severity === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {rec.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rec.description}</p>
                      <p className="text-sm text-vault-600 mt-2 font-medium">{rec.action}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}