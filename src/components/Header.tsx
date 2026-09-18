import React from 'react';
import { PesantrenInfo, AdminUser } from '../types';
import { Scan, UserPlus, Building, CreditCard, RefreshCw, LogIn, LogOut, Shield, ShieldCheck, Edit3, Camera } from 'lucide-react';

interface HeaderProps {
  pesantrenInfo: PesantrenInfo;
  currentAdmin: AdminUser | null;
  onOpenScanner: () => void;
  onOpenNewSantri: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onEditAdminProfile?: () => void;
  totalSantri: number;
  totalSaldo: number;
}

export const Header: React.FC<HeaderProps> = ({
  pesantrenInfo,
  currentAdmin,
  onOpenScanner,
  onOpenNewSantri,
  onOpenSettings,
  onOpenLogin,
  onLogout,
  onEditAdminProfile,
  totalSantri,
  totalSaldo,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Pesantren Branding & Logo */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={onOpenSettings}
            title="Klik untuk ubah logo & info pesantren"
            className="relative group cursor-pointer shrink-0"
          >
            {pesantrenInfo.logoUrl ? (
              <img
                src={pesantrenInfo.logoUrl}
                alt={pesantrenInfo.namaPesantren}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-contain bg-white p-1 border border-emerald-600/30 shadow-md group-hover:scale-105 group-hover:border-emerald-500 transition-all"
              />
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-amber-300 font-serif font-black text-xl flex items-center justify-center shadow-md shadow-emerald-950/20 border border-emerald-700/50">
                <span>{pesantrenInfo.namaPesantren.charAt(0) || 'P'}</span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-2.5 h-2.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                {pesantrenInfo.namaPesantren}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Tabungan Santri Digital
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Kasir Aktif: <b>{currentAdmin ? currentAdmin.nama : pesantrenInfo.bendahara}</b></span>
              <span>•</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Building className="w-3 h-3" />
                Ubah Logo & Info
              </button>
            </p>
          </div>
        </div>

        {/* Admin Login Status & Global CTA Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Admin User Badge / Login Button */}
          {currentAdmin ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <button
                type="button"
                onClick={onEditAdminProfile}
                title="Klik untuk ubah nama atau profil admin"
                className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 transition-colors cursor-pointer"
              >
                {currentAdmin.nama.charAt(0)}
              </button>
              <div 
                onClick={onEditAdminProfile}
                className="text-left max-w-[130px] sm:max-w-[160px] cursor-pointer hover:opacity-80 transition-opacity"
                title="Klik untuk ubah nama admin"
              >
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {currentAdmin.nama.split(' ')[0]} {currentAdmin.nama.split(' ')[1] || ''}
                  </p>
                  <Edit3 className="w-2.5 h-2.5 text-slate-400 hover:text-emerald-700 shrink-0" />
                </div>
                <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.nama.toLowerCase().includes('gufron')
                    ? 'Admin Utama'
                    : currentAdmin.role === 'BENDAHARA'
                    ? 'Bendahara Tabungan'
                    : 'Kasir Tabungan'}
                </span>
              </div>
              <button
                type="button"
                onClick={onEditAdminProfile}
                title="Ubah Nama / Data Admin"
                className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors ml-0.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Keluar / Kunci Akses"
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-0.5"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Login Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenScanner}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Scan className="w-4 h-4 text-amber-300" />
            <span>Scan Barcode</span>
            <span className="hidden sm:inline-block bg-emerald-950/40 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
              SPACE
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenNewSantri}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Santri Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};

