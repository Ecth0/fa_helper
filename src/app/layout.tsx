import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Red_Hat_Display } from "next/font/google"
import "./globals.css"
import { MainNav } from "@/components/MainNav"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const redHatDisplay = Red_Hat_Display({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-red-hat',
  display: 'swap',
});

// Configuration de base du favicon
export const metadata: Metadata = {
  title: "Fa_helper",
  description: "Fa_helper - Votre assistant de jeu",
  icons: {
    icon: '/favicon.ico',
  },
};

// Configuration de la viewport
export const viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${redHatDisplay.variable} antialiased`}>
      <body className="min-h-screen bg-gray-900 text-white">
        <MainNav />
        <main className="mx-auto max-w-7xl p-4 md:p-6">
          {children}
          <Toaster position="top-right" richColors closeButton />
        </main>
      </body>
    </html>
  );
}
