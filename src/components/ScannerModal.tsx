import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Zap, Upload, AlertCircle, X, Keyboard, CheckCircle2 } from 'lucide-react';
import { Santri } from '../types';
import { soundManager } from '../utils/sound';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (nis: string) => void;
  santriList: Santri[];
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  santriList,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'usb' | 'sample'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  // Handle successful detection
  const handleDetected = (decodedText: string) => {
    const trimmed = decodedText.trim();
    if (!trimmed) return;

    soundManager.playBarcodeBeep();
    setScanMessage(`Barcode terbaca: ${trimmed}`);

    // Stop scanner if running
    stopCamera();

    setTimeout(() => {
      onScanSuccess(trimmed);
      onClose();
    }, 400);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      // Ensure existing scanner is cleared
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const scannerId = 'reader-viewport';
      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.777778,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleDetected(decodedText);
        },
        () => {
          // Scanning frame error, keep scanning
        }
      );
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setCameraError(
        errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission')
          ? 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda, atau gunakan tab "Scanner USB" / "Pilih Santri".'
          : 'Kamera tidak ditemukan atau tidak didukung di perangkat ini. Silakan gunakan pemindai USB/Keyboard atau Simulasi Scan.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      setScanMessage(null);
      setCameraError(null);
      if (activeTab === 'camera') {
        // slight timeout to allow DOM node to render
        const timer = setTimeout(() => {
          startCamera();
        }, 200);
        return () => clearTimeout(timer);
      } else if (activeTab === 'usb') {
        setTimeout(() => {
          manualInputRef.current?.focus();
        }, 200);
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDetected(manualInput.trim());
    setManualInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-scan-temp');
      const result = await html5QrCode.scanFile(file, true);
      handleDetected(result);
    } catch {
      alert('Barcode tidak terdeteksi pada gambar. Pastikan gambar barcode jelas dan cukup terang.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center text-emerald-200 shadow-inner">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Scan Kartu Santri</h2>
              <p className="text-xs text-emerald-200">Arahkan barcode kartu santri ke pemindai</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'camera'
                ? 'border-emerald-600 text-emerald-700 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            Kamera
          </button>
          <button
            onClick={() => setActiveTab('usb')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'usb'
                ? 'border-emerald-600 text-emerald-700 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Scanner USB / Manual
          </button>
          <button
            onClick={() => setActiveTab('sample')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'sample'
                ? 'border-emerald-600 text-emerald-700 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Simulasi Kartu Santri
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {scanMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {scanMessage}
            </div>
          )}

          {/* TAB 1: CAMERA */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center">
                <div id="reader-viewport" className="w-full h-full" />

                {/* Laser Scanning Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-64 h-36 border-2 border-emerald-400/70 rounded-xl relative shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1" />
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-pulse" />
                  </div>
                  <span className="mt-3 text-xs font-medium text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                    Posisikan barcode kartu santri di kotak ini
                  </span>
                </div>
              </div>

              {cameraError && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Perhatian Kamera</p>
                    <p>{cameraError}</p>
                  </div>
                </div>
              )}

              {/* Upload image alternative */}
              <div className="mt-4 w-full flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-slate-600 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  Scan dari Foto / Gambar Kartu
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div id="file-scan-temp" className="hidden" />
              </div>
            </div>
          )}

          {/* TAB 2: USB BARCODE GUN & MANUAL INPUT */}
          {activeTab === 'usb' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-900">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-emerald-700" />
                  Mendukung Barcode Scanner USB / Wireless
                </p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Arahkan alat barcode scanner fisik (pistol scanner) langsung ke kartu santri. Mesin scanner akan otomatis mengetikkan NIS dan menekan Enter.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Nomor Induk Santri (NIS) / Barcode
                </label>
                <div className="relative">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Contoh: STR-2024-001"
                    autoFocus
                    className="w-full px-4 py-3 pl-11 text-base font-mono font-bold tracking-wide border-2 border-emerald-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 bg-emerald-50/20"
                  />
                  <Zap className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Cari & Buka Tabungan Santri
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SAMPLE CARDS FOR INSTANT TESTING */}
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Pilih salah satu santri di bawah untuk simulasi scan instan kartu santri:
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                {santriList.map((santri) => (
                  <button
                    key={santri.id}
                    onClick={() => handleDetected(santri.nis)}
                    className="flex items-center gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all group"
                  >
                    <img
                      src={santri.fotoUrl}
                      alt={santri.nama}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-600 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-800">
                          {santri.nama}
                        </p>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {santri.nis}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{santri.kelas} • {santri.asrama}</p>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        Saldo: Rp {santri.saldo.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      Scan
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Format Barcode: CODE128 (NIS Santri)</span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
