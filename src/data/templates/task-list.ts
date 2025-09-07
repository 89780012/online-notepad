import { ListTodo } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const taskListTemplate: MarkdownTemplate = {
  id: 'task-list',
  name: 'taskListTemplate',
  description: 'taskListDescription',
  category: 'productivity',
  icon: ListTodo,
  tags: ['todo', 'tasks', 'productivity'],
  preview: `# Weekly Tasks - March 11-15, 2024

## High Priority 🔴
- [ ] Complete project proposal
- [ ] Review team performance reports
- [ ] Prepare client presentation

## Medium Priority 🟡
- [ ] Update documentation
- [ ] Code review for new features
- [ ] Schedule team building event

## Low Priority 🟢
- [ ] Organize desk workspace
- [ ] Read industry articles
- [ ] Update LinkedIn profile`,
  content: (t: (key: string) => string) => `# ${t('taskListTemplate')} - \${t('timeFrame')}

## ${t('highPriority')} 🔴
- [ ] 
- [ ] 
- [ ] 

## ${t('mediumPriority')} 🟡
- [ ] 
- [ ] 
- [ ] 

## ${t('lowPriority')} 🟢
- [ ] 
- [ ] 
- [ ] 

## ${t('inProgress')} ⏳
- [ ] 
- [ ] 

## ${t('completed')} ✅
- [x] 
- [x] 

## ${t('notes')}
${t('additionalNotes')}

## ${t('weeklyReview')}
### ${t('accomplishments')}
- 

### ${t('challenges')}
- 

### ${t('nextWeekFocus')}
- 

---
*${t('createdAt')} \${new Date().toLocaleDateString()}*`
};