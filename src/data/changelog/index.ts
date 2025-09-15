import {
  Sparkles,
  FileText,
  Globe,
  Camera,
  Settings,
  Bug,
  Palette,
  Shield,
  Zap,
  Layout,
  Search,
  Code,
  Users
} from 'lucide-react';
import { ChangelogData } from './types';

export const changelogData: ChangelogData = {
  entries: [
    {
      version: 'v0.3.0',
      date: '2025-09-15',
      titleKey: 'changelog.v030.title',
      descriptionKey: 'changelog.v030.description',
      features: [
        {
          type: 'feat',
          icon: Layout,
          titleKey: 'changelog.v030.focusModeSidebar.title',
          descriptionKey: 'changelog.v030.focusModeSidebar.description',
          commits: ['610340d']
        },
        {
          type: 'feat',
          icon: Shield,
          titleKey: 'changelog.v030.legalCompliance.title',
          descriptionKey: 'changelog.v030.legalCompliance.description',
          commits: ['6e2a8c7']
        },
        {
          type: 'feat',
          icon: Code,
          titleKey: 'changelog.v030.markdownPlugin.title',
          descriptionKey: 'changelog.v030.markdownPlugin.description',
          commits: ['9f274d7']
        }
      ]
    },
    {
      version: 'v0.2.0',
      date: '2025-09-07',
      titleKey: 'changelog.v020.title',
      descriptionKey: 'changelog.v020.description',
      features: [
        {
          type: 'feat',
          icon: FileText,
          titleKey: 'changelog.v020.templateMarket.title',
          descriptionKey: 'changelog.v020.templateMarket.description',
          commits: ['c909ec1', '0faeaac']
        },
        {
          type: 'feat',
          icon: Globe,
          titleKey: 'changelog.v020.hindiSupport.title',
          descriptionKey: 'changelog.v020.hindiSupport.description',
          commits: ['d0b85b0']
        },
        {
          type: 'feat',
          icon: Camera,
          titleKey: 'changelog.v020.imageUpload.title',
          descriptionKey: 'changelog.v020.imageUpload.description',
          commits: ['236ed29', '33a46f4']
        },
        {
          type: 'feat',
          icon: Layout,
          titleKey: 'changelog.v020.sidebarFeatures.title',
          descriptionKey: 'changelog.v020.sidebarFeatures.description',
          commits: ['ddd9b00', '16f9573']
        },
        {
          type: 'fix',
          icon: Bug,
          titleKey: 'changelog.v020.bugFixes.title',
          descriptionKey: 'changelog.v020.bugFixes.description',
          commits: ['25c13ed', 'e98d8f3', '6049b59']
        }
      ]
    },
    {
      version: 'v0.1.0',
      date: '2025-08-30',
      titleKey: 'changelog.v010.title',
      descriptionKey: 'changelog.v010.description',
      features: [
        {
          type: 'feat',
          icon: Sparkles,
          titleKey: 'changelog.v010.projectInit.title',
          descriptionKey: 'changelog.v010.projectInit.description',
          commits: ['92a9d8f']
        },
        {
          type: 'feat',
          icon: Users,
          titleKey: 'changelog.v010.shareFeature.title',
          descriptionKey: 'changelog.v010.shareFeature.description',
          commits: ['6c1a3e4']
        },
        {
          type: 'feat',
          icon: Search,
          titleKey: 'changelog.v010.noteHistory.title',
          descriptionKey: 'changelog.v010.noteHistory.description',
          commits: ['f63b182']
        },
        {
          type: 'feat',
          icon: Palette,
          titleKey: 'changelog.v010.darkMode.title',
          descriptionKey: 'changelog.v010.darkMode.description',
          commits: ['d2c2a23']
        },
        {
          type: 'feat',
          icon: Zap,
          titleKey: 'changelog.v010.focusMode.title',
          descriptionKey: 'changelog.v010.focusMode.description',
          commits: ['26d234e', '0f5f19b']
        },
        {
          type: 'feat',
          icon: Code,
          titleKey: 'changelog.v010.markdownSupport.title',
          descriptionKey: 'changelog.v010.markdownSupport.description',
          commits: ['bcf6dc6']
        },
        {
          type: 'feat',
          icon: Globe,
          titleKey: 'changelog.v010.i18nSupport.title',
          descriptionKey: 'changelog.v010.i18nSupport.description',
          commits: ['90cba11', 'a07ae4a']
        },
        {
          type: 'feat',
          icon: Settings,
          titleKey: 'changelog.v010.seoOptimization.title',
          descriptionKey: 'changelog.v010.seoOptimization.description',
          commits: ['ecdc068', 'ad1ce5f', '8786073']
        }
      ]
    }
  ]
};

export default changelogData;