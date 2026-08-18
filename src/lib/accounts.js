/**
 * SkilizeeAI — Multi-Account Registry
 * 
 * Central source of truth for all managed accounts.
 * Each account has isolated storage, Meta credentials, and branding.
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
    // localStorage key prefix
    storagePrefix: "skilizee",
    // Environment variable prefix for Meta credentials
    metaEnvPrefix: "META",
    // Firestore document prefix for token storage
    firestorePrefix: "skillizee",
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
    storagePrefix: "ccis",
    metaEnvPrefix: "CCIS_META",
    firestorePrefix: "ccis",
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
