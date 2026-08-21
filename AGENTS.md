<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI Stability & Upgrade Protocol Rules

## 1. UI Stability & Design System
- The application visual design MUST NOT depend on frequently changing third-party CSS frameworks (e.g. Tailwind, Bootstrap, Material UI).
- Use CSS Modules (`.module.css`) and project-owned CSS (`app/globals.css`).
- Maintain the internal reusable design system in `components/ui/`:
  - Buttons (`Button.tsx`)
  - Inputs (`Input.tsx`)
  - Selects (`Select.tsx`)
  - Tables (`Table.tsx`)
  - Cards (`Card.tsx`)
  - Modals & Dialogs (`Modal.tsx`)
  - Navigation (`Sidebar.tsx`, `Header.tsx`)
  - Status badges (`Badge.tsx`)
  - Pagination (`Pagination.tsx`)
- Keep UI components independent from Next.js internals where possible.

## 2. Production Upgrade Protocol
Before any major Next.js, React, or dependency upgrade:
1. Create a Git branch.
2. Update dependencies.
3. Run TypeScript checks (`npx tsc --noEmit`).
4. Run lint checks.
5. Run automated unit & integration tests.
6. Run database schema tests.
7. Test all financial calculation modules (`lib/loan/`).
8. Test authentication & RBAC.
9. Test all major application pages in the browser.
10. Only merge after everything passes. Never upgrade production directly.

