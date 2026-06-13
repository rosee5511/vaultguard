"use client";

import { useAuthContext } from "@/context/AuthContext";
import { MasterPasswordSetup } from "@/components/auth/MasterPasswordSetup";
import { MasterPasswordVerify } from "@/components/auth/MasterPasswordVerify";

export default function MasterPasswordPage() {
  const { user } = useAuthContext();

  if (!user?.hasMasterPassword) {
    return <MasterPasswordSetup />;
  }

  return <MasterPasswordVerify />;
}