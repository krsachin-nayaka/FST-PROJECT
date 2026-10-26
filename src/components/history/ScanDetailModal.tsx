import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Globe,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react';
import { ScanRecord } from '../../types/index.ts';
import { Modal } from '../common/Modal.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import { ScoreGauge } from '../common/ScoreGauge.tsx';
import { IndicatorList } from '../analyzer/IndicatorList.tsx';

interface ScanDetailModalProps {
  scan: ScanRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({
  scan,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!scan) return null;

  const handleDelete = () => {
    if (confirmDelete) {
      if (onDelete) onDelete(scan._id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmDelete(false);
        onClose();
      }}
      title="Scan Inspection Report"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Summary Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <ScoreGauge score={scan.riskScore} category={scan.riskCategory} size={130} />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <RiskBadge category={scan.riskCategory} score={scan.riskScore} size="lg" />
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(scan.createdAt).toLocaleString()}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Destination Host
              </p>
              <h4 className="text-lg font-bold font-mono text-white break-all">
                {scan.hostname}
              </h4>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 font-mono">
                {scan.protocol === 'https:' ? (
                  <Lock className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Unlock className="w-3 h-3 text-rose-400" />
                )}
                {scan.protocol}
              </span>
              {scan.port && (
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  Port :{scan.port}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sanitized URL Representation */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Privacy-Sanitized URL (Sensitive Tokens Redacted)
          </label>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
            {scan.sanitizedUrl}
          </div>
        </div>

        {/* Source Provider Statuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Heuristic Engine:
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              {scan.sourceStatus?.heuristic || 'COMPLETED'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              Google Safe Browsing:
            </span>
            <span className="font-mono text-slate-300 font-medium">
              {scan.sourceStatus?.googleSafeBrowsing || 'NOT_CONFIGURED'}
            </span>
          </div>
        </div>

        {/* Indicator Breakdown */}
        {scan.indicators && scan.indicators.length > 0 && (
          <IndicatorList indicators={scan.indicators} />
        )}

        {/* Safety Recommendations */}
        {scan.recommendations && scan.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">
              Recommended Defensive Actions
            </h4>
            <div className="space-y-1.5">
              {scan.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-snug"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-500">Record ID: {scan._id}</span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  confirmDelete
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Confirm Permanent Delete?' : 'Delete'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
