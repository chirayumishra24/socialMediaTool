<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:context-analysis-rule -->
# Mandatory Context Analysis

Before making ANY code changes to this project, you MUST:

1. **Read `task.md`** at `C:\Users\ASUS\.gemini\antigravity\brain\167cf35e-b437-4d57-b37b-34d917359575\task.md`
2. **Understand completed work** — All `[x]` items are implemented and committed. Do NOT re-implement them.
3. **Check integration gaps** — The `⚠️ Integration Gaps` section lists components that exist but are NOT wired into `page.js`.
4. **Update task.md** — After completing any work, mark items as `[x]` and add new tasks as needed.

This ensures continuity across sessions and prevents duplicate or conflicting work.
<!-- END:context-analysis-rule -->

# Social Media Tool Skill

`.claude/skills/social-media/SKILL.md` is the operating manual for this
codebase: the multi-account rules, where each number in a prompt comes from and
whether it is measured or synthesized, the API response contract, the
publish/schedule validation rules, and which endpoints post to live Instagram
and Facebook accounts.

Read it before changing anything under `src/lib/meta/`, `src/lib/ai/`, or
`src/app/api/meta/`, and before editing any AI agent prompt.
