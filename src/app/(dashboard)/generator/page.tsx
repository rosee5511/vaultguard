"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { PasswordGenerator } from "@/components/generator/PasswordGenerator";
import { motion } from "framer-motion";

export default function GeneratorPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Generator</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Create strong, unique passwords with customizable options
          </p>
          <PasswordGenerator />
        </motion.div>
      </div>
    </AppLayout>
  );
}