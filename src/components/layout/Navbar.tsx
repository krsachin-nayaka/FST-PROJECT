import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Moon,
  Sun,
  Server,
  User,
  GraduationCap,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { scanApi } from '../../api/client.ts';
import { HealthData } from '../../types/index.ts';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    let mounted = true;
    scanApi
      .getHealth()
      .then((data) => {
        if (mounted) setHealth(data);
      })
      .catch((err) => {
        console.warn('Health check warning:', err.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-white text-lg">
                PhishGuard
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent URL Risk Analyzer & Cyber Defense
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Student Badge & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Student Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 shadow-inner">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div className="leading-tight text-left">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span>K R SACHIN</span>
              <span className="text-teal-400 font-mono text-[10px] px-1 bg-teal-950/60 rounded border border-teal-800/40">
                1NH23CS106
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              Full Stack Technologies
            </p>
          </div>
        </div>

        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${
              health ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
            }`}
          />
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>{health ? health.database.provider.replace('-', ' ') : 'connecting...'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>
    </header>
  );
};
