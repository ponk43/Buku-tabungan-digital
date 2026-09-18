import React, { useState, useEffect, useRef } from 'react';
import { PesantrenInfo, AdminUser, AdminRole } from '../types';
import {
  X,
  Building,
  Save,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Edit3,
  User,
  Check,
  Lock,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { presetLogos, defaultPesantrenLogo } from '../data/logoPresets';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: PesantrenInfo;
  onSave: (newInfo: PesantrenInfo) => void;
  adminUsers?: AdminUser[];
  onUpdateAdminUsers?: (users: AdminUser[]) => void;
  currentAdmin?: AdminUser | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  info,
  onSave,
  adminUsers = [],
  onUpdateAdminUsers,
  currentAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'admin'>('info');
  const [formData, setFormData] = useState<PesantrenInfo>(info);
  const [usersList, setUsersList] = useState<AdminUser[]>(adminUsers);
  
  // State for editing a specific admin
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    nama: string;
    username: string;
    role: AdminRole;
    roleTitle: string;
    password: string;
  }>({
    nama: '',
    username: '',
    role: 'BENDAHARA',
    roleTitle: '',
    password: '',
  });

  const [showPass, setShowPass] = useState(false);

  // State for adding new admin
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUserForm, setNewUserForm] = useState<{
    nama: string;
    username: string;
    role: AdminRole;
    roleTitle: string;
    password: string;
  }>({
    nama: '',
    username: '',
    role: 'BENDAHARA',
    roleTitle: 'Bendahara Tabungan Santri',
    password: '123',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoInputMode, setLogoInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(info);
      setUsersList(adminUsers);
      setUploadError(null);
    }
  }, [isOpen, info, adminUsers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimum 5MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, logoUrl: result }));
        soundManager.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const isUserSuperAdmin = Boolean(
    currentAdmin &&
    (currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.nama.toLowerCase().includes('gufron'))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (onUpdateAdminUsers) {
      onUpdateAdminUsers(usersList);
    }
    soundManager.playSuccessChime();
    onClose();
  };

  const handleStartEdit = (user: AdminUser) => {
    setEditingUserId(user.id);
    setIsAddingNew(false);
    setEditForm({
      nama: user.nama,
      username: user.username,
      role: user.role,
      roleTitle: user.roleTitle,
      password: user.password || '',
    });
  };

  const handleSaveEditUser = (userId: string) => {
    if (!editForm.nama.trim()) return;
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              nama: editForm.nama.trim(),
              username: editForm.username.trim() || u.username,
              role: editForm.role,
              roleTitle: editForm.roleTitle.trim() || u.roleTitle,
              password: editForm.password.trim() || u.password,
            }
          : u
      )
    );
    soundManager.playBarcodeBeep();
    setEditingUserId(null);
  };

  const handleAddNewUser = () => {
    if (!newUserForm.nama.trim() || !newUserForm.username.trim()) return;
    const newAdmin: AdminUser = {
      id: 'admin_' + Date.now(),
      nama: newUserForm.nama.trim(),
      username: newUserForm.username.trim().toLowerCase(),
      role: newUserForm.role,
      roleTitle: newUserForm.roleTitle.trim() || 'Petugas Tabungan Santri',
      password: newUserForm.password.trim() || '123',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setUsersList((prev) => [...prev, newAdmin]);
    soundManager.playSuccessChime();
    setIsAddingNew(false);
    setNewUserForm({
      nama: '',
      username: '',
      role: 'BENDAHARA',
      roleTitle: 'Bendahara Tabungan Santri',
      password: '123',
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (usersList.length <= 1) {
      alert('Minimal harus ada satu akun admin di dalam sistem.');
      return;
    }
    if (confirm('Yakin ingin menghapus akun admin ini?')) {
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      soundManager.playBarcodeBeep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-emerald-200">
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Pengaturan Sistem Pesantren</h3>
              <p className="text-xs text-emerald-200">Identitas pesantren & kelola nama admin/petugas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Identitas Pesantren
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Nama & Akses Admin ({usersList.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'info' ? (
            <>
              {/* SECTION LOGO PESANTREN */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Logo Resmi Pesantren
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Tampil di Header aplikasi, Kartu Santri Digital, & cetak bukti transaksi
                      </p>
                    </div>
                  </div>
                  {formData.logoUrl && formData.logoUrl !== defaultPesantrenLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, logoUrl: defaultPesantrenLogo });
                        soundManager.playClick();
                      }}
                      className="text-[10px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reset Default
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Preview Logo Aktif */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-emerald-600/40 p-1.5 shadow-md flex items-center justify-center overflow-hidden relative group">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Pesantren"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-emerald-800 text-amber-300 font-bold font-serif flex items-center justify-center text-xl">
                          {formData.namaPesantren.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                      Logo Aktif
                    </span>
                  </div>

                  {/* Mode Pemilihan & Pengubahan Logo */}
                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setLogoInputMode('preset')}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          logoInputMode === 'preset'
                            ? 'bg-white text-emerald-800 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        Preset Islami
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoInputMode('upload')}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          logoInputMode === 'upload'
                            ? 'bg-white text-emerald-800 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        Upload Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoInputMode('url')}
                        className={`flex-1 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          logoInputMode === 'url'
                            ? 'bg-white text-emerald-800 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        Tautan URL
                      </button>
                    </div>

                    {/* Mode 1: Preset */}
                    {logoInputMode === 'preset' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {presetLogos.map((preset) => {
                          const isSelected = formData.logoUrl === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, logoUrl: preset.url });
                                soundManager.playClick();
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                                  : 'border-slate-200 bg-white hover:border-emerald-300'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-7 h-7 rounded-lg object-contain bg-slate-50 p-0.5 border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                                  {preset.name}
                                </p>
                                <p className="text-[8px] text-slate-500 truncate">{preset.category}</p>
                              </div>
                              {isSelected && <Check className="w-3 h-3 text-emerald-700 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Mode 2: Upload File */}
                    {logoInputMode === 'upload' && (
                      <div className="space-y-1.5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-emerald-400/60 hover:border-emerald-600 rounded-xl p-3 text-center bg-white cursor-pointer transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                            <Upload className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Klik untuk Pilih Gambar Logo dari HP / Komputer
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Mendukung format PNG, JPG, JPEG, WEBP, SVG (Maks. 5MB)
                          </p>
                        </div>
                        {uploadError && (
                          <p className="text-xs text-red-600 font-semibold">{uploadError}</p>
                        )}
                      </div>
                    )}

                    {/* Mode 3: Direct URL */}
                    {logoInputMode === 'url' && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          URL Link Gambar Logo:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={formData.logoUrl || ''}
                            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                            placeholder="https://example.com/logo.png"
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, logoUrl: defaultPesantrenLogo });
                              soundManager.playClick();
                            }}
                            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg bg-white flex items-center gap-1 font-semibold shrink-0"
                            title="Kembalikan ke logo bawaan"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pesantren</label>
                <input
                  type="text"
                  value={formData.namaPesantren}
                  onChange={(e) => setFormData({ ...formData, namaPesantren: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sub Judul / Lembaga</label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. Kontak / Telepon</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bendahara Utama (Kop Struk)</label>
                  <input
                    type="text"
                    value={formData.bendahara}
                    onChange={(e) => setFormData({ ...formData, bendahara: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {isUserSuperAdmin ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 leading-relaxed flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">Kelola Akun & Ganti Password Admin</p>
                      <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full">
                        Admin Utama: Ahmad Gufron Zuldani
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Anda memiliki hak akses penuh untuk mengubah nama, mengganti password / PIN, dan menambah admin baru.
                    </p>
                  </div>
                  {!isAddingNew && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(true);
                        setEditingUserId(null);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Tambah Petugas
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md">
                        Hak Akses Dibatasi
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Pengelolaan Akun Khusus Admin Utama</p>
                    <p className="text-slate-600 leading-relaxed">
                      Hanya <strong>Ahmad Gufron Zuldani</strong> sebagai <strong>Admin Utama</strong> yang berhak mengubah nama, mengganti password, atau menambah/menghapus akun admin.
                    </p>
                    <p className="text-emerald-800 font-semibold pt-0.5">
                      Akun Anda ({currentAdmin?.nama || 'Petugas'}) berwenang mengelola data tabungan dan transaksi santri.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Tambah Petugas Baru */}
              {isAddingNew && (
                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-emerald-700" />
                      Tambah Admin / Kasir Baru
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nama Lengkap Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUserForm.nama}
                      onChange={(e) => setNewUserForm({ ...newUserForm, nama: e.target.value })}
                      placeholder="Contoh: Ust. Ahmad Fauzi"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                        placeholder="username"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        PIN / Password
                      </label>
                      <input
                        type="text"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        placeholder="123"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Tingkat Role
                      </label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) =>
                          setNewUserForm({
                            ...newUserForm,
                            role: e.target.value as AdminRole,
                            roleTitle:
                              e.target.value === 'SUPER_ADMIN'
                                ? 'Super Admin Pesantren'
                                : e.target.value === 'BENDAHARA'
                                ? 'Bendahara Tabungan Santri'
                                : 'Kasir Koperasi Santri',
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                      >
                        <option value="BENDAHARA">Bendahara</option>
                        <option value="KASIR_KOPERASI">Kasir Koperasi</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Jabatan / Label
                      </label>
                      <input
                        type="text"
                        value={newUserForm.roleTitle}
                        onChange={(e) => setNewUserForm({ ...newUserForm, roleTitle: e.target.value })}
                        placeholder="Jabatan"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewUser}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Simpan Admin Baru
                  </button>
                </div>
              )}

              {/* Daftar Akun Admin */}
              <div className="space-y-2.5">
                {usersList.map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex flex-col gap-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {user.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-slate-900 leading-tight">
                              {user.nama}
                            </p>
                            {currentAdmin?.id === user.id && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                                Sedang Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            @{user.username} • <span className="font-sans font-medium text-slate-600">{user.roleTitle}</span>
                          </p>
                        </div>
                      </div>

                      {isUserSuperAdmin ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (editingUserId === user.id) {
                                setEditingUserId(null);
                              } else {
                                handleStartEdit(user);
                              }
                            }}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            {editingUserId === user.id ? 'Tutup' : 'Ubah Nama & Password'}
                          </button>
                          {usersList.length > 1 && user.id !== 'adm-1' && user.role !== 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Khusus Admin Utama</span>
                        </div>
                      )}
                    </div>

                    {/* Inline Edit Form */}
                    {editingUserId === user.id && (
                      <div className="mt-2 pt-3 border-t border-slate-100 space-y-2.5 bg-slate-50/80 p-3 rounded-xl">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                            Nama Lengkap Admin / Petugas:
                          </label>
                          <input
                            type="text"
                            value={editForm.nama}
                            onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                            placeholder="Nama Admin"
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Username:
                            </label>
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                              placeholder="Username"
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Kata Sandi / PIN:
                            </label>
                            <div className="relative">
                              <input
                                type={showPass ? 'text' : 'password'}
                                value={editForm.password}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                placeholder="PIN"
                                className="w-full pl-3 pr-7 py-1.5 text-xs border border-slate-300 rounded-lg font-mono bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-2 top-2 text-slate-400"
                              >
                                {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Role:
                            </label>
                            <select
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm({ ...editForm, role: e.target.value as AdminRole })
                              }
                              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            >
                              <option value="BENDAHARA">Bendahara</option>
                              <option value="KASIR_KOPERASI">Kasir</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Label Jabatan:
                            </label>
                            <input
                              type="text"
                              value={editForm.roleTitle}
                              onChange={(e) => setEditForm({ ...editForm, roleTitle: e.target.value })}
                              placeholder="Jabatan"
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditUser(user.id)}
                            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            Simpan Perubahan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
