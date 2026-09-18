import React from 'react';
import { Transaction, PesantrenInfo, Santri } from '../types';
import { Printer, CheckCircle2, X, Phone } from 'lucide-react';
import { BarcodeView } from './BarcodeView';
import { WhatsAppIcon } from './WhatsAppModal';
import { openWhatsApp, buildReceiptMessage } from '../utils/whatsapp';
import { soundManager } from '../utils/sound';

interface StrukModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  pesantrenInfo: PesantrenInfo;
  santri?: Santri;
  onOpenWhatsApp?: (santri: Santri) => void;
}

export const StrukModal: React.FC<StrukModalProps> = ({
  isOpen,
  onClose,
  transaction,
  pesantrenInfo,
  santri,
  onOpenWhatsApp,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (!santri) return;
    if (onOpenWhatsApp) {
      onOpenWhatsApp(santri);
      return;
    }
    if (santri.teleponWali) {
      soundManager.playSuccess();
      const msg = buildReceiptMessage(santri, transaction, pesantrenInfo);
      openWhatsApp(santri.teleponWali, msg);
    }
  };

  const formattedDate = new Date(transaction.waktu).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header bar */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Bukti Transaksi Berhasil</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Struk Area */}
        <div className="p-6 bg-slate-100 flex flex-col items-center overflow-y-auto">
          <div
            id="printable-receipt"
            className="w-full bg-white p-5 rounded-xl shadow border border-dashed border-slate-300 font-mono text-xs text-slate-800 space-y-3"
          >
            {/* Pesantren Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-300 space-y-1">
              {pesantrenInfo.logoUrl && (
                <div className="flex justify-center mb-1">
                  <img
                    src={pesantrenInfo.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain mx-auto"
                  />
                </div>
              )}
              <h4 className="font-bold text-sm tracking-tight text-slate-900 font-sans">
                {pesantrenInfo.namaPesantren}
              </h4>
              <p className="text-[10px] text-slate-500 font-sans">{pesantrenInfo.subTitle}</p>
              <p className="text-[9px] text-slate-400 font-sans">{pesantrenInfo.telepon}</p>
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Trx:</span>
                <span className="font-bold">{transaction.kodeTransaksi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{transaction.kasir}</span>
              </div>
            </div>

            {/* Santri Info */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Santri:</span>
                <span className="font-bold text-right truncate max-w-[170px]">{transaction.santriNama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NIS:</span>
                <span className="font-bold">{transaction.santriNis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis:</span>
                <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  transaction.tipe === 'SETOR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {transaction.tipe === 'SETOR' ? 'SETOR TABUNGAN' : 'PENARIKAN UANG SAKU'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span>{transaction.kategori}</span>
              </div>
              {transaction.keterangan && (
                <div className="flex justify-between text-[10px] text-slate-500 italic">
                  <span>Catatan:</span>
                  <span className="text-right max-w-[170px]">{transaction.keterangan}</span>
                </div>
              )}
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between text-slate-600">
                <span>Saldo Awal:</span>
                <span>Rp {transaction.saldoSebelum.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 border-y border-dashed border-slate-300 py-1.5">
                <span>NOMINAL:</span>
                <span className={transaction.tipe === 'SETOR' ? 'text-emerald-700' : 'text-amber-700'}>
                  {transaction.tipe === 'SETOR' ? '+' : '-'} Rp {transaction.nominal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-0.5">
                <span>SISA SALDO:</span>
                <span className="text-emerald-800 text-sm">
                  Rp {transaction.saldoSesudah.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="pt-2 border-t border-dashed border-slate-300 text-center space-y-1.5">
              <BarcodeView
                value={transaction.kodeTransaksi}
                height={26}
                width={1.2}
                fontSize={9}
              />
              <p className="text-[10px] text-slate-500 font-sans">
                Simpan struk ini sebagai bukti transaksi yang sah.
              </p>
              <p className="text-[9px] text-slate-400 font-sans italic">
                Jazakumullah Khairan Katsiran
              </p>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
          {santri && (
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>
                {santri.teleponWali
                  ? `Kirim Struk ke WA Wali (${santri.wali || santri.nama})`
                  : 'Kirim Struk ke WhatsApp Wali'}
              </span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Selesai
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
