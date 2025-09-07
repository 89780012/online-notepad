import { Users } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const meetingNotesTemplate: MarkdownTemplate = {
  id: 'meeting-notes',
  name: 'meetingNotesTemplate',
  description: 'meetingNotesDescription',
  category: 'business',
  icon: Users,
  tags: ['business', 'meeting', 'notes'],
  preview: `# Meeting Notes - Project Alpha

## Attendees
- John Smith (Project Manager)
- Sarah Johnson (Developer)
- Mike Chen (Designer)

## Agenda
1. Project Status Update
2. Timeline Review
3. Next Steps

## Key Decisions
- Feature freeze on March 15th
- Daily standup at 9:00 AM
- Demo scheduled for March 20th`,
  content: (t: (key: string) => string) => `# ${t('meetingNotesTemplate')}

## ${t('attendees')}
- 
- 
- 

## ${t('agenda')}
1. 
2. 
3. 

## ${t('keyDecisions')}
- 
- 
- 

## ${t('actionItems')}
- [ ] 
- [ ] 
- [ ] 

## ${t('nextMeeting')}
${t('date')}: 
${t('time')}: 
${t('location')}: 

---
*${t('createdAt')} \${new Date().toLocaleDateString()}*`
};