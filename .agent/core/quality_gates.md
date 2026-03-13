---
Title: Quality_Gates
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Definition of Done — Universal
  Dependencies: [.agent/workflows/master-protocol.md, .agent/core/methodology_manifesto.md]
  Portable: true
---

# ✅ Quality Gates — The Definition of "Done" at Every Level

> **For the human PM:** This is the "building inspection manual." Just like a construction inspector checks the foundation before the walls, and the walls before the roof — this document defines what "done" looks like at every level of the software. If any level fails inspection, the levels above it are unreliable.
>
> **For the AI Agent:** Before marking ANYTHING as complete, you must verify it passes the gate for its level. A feature that passes Level 4 but fails Level 1 is NOT done — it just looks done. That's worse.

---

## The Pyramid

```text
         ┌──────────────────┐
         │  Level 6: DELIGHT │  ← Micro-animations, wow moments
        ┌┤  Level 5: RELEASE │  ← All journeys walked, PM approved
       ┌┤│  Level 4: FEATURE │  ← Journey → Code → Test → Audit → Docs
      ┌┤││  Level 3: COMPONENT│ ← Responsive, accessible, loading states
     ┌┤│││  Level 2: FUNCTION │ ← Tested, error-handled, documented
    ┌┤││││  Level 1: LINE     │ ← Linted, named correctly, semantic tokens
    └┴┴┴┴┴──────────────────────┘
```

**You cannot certify a higher level without passing all lower levels.** A "done" feature (L4) requires every component (L3) to be done, which requires every function (L2) to be done, which requires every line (L1) to be correct.

---

## Level 1: LINE — The Atom

> Does every single line of code meet the project's standards?

| Gate | Check | How |
|:----:|-------|-----|
| 1.1 | **Linted** | `npm run lint` passes with zero warnings |
| 1.2 | **Named correctly** | Variables: `camelCase`. Components: `PascalCase`. Files follow convention |
| 1.3 | **Semantic tokens only** | No raw hex colors, hardcoded strings, or magic numbers in JSX |
| 1.4 | **No placeholders** | No `// TODO`, `// FIXME`, `// ...rest of code`, `// placeholder` |
| 1.5 | **Import order** | React → Third-party → Internal services → Components → Config |

**When to check:** After writing any code. This is unconscious habit, like a surgeon washing hands.

---

## Level 2: FUNCTION — The Building Block

> Does every function work correctly, handle errors, and explain itself?

| Gate | Check | How |
|:----:|-------|-----|
| 2.1 | **Single responsibility** | Function does ONE thing. If it has "and" in the description, split it |
| 2.2 | **Error handling** | Every async function has try/catch or error check. Errors are meaningful (Spanish for users, English for console) |
| 2.3 | **JSDoc header** | Every exported function has `/** */` with `@param`, `@returns`, and a one-line summary |
| 2.4 | **Unit tested** | At least one test proves it works correctly AND one test proves it handles errors |
| 2.5 | **No side effects** | Function doesn't silently modify external state. Mutations are explicit |
| 2.6 | **Return shape documented** | If it returns data, the shape/type is documented (even in plain JS) |

**When to check:** After completing any function. Run the specific test file.

---

## Level 3: COMPONENT — The Room

> Does this UI component look right, feel right, and work for everyone?

| Gate | Check | How |
|:----:|-------|-----|
| 3.1 | **Responsive** | Works on mobile (< 640px), tablet (768px), desktop (1024px+) |
| 3.2 | **Loading state** | Shows `<LoadingSpinner>` while data loads. Never a blank screen |
| 3.3 | **Error state** | Shows meaningful error if data fails to load |
| 3.4 | **Empty state** | Shows descriptive message + action button when no data exists |
| 3.5 | **Accessible** | Keyboard navigable, aria-labels on icons/buttons, color contrast |
| 3.6 | **Animated** | Page entrance uses `animate-fade-in`. Cards use `animate-slide-up` |
| 3.7 | **Render tested** | At minimum: a snapshot test proves it renders without crashing |
| 3.8 | **Props documented** | Every prop is listed with type and purpose in a JSDoc block |

**When to check:** After building/modifying any component. Visual QA via browser.

---

## Level 4: FEATURE — The Floor

> Does this entire feature fulfill its user journey, end to end?

| Gate | Check | How |
|:----:|-------|-----|
| 4.1 | **Journey exists** | The user journey is documented in `12_User_Journeys.md` BEFORE coding starts |
| 4.2 | **Journey fulfilled** | Every step in the journey is implemented in code |
| 4.3 | **Edge cases covered** | The journey's edge cases (listed in the journey doc) are handled |
| 4.4 | **Integration tested** | Tests cover the happy path AND at least 2 error paths |
| 4.5 | **Audited** | A UX audit has been performed: code walked against the journey steps |
| 4.6 | **Documented** | Architecture docs updated. Blueprints updated. README if new folder |
| 4.7 | **No regressions** | Existing tests still pass. No new lint warnings |

**When to check:** After completing a feature chunk. This is the Phase C checklist.

---

## Level 5: RELEASE — The Building

> Is the entire system ready for a real user to use?

| Gate | Check | How |
|:----:|-------|-----|
| 5.1 | **All tests green** | `npm run test` → 0 failures |
| 5.2 | **Build succeeds** | `npm run build` → 0 errors |
| 5.3 | **All journeys walked** | Every journey (J1–J7+) walked against the deployed code |
| 5.4 | **UX audit clean** | 0 breakers, 0 gaps. Only polish items remain |
| 5.5 | **Documentation complete** | All blueprints current. All READMEs present. `lessons_learned.md` up to date |
| 5.6 | **PM sign-off** | The human has reviewed and approved |

**When to check:** Before deploying or starting a new major feature.

---

## Level 6: DELIGHT — The Garden

> Does the app make users *smile*?

This level is aspirational. It's not a gate — it's a direction:

- Micro-animations that feel natural, not robotic
- Thoughtful empty states that feel human ("Aún no hay nada aquí. ¡Empieza completando tu perfil!")
- Loading states that feel fast (skeleton loaders, optimistic updates)
- Personalized touches (greeting by name, contextual help)
- Consistency so deep that every page feels like it was built by the same person

**When to pursue:** Only after Levels 1–5 are solid. Delight on a broken foundation is decoration on a ruin.

---

## Quick Reference: The Gate Matrix

| Level | When Certified | Key Artifacts |
|:-----:|---------------|--------------|
| L1 | After every code edit | `npm run lint` |
| L2 | After every function | Test file + JSDoc |
| L3 | After every component | Browser QA + render test |
| L4 | After every feature | Journey doc + audit |
| L5 | Before every release | Full test suite + walkthrough |
| L6 | Continuously | User feedback + PM vision |
