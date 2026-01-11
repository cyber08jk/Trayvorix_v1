import { useState, ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import AIAssistant from '../ai/AIAssistant';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMinimized={isMinimized}
        toggleMinimize={() => setIsMinimized(!isMinimized)}
      />

      <main className={`transition-all duration-300 ease-in-out pt-16 ${isMinimized ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <AIAssistant />
    </div>

  );
}
