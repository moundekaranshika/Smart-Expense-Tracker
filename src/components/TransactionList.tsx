import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  FileSpreadsheet,
  Calendar,
  XCircle,
  Filter
} from 'lucide-react';
import { Transaction, Timeframe, TransactionTypeFilter } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  search: string;
  setSearch: (search: string) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  typeFilter: TransactionTypeFilter;
  setTypeFilter: (filter: TransactionTypeFilter) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onEditClick: (tx: Transaction) => void;
  onDeleteClick: (id: string) => void;
  onExportCSVClick: () => void;
}

const CATEGORIES = [
  'All',
  'Food',
  'Shopping',
  'Travel',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Investment',
  'Others'
];

export default function TransactionList({
  transactions,
  pagination,
  loading,
  page,
  setPage,
  search,
  setSearch,
  timeframe,
  setTimeframe,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  onEditClick,
  onDeleteClick,
  onExportCSVClick
}: TransactionListProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
      setPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch, setPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
    }
  };

  const handleSortToggle = () => {
    if (sortBy === 'date:desc') {
      setSortBy('date:asc');
    } else if (sortBy === 'date:asc') {
      setSortBy('amount:desc');
    } else if (sortBy === 'amount:desc') {
      setSortBy('amount:asc');
    } else {
      setSortBy('date:desc');
    }
    setPage(1);
  };

  const getSortLabel = () => {
    if (sortBy === 'date:desc') return 'Date (Newest)';
    if (sortBy === 'date:asc') return 'Date (Oldest)';
    if (sortBy === 'amount:desc') return 'Amount (Highest)';
    return 'Amount (Lowest)';
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearch('');
    setTimeframe('all');
    setStartDate('');
    setEndDate('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setSortBy('date:desc');
    setPage(1);
  };

  return (
    <div className="space-y-6" id="tx-list-view">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">Transaction Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit, search, and parse your financial inflows and outlays.</p>
        </div>
        <button
          onClick={onExportCSVClick}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          id="ledger-export-csv"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 no-print" id="filters-container">
        {/* Row 1: Search & Type */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by description, amount, payment mode..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
              id="search-box"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as TransactionTypeFilter); setPage(1); }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
              id="type-filter-select"
            >
              <option value="all">All Cash Flows</option>
              <option value="income">Inflows Only</option>
              <option value="expense">Outlays Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
              id="category-filter-select"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Timeframe & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Timeframe Selector */}
          <div>
            <select
              value={timeframe}
              onChange={(e) => { setTimeframe(e.target.value as Timeframe); setPage(1); }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
              id="timeframe-select"
            >
              <option value="all">All-Time History</option>
              <option value="weekly">Recent Week</option>
              <option value="monthly">Recent Month</option>
              <option value="yearly">Recent Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {timeframe === 'custom' ? (
            <div className="md:col-span-2 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none text-xs text-slate-900 dark:text-white"
                id="filter-start-date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none text-xs text-slate-900 dark:text-white"
                id="filter-end-date"
              />
            </div>
          ) : (
            <div className="md:col-span-2 flex items-center text-xs text-slate-400 gap-1 px-2">
              <Calendar className="w-4 h-4 text-slate-300" />
              Presets automatically filter outlays sequentially.
            </div>
          )}

          {/* Sorter and Clear action */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSortToggle}
              className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5"
              id="sort-toggle-btn"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {getSortLabel()}
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-2xl text-xs font-semibold flex items-center justify-center"
              id="clear-filters-btn"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED LEDGER TABLE */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm" id="ledger-table-card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 py-6" id="table-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center h-10 animate-pulse">
                  <div className="w-20 bg-slate-100 dark:bg-slate-800 h-4 rounded" />
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 rounded" />
                  <div className="w-24 bg-slate-100 dark:bg-slate-800 h-4 rounded" />
                  <div className="w-16 bg-slate-100 dark:bg-slate-800 h-4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id || tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10" id={`ledger-row-${tx.id || tx._id}`}>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">{tx.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">{tx.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">{tx.paymentMode}</td>
                    <td className={`py-3.5 px-4 font-mono font-bold text-right ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditClick(tx)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          id={`edit-ledger-btn-${tx.id || tx._id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(tx.id || tx._id || '')}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          id={`delete-ledger-btn-${tx.id || tx._id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <XCircle className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm">No transactions match your search filters.</p>
                        <button onClick={clearFilters} className="text-indigo-600 dark:text-indigo-400 underline font-semibold text-xs mt-1">
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION PANEL */}
        {pagination.pages > 1 && !loading && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 no-print" id="pagination-controls">
            <span className="text-xs text-slate-500">
              Showing page <span className="font-bold">{pagination.page}</span> of <span className="font-bold">{pagination.pages}</span> ({pagination.total} records)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                id="pagination-prev-btn"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                id="pagination-next-btn"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
