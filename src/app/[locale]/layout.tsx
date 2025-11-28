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
import { locales as supportedLocales, defaultLocale } from '@/i18n/config';

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
  const siteUrl = 'https://www.mininotepad.com';
  const localizedUrl = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`;
  const alternateLanguages = supportedLocales.reduce<Record<string, string>>((acc, localeCode) => {
    acc[localeCode] = localeCode === defaultLocale ? siteUrl : `${siteUrl}/${localeCode}`;
    return acc;
  }, {});
  alternateLanguages['x-default'] = siteUrl;

  return {
    metadataBase: new URL(siteUrl),
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
      url: localizedUrl,
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
      languages: alternateLanguages,
      canonical: localizedUrl,
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
      <head>
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
        <Script src="https://analytics.ahrefs.com/analytics.js" data-key="OrJ3i+lM1VT6Cr8bJZJupw" async></Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning={true}
      >
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