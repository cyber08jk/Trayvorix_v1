import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is on a demo route or came from demo login
    const isOnDemoRoute = location.pathname.startsWith('/demo');
    const cameFromDemo = sessionStorage.getItem('demoMode') === 'true';
    
    if (isOnDemoRoute) {
      setIsDemoMode(true);
      sessionStorage.setItem('demoMode', 'true');
    } else if (user) {
      // If user is authenticated, they're not in demo mode
      setIsDemoMode(false);
      sessionStorage.removeItem('demoMode');
    } else if (cameFromDemo) {
      // Keep demo mode if they navigated from demo
      setIsDemoMode(true);
    }
  }, [location.pathname, user]);

  const setDemoMode = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      sessionStorage.setItem('demoMode', 'true');
    } else {
      sessionStorage.removeItem('demoMode');
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
