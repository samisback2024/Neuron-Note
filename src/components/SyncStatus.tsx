import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi, WifiOff } from "lucide-react";
import { useStore } from "../lib/store";

export function SyncStatus() {
  const { isOnline, setOnline } = useStore();

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800 dark:bg-surface-700 text-white text-[12px] font-medium shadow-lg"
        >
          <WifiOff size={13} className="text-yellow-400" />
          <span>Offline — changes will sync when reconnected</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
