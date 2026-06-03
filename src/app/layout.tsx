import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'RailReady — Préparez votre carrière ferroviaire',
    template: '%s — RailReady',
  },
  description: 'La plateforme indépendante d\'orientation et de préparation aux métiers ferroviaires. Testez votre compatibilité, simulez des entretiens, explorez les métiers du rail.',
  keywords: ['métiers ferroviaires', 'conducteur de train', 'agent circulation', 'SNCF recrutement', 'préparation entretien ferroviaire'],
  authors: [{ name: 'RailReady' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'RailReady — Préparez votre carrière ferroviaire',
    description: 'La plateforme indépendante d\'orientation et de préparation aux métiers ferroviaires.',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
