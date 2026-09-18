export type TransactionType = 'SETOR' | 'TARIK';
export type TopUpFrequency = 'HARIAN' | 'MINGGUAN' | 'BULANAN';

export interface AutoTopUpSchedule {
  id: string;
  santriId: string;
  santriNis: string;
  santriNama: string;
  nominal: number;
  frekuensi: TopUpFrequency;
  tanggalMulai: string; // YYYY-MM-DD
  hariEksekusi?: number; // Hari ke-X (misal 1 untuk Senin, atau tanggal 1 untuk bulanan)
  kategori: string;
  sumberDana: string;
  catatan: string;
  aktif: boolean;
  terakhirDiproses?: string;
  jadwalBerikutnya: string; // YYYY-MM-DD
  totalTerproses: number;
}

export type SantriStatus = 'Aktif' | 'Nonaktif' | 'Keluar' | 'Alumni';

export interface Santri {
  id: string;
  nis: string; // Nomor Induk Santri (used for barcode, e.g. STR-2024-001)
  nama: string;
  gender: 'L' | 'P';
  kelas: string; // e.g. "Kelas 3 Wustha", "1 Aliyah B"
  asrama: string; // e.g. "Asrama Al-Farabi Lt. 2", "Asrama Khadijah Rm 12"
  wali: string; // Nama wali
  teleponWali: string;
  saldo: number;
  limitHarian: number; // Limit tarik harian uang saku
  pengeluaranHariIni: number;
  fotoUrl: string;
  status: SantriStatus;
  terdaftarSejak: string;
  tanggalKeluar?: string;
  alasanKeluar?: string;
}

export interface Transaction {
  id: string;
  kodeTransaksi: string;
  santriId: string;
  santriNis: string;
  santriNama: string;
  tipe: TransactionType;
  nominal: number;
  saldoSebelum: number;
  saldoSesudah: number;
  keterangan: string;
  kategori: string; // e.g. "Uang Saku", "Tabungan Wajib", "Belanja Koperasi", "Titipan Wali"
  waktu: string; // ISO string
  kasir: string;
}

export interface PesantrenInfo {
  namaPesantren: string;
  subTitle: string;
  alamat: string;
  telepon: string;
  bendahara: string;
  logoUrl?: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'BENDAHARA' | 'KASIR_KOPERASI';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: AdminRole;
  roleTitle: string;
  avatarUrl?: string;
  terakhirLogin?: string;
}

