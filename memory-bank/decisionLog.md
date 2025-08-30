# Decision Log

This file records architectural and implementation decisions using a list format.
2025-08-30 10:48:06 - Log of updates made.

*

## Decision

*

## Rationale 

*

## Implementation Details

*
---
### Decision
[2025-08-30 10:49:40] - Refactored `useLocalNotes` hook to resolve stale state issue.

**Rationale:**
The `getNodeById` function was returning stale data after `saveNote` was called. This was due to `useCallback` creating a closure over the `notes` state, which is not updated until the next render cycle after `setNotes` is called. The `saveNote` function was also returning a value from an outdated copy of the notes array.

**Implications/Details:**
- The `saveNotes` function now handles sorting and returns the updated, sorted array.
- The `saveNote` function now captures the returned array from `saveNotes` and uses that up-to-date array to find and return the newly created or updated note. This ensures that the caller of `saveNote` immediately receives the correct data without waiting for a re-render.
---
### Decision
[2025-08-30 10:56:51] - Refactored note state management to use the "Lifting State Up" pattern instead of React Context.

**Rationale:**
The user preferred to avoid a high-level Context provider. Lifting the `useLocalNotes` hook to the nearest common ancestor component (`page.tsx`) is a more direct and less complex solution for this specific use case. It centralizes state management for `NoteList` and `NoteEditor`, ensuring a single source of truth and predictable data flow without introducing a global context.

**Implications/Details:**
- The `useLocalNotes` hook is now called only once in `page.tsx`.
- The `notes` state and functions like `saveNote` and `deleteNote` are passed down to child components (`NoteList`, `NoteEditor`) as props.
- This change eliminates stale state issues between components and simplifies the overall architecture.
- The previously created `NotesContext.tsx` is now obsolete.

---
### Decision
[2025-08-30 15:33:30] - Adopt a comprehensive SEO architecture based on keyword strategy analysis to improve organic search visibility.

**Rationale:**
The provided keyword analysis (`docs/1.关键词策略.md`) reveals significant opportunities to attract organic traffic by targeting specific, high-volume keywords. A structured SEO architecture is necessary to systematically implement these keywords across the application, improving search engine ranking and driving user acquisition. The current application is a single-page app and needs technical SEO enhancements to be properly indexed and ranked.

**Implications/Details:**
1.  **Dynamic Metadata Management**:
    *   The main layout (`src/app/[locale]/layout.tsx`) will be modified to dynamically generate SEO-compliant `<title>` and `<meta name="description">` tags based on the current page, language, and content.
    *   A default set of metadata will be defined for the homepage, targeting core keywords like "online notepad", "free notepad", and "notes online".

2.  **Static Content & Keyword Integration**:
    *   The main page (`src/app/[locale]/page.tsx`) will be enhanced with static marketing copy (e.g., H1, H2, paragraphs) that naturally incorporates the primary keywords identified in the strategy. This content will clearly describe the site's purpose and features.

3.  **Structured Data (Schema Markup)**:
    *   A JSON-LD script block for `WebApp` schema will be added to the layout. This will help search engines understand the site as an application, potentially improving its appearance in search results. It will include details like the application's name, URL, and supported features.

4.  **Robots.txt Review & Sitemap Generation**:
    *   The existing `public/robots.txt` will be reviewed to ensure it allows crawling of all important pages.
    *   A process will be established to generate and submit a `sitemap.xml` file, listing all public-facing URLs (initially just the main locales).

5.  **Internationalization (i18n) SEO**:
    *   The application will implement `hreflang` tags to signal the language and regional targeting of each page to search engines, leveraging the existing `i18n` infrastructure. This will be managed within the layout.