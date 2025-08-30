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