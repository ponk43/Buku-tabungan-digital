import React, { useState, useEffect } from 'react';
import { Santri, AutoTopUpSchedule, TopUpFrequency } from '../types';
import { getTodayDateString } from '../utils/autoTopUpUtils';
import { X, Calendar, RefreshCw, CheckCircle2, Clock, Wallet, HelpCircle, Save, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AutoTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  targetSantri?: Santri | null;
  scheduleToEdit?: AutoTopUpSchedule | null;
  onSaveSchedule: (schedule: AutoTopUpSchedule) => void;
}

const PRESET_AMOUNTS = [25000, 50000, 100000, 200000, 500000];

export const AutoTopUpModal: React.FC<AutoTopUpModalProps> = ({
  isOpen,
  onClose,
  santriList,
  targetSantri,
  scheduleToEdit,
  onSaveSchedule,
}) => {
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [amount, setAmount] = useState<number>(100000);
  const [amountStr, setAmountStr] = useState<string>('100.000');
  const [frequency, setFrequency] = useState<TopUpFrequency>('BULANAN');
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = Senin
  const [dayOfMonth, setDayOfMonth] = useState<number>(1); // Tgl 1
  const [sumberDana, setSumberDana] = useState<string>('Autodebet Rekening Wali (BSI)');
  const [catatan, setCatatan] = useState<string>('Uang saku bulanan dari orang tua');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      if (scheduleToEdit) {
        setSelectedSantriId(scheduleToEdit.santriId);
        setAmount(scheduleToEdit.nominal);
        setAmountStr(scheduleToEdit.nominal.toLocaleString('id-ID'));
        setFrequency(scheduleToEdit.frekuensi);
        setStartDate(scheduleToEdit.tanggalMulai);
        setSumberDana(scheduleToEdit.sumberDana || 'Autodebet Rekening Wali (BSI)');
        setCatatan(scheduleToEdit.catatan || '');
        setIsActive(scheduleToEdit.aktif);
        if (scheduleToEdit.frekuensi === 'MINGGUAN') {
          setDayOfWeek(scheduleToEdit.hariEksekusi || 1);
        } else if (scheduleToEdit.frekuensi === 'BULANAN') {
          setDayOfMonth(scheduleToEdit.hariEksekusi || 1);
        }
      } else {
        const initialSantri = targetSantri || santriList[0];
        setSelectedSantriId(initialSantri ? initialSantri.id : '');
        setAmount(100000);
        setAmountStr('100.000');
        setFrequency('BULANAN');
        setStartDate(getTodayDateString());
        setDayOfWeek(1);
        setDayOfMonth(1);
        setSumberDana('Autodebet Rekening Wali (BSI)');
        setCatatan('Uang saku santri otomatis');
        setIsActive(true);
      }
    }
  }, [isOpen, targetSantri, scheduleToEdit, santriList]);

  if (!isOpen) return null;

  const currentSelectedSantri = santriList.find((s) => s.id === selectedSantriId) || targetSantri;

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setAmountStr(val.toLocaleString('id-ID'));
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = Number(rawVal) || 0;
    setAmount(num);
    setAmountStr(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedSantri) {
      alert('Pilih santri terlebih dahulu.');
      return;
    }

    if (amount <= 0) {
      alert('Jumlah setoran otomatis harus lebih dari Rp 0.');
      return;
    }

    if (!startDate) {
      alert('Tentukan tanggal mulai setoran otomatis.');
      return;
    }

    const hariEksekusi =
      frequency === 'MINGGUAN' ? dayOfWeek : frequency === 'BULANAN' ? dayOfMonth : 0;

    const schedule: AutoTopUpSchedule = {
      id: scheduleToEdit ? scheduleToEdit.id : `atu-${Date.now()}`,
      santriId: currentSelectedSantri.id,
      santriNis: currentSelectedSantri.nis,
      santriNama: currentSelectedSantri.nama,
      nominal: amount,
      frekuensi: frequency,
      tanggalMulai: startDate,
      hariEksekusi,
      kategori: 'Top-Up Otomatis',
      sumberDana: sumberDana.trim(),
      catatan: catatan.trim(),
      aktif: isActive,
      terakhirDiproses: scheduleToEdit ? scheduleToEdit.terakhirDiproses : undefined,
      jadwalBerikutnya: scheduleToEdit ? scheduleToEdit.jadwalBerikutnya : startDate,
      totalTerproses: scheduleToEdit ? scheduleToEdit.totalTerproses : 0,
    };

    soundManager.playSuccessChime();
    onSaveSchedule(schedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {scheduleToEdit ? 'Ubah Pengaturan Top-Up Otomatis' : 'Jadwalkan Top-Up Otomatis'}
              </h3>
              <p className="text-xs text-emerald-100">
                Pengisian saldo berkala untuk uang saku dan tabungan santri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Santri Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Santri Penerima Setoran
            </label>
            {targetSantri ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                <img
                  src={targetSantri.fotoUrl}
                  alt={targetSantri.nama}
                  className="w-11 h-11 rounded-lg object-cover border-2 border-emerald-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {targetSantri.nis}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{targetSantri.kelas}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm truncate mt-0.5">
                    {targetSantri.nama}
                  </h4>
                  <p className="text-xs text-emerald-700 font-semibold">
                    Saldo saat ini: Rp {targetSantri.saldo.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ) : (
              <select
                value={selectedSantriId}
                onChange={(e) => setSelectedSantriId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none bg-white font-medium"
              >
                {santriList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nis}) - Saldo: Rp {s.saldo.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Jumlah Setoran (Nominal) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Jumlah Setoran Otomatis (Rp)
              </label>
              <span className="text-[11px] text-slate-500">Nominal per siklus</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500 font-bold text-lg">Rp</span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountInputChange}
                placeholder="0"
                required
                className="w-full pl-13 pr-4 py-2.5 text-2xl font-bold font-mono text-slate-900 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Quick preset chips */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAmountSelect(val)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all truncate px-1 ${
                    amount === val
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  +{val >= 1000 ? `${val / 1000}rb` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Frekuensi Setoran (Harian, Mingguan, Bulanan) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Frekuensi Setoran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('HARIAN')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  frequency === 'HARIAN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Harian</span>
                <span className="text-[10px] font-normal text-slate-500">Tiap hari</span>
              </button>

              <button
                type="button"
                onClick={() => setFrequency('MINGGUAN')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  frequency === 'MINGGUAN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Mingguan</span>
                <span className="text-[10px] font-normal text-slate-500">1x seminggu</span>
              </button>

              <button
                type="button"
                onClick={() => setFrequency('BULANAN')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                  frequency === 'BULANAN'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-700" />
                <span>Bulanan</span>
                <span className="text-[10px] font-normal text-slate-500">1x sebulan</span>
              </button>
            </div>
          </div>

          {/* Detail Hari / Tanggal Eksekusi Sesuai Frekuensi */}
          {frequency === 'MINGGUAN' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Hari Eksekusi Setiap Minggu
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:border-emerald-600 focus:outline-none"
              >
                <option value={1}>Setiap Hari Senin</option>
                <option value={2}>Setiap Hari Selasa</option>
                <option value={3}>Setiap Hari Rabu</option>
                <option value={4}>Setiap Hari Kamis</option>
                <option value={5}>Setiap Hari Jumat (Barakah)</option>
                <option value={6}>Setiap Hari Sabtu</option>
                <option value={0}>Setiap Hari Ahad / Minggu</option>
              </select>
            </div>
          )}

          {frequency === 'BULANAN' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Pilih Tanggal Eksekusi Setiap Bulan
              </label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:border-emerald-600 focus:outline-none"
              >
                <option value={1}>Setiap Tanggal 1 (Awal Bulan)</option>
                <option value={5}>Setiap Tanggal 5</option>
                <option value={10}>Setiap Tanggal 10</option>
                <option value={15}>Setiap Tanggal 15 (Tengah Bulan)</option>
                <option value={20}>Setiap Tanggal 20</option>
                <option value={25}>Setiap Tanggal 25 (Gajian Wali)</option>
                <option value={28}>Setiap Tanggal 28 (Akhir Bulan)</option>
              </select>
            </div>
          )}

          {/* Tanggal Mulai Setoran Otomatis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai Setoran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none bg-white font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Siklus dimulai sejak tanggal ini</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumber / Saluran Dana
              </label>
              <select
                value={sumberDana}
                onChange={(e) => setSumberDana(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none bg-white font-medium"
              >
                <option value="Autodebet Rekening Wali (BSI)">Autodebet Bank Syariah (BSI)</option>
                <option value="Autodebet Rekening Mandiri">Autodebet Bank Mandiri</option>
                <option value="Autodebet Rekening BRI / BCA">Autodebet BRI / BCA</option>
                <option value="Virtual Account Otomatis">Virtual Account Wali</option>
                <option value="Titipan Yayasan / Beasiswa">Titipan Yayasan / Donatur</option>
                <option value="Kas Tunai Bendahara">Kas Titipan Bendahara</option>
              </select>
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Pesan Pengiriman (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Uang saku jajan mingguan, titipan ibunda"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Status Jadwal Toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Status Top-Up Otomatis</span>
              <span className="text-[11px] text-slate-500">
                {isActive ? 'Aktif - sistem akan memproses otomatis' : 'Dijeda sementara oleh pengguna'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Ringkasan Jadwal (Summary Banner) */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold text-emerald-900">Ringkasan Jadwal Otomatis:</p>
              <p className="text-emerald-800 mt-0.5">
                Setoran sebesar <b>Rp {amount.toLocaleString('id-ID')}</b> akan otomatis ditambahkan ke tabungan ananda{' '}
                <b>{currentSelectedSantri?.nama || 'Santri'}</b> secara <b>{frequency.toLowerCase()}</b>, dimulai pada{' '}
                <b>{new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</b>.
              </p>
            </div>
          </div>

          {/* Buttons */}
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
              disabled={amount <= 0 || !startDate}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {scheduleToEdit ? 'Simpan Perubahan' : 'Aktifkan Top-Up Otomatis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
