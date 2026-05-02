import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Stethoscope, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { loginWithGoogle, auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('pending_role', role);
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('pending_role', role);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Manual auth error:', err.code);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase. Please enable it in the console.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Try signing in.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError('Authentication failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-gray-200/50"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Shield size={32} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">MedVault</h1>
          <p className="mt-2 text-sm text-gray-500">Your secure digital health portal.</p>
        </div>

        <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
          <button
            id="role-patient"
            onClick={() => setRole('patient')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User size={18} />
            Patient
          </button>
          <button
            id="role-doctor"
            onClick={() => setRole('doctor')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Stethoscope size={18} />
            Doctor
          </button>
        </div>

        <form onSubmit={handleManualAuth} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <button
            id="manual-auth-submit"
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-gray-200"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold tracking-widest leading-[0]">or</span>
          </div>
        </div>

        <button
          id="google-login-button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white py-4 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 leading-relaxed"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-blue-600 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
