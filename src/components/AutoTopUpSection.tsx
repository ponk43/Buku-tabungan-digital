import React, { useState } from 'react';
import { AutoTopUpSchedule, Santri } from '../types';
import { isScheduleDue } from '../utils/autoTopUpUtils';
import {
  RefreshCw,
  Plus,
  Calendar,
  Clock,
  Wallet,
  Play,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Check,
  Pause,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';

interface AutoTopUpSectionProps {
  schedules: AutoTopUpSchedule[];
  santriList: Santri[];
  onAddNew: () => void;
  onEditSchedule: (schedule: AutoTopUpSchedule) => void;
  onToggleActive: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onExecuteSchedule: (schedule: AutoTopUpSchedule) => void;
  onExecuteAllDue: () => void;
  onSelectSantri: (santriId: string) => void;
}

export const AutoTopUpSection: React.FC<AutoTopUpSectionProps> = ({
  schedules,
  santriList,
  onAddNew,
  onEditSchedule,
  onToggleActive,
  onDeleteSchedule,
  onExecuteSchedule,
  onExecuteAllDue,
  onSelectSantri,
}) => {
  const [search, setSearch] = useState('');
  const [filterFreq, setFilterFreq] = useState<'ALL' | 'HARIAN' | 'MINGGUAN' | 'BULANAN'>('ALL');

  const dueSchedules = schedules.filter((s) => isScheduleDue(s));
  const activeSchedules = schedules.filter((s) => s.aktif);

  const filtered = schedules.filter((s) => {
    const matchFreq = filterFreq === 'ALL' || s.frekuensi === filterFreq;
    const matchSearch =
      s.santriNama.toLowerCase().includes(search.toLowerCase()) ||
      s.santriNis.toLowerCase().includes(search.toLowerCase()) ||
      (s.sumberDana && s.sumberDana.toLowerCase().includes(search.toLowerCase()));
    return matchFreq && matchSearch;
  });

  // Calculate monthly estimated volume
  const monthlyEstimate = activeSchedules.reduce((acc, curr) => {
    let multiplier = 1;
    if (curr.frekuensi === 'HARIAN') multiplier = 30;
    else if (curr.frekuensi === 'MINGGUAN') multiplier = 4;
    return acc + curr.nominal * multiplier;
  }, 0);

  return (
    <div className="space-y-5">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <RefreshCw className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Jadwal Top-Up Aktif</span>
            <p className="text-lg font-bold text-slate-900 font-mono">
              {activeSchedules.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">
                dari {schedules.length} jadwal
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Wallet className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Estimasi Dana Otomatis / Bln</span>
            <p className="text-lg font-bold text-teal-800 font-mono">
              Rp {monthlyEstimate.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              dueSchedules.length > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Jatuh Tempo Hari Ini</span>
              <p className="text-lg font-bold text-amber-800 font-mono">
                {dueSchedules.length} Santri
              </p>
            </div>
          </div>

          {dueSchedules.length > 0 && (
            <button
              type="button"
              onClick={onExecuteAllDue}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all active:scale-[0.98] flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              Eksekusi ({dueSchedules.length})
            </button>
          )}
        </div>
      </div>

      {/* Due Banner if any */}
      {dueSchedules.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <p className="text-sm font-bold">
                Terdapat {dueSchedules.length} setoran otomatis santri yang jatuh tempo hari ini
              </p>
              <p className="text-xs text-amber-800">
                Klik tombol untuk mengkreditkan dana ke rekening tabungan santri secara serentak.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onExecuteAllDue}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Jalankan Top-Up Otomatis Sekarang
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters, and New Schedule Button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari santri, NIS, atau sumber dana autodebet..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterFreq('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterFreq === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({schedules.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterFreq('HARIAN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterFreq === 'HARIAN'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Harian
            </button>
            <button
              type="button"
              onClick={() => setFilterFreq('MINGGUAN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterFreq === 'MINGGUAN'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mingguan
            </button>
            <button
              type="button"
              onClick={() => setFilterFreq('BULANAN')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterFreq === 'BULANAN'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulanan
            </button>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Jadwalkan Top-Up
          </button>
        </div>
      </div>

      {/* Schedules List Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-2">
          <RefreshCw className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700">Belum ada jadwal top-up otomatis</p>
          <p className="text-xs">Klik tombol "Jadwalkan Top-Up" untuk menambahkan setoran rutin santri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((schedule) => {
            const santri = santriList.find((s) => s.id === schedule.santriId);
            const isDue = isScheduleDue(schedule);

            return (
              <div
                key={schedule.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                  !schedule.aktif
                    ? 'border-slate-200 opacity-70 bg-slate-50/50'
                    : isDue
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200 hover:border-emerald-500'
                }`}
              >
                {/* Card Top: Santri Identity & Status */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          santri?.fotoUrl ||
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={schedule.santriNama}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {schedule.santriNis}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              schedule.aktif
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {schedule.aktif ? 'Aktif' : 'Dijeda'}
                          </span>
                        </div>
                        <h4
                          onClick={() => onSelectSantri(schedule.santriId)}
                          className="font-bold text-base text-slate-900 hover:text-emerald-700 cursor-pointer mt-0.5"
                        >
                          {schedule.santriNama}
                        </h4>
                        {santri && (
                          <p className="text-xs text-slate-400">{santri.kelas}</p>
                        )}
                      </div>
                    </div>

                    {/* Nominal & Frequency Badge */}
                    <div className="text-right">
                      <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {schedule.frekuensi}
                      </span>
                      <p className="text-lg font-black text-emerald-800 font-mono mt-1">
                        Rp {schedule.nominal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Details Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Tanggal Mulai</span>
                      <p className="font-medium text-slate-700">
                        {new Date(schedule.tanggalMulai).toLocaleDateString('id-ID', {
                          dateStyle: 'medium',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Jadwal Berikutnya</span>
                      <p className={`font-bold flex items-center gap-1 ${
                        isDue ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {new Date(schedule.jadwalBerikutnya).toLocaleDateString('id-ID', {
                          dateStyle: 'medium',
                        })}
                        {isDue && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            Hari ini!
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Sumber Dana</span>
                      <p className="text-slate-600 truncate">{schedule.sumberDana || 'Autodebet Wali'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Riwayat Terproses</span>
                      <p className="text-slate-600">
                        {schedule.totalTerproses || 0} kali eksekusi
                      </p>
                    </div>
                  </div>

                  {schedule.catatan && (
                    <p className="mt-2.5 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{schedule.catatan}"
                    </p>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleActive(schedule.id)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        schedule.aktif
                          ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      }`}
                      title={schedule.aktif ? 'Jeda Jadwal' : 'Aktifkan Jadwal'}
                    >
                      {schedule.aktif ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{schedule.aktif ? 'Jeda' : 'Aktifkan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditSchedule(schedule)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Ubah Pengaturan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus jadwal top-up otomatis untuk ${schedule.santriNama}?`)) {
                          onDeleteSchedule(schedule.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Manual trigger / run button */}
                  <button
                    type="button"
                    onClick={() => onExecuteSchedule(schedule)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-[0.98] flex items-center gap-1.5"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Top-Up Sekarang
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
