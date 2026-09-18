import { AutoTopUpSchedule, Santri, Transaction, TopUpFrequency } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateNextDate(frequency: TopUpFrequency, fromDateStr: string): string {
  const [y, m, d] = fromDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  if (frequency === 'HARIAN') {
    date.setDate(date.getDate() + 1);
  } else if (frequency === 'MINGGUAN') {
    date.setDate(date.getDate() + 7);
  } else if (frequency === 'BULANAN') {
    date.setMonth(date.getMonth() + 1);
  }

  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

export function isScheduleDue(schedule: AutoTopUpSchedule, todayStr: string = getTodayDateString()): boolean {
  if (!schedule.aktif) return false;
  // If today is equal to or past the scheduled next date
  return schedule.jadwalBerikutnya <= todayStr;
}

export function executeAutoTopUp(
  schedule: AutoTopUpSchedule,
  santri: Santri,
  kasirName: string = 'Sistem Auto Top-Up'
): {
  transaction: Transaction;
  updatedSantri: Santri;
  updatedSchedule: AutoTopUpSchedule;
} {
  const todayStr = getTodayDateString();
  const saldoSebelum = santri.saldo;
  const saldoSesudah = saldoSebelum + schedule.nominal;

  const trxId = `ATU-${Date.now().toString().slice(-6)}`;
  const transaction: Transaction = {
    id: `trx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    kodeTransaksi: trxId,
    santriId: santri.id,
    santriNis: santri.nis,
    santriNama: santri.nama,
    tipe: 'SETOR',
    nominal: schedule.nominal,
    saldoSebelum,
    saldoSesudah,
    kategori: 'Top-Up Otomatis',
    keterangan: `Auto Top-Up (${schedule.frekuensi}): ${schedule.sumberDana || 'Autodebet Wali'}. ${schedule.catatan || ''}`.trim(),
    waktu: new Date().toISOString(),
    kasir: kasirName,
  };

  const updatedSantri: Santri = {
    ...santri,
    saldo: saldoSesudah,
  };

  const nextDate = calculateNextDate(schedule.frekuensi, todayStr);
  const updatedSchedule: AutoTopUpSchedule = {
    ...schedule,
    terakhirDiproses: new Date().toISOString(),
    jadwalBerikutnya: nextDate,
    totalTerproses: (schedule.totalTerproses || 0) + 1,
  };

  return { transaction, updatedSantri, updatedSchedule };
}
