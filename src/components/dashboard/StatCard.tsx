import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'teal' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'teal',
}) => {
  const accentClasses = {
    teal: 'border-teal-500/25 bg-teal-500/5 text-teal-400',
    emerald: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/25 bg-amber-500/5 text-amber-400',
    rose: 'border-rose-500/25 bg-rose-500/5 text-rose-400',
    cyan: 'border-cyan-500/25 bg-cyan-500/5 text-cyan-400',
  }[accentColor];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h4 className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${accentClasses} shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
