import React, { useState } from 'react';
import { Santri, PesantrenInfo } from '../types';
import { BarcodeView } from './BarcodeView';
import { X, Printer, RotateCw, Check, Copy, Phone } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppModal';

interface KartuSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: Santri;
  pesantrenInfo: PesantrenInfo;
  onOpenWhatsApp?: (santri: Santri) => void;
}

export const KartuSantriModal: React.FC<KartuSantriModalProps> = ({
  isOpen,
  onClose,
  santri,
  pesantrenInfo,
  onOpenWhatsApp,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNis = () => {
    navigator.clipboard.writeText(santri.nis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Kartu Tanda Santri Berbarcode</h3>
            <p className="text-xs text-slate-400">Gunakan kartu ini untuk transaksi setor dan tarik tunai</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Stage / Preview */}
        <div className="p-6 bg-slate-100/80 flex flex-col items-center justify-center overflow-y-auto">
          {/* Card Container with 3D Flip */}
          <div
            id="printable-card"
            className="relative w-full max-w-[430px] aspect-[1.586/1] rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 border border-emerald-900/20"
            style={{
              perspective: '1000px',
            }}
          >
            {!isFlipped ? (
              /* TAMPAK DEPAN (FRONT SIDE) */
              <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white flex flex-col justify-between p-4 relative select-none">
                {/* Islamic Pattern Watermark / Decorative background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fef08a_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-emerald-600/50 pb-2">
                  <div className="flex items-center gap-2.5">
                    {pesantrenInfo.logoUrl ? (
                      <img
                        src={pesantrenInfo.logoUrl}
                        alt="Logo"
                        className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 shadow-md border border-amber-300/80 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-amber-400/90 text-emerald-950 font-black text-sm flex items-center justify-center shadow-md font-serif shrink-0">
                        {pesantrenInfo.namaPesantren.charAt(0) || 'P'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-[13px] tracking-wide uppercase text-amber-300 font-serif leading-none">
                        {pesantrenInfo.namaPesantren}
                      </h4>
                      <p className="text-[9px] text-emerald-200 tracking-wider uppercase mt-0.5">
                        Kartu Tabungan Santri Digital
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-widest text-emerald-300 block font-semibold">
                      STATUS
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      {santri.status}
                    </span>
                  </div>
                </div>

                {/* Middle Info: Photo + Details */}
                <div className="relative z-10 grid grid-cols-[82px_1fr] gap-3.5 my-auto items-center">
                  <div className="relative">
                    <img
                      src={santri.fotoUrl}
                      alt={santri.nama}
                      className="w-20 h-24 rounded-lg object-cover border-2 border-amber-300/80 shadow-md"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-amber-400 text-emerald-950 text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                      {santri.gender === 'L' ? 'SANTRI' : 'SANTRIWATI'}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <p className="text-[9px] text-emerald-300 uppercase tracking-wider">Nama Lengkap</p>
                      <p className="font-bold text-sm text-white leading-snug line-clamp-1">
                        {santri.nama}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-[8px] text-emerald-300 uppercase tracking-wider">Kelas</p>
                        <p className="font-medium text-slate-100 truncate">{santri.kelas}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-emerald-300 uppercase tracking-wider">Kamar / Asrama</p>
                        <p className="font-medium text-slate-100 truncate">{santri.asrama}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] text-emerald-300 uppercase tracking-wider">Wali & Kontak</p>
                      <p className="font-medium text-slate-200 truncate">
                        {santri.wali} {santri.teleponWali ? `(${santri.teleponWali})` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom: Barcode Strip */}
                <div className="relative z-10 bg-white rounded-lg p-1.5 shadow-md flex items-center justify-between">
                  <div className="flex-1 flex justify-center">
                    <BarcodeView
                      value={santri.nis}
                      height={32}
                      width={1.6}
                      fontSize={11}
                      lineColor="#0f172a"
                    />
                  </div>
                  <div className="text-right border-l border-slate-200 pl-2 pr-1">
                    <span className="text-[8px] text-slate-400 block uppercase">Batas Saku/Hari</span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Rp {santri.limitHarian.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* TAMPAK BELAKANG (BACK SIDE) */
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col justify-between p-4 text-xs relative select-none">
                <div className="border-b border-slate-700 pb-2">
                  <h5 className="font-bold text-[12px] text-amber-300 tracking-wide">
                    KETENTUAN KARTU TABUNGAN SANTRI
                  </h5>
                  <p className="text-[9px] text-slate-300">Harap diperhatikan dan dijaga dengan baik</p>
                </div>

                <div className="space-y-1.5 text-[10px] text-slate-200 leading-tight my-auto">
                  <p>1. Kartu ini merupakan bukti kepemilikan tabungan sah santri di {pesantrenInfo.namaPesantren}.</p>
                  <p>2. Gunakan barcode kartu ini saat melakukan setoran, penarikan uang saku, atau bertransaksi di kantin/koperasi.</p>
                  <p>3. Dilarang meminjamkan atau memindahtangankan kartu kepada santri lain.</p>
                  <p>4. Apabila kartu hilang/rusak, segera laporkan ke bagian Bendahara Pondok.</p>
                </div>

                <div className="pt-2 border-t border-slate-700 flex justify-between items-end text-[9px] text-slate-300">
                  <div>
                    <p className="font-semibold text-white">Call Center / Bendahara:</p>
                    <p>{pesantrenInfo.telepon}</p>
                    <p className="text-[8px] text-slate-400">{pesantrenInfo.alamat}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-slate-400">Pengasuh Pesantren</p>
                    <div className="h-6 flex items-center justify-center font-serif text-amber-300 text-xs italic">
                      Darul Hikmah
                    </div>
                    <p className="text-[9px] font-bold border-t border-slate-500 pt-0.5">
                      {pesantrenInfo.bendahara}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick info under preview */}
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
            <span className="font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-300 shadow-xs">
              NIS: {santri.nis}
            </span>
            <button
              onClick={handleCopyNis}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin NIS'}
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
          >
            <RotateCw className="w-4 h-4 text-slate-500" />
            {isFlipped ? 'Lihat Tampak Depan' : 'Lihat Tampak Belakang'}
          </button>

          <div className="flex items-center gap-2">
            {onOpenWhatsApp && (
              <button
                type="button"
                onClick={() => onOpenWhatsApp(santri)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-semibold text-sm shadow-sm transition-all cursor-pointer"
                title="Hubungi Wali di WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WA Wali</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Kartu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
