import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  TrendingUp,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useToast } from './Toast';
import { User } from '../types';

interface AuthPagesProps {
  onAuthSuccess: (token: string, user: User) => void;
}

const SECURITY_QUESTIONS = [
  'What is your pet’s name?',
  'What was the name of your elementary school?',
  'In what city were you born?',
  'What is your mother’s maiden name?',
  'What was your first car make/model?',
  'What is your favorite book?'
];

export default function AuthPages({ onAuthSuccess }: AuthPagesProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery States
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      showToast('success', 'Welcome back!', `Successfully logged in as ${response.data.user.name}.`);
      onAuthSuccess(response.data.token, response.data.user);
    } catch (err: any) {
      showToast('error', 'Login Failed', err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !securityQuestion || !securityAnswer) {
      showToast('warning', 'Incomplete Form', 'Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      showToast('warning', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        securityQuestion,
        securityAnswer
      });
      showToast('success', 'Registration Successful', 'Your smart expense portfolio is ready!');
      onAuthSuccess(response.data.token, response.data.user);
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.response?.data?.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRecoveryQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/forgot-password-question', { email });
      setRecoveryQuestion(response.data.securityQuestion);
      setMode('verify');
    } catch (err: any) {
      showToast('error', 'Failed', err.response?.data?.message || 'Could not retrieve security detail.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryAnswer || !newPassword) return;

    if (newPassword.length < 6) {
      showToast('warning', 'Weak Password', 'New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', {
        email,
        securityAnswer: recoveryAnswer,
        newPassword
      });
      showToast('success', 'Password Reset Complete', 'Please login using your new password.');
      setRecoveryAnswer('');
      setNewPassword('');
      setMode('login');
    } catch (err: any) {
      showToast('error', 'Verification Failed', err.response?.data?.message || 'Incorrect security question answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden" id="auth-page-container">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full filter blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10"
        id="auth-card"
      >
        {/* Logo Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-600/20 mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">SmartExpense</h2>
          <span className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">Financial Portfolio</span>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              id="login-panel"
            >
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-6">Sign In</h3>
              <form onSubmit={handleLogin} className="space-y-4.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="login-email-input"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      id="forgot-password-link"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      id="toggle-login-pwd-vis"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                  id="login-submit-btn"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  New to SmartExpense?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    id="switch-to-register-btn"
                  >
                    Create an Account
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              id="register-panel"
            >
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-6">Create Account</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="register-name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="register-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="register-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      id="toggle-register-pwd-vis"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Security question settings for easy offline reset */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Password Recovery Question
                  </div>
                  <div>
                    <select
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                      id="security-question-select"
                    >
                      {SECURITY_QUESTIONS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="Your recovery answer"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs text-slate-800 dark:text-slate-200"
                      id="security-answer-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                  id="register-submit-btn"
                >
                  {loading ? 'Creating Portfolio...' : 'Complete Sign Up'}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    id="switch-to-login-btn"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              id="forgot-panel"
            >
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6"
                id="forgot-back-btn"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
              
              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-2">Recover Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Enter your account email to retrieve your personalized security question and reset your credentials.
              </p>

              <form onSubmit={handleFetchRecoveryQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Registered Email</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="forgot-email-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                  id="forgot-submit-btn"
                >
                  {loading ? 'Retrieving Question...' : 'Verify Email'}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              id="verify-panel"
            >
              <button
                onClick={() => setMode('forgot')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6"
                id="verify-back-btn"
              >
                <ArrowLeft className="w-4 h-4" /> Retry Email
              </button>

              <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-2">Security Challenge</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Answer your security question below to set a new password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono tracking-widest uppercase font-bold">Your Security Question</span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1 flex items-start gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    {recoveryQuestion}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Answer</label>
                  <input
                    type="text"
                    required
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    placeholder="Enter your security answer"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                    id="recovery-answer-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white text-sm"
                      id="recovery-newpassword-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      id="toggle-recovery-pwd-vis"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                  id="recovery-submit-btn"
                >
                  {loading ? 'Verifying...' : 'Reset & Log In'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
