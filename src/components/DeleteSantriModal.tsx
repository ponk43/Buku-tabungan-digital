import React, { useState } from 'react';
import { Santri, PesantrenInfo } from '../types';
import {
  X,
  AlertTriangle,
  Trash2,
  UserX,
  GraduationCap,
  ArrowRightLeft,
  Receipt,
  CheckCircle2,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppModal';
import { openWhatsApp, buildExitSantriMessage, normalizePhoneNumber } from '../utils/whatsapp';
import { soundManager } from '../utils/sound';

interface DeleteSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri;
  pesantrenInfo: PesantrenInfo;
  onConfirmDelete: (
    santriId: string,
    action: 'DELETE_PERMANENT' | 'SET_STATUS_KELUAR' | 'SET_STATUS_ALUMNI',
    options: {
      refundRemainingBalance: boolean;
      alasan: string;
      notifyWhatsApp: boolean;
    }
  ) => void;
}

export const DeleteSantriModal: React.FC<DeleteSantriModalProps> = ({
  isOpen,
  onClose,
  santri,
  pesantrenInfo,
  onConfirmDelete,
}) => {
  const [actionType, setActionType] = useState<'DELETE_PERMANENT' | 'SET_STATUS_KELUAR' | 'SET_STATUS_ALUMNI'>('DELETE_PERMANENT');
  const [alasan, setAlasan] = useState('Pindah Sekolah / Pondok Lain');
  const [customAlasan, setCustomAlasan] = useState('');
  const [refundBalance, setRefundBalance] = useState(santri.saldo > 0);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  if (!isOpen) return null;

  const finalAlasan = alasan === 'Lainnya' ? customAlasan : alasan;
  const cleanPhone = normalizePhoneNumber(santri.teleponWali);
  const hasPhone = cleanPhone.length >= 9;

  const handleConfirm = () => {
    soundManager.playClick();
    onConfirmDelete(santri.id, actionType, {
      refundRemainingBalance: refundBalance && santri.saldo > 0,
      alasan: finalAlasan || 'Santri telah keluar dari pondok pesantren',
      notifyWhatsApp: notifyWhatsApp && hasPhone,
    });

    // If user wants to open WA right now
    if (notifyWhatsApp && hasPhone) {
      const msg = buildExitSantriMessage(
        santri,
        pesantrenInfo,
        finalAlasan,
        refundBalance ? santri.saldo : undefined
      );
      openWhatsApp(santri.teleponWali, msg);
    }

    onClose();
  };

  const handlePreviewWhatsApp = () => {
    if (!hasPhone) return;
    const msg = buildExitSantriMessage(
      santri,
      pesantrenInfo,
      finalAlasan,
      refundBalance ? santri.saldo : undefined
    );
    openWhatsApp(santri.teleponWali, msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-rose-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs shadow-xs">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Keluar / Hapus Santri dari Pondok</h3>
              <p className="text-xs text-rose-100">
                Pengelolaan santri keluar, mutasi alumni, atau hapus data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Santri Card Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
            <img
              src={santri.fotoUrl}
              alt={santri.nama}
              className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                  {santri.nis}
                </span>
                <span className="text-[10px] text-slate-500">{santri.kelas}</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                {santri.nama}
              </h4>
              <p className="text-slate-500 text-[11px] truncate">
                Wali: <b className="text-slate-700">{santri.wali || '-'}</b>
                {santri.teleponWali ? ` • ${santri.teleponWali}` : ''}
              </p>
            </div>
          </div>

          {/* Sisa Saldo Alert */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
              santri.saldo > 0
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-700" />
                Sisa Saldo Tabungan Santri Saat Ini:
              </span>
              <span className="font-mono font-black text-sm text-emerald-800">
                Rp {santri.saldo.toLocaleString('id-ID')}
              </span>
            </div>

            {santri.saldo > 0 ? (
              <label className="flex items-start gap-2.5 pt-2 border-t border-amber-200/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={refundBalance}
                  onChange={(e) => setRefundBalance(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    Cairkan & kembalikan seluruh sisa saldo (Rp {santri.saldo.toLocaleString('id-ID')})
                  </span>
                  <span className="text-[11px] text-slate-600 font-normal">
                    Otomatis catat transaksi penarikan tutup buku agar saldo kas pesantren seimbang dan struk mutasi penarikan dapat dicetak.
                  </span>
                </div>
              </label>
            ) : (
              <p className="text-[11px] text-slate-500">
                Saldo tabungan santri adalah Rp 0. Tidak ada kewajiban pengembalian dana tabungan.
              </p>
            )}
          </div>

          {/* Pilihan Tindakan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2">
              Pilih Tindakan:
            </label>
            <div className="space-y-2">
              {/* Opsi 1: Hapus Permanen */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  actionType === 'DELETE_PERMANENT'
                    ? 'border-rose-500 bg-rose-50/70 ring-1 ring-rose-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="DELETE_PERMANENT"
                  checked={actionType === 'DELETE_PERMANENT'}
                  onChange={() => setActionType('DELETE_PERMANENT')}
                  className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                    <span className="font-bold text-slate-900 text-xs">
                      Hapus Permanen dari Sistem
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                      Disarankan untuk santri keluar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Menghapus data santri sepenuhnya dari daftar aktif dan mematikan jadwal top-up otomatis.
                  </p>
                </div>
              </label>

              {/* Opsi 2: Tandai Keluar / Mutasi */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  actionType === 'SET_STATUS_KELUAR'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="SET_STATUS_KELUAR"
                  checked={actionType === 'SET_STATUS_KELUAR'}
                  onChange={() => setActionType('SET_STATUS_KELUAR')}
                  className="mt-1 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-bold text-slate-900 text-xs">
                      Tandai Sebagai "Keluar / Pindah" (Arsipkan)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Data santri tetap tersimpan dalam sistem dengan status "Keluar", namun dinonaktifkan dari transaksi saku harian kasir.
                  </p>
                </div>
              </label>

              {/* Opsi 3: Tandai Alumni / Lulus */}
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  actionType === 'SET_STATUS_ALUMNI'
                    ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="SET_STATUS_ALUMNI"
                  checked={actionType === 'SET_STATUS_ALUMNI'}
                  onChange={() => setActionType('SET_STATUS_ALUMNI')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                    <span className="font-bold text-slate-900 text-xs">
                      Tandai Sebagai "Alumni / Telah Lulus"
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mengubah status santri menjadi Alumni bagi santri yang telah menyelesaikan jenjang pendidikan.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Alasan Keluar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Alasan / Keterangan:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                'Pindah Sekolah / Pondok Lain',
                'Telah Lulus / Alumni Pondok',
                'Mengundurkan Diri (Permintaan Wali)',
                'Selesai Masa Studi',
                'Salah Input / Data Duplikat',
                'Lainnya',
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setAlasan(item)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    alasan === item
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {alasan === 'Lainnya' && (
              <input
                type="text"
                value={customAlasan}
                onChange={(e) => setCustomAlasan(e.target.value)}
                placeholder="Tuliskan keterangan santri keluar..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-rose-500 focus:outline-none"
              />
            )}
          </div>

          {/* WhatsApp Notification Option */}
          {hasPhone && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-slate-900">
                    Kirim konfirmasi penutupan ke WhatsApp Wali
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                  {santri.teleponWali}
                </span>
              </label>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Pesan santun berisi rincian saldo dan penutupan tabungan santri.</span>
                <button
                  type="button"
                  onClick={handlePreviewWhatsApp}
                  className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 hover:underline"
                >
                  <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
                  Pratinjau Pesan WA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`py-2.5 px-5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer ${
              actionType === 'DELETE_PERMANENT'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-700/20'
                : actionType === 'SET_STATUS_KELUAR'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-700/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-700/20'
            }`}
          >
            {actionType === 'DELETE_PERMANENT' ? (
              <>
                <Trash2 className="w-4 h-4" />
                Hapus Data Santri Permanen
              </>
            ) : actionType === 'SET_STATUS_KELUAR' ? (
              <>
                <UserX className="w-4 h-4" />
                Simpan Status Santri Keluar
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                Simpan Status Sebagai Alumni
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
