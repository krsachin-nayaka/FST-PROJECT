import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Link2,
  Lock,
  Unlock,
  Radio,
  FileCheck,
  History,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { scanApi } from '../api/client.ts';
import { ScanRecord } from '../types/index.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { ScoreGauge } from '../components/common/ScoreGauge.tsx';
import { IndicatorList } from '../components/analyzer/IndicatorList.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AnalyzerPageProps {
  onNavigateToHistory: () => void;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({ onNavigateToHistory }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<ScanRecord | null>(null);
  const { showToast } = useToast();

  const validateInput = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setValidationError('URL cannot be empty');
      return false;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setValidationError('Protocol must be http:// or https://');
        return false;
      }
      if (!parsed.hostname) {
        setValidationError('Missing valid hostname');
        return false;
      }
      setValidationError(null);
      return true;
    } catch {
      setValidationError('Invalid URL syntax. Ensure you include http:// or https://');
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUrl(val);
    if (val.trim()) {
      validateInput(val);
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput(inputUrl)) return;

    try {
      setLoading(true);
      const scan = await scanApi.createScan(inputUrl.trim());
      setCurrentScan(scan);
      showToast(
        scan.riskCategory === 'High' ? 'warning' : 'success',
        `Analysis complete: ${scan.riskCategory} Risk (${scan.riskScore}/100)`
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze URL';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: string) => {
    setInputUrl(preset);
    setValidationError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('info', 'Sanitized URL copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Intelligent URL Risk Analyzer
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Perform deterministic multi-heuristic inspection on suspect URLs without accessing external target servers.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Target Web URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={handleInputChange}
                placeholder="https://example.com or http://192.168.1.10:8080/account/login?token=xyz"
                disabled={loading}
                className={`w-full pl-10 pr-24 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors font-mono disabled:opacity-60 ${
                  validationError
                    ? 'border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                    : 'border-slate-700 focus:border-teal-400 focus:ring-1 focus:ring-teal-400'
                }`}
              />
              <button
                type="submit"
                disabled={loading || !inputUrl.trim() || Boolean(validationError)}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            {validationError && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {validationError}
              </p>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Quick Scenarios:</span>
            <button
              type="button"
              onClick={() => loadPreset('https://github.com/security')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              Legitimate HTTPS
            </button>
            <button
              type="button"
              onClick={() => loadPreset('http://insecure-portal.net/update')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-colors"
            >
              Insecure HTTP
            </button>
            <button
              type="button"
              onClick={() => loadPreset('https://xn--pple-43d.com/recovery/verify-id')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-colors"
            >
              Punycode Spoofing
            </button>
            <button
              type="button"
              onClick={() =>
                loadPreset(
                  'http://192.168.1.1:8080/secure/bank/verify-account?token=supersecret123&auth=active'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-colors"
            >
              High-Risk IP Trap
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {currentScan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Top Score Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreGauge
                score={currentScan.riskScore}
                category={currentScan.riskCategory}
                size={150}
              />

              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <RiskBadge
                    category={currentScan.riskCategory}
                    score={currentScan.riskScore}
                    size="lg"
                  />
                  <span className="text-xs font-mono text-slate-400">
                    Category: {currentScan.riskCategory} Risk
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Target Hostname
                  </p>
                  <h3 className="text-xl font-bold font-mono text-white break-all">
                    {currentScan.hostname}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono flex items-center gap-1.5">
                    {currentScan.protocol === 'https:' ? (
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    {currentScan.protocol}
                  </span>
                  {currentScan.port && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                      Port :{currentScan.port}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                    ID: {currentScan._id}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onNavigateToHistory}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>View in History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sanitized URL Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-400" />
                Privacy-Sanitized URL Representation
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(currentScan.sanitizedUrl)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
              {currentScan.sanitizedUrl}
            </div>
            <p className="text-[11px] text-slate-500">
              * Sensitive tokens, credentials, and URL query keys matching security parameters have been safely redacted prior to persistence.
            </p>
          </div>

          {/* Source Statuses & Provider Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Heuristic Analysis Engine</p>
                <p className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                  Status: {currentScan.sourceStatus?.heuristic || 'COMPLETED'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Google Safe Browsing API</p>
                <p className="text-sm font-semibold text-cyan-300 font-mono mt-0.5">
                  {currentScan.sourceStatus?.googleSafeBrowsing || 'NOT_CONFIGURED'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Radio className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Heuristic Indicator Breakdown */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl">
            <IndicatorList indicators={currentScan.indicators} />
          </div>

          {/* Safety Recommendations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Recommended Safety Actions</h3>
            </div>
            <div className="grid gap-2">
              {currentScan.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
