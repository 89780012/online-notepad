import {NextIntlClientProvider} from 'next-intl';
import {getLocale,getMessages} from 'next-intl/server';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import Script from 'next/script';
import "../globals.css";
import { Analytics } from "@vercel/analytics/next"

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
    metadataBase: new URL('https://www.mininotepad.com'),
    title: {
      template: "%s | Mini Notepad",
      default: messages.seoTitle as string || messages.title as string,
    },
    description: messages.seoDescription as string || messages.metaDescription as string,
    keywords: [
      "custom notepad​",
      "pocket notepad​",
      "memo notepad",
      "online notepad",
      "free notepad",
      "inkpad notes",
      "notes",
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
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: locale === 'en' ? 'https://www.mininotepad.com' : `https://www.mininotepad.com/${locale}`,
      title: messages.seoTitle as string || messages.title as string,
      description: messages.seoDescription as string || messages.metaDescription as string,
      siteName: 'Mini Notepad',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: messages.seoTitle as string || messages.title as string,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.seoTitle as string || messages.title as string,
      description: messages.seoDescription as string || messages.metaDescription as string,
      images: ['/og-image.png'],
    },
    verification: {
      google: "E0GDXD3a6YNYh4z337vXsHw5kIwitdrAhD0wQe23BNM",
    },
    alternates: {
      languages: {
        en: "https://www.mininotepad.com",
        zh: "https://www.mininotepad.com/zh",
        hi: "https://www.mininotepad.com/hi",
        'x-default': 'https://www.mininotepad.com',
      },
      canonical: locale === 'en' ? 'https://www.mininotepad.com' : `https://www.mininotepad.com/${locale}`,
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-42Z60J1HD7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-42Z60J1HD7');
          `}
        </Script>

        <ThemeProvider defaultTheme="system">
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              <ToastProvider>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </ToastProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}