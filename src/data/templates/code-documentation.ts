import { Code } from 'lucide-react';
import { MarkdownTemplate } from './types';

export const codeDocumentationTemplate: MarkdownTemplate = {
  id: 'code-documentation',
  name: 'codeDocumentationTemplate',
  description: 'codeDocumentationDescription',
  category: 'technical',
  icon: Code,
  tags: ['code', 'documentation', 'api'],
  preview: `# API Documentation - User Service

## Overview
The User Service handles user authentication and profile management.

## Endpoints

### GET /api/users
Returns a list of all users.

**Parameters:**
- \`limit\` (optional): Number of users to return
- \`offset\` (optional): Starting position

**Response:**
\`\`\`json
{
  "users": [...],
  "total": 150,
  "limit": 10,
  "offset": 0
}
\`\`\``,
  content: (t: (key: string) => string) => `# ${t('codeDocumentationTemplate')} - \${t('projectName')}

## ${t('overview')}
${t('projectDescription')}

## ${t('installation')}
\`\`\`bash
npm install package-name
\`\`\`

## ${t('usage')}
\`\`\`javascript
import { functionName } from 'package-name';

// ${t('basicUsage')}
const result = functionName();
\`\`\`

## ${t('apiReference')}

### \`functionName(params)\`
${t('functionDescription')}

**${t('parameters')}:**
- \`param1\` (${t('type')}): ${t('description')}
- \`param2\` (${t('optional')}): ${t('description')}

**${t('returns')}:**
${t('returnDescription')}

**${t('example')}:**
\`\`\`javascript
const result = functionName('example');
console.log(result);
\`\`\`

## ${t('changelog')}
### v1.0.0
- ${t('initialRelease')}

---
*${t('lastUpdated')}: \${new Date().toLocaleDateString()}*`
};