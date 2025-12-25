## 🔧 COMPLETE REFACTOR PROMPT (WITH CONTEXT + DUMMY APIs)

I am building an **Innovation / Hackathon module** inside an existing **LMS**, inspired by **Devpost’s project submission stepper**.

I already had a stepper from another project but **uprooted it**, and I now want to **refactor and rebuild on top of existing foundations**, not start from scratch.

---

## 🧠 Existing Context (IMPORTANT – USE THIS)

- Route:

  ```ts
  path = '/innovation/submit-project';
  ```

- Existing component (must be reused & extended, not discarded):

  ```ts
  import { TeamSetupWizard } from '@/components/setup-wizard/TeamSetupWizard';
  ```

- The old stepper logic existed but was removed; this task is to:

  - Refactor
  - Recompose
  - Build forward using modern patterns

---

## 🎯 Objective

Refactor the project submission flow into a **Devpost-style multi-step stepper** that:

- Builds **on top of `TeamSetupWizard`**
- Uses **context/state** for step data
- Uses **dummy/mock API endpoints**
- Uses **dummy payloads and responses**
- Adds **tooltips, helper text, and guidance**
- Is cleanly structured so real APIs can be swapped in later

---

## 🧭 Stepper Structure (REQUIRED)

Stepper steps (top navigation, clickable):

```
1. Manage Team
2. Project Overview
3. Project Details
4. Additional Info
5. Submit
```

### Global Rules

- Non-linear navigation
- Autosave on change
- Step-level validation
- Submit locked until required steps complete
- Project begins in `DRAFT` state

---

## 🧑‍🤝‍🧑 Step 1: Manage Team (REUSE EXISTING)

### Refactor Rules

- **Reuse `TeamSetupWizard`**
- Wrap it inside the new stepper
- Extend it where necessary

### Behavior

- Project creator = Owner
- Invite members (dummy logic)
- Assign roles (Owner, Member, Mentor)
- Set visibility (Private / Public)
- checkout team roles
- Team Name, can choose the teams he exists or invite a teamMembers and name it
  Option A: Use Existing Team
  Option B:
  Team Name \*
  [ _______________________ ]

Invite Team Members
[ email / username input ] [+ Add]

### Tooltips

- “Team members can be invited later.”
- “Mentors do not count toward team size.”
- “Private projects are only visible to reviewers.”

### Completion Rule

- At least 1 team member

---

## 🧾 Step 2: Project Overview

### Fields

- Project name (required)
- Elevator pitch (required)
- Thumbnail upload (dummy file handler)
- Tags / categories

### Tooltips

- “This is the first thing reviewers see.”
- “Keep the pitch under 200 characters.”

---

## 📘 Step 3: Project Details

### Fields

- Problem statement (required)
- Proposed solution (required)
- Target users
- Innovation / uniqueness
- Tech stack
- Project status (Idea / Prototype / MVP)

### Tooltips

- “Clearly explain the real-world problem.”
- “Describe what makes your idea different.”

---

## ➕ Step 4: Additional Info

### Fields

- Expected impact
- Risks & challenges
- Sustainability
- Requested support (mentorship, funding)

### Tooltips

- “Optional, but helps reviewers understand scale.”
- “Be honest about risks.”

---

## 🚀 Step 5: Submit

### Behavior

- Show read-only project summary
- Validate all required steps
- Confirm submission
- Change project status from:

```
DRAFT → SUBMITTED
```

---

## 🔄 Project States (MANDATORY)

Use these states in logic and UI:

```
DRAFT
SUBMITTED
UNDER_REVIEW
CHANGES_REQUESTED
APPROVED
REJECTED
```

---

## 🧠 Context & State Management

Use a **ProjectSubmissionContext** (or equivalent):

- Store step data
- Track step completion
- Track project status
- Expose save/update methods

---

## 🌐 Dummy API Requirements (IMPORTANT)

### Use mock endpoints ONLY (I will replace later)

Examples:

```ts
POST   /api/mock/projects
PATCH  /api/mock/projects/:id
GET    /api/mock/projects/:id
POST   /api/mock/projects/:id/submit
```

### Dummy API behavior

- Simulate latency
- Return fake IDs
- Return status updates
- Persist data in memory or localStorage

⚠️ Do NOT hardcode real URLs
⚠️ Keep API layer isolated

---

## 🎨 UX / UI Requirements

- Sticky stepper at top
- Clear “Save & Continue” CTA
- Visual step completion (✔️)
- Tooltips via icons or hover
- Clean, Devpost-like aesthetic
- Responsive and accessible

---

## 🧩 Refactor Expectations

- Modular components per step
- Stepper orchestrator component
- Existing `TeamSetupWizard` adapted, not replaced
- Clean separation of:

  - UI
  - State
  - API calls

- Comments explaining where to swap real APIs

---

## 📦 Deliverables

1. Refactored stepper at `/innovation/submit-project`
2. Context-driven project state
3. Dummy API layer
4. Tooltips & helper text
5. Clear upgrade path to real backend
