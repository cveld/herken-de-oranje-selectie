---
name: learn
description: Capture durable learnings from the current session into the repo's memory — a small root CLAUDE.md (index only) plus focused, lazy-loaded docs under docs/. Use when the user says "leg het geleerde vast", "learn", "update de docs/CLAUDE.md", or wants session knowledge persisted.
---

# Learn — persist session knowledge

Goal: keep **CLAUDE.md tiny** (an index that's always in context) and push the
detail into **topic docs that load on demand**. Future sessions read CLAUDE.md
first and only open the doc they need.

## What counts as a learning

Record only **durable, reusable** facts that are **not obvious from the code or
git history**:

- Non-obvious conventions, workflows, and "why it's done this way" decisions.
- Gotchas / footguns and how to avoid them (e.g. auth quirks, env requirements).
- Cross-cutting architecture that isn't clear from one file.

Do **not** record: one-off task details, things already in the code/README,
or anything an existing skill already documents — link to the skill instead.

## How to write it

1. **Root `CLAUDE.md` stays small** (aim < ~40 lines):
   - One or two lines describing the project.
   - A `## Docs` index: one bullet per doc as `- [Title](docs/x.md) — one-line hook`.
   - At most a few truly global rules that apply to *every* task.
   - No detail prose — that belongs in the docs.

2. **Topic docs live in `docs/`**, one concern per file, named by topic
   (e.g. `docs/architecture.md`, `docs/workflows.md`). Each doc is focused and
   self-contained, with concrete paths, commands, and reasoning.

3. **Update, don't duplicate**: if a doc or CLAUDE.md bullet already covers the
   topic, edit it. Remove anything that has become wrong.

4. **Link, don't inline**: reference relevant skills and key files by path
   rather than copying their content.

## Procedure

1. Review the session for learnings that meet the bar above.
2. Read the existing `CLAUDE.md` and `docs/` (if any).
3. Create/update the focused doc(s) under `docs/`.
4. Update `CLAUDE.md` so its `## Docs` index points to every doc with a short
   hook. Keep it small.
5. Report what was added/changed and where.
