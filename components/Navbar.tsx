'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, ChevronRight, User, X, LogOut, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';
import { firebaseAuth, firestoreSet, firestoreGet } from '@/lib/firebase-rest';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, login, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === 'waiting-room') label = 'Waiting Room';
      if (segment === 'ehr') label = 'Medical Record';
      if (segment === 'doctor') label = 'Specialist';
      return { label, href };
    })
  ];

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const data = await firebaseAuth.login(email, password);
        let userDoc: any = {};
        try { userDoc = await firestoreGet('users', data.localId); } catch {}
        login(data.idToken, { uid: data.localId, email, name: userDoc?.name || email.split('@')[0], ...userDoc });
        setShowModal(false);
      } else {
        const data = await firebaseAuth.register(email, password);
        const userData = { name, email, role: 'patient', createdAt: new Date().toISOString() };
        try { await firestoreSet('users', data.localId, userData); } catch {}
        login(data.idToken, { uid: data.localId, ...userData });
        setShowModal(false);
      }
    } catch (err: any) {
      setError(err.message?.replace('INVALID_LOGIN_CREDENTIALS', 'Invalid email or password') || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@healpoint.in');
    setPassword('Demo@1234');
    setLoading(true);
    setError('');
    try {
      // Try login first, register if not exists
      let data: any;
      try {
        data = await firebaseAuth.login('demo@healpoint.in', 'Demo@1234');
      } catch {
        data = await firebaseAuth.register('demo@healpoint.in', 'Demo@1234');
        await firestoreSet('users', data.localId, { name: 'Demo Patient', email: 'demo@healpoint.in', role: 'patient', createdAt: new Date().toISOString() });
      }
      login(data.idToken, { uid: data.localId, name: 'Demo Patient', email: 'demo@healpoint.in', role: 'patient' });
      setShowModal(false);
    } catch (err: any) {
      setError('Demo login failed. Please try manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Stethoscope size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0A1628]">Heal<span className="text-[#00BFA6]">Point</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.href}>
                  <Link href={crumb.href} className={`hover:text-[#0A1628] transition-colors ${idx === breadcrumbs.length - 1 ? 'text-[#0A1628] font-medium' : ''}`}>
                    {crumb.label}
                  </Link>
                  {idx < breadcrumbs.length - 1 && <ChevronRight size={14} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-[#0A1628]">{currentUser.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patient</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#00BFA6]/10 flex items-center justify-center text-[#00BFA6] font-bold border border-[#00BFA6]/20">
                  {(currentUser.name || 'P').charAt(0).toUpperCase()}
                </div>
                <button onClick={logout} className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white rounded-xl font-semibold text-sm hover:bg-[#00BFA6] transition-colors"
              >
                <User size={16} /> Patient Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(10,22,40,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#0A1628]">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                  <p className="text-sm text-gray-400 mt-1">HealPoint Patient Portal</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Tab toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                {(['login', 'register'] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-white text-[#0A1628] shadow-sm' : 'text-gray-400'}`}>
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input type="text" placeholder="Dr. / Mr. / Ms. Your Name" value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]/20 outline-none text-sm transition-all" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <input type="email" placeholder="patient@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]/20 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAuth()}
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-[#00BFA6] focus:ring-2 focus:ring-[#00BFA6]/20 outline-none text-sm transition-all pr-12" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">{error}</div>
                )}

                <button onClick={handleAuth} disabled={loading || !email || !password || (mode === 'register' && !name)}
                  className="w-full py-4 bg-[#0A1628] text-white rounded-2xl font-bold text-sm hover:bg-[#00BFA6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button onClick={handleDemoLogin} disabled={loading}
                  className="w-full py-4 border-2 border-dashed border-[#00BFA6] text-[#00BFA6] rounded-2xl font-bold text-sm hover:bg-[#00BFA6]/5 transition-colors disabled:opacity-50">
                  ⚡ Demo Patient Access
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-[#00BFA6] font-bold hover:underline">
                  {mode === 'login' ? 'Register here' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

