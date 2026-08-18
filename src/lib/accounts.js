/**
 * SkilizeeAI — Multi-Account Registry
 *
 * Central source of truth for all managed accounts.
 * Each account has isolated storage, Meta credentials, and branding.
 *
 * NOTE ON TAILWIND CLASSES:
 * Tailwind v4 scans source files statically — interpolated class names like
 * `bg-${accentColor}-50` are never generated. Every account therefore carries
 * fully-written class strings under `ui`, so the classes appear literally in
 * this file and survive the build.
 */

export const ACCOUNTS = {
  skillizee: {
    id: "skillizee",
    name: "Skilizee.io",
    shortName: "Skilizee",
    subtitle: "Social Suite",
    logo: "S",
    gradientFrom: "from-indigo-600",
    gradientVia: "via-purple-600",
    gradientTo: "to-pink-500",
    accentColor: "indigo",
    // Instagram handle this account manages (used by Dashboard / CampaignHub / Analyzer)
    defaultUsername: "skillizee.io",
    // localStorage key prefix
    storagePrefix: "skilizee",
    // Environment variable prefix for Meta credentials
    metaEnvPrefix: "META",
    ui: {
      brandSuffix: "text-indigo-600 dark:text-indigo-400",
      logoGlow: "shadow-indigo-500/15",
      switcher:
        "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/50",
      switcherItemActive:
        "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
      switcherCheck: "text-indigo-500",
      collapsedButton:
        "bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400",
    },
  },
  ccis: {
    id: "ccis",
    name: "CCIS",
    shortName: "CCIS",
    subtitle: "Social Suite",
    logo: "C",
    gradientFrom: "from-emerald-600",
    gradientVia: "via-teal-600",
    gradientTo: "to-cyan-500",
    accentColor: "emerald",
    defaultUsername: "ccis.india",
    storagePrefix: "ccis",
    metaEnvPrefix: "CCIS_META",
    ui: {
      brandSuffix: "text-emerald-600 dark:text-emerald-400",
      logoGlow: "shadow-emerald-500/15",
      switcher:
        "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
      switcherItemActive:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
      switcherCheck: "text-emerald-500",
      collapsedButton:
        "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400",
    },
  },
};

export const ACCOUNT_IDS = Object.keys(ACCOUNTS);
export const DEFAULT_ACCOUNT_ID = "skillizee";

/**
 * Get account config by ID. Falls back to skillizee if not found.
 */
export function getAccountById(accountId) {
  return ACCOUNTS[accountId] || ACCOUNTS[DEFAULT_ACCOUNT_ID];
}

/**
 * Normalize an untrusted account id (query param, OAuth state, request body)
 * to a known account. Unknown values fall back to the default account.
 */
export function resolveAccountId(accountId) {
  return ACCOUNTS[accountId] ? accountId : DEFAULT_ACCOUNT_ID;
}
