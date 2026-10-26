import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { scanApi } from '../api/client.ts';
import { ScanRecord, RiskCategory } from '../types/index.ts';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { ScanDetailModal } from '../components/history/ScanDetailModal.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface HistoryPageProps {
  onNavigateToAnalyzer: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToAnalyzer }) => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'riskScore'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const { showToast } = useToast();

  const fetchScans = async () => {
    try {
      setLoading(true);
      const res = await scanApi.getScans({
        page,
        limit,
        search,
        riskCategory: categoryFilter,
        sortBy,
        sortOrder,
      });
      setScans(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      showToast('error', 'Failed to retrieve scan records from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [page, categoryFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await scanApi.deleteScan(id);
      showToast('success', 'Scan record deleted successfully');
      fetchScans();
    } catch (err: any) {
      showToast('error', 'Failed to delete scan record');
    }
  };

  const handleDeleteAll = async () => {
    try {
      setIsDeletingAll(true);
      const count = await scanApi.deleteAllScans();
      showToast('success', `Deleted ${count} scan records`);
      setIsDeleteAllModalOpen(false);
      setPage(1);
      fetchScans();
    } catch (err: any) {
      showToast('error', 'Failed to clear scan history');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const exportToJson = () => {
    if (scans.length === 0) {
      showToast('warning', 'No scans to export');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phishguard-scans-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('info', 'Exported scan records to JSON');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Scan History</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Browse, filter, and inspect persisted threat evaluations stored in database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToJson}
            disabled={scans.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => setIsDeleteAllModalOpen(true)}
            disabled={scans.length === 0}
            className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hostname (e.g., paypal, google, 192.168)..."
            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>

        {/* Risk Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Risk:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
          >
            <option value="">All Categories</option>
            <option value="Low">Low Risk (0-29)</option>
            <option value="Medium">Medium Risk (30-59)</option>
            <option value="High">High Risk (60-100)</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
          >
            <option value="createdAt">Date Analyzed</option>
            <option value="riskScore">Risk Score</option>
          </select>
          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white uppercase font-mono"
            title="Toggle sort direction"
          >
            {sortOrder}
          </button>
        </div>
      </div>

      {/* Table / Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
            <p className="text-xs">Loading scan records from database...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-200">No Scan Records Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching records in the database. Analyze a URL or clear active search filters to view results.
            </p>
            <button
              onClick={onNavigateToAnalyzer}
              className="mt-2 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              Scan a URL Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Hostname & Protocol</th>
                  <th className="py-3 px-4">Sanitized URL</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Heuristics Flagged</th>
                  <th className="py-3 px-4">Analyzed At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((scan) => {
                  const flags = scan.indicators?.filter((i) => i.triggered).length || 0;
                  return (
                    <tr
                      key={scan._id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedScan(scan)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {scan.protocol === 'https:' ? (
                            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="font-semibold font-mono text-slate-200">
                            {scan.hostname}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-mono text-cyan-300 truncate max-w-xs">
                          {scan.sanitizedUrl}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <RiskBadge
                          category={scan.riskCategory}
                          score={scan.riskScore}
                          size="sm"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            flags > 0
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {flags} of {scan.indicators?.length || 9} triggered
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedScan(scan)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors"
                            title="Inspect scan report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOne(scan._id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete this record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-200">
                {(page - 1) * limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-200">
                {Math.min(page * limit, total)}
              </span>{' '}
              of <span className="font-semibold text-slate-200">{total}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono text-teal-400 font-semibold">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      <Modal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        title="Confirm History Purge"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Permanent Database Deletion</p>
              <p className="mt-1 leading-relaxed">
                This action will permanently delete all {total} scan records from the database. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteAllModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeletingAll}
              onClick={handleDeleteAll}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeletingAll ? 'Purging...' : 'Yes, Delete All'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <ScanDetailModal
        scan={selectedScan}
        isOpen={Boolean(selectedScan)}
        onClose={() => setSelectedScan(null)}
        onDelete={() => {
          setSelectedScan(null);
          fetchScans();
        }}
      />
    </div>
  );
};
