import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Percent,
  Plus, 
  FileDown, 
  Printer, 
  AlertTriangle,
  Coins
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Stats, Transaction } from '../types';

interface DashboardProps {
  stats: Stats | null;
  loading: boolean;
  onAddTransactionClick: () => void;
  onPrintClick: () => void;
  onExportCSVClick: () => void;
  budgetsAlerts: Array<{ category: string; limit: number; spent: number }>;
}

const PIE_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#64748b'  // Slate
];

export default function Dashboard({
  stats,
  loading,
  onAddTransactionClick,
  onPrintClick,
  onExportCSVClick,
  budgetsAlerts
}: DashboardProps) {

  // Skeletons while loading
  if (loading || !stats) {
    return (
      <div className="space-y-6" id="dashboard-skeleton">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center h-12">
          <div className="h-8 bg-slate-200 dark:bg-slate-900 rounded-lg w-48 animate-pulse" />
          <div className="h-10 bg-slate-200 dark:bg-slate-900 rounded-lg w-32 animate-pulse" />
        </div>

        {/* Aggregates Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl h-32 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-28" />
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl h-80 animate-pulse" />
          <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  const summary = stats.summary;
  const recent = stats.recentTransactions;
  const trends = stats.monthlyTrends;
  const categories = stats.categoryDistribution;

  // Percentage calculations
  const isHigherThanLastMonth = summary.currentMonthExpenses > summary.prevMonthExpenses;
  const percentChange = summary.prevMonthExpenses > 0 
    ? Math.abs(((summary.currentMonthExpenses - summary.prevMonthExpenses) / summary.prevMonthExpenses) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6" id="dashboard-content">
      {/* Welcome & CTA Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">Financial Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time stats, cash flow trends, and budget telemetry alerts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCSVClick}
            className="px-4 py-2.5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            id="export-csv-btn"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={onPrintClick}
            className="px-4 py-2.5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            id="print-report-btn"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={onAddTransactionClick}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-2xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            id="dashboard-add-tx-btn"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* OVERSPENDING ALERT BAR */}
      {budgetsAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3 no-print" id="dashboard-budget-alerts">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-300 font-display">Monthly Spending Limits Alert</h4>
            <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1">
              {budgetsAlerts.map((b, idx) => (
                <p key={idx}>
                  ⚠️ Overspent in <span className="font-bold">{b.category}</span>: Outlay is <span className="font-mono font-bold">${b.spent}</span>, which exceeds your monthly limit of <span className="font-mono font-bold">${b.limit}</span>!
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BENTO GRID AGGREGATES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="aggregates-grid">
        {/* Total Balance */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/85 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Balance</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            ${summary.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Net capital after outlays
          </p>
        </div>

        {/* Total Income */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/85 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            ${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Active inflows recorded
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/85 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            ${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className={`text-xs font-semibold flex items-center gap-1 mt-2 ${
            isHigherThanLastMonth ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {isHigherThanLastMonth ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                {percentChange}% more than last month
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3.5 h-3.5" />
                {percentChange}% less than last month
              </>
            )}
          </div>
        </div>

        {/* Savings Efficiency */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/85 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Savings Rate</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            {summary.savings}%
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Percentage of income saved
          </p>
        </div>
      </div>

      {/* DUAL CHARTING CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend line: Income vs Expense bar area chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Cash Flow Trends</h3>
          <div className="h-68 w-full" id="trend-chart-container">
            {trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly transactions recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="opacity-20 dark:stroke-slate-800" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: '#1e293b',
                      borderRadius: '16px',
                      fontSize: '11px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }} 
                  />
                  <Area type="monotone" dataKey="income" name="Inflow" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Outflow" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown (Donut Chart) */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Category Distribution</h3>
          <div className="h-44 w-full relative" id="category-pie-container">
            {categories.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense transactions recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value) => [`$${value}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Legends */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-1.5 max-h-32 pr-1" id="pie-legends">
            {categories.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="font-medium truncate max-w-[100px]">{item.category}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${item.value.toFixed(2)}</span>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-center text-slate-400 py-4">No categories spent.</p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS LIST (Top 5) */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm" id="dashboard-recent-transactions">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Recent Outlays & Incomes</h3>
          <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">Live feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {recent.map((tx) => (
                <tr key={tx.id || tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20" id={`recent-tx-row-${tx.id || tx._id}`}>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{tx.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{tx.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{tx.paymentMode}</td>
                  <td className={`py-3 px-4 font-mono font-bold text-right ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No transactions recorded yet. Click &quot;Add Record&quot; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
