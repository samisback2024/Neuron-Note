import { useState, useCallback } from "react";
import { Bell, Info } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { ToggleRow } from "../components/ToggleRow";
import { useSettingsStore } from "../../../lib/settingsStore";
import toast from "react-hot-toast";

export function NotificationsSection() {
  const { notifications, updateNotifications } = useSettingsStore();
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>(
      typeof Notification !== "undefined" ? Notification.permission : "default",
    );

  const handleDesktopToggle = useCallback(
    async (value: boolean) => {
      if (!value) {
        updateNotifications({ desktop: false });
        toast.success("Desktop notifications disabled");
        return;
      }

      if (typeof Notification === "undefined") {
        toast.error("Your browser does not support desktop notifications");
        return;
      }

      if (Notification.permission === "granted") {
        updateNotifications({ desktop: true });
        toast.success("Desktop notifications enabled");
        return;
      }

      if (Notification.permission === "denied") {
        toast.error(
          "Notification permission was denied. Please enable it in your browser settings.",
          { duration: 5000 },
        );
        return;
      }

      // Ask for permission
      const result = await Notification.requestPermission();
      setPermissionState(result);

      if (result === "granted") {
        updateNotifications({ desktop: true });
        toast.success("Desktop notifications enabled");
        // Show a test notification
        new Notification("Neuron", {
          body: "Desktop notifications are now active!",
          icon: "/favicon.svg",
        });
      } else {
        toast.error("Notification permission was denied");
      }
    },
    [updateNotifications],
  );

  return (
    <SettingSection
      icon={Bell}
      title="Notifications"
      description="Choose what you want to be notified about"
    >
      <div className="divide-y divide-surface-100 dark:divide-surface-700/40">
        <ToggleRow
          label="Email notifications"
          description="Receive updates and alerts via email"
          enabled={notifications.email}
          onChange={(v) => {
            updateNotifications({ email: v });
            toast.success(
              v
                ? "Email notifications enabled"
                : "Email notifications disabled",
            );
          }}
        />

        <ToggleRow
          label="Desktop notifications"
          description="Get push notifications in your browser"
          enabled={notifications.desktop}
          onChange={handleDesktopToggle}
        />

        {/* Permission denied banner */}
        {permissionState === "denied" && notifications.desktop === false && (
          <div className="flex items-start gap-3 py-3 px-3 my-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200/60 dark:border-amber-800/30">
            <Info size={15} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Browser notifications are blocked
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                To enable, open your browser settings → Site settings →
                Notifications, and allow notifications for this site.
              </p>
            </div>
          </div>
        )}

        <ToggleRow
          label="Daily summary"
          description="Receive a daily digest of your activity"
          enabled={notifications.dailySummary}
          onChange={(v) => {
            updateNotifications({ dailySummary: v });
            toast.success(
              v ? "Daily summary enabled" : "Daily summary disabled",
            );
          }}
        />

        <ToggleRow
          label="Product updates"
          description="Get notified about new features and improvements"
          enabled={notifications.productUpdates}
          onChange={(v) => {
            updateNotifications({ productUpdates: v });
            toast.success(
              v ? "Product updates enabled" : "Product updates disabled",
            );
          }}
        />

        <ToggleRow
          label="Security alerts"
          description="Important security notifications about your account"
          enabled={notifications.securityAlerts}
          onChange={(v) => {
            updateNotifications({ securityAlerts: v });
            if (!v) {
              toast("We recommend keeping security alerts enabled", {
                icon: "⚠️",
                duration: 4000,
              });
            }
          }}
        />
      </div>
    </SettingSection>
  );
}
