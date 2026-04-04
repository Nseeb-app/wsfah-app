"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AdContextType {
  showAds: boolean;
  userTier: string;
}

const AdContext = createContext<AdContextType>({ showAds: true, userTier: "free" });

export function useAds() {
  return useContext(AdContext);
}

export default function AdProvider({ children }: { children: React.ReactNode }) {
  const [userTier, setUserTier] = useState("free");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUserTier(data.subscriptionTier || "free");
      })
      .catch(() => {
        // Not logged in = free tier = show ads
      });
  }, []);

  // Show ads only for free tier users
  const showAds = userTier === "free";

  return (
    <AdContext.Provider value={{ showAds, userTier }}>
      {children}
    </AdContext.Provider>
  );
}
