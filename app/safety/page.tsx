import type { Metadata } from 'next';
import SafetyClient from './SafetyClient';

/*
 * ⛔ THIS TITLE IS THE POINT OF THE FILE. Until 2026-09-07 this page inherited
 * the root layout's "Best Dentists & Medical Services in Nuevo Progreso Mexico"
 * — a directory title, shared with nine other URLs, on the page about crossing
 * the bridge. The logistics queries are the one field around Nuevo Progreso
 * that no aggregator holds, and this is the page that answers them.
 *
 * ⛔ It leads with what the page uniquely has (the toll, the parking, the live
 * CBP wait) rather than the word "safety", because that is what people type.
 */
export const metadata: Metadata = {
  title: 'Crossing to Nuevo Progreso: Toll, Parking & Live Border Wait | ClearCross',
  description:
    'What it costs to park in Progreso, TX, what the bridge toll is in each direction, and the live CBP wait to get back across. Plus what to ask a clinic before you book.',
  openGraph: {
    title: 'Crossing to Nuevo Progreso: Toll, Parking & Live Border Wait',
    description:
      'Parking, the bridge toll each way, CBP crossing hours and the live wait time — for the day trip, not the flight.',
  },
};

export default function SafetyPage() {
  return <SafetyClient />;
}
