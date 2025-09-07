import { Target } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const projectPlanningTemplate: MarkdownTemplate = {
  id: 'project-planning',
  name: 'projectPlanningTemplate',
  description: 'projectPlanningDescription',
  category: 'business',
  icon: Target,
  tags: ['project', 'planning', 'management'],
  preview: `# Project Alpha - Planning Document

## Overview
This project aims to develop a new feature...

## Objectives
- Primary: Improve user engagement
- Secondary: Reduce support tickets
- Tertiary: Increase conversion rate

## Timeline
- **Week 1-2**: Research & Analysis
- **Week 3-4**: Design & Prototyping
- **Week 5-8**: Development
- **Week 9**: Testing & Launch`,
  content: (t: (key: string) => string) => `# ${t('projectPlanningTemplate')}

## ${t('overview')}
${t('projectOverviewPlaceholder')}

## ${t('objectives')}
- **${t('primary')}**: 
- **${t('secondary')}**: 
- **${t('tertiary')}**: 

## ${t('timeline')}
- **${t('week')} 1-2**: 
- **${t('week')} 3-4**: 
- **${t('week')} 5-8**: 
- **${t('week')} 9**: 

## ${t('resources')}
- **${t('team')}**: 
- **${t('budget')}**: 
- **${t('tools')}**: 

## ${t('risks')}
| ${t('risk')} | ${t('impact')} | ${t('mitigation')} |
|-------------|----------------|-------------------|
|             |                |                   |

## ${t('successMetrics')}
- 
- 
- 

---
*${t('createdAt')} \${new Date().toLocaleDateString()}*`
};