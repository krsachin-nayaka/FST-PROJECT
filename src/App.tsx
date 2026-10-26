import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, NavTab } from './components/layout/Sidebar.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AnalyzerPage } from './pages/AnalyzerPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { AwarenessPage } from './pages/AwarenessPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToAnalyzer={() => setCurrentTab('analyzer')}
              onNavigateToHistory={() => setCurrentTab('history')}
            />
          )}

          {currentTab === 'analyzer' && (
            <AnalyzerPage onNavigateToHistory={() => setCurrentTab('history')} />
          )}

          {currentTab === 'history' && (
            <HistoryPage onNavigateToAnalyzer={() => setCurrentTab('analyzer')} />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage onNavigateToAnalyzer={() => setCurrentTab('analyzer')} />
          )}

          {currentTab === 'awareness' && <AwarenessPage />}

          {currentTab === 'about' && <AboutPage />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-3.5 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">PhishGuard</span>
            <span>— Developed by</span>
            <strong className="text-teal-400">K R SACHIN</strong>
            <span className="font-mono text-slate-400">(USN: 1NH23CS106)</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Course: <em>Full Stack Technologies</em> • Secure URL Evaluation System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}
