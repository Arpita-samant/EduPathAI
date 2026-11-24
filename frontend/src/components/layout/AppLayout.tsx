import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-[#17191C]">
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AppHeader
          currentRoute={currentRoute}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 lg:px-10 py-5 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
