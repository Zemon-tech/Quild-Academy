## Navigation Link Migration Plan

Goal: Switch all internal navigations to Next.js `Link` for fast client-side transitions without changing current UI or behavior.

### Principles
- Use `next/link` for all internal routes; keep raw `<a>` only for external URLs, file downloads, and anchors.
- Preserve existing styles and semantics (e.g., buttons that look like links, links that look like buttons).
- Keep current auth, middleware, and data fetching intact during migration.
- No visual regressions; no route changes.

### Success Criteria
- No `<a href="/...">` used for internal app routes (app-relative paths) in the codebase.
- All existing navigation elements look and behave the same (hover, focus, pressed, disabled states).
- Measurable reduction in navigation latency between key pages (Dashboard → Lesson, Dashboard → Leaderboard, Schedule → Lesson).

---

### Phase 0 — Audit, Patterns, and Test Plan
1) Inventory all internal anchors:
   - Grep: `"<a href=\"/"` and `"href=\"/"` (JS/TS/TSX only) to list candidates.
   - Classify by context: standalone `<a>`, inside `Button asChild`, menu items, list items.
2) Define patterns to apply (see Code Patterns below).
3) Prepare test checklist: keyboard nav (Tab/Enter), focus ring, screen reader name, right-click open in new tab, middle-click, prefetch behavior.

Deliverables:
- A checklist of files/locations to change and the target pattern for each.

#### Phase 0 — Audit Findings (Checklist)
- `src/app/dashboard/page.tsx`
  - Button asChild link to lesson: replace `<a href={\`/lesson/${userProgress.currentLesson?._id}\`}>` with `Link`.
  - Button asChild link to leaderboard: replace `<a href="/leaderboard">` with `Link`.
- `src/app/schedule/page.tsx`
  - Button asChild link to lesson (within list): replace `<a href={\`/lesson/${lesson._id}\`}>` with `Link` (consider `prefetch={false}` if the list is large).

Notes:
- No other internal `<a href="/...">` anchors were detected in the `src/` tree during the audit.
- External links remain anchors and are out of scope for this migration.

### Phase 1 — Low-Risk Replacements (Buttons wrapping anchors)
Scope: Places already using `Button asChild` with `<a>`, e.g., Dashboard and Schedule pages.

Steps:
1) Replace `<a>` with `Link` while keeping `Button asChild`.
2) Ensure `prefetch` default is acceptable; disable (`prefetch={false}`) only on large lists.
3) Verify no style/behavior changes.

Verification:
- Snapshot UI, keyboard/mouse interactions, and navigation speed on affected pages.

### Phase 2 — Reusable Navigation Components
Scope: `Sidebar`, `Header`, `MobileBottomNav`, any list or menu components that render anchors.

Steps:
1) Centralize link rendering in these components to use `Link` for internal routes.
2) Keep external URLs using raw `<a target="_blank" rel="noopener noreferrer">`.
3) Add a tiny helper (if needed) to decide internal vs external by URL.

Verification:
- Smoke test all nav items; confirm client-side transitions and unchanged styling.

### Phase 3 — Dynamic and Parameterized Routes
Scope: Links to `/lesson/[lessonId]`, `/courses/[courseId]`, querystrings, and hashes.

Steps:
1) Convert all dynamic `href` strings to `Link` (template literals fine).
2) Preserve query and hash fragments.
3) Use `scroll` and `replace` props only where current behavior requires.

Verification:
- Deep link and back/forward behavior remain unchanged.

### Phase 4 — Edge Cases and Accessibility
Scope: Conditional links, disabled states, tooltips, nested interactive elements.

Steps:
1) Ensure disabled buttons do not render interactive links (guard at parent component).
2) Confirm accessible name exposure and focus order are unchanged.
3) Keep tooltip/aria props on the correct element after replacement.

Verification:
- Axe or Lighthouse a11y checks; keyboard-only navigation test.

#### Phase 4 — Outcome
- No instances of disabled Buttons wrapping `Link` were found.
- Conditional links render only when active (e.g., current lesson Start button) and keep accessible names.
- Focus order remains unchanged; `Button asChild` + `Link` preserves semantics and focus.
- No code changes required for this phase.

### Phase 5 — Performance Tuning and Prefetch Strategy
Steps:
1) Enable default `Link` prefetch for primary nav; disable on large virtualized lists or content-heavy routes.
2) Optionally add `priority` to the most common hero nav target if SSR hints are used elsewhere.
3) Monitor impact; adjust `prefetch` flags.

Verification:
- Compare navigation timings before/after; ensure no excessive prefetch traffic.

### Phase 6 — Telemetry and Rollback Plan
Steps:
1) Add minimal client metrics (if available) to measure `routeChangeStart` → `routeChangeComplete`.
2) Keep changes isolated per phase to allow simple rollback by file/PR.

Verification:
- Metrics confirm improvement; no error regressions.

---

### Code Patterns

1) Standalone anchor → Link
Before:
```tsx
<a href="/leaderboard" className="...">View Full Leaderboard</a>
```
After:
```tsx
import Link from 'next/link';

<Link href="/leaderboard" className="...">View Full Leaderboard</Link>
```

2) Button with anchor child → Button with Link child (shadcn/ui)
Before:
```tsx
<Button asChild>
  <a href={`/lesson/${id}`}>Start Learning</a>
  {/* retains button styles but forces full reload */}
}</Button>
```
After:
```tsx
import Link from 'next/link';

<Button asChild>
  <Link href={`/lesson/${id}`}>Start Learning</Link>
</Button>
```

3) External links remain anchors
```tsx
<a href="https://external.example" target="_blank" rel="noopener noreferrer">Docs</a>
```

4) Prefetch control (only when needed)
```tsx
<Link href="/heavy" prefetch={false}>Open Heavy Page</Link>
```

5) Query, hash, and behavior
```tsx
<Link href={{ pathname: '/search', query: { q: term } }} scroll={false}>Search</Link>
```

---

### Rollout Checklist
- Replace anchors in: `dashboard/page.tsx`, `schedule/page.tsx`.
- Review and update: `components/layout/sidebar.tsx`, `components/layout/mobile-bottom-nav.tsx`, `components/layout/header.tsx`.
- Search for remaining internal anchors; convert using patterns above.
- Regression test navigation (desktop/mobile), including back/forward and open-in-new-tab.
- Measure nav timings on key flows; verify improvement.

---

### Approvals & Next Steps
- On approval, begin Phase 1 with minimal diffs and verifiable UI parity, then proceed phase-by-phase with validation after each phase.


