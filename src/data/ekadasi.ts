/**
 * Ekadasi calendar — the single source of truth for the reminders and the
 * "next Ekadasi" banner.
 *
 * The 2026 dates below are the maintainer's confirmed calendar. Note that
 * observed Ekadasi can still vary by location (the tithi start/end relative to
 * local sunrise), so devotees in other regions may follow their own temple's
 * calendar. Keep the list sorted by date and extend it each year (append the
 * next year's dates) — reminders and the banner go quiet once it runs out.
 *
 * Format: local calendar day as YYYY-MM-DD.
 */
export interface EkadasiDay {
  /** Local day of the fast, YYYY-MM-DD. */
  date: string;
  name: string;
}

export const EKADASI_DATES: EkadasiDay[] = [
  // --- 2026 ---
  { date: '2026-01-14', name: 'Shat Tila Ekadashi' },
  { date: '2026-01-29', name: 'Bhaimi Ekadashi' },
  { date: '2026-02-13', name: 'Vijaya Ekadashi' },
  { date: '2026-02-27', name: 'Amalaki Ekadashi' },
  { date: '2026-03-15', name: 'Papamochani Ekadashi' },
  { date: '2026-03-29', name: 'Kamada Ekadashi' },
  { date: '2026-04-13', name: 'Varuthini Ekadashi' },
  { date: '2026-04-27', name: 'Mohini Ekadashi' },
  { date: '2026-05-13', name: 'Apara Ekadashi' },
  { date: '2026-05-27', name: 'Padmini Ekadashi' },
  { date: '2026-06-11', name: 'Parama Ekadashi' },
  { date: '2026-06-25', name: 'Pandava Nirjala Ekadashi' },
  { date: '2026-07-11', name: 'Yogini Ekadashi' },
  { date: '2026-07-25', name: 'Sayana Ekadashi' },
  { date: '2026-08-09', name: 'Kamika Ekadashi' },
  { date: '2026-08-23', name: 'Pavitropana Ekadashi' },
  { date: '2026-09-07', name: 'Annada (Aja) Ekadashi' },
  { date: '2026-09-22', name: 'Parshva Ekadashi' },
  { date: '2026-10-06', name: 'Indira Ekadashi' },
  { date: '2026-10-22', name: 'Pashankusha Ekadashi' },
  { date: '2026-11-05', name: 'Rama Ekadashi' },
  { date: '2026-11-21', name: 'Utthana Ekadashi' },
  { date: '2026-12-04', name: 'Utpanna Ekadashi' },
  { date: '2026-12-20', name: 'Mokshada Ekadashi' },
];

/** The next Ekadasi on or after the given day key, or null if none remain. */
export function nextEkadasi(fromKey: string): EkadasiDay | null {
  return (
    [...EKADASI_DATES]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .find((e) => e.date >= fromKey) ?? null
  );
}
