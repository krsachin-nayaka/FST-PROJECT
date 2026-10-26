import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { RiskCategory } from '../../types/index.ts';

interface RiskBadgeProps {
  category: RiskCategory;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ category, score, size = 'md' }) => {
  let colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (category === 'High') {
    colorStyles = 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse';
    Icon = ShieldAlert;
    label = 'High Risk';
  } else if (category === 'Medium') {
    colorStyles = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
    Icon = AlertTriangle;
    label = 'Medium Risk';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm transition-colors ${colorStyles} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
      {score !== undefined && (
        <span className="font-mono opacity-80 pl-1 border-l border-current/25">
          {score}/100
        </span>
      )}
    </span>
  );
};
