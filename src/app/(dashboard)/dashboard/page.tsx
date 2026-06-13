"use client";

import React, { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useMasterPassword } from "@/context/MasterPasswordContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SecurityScore } from "@/components/dashboard/SecurityScore";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PasswordHealth } from "@/components/dashboard/PasswordHealth";
import { useVault } from "@/hooks/useVault";
import { useSecurity } from "@/hooks/useSecurity";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ActivityLog } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { Shield, KeyRound, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { masterPassword, isVerified } = useMasterPassword();
  const { accounts, isLoading: vaultLoading } = useVault(masterPassword || "");
  const { analysis } = useSecurity(accounts);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "activity_logs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ActivityLog[];
      setActivities(logs);
      setActivitiesLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  const strengthCounts = {
    weak: activeAccounts.filter((a) => a.passwordStrength === "weak").length,
    fair: activeAccounts.filter((a) => a.passwordStrength === "fair").length,
    good: activeAccounts.filter((a) => a.passwordStrength === "good").length,
    strong: activeAccounts.filter((a) => a.passwordStrength === "strong").length,
    excellent: activeAccounts.filter((a) => a.passwordStrength === "excellent").length,
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please verify your master password to continue</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s your vault overview
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {vaultLoading ? (
            <>
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
            </>
          ) : (
            <>
              <StatsCard title="Total Accounts" value={activeAccounts.length} icon={Shield} color="#3b82f6" delay={0} />
              <StatsCard title="Strong Passwords" value={strengthCounts.strong + strengthCounts.excellent} subtitle={`${analysis.totalAccounts > 0 ? Math.round(((strengthCounts.strong + strengthCounts.excellent) / analysis.totalAccounts) * 100) : 0}% secure`} icon={CheckCircle} color="#22c55e" delay={0.1} />
              <StatsCard title="Weak Passwords" value={strengthCounts.weak + strengthCounts.fair} icon={AlertTriangle} color="#f97316" delay={0.2} />
              <StatsCard title="Favorites" value={activeAccounts.filter((a) => a.isFavorite).length} icon={KeyRound} color="#8b5cf6" delay={0.3} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {vaultLoading ? <Skeleton height={200} /> : <SecurityScore score={analysis.securityScore} />}
            {vaultLoading ? <Skeleton height={250} /> : <PasswordHealth weak={strengthCounts.weak} fair={strengthCounts.fair} good={strengthCounts.good} strong={strengthCounts.strong} excellent={strengthCounts.excellent} />}
          </div>
          <div className="lg:col-span-2">
            {activitiesLoading ? <Skeleton height={300} /> : <RecentActivity activities={activities} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}