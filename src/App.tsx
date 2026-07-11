import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetManager from './components/BudgetManager';
import ProfileSettings from './components/ProfileSettings';
import TransactionModal from './components/TransactionModal';
import AuthPages from './components/AuthPages';
import { ToastProvider, useToast } from './components/Toast';
import { User, Transaction, Budget, Stats, Timeframe, TransactionTypeFilter } from './types';

// Root App layout component
function MainLayout() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Transaction Ledger state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date:desc');
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Budgets state
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);

  // Dashboard Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Edit / Add modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Check auth on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Setup default Axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // Update Dark Mode styling in DOM
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Auth helper
  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    showToast('info', 'Logged Out', 'You have been successfully logged out.');
  };

  // FETCH CORE STATISTICS
  const fetchStats = async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const response = await axios.get('/api/transactions/stats');
      setStats(response.data);
    } catch (e) {
      console.error('Stats fetch error:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  // FETCH DETAILED TRANSACTION HISTORY
  const fetchTransactions = async () => {
    if (!token) return;
    setTransactionsLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
        sortBy,
        search
      };

      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (timeframe !== 'all') {
        params.timeframe = timeframe;
        if (timeframe === 'custom') {
          params.startDate = startDate;
          params.endDate = endDate;
        }
      }

      const response = await axios.get('/api/transactions', { params });
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (e) {
      console.error('Transactions fetch error:', e);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // FETCH BUDGET LIMITS
  const fetchBudgets = async () => {
    if (!token) return;
    setBudgetsLoading(true);
    try {
      // Fetch budget lists for current active month
      const currentMonth = new Date().toISOString().substring(0, 7);
      const response = await axios.get(`/api/budgets?month=${currentMonth}`);
      setBudgets(response.data.budgets);
    } catch (e) {
      console.error('Budgets fetch error:', e);
    } finally {
      setBudgetsLoading(false);
    }
  };

  // Master Synchronizer triggered on views or page edits
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchTransactions();
      fetchBudgets();
    }
  }, [
    token, 
    page, 
    search, 
    timeframe, 
    startDate, 
    endDate, 
    typeFilter, 
    categoryFilter, 
    sortBy
  ]);

  // TRANSACTION ACTIONS
  const handleSaveTransaction = async (formData: Partial<Transaction>) => {
    try {
      if (formData.id) {
        // Edit Transaction
        await axios.put(`/api/transactions/${formData.id}`, formData);
        showToast('success', 'Transaction Updated', 'Your changes have been saved successfully.');
      } else {
        // Add Transaction
        const response = await axios.post('/api/transactions', formData);
        showToast('success', 'Transaction Recorded', 'New entry created successfully.');
        
        // Handle overspending budget alert returned from backend
        if (response.data.budgetAlert) {
          showToast('warning', 'Budget Limit Exceeded', response.data.budgetAlert.message);
        }
      }
      
      // Sync stats, transactions ledger and budgets
      fetchStats();
      fetchTransactions();
      fetchBudgets();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.response?.data?.message || 'Error saving transaction.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await axios.delete(`/api/transactions/${id}`);
      showToast('success', 'Transaction Deleted', 'Record has been removed.');
      fetchStats();
      fetchTransactions();
      fetchBudgets();
    } catch (err: any) {
      showToast('error', 'Deletion Failed', err.response?.data?.message || 'Error deleting transaction.');
    }
  };

  // BUDGET LIMITS ACTIONS
  const handleSetBudget = async (category: string, limit: number, month: string) => {
    try {
      const response = await axios.post('/api/budgets', { category, limit, month });
      showToast('success', 'Limit Configured', response.data.message);
      fetchBudgets();
      fetchStats();
    } catch (err: any) {
      showToast('error', 'Setup Failed', err.response?.data?.message || 'Error configuring budget limit.');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Delete this monthly spending target limit?')) return;
    try {
      await axios.delete(`/api/budgets/${id}`);
      showToast('success', 'Budget Limit Removed', 'Target has been deleted.');
      fetchBudgets();
      fetchStats();
    } catch (err: any) {
      showToast('error', 'Deletion Failed', err.response?.data?.message || 'Error deleting budget.');
    }
  };

  // PRINTING & REPORT GENERATION
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Navigate directly to download endpoint
    window.open('/api/transactions/export/csv', '_blank');
    showToast('success', 'CSV Generated', 'Your transaction ledger download has been initiated.');
  };

  if (!token) {
    return <AuthPages onAuthSuccess={handleAuthSuccess} />;
  }

  // Aggregate current month's overspent budget sectors for quick dashboard notifications
  const budgetsAlerts = budgets.filter(b => b.isExceeded);

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full" id="main-content-frame">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats}
            loading={statsLoading}
            onAddTransactionClick={() => { setSelectedTx(null); setIsModalOpen(true); }}
            onPrintClick={handlePrint}
            onExportCSVClick={handleExportCSV}
            budgetsAlerts={budgetsAlerts}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionList 
            transactions={transactions}
            pagination={pagination}
            loading={transactionsLoading}
            page={page}
            setPage={setPage}
            search={search}
            setSearch={setSearch}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onEditClick={(tx) => { setSelectedTx(tx); setIsModalOpen(true); }}
            onDeleteClick={handleDeleteTransaction}
            onExportCSVClick={handleExportCSV}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetManager 
            budgets={budgets}
            loading={budgetsLoading}
            onSetBudget={handleSetBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings user={user} />
        )}
      </main>

      {/* MODAL WINDOWS */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedTx(null); }}
        onSave={handleSaveTransaction}
        transaction={selectedTx}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainLayout />
    </ToastProvider>
  );
}
