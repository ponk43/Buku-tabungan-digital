import React, { useState } from 'react';
import { Santri, Transaction, TransactionType, PesantrenInfo, AdminUser } from '../types';
import { soundManager } from '../utils/sound';
import { ArrowDownLeft, ArrowUpRight, X, AlertTriangle, Wallet } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri;
  initialType?: TransactionType;
  pesantrenInfo: PesantrenInfo;
  currentAdmin?: AdminUser | null;
  onTransactionSuccess: (newTrx: Transaction, updatedSantri: Santri) => void;
}

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  santri,
  initialType = 'SETOR',
  pesantrenInfo,
  currentAdmin,
  onTransactionSuccess,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<number>(0);
  const [inputStr, setInputStr] = useState<string>('');
  const [kategori, setKategori] = useState<string>(
    initialType === 'SETOR' ? 'Titipan Wali' : 'Uang Saku'
  );
  const [keterangan, setKeterangan] = useState<string>('');
  const [overrideLimit, setOverrideLimit] = useState(false);
  const [kasirName, setKasirName] = useState<string>(
    currentAdmin ? currentAdmin.nama : pesantrenInfo.bendahara
  );

  if (!isOpen) return null;

  const sisaLimitHariIni = Math.max(0, santri.limitHarian - santri.pengeluaranHariIni);
  const isOverSaldo = type === 'TARIK' && amount > santri.saldo;
  const isOverLimit = type === 'TARIK' && amount > sisaLimitHariIni;

  const handleAmountChange = (val: number) => {
    setAmount(val);
    setInputStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = Number(rawVal) || 0;
    setAmount(num);
    setInputStr(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    if (type === 'TARIK' && amount > santri.saldo) {
      soundManager.playWarningTone();
      alert('Gagal: Saldo santri tidak mencukupi untuk penarikan ini.');
      return;
    }

    if (type === 'TARIK' && isOverLimit && !overrideLimit) {
      soundManager.playWarningTone();
      alert(`Peringatan: Penarikan melebihi sisa batas harian santri (Sisa: Rp ${sisaLimitHariIni.toLocaleString('id-ID')}). Centang "Izinkan izin khusus wali" jika telah disetujui.`);
      return;
    }

    const saldoSebelum = santri.saldo;
    const saldoSesudah = type === 'SETOR' ? saldoSebelum + amount : saldoSebelum - amount;
    const pengeluaranHariIniBaru = type === 'TARIK' ? santri.pengeluaranHariIni + amount : santri.pengeluaranHariIni;

    const trxId = `TRX-${Date.now().toString().slice(-6)}`;
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      kodeTransaksi: trxId,
      santriId: santri.id,
      santriNis: santri.nis,
      santriNama: santri.nama,
      tipe: type,
      nominal: amount,
      saldoSebelum,
      saldoSesudah,
      keterangan: keterangan.trim() || (type === 'SETOR' ? 'Setoran tabungan santri' : 'Penarikan uang saku'),
      kategori,
      waktu: new Date().toISOString(),
      kasir: kasirName || 'Bendahara',
    };

    const updatedSantri: Santri = {
      ...santri,
      saldo: saldoSesudah,
      pengeluaranHariIni: pengeluaranHariIniBaru,
    };

    soundManager.playSuccessChime();
    onTransactionSuccess(newTrx, updatedSantri);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between transition-colors ${
          type === 'SETOR' ? 'bg-emerald-800' : 'bg-amber-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {type === 'SETOR' ? (
                <ArrowDownLeft className="w-6 h-6 text-white" />
              ) : (
                <ArrowUpRight className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {type === 'SETOR' ? 'Setor Tabungan Santri' : 'Tarik Uang Saku Santri'}
              </h3>
              <p className="text-xs text-white/80">Transaksi resmi kas tabungan santri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Santri Card Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
            <img
              src={santri.fotoUrl}
              alt={santri.nama}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  {santri.nis}
                </span>
                <span className="text-[11px] text-slate-500 truncate">{santri.kelas}</span>
              </div>
              <h4 className="font-bold text-slate-900 truncate text-sm mt-0.5">{santri.nama}</h4>
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="text-slate-600">
                  Saldo: <b className="text-emerald-700 font-bold">Rp {santri.saldo.toLocaleString('id-ID')}</b>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">
                  Limit Sisa: <b className="text-amber-700 font-bold">Rp {sisaLimitHariIni.toLocaleString('id-ID')}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setType('SETOR');
                setKategori('Titipan Wali');
              }}
              className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                type === 'SETOR'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Setor Tunai
            </button>
            <button
              type="button"
              onClick={() => {
                setType('TARIK');
                setKategori('Uang Saku');
              }}
              className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                type === 'TARIK'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Tarik Tunai
            </button>
          </div>

          {/* Nominal Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Nominal Transaksi (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-bold text-lg">Rp</span>
              <input
                type="text"
                value={inputStr}
                onChange={handleInputChange}
                placeholder="0"
                autoFocus
                className="w-full pl-13 pr-4 py-2.5 text-2xl font-bold font-mono text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAmountChange(val)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    amount === val
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  +{val.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>

          {/* Warning Notices */}
          {isOverSaldo && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Saldo Tidak Cukup!</p>
                <p>Santri hanya memiliki saldo Rp {santri.saldo.toLocaleString('id-ID')}.</p>
              </div>
            </div>
          )}

          {isOverLimit && !isOverSaldo && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Melebihi Limit Uang Saku Harian!</p>
                  <p>
                    Batas sisa hari ini: <b>Rp {sisaLimitHariIni.toLocaleString('id-ID')}</b> (Total limit: Rp {santri.limitHarian.toLocaleString('id-ID')}).
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 pt-1 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={overrideLimit}
                  onChange={(e) => setOverrideLimit(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>Izinkan penarikan darurat (dengan persetujuan wali/ustadz)</span>
              </label>
            </div>
          )}

          {/* Kategori & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
              >
                {type === 'SETOR' ? (
                  <>
                    <option value="Titipan Wali">Titipan Wali Santri</option>
                    <option value="Tabungan Bulanan">Tabungan Rutin Bulanan</option>
                    <option value="Uang Saku Tambahan">Uang Saku Tambahan</option>
                    <option value="Beasiswa/Hadiah">Hadiah / Beasiswa Prestasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </>
                ) : (
                  <>
                    <option value="Uang Saku">Uang Saku Harian</option>
                    <option value="Belanja Koperasi">Belanja Koperasi / Kantin</option>
                    <option value="Beli Kitab & ATK">Beli Kitab & Alat Tulis</option>
                    <option value="Biaya Kesehatan">Obat / Layanan Kesehatan</option>
                    <option value="Keperluan Santri">Keperluan Mandiri Santri</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kasir / Bendahara</label>
              <input
                type="text"
                value={kasirName}
                onChange={(e) => setKasirName(e.target.value)}
                placeholder="Nama kasir/bendahara"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / Keterangan (Opsional)</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Titipan bapak saat sambangan / belanja sabun & odol"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Saldo Simulation Preview */}
          {amount > 0 && !isOverSaldo && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-4 h-4 text-emerald-700" />
                Estimasi Saldo Baru:
              </span>
              <span className="font-bold text-base font-mono text-emerald-800">
                Rp{' '}
                {(type === 'SETOR' ? santri.saldo + amount : santri.saldo - amount).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || isOverSaldo || (isOverLimit && !overrideLimit)}
              className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 ${
                type === 'SETOR' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {type === 'SETOR' ? (
                <>
                  <ArrowDownLeft className="w-4 h-4" />
                  Konfirmasi Setoran
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Konfirmasi Penarikan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
