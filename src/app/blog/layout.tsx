import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/contexts/ThemeContext';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mininotepad.com'),
  title: {
    template: "%s | Mini Notepad Blog",
    default: "Blog | Mini Notepad - Digital Note-Taking Insights",
  },
  description: "Discover insights about digital note-taking, markdown editing, and productivity tips from the Mini Notepad team.",
  keywords: [
    "blog",
    "digital notes",
    "markdown",
    "productivity",
    "writing tips",
    "notepad",
    "online notepad",
    "note taking"
  ].join(", "),
  authors: [{ name: "Mini Notepad Team" }],
  creator: "Mini Notepad",
  publisher: "Mini Notepad",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mininotepad.com/blog',
    title: "Blog | Mini Notepad - Digital Note-Taking Insights",
    description: "Discover insights about digital note-taking, markdown editing, and productivity tips from the Mini Notepad team.",
    siteName: 'Mini Notepad',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mini Notepad Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blog | Mini Notepad - Digital Note-Taking Insights",
    description: "Discover insights about digital note-taking, markdown editing, and productivity tips from the Mini Notepad team.",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.mininotepad.com/blog',
  },
  category: 'productivity',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}