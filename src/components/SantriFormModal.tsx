import React, { useState, useEffect } from 'react';
import { Santri, SantriStatus } from '../types';
import { X, UserPlus, Save, Phone, Trash2, UserX, CheckCircle2 } from 'lucide-react';
import { BarcodeView } from './BarcodeView';
import { WhatsAppIcon } from './WhatsAppModal';
import { openWhatsApp, normalizePhoneNumber } from '../utils/whatsapp';

interface SantriFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriToEdit?: Santri | null;
  onSave: (santri: Santri) => void;
  onDeleteSantri?: (santri: Santri) => void;
  existingCount: number;
}

export const SantriFormModal: React.FC<SantriFormModalProps> = ({
  isOpen,
  onClose,
  santriToEdit,
  onSave,
  onDeleteSantri,
  existingCount,
}) => {
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [kelas, setKelas] = useState('');
  const [asrama, setAsrama] = useState('');
  const [wali, setWali] = useState('');
  const [teleponWali, setTeleponWali] = useState('');
  const [saldo, setSaldo] = useState<number>(100000);
  const [limitHarian, setLimitHarian] = useState<number>(40000);
  const [fotoUrl, setFotoUrl] = useState('');
  const [status, setStatus] = useState<SantriStatus>('Aktif');

  useEffect(() => {
    if (isOpen) {
      if (santriToEdit) {
        setNis(santriToEdit.nis);
        setNama(santriToEdit.nama);
        setGender(santriToEdit.gender);
        setKelas(santriToEdit.kelas);
        setAsrama(santriToEdit.asrama);
        setWali(santriToEdit.wali);
        setTeleponWali(santriToEdit.teleponWali);
        setSaldo(santriToEdit.saldo);
        setLimitHarian(santriToEdit.limitHarian);
        setFotoUrl(santriToEdit.fotoUrl);
        setStatus(santriToEdit.status || 'Aktif');
      } else {
        // Auto generate next NIS
        const nextNum = String(existingCount + 1).padStart(3, '0');
        const year = new Date().getFullYear();
        setNis(`STR-${year}-${nextNum}`);
        setNama('');
        setGender('L');
        setKelas('Kelas 1 Aliyah (SMA)');
        setAsrama('Asrama Al-Farabi - Kamar 02');
        setWali('');
        setTeleponWali('08');
        setSaldo(100000);
        setLimitHarian(40000);
        setFotoUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80');
        setStatus('Aktif');
      }
    }
  }, [isOpen, santriToEdit, existingCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nis.trim()) {
      alert('Nama dan NIS wajib diisi!');
      return;
    }

    const item: Santri = {
      id: santriToEdit ? santriToEdit.id : `snt-${Date.now()}`,
      nis: nis.trim().toUpperCase(),
      nama: nama.trim(),
      gender,
      kelas: kelas.trim(),
      asrama: asrama.trim(),
      wali: wali.trim() || 'Wali Santri',
      teleponWali: teleponWali.trim(),
      saldo: Number(saldo) || 0,
      limitHarian: Number(limitHarian) || 30000,
      pengeluaranHariIni: santriToEdit ? santriToEdit.pengeluaranHariIni : 0,
      fotoUrl: fotoUrl.trim() || (gender === 'L'
        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
      status: status,
      terdaftarSejak: santriToEdit ? santriToEdit.terdaftarSejak : new Date().toISOString().split('T')[0],
      tanggalKeluar: status === 'Keluar' || status === 'Alumni' 
        ? (santriToEdit?.tanggalKeluar || new Date().toISOString().split('T')[0]) 
        : undefined,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-emerald-200">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {santriToEdit ? 'Edit Data Santri' : 'Pendaftaran Santri Baru'}
              </h3>
              <p className="text-xs text-emerald-200">Generate kartu barcode dan rekening tabungan santri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Barcode & NIS preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nomor Induk Santri (NIS)
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value.toUpperCase())}
                placeholder="STR-2024-XXX"
                required
                className="w-full px-3 py-2 font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">NIS digunakan untuk encode barcode fisik kartu santri</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex flex-col items-center">
              <BarcodeView value={nis || 'STR-SAMPLE'} height={32} width={1.4} fontSize={10} />
            </div>
          </div>

          {/* Nama & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Lengkap Santri <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                  Bisa diubah kapan saja
                </span>
              </div>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Muhammad Rayhan"
                required
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Santri</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none bg-white"
              >
                <option value="L">Laki-laki (Santri)</option>
                <option value="P">Perempuan (Santriwati)</option>
              </select>
            </div>
          </div>

          {/* Status Keberadaan Santri di Pondok (Bila Edit Santri) */}
          {santriToEdit && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Status Santri di Pondok Pesantren
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Aktif', 'Nonaktif', 'Keluar', 'Alumni'] as SantriStatus[]).map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setStatus(st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      status === st
                        ? st === 'Aktif'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : st === 'Keluar'
                          ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                          : st === 'Alumni'
                          ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                          : 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'Aktif'
                      ? '✓ Aktif'
                      : st === 'Keluar'
                      ? '✕ Keluar/Pindah'
                      : st === 'Alumni'
                      ? '🎓 Alumni'
                      : '⊘ Nonaktif'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">
                {status === 'Keluar'
                  ? 'Santri telah keluar/pindah dari pondok pesantren.'
                  : status === 'Alumni'
                  ? 'Santri telah menyelesaikan studi dan berstatus alumni.'
                  : status === 'Nonaktif'
                  ? 'Status santri ditangguhkan sementara.'
                  : 'Santri aktif bersekolah dan berhak bertransaksi di kasir.'}
              </p>
            </div>
          )}

          {/* Kelas & Asrama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas / Jenjang</label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: Kelas 2 Aliyah (SMA)"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asrama & Kamar</label>
              <input
                type="text"
                value={asrama}
                onChange={(e) => setAsrama(e.target.value)}
                placeholder="Contoh: Asrama Al-Farabi - Kamar 04"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Wali & No WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Wali Santri</label>
              <input
                type="text"
                value={wali}
                onChange={(e) => setWali(e.target.value)}
                placeholder="Nama ayah/ibu/wali"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                  No. WhatsApp Wali
                </label>
                {teleponWali && normalizePhoneNumber(teleponWali).length >= 9 && (
                  <button
                    type="button"
                    onClick={() => openWhatsApp(teleponWali, `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${wali || 'Wali Santri'}. Uji coba nomor WhatsApp dari Pesantren.`)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    Tes Hubungi WA
                  </button>
                )}
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={teleponWali}
                  onChange={(e) => setTeleponWali(e.target.value)}
                  placeholder="081234567890"
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Format: 08xxx atau 628xxx (digunakan untuk notifikasi saldo & transaksi).
              </p>
            </div>
          </div>

          {/* Saldo Awal & Limit Harian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {santriToEdit ? 'Saldo Rekening (Rp)' : 'Setoran Awal Tabungan (Rp)'}
              </label>
              <input
                type="number"
                value={saldo}
                onChange={(e) => setSaldo(Number(e.target.value))}
                min="0"
                step="5000"
                className="w-full px-3 py-2 font-mono font-bold text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none text-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limit Pengeluaran Harian (Rp)
              </label>
              <input
                type="number"
                value={limitHarian}
                onChange={(e) => setLimitHarian(Number(e.target.value))}
                min="5000"
                step="5000"
                className="w-full px-3 py-2 font-mono font-bold text-sm border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none text-amber-800"
              />
              <span className="text-[10px] text-slate-400">Batas maksimal santri jajan/tarik per hari</span>
            </div>
          </div>

          {/* Foto URL / Quick select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL Foto Santri</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none font-mono"
              />
              <img
                src={fotoUrl || 'https://via.placeholder.com/100'}
                alt="Preview"
                className="w-9 h-9 rounded-lg object-cover border border-slate-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-2">
            {santriToEdit && onDeleteSantri && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteSantri(santriToEdit);
                }}
                className="py-2.5 px-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Keluarkan atau Hapus Data Santri"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Hapus / Santri Keluar</span>
                <span className="sm:hidden">Hapus</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {santriToEdit ? 'Simpan Perubahan' : 'Daftarkan & Buat Kartu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
