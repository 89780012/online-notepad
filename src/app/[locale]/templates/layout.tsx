import {getLocale, getMessages} from 'next-intl/server';
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
};

export async function generateMetadata({
}: Props): Promise<Metadata> {
  const messages = await getMessages();
  const locale = await getLocale();

  return {
    title: messages.templatesPageTitle as string,
    description: messages.templatesPageDescription as string,
    keywords: messages.templatesPageKeywords as string,
    openGraph: {
      title: messages.templatesPageTitle as string,
      description: messages.templatesPageDescription as string,
      url: locale === 'en' ? 'https://www.mininotepad.com/templates' : `https://www.mininotepad.com/${locale}/templates`,
      siteName: 'Mini Notepad',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'hi' ? 'hi_IN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.templatesPageTitle as string,
      description: messages.templatesPageDescription as string,
    },
    alternates: {
      canonical: locale === 'en' ? 'https://www.mininotepad.com/templates' : `https://www.mininotepad.com/${locale}/templates`,
      languages: {
        'en': 'https://www.mininotepad.com/templates',
        'zh': 'https://www.mininotepad.com/zh/templates',
        'hi': 'https://www.mininotepad.com/hi/templates',
        'x-default': 'https://www.mininotepad.com/templates',
      },
    },
  };
}

export default function TemplatesLayout({
  children,
}: Props) {
  return <>{children}</>;
}