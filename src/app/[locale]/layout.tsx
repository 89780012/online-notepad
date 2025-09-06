import {NextIntlClientProvider} from 'next-intl';
import {getLocale,getMessages} from 'next-intl/server';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
};

export async function generateMetadata({
}: Props): Promise<Metadata> {
  const messages = await getMessages();
  const locale = await getLocale();

  return {
    metadataBase: new URL('https://mininotepad.com'),
    title: {
      template: "%s | Mini Notepad",
      default: messages.title as string,
    },
    description: messages.metaDescription as string,
    keywords: locale === 'zh'
      ? "在线记事本,免费记事本,离线记事本,深色模式记事本,Markdown编辑器,云端分享,无广告记事本,简洁记事本,快速记事本,跨设备记事本"
      : "online notepad,free notepad,offline notepad,dark mode notepad,markdown editor,cloud sharing,ad-free notepad,simple notepad,quick notepad,cross-device notepad",
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
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: `https://mininotepad.com/${locale}`,
      title: messages.title as string,
      description: messages.metaDescription as string,
      siteName: 'Mini Notepad',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: messages.title as string,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.title as string,
      description: messages.metaDescription as string,
      images: ['/og-image.png'],
    },
    verification: {
      google: "E0GDXD3a6YNYh4z337vXsHw5kIwitdrAhD0wQe23BNM",
    },
    alternates: {
      languages: {
        en: "https://mininotepad.com/en",
        zh: "https://mininotepad.com/zh",
        'x-default': 'https://mininotepad.com/zh',
      },
      canonical: `https://mininotepad.com/${locale}`,
    },
    category: 'productivity',
  };
}

export default async function LocaleLayout({
  children
}: Props) {

 const locale = await getLocale();
 const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider defaultTheme="system">
          <NextIntlClientProvider messages={messages}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </NextIntlClientProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}