import { Lightbulb } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const brainstormingTemplate: MarkdownTemplate = {
  id: 'brainstorming',
  name: 'brainstormingTemplate',
  description: 'brainstormingDescription',
  category: 'creative',
  icon: Lightbulb,
  tags: ['brainstorm', 'ideas', 'creative'],
  preview: `# Brainstorming Session - New App Features

## Problem Statement
How can we improve user engagement in our mobile app?

## Ideas (No Judgment Zone!)
- Push notifications for achievements
- Gamification with points system
- Social sharing features
- Personalized content recommendations
- Dark mode theme
- Offline functionality

## Evaluation Criteria
- Feasibility (1-5)
- Impact (1-5)
- Resources Required (1-5)`,
  content: (t: (key: string) => string) => `# ${t('brainstormingTemplate')} - \${t('topic')}

## ${t('problemStatement')}
${t('problemPrompt')}

## ${t('ideas')} (${t('noJudgmentZone')}!)
- 
- 
- 
- 
- 

## ${t('categorization')}
### ${t('quickWins')}
- 

### ${t('bigIdeas')}
- 

### ${t('longTermGoals')}
- 

## ${t('evaluationCriteria')}
- **${t('feasibility')}**: (1-5)
- **${t('impact')}**: (1-5)
- **${t('resources')}**: (1-5)

## ${t('topPriorities')}
1. 
2. 
3. 

## ${t('nextSteps')}
- [ ] ${t('researchIdeas')}
- [ ] ${t('validateWithUsers')}
- [ ] ${t('createPrototype')}

---
*${t('brainstormingSession')} - \${new Date().toLocaleDateString()}*`
};