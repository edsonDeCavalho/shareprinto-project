import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/contexts/UserContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OfferNotificationWrapper } from '@/components/offer-notification-wrapper';
import { GlobalSocketManager } from '@/components/GlobalSocketManager';
import { STLInitializer } from '@/components/stl-initializer';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'SharePrinto – Partage d’imprimantes 3D entre particuliers',
  description: 'Partagez votre imprimante 3D avec d’autres créateurs et gagnez de l’argent. Rejoignez la première plateforme de mise en relation pour l’impression 3D entre particuliers.',
  keywords: [
    'impression 3D',
    'partage imprimante 3D',
    'imprimante 3D entre particuliers',
    'gagner argent imprimante 3D',
    'impression 3D à la demande',
    'SharePrinto',
    'plateforme impression 3D'
  ],
  openGraph: {
    title: 'SharePrinto – Gagnez de l’argent avec votre imprimante 3D',
    description: 'Générez des revenus en partageant votre imprimante 3D avec une communauté de créateurs. Impression 3D à la demande, simple et locale.',
    url: 'https://www.shareprinto.com', // remplace par ton vrai domaine
    siteName: 'SharePrinto',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://www.shareprinto.com/og-image.jpg', // remplace avec ton image OG
        width: 1200,
        height: 630,
        alt: 'SharePrinto – Plateforme de partage d’imprimantes 3D',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SharePrinto – Partagez votre imprimante 3D et gagnez de l’argent',
    description: 'Impression 3D entre particuliers : monétisez votre imprimante 3D en quelques clics.',
    images: ['https://www.shareprinto.com/og-image.jpg'], // même image que OG
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', roboto.variable)}>
        <UserProvider>
          <NotificationProvider>
            <GlobalSocketManager />
            <STLInitializer />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow flex flex-col">{children}</main>
            </div>
            <Toaster />
            <OfferNotificationWrapper />
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
