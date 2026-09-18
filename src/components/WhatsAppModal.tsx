import React, { useState, useEffect } from 'react';
import { Santri, PesantrenInfo, Transaction } from '../types';
import {
  X,
  Send,
  Phone,
  User,
  MessageCircle,
  Sparkles,
  AlertTriangle,
  Receipt,
  Edit2,
  Check,
  ExternalLink,
  Copy,
  CheckCheck,
} from 'lucide-react';
import {
  normalizePhoneNumber,
  openWhatsApp,
  buildSaldoMessage,
  buildLowBalanceMessage,
  buildGreetingMessage,
  buildReceiptMessage,
} from '../utils/whatsapp';
import { soundManager } from '../utils/sound';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri;
  pesantrenInfo: PesantrenInfo;
  latestTransaction?: Transaction;
  onUpdatePhoneNumber?: (santriId: string, newPhone: string) => void;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  santri,
  pesantrenInfo,
  latestTransaction,
  onUpdatePhoneNumber,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'saldo' | 'low' | 'chat' | 'receipt'>('saldo');
  const [customMessage, setCustomMessage] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(santri.teleponWali || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPhoneNumber(santri.teleponWali || '');
    setIsEditingPhone(!santri.teleponWali);
  }, [santri]);

  // Update message when template or santri changes
  useEffect(() => {
    if (selectedTemplate === 'saldo') {
      setCustomMessage(buildSaldoMessage(santri, pesantrenInfo));
    } else if (selectedTemplate === 'low') {
      setCustomMessage(buildLowBalanceMessage(santri, pesantrenInfo));
    } else if (selectedTemplate === 'receipt' && latestTransaction) {
      setCustomMessage(buildReceiptMessage(santri, latestTransaction, pesantrenInfo));
    } else {
      setCustomMessage(buildGreetingMessage(santri, pesantrenInfo));
    }
  }, [selectedTemplate, santri, pesantrenInfo, latestTransaction]);

  if (!isOpen) return null;

  const cleanPhone = normalizePhoneNumber(phoneNumber);
  const hasValidPhone = cleanPhone.length >= 9;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePhoneNumber) {
      onUpdatePhoneNumber(santri.id, phoneNumber);
    }
    setIsEditingPhone(false);
    soundManager.playClick();
  };

  const handleSendWhatsApp = () => {
    if (!hasValidPhone) {
      setIsEditingPhone(true);
      return;
    }
    soundManager.playSuccess();
    openWhatsApp(phoneNumber, customMessage);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    soundManager.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                Hubungi WhatsApp Wali Santri
              </h3>
              <p className="text-xs text-emerald-100">
                {santri.nama} • {santri.nis}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700/80 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Card Kontak Wali */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-200/70 text-emerald-900 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                    Wali Santri
                  </span>
                  <p className="font-bold text-slate-900 text-xs">{santri.wali || 'Belum Diisi'}</p>
                </div>
              </div>

              {!isEditingPhone && (
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-100/60"
                >
                  <Edit2 className="w-3 h-3" />
                  Ubah Nomor
                </button>
              )}
            </div>

            {/* Form Input No Telp Wali jika diedit atau kosong */}
            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="pt-2 border-t border-emerald-200/60 flex gap-2 items-center">
                <div className="relative flex-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!phoneNumber.trim()}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 shrink-0 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan
                </button>
                {santri.teleponWali && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneNumber(santri.teleponWali);
                      setIsEditingPhone(false);
                    }}
                    className="px-2 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg text-xs"
                  >
                    Batal
                  </button>
                )}
              </form>
            ) : (
              <div className="flex items-center justify-between pt-1 text-slate-700">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{phoneNumber || <span className="text-amber-700 italic">Belum ada nomor telepon</span>}</span>
                  {hasValidPhone && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded">
                      WA Ready (+{cleanPhone})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Template Pilihan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Pilih Format Pesan WhatsApp:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate('saldo');
                  soundManager.playClick();
                }}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'saldo'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-emerald-300 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Info Saldo Terkini</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Rincian saldo & jatah harian</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate('low');
                  soundManager.playClick();
                }}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'low'
                    ? 'border-amber-600 bg-amber-50/80 ring-1 ring-amber-500 text-amber-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-amber-300 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Peringatan Saldo Menipis</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Permintaan isi ulang saldo</p>
                </div>
              </button>

              {latestTransaction && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate('receipt');
                    soundManager.playClick();
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                    selectedTemplate === 'receipt'
                      ? 'border-teal-600 bg-teal-50/80 ring-1 ring-teal-500 text-teal-950 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-teal-300 text-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Bukti Transaksi Terakhir</p>
                    <p className="text-[10px] text-slate-500 font-normal mt-0.5">Kirim kwitansi {latestTransaction.tipe}</p>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate('chat');
                  soundManager.playClick();
                }}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  selectedTemplate === 'chat'
                    ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500 text-indigo-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Sapaan & Chat Bebas</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Kirim pesan pembuka santun</p>
                </div>
              </button>
            </div>
          </div>

          {/* Pratinjau & Edit Teks Pesan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Isi Pesan WhatsApp (Bisa Diedit):
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[10px] text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-semibold"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Salin Teks
                  </>
                )}
              </button>
            </div>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={7}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-sans focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
              placeholder="Tulis pesan..."
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Pesan ini akan otomatis terbuka di aplikasi WhatsApp Web / Desktop / HP.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={!hasValidPhone}
            className="flex-1 max-w-xs py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            Buka & Kirim di WhatsApp
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
