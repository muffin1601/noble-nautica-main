import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Noble Nautica | Premium Pool & Spa Equipment | Aquatic Infrastructure Solutions",
    template: "%s | Noble Nautica"
  },
  description: "Noble Nautica delivers premium aquatic and wellness infrastructure for the world's most ambitious projects. From Olympic-sized pools to wellness retreats, we provide precision-engineered systems and exclusive products trusted by professionals across Europe, USA, and growing markets.",
  keywords: [
    "pool equipment",
    "spa equipment",
    "aquatic infrastructure",
    "pool filtration systems",
    "pool lighting",
    "water treatment",
    "pool automation",
    "premium pool products",
    "pool contractors",
    "aquatic engineering",
    "wellness infrastructure",
    "pool accessories",
    "marine equipment",
    "pool pumps",
    "pool covers"
  ],
  authors: [{ name: "Noble Nautica" }],
  creator: "Noble Nautica",
  publisher: "Noble Nautica",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://noblenautica.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://noblenautica.com',
    siteName: 'Noble Nautica',
    title: 'Noble Nautica | Premium Pool & Spa Equipment | Aquatic Infrastructure Solutions',
    description: 'Noble Nautica delivers premium aquatic and wellness infrastructure for the world\'s most ambitious projects. From Olympic-sized pools to wellness retreats, we provide precision-engineered systems and exclusive products trusted by professionals across Europe, USA, and growing markets.',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Noble Nautica - Premium Pool & Spa Equipment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noble Nautica | Premium Pool & Spa Equipment',
    description: 'Premium aquatic and wellness infrastructure for ambitious projects worldwide. Precision-engineered systems trusted by professionals.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', sizes: 'any' },
      { url: '/favicon.ico', sizes: '16x16 32x32' }
    ],
    apple: '/icon.svg',
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData type="organization" data={{}} />
        <StructuredData type="website" data={{}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
