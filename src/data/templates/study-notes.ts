import { BookOpen } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const studyNotesTemplate: MarkdownTemplate = {
  id: 'study-notes',
  name: 'studyNotesTemplate',
  description: 'studyNotesDescription',
  category: 'education',
  icon: BookOpen,
  tags: ['study', 'education', 'learning'],
  preview: `# React Hooks - Study Notes

## Key Concepts
- **useState**: Manages component state
- **useEffect**: Handles side effects
- **useContext**: Consumes context values

## Examples
\`\`\`javascript
const [count, setCount] = useState(0);

useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## Practice Questions
1. When should you use useCallback?
2. What's the difference between useRef and useState?`,
  content: (t: (key: string) => string) => `# ${t('studyNotesTemplate')} - \${t('subject')}

## ${t('keyConcepts')}
- **${t('concept')} 1**: 
- **${t('concept')} 2**: 
- **${t('concept')} 3**: 

## ${t('examples')}
\`\`\`javascript
// ${t('addCodeExample')}

\`\`\`

## ${t('importantFormulas')}
$$E = mc^2$$

## ${t('practiceQuestions')}
1. 
2. 
3. 

## ${t('summary')}
${t('studySummaryPrompt')}

## ${t('nextSteps')}
- [ ] ${t('reviewNotes')}
- [ ] ${t('practiceExercises')}
- [ ] ${t('askQuestions')}

---
*${t('studySession')} - \${new Date().toLocaleDateString()}*`
};