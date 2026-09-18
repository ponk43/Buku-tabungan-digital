import React, { useState, useEffect, useRef } from 'react';
import { AdminUser } from '../types';
import { X, Lock, User, KeyRound, Eye, EyeOff, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUsers: AdminUser[];
  onLoginSuccess: (user: AdminUser) => void;
  title?: string;
  subtitle?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  adminUsers,
  onLoginSuccess,
  title = 'Akses Masuk Admin & Petugas',
  subtitle = 'Silakan masukkan username dan kata sandi / PIN untuk masuk',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg(null);
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setErrorMsg('Harap masukkan username admin.');
      return;
    }

    if (!trimmedPassword) {
      setErrorMsg('Harap masukkan kata sandi / PIN.');
      return;
    }

    const matchedUser = adminUsers.find(
      (u) =>
        u.username.toLowerCase() === trimmedUsername &&
        u.password === trimmedPassword
    );

    if (matchedUser) {
      soundManager.playSuccessChime();
      onLoginSuccess(matchedUser);
      onClose();
    } else {
      soundManager.playWarningTone();
      setErrorMsg('Username atau kata sandi / PIN salah. Silakan coba kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-600/40">
                Otorisasi Akses
              </span>
              <h3 className="font-extrabold text-xl text-white mt-1 leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-100/90 pl-14">
            {subtitle}
          </p>
        </div>

        {/* Body Form Manual */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Akun <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  ref={usernameInputRef}
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ketik username admin..."
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi / PIN <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ketik kata sandi atau PIN..."
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 font-mono text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Masuk Sistem
              </button>
            </div>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Pengaturan akun dan ganti kata sandi dapat dikelola di menu <span className="font-semibold text-slate-600">Pengaturan Pesantren</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
