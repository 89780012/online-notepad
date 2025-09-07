// 导出类型定义
export * from './types';
export * from './categories';

// 导入所有模板
import { meetingNotesTemplate } from './meeting-notes';
import { projectPlanningTemplate } from './project-planning';
import { dailyJournalTemplate } from './daily-journal';
import { studyNotesTemplate } from './study-notes';
import { codeDocumentationTemplate } from './code-documentation';
import { brainstormingTemplate } from './brainstorming';
import { taskListTemplate } from './task-list';

import { ProcessedTemplate } from './types';

// 定义模板获取函数，接收翻译函数作为参数，返回处理后的模板
export const getTemplates = (t: (key: string) => string): ProcessedTemplate[] => {
  return [
    {
      ...meetingNotesTemplate,
      content: typeof meetingNotesTemplate.content === 'function' 
        ? meetingNotesTemplate.content(t) 
        : meetingNotesTemplate.content
    },
    {
      ...projectPlanningTemplate,
      content: typeof projectPlanningTemplate.content === 'function' 
        ? projectPlanningTemplate.content(t) 
        : projectPlanningTemplate.content
    },
    {
      ...dailyJournalTemplate,
      content: typeof dailyJournalTemplate.content === 'function' 
        ? dailyJournalTemplate.content(t) 
        : dailyJournalTemplate.content
    },
    {
      ...studyNotesTemplate,
      content: typeof studyNotesTemplate.content === 'function' 
        ? studyNotesTemplate.content(t) 
        : studyNotesTemplate.content
    },
    {
      ...codeDocumentationTemplate,
      content: typeof codeDocumentationTemplate.content === 'function' 
        ? codeDocumentationTemplate.content(t) 
        : codeDocumentationTemplate.content
    },
    {
      ...brainstormingTemplate,
      content: typeof brainstormingTemplate.content === 'function' 
        ? brainstormingTemplate.content(t) 
        : brainstormingTemplate.content
    },
    {
      ...taskListTemplate,
      content: typeof taskListTemplate.content === 'function' 
        ? taskListTemplate.content(t) 
        : taskListTemplate.content
    }
  ];
};