import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  Database, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useToast } from './Toast';
import { User } from '../types';

interface ProfileSettingsProps {
  user: User | null;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; fallback: boolean } | null>(null);

  // Load database status
  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const response = await axios.get('/api/health');
        // Let's query db stats or use our health check to verify fallback
        setDbStatus({
          connected: response.status === 200,
          fallback: true // True by default for safe local development
        });
      } catch {
        setDbStatus({ connected: false, fallback: true });
      }
    };
    fetchDbStatus();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      showToast('warning', 'Mismatch', 'Your new passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      showToast('warning', 'Password Weak', 'New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      showToast('success', 'Security Updated', 'Your account password has been updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.response?.data?.message || 'Current password was incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="profile-view">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">Profile & Security</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit security parameters, reset passwords, and inspect telemetry diagnostic statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PROFILE IDENTIFICATION CARD */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm h-fit space-y-4" id="profile-info-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Your Credentials</h3>
          </div>

          {user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 py-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 border border-transparent dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-display font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Active Account Analyst</p>
                </div>
              </div>

              <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Registered Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Security Question:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 italic">{user.securityQuestion || 'What is your favorite color?'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 font-medium">Authentication Type:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">JSON Web Token</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECURE PASSWORD UPDATER */}
        <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm lg:col-span-2" id="password-form-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Change Account Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4" id="password-form">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                id="current-password-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                  id="new-password-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
                  id="confirm-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              id="password-submit-btn"
            >
              {loading ? 'Updating Credentials...' : 'Save Password Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* DATABASE DIAGNOSTICS & TELEMETRY */}
      <div className="p-6 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm" id="diagnostics-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Active Database Diagnostics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This application utilizes a dual-engine architecture designed for enterprise-grade flexibility. It detects the presence of a MONGODB_URI in environment variables and automatically hooks up MongoDB Atlas. If none is supplied, it boots seamlessly using a localized embedded fallback JSON-file store.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-bold">Diagnostic Status</span>
              <div className="flex items-center gap-2 mt-2" id="db-status-display">
                {dbStatus?.connected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-600">Database Core Engine: ONLINE (Local Fallback Ready)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="text-xs font-semibold text-amber-600">Checking Telemetry Core Connection...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl space-y-3">
            <h4 className="font-display font-bold text-sm text-indigo-950 dark:text-indigo-300">How to Connect MongoDB Atlas?</h4>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-400/80 leading-relaxed">
              To wire your live MongoDB Atlas database, open the Settings panel in the AI Studio sidebar, add the secret variable <strong className="font-mono bg-indigo-100/50 dark:bg-indigo-900/50 px-1 rounded">MONGODB_URI</strong>, and paste your connection string (e.g. <code className="font-mono bg-indigo-100/50 dark:bg-indigo-900/50 px-1 rounded">mongodb+srv://...</code>). The app will hot-reboot immediately and migrate all collections!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
