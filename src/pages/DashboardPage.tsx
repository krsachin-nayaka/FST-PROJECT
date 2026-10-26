import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  ExternalLink,
  RefreshCw,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { scanApi } from '../api/client.ts';
import { AnalyticsData, ScanRecord } from '../types/index.ts';
import { StatCard } from '../components/dashboard/StatCard.tsx';
import { QuickAnalyzer } from '../components/dashboard/QuickAnalyzer.tsx';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { ScanDetailModal } from '../components/history/ScanDetailModal.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface DashboardPageProps {
  onNavigateToAnalyzer: () => void;
  onNavigateToHistory: () => void;
}

const CATEGORY_COLORS = {
  Low: '#10b981', // emerald
  Medium: '#f59e0b', // amber
  High: '#f43f5e', // rose
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToAnalyzer,
  onNavigateToHistory,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await scanApi.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      showToast('error', 'Failed to fetch dashboard statistics from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScanComplete = (newScan: ScanRecord) => {
    setSelectedScan(newScan);
    loadData();
  };

  const pieData = analytics?.riskDistribution?.map((item) => ({
    name: `${item.category} Risk`,
    value: item.count,
    color: CATEGORY_COLORS[item.category] || '#06b6d4',
  })) || [];

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-teal-950/40 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 p-0.5 shrink-0 flex items-center justify-center shadow-md shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  PhishGuard Intelligence Hub
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold">
                  Full Stack Project
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Student Developer:{' '}
                  <strong className="text-white font-semibold">K R SACHIN</strong>
                </span>
                <span className="text-teal-400 font-mono">
                  USN: <strong>1NH23CS106</strong>
                </span>
                <span className="text-slate-400">
                  Course: <em>Full Stack Technologies</em>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <button
              onClick={onNavigateToAnalyzer}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Analyze URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scanned URLs"
          value={loading ? '...' : analytics?.totalScans ?? 0}
          subtitle="Database Persisted Records"
          icon={<Activity className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          title="Low Risk (Clean)"
          value={loading ? '...' : analytics?.lowRiskCount ?? 0}
          subtitle="Safe baseline characteristics"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Medium Risk"
          value={loading ? '...' : analytics?.mediumRiskCount ?? 0}
          subtitle="Requires heightened caution"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatCard
          title="High Risk (Phishing Traps)"
          value={loading ? '...' : analytics?.highRiskCount ?? 0}
          subtitle="Multiple critical heuristic triggers"
          icon={<ShieldAlert className="w-5 h-5" />}
          accentColor="rose"
        />
      </div>

      {/* Quick Analyzer Box */}
      <QuickAnalyzer onScanComplete={handleScanComplete} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Risk Category Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across analyzed URLs</p>
            </div>
            <span className="text-xs font-mono text-teal-400">
              Avg: {analytics?.averageRiskScore ?? 0}/100
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            {pieData.some((p) => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-500">
                No scan records available to visualize
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low ({analytics?.lowRiskCount || 0})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Medium ({analytics?.mediumRiskCount || 0})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              High ({analytics?.highRiskCount || 0})
            </span>
          </div>
        </div>

        {/* Scan Velocity & Activity Over Time */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Scan Activity & Velocity</h3>
              <p className="text-xs text-slate-400">Daily URL inspections recorded in database</p>
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-56 my-2">
            {analytics?.scansOverTime && analytics.scansOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.scansOverTime}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="Scans"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Activity timeline will generate as URLs are scanned
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Deterministic Heuristic Aggregation</span>
            <span className="font-mono text-cyan-400">Live Trend Metric</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-semibold text-white">Recent Scan Activity</h3>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Full History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-y border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Hostname</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3">Indicators</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analytics.recentActivity.map((scan) => {
                  const flagCount = scan.indicators?.filter((i) => i.triggered).length || 0;
                  return (
                    <tr
                      key={scan._id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedScan(scan)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-medium font-mono text-slate-200 truncate max-w-[220px]">
                          {scan.hostname}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[260px] font-mono">
                          {scan.sanitizedUrl}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge
                          category={scan.riskCategory}
                          score={scan.riskScore}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-300">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            flagCount > 0
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {flagCount} flagged
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScan(scan);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No scans recorded yet. Use the URL Scanner above to run your first evaluation.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ScanDetailModal
        scan={selectedScan}
        isOpen={Boolean(selectedScan)}
        onClose={() => setSelectedScan(null)}
        onDelete={() => {
          setSelectedScan(null);
          loadData();
        }}
      />
    </div>
  );
};
