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
  Users,
  BookOpen,
  LogOut,
  UserPlus,
  Cloud,
  Paintbrush,
  Menu,
  Music,
  Keyboard,
  AlertCircle,
  Eye
} from 'lucide-react';
import { ChangelogData } from './types';

export const changelogData: ChangelogData = {
  entries: [
    {
      version: 'v0.8.1',
      date: '2025-01-17',
      titleKey: 'changelog.v081.title',
      descriptionKey: 'changelog.v081.description',
      features: [
        {
          type: 'feat',
          icon: Eye,
          titleKey: 'changelog.v081.templatePreview.title',
          descriptionKey: 'changelog.v081.templatePreview.description',
          commits: ['template-preview-page']
        },
        {
          type: 'feat',
          icon: Layout,
          titleKey: 'changelog.v081.previewButton.title',
          descriptionKey: 'changelog.v081.previewButton.description',
          commits: ['add-preview-button']
        },
        {
          type: 'improvement',
          icon: Settings,
          titleKey: 'changelog.v081.navigationImprovement.title',
          descriptionKey: 'changelog.v081.navigationImprovement.description',
          commits: ['improve-navigation']
        }
      ]
    },
    {
      version: 'v0.8.0',
      date: '2025-01-16',
      titleKey: 'changelog.v080.title',
      descriptionKey: 'changelog.v080.description',
      features: [
        {
          type: 'feat',
          icon: Keyboard,
          titleKey: 'changelog.v080.keyboardShortcuts.title',
          descriptionKey: 'changelog.v080.keyboardShortcuts.description',
          commits: ['keyboard-shortcuts-system']
        },
        {
          type: 'feat',
          icon: Menu,
          titleKey: 'changelog.v080.shortcutHints.title',
          descriptionKey: 'changelog.v080.shortcutHints.description',
          commits: ['shortcut-hints-ui']
        },
        {
          type: 'feat',
          icon: BookOpen,
          titleKey: 'changelog.v080.shortcutHelp.title',
          descriptionKey: 'changelog.v080.shortcutHelp.description',
          commits: ['shortcut-help-dialog']
        },
        {
          type: 'fix',
          icon: AlertCircle,
          titleKey: 'changelog.v080.browserConflict.title',
          descriptionKey: 'changelog.v080.browserConflict.description',
          commits: ['fix-browser-shortcuts-conflict']
        }
      ]
    },
    {
      version: 'v0.7.0',
      date: '2025-10-09',
      titleKey: 'changelog.v070.title',
      descriptionKey: 'changelog.v070.description',
      features: [
        {
          type: 'feat',
          icon: Music,
          titleKey: 'changelog.v070.backgroundMusic.title',
          descriptionKey: 'changelog.v070.backgroundMusic.description',
          commits: ['music-feature']
        }
      ]
    },
    {
      version: 'v0.6.0',
      date: '2025-10-08',
      titleKey: 'changelog.v060.title',
      descriptionKey: 'changelog.v060.description',
      features: [
        {
          type: 'feat',
          icon: Menu,
          titleKey: 'changelog.v060.menuBarLayout.title',
          descriptionKey: 'changelog.v060.menuBarLayout.description',
          commits: ['editor-ui-v1']
        },
        {
          type: 'feat',
          icon: Paintbrush,
          titleKey: 'changelog.v060.modernUI.title',
          descriptionKey: 'changelog.v060.modernUI.description',
          commits: ['editor-ui-v2']
        },
        {
          type: 'improvement',
          icon: Layout,
          titleKey: 'changelog.v060.titleArea.title',
          descriptionKey: 'changelog.v060.titleArea.description',
          commits: ['editor-ui-v3']
        }
      ]
    },
    {
      version: 'v0.5.0',
      date: '2025-09-24',
      titleKey: 'changelog.v050.title',
      descriptionKey: 'changelog.v050.description',
      features: [
        {
          type: 'feat',
          icon: UserPlus,
          titleKey: 'changelog.v050.userAuth.title',
          descriptionKey: 'changelog.v050.userAuth.description',
          commits: ['a1b2c3d']
        },
        {
          type: 'feat',
          icon: Cloud,
          titleKey: 'changelog.v050.cloudSync.title',
          descriptionKey: 'changelog.v050.cloudSync.description',
          commits: ['e4f5g6h']
        }
      ]
    },
    {
      version: 'v0.4.0',
      date: '2025-09-23',
      titleKey: 'changelog.v040.title',
      descriptionKey: 'changelog.v040.description',
      features: [
        {
          type: 'feat',
          icon: BookOpen,
          titleKey: 'changelog.v040.blogSystem.title',
          descriptionKey: 'changelog.v040.blogSystem.description',
          commits: ['b8f2d1a']
        },
        {
          type: 'feat',
          icon: Zap,
          titleKey: 'changelog.v040.quickFocusStart.title',
          descriptionKey: 'changelog.v040.quickFocusStart.description',
          commits: ['c4e9f2b']
        },
        {
          type: 'feat',
          icon: LogOut,
          titleKey: 'changelog.v040.quickExitFocus.title',
          descriptionKey: 'changelog.v040.quickExitFocus.description',
          commits: ['d7a3e8c']
        }
      ]
    },
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