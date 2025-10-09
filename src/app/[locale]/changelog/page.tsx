import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import ChangelogContent from './ChangelogContent';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t('changelog.title'),
    description: t('changelog.description'),
    robots: 'index, follow',
    alternates: {
      canonical: `/changelog`,
      languages: {
        'zh': '/zh/changelog',
        'en': '/changelog',
        'hi': '/hi/changelog'
      }
    },
    openGraph: {
      title: t('changelog.title'),
      description: t('changelog.description'),
      type: 'article',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('changelog.title'),
      description: t('changelog.description'),
    }
  };
}

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  return <ChangelogContent locale={locale} />;
}