import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  User as UserIcon,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onLogout
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Monthly Budgets', icon: PieChart },
    { id: 'profile', label: 'Security & Profile', icon: UserIcon },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 left-0 right-0 h-16 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 no-print" id="mobile-top-bar">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg text-indigo-600 dark:text-indigo-400">SmartExpense</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          id="menu-toggle-btn"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Slide-out */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
              id="sidebar-overlay"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col p-6 md:hidden"
              id="mobile-sidebar"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="font-display font-bold text-lg dark:text-white">SmartExpense</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  id="mobile-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile */}
              {user && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-display font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border dark:border-indigo-500/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent'
                      }`}
                      id={`nav-${item.id}-mobile`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Footer / Toggles */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  id="dark-mode-toggle-mobile"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                  {darkMode ? 'Light Theme' : 'Dark Theme'}
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20"
                  id="logout-btn-mobile"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Permanent Side Drawer) */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 p-6 no-print" id="desktop-sidebar">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-indigo-600 dark:bg-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">SmartExpense</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Premium Tracker</span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/50">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-display font-bold text-lg shrink-0 border border-transparent dark:border-slate-850">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate dark:text-white leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500 truncate dark:text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 border border-transparent ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent'
                }`}
                id={`nav-${item.id}-desktop`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Footers */}
        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800/80 px-1">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-transparent transition-all duration-200"
            id="dark-mode-toggle-desktop"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-350 transition-all duration-200"
            id="logout-btn-desktop"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout Account
          </button>
        </div>
      </aside>
    </>
  );
}
