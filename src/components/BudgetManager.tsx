import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Budget } from '../types';

interface BudgetManagerProps {
  budgets: Budget[];
  loading: boolean;
  onSetBudget: (category: string, limit: number, month: string) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

const CATEGORIES = [
  'All', // Overall spending
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

export default function BudgetManager({
  budgets,
  loading,
  onSetBudget,
  onDeleteBudget
}: BudgetManagerProps) {
  const [category, setCategory] = useState('All');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(() => new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) < 0) return;

    setSubmitting(true);
    try {
      await onSetBudget(category, parseFloat(limit), month);
      setLimit('');
    } catch (e) {
      console.error('Error saving budget limit:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Convert budget stats into suitable structure for Recharts Bar Chart
  const chartData = budgets.map(b => ({
    name: b.category === 'All' ? 'Overall' : b.category,
    Limit: b.limit,
    Spent: b.spent
  }));

  return (
    <div className="space-y-6" id="budget-view">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">Budget Telemetry</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure limits per category and track real-time overspending alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
            id="budget-month-select"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BUDGET CREATION / UPDATE CARD */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm h-fit" id="budget-form-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Configure Limit</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="budget-form">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category Segment</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                id="budget-category-select"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'Overall Monthly Limit (All)' : cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Limit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white font-mono font-bold"
                id="budget-limit-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              id="budget-submit-btn"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Updating...' : 'Set Spending Limit'}
            </button>
          </form>

          {/* Quick Info Box */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex gap-1.5 items-start">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>Setting a limit for a category that already has one will update the existing parameter.</p>
            </div>
            <div className="flex gap-1.5 items-start">
              <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>&quot;Overall&quot; tracking encompasses the complete aggregate of monthly expense flows.</p>
            </div>
          </div>
        </div>

        {/* COMPARISON BAR GRAPH */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col" id="budget-chart-card">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Budget vs. Outlay</h3>
          <div className="flex-1 min-h-64" id="budget-chart-container">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active budget segments configured for {month}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="opacity-20 dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
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
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Limit" name="Budget Limit" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" name="Actual Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED BUDGET METERS */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm" id="budget-meters-card">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4">Tracking Segments</h3>
        
        {loading ? (
          <div className="space-y-4 py-4" id="budget-meters-skeleton">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="budget-meters-grid">
            {budgets.map((b) => {
              const isOver = b.isExceeded;
              const barWidth = Math.min(100, b.percentSpent);
              const barColor = isOver 
                ? 'bg-rose-500' 
                : b.percentSpent > 85 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500';

              return (
                <div 
                  key={b.id || b._id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isOver 
                      ? 'border-rose-100 bg-rose-50/20 dark:border-rose-950/40 dark:bg-rose-950/10' 
                      : 'border-slate-100 bg-slate-50/35 dark:border-slate-800/80 dark:bg-slate-900/10'
                  }`}
                  id={`budget-card-${b.id || b._id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">{month} Segment</span>
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">{b.category === 'All' ? 'Overall Budget' : b.category}</h4>
                    </div>
                    <button
                      onClick={() => onDeleteBudget(b.id || b._id || '')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      id={`delete-budget-btn-${b.id || b._id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Meters Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Spent: <strong className="font-mono text-slate-900 dark:text-white">${b.spent}</strong> of ${b.limit}
                      </span>
                      <span className={`font-mono font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {b.percentSpent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold">
                        {isOver ? (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Exceeded limit
                          </span>
                        ) : b.percentSpent > 85 ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Nearing threshold limit
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Budget secure
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Remaining: <strong className="font-mono text-slate-600 dark:text-slate-200">${b.remaining}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {budgets.length === 0 && (
              <div className="col-span-2 py-8 text-center text-slate-400 text-sm">
                No monthly spending targets defined yet. Set category parameters above!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
