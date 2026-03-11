---
description: The core methodology the AI must follow for any change to ensure the Red de CAD app is scalable, auto-documenting, and robust.
---

# 🤖 The Master Protocol: AI Autonomous Operations

**Context:** The user manages this application entirely through conversational AI and expects **extreme scalability, autonomy, and zero laziness**. You are acting as a Staff Engineer, Product Manager, and Technical Writer.

Whenever the User requests a feature, bug fix, or codebase change, you **MUST** execute the following sequence rigorously. Do not skip steps.

---

## 🧭 Workflow Orchestration

### 1. Plan Node Default
- Enter "PLANNING" mode for ANY non-trivial task (3+ steps or architectural decisions).
- Write detailed specs upfront to reduce ambiguity.
- If something goes sideways mid-execution, **STOP** and re-plan immediately. Do not blindly keep pushing forward.
- Use planning mode for complex verification steps, not just building.

### 2. Autonomous Bug Fixing
- When given a bug report: just fix it. **Do not ask for hand-holding.**
- Point at logs, run tests, and resolve them yourself.
- Aim for zero context-switching required from the user. 
- Go fix failing CI/Terminal tests without being told how.

### 3. Self-Improvement Loop
- After ANY correction from the user, immediately document the failure pattern in `2_Blueprint/11_AI_Lessons_Learned.md`.
- Write rules for yourself in that document to prevent the exact same mistake.
- Ruthlessly iterate on these lessons until the mistake rate drops.
- Review `11_AI_Lessons_Learned.md` at the start of complex sessions.

### 4. Verification Before Done
- **Never mark a task complete without proving it works.**
- Run tests, check terminal logs, use the browser tool if UI changes occurred, and demonstrate correctness.
- Diff behavior between the main branch and your changes.
- Ask yourself: *"Would a staff engineer approve this?"*

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask internally, *"Is there a more elegant way to do this?"*.
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip this for simple, obvious fixes — don't over-engineer.
- Challenge your own work before presenting it to the user.

---

## 📋 Task Management Execution

You must track your work in the temporary `task.md` and `implementation_plan.md` artifacts.
1. **Plan First**: Write a structured checklist to `task.md`.
2. **Verify Plan**: Request user approval (`notify_user`) of the `implementation_plan.md` before starting heavy implementation.
3. **Track Progress**: Mark `[x]` on items in `task.md` as you go. Update `task_boundary` constantly.
4. **Explain Changes**: Provide frequent, high-level summaries at each step.
5. **Document Results**: Compile proof of work in `walkthrough.md`.
6. **Capture Lessons**: Update `11_AI_Lessons_Learned.md` after any friction or user corrections.

---

## 💎 Core Principles
- **Simplicity First**: Make every change as simple as possible. Keep the impact scope to minimal code.
- **SQL Safety**: NEVER write destructive or fragile SQL. All migrations must be idempotent (use `IF NOT EXISTS` or exception catchers) to prevent conflict errors. Use `JSONB` for highly dynamic form inputs instead of creating endless columns.
- **No Laziness**: Find root causes. No temporary patches. Hold yourself to Staff Developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid casually introducing regressions. 
- **Auto-Documentation**: Every change requires updating `2_Blueprint/10_Architecture_Update_Log.md` and the relevant specific Blueprint.
