import { Santri, Transaction, PesantrenInfo } from '../types';

/**
 * Normalizes an Indonesian phone number to international 62 format
 * Examples:
 *   "0812-3456-7890" -> "6281234567890"
 *   "+62 812 3456"   -> "628123456"
 *   "8123456"        -> "628123456"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8')) {
    digits = '62' + digits;
  }

  return digits;
}

/**
 * Generates the wa.me URL
 */
export function createWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = normalizePhoneNumber(phone);
  if (!cleanPhone) return '';

  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Directly opens WhatsApp in a new tab
 */
export function openWhatsApp(phone: string, message?: string): boolean {
  const url = createWhatsAppLink(phone, message);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * WhatsApp Message: Informasi Saldo Terkini
 */
export function buildSaldoMessage(
  santri: Santri,
  pesantrenInfo: PesantrenInfo
): string {
  const sisaLimit = Math.max(0, santri.limitHarian - santri.pengeluaranHariIni);
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `*INFORMASI TABUNGAN SANTRI*
_${pesantrenInfo.namaPesantren}_

Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu *${santri.wali || 'Wali Santri'}*,

Berikut rincian saldo uang saku ananda:
• *Nama Santri:* ${santri.nama}
• *NIS:* ${santri.nis}
• *Kelas:* ${santri.kelas}
• *Asrama:* ${santri.asrama}

💰 *Saldo Tabungan Saat Ini:* Rp ${santri.saldo.toLocaleString('id-ID')}
📊 *Limit Saku Harian:* Rp ${santri.limitHarian.toLocaleString('id-ID')}
📉 *Pengeluaran Hari Ini:* Rp ${santri.pengeluaranHariIni.toLocaleString('id-ID')}
✨ *Sisa Jatah Hari Ini:* Rp ${sisaLimit.toLocaleString('id-ID')}

_Pembaruan data per ${tanggal}_

Apabila Bapak/Ibu ingin menambah saldo uang saku (Top Up) atau memiliki pertanyaan, silakan menghubungi bagian bendahara pesantren (${pesantrenInfo.bendahara} - ${pesantrenInfo.telepon}).

Wassalamu'alaikum Wr. Wb.
_Pengurus Pondok Pesantren_`;
}

/**
 * WhatsApp Message: Bukti Transaksi (Kwitansi Struk Setor/Tarik)
 */
export function buildReceiptMessage(
  santri: Santri,
  transaction: Transaction,
  pesantrenInfo: PesantrenInfo
): string {
  const jenis = transaction.tipe === 'SETOR' ? 'SETOR TABUNGAN' : 'PENARIKAN UANG SAKU';
  const waktu = new Date(transaction.waktu).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `*BUKTI TRANSAKSI TABUNGAN SANTRI*
_${pesantrenInfo.namaPesantren}_

Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu *${santri.wali || 'Wali Santri'}*,

Telah berhasil diproses transaksi uang saku dengan rincian:
• *Kode Transaksi:* ${transaction.kodeTransaksi}
• *Waktu:* ${waktu}
• *Nama Santri:* ${santri.nama} (${santri.nis})
• *Jenis Transaksi:* *${jenis}*
• *Kategori:* ${transaction.kategori}
${transaction.keterangan ? `• *Keterangan:* ${transaction.keterangan}\n` : ''}
━━━━━━━━━━━━━━━━━━
💵 *NOMINAL:* ${transaction.tipe === 'SETOR' ? '+' : '-'} Rp ${transaction.nominal.toLocaleString('id-ID')}
💳 *Sisa Saldo Terkini:* *Rp ${transaction.saldoSesudah.toLocaleString('id-ID')}*
━━━━━━━━━━━━━━━━━━
Petugas: ${transaction.kasir}

Terima kasih atas kepercayaannya.
Wassalamu'alaikum Wr. Wb.`;
}

/**
 * WhatsApp Message: Peringatan Saldo Menipis
 */
export function buildLowBalanceMessage(
  santri: Santri,
  pesantrenInfo: PesantrenInfo
): string {
  return `*PEMBERITAHUAN SALDO TABUNGAN SANTRI*
_${pesantrenInfo.namaPesantren}_

Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu *${santri.wali || 'Wali Santri'}*,

Menginformasikan bahwa saldo tabungan uang saku ananda:
• *Nama Santri:* ${santri.nama}
• *NIS:* ${santri.nis}
• *Kelas:* ${santri.kelas}
• *Sisa Saldo:* *Rp ${santri.saldo.toLocaleString('id-ID')}*

Saldo uang saku santri saat ini sudah menipis. Mohon kesediaan Bapak/Ibu untuk melakukan pengisian saldo (Top-Up) tabungan santri agar kebutuhan sehari-hari ananda tetap terpenuhi dengan baik.

Informasi rekening & konfirmasi transfer:
• Bendahara: ${pesantrenInfo.bendahara}
• Kontak Pesantren: ${pesantrenInfo.telepon}

Jazakumullah Khairan Katsiran.
Wassalamu'alaikum Wr. Wb.`;
}

/**
 * WhatsApp Message: Sapaan Langsung / Chat Umum
 */
export function buildGreetingMessage(
  santri: Santri,
  pesantrenInfo: PesantrenInfo
): string {
  return `Assalamu'alaikum Wr. Wb. Bapak/Ibu *${santri.wali || 'Wali Santri'}* (Wali dari ananda *${santri.nama}* - ${santri.nis}). 

Perkenalkan kami dari pengurus/bagian administrasi *${pesantrenInfo.namaPesantren}*.`;
}

/**
 * WhatsApp Message: Informasi Penutupan Akun / Santri Keluar Pondok
 */
export function buildExitSantriMessage(
  santri: Santri,
  pesantrenInfo: PesantrenInfo,
  alasan?: string,
  refundNominal?: number
): string {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `*KONFIRMASI PENUTUPAN TABUNGAN SANTRI*
_${pesantrenInfo.namaPesantren}_

Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu *${santri.wali || 'Wali Santri'}*,

Menginformasikan bahwa administrasi tabungan uang saku untuk ananda:
• *Nama Santri:* ${santri.nama}
• *NIS:* ${santri.nis}
• *Kelas:* ${santri.kelas}
${alasan ? `• *Keterangan Status:* ${alasan}\n` : ''}• *Tanggal Proses:* ${tanggal}
━━━━━━━━━━━━━━━━━━
${refundNominal && refundNominal > 0 
  ? `💵 *Pencairan Sisa Saldo Akhir:* Rp ${refundNominal.toLocaleString('id-ID')} (Telah dicairkan/diserahkan)` 
  : `💳 *Sisa Saldo Tabungan:* Rp ${santri.saldo.toLocaleString('id-ID')}`}
━━━━━━━━━━━━━━━━━━
Akun tabungan uang saku ananda telah ditutup/dinonaktifkan pada sistem pesantren.

Kami segenap asatidz dan pengurus ${pesantrenInfo.namaPesantren} mengucapkan terima kasih atas silaturahmi dan kepercayaan yang telah terjalin. Semoga ananda senantiasa sukses, sholeh/sholehah, dan diberkahi ilmu yang bermanfaat.

Wassalamu'alaikum Wr. Wb.
_Pengurus & Bendahara ${pesantrenInfo.namaPesantren}_`;
}

