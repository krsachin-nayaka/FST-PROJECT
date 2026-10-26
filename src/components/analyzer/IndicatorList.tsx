import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { IndicatorResult } from '../../types/index.ts';

interface IndicatorListProps {
  indicators: IndicatorResult[];
}

export const IndicatorList: React.FC<IndicatorListProps> = ({ indicators }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const triggeredCount = indicators.filter((i) => i.triggered).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Heuristic Security Indicators
          </h4>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {triggeredCount} of {indicators.length} Flagged
        </span>
      </div>

      <div className="grid gap-2.5">
        {indicators.map((ind) => {
          const isExpanded = expandedId === ind.indicatorId;
          return (
            <div
              key={ind.indicatorId}
              onClick={() => toggleExpand(ind.indicatorId)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                ind.triggered
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {ind.triggered ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {ind.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {ind.indicatorId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {ind.triggered ? (
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      +{ind.scoreContribution} pts
                    </span>
                  ) : (
                    <span className="text-xs font-medium font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Clear (0 pts)
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-300 p-0.5"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Explanation */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg">
                  <p className="font-semibold text-slate-200 mb-1">
                    {ind.triggered ? 'Triggered Finding:' : 'Security Analysis:'}
                  </p>
                  <p>{ind.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
