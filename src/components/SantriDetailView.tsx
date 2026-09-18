import React from 'react';
import { Santri, Transaction, TransactionType, PesantrenInfo, AutoTopUpSchedule } from '../types';
import { BarcodeView } from './BarcodeView';
import { WhatsAppIcon } from './WhatsAppModal';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  Edit,
  Phone,
  Clock,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Sparkles,
  User,
  PlusCircle,
} from 'lucide-react';

interface SantriDetailViewProps {
  santri: Santri;
  transactions: Transaction[];
  pesantrenInfo: PesantrenInfo;
  autoTopUpSchedule?: AutoTopUpSchedule | null;
  onOpenTransaction: (type: TransactionType) => void;
  onOpenCardModal: () => void;
  onEditSantri: () => void;
  onConfigureAutoTopUp: () => void;
  onOpenWhatsApp: (santri: Santri) => void;
  onClose: () => void;
}

export const SantriDetailView: React.FC<SantriDetailViewProps> = ({
  santri,
  transactions,
  pesantrenInfo,
  autoTopUpSchedule,
  onOpenTransaction,
  onOpenCardModal,
  onEditSantri,
  onConfigureAutoTopUp,
  onOpenWhatsApp,
  onClose,
}) => {
  const santriTrx = transactions.filter((t) => t.santriId === santri.id);
  const sisaLimit = Math.max(0, santri.limitHarian - santri.pengeluaranHariIni);
  const limitPct = Math.min(100, Math.round((santri.pengeluaranHariIni / santri.limitHarian) * 100));

  const handleWhatsAppWali = () => {
    const cleanPhone = santri.teleponWali.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const msg = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${santri.wali}, menginformasikan saldo tabungan ananda ${santri.nama} (NIS: ${santri.nis}) di ${pesantrenInfo.namaPesantren} saat ini adalah Rp ${santri.saldo.toLocaleString('id-ID')}. Terima kasih.`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner with Santri Basic Info */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Identitas */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={santri.fotoUrl}
                alt={santri.nama}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/90 shadow-lg"
              />
              <span className="absolute -bottom-2 -right-1 bg-amber-400 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                {santri.gender === 'L' ? 'Santri' : 'Santriwati'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded border border-white/20 backdrop-blur-xs">
                  {santri.nis}
                </span>
                <span className="text-xs bg-emerald-900/60 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {santri.status}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1">
                {santri.nama}
              </h2>
              <p className="text-xs md:text-sm text-emerald-100/90 font-medium">
                {santri.kelas} • {santri.asrama}
              </p>
            </div>
          </div>

          {/* Quick Barcode view on banner */}
          <div className="bg-white p-2.5 rounded-xl shadow-md border border-white/20 flex flex-col items-center">
            <BarcodeView
              value={santri.nis}
              height={32}
              width={1.5}
              fontSize={10}
              lineColor="#0f172a"
            />
            <span className="text-[9px] text-slate-400 font-mono">Barcode Kartu Terdaftar</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Saldo Tabungan */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Total Saldo Tabungan
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm font-bold text-emerald-700">Rp</span>
              <span className="text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
                {santri.saldo.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tersedia untuk uang saku & kebutuhan
            </p>
          </div>

          {/* Card 2: Limit Uang Saku Hari Ini */}
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200 shadow-xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                Kuota Saku Hari Ini
              </span>
              <span className="text-xs font-bold text-amber-800">
                Sisa Rp {sisaLimit.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm font-bold text-amber-700">Rp</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">
                {santri.pengeluaranHariIni.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">
                  / Rp {santri.limitHarian.toLocaleString('id-ID')}
                </span>
              </span>
            </div>
            {/* Limit Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    limitPct >= 90 ? 'bg-red-500' : limitPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${limitPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>{limitPct}% terpakai hari ini</span>
                <span>Max: Rp {santri.limitHarian.toLocaleString('id-ID')}/hari</span>
              </div>
            </div>
          </div>

          {/* Card 3: Informasi Wali & Kontak */}
          <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                  Wali Santri
                </span>
                {santri.teleponWali && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    WA Aktif
                  </span>
                )}
              </div>
              <p className="font-bold text-slate-900 text-sm mt-1 truncate">{santri.wali || 'Belum Diisi'}</p>
              
              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-600 font-mono font-semibold">
                  {santri.teleponWali || <span className="text-amber-700 font-sans italic font-normal">Belum ada nomor telepon</span>}
                </span>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-emerald-200/60 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenWhatsApp(santri)}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{santri.teleponWali ? 'Hubungi via WhatsApp' : 'Atur No. WhatsApp Wali'}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                {santri.teleponWali ? (
                  <a
                    href={`tel:${santri.teleponWali}`}
                    className="hover:text-emerald-800 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    Panggil Telepon Seluler
                  </a>
                ) : (
                  <span className="text-amber-700 italic">Klik tombol untuk menambah nomor</span>
                )}
                <button
                  type="button"
                  onClick={onEditSantri}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                >
                  Edit Profil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fitur Top-Up Otomatis Santri Banner */}
        <div className="p-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50/40 rounded-2xl border border-teal-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                  Fitur Top-Up Otomatis
                </span>
                {autoTopUpSchedule ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      autoTopUpSchedule.aktif
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {autoTopUpSchedule.aktif ? 'Jadwal Aktif' : 'Dijeda'}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                    Belum Diatur
                  </span>
                )}
              </div>

              {autoTopUpSchedule ? (
                <p className="text-xs text-teal-900 mt-0.5">
                  Setoran rutin <b>Rp {autoTopUpSchedule.nominal.toLocaleString('id-ID')}</b> /{' '}
                  <b className="uppercase">{autoTopUpSchedule.frekuensi}</b>. Dimulai sejak{' '}
                  {new Date(autoTopUpSchedule.tanggalMulai).toLocaleDateString('id-ID', {
                    dateStyle: 'medium',
                  })}
                  . Berikutnya:{' '}
                  <b className="text-emerald-800">
                    {new Date(autoTopUpSchedule.jadwalBerikutnya).toLocaleDateString('id-ID', {
                      dateStyle: 'medium',
                    })}
                  </b>
                  .
                </p>
              ) : (
                <p className="text-xs text-slate-600 mt-0.5">
                  Atur setoran otomatis (harian, mingguan, bulanan) langsung dari orang tua atau wali santri.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onConfigureAutoTopUp}
            className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {autoTopUpSchedule ? 'Ubah Top-Up Otomatis' : 'Atur Top-Up Otomatis'}
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onOpenTransaction('SETOR')}
            className="flex-1 min-w-[160px] py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Setor Tabungan (F1)
          </button>

          <button
            type="button"
            onClick={() => onOpenTransaction('TARIK')}
            className="flex-1 min-w-[160px] py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Tarik Uang Saku (F2)
          </button>

          <button
            type="button"
            onClick={onConfigureAutoTopUp}
            className="py-3 px-4 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl font-semibold text-sm border border-teal-200 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-teal-700" />
            Top-Up Otomatis
          </button>

          <button
            type="button"
            onClick={onOpenCardModal}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm border border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-emerald-700" />
            Kartu Santri & Barcode
          </button>

          <button
            type="button"
            onClick={onEditSantri}
            className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm border border-slate-300 transition-all"
            title="Edit Profil Santri"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 text-slate-500 hover:text-slate-800 text-sm font-medium ml-auto"
          >
            Tutup Panel
          </button>
        </div>

        {/* Mutasi Transaksi Santri Ini */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              Riwayat Mutasi Tabungan {santri.nama.split(' ')[0]}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {santriTrx.length} Transaksi Tercatat
            </span>
          </div>

          {santriTrx.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
              Belum ada riwayat transaksi untuk santri ini. Lakukan setor atau tarik tunai pertama.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Waktu</th>
                      <th className="py-2.5 px-4">No. Trx</th>
                      <th className="py-2.5 px-4">Jenis</th>
                      <th className="py-2.5 px-4">Kategori</th>
                      <th className="py-2.5 px-4">Nominal</th>
                      <th className="py-2.5 px-4">Saldo Akhir</th>
                      <th className="py-2.5 px-4">Kasir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {santriTrx.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 font-mono">
                          {new Date(trx.waktu).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                          {trx.kodeTransaksi}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              trx.tipe === 'SETOR'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {trx.tipe === 'SETOR' ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {trx.tipe === 'SETOR' ? 'SETOR' : 'TARIK'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          {trx.kategori}
                          {trx.keterangan && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {trx.keterangan}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-bold font-mono">
                          <span
                            className={
                              trx.tipe === 'SETOR' ? 'text-emerald-700' : 'text-amber-700'
                            }
                          >
                            {trx.tipe === 'SETOR' ? '+' : '-'} Rp{' '}
                            {trx.nominal.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-800 font-semibold">
                          Rp {trx.saldoSesudah.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{trx.kasir}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
