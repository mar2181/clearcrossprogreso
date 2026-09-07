import type { Metadata } from 'next';
import SafetyClient from '@/app/safety/SafetyClient';

/*
 * ⛔ NOT A BARE RE-EXPORT OF THE ENGLISH ROUTE. Until 2026-09-07 this file was
 * `export { default } from '@/app/safety/page'`, which renders the right words
 * (the client resolves its language from the pathname) and inherits the WRONG
 * metadata — an English title and description on a Spanish page, in a market
 * that is ~85% Hispanic.
 *
 * Both routes render the same client body. Only the metadata differs.
 */
export const metadata: Metadata = {
  title: 'Cruzar a Nuevo Progreso: peaje, estacionamiento y espera en vivo | ClearCross',
  description:
    'Cuánto cuesta estacionarse en Progreso, TX, cuánto es el peaje del puente en cada dirección, y la espera en vivo de CBP para regresar. Además, qué preguntarle a un consultorio antes de agendar.',
  openGraph: {
    title: 'Cruzar a Nuevo Progreso: peaje, estacionamiento y espera en vivo',
    description:
      'Estacionamiento, el peaje en cada dirección, los horarios de CBP y el tiempo de espera en vivo — para el viaje de un día.',
  },
};

export default function SafetyPageEs() {
  return <SafetyClient />;
}
