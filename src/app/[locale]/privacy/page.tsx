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
    title: t('privacyPolicyTitle'),
    description: t('privacyPolicyDescription'),
    robots: 'index, follow',
    alternates: {
      canonical: `/privacy`,
      languages: {
        'zh': '/zh/privacy',
        'en': '/en/privacy',
        'hi': '/hi/privacy'
      }
    },
    openGraph: {
      title: t('privacyPolicyTitle'),
      description: t('privacyPolicyDescription'),
      type: 'article',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('privacyPolicyTitle'),
      description: t('privacyPolicyDescription'),
    }
  };
}

interface PrivacyContentProps {
  locale: string;
}

async function PrivacyContent({ locale }: PrivacyContentProps) {
  const t = await getTranslations({ locale });

  return (
    <>
      {/* Section 1: Information Collection */}
      <section id="section1" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          1. {t('privacySection1Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('privacySection1Content')
          }}
        />
      </section>

      {/* Section 2: Data Storage and Usage */}
      <section id="section2" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          2. {t('privacySection2Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('privacySection2Content')
          }}
        />
      </section>

      {/* Section 3: Data Sharing and Third Parties */}
      <section id="section3" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          3. {t('privacySection3Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('privacySection3Content')
          }}
        />
      </section>

      {/* Section 4: Your Rights and Control */}
      <section id="section4" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          4. {t('privacySection4Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('privacySection4Content')
          }}
        />
      </section>

      {/* Section 5: Contact Us */}
      <section id="section5" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 scroll-mt-20">
          5. {t('privacySection5Title')}
        </h2>
        <div
          dangerouslySetInnerHTML={{
            __html: t.raw('privacySection5Content')
          }}
        />
      </section>
    </>
  );
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <LegalPageLayout
      title={t('privacyPolicyTitle')}
      description={t('privacyPolicyDescription')}
      lastUpdated={t('lastUpdatedDate')}
      type="privacy"
    >
      <PrivacyContent locale={locale} />
    </LegalPageLayout>
  );
}