import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mejores Dentistas y Servicios Médicos en Nuevo Progreso México | ClearCross',
  description:
    'Encuentre y compare precios de dentistas, farmacias, spas y servicios médicos en Nuevo Progreso, México. Conozca el precio antes de cruzar.',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://clearcrossprogreso.com/es',
    siteName: 'ClearCross Progreso',
    title: 'Mejores Dentistas y Servicios Médicos en Nuevo Progreso México | ClearCross',
    description:
      'Encuentre y compare precios de dentistas, farmacias, spas y servicios médicos en Nuevo Progreso, México. Conozca el precio antes de cruzar.',
  },
}

export default function EsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
