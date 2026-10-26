import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  History,
  BarChart3,
  BookOpen,
  Info,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'analyzer' | 'history' | 'analytics' | 'awareness' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'URL Analyzer', icon: ShieldAlert },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
    { id: 'awareness', label: 'Awareness & Quiz', icon: BookOpen },
    { id: 'about', label: 'About & Credits', icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950/95 lg:bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-4 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Header in Sidebar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 lg:hidden">
            <span className="font-bold text-slate-100 text-sm">Navigation</span>
            <button
              onClick={onClose}
              className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400"
            >
              Close
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? 'text-teal-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Project Author</span>
            </div>
            <p className="text-slate-200 font-medium">K R SACHIN</p>
            <p className="font-mono text-[11px] text-teal-400">1NH23CS106</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Full Stack Technologies</p>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-mono">
            PhishGuard Core v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};
