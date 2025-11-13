'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function SEOContent() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="sr-only">
      {/* SEO优化的隐藏内容，包含关键词 */}
      <strong>{t('seoH1')}</strong>
      <h2>{t('seoH2Free')}</h2>
      <h2>{t('seoH2Offline')}</h2>
      <h2>{t('seoH2DarkMode')}</h2>
      <h2>{t('seoH2Markdown')}</h2>
      
      <p>{t('seoKeywordParagraph1')}</p>
      <p>{t('seoKeywordParagraph2')}</p>
      <p>{t('seoKeywordParagraph3')}</p>
      
      {/* 常见拼写错误的关键词 */}
      <div>
        <span>notpad online</span>
        <span>notepadd</span>
        <span>notepa</span>
        <span>otepad</span>
        <span>notepade</span>
        <span>notepd</span>
        <span>ntoepad</span>
        <span>online notpad</span>
        <span>free notpad</span>
        <span>notepad app</span>
        <span>notes app</span>
        <span>online notes app</span>
        <span>write notes</span>
        <span>online writing notepad</span>
        <span>notepad free</span>
        <span>free online notepad</span>
        <span>notes for free</span>
        <span>notepad dark mode</span>
        <span>dark mode notepad</span>
        <span>notepad dark</span>
        <span>notepad black</span>
        <span>notes dark mode</span>
        <span>notepad offline</span>
        <span>offline notepad</span>
        <span>notepad offline capable</span>
        <span>offline notes</span>
        <span>offline notes app</span>
        <span>quick notepad</span>
        <span>simple notepad</span>
        <span>minimalist notes</span>
        <span>notepad minimalist</span>
        <span>ad free notepad</span>
        <span>notepad no ads</span>
        <span>notepad for android</span>
        <span>notepad chromebook</span>
        <span>notepad for iphone</span>
      </div>

      {/* 结构化数据相关内容 */}
      <div>
        <h3>{t('featuresTitle')}</h3>
        <ul>
          <li>{t('feature1')}</li>
          <li>{t('feature2')}</li>
          <li>{t('feature3')}</li>
          <li>{t('feature4')}</li>
          <li>{t('feature5')}</li>
          <li>{t('feature6')}</li>
          <li>{t('feature7')}</li>
        </ul>
      </div>

      <div>
        <h3>{t('benefitsTitle')}</h3>
        <ul>
          <li>{t('benefit1')}</li>
          <li>{t('benefit2')}</li>
          <li>{t('benefit3')}</li>
          <li>{t('benefit4')}</li>
          <li>{t('benefit5')}</li>
        </ul>
      </div>

      <div>
        <h3>{t('howToUseTitle')}</h3>
        <ol>
          <li>{t('howToStep1')}</li>
          <li>{t('howToStep2')}</li>
          <li>{t('howToStep3')}</li>
          <li>{t('howToStep4')}</li>
          <li>{t('howToStep5')}</li>
        </ol>
      </div>

      <div>
        <h3>{t('compatibilityTitle')}</h3>
        <p>{t('compatibilityDesc')}</p>
        <ul>
          <li>Windows notepad alternative</li>
          <li>Mac notepad app</li>
          <li>Linux text editor</li>
          <li>Android notepad</li>
          <li>iPhone notes app</li>
          <li>iPad writing app</li>
          <li>Chromebook notepad</li>
          <li>Browser-based notepad</li>
        </ul>
      </div>

      <div>
        <h3>{t('alternativesTitle')}</h3>
        <p>{t('alternativesDesc')}</p>
        <ul>
          <li>Google Docs alternative</li>
          <li>Notion alternative</li>
          <li>Evernote alternative</li>
          <li>OneNote alternative</li>
          <li>Bear notes alternative</li>
          <li>Obsidian alternative</li>
          <li>Roam Research alternative</li>
          <li>Typora alternative</li>
        </ul>
      </div>

      {/* 长尾关键词 */}
      <div>
        <p>best free online notepad 2024</p>
        <p>simple notepad without registration</p>
        <p>markdown editor online free</p>
        <p>offline capable notepad browser</p>
        <p>dark theme notepad online</p>
        <p>privacy focused notepad app</p>
        <p>lightweight notepad web app</p>
        <p>cross platform notepad tool</p>
        <p>no ads notepad online</p>
        <p>instant notepad no download</p>
        <p>collaborative notepad sharing</p>
        <p>auto save notepad online</p>
        <p>responsive notepad all devices</p>
        <p>fast loading notepad app</p>
        <p>secure notepad local storage</p>
      </div>

      {/* 地理位置相关关键词（如果需要） */}
      {locale === 'zh' && (
        <div>
          <p>中国在线记事本</p>
          <p>免费中文记事本</p>
          <p>简体中文笔记应用</p>
          <p>国内记事本工具</p>
          <p>中文Markdown编辑器</p>
        </div>
      )}

      {/* 技术相关关键词 */}
      <div>
        <p>HTML5 notepad</p>
        <p>JavaScript notepad</p>
        <p>React notepad app</p>
        <p>PWA notepad</p>
        <p>responsive web notepad</p>
        <p>modern browser notepad</p>
        <p>CSS3 notepad design</p>
        <p>mobile friendly notepad</p>
      </div>
    </div>
  );
}
