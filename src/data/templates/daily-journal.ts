import { Calendar } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const dailyJournalTemplate: MarkdownTemplate = {
  id: 'daily-journal',
  name: 'dailyJournalTemplate',
  description: 'dailyJournalDescription',
  category: 'personal',
  icon: Calendar,
  tags: ['journal', 'daily', 'reflection'],
  preview: `# Daily Journal - March 15, 2024

## Today's Highlights
- Completed the new feature implementation
- Had a productive team meeting
- Learned about React Server Components

## Mood & Energy
😊 **Mood**: Good
⚡ **Energy Level**: 8/10

## Tomorrow's Goals
- [ ] Review pull requests
- [ ] Prepare presentation slides
- [ ] Team lunch at 12:30`,
  content: (t: (key: string) => string) => `# ${t('dailyJournalTemplate')} - \${new Date().toLocaleDateString()}

## ${t('todaysHighlights')}
- 
- 
- 

## ${t('moodAndEnergy')}
😊 **${t('mood')}**: 
⚡ **${t('energyLevel')}**: /10

## ${t('reflections')}
${t('reflectionPrompt')}

## ${t('tomorrowsGoals')}
- [ ] 
- [ ] 
- [ ] 

## ${t('gratitude')}
${t('gratefulFor')}:
1. 
2. 
3. 

---
*${t('journalEntry')} - \${new Date().toLocaleDateString()}*`
};