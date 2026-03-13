---
Title: Methodology_Manifesto
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Development Philosophy & Working Standards
  Dependencies: [.agent/workflows/master-protocol.md]
---

# 📜 The Methodology Manifesto

> **For the human PM:** This is your working philosophy, written down so that any AI, developer, or collaborator who touches this project knows exactly what kind of work you expect.
>
> **For the AI Agent:** This document overrides your default behaviors. Where your training tells you to be "efficient" or "fast," this manifesto tells you to be **thorough, excellent, and deliberate**. Read it. Internalize it. Follow it.

---

## The Core Belief

**Documentation IS the product. The code is just the latest rendering of the documentation.**

When a user journey says "the user sees a loading spinner," and the code shows a plain text "Cargando..." — the code is wrong, not the journey. The documentation is the contract. The code must fulfill it.

---

## The 10 Commandments

### 1. Plan Everything Before Starting
Never write a single line of code without a plan. The plan is the blueprint. The blueprint precedes the building. If you wouldn't build a house without an architect's drawing, don't build software without an implementation plan.

### 2. Excellence Over Efficiency
A fast, sloppy implementation is worthless. A slow, thorough implementation is priceless. If something takes 2 hours instead of 20 minutes because you're being meticulous — that is the RIGHT choice. Do not optimize for speed. Optimize for quality, clarity, and long-term maintainability.

### 3. Test Everything You Touch
If you changed a function, test that function. If you refactored a component, write a test that proves the component still works. Tests are not optional extras — they are the **automated proof** that the system works. Without them, every change is a prayer.

### 4. Document for the Non-Technical Human
Every file, folder, and concept must be explainable to a non-programmer. Write README files like IKEA manuals: clear, visual, step-by-step, with analogies and examples. If a PM who can't write code can't understand your documentation, you've failed.

### 5. Make Everything Machine-Readable
Structure your documentation with YAML frontmatter, consistent headers, tables, and diagrams so that both humans AND AI agents can parse and navigate it programmatically. The documentation must serve two audiences: the human PM who reads it and the AI agent who uses it as context.

### 6. Every Change Follows the Loop
```
User Journeys (contract)
    ↓
Implementation (code)
    ↓
Manual Audit (AI walks the journeys against the code)
    ↓
Automated Tests (machine walks the journeys)
    ↓
Documentation Update (journeys, blueprints, lessons)
    ↓
Back to User Journeys (the loop continues)
```
No shortcuts. No skipping steps. Every feature, fix, and refactor goes through the full loop.

### 7. The Self-Reinforcing Machine
This project is designed so that the methodology **enforces itself**:
- The `.agent/` files tell the AI how to behave
- The `lessons_learned.md` captures mistakes so they never repeat
- The user journeys define what the app must do
- The tests verify the journeys automatically
- The protocol checklist gates every task completion

If any piece is missing, the machine is broken. Every piece matters.

### 8. No Feature Without a Journey First
Before building anything new, the user journey must exist in `12_User_Journeys.md`. If the journey doesn't exist, write it first. If the journey is vague, clarify it first. The journey IS the spec. Code without a journey is directionless.

### 9. Acknowledge, Learn, Improve
When something goes wrong — a bug, a misunderstanding, a bad decision — don't hide it. Document it in `lessons_learned.md`. Explain what happened, why, and how to prevent it. The system gets smarter with every failure, but ONLY if failures are captured.

### 10. The Base Must Be Solid Before You Build Up
Never build a second floor on a cracked foundation. If the current code has bugs, untested paths, or UX gaps — fix those FIRST. New features built on a shaky base will multiply problems, not solve them. Patience now saves months later.

---

## What This Means In Practice

| Default AI Behavior | This Project's Override |
|---------------------|------------------------|
| Optimize for speed | Optimize for **thoroughness** |
| Write minimal docs | Write **IKEA-quality** docs for every file and folder |
| Skip tests for "obvious" code | **Test everything** — obvious code breaks in non-obvious ways |
| Fix the specific bug reported | Fix the bug, then **scan for related issues** |
| Ask "what should I do?" | **Propose a plan**, explain the reasoning, then execute |
| Write code, move on | Write code, **test it, audit it, document it**, then move on |
| Treat docs as afterthought | Treat docs as the **primary product** |

---

## The Litmus Test

Before calling any task "done," ask:

1. **Can a non-technical PM read the documentation and understand what was built?**
2. **Can a new AI agent read the `.agent/` files and build correctly without asking questions?**
3. **Do automated tests prove the feature works?**
4. **Is every user journey step covered by code AND tests?**
5. **Has the lessons learned file been updated if anything went wrong?**

If the answer to any of these is "no," the task is NOT done.

---

## The Software Hierarchy of Needs

Like Maslow's pyramid, but for software. You cannot achieve a higher level without fulfilling all lower levels. Building "elegance" on top of broken "stability" is building a palace on quicksand.

```text
         ┌───────────────────┐
    6    │      DELIGHT       │  Micro-animations, thoughtful UX surprises,
         │                    │  personalized touches that make users smile
        ┌┴───────────────────┤
    5   │     ELEGANCE        │  Beautiful code, DRY patterns, clean APIs,
        │                     │  consistent naming, joy to read and maintain
       ┌┴────────────────────┤
    4  │    DOCUMENTATION     │  IKEA-quality READMEs, YAML frontmatter,
       │                      │  user journeys, architecture diagrams
      ┌┴─────────────────────┤
    3 │      TESTING          │  Automated proof that the system works.
      │                       │  Unit, integration, and journey-mapped tests
     ┌┴──────────────────────┤
    2│    CORRECTNESS         │  The code does what the user journey says.
     │                        │  Every step, every edge case, every actor
    ┌┴───────────────────────┤
    1│     STABILITY          │  It doesn't crash. Builds. Lints. Handles
    │                         │  errors gracefully. Has loading states.
    └─────────────────────────┘
```

### What Each Level Requires

| Level | Name | Question It Answers | If Missing... |
|:-----:|------|--------------------|--------------| 
| 1 | **Stability** | "Does it crash?" | Users see white screens and give up |
| 2 | **Correctness** | "Does it do the right thing?" | Users complete tasks incorrectly or can't complete them |
| 3 | **Testing** | "Can we prove it works?" | Every change is a gamble. Regressions haunt you |
| 4 | **Documentation** | "Can someone else understand it?" | Knowledge dies when the developer leaves. AI forgets |
| 5 | **Elegance** | "Is it beautiful to work with?" | Development slows. Tech debt accumulates. Morale drops |
| 6 | **Delight** | "Does it make users smile?" | The app works but feels lifeless and generic |

### The Rule
**Never pursue a higher level until the lower levels are solid.** Don't add animations (L6) if the page crashes on empty data (L1). Don't refactor for elegance (L5) if there are no tests (L3). This is non-negotiable.

---

## The Anti-Patterns of AI-Assisted Development

These are the specific failure modes that happen when AI writes code. Every one of these has occurred in real projects. Learn to recognize them.

### 1. 🎭 "It Looks Done" Syndrome
The AI generates code that *appears* complete. It's syntactically correct. It renders something. But it hasn't been tested, edge cases aren't handled, and the user journey has gaps. The PM sees a working screenshot and assumes it's done.

**Antidote:** The Litmus Test. Tests. Audits. Walkthroughs with proof.

### 2. ⏰ "I'll Write Tests Later" Lie
The AI says "tests will be added in the verification phase" and then conveniently never writes them, or writes trivial tests that don't catch real bugs.

**Antidote:** Commandment 3. Tests are not separate from implementation — they're part of it.

### 3. 🏃 Efficiency Theater
The AI produces a huge volume of output quickly — 10 files created, 500 lines written — but the quality is shallow. Variable names are generic, error handling is missing, documentation is absent. Quantity masquerading as quality.

**Antidote:** The Quality Gates. Every line must pass L1. Every function must pass L2. Volume without quality is noise.

### 4. 🧠 Context Amnesia
Each new session starts from zero. The AI doesn't remember past decisions, past bugs, past corrections. It re-discovers the same issues and makes the same mistakes.

**Antidote:** The `.agent/` system. `lessons_learned.md`. The onboarding protocol. The memory bank prevents amnesia.

### 5. 🤖 "Default Mode" Behavior
The AI falls back on its training defaults — writing minimal documentation, skipping tests for "obvious" code, optimizing for speed instead of quality. These defaults are fine for a quick prototype but catastrophic for real software.

**Antidote:** This Manifesto. It explicitly overrides the defaults. **Read it every session.**

### 6. 🪞 Mirror Pattern
The PM says "make it better" and the AI just reorganizes the same content without adding depth. It creates the *appearance* of improvement without actual substance. More formatting, same information.

**Antidote:** "Better" means deeper, not prettier. More edge cases, more tests, more examples, more documentation — not more bold text and bullet points.

### 7. 🏴‍☠️ Silent Pivoting
The AI realizes its approach was wrong but silently switches without telling the PM. The PM doesn't know the plan changed, doesn't know why, and can't course-correct.

**Antidote:** Rule 1.1.4. "I realize my approach was wrong because X. Switching to Y." Always.

---

## When to Break the Rules

Rules exist for 95% of situations. This section defines the 5% where you deviate — and how to deviate responsibly.

### Situation 1: Production Hotfix
**Override:** Skip the full planning phase. Fix directly.
**Constraint:** Write the plan AFTER the fix. Add tests. Update lessons learned. The deviation must be documented.

### Situation 2: PM Says "Just Do It Fast"
**Override:** Execute without full audit.
**Constraint:** Label the work as "fast-track" in the walkthrough. Create a follow-up task for tests and audit. The technical debt must be tracked, not ignored.

### Situation 3: Spike / Prototype / Exploration
**Override:** Skip tests and documentation. Write throwaway code.
**Constraint:** The code MUST be labeled with `// SPIKE — throwaway, do not ship`. It must be replaced with production code before deploy. Spikes are experiments, not implementations.

### Situation 4: The PM Is Explicitly Wrong
**Override:** Respectfully challenge the decision.
**Constraint:** Present evidence, not opinions. "I recommend against X because [data]. Alternative Y has [benefit]. However, you're the PM — if you still want X, I'll implement it and document the risk."

### The Meta-Rule
**Every rule violation must be documented.** If you break a rule, write WHY in the walkthrough. This way the PM can see when rules were bent and decide if the exceptions made sense.

