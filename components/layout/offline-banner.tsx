"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOfflineSyncStore } from "@/hooks/offline/use-offline-sync";

export function OfflineBanner() {
  const t = useTranslations("OfflineBanner");
  const isOnline = useOfflineSyncStore((state) => state.isOnline);
  const queueSize = useOfflineSyncStore((state) => state.queueSize);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
          role="status"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{t("message")}</span>
          {queueSize > 0 && (
            <span className="rounded-full bg-amber-950/10 px-2 py-0.5 text-xs">
              {t("queued", { count: queueSize })}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
