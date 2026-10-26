import React, { useState } from 'react';
import { Search, Loader2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { scanApi } from '../../api/client.ts';
import { ScanRecord } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface QuickAnalyzerProps {
  onScanComplete: (scan: ScanRecord) => void;
}

export const QuickAnalyzer: React.FC<QuickAnalyzerProps> = ({ onScanComplete }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      showToast('warning', 'Please enter a URL to analyze.');
      return;
    }

    try {
      setLoading(true);
      const scan = await scanApi.createScan(trimmed);
      showToast(
        scan.riskCategory === 'High' ? 'warning' : 'success',
        `Analysis complete: ${scan.riskCategory} Risk (${scan.riskScore}/100)`
      );
      setUrl('');
      onScanComplete(scan);
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message;
      showToast('error', msg || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (presetUrl: string) => {
    setUrl(presetUrl);
  };

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-teal-950/20 backdrop-blur-md p-6 shadow-xl shadow-teal-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base font-semibold text-white">Instant URL Risk Scanner</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic heuristic inspection without sending traffic to the target
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-teal-300">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Real-time evaluation</span>
        </div>
      </div>

      <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter web link (e.g., https://example.com or http://192.168.1.1/login)"
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors font-mono disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Inspect URL</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Preset shortcuts */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Quick Test:</span>
        <button
          type="button"
          onClick={() => setPreset('https://github.com/explore')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:border-slate-600 transition-colors"
        >
          Benign HTTPS
        </button>
        <button
          type="button"
          onClick={() => setPreset('http://192.168.1.1:8080/secure/bank/verify')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-colors"
        >
          IP + Credential Trap
        </button>
        <button
          type="button"
          onClick={() => setPreset('https://xn--pple-43d.com/signin')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-colors"
        >
          Homograph / Punycode
        </button>
      </div>
    </div>
  );
};
