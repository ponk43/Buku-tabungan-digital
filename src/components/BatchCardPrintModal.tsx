import React, { useState } from 'react';
import { Santri, PesantrenInfo } from '../types';
import { BarcodeView } from './BarcodeView';
import { X, Printer, CheckSquare, Square } from 'lucide-react';

interface BatchCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  santriList: Santri[];
  pesantrenInfo: PesantrenInfo;
}

export const BatchCardPrintModal: React.FC<BatchCardPrintModalProps> = ({
  isOpen,
  onClose,
  santriList,
  pesantrenInfo,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(santriList.map((s) => s.id));

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === santriList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(santriList.map((s) => s.id));
    }
  };

  const toggleSantri = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedSantri = santriList.filter((s) => selectedIds.includes(s.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Cetak Massal Kartu Santri Berbarcode</h3>
            <p className="text-xs text-emerald-200">
              Format siap cetak kertas A4 (dapat dilaminating atau dimasukkan holder ID card)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-800"
          >
            {selectedIds.length === santriList.length ? (
              <CheckSquare className="w-4 h-4 text-emerald-700" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            Pilih Semua ({selectedIds.length} dari {santriList.length} Santri)
          </button>

          <span className="text-slate-500">
            {selectedSantri.length} kartu terpilih untuk dicetak
          </span>
        </div>

        {/* Card Grid Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="printable-batch">
            {selectedSantri.map((santri) => (
              <div
                key={santri.id}
                className="w-full aspect-[1.586/1] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-xl shadow-md p-3.5 flex flex-col justify-between relative overflow-hidden border border-emerald-900"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-emerald-600/50 pb-1.5">
                  <div className="flex items-center gap-2">
                    {pesantrenInfo.logoUrl ? (
                      <img
                        src={pesantrenInfo.logoUrl}
                        alt="Logo"
                        className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 shadow-sm border border-amber-300/80 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center font-serif shrink-0">
                        {pesantrenInfo.namaPesantren.charAt(0) || 'P'}
                      </div>
                    )}
                    <div>
                      <h5 className="font-extrabold text-[10px] tracking-wide uppercase text-amber-300 font-serif leading-none">
                        {pesantrenInfo.namaPesantren}
                      </h5>
                      <p className="text-[7px] text-emerald-200 tracking-wider uppercase">
                        Kartu Tabungan Santri Digital
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-amber-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    {santri.status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-[60px_1fr] gap-2.5 my-auto items-center">
                  <img
                    src={santri.fotoUrl}
                    alt={santri.nama}
                    className="w-14 h-18 rounded-md object-cover border border-amber-300 shadow"
                  />
                  <div className="space-y-0.5 text-[10px]">
                    <div>
                      <p className="text-[7px] text-emerald-300 uppercase">Nama Santri</p>
                      <p className="font-bold text-xs text-white line-clamp-1">{santri.nama}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9px]">
                      <div>
                        <p className="text-[7px] text-emerald-300 uppercase">Kelas</p>
                        <p className="truncate text-slate-100">{santri.kelas}</p>
                      </div>
                      <div>
                        <p className="text-[7px] text-emerald-300 uppercase">Asrama</p>
                        <p className="truncate text-slate-100">{santri.asrama}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[7px] text-emerald-300 uppercase truncate">
                        Wali: {santri.wali} {santri.teleponWali ? `• ${santri.teleponWali}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barcode strip */}
                <div className="bg-white rounded p-1 shadow flex items-center justify-between">
                  <div className="flex-1 flex justify-center">
                    <BarcodeView
                      value={santri.nis}
                      height={24}
                      width={1.3}
                      fontSize={9}
                      lineColor="#0f172a"
                    />
                  </div>
                  <div className="text-right pl-2 pr-1 border-l border-slate-200">
                    <span className="text-[7px] text-slate-400 block uppercase">Batas Saku</span>
                    <span className="text-[9px] font-bold text-emerald-700">
                      Rp {santri.limitHarian.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={selectedSantri.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Cetak {selectedSantri.length} Kartu Santri
          </button>
        </div>
      </div>
    </div>
  );
};
