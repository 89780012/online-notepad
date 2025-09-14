import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import LegalPageLayout from '@/components/legal/LegalPageLayout';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t('termsOfServiceTitle'),
    description: t('termsOfServiceDescription'),
    robots: 'index, follow',
    alternates: {
      canonical: `/terms`,
      languages: {
        'zh': '/zh/terms',
        'en': '/en/terms',
        'hi': '/hi/terms'
      }
    },
    openGraph: {
      title: t('termsOfServiceTitle'),
      description: t('termsOfServiceDescription'),
      type: 'article',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('termsOfServiceTitle'),
      description: t('termsOfServiceDescription'),
    }
  };
}

interface TermsContentProps {
  locale: string;
}

async function TermsContent({ locale }: TermsContentProps) {
  const t = await getTranslations({ locale });

  return (
    <>
      {/* Section 1: Service Description */}
      <section id="section1" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          1. {t('termsSection1Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('termsSection1Content')
          }}
        />
      </section>

      {/* Section 2: User Responsibilities */}
      <section id="section2" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          2. {t('termsSection2Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('termsSection2Content')
          }}
        />
      </section>

      {/* Section 3: Service Limitations and Disclaimers */}
      <section id="section3" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          3. {t('termsSection3Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('termsSection3Content')
          }}
        />
      </section>

      {/* Section 4: Dispute Resolution */}
      <section id="section4" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          4. {t('termsSection4Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('termsSection4Content')
          }}
        />
      </section>
    </>
  );
}

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <LegalPageLayout
      title={t('termsOfServiceTitle')}
      description={t('termsOfServiceDescription')}
      lastUpdated={t('lastUpdatedDate')}
      type="terms"
    >
      <TermsContent locale={locale} />
    </LegalPageLayout>
  );
}