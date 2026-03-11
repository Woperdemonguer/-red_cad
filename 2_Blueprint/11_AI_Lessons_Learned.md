# 🧠 AI Lessons Learned & Correction Tracker

> **Purpose:** This document is the persistent "Self-Improvement Loop" for the Antigravity system working on Red de CAD. Whenever the AI makes a mistake, requires user hand-holding, or receives a correction, the pattern MUST be logged here to prevent recurrence. The AI MUST review this file before making architectural decisions.

---

## 📚 Core Directives & Overrides

1. **Scalability Trumps Hardcoding:** Do not write huge configuration arrays directly into React files. If building a form or complex dropdowns, extract them to `config/` (As learned during the diagnostic form build).
2. **Database Flexibility:** Minor dynamic field changes in forms should be shoved into the `madurez_evaluacion JSONB` column to avoid excessive Postgres migrations. 

*(New lessons will be appended below)*
---

### [Date] - [Issue/Correction]
- **Mistake:** ...
- **Correction:** ...
- **New Rule:** ...
