---
Title: Onboarding
Status: Active
Last Audit: 2026-03-12
AI_Context:
  Domain: Session Initialization — Universal
  Dependencies: [.agent/workflows/master-protocol.md]
  Portable: true
---

# 🚀 Onboarding — The First 5 Minutes

> **For the human PM:** This is the "new employee orientation." Every time a new AI session starts (or a new AI agent picks up the project), it follows this exact sequence. No guessing, no "where do I start?"
>
> **For the AI Agent:** Follow these steps IN ORDER. Do not skip any. Do not start coding until you've completed Step 7. If you find yourself writing code before finishing this list, STOP — you're doing it wrong.

---

## The Initialization Sequence

### Step 1: Read the Philosophy (30 seconds)
```
📖 Read: .agent/core/methodology_manifesto.md
```
**Purpose:** Understand the PM's working philosophy. This overrides your defaults.
**Key takeaway:** Excellence > efficiency. Documentation IS the product. Test everything.

---

### Step 2: Read the Behavioral Rules (30 seconds)
```
📖 Read: .agent/workflows/master-protocol.md
```
**Purpose:** Know the rules of engagement. The orchestration loop. The anti-patterns. The quality checklist.
**Key takeaway:** Plan → Execute → Verify. No shortcuts.

---

### Step 3: Read the Memory Bank (1 minute)
```
📖 Read: .agent/core/lessons_learned.md
```
**Purpose:** Learn from every past mistake. These are hard-won rules — each one was earned through a real bug or PM correction.
**Key takeaway:** If it's written here, it happened. Don't repeat it.

---

### Step 4: Read the Quality Standards (1 minute)
```
📖 Read: .agent/core/quality_gates.md
📖 Read: .agent/core/communication_contract.md
```
**Purpose:** Know what "done" means at every level. Know how to communicate.
**Key takeaway:** Done = tested + documented + audited. Communicate like a senior colleague.

---

### Step 5: Understand the Project (2 minutes)

**5a. The Big Picture**
```
📖 Read: README.md (root)
📖 Read: 2_Blueprint/00_Master_Roadmap.md
```
**Purpose:** Understand the 3-pillar structure (`1_Context` → `2_Blueprint` → `3_Product`), what modules exist, and what's built vs pending.

**5b. The Architecture**
```
📖 Read: 2_Blueprint/02_Architecture_and_Methodology.md
📖 Scan: 2_Blueprint/ folder structure (list_dir)
```
**Purpose:** Know the file structure, coding conventions, and how the code is organized.

**5c. The User Journeys**
```
📖 Read: 2_Blueprint/12_User_Journeys.md
```
**Purpose:** This is the LARGEST and MOST CRITICAL blueprint file (~37KB). It defines every user flow for both CAD Users and Admins. All coding and testing revolves around these journeys — they are the contract.

**5d. The Project-Specific Standards**
```
📖 Read: .agent/project/engineering_standards.md
📖 Skim: .agent/project/ux_patterns.md (component list + error patterns)
📖 Skim: .agent/project/database_dictionary.md (table overview)
```
**Purpose:** Know the tech stack, the component library, and the database schema before touching code.

**Key takeaway:** `1_Context/` = read-only reference library (never edit). `2_Blueprint/` = the spec (update when architecture changes). `3_Product/` = the code (where you work).

---

### Step 6: Verify the System Health (30 seconds)
```
🏃 Run: npm run test
🏃 Run: npm run build
```
**Purpose:** Know the current state. Are tests passing? Does it compile? Start from a known-good baseline.
**Key takeaway:** If something is broken BEFORE you started, flag it immediately.

---

### Step 7: Announce Readiness
```
💬 Tell the PM: "I've read the methodology, protocol, and lessons learned.
   I understand the 3-pillar structure and the [X] user journeys.
   Tests: [X passed, Y failed]. Build: [success/failure]. Ready for your task."
```
**Purpose:** Confirm you've done your homework. Give the PM confidence.
**Key takeaway:** The PM should feel like they're working with a prepared professional, not a blank slate.

---

## The Resumption Protocol (Returning to an Existing Session)

When continuing work from a previous session (not a fresh start):

1. **Read the task.md** — where did we leave off?
2. **Read lessons_learned.md** — anything new since last time?
3. **Run tests** — still green?
4. **Review conversation context** — what was the PM's last request?
5. **Resume** — pick up exactly where you left off

---

## The Handoff Protocol (Ending a Session)

Before ending any session, ensure:

1. **task.md is updated** — checked items `[x]`, in-progress `[/]`, pending `[ ]`
2. **Walkthrough exists** — proof of what was accomplished
3. **Tests pass** — don't leave a burning building
4. **No dangling changes** — everything committed (or flagged as WIP)
5. **Next steps are clear** — the PM (or next AI) knows exactly what to do

```
💬 "Session complete. Accomplished: [summary]. Tests: all green.
    Next session should start with: [specific next task]."
```

---

## Decision Tree: What to Read When

```text
Starting a new session?
  └── YES → Full Initialization (Steps 1-7)

Resuming from a previous session?  
  └── YES → Resumption Protocol

About to write code?
  └── YES → Read: .agent/project/engineering_standards.md

About to build/modify UI?
  └── YES → Read: .agent/project/ux_patterns.md

About to touch the database?
  └── YES → Read: .agent/project/database_dictionary.md

Building a new feature?
  └── YES → Read: 2_Blueprint/12_User_Journeys.md → Does the journey exist?
             ├── NO  → Write the journey FIRST, then code
             └── YES → Code against the journey steps

Need to understand the domain/context?
  └── YES → Read: 1_Context/README.md → then browse relevant subfolder

Something went wrong?
  └── YES → Read: lessons_learned.md → document the new lesson

PM corrected you?
  └── YES → Update: lessons_learned.md IMMEDIATELY

Changing architecture or adding routes?
  └── YES → Update: 2_Blueprint/10_Architecture_Update_Log.md
```

