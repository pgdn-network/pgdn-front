import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NodeBannerProps } from '@/components/ui/custom/NodeBanner';

interface BannerContextType {
  banner: NodeBannerProps | null;
  setBanner: (banner: NodeBannerProps | null) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
};

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banner, setBanner] = useState<NodeBannerProps | null>(null);

  return (
    <BannerContext.Provider value={{ banner, setBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

export function useScopedBanner(banner: NodeBannerProps | null) {
  const { setBanner } = useBanner();
  useEffect(() => {
    setBanner(banner);
    return () => setBanner(null);
  }, [banner, setBanner]);
} 