import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Printer,
  FileText,
  Calendar,
  Filter,
  CheckCircle2,
  Wallet
} from 'lucide-react';

interface TransactionsSectionProps {
  transactions: Transaction[];
  onOpenReceipt: (trx: Transaction) => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  onOpenReceipt,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    const matchType = filterType === 'ALL' || t.tipe === filterType;
    const matchSearch =
      t.santriNama.toLowerCase().includes(search.toLowerCase()) ||
      t.santriNis.toLowerCase().includes(search.toLowerCase()) ||
      t.kodeTransaksi.toLowerCase().includes(search.toLowerCase()) ||
      t.kategori.toLowerCase().includes(search.toLowerCase());

    return matchType && matchSearch;
  });

  const totalSetor = transactions
    .filter((t) => t.tipe === 'SETOR')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalTarik = transactions
    .filter((t) => t.tipe === 'TARIK')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Dana Masuk (Setor)</span>
            <p className="text-lg font-bold text-emerald-700 font-mono">
              Rp {totalSetor.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Dana Keluar (Tarik)</span>
            <p className="text-lg font-bold text-amber-700 font-mono">
              Rp {totalTarik.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Net Arus Kas Transaksi</span>
            <p className="text-lg font-bold text-teal-900 font-mono">
              Rp {(totalSetor - totalTarik).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. transaksi, nama santri, NIS, atau kategori..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('SETOR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'SETOR'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Setoran
            </button>
            <button
              type="button"
              onClick={() => setFilterType('TARIK')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'TARIK'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penarikan
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">Tidak ada transaksi ditemukan</p>
            <p className="text-xs">Sesuaikan kata kunci pencarian atau filter tipe transaksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Santri & NIS</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Kategori & Keterangan</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Saldo Akhir</th>
                  <th className="py-3 px-4">Kasir</th>
                  <th className="py-3 px-4 text-right">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(trx.waktu).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {trx.kodeTransaksi}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{trx.santriNama}</p>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {trx.santriNis}
                      </span>
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{trx.kategori}</p>
                      {trx.keterangan && (
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">
                          {trx.keterangan}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap text-sm">
                      <span
                        className={trx.tipe === 'SETOR' ? 'text-emerald-700' : 'text-amber-700'}
                      >
                        {trx.tipe === 'SETOR' ? '+' : '-'} Rp {trx.nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold whitespace-nowrap">
                      Rp {trx.saldoSesudah.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{trx.kasir}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(trx)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
