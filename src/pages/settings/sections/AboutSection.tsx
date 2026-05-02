import { Info, ExternalLink, Heart } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { SettingRow } from "../components/SettingRow";

const APP_VERSION = "1.0.0";
const BUILD_DATE = __BUILD_DATE__;

export function AboutSection() {
  return (
    <SettingSection
      icon={Info}
      title="About"
      description="App information and resources"
    >
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {/* App info */}
        <div className="py-3.5 first:pt-0">
          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
            <img
              src="/favicon.svg"
              alt="Neuron"
              className="w-12 h-12 shrink-0"
            />
            <div>
              <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                Neuron Note
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Your intelligent workspace for notes, tasks, and ideas.
              </p>
            </div>
          </div>
        </div>

        <SettingRow label="Version" description="Current app version">
          <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-lg">
            v{APP_VERSION}
          </span>
        </SettingRow>

        <SettingRow label="Build" description="Build date">
          <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-lg">
            {BUILD_DATE}
          </span>
        </SettingRow>

        <SettingRow label="Environment">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-lg">
            {import.meta.env.MODE}
          </span>
        </SettingRow>

        {/* Links */}
        <div className="py-3.5">
          <p className="text-[12.5px] font-medium text-zinc-600 dark:text-zinc-400 mb-3">
            Resources
          </p>
          <div className="space-y-1.5">
            {[
              {
                label: "Terms of Service",
                href: "#terms",
              },
              {
                label: "Privacy Policy",
                href: "#privacy",
              },
              {
                label: "Contact support",
                href: "mailto:support@neuron.app",
              },
              {
                label: "Report a bug",
                href: "mailto:support@neuron.app?subject=Bug%20Report",
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="flex items-center justify-between p-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 group"
              >
                {link.label}
                <ExternalLink
                  size={14}
                  className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Made with love */}
        <div className="py-3.5">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-red-400 fill-red-400" />{" "}
            using React, Supabase & Tailwind
          </p>
        </div>
      </div>
    </SettingSection>
  );
}
