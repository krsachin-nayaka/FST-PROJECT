import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { scanApi } from '../api/client.ts';
import { AnalyticsData } from '../types/index.ts';
import { StatCard } from '../components/dashboard/StatCard.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AnalyticsPageProps {
  onNavigateToAnalyzer: () => void;
}

const CATEGORY_COLORS = {
  Low: '#10b981', // emerald
  Medium: '#f59e0b', // amber
  High: '#f43f5e', // rose
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigateToAnalyzer }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await scanApi.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      showToast('error', 'Failed to retrieve analytics data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const total = analytics?.totalScans || 0;
  const pieData = analytics?.riskDistribution?.map((item) => ({
    name: `${item.category} Risk`,
    value: item.count,
    color: CATEGORY_COLORS[item.category] || '#06b6d4',
  })) || [];

  const indicatorData = analytics?.topIndicators?.map((ind) => ({
    name: ind.name.length > 25 ? ind.name.slice(0, 25) + '...' : ind.name,
    fullName: ind.name,
    count: ind.count,
    percentage: ind.percentage,
  })) || [];

  const safePercentage = total > 0 ? Math.round(((analytics?.lowRiskCount || 0) / total) * 100) : 0;
  const threatPercentage = total > 0 ? Math.round(((analytics?.highRiskCount || 0) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Database Threat Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated intelligence derived from real stored scan evaluations.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all self-start sm:self-center cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans Processed"
          value={loading ? '...' : total}
          subtitle="Indexed in database"
          icon={<Activity className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          title="Average Risk Score"
          value={loading ? '...' : `${analytics?.averageRiskScore ?? 0} / 100`}
          subtitle="Heuristic weighted average"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="teal"
        />
        <StatCard
          title="Safe Ratio (Low Risk)"
          value={loading ? '...' : `${safePercentage}%`}
          subtitle={`${analytics?.lowRiskCount || 0} benign targets`}
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Threat Ratio (High Risk)"
          value={loading ? '...' : `${threatPercentage}%`}
          subtitle={`${analytics?.highRiskCount || 0} critical traps`}
          icon={<ShieldAlert className="w-5 h-5" />}
          accentColor="rose"
        />
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Analytics Data Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Scan records are required to calculate threat distributions and timelines.
          </p>
          <button
            onClick={onNavigateToAnalyzer}
            className="px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            Run Your First Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Category Distribution */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Risk Category Composition</h3>
              <p className="text-xs text-slate-400">Proportion of Low, Medium, and High threat records</p>
            </div>

            <div className="h-64 my-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
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
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[11px] text-emerald-400 block font-medium">Low Risk</span>
                <span className="text-base font-bold font-mono text-emerald-300">
                  {analytics?.lowRiskCount || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[11px] text-amber-400 block font-medium">Medium</span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {analytics?.mediumRiskCount || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[11px] text-rose-400 block font-medium">High Risk</span>
                <span className="text-base font-bold font-mono text-rose-300">
                  {analytics?.highRiskCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Scan Volume & Average Score */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Daily Scan Volume</h3>
                <p className="text-xs text-slate-400">Timeline of security evaluations</p>
              </div>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-64 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics?.scansOverTime || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#analyticsGradient)"
                    name="Daily Scans"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Database Query: Aggregated Grouping</span>
              <span className="font-mono text-cyan-400 font-semibold">14-Day Velocity</span>
            </div>
          </div>

          {/* Most Frequently Triggered Indicators Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl">
            <div className="pb-3 mb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Most Frequently Triggered Indicators
                </h3>
                <p className="text-xs text-slate-400">
                  Ranking of heuristic security violations across scanned URLs
                </p>
              </div>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>

            {indicatorData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={indicatorData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      width={160}
                    />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} scans (${item.payload.percentage}%)`,
                        item.payload.fullName,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#14b8a6"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                No heuristic violations detected in existing records.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
