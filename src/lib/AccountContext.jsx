"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ACCOUNTS, DEFAULT_ACCOUNT_ID, getAccountById } from "./accounts";

const AccountContext = createContext(null);

const STORAGE_KEY = "skilizee_active_account";

export function AccountProvider({ children }) {
  const [activeAccountId, setActiveAccountId] = useState(DEFAULT_ACCOUNT_ID);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ACCOUNTS[saved]) {
        setActiveAccountId(saved);
      }
    }
  }, []);

  const switchAccount = useCallback((accountId) => {
    if (!ACCOUNTS[accountId]) return;
    setActiveAccountId(accountId);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, accountId);
    }
  }, []);

  const activeAccount = getAccountById(activeAccountId);

  return (
    <AccountContext.Provider
      value={{
        activeAccount,
        activeAccountId,
        switchAccount,
        accounts: ACCOUNTS,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}

/**
 * Hook to get the current account's storage prefix.
 * Used by storage.js to scope localStorage keys.
 */
export function useAccountPrefix() {
  const { activeAccount } = useAccount();
  return activeAccount.storagePrefix;
}
