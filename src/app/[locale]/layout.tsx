import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const messages = await getMessages({ locale });

  return {
    title: {
      template: "%s | Mini Notepad",
      default: messages.title as string,
    },
    description: messages.metaDescription as string,
    alternates: {
      languages: {
        en: "https://mininotepad.com/en",
        zh: "https://mininotepad.com/zh",
        'x-default': 'https://mininotepad.com/zh',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApp',
              name: messages.title,
              description: messages.metaDescription,
              url: 'https://mininotepad.com', // Replace with your actual domain
              applicationCategory: 'Productivity',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}