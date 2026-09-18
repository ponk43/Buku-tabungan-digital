/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Santri, Transaction, TransactionType, PesantrenInfo, AutoTopUpSchedule, AdminUser, AdminRole } from './types';
import {
  initialSantriList,
  initialTransactions,
  defaultPesantrenInfo,
  initialAutoTopUpSchedules,
  initialAdminUsers,
} from './data/initialData';
import { soundManager } from './utils/sound';
import { executeAutoTopUp, isScheduleDue } from './utils/autoTopUpUtils';
import { Header } from './components/Header';
import { SantriDetailView } from './components/SantriDetailView';
import { SantriListSection } from './components/SantriListSection';
import { TransactionsSection } from './components/TransactionsSection';
import { AutoTopUpSection } from './components/AutoTopUpSection';
import { AutoTopUpModal } from './components/AutoTopUpModal';
import { ScannerModal } from './components/ScannerModal';
import { KartuSantriModal } from './components/KartuSantriModal';
import { TransactionModal } from './components/TransactionModal';
import { StrukModal } from './components/StrukModal';
import { SantriFormModal } from './components/SantriFormModal';
import { SettingsModal } from './components/SettingsModal';
import { BatchCardPrintModal } from './components/BatchCardPrintModal';
import { LoginModal } from './components/LoginModal';
import { EditAdminModal } from './components/EditAdminModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import {
  Scan,
  Zap,
  Users,
  History,
  Printer,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

export default function App() {
  // Persistence state
  const [santriList, setSantriList] = useState<Santri[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_santri_list');
      return saved ? JSON.parse(saved) : initialSantriList;
    } catch {
      return initialSantriList;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_transactions');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [autoTopUpSchedules, setAutoTopUpSchedules] = useState<AutoTopUpSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_auto_topup_schedules');
      return saved ? JSON.parse(saved) : initialAutoTopUpSchedules;
    } catch {
      return initialAutoTopUpSchedules;
    }
  });

  const [pesantrenInfo, setPesantrenInfo] = useState<PesantrenInfo>(() => {
    try {
      const saved = localStorage.getItem('pesantren_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultPesantrenInfo,
          ...parsed,
          logoUrl: parsed.logoUrl || defaultPesantrenInfo.logoUrl,
        };
      }
      return defaultPesantrenInfo;
    } catch {
      return defaultPesantrenInfo;
    }
  });

  // Admin and authentication states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('pesantren_admin_users');
      if (saved) {
        const parsed: AdminUser[] = JSON.parse(saved);
        const hasGufron = parsed.some(
          (u) => u.nama.toLowerCase().includes('gufron') || u.role === 'SUPER_ADMIN'
        );
        if (hasGufron) {
          return parsed.map((u) => {
            if (u.role === 'SUPER_ADMIN' || u.id === 'adm-1') {
              return {
                ...u,
                nama: 'Ahmad Gufron Zuldani',
                role: 'SUPER_ADMIN' as AdminRole,
                roleTitle: 'Admin Utama Pesantren',
                username: u.username || 'gufron',
              };
            }
            return u;
          });
        }
        return [initialAdminUsers[0], ...parsed];
      }
      return initialAdminUsers;
    } catch {
      return initialAdminUsers;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('pesantren_current_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'SUPER_ADMIN' || parsed.id === 'adm-1') {
          return {
            ...parsed,
            nama: 'Ahmad Gufron Zuldani',
            role: 'SUPER_ADMIN' as AdminRole,
            roleTitle: 'Admin Utama Pesantren',
          };
        }
        return parsed;
      }
      return initialAdminUsers[0]; // Ahmad Gufron Zuldani as active Admin Utama
    } catch {
      return initialAdminUsers[0];
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [loginPromptReason, setLoginPromptReason] = useState<{
    title?: string;
    subtitle?: string;
    onSuccessCallback?: () => void;
  } | null>(null);

  // Active selected santri (focus view)
  const [selectedSantriId, setSelectedSantriId] = useState<string | null>(() => {
    return santriList.length > 0 ? santriList[0].id : null;
  });

  // Current main tab
  const [activeTab, setActiveTab] = useState<'santri' | 'autotopup' | 'transaksi'>('santri');

  // Fast Barcode Input (USB Barcode gun or manual typing)
  const [quickBarcode, setQuickBarcode] = useState('');
  const [statusNotification, setStatusNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Modal visibility states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);

  const [autoTopUpModalState, setAutoTopUpModalState] = useState<{
    isOpen: boolean;
    targetSantri: Santri | null;
    scheduleToEdit: AutoTopUpSchedule | null;
  }>({
    isOpen: false,
    targetSantri: null,
    scheduleToEdit: null,
  });

  const [cardModalSantri, setCardModalSantri] = useState<Santri | null>(null);
  const [trxModalState, setTrxModalState] = useState<{
    isOpen: boolean;
    santri: Santri | null;
    type: TransactionType;
  }>({
    isOpen: false,
    santri: null,
    type: 'SETOR',
  });

  const [receiptModalTrx, setReceiptModalTrx] = useState<Transaction | null>(null);
  const [santriFormState, setSantriFormState] = useState<{
    isOpen: boolean;
    santriToEdit: Santri | null;
  }>({
    isOpen: false,
    santriToEdit: null,
  });

  const [whatsAppModalSantri, setWhatsAppModalSantri] = useState<Santri | null>(null);

  const handleUpdateSantriPhone = (santriId: string, newPhone: string) => {
    setSantriList((prev) => {
      const updated = prev.map((s) => (s.id === santriId ? { ...s, teleponWali: newPhone } : s));
      try {
        localStorage.setItem('pesantren_santri_list', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
      return updated;
    });
    showNotification('Nomor telepon wali santri berhasil diperbarui.', 'success');
  };

  const quickInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pesantren_santri_list', JSON.stringify(santriList));
    } catch (e) {
      console.warn(e);
    }
  }, [santriList]);

  useEffect(() => {
    try {
      localStorage.setItem('pesantren_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('pesantren_auto_topup_schedules', JSON.stringify(autoTopUpSchedules));
    } catch (e) {
      console.warn(e);
    }
  }, [autoTopUpSchedules]);

  useEffect(() => {
    try {
      localStorage.setItem('pesantren_info', JSON.stringify(pesantrenInfo));
    } catch (e) {
      console.warn(e);
    }
  }, [pesantrenInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('pesantren_admin_users', JSON.stringify(adminUsers));
    } catch (e) {
      console.warn(e);
    }
  }, [adminUsers]);

  useEffect(() => {
    try {
      if (currentAdmin) {
        localStorage.setItem('pesantren_current_admin', JSON.stringify(currentAdmin));
      } else {
        localStorage.removeItem('pesantren_current_admin');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [currentAdmin]);

  // Auth guard helper
  const ensureAdminLogin = (actionName: string, callback: () => void) => {
    if (currentAdmin) {
      callback();
    } else {
      setLoginPromptReason({
        title: `Akses Diperlukan: ${actionName}`,
        subtitle: 'Silakan masuk dengan akun Admin / Bendahara / Kasir untuk melanjutkan.',
        onSuccessCallback: callback,
      });
      setIsLoginModalOpen(true);
      showNotification('Akses admin diperlukan untuk melakukan tindakan ini.', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    showNotification('Akses admin telah dikunci / keluar.', 'success');
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentAdmin(user);
    showNotification(`Selamat bertugas, ${user.nama}!`, 'success');
    if (loginPromptReason?.onSuccessCallback) {
      const cb = loginPromptReason.onSuccessCallback;
      setLoginPromptReason(null);
      cb();
    }
  };

  const handleSaveAdminProfile = (updatedAdmin: AdminUser) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === updatedAdmin.id ? updatedAdmin : u))
    );
    if (currentAdmin?.id === updatedAdmin.id) {
      setCurrentAdmin(updatedAdmin);
    }
    showNotification(`Nama admin berhasil diubah menjadi "${updatedAdmin.nama}".`, 'success');
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input, don't trigger global hotkeys
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsScannerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => {
      setStatusNotification(null);
    }, 4500);
  };

  // Barcode Handler (from Camera, USB Gun, or input)
  const handleBarcodeScanned = (scannedNis: string) => {
    const trimmed = scannedNis.trim().toUpperCase();
    if (!trimmed) return;

    // Find santri by NIS (case-insensitive)
    const match = santriList.find(
      (s) => s.nis.toUpperCase() === trimmed || s.id === trimmed
    );

    if (match) {
      soundManager.playBarcodeBeep();
      setSelectedSantriId(match.id);
      showNotification(`Kartu terdeteksi: ${match.nama} (${match.nis})`, 'success');
      // scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      soundManager.playWarningTone();
      showNotification(`Kartu dengan NIS "${trimmed}" tidak ditemukan dalam database.`, 'error');
    }
    setQuickBarcode('');
  };

  const handleQuickBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickBarcode.trim()) {
      handleBarcodeScanned(quickBarcode);
    }
  };

  // Transaction completed
  const handleTransactionSuccess = (newTrx: Transaction, updatedSantri: Santri) => {
    setTransactions((prev) => [newTrx, ...prev]);
    setSantriList((prev) =>
      prev.map((s) => (s.id === updatedSantri.id ? updatedSantri : s))
    );
    setSelectedSantriId(updatedSantri.id);
    setReceiptModalTrx(newTrx);
    showNotification(
      `Transaksi ${newTrx.tipe === 'SETOR' ? 'Setoran' : 'Penarikan'} Rp ${newTrx.nominal.toLocaleString('id-ID')} berhasil disimpan!`,
      'success'
    );
  };

  // Save new or edited santri
  const handleSaveSantri = (savedSantri: Santri) => {
    const exists = santriList.some((s) => s.id === savedSantri.id);
    if (exists) {
      setSantriList((prev) =>
        prev.map((s) => (s.id === savedSantri.id ? savedSantri : s))
      );
      showNotification(`Data santri ${savedSantri.nama} berhasil diperbarui.`, 'success');
    } else {
      setSantriList((prev) => [savedSantri, ...prev]);
      setSelectedSantriId(savedSantri.id);
      showNotification(
        `Santri baru ${savedSantri.nama} berhasil didaftarkan. Kartu barcode siap dicetak.`,
        'success'
      );
      // prompt to print card
      setTimeout(() => {
        setCardModalSantri(savedSantri);
      }, 500);
    }
  };

  // Auto Top-Up Handlers
  const handleSaveAutoTopUpSchedule = (schedule: AutoTopUpSchedule) => {
    setAutoTopUpSchedules((prev) => {
      const exists = prev.some((s) => s.id === schedule.id);
      if (exists) {
        return prev.map((s) => (s.id === schedule.id ? schedule : s));
      } else {
        return [schedule, ...prev];
      }
    });
    showNotification(
      `Jadwal top-up otomatis Rp ${schedule.nominal.toLocaleString('id-ID')} (${schedule.frekuensi}) untuk ${schedule.santriNama} berhasil disimpan.`,
      'success'
    );
  };

  const handleToggleAutoTopUp = (scheduleId: string) => {
    setAutoTopUpSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, aktif: !s.aktif } : s))
    );
    showNotification('Status jadwal top-up berhasil diperbarui.', 'success');
  };

  const handleDeleteAutoTopUp = (scheduleId: string) => {
    setAutoTopUpSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    showNotification('Jadwal top-up otomatis berhasil dihapus.', 'success');
  };

  const handleExecuteSingleTopUp = (schedule: AutoTopUpSchedule) => {
    const santri = santriList.find((s) => s.id === schedule.santriId);
    if (!santri) {
      showNotification('Data santri tidak ditemukan.', 'error');
      return;
    }

    const { transaction, updatedSantri, updatedSchedule } = executeAutoTopUp(
      schedule,
      santri,
      pesantrenInfo.bendahara || 'Sistem Auto Top-Up'
    );

    setSantriList((prev) =>
      prev.map((s) => (s.id === updatedSantri.id ? updatedSantri : s))
    );
    setTransactions((prev) => [transaction, ...prev]);
    setAutoTopUpSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );

    soundManager.playSuccessChime();
    showNotification(
      `Top-up otomatis Rp ${schedule.nominal.toLocaleString('id-ID')} untuk ${santri.nama} berhasil diproses! Saldo bertambah.`,
      'success'
    );
  };

  const handleExecuteAllDueTopUps = () => {
    const due = autoTopUpSchedules.filter((s) => isScheduleDue(s));
    if (due.length === 0) {
      showNotification('Tidak ada jadwal top-up yang jatuh tempo saat ini.', 'success');
      return;
    }

    const currentSantriMap = new Map(santriList.map((s) => [s.id, { ...s }]));
    const newTransactions: Transaction[] = [];
    const updatedSchedulesMap = new Map<string, AutoTopUpSchedule>();

    due.forEach((sch) => {
      const santri = currentSantriMap.get(sch.santriId);
      if (santri) {
        const { transaction, updatedSantri, updatedSchedule } = executeAutoTopUp(
          sch,
          santri,
          pesantrenInfo.bendahara || 'Sistem Auto Top-Up'
        );
        currentSantriMap.set(santri.id, updatedSantri);
        newTransactions.push(transaction);
        updatedSchedulesMap.set(sch.id, updatedSchedule);
      }
    });

    setSantriList(Array.from(currentSantriMap.values()));
    setTransactions((prev) => [...newTransactions, ...prev]);
    setAutoTopUpSchedules((prev) =>
      prev.map((s) => updatedSchedulesMap.get(s.id) || s)
    );

    soundManager.playSuccessChime();
    showNotification(
      `Berhasil memproses ${newTransactions.length} transaksi top-up otomatis santri!`,
      'success'
    );
  };

  // Reset to demo data
  const handleResetData = () => {
    if (confirm('Kembalikan data tabungan santri ke contoh bawaan awal? Semua perubahan akan direset.')) {
      setSantriList(initialSantriList);
      setTransactions(initialTransactions);
      setAutoTopUpSchedules(initialAutoTopUpSchedules);
      setAdminUsers(initialAdminUsers);
      setCurrentAdmin(initialAdminUsers[1]);
      setPesantrenInfo(defaultPesantrenInfo);
      setSelectedSantriId(initialSantriList[0].id);
      showNotification('Data contoh bawaan berhasil dipulihkan.', 'success');
    }
  };

  const currentSantri = santriList.find((s) => s.id === selectedSantriId) || null;
  const totalDanaTabungan = santriList.reduce((acc, curr) => acc + curr.saldo, 0);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        pesantrenInfo={pesantrenInfo}
        currentAdmin={currentAdmin}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNewSantri={() =>
          ensureAdminLogin('Pendaftaran Santri Baru', () =>
            setSantriFormState({ isOpen: true, santriToEdit: null })
          )
        }
        onOpenSettings={() =>
          ensureAdminLogin('Pengaturan Sistem Pesantren', () => setIsSettingsOpen(true))
        }
        onOpenLogin={() => {
          setLoginPromptReason(null);
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        onEditAdminProfile={() => setIsEditAdminModalOpen(true)}
        totalSantri={santriList.length}
        totalSaldo={totalDanaTabungan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Guest Warning Banner if not logged in */}
        {!currentAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Mode Tamu / Akses Belum Login</p>
                <p className="text-slate-600">
                  Anda dapat memindai atau melihat info tabungan santri. Untuk melakukan setor, tarik, top-up, atau kelola data santri, silakan masuk dengan akun admin/kasir.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoginPromptReason(null);
                setIsLoginModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Masuk Admin Sekarang
            </button>
          </div>
        )}

        {/* Real-time Barcode Scanner Quick Station */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-700/50 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
            {/* Station Text & Info */}
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                POS Kasir Tabungan Santri Aktif
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Pemindai Barcode Kartu Santri
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
                Scan barcode kartu tanda santri menggunakan kamera webcam atau tembak dengan barcode gun USB.
              </p>
            </div>

            {/* Quick Barcode Input & Scanner Actions */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
              {/* USB Barcode Gun direct field */}
              <form
                onSubmit={handleQuickBarcodeSubmit}
                className="relative w-full sm:w-72"
              >
                <input
                  ref={quickInputRef}
                  type="text"
                  value={quickBarcode}
                  onChange={(e) => setQuickBarcode(e.target.value)}
                  placeholder="Ketik / Scan Barcode (NIS)..."
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-emerald-200/70 border border-emerald-400/40 rounded-xl font-mono text-sm font-semibold tracking-wide focus:outline-none focus:ring-4 focus:ring-amber-400/30 transition-all shadow-inner"
                />
                <Scan className="w-4 h-4 text-amber-300 absolute left-3.5 top-3.5 pointer-events-none" />
                {quickBarcode && (
                  <button
                    type="submit"
                    className="absolute right-2.5 top-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1 rounded-lg font-bold transition-colors"
                  >
                    Cari
                  </button>
                )}
              </form>

              {/* Camera Scanner Trigger */}
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-emerald-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Scan className="w-4 h-4 text-emerald-950" />
                Buka Kamera Scanner
              </button>
            </div>
          </div>

          {/* Real-time scan feedback banner */}
          {statusNotification && (
            <div
              className={`mt-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
                statusNotification.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
                  : 'bg-red-950/80 border-red-400 text-red-100'
              }`}
            >
              {statusNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusNotification.message}</span>
            </div>
          )}
        </div>

        {/* Selected Santri Scanned Profile Panel */}
        {currentSantri && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Santri Sedang Aktif / Terpindai
              </span>
              <span className="text-xs text-slate-400">
                Klik kartu santri di bawah untuk berpindah santri
              </span>
            </div>
            <SantriDetailView
              santri={currentSantri}
              transactions={transactions}
              pesantrenInfo={pesantrenInfo}
              autoTopUpSchedule={autoTopUpSchedules.find((s) => s.santriId === currentSantri.id) || null}
              onOpenTransaction={(type) =>
                ensureAdminLogin(
                  type === 'SETOR' ? 'Setoran Tabungan Santri' : 'Penarikan Uang Saku',
                  () => setTrxModalState({ isOpen: true, santri: currentSantri, type })
                )
              }
              onOpenCardModal={() => setCardModalSantri(currentSantri)}
              onEditSantri={() =>
                ensureAdminLogin('Edit Data Santri', () =>
                  setSantriFormState({ isOpen: true, santriToEdit: currentSantri })
                )
              }
              onConfigureAutoTopUp={() =>
                ensureAdminLogin('Konfigurasi Top-Up Otomatis', () =>
                  setAutoTopUpModalState({
                    isOpen: true,
                    targetSantri: currentSantri,
                    scheduleToEdit:
                      autoTopUpSchedules.find((s) => s.santriId === currentSantri.id) || null,
                  })
                )
              }
              onOpenWhatsApp={(santri) => setWhatsAppModalSantri(santri)}
              onClose={() => setSelectedSantriId(null)}
            />
          </section>
        )}

        {/* Navigation Tabs (Santri Directory vs Top-Up Otomatis vs Full Audit Ledger) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('santri')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'santri'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Santri & Kartu ({santriList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('autotopup')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'autotopup'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              <span>Top-Up Otomatis ({autoTopUpSchedules.length})</span>
              {autoTopUpSchedules.filter((s) => isScheduleDue(s)).length > 0 && (
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {autoTopUpSchedules.filter((s) => isScheduleDue(s)).length} Jatuh Tempo
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transaksi')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'transaksi'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              Buku Kas & Riwayat Transaksi ({transactions.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsBatchPrintOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              Cetak Massal Kartu A4
            </button>
          </div>
        </div>

        {/* Tab 1: Santri Directory */}
        {activeTab === 'santri' && (
          <SantriListSection
            santriList={santriList}
            onSelectSantri={(santri) => {
              setSelectedSantriId(santri.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCardModal={(santri) => setCardModalSantri(santri)}
            onQuickTransaction={(santri, type) =>
              ensureAdminLogin(
                type === 'SETOR' ? 'Setoran Tabungan Santri' : 'Penarikan Uang Saku',
                () => setTrxModalState({ isOpen: true, santri, type })
              )
            }
            onOpenWhatsApp={(santri) => setWhatsAppModalSantri(santri)}
          />
        )}

        {/* Tab 2: Auto Top-Up Section */}
        {activeTab === 'autotopup' && (
          <AutoTopUpSection
            schedules={autoTopUpSchedules}
            santriList={santriList}
            onAddNew={() =>
              ensureAdminLogin('Tambah Jadwal Top-Up Otomatis', () =>
                setAutoTopUpModalState({
                  isOpen: true,
                  targetSantri: null,
                  scheduleToEdit: null,
                })
              )
            }
            onEditSchedule={(schedule) => {
              const target = santriList.find((s) => s.id === schedule.santriId) || null;
              ensureAdminLogin('Ubah Jadwal Top-Up Otomatis', () =>
                setAutoTopUpModalState({
                  isOpen: true,
                  targetSantri: target,
                  scheduleToEdit: schedule,
                })
              );
            }}
            onToggleActive={(id) =>
              ensureAdminLogin('Ubah Status Jadwal Top-Up', () => handleToggleAutoTopUp(id))
            }
            onDeleteSchedule={(id) =>
              ensureAdminLogin('Hapus Jadwal Top-Up', () => handleDeleteAutoTopUp(id))
            }
            onExecuteSchedule={(schedule) =>
              ensureAdminLogin('Eksekusi Top-Up Otomatis', () => handleExecuteSingleTopUp(schedule))
            }
            onExecuteAllDue={() =>
              ensureAdminLogin('Eksekusi Semua Top-Up Jatuh Tempo', () => handleExecuteAllDueTopUps())
            }
            onSelectSantri={(santriId) => {
              setSelectedSantriId(santriId);
              setActiveTab('santri');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 3: Transaction Audit Ledger */}
        {activeTab === 'transaksi' && (
          <TransactionsSection
            transactions={transactions}
            onOpenReceipt={(trx) => setReceiptModalTrx(trx)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{pesantrenInfo.namaPesantren}</span>
            <span>•</span>
            <span>Sistem Tabungan Santri Berbasis Barcode</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Data Contoh
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Barcode Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
        santriList={santriList}
      />

      {/* 2. Kartu Santri View & Print Modal */}
      {cardModalSantri && (
        <KartuSantriModal
          isOpen={!!cardModalSantri}
          onClose={() => setCardModalSantri(null)}
          santri={cardModalSantri}
          pesantrenInfo={pesantrenInfo}
          onOpenWhatsApp={(santri) => setWhatsAppModalSantri(santri)}
        />
      )}

      {/* 3. Setor / Tarik Transaction Modal */}
      {trxModalState.isOpen && trxModalState.santri && (
        <TransactionModal
          isOpen={trxModalState.isOpen}
          onClose={() => setTrxModalState({ isOpen: false, santri: null, type: 'SETOR' })}
          santri={trxModalState.santri}
          initialType={trxModalState.type}
          pesantrenInfo={pesantrenInfo}
          currentAdmin={currentAdmin}
          onTransactionSuccess={handleTransactionSuccess}
        />
      )}

      {/* 4. Thermal Struk Receipt Modal */}
      {receiptModalTrx && (
        <StrukModal
          isOpen={!!receiptModalTrx}
          onClose={() => setReceiptModalTrx(null)}
          transaction={receiptModalTrx}
          pesantrenInfo={pesantrenInfo}
          santri={santriList.find((s) => s.id === receiptModalTrx.santriId)}
          onOpenWhatsApp={(santri) => setWhatsAppModalSantri(santri)}
        />
      )}

      {/* 5. Add / Edit Santri Modal */}
      <SantriFormModal
        isOpen={santriFormState.isOpen}
        onClose={() => setSantriFormState({ isOpen: false, santriToEdit: null })}
        santriToEdit={santriFormState.santriToEdit}
        onSave={handleSaveSantri}
        existingCount={santriList.length}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        info={pesantrenInfo}
        adminUsers={adminUsers}
        currentAdmin={currentAdmin}
        onUpdateAdminUsers={(newUsers) => {
          setAdminUsers(newUsers);
          if (currentAdmin) {
            const updated = newUsers.find((u) => u.id === currentAdmin.id);
            if (updated) {
              setCurrentAdmin(updated);
            }
          }
        }}
        onSave={(newInfo) => {
          setPesantrenInfo(newInfo);
          showNotification('Informasi pesantren berhasil diperbarui.', 'success');
        }}
      />

      {/* 7. Batch Print Modal */}
      <BatchCardPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        santriList={santriList}
        pesantrenInfo={pesantrenInfo}
      />

      {/* 8. Auto Top-Up Configuration Modal */}
      {autoTopUpModalState.isOpen && (
        <AutoTopUpModal
          isOpen={autoTopUpModalState.isOpen}
          onClose={() =>
            setAutoTopUpModalState({
              isOpen: false,
              targetSantri: null,
              scheduleToEdit: null,
            })
          }
          santriList={santriList}
          targetSantri={autoTopUpModalState.targetSantri}
          scheduleToEdit={autoTopUpModalState.scheduleToEdit}
          onSaveSchedule={handleSaveAutoTopUpSchedule}
        />
      )}

      {/* 9. Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginPromptReason(null);
        }}
        adminUsers={adminUsers}
        onLoginSuccess={handleLoginSuccess}
        title={loginPromptReason?.title}
        subtitle={loginPromptReason?.subtitle}
      />

      {/* 10. Edit Admin Profile Modal */}
      <EditAdminModal
        isOpen={isEditAdminModalOpen}
        onClose={() => setIsEditAdminModalOpen(false)}
        admin={currentAdmin}
        allAdmins={adminUsers}
        currentAdmin={currentAdmin}
        onSave={handleSaveAdminProfile}
        onDeleteAdmin={(adminId) => {
          setAdminUsers((prev) => prev.filter((a) => a.id !== adminId));
          showNotification('Akun petugas berhasil dihapus.', 'success');
        }}
        onAddNewAdmin={(newAdmin) => {
          setAdminUsers((prev) => [...prev, newAdmin]);
          showNotification(`Petugas baru "${newAdmin.nama}" berhasil ditambahkan.`, 'success');
        }}
        onRequestSwitchToSuperAdmin={() => {
          setIsLoginModalOpen(true);
          setLoginPromptReason({
            title: 'Akses Admin Utama Diperlukan',
            subtitle: 'Silakan login sebagai Ahmad Gufron Zuldani untuk mengelola akun admin dan ganti password.',
          });
        }}
      />

      {/* 11. WhatsApp Contact Modal */}
      {whatsAppModalSantri && (
        <WhatsAppModal
          isOpen={!!whatsAppModalSantri}
          onClose={() => setWhatsAppModalSantri(null)}
          santri={santriList.find((s) => s.id === whatsAppModalSantri.id) || whatsAppModalSantri}
          pesantrenInfo={pesantrenInfo}
          latestTransaction={transactions.find((t) => t.santriId === whatsAppModalSantri.id)}
          onUpdatePhoneNumber={handleUpdateSantriPhone}
        />
      )}
    </div>
  );
}
