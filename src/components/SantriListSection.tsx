import React, { useState } from 'react';
import { Santri, TransactionType } from '../types';
import { BarcodeView } from './BarcodeView';
import { WhatsAppIcon } from './WhatsAppModal';
import {
  Search,
  Users,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Grid,
  List,
  ChevronRight,
  Printer,
  Phone,
} from 'lucide-react';

interface SantriListSectionProps {
  santriList: Santri[];
  onSelectSantri: (santri: Santri) => void;
  onOpenCardModal: (santri: Santri) => void;
  onQuickTransaction: (santri: Santri, type: TransactionType) => void;
  onOpenWhatsApp: (santri: Santri) => void;
}

export const SantriListSection: React.FC<SantriListSectionProps> = ({
  santriList,
  onSelectSantri,
  onOpenCardModal,
  onQuickTransaction,
  onOpenWhatsApp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredSantri = santriList.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchQuery =
      s.nama.toLowerCase().includes(query) ||
      s.nis.toLowerCase().includes(query) ||
      s.kelas.toLowerCase().includes(query) ||
      s.asrama.toLowerCase().includes(query) ||
      (s.wali && s.wali.toLowerCase().includes(query)) ||
      (s.teleponWali && s.teleponWali.includes(query));

    const matchGender = filterGender === 'ALL' || s.gender === filterGender;

    return matchQuery && matchGender;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama santri, NIS (barcode), kelas, asrama..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterGender('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterGender === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({santriList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterGender('L')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterGender === 'L'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Santri Putra
            </button>
            <button
              type="button"
              onClick={() => setFilterGender('P')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterGender === 'P'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Santriwati
            </button>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Tampilan Kartu"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Santri Cards Grid or Table */}
      {filteredSantri.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700">Tidak ada santri ditemukan</p>
          <p className="text-xs">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Interactive Card representations with Barcode) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSantri.map((santri) => (
            <div
              key={santri.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-emerald-500 overflow-hidden flex flex-col justify-between group"
            >
              {/* Card top banner */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={santri.fotoUrl}
                      alt={santri.nama}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600 shadow-xs"
                    />
                    <span className="absolute -bottom-1.5 -right-1 text-[9px] font-bold px-1 rounded bg-amber-400 text-emerald-950">
                      {santri.gender === 'L' ? 'PA' : 'PI'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                      {santri.nama}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{santri.kelas}</p>
                    <p className="text-[11px] text-slate-400 truncate">{santri.asrama}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Saldo Tabungan
                  </span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
                    Rp {santri.saldo.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Barcode Strip in the card */}
              <div
                onClick={() => onSelectSantri(santri)}
                className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50/50 transition-colors"
                title="Klik untuk membuka tabungan santri ini"
              >
                <div className="flex-1 overflow-hidden">
                  <BarcodeView
                    value={santri.nis}
                    height={26}
                    width={1.3}
                    fontSize={10}
                    lineColor="#1e293b"
                  />
                </div>
                <div className="text-right pl-2">
                  <span className="text-[10px] text-slate-400 block">Sisa Limit</span>
                  <span className="text-xs font-bold text-amber-700">
                    Rp {(santri.limitHarian - santri.pengeluaranHariIni).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Wali & WhatsApp Contact Strip */}
              <div className="px-4 py-2 bg-emerald-50/40 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 truncate">
                    <span className="text-[10px] text-slate-400 font-normal">Wali:</span>
                    <span className="truncate">{santri.wali || 'Belum diisi'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-0.5">
                    <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {santri.teleponWali ? (
                        santri.teleponWali
                      ) : (
                        <span className="italic text-amber-600">Belum ada no. WA</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenWhatsApp(santri);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
                  title={`Hubungi WhatsApp Wali: ${santri.wali || santri.nama}`}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WA Wali</span>
                </button>
              </div>

              {/* Card Action footer */}
              <div className="p-3 bg-white flex items-center justify-between gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => onOpenCardModal(santri)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
                  title="Cetak Kartu Tanda Santri"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  Kartu
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onQuickTransaction(santri, 'SETOR')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors flex items-center gap-1"
                    title="Setor Tabungan"
                  >
                    <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                    Setor
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickTransaction(santri, 'TARIK')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition-colors flex items-center gap-1"
                    title="Tarik Uang Saku"
                  >
                    <ArrowUpRight className="w-3 h-3 text-amber-700" />
                    Tarik
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSantri(santri)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-800 text-white font-semibold transition-colors flex items-center gap-1"
                  >
                    Buka
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Santri</th>
                  <th className="py-3 px-4">NIS / Barcode</th>
                  <th className="py-3 px-4">Kelas & Asrama</th>
                  <th className="py-3 px-4">Wali & WhatsApp</th>
                  <th className="py-3 px-4">Saldo</th>
                  <th className="py-3 px-4">Sisa Limit Saku</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSantri.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={santri.fotoUrl}
                          alt={santri.nama}
                          className="w-8 h-8 rounded-lg object-cover border border-emerald-600"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{santri.nama}</p>
                          <p className="text-[10px] text-slate-400">
                            {santri.gender === 'L' ? 'Santri Putra' : 'Santriwati'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {santri.nis}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium">{santri.kelas}</p>
                      <p className="text-[10px] text-slate-400">{santri.asrama}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{santri.wali || '-'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-500">
                          {santri.teleponWali ? (
                            santri.teleponWali
                          ) : (
                            <span className="text-amber-600 italic">Belum ada no.</span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(santri)}
                          className="px-1.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors inline-flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                          title={`Hubungi WhatsApp Wali: ${santri.wali || santri.nama}`}
                        >
                          <WhatsAppIcon className="w-3 h-3 text-emerald-700" />
                          <span>WA</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                      Rp {santri.saldo.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-700 font-medium">
                      Rp {(santri.limitHarian - santri.pengeluaranHariIni).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(santri)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                          title="Hubungi WhatsApp Wali"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenCardModal(santri)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Cetak Kartu"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                        </button>
                        <button
                          onClick={() => onQuickTransaction(santri, 'SETOR')}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold text-[11px]"
                        >
                          Setor
                        </button>
                        <button
                          onClick={() => onQuickTransaction(santri, 'TARIK')}
                          className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-semibold text-[11px]"
                        >
                          Tarik
                        </button>
                        <button
                          onClick={() => onSelectSantri(santri)}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold text-[11px]"
                        >
                          Buka
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
