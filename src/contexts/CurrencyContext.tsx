import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@hooks/useAuth';
import { getUserProfile } from '@services/profile';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (user?.id) {
      getUserProfile(user.id)
        .then((data) => {
          setCurrency(data?.currency || 'USD');
        })
        .catch(() => {
          setCurrency('USD');
        });
    }
  }, [user]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
