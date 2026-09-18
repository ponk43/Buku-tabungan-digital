import React, { useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types';
import { X, User, Shield, KeyRound, Check, Eye, EyeOff, ShieldAlert, Lock, Trash2, Plus, ShieldCheck, LogIn } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser | null;
  allAdmins?: AdminUser[];
  currentAdmin?: AdminUser | null;
  onSave: (updatedAdmin: AdminUser) => void;
  onDeleteAdmin?: (adminId: string) => void;
  onAddNewAdmin?: (newAdmin: AdminUser) => void;
  onRequestSwitchToSuperAdmin?: () => void;
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({
  isOpen,
  onClose,
  admin,
  allAdmins = [],
  currentAdmin,
  onSave,
  onDeleteAdmin,
  onAddNewAdmin,
  onRequestSwitchToSuperAdmin,
}) => {
  const isSuperAdmin = Boolean(
    currentAdmin &&
    (currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.nama.toLowerCase().includes('gufron'))
  );

  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<AdminRole>('BENDAHARA');
  const [roleTitle, setRoleTitle] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setSelectedAdminId(admin.id);
      setIsAddingNew(false);
    } else if (allAdmins.length > 0) {
      setSelectedAdminId(allAdmins[0].id);
      setIsAddingNew(false);
    }
  }, [admin, allAdmins, isOpen]);

  useEffect(() => {
    if (isAddingNew) {
      setNama('');
      setUsername('');
      setRole('BENDAHARA');
      setRoleTitle('Bendahara Tabungan Santri');
      setPassword('123');
      setSuccessMsg(null);
      return;
    }

    const target = allAdmins.find((a) => a.id === selectedAdminId) || admin;
    if (target) {
      setNama(target.nama || '');
      setUsername(target.username || '');
      setRole(target.role || 'BENDAHARA');
      setRoleTitle(target.roleTitle || '');
      setPassword(target.password || '');
      setSuccessMsg(null);
    }
  }, [selectedAdminId, isAddingNew, allAdmins, admin]);

  if (!isOpen) return null;

  // Non-super admin access restricted view
  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
          <div className="px-6 py-5 bg-gradient-to-r from-amber-700 to-amber-800 text-white relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Otoritas Terbatas
                </span>
                <h3 className="font-extrabold text-lg text-white leading-tight mt-0.5">
                  Akses Pengelolaan Dibatasi
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <p className="font-semibold leading-relaxed">
                Hanya <strong className="text-slate-900 font-bold">Ahmad Gufron Zuldani</strong> sebagai <strong>Admin Utama</strong> yang memiliki wewenang untuk:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Mengganti kata sandi / PIN admin</li>
                <li>Mengubah nama atau data petugas</li>
                <li>Menambah atau menghapus akun admin</li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900">Wewenang Akun Anda ({currentAdmin?.nama || 'Petugas'}):</p>
              <p className="text-emerald-800 font-medium mt-1">
                ✓ Mengelola & mengedit data tabungan santri (setor, tarik, riwayat transaksi, dan kartu santri).
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {onRequestSwitchToSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestSwitchToSuperAdmin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk sebagai Ahmad Gufron Zuldani (Admin Utama)
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
              >
                Kembali ke Tabungan Santri
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Super Admin view (Ahmad Gufron Zuldani)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    if (isAddingNew) {
      const newAdmin: AdminUser = {
        id: `adm-${Date.now()}`,
        nama: nama.trim(),
        username: username.trim().toLowerCase(),
        role,
        roleTitle: roleTitle.trim() || (role === 'SUPER_ADMIN' ? 'Super Admin Pesantren' : role === 'BENDAHARA' ? 'Bendahara Tabungan' : 'Kasir Koperasi'),
        password: password.trim() || '123',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      if (onAddNewAdmin) {
        onAddNewAdmin(newAdmin);
      }
      soundManager.playSuccessChime();
      setSuccessMsg(`Admin "${newAdmin.nama}" berhasil ditambahkan!`);
      setIsAddingNew(false);
      setSelectedAdminId(newAdmin.id);
      return;
    }

    const currentTarget = allAdmins.find((a) => a.id === selectedAdminId) || admin;
    if (!currentTarget) return;

    const updated: AdminUser = {
      ...currentTarget,
      nama: nama.trim(),
      username: username.trim().toLowerCase() || currentTarget.username,
      role,
      roleTitle: roleTitle.trim() || (role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'BENDAHARA' ? 'Bendahara Tabungan' : 'Kasir Koperasi'),
      password: password.trim() || currentTarget.password,
    };

    soundManager.playSuccessChime();
    onSave(updated);
    setSuccessMsg(`Data & password untuk "${updated.nama}" berhasil diperbarui!`);
  };

  const rolePresets = [
    { role: 'SUPER_ADMIN' as AdminRole, label: 'Super Admin', defaultTitle: 'Super Admin Pesantren' },
    { role: 'BENDAHARA' as AdminRole, label: 'Bendahara', defaultTitle: 'Bendahara Tabungan Santri' },
    { role: 'KASIR_KOPERASI' as AdminRole, label: 'Kasir / Teller', defaultTitle: 'Kasir & Petugas POS' },
  ];

  const currentTarget = allAdmins.find((a) => a.id === selectedAdminId);
  const isTargetMainAdmin = currentTarget?.id === 'adm-1' || currentTarget?.role === 'SUPER_ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center font-bold text-base shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-600/40">
                Otoritas Penuh: Ahmad Gufron Zuldani
              </span>
              <h3 className="font-extrabold text-lg text-white leading-tight mt-1">
                Pengelolaan Akun & Ganti Password Admin
              </h3>
            </div>
          </div>
        </div>

        {/* Admin Selector Carousel / List */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Pilih Akun yang Dikelola:
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Petugas Baru
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allAdmins.map((u) => {
              const isSelected = !isAddingNew && u.id === selectedAdminId;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setSelectedAdminId(u.id);
                  }}
                  className={`px-3 py-2 rounded-xl text-left border transition-all shrink-0 text-xs ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <p className="truncate max-w-[140px] font-bold leading-tight">
                    {u.nama}
                  </p>
                  <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    @{u.username} • {u.role === 'SUPER_ADMIN' ? 'Admin Utama' : u.role === 'BENDAHARA' ? 'Bendahara' : 'Kasir'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Form Edit / Add */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              {isAddingNew ? 'Tambah Akun Petugas Baru' : `Pengaturan: ${nama || 'Admin'}`}
            </h4>
            {!isAddingNew && !isTargetMainAdmin && onDeleteAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus akun petugas "${nama}"?`)) {
                    onDeleteAdmin(selectedAdminId);
                    soundManager.playSuccessChime();
                    setSuccessMsg(`Akun "${nama}" berhasil dihapus.`);
                    if (allAdmins.length > 1) {
                      const remaining = allAdmins.filter((a) => a.id !== selectedAdminId);
                      setSelectedAdminId(remaining[0].id);
                    }
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Akun Ini
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap Admin / Petugas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad Gufron Zuldani / Ust. Ahmad Fauzi"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Login <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ganti Kata Sandi / PIN <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PIN atau Sandi baru"
                  required
                  className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tingkat Wewenang (Role)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {rolePresets.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => {
                    setRole(preset.role);
                    setRoleTitle(preset.defaultTitle);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    role === preset.role
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Contoh: Admin Utama Pesantren / Bendahara Tabungan"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-slate-700"
            />
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isAddingNew ? 'Simpan Petugas Baru' : 'Simpan Perubahan & Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
