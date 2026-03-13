---
Title: New_Project_Setup
Status: Active
AI_Context:
  Domain: Project Bootstrapping — Universal
  Portable: true
---

# 🏭 New Project Setup — Bootstrapping `.agent/` on Any Project

> **For the human PM:** This is the "franchise playbook." When you start a new project, follow this guide to set up the `.agent/` system. It takes about 30 minutes and guarantees every project starts with the same quality standards.

---

## Step 1: Copy the Universal Layer (2 minutes)

Copy these files into your new project's `.agent/core/` directory. They work on ANY project without modification:

```
.agent/core/
├── methodology_manifesto.md     ← Philosophy (10 commandments + hierarchy + anti-patterns)
├── quality_gates.md             ← Definition of "done" (6-level pyramid)
├── communication_contract.md    ← How AI talks to PM (autonomy spectrum, IKEA rule)
├── onboarding.md                ← First-session initialization (7 steps)
└── lessons_learned.md           ← Start EMPTY — grows with the project
```

> **Important:** `lessons_learned.md` starts empty. It's a living document that accumulates project-specific wisdom. Don't copy lessons from another project — they may not apply.

---

## Step 2: Create the Workflow Entry Point (5 minutes)

Create `.agent/workflows/master-protocol.md`. This is the file the AI system loads automatically.

Start with a copy of the master-protocol from the template project, then customize:

1. Update the top-level `description:` in the YAML frontmatter
2. Update the Reference Files table to match your `core/` and `project/` files
3. Adjust anti-patterns if your project has different conventions
4. Keep the orchestration loop (Plan → Execute → Verify) — it's universal

---

## Step 3: Build the Project-Specific Layer (20 minutes)

Create `.agent/project/` with files specific to this project:

### a) `engineering_standards.md`
Document:
- Tech stack (framework, language, styling, backend, testing)
- Architecture (folder structure, MVC layers, service layer)
- File naming conventions
- Import order convention
- The `"use client"` / SSR rules (if applicable)

### b) `ux_patterns.md`
Document:
- Component library (every reusable component with props)
- Error handling patterns (when to toast vs banner vs boundary)
- State management (where state lives, who owns it)
- Responsive breakpoints

### c) `database_dictionary.md`
Document:
- Every table with every column
- Types, nullability, foreign keys
- Environment variables
- Backend-specific gotchas

---

## Step 4: Create the README (5 minutes)

Create `.agent/README.md` — the IKEA manual for the folder. List every file, its purpose, and an analogy.

---

## Step 5: Initialize the Memory (2 minutes)

Create `.agent/core/lessons_learned.md` with this template:

```markdown
---
Title: Lessons_Learned
Status: Active
AI_Context:
  Domain: Persistent Error Memory
---

# 🧠 Lessons Learned — The Memory Bank

> This document grows over time. Every AI correction → new entry.

---

## Permanent Directives

(None yet — this file grows as the project evolves)

---

## Correction Log

(No entries yet)
```

---

## Step 6: Run the Onboarding (5 minutes)

Start a new AI session and tell it:

```
"Read the .agent/ folder and follow the onboarding protocol in
 .agent/core/onboarding.md. Then announce your readiness."
```

The AI should read all files, run tests, verify the build, and confirm it's ready.

---

## Checklist

- [ ] `core/methodology_manifesto.md` — copied
- [ ] `core/quality_gates.md` — copied
- [ ] `core/communication_contract.md` — copied
- [ ] `core/onboarding.md` — copied
- [ ] `core/lessons_learned.md` — created (empty template)
- [ ] `workflows/master-protocol.md` — created and customized
- [ ] `project/engineering_standards.md` — written from scratch
- [ ] `project/ux_patterns.md` — written from scratch
- [ ] `project/database_dictionary.md` — written from scratch
- [ ] `README.md` — created
- [ ] First AI session ran onboarding successfully

---

## The Folder After Setup

```
.agent/
├── README.md
├── workflows/
│   └── master-protocol.md           ← AI reads this automatically
├── core/                            ← 🌍 UNIVERSAL (copied from template)
│   ├── methodology_manifesto.md
│   ├── quality_gates.md
│   ├── communication_contract.md
│   ├── onboarding.md
│   └── lessons_learned.md           ← Starts empty, grows
├── project/                         ← 🏗️ PROJECT-SPECIFIC (built fresh)
│   ├── engineering_standards.md
│   ├── ux_patterns.md
│   └── database_dictionary.md
└── templates/
    └── new_project_setup.md         ← This file
```
