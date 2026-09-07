# Repository Guidelines

## Source of Truth and Change Protocol

- This file is the shared repository instruction source for coding agents. `CLAUDE.md` delegates to it; do not duplicate or fork these rules in runtime-specific instruction files.
- Before changing any code or configuration, run `git status --short --branch` and identify unrelated user changes. Never revert, stage, commit, or overwrite unrelated work.
- Before a non-trivial change, provide a concise implementation plan covering the goal, affected files, approach, validation, and material risks. A non-trivial change includes a feature, behavior change, refactor, multi-file change, dependency/configuration change, or work with unclear requirements.
- Wait for the user's approval before editing a non-trivial change. For a clearly scoped, mechanical, single-file correction, state the intended change before editing; ask when the scope or expected behavior is uncertain.
- Keep implementation scoped to the approved plan. If evidence requires a material scope change, pause and explain the new scope before continuing.
- Do not create a commit, amend a commit, or push a branch unless the user explicitly asks for it in the current task. Planning approval is not commit or push authorization.
- Never bypass local safeguards with `git commit --no-verify`, `HUSKY=0`, disabled hooks, or equivalent flags. If a relevant check fails, report the failure and obtain direction instead of bypassing it.
- Do not commit directly to `main`, `develop`, or a release branch. Use a task branch. For Jira work, include the Jira key in the branch name, for example `feat/TAP-12226-short-description`.

## Validation and CI

- Treat local hooks as a fast feedback layer, not proof that CI passed. The repository CI currently runs on pull requests and checks formatting and i18n only.
- Before handing off a source change, run `git diff --check` and the smallest relevant non-mutating validation commands. Report the exact commands that ran and any checks intentionally not run.
- For changed Vue/JavaScript/TypeScript files, prefer `pnpm exec eslint <touched-files> --no-warn-ignored --quiet` and `pnpm exec prettier --check <touched-files>`.
- For a user-facing text change, follow the Internationalization rules below and run `node scripts/check-i18n.js <touched-files>` for changed Vue/JavaScript/TypeScript source files.
- Do not use auto-fix commands as validation evidence. Auto-fix commands may be used deliberately, but inspect the resulting diff and then run the corresponding check-only command.
- Do not run repository-wide type checks, builds, or test suites by default for localized changes. Run them when the user requests them, the approved plan requires them, or the change makes a targeted check insufficient.
- Before a user-authorized commit, stage only task-related files; inspect `git diff --cached --stat` and `git diff --cached --check`; then run the relevant check-only validation against the staged change.

## Delivery

- In the final handoff, state what changed, the validation actually run, and any remaining risks or checks not run. Do not claim that CI passed unless the corresponding CI run completed successfully.

## Internationalization

- Internationalize every new or changed user-visible string, regardless of its source language. This includes page and menu titles, labels, buttons, placeholders, tooltips, empty/loading states, dialogs, validation messages, notifications, and errors shown to users.
- Do not add user-facing literals directly in templates, TSX, or runtime code. Resolve them through `i18n.t(...)`, `t(...)`, or `$t(...)`. API data, user-entered values, identifiers, and developer-only comments/logs are not UI copy; their surrounding labels and messages still require translation.
- Reuse an existing key when its wording and context match. Otherwise create a scoped, descriptive key in the locale module that owns the UI; do not create aliases or duplicate keys only to avoid searching.
- Put application-specific strings in `apps/daas/src/i18n/langs/` or `apps/cloud/src/i18n/langs/`. Put strings used by a reusable package in that package's `packages/<package>/src/locale/lang/` directory, so both applications receive the same translation.
- A new key must be added with the identical key name to all three supported variants: `zh-CN`, `zh-TW`, and `en`. Preserve the local ordering, export style, and terminology used by neighboring keys. Do not copy Simplified Chinese into the Traditional Chinese or English file as a placeholder.
- Use named interpolation for dynamic text, for example `i18n.t('scope_message', { name })`. Keep a complete sentence in one translation key; do not concatenate translated fragments, punctuation, or word-order-dependent values in application code.
- Use the existing locale key when it is semantically correct, even if the source text differs slightly. If a term needs different wording for a new context, add a context-specific key rather than changing a broadly reused key without checking its callers.
- `scripts/check-i18n.js` detects Chinese hardcoding in Vue/JavaScript/TypeScript source, but it does not prove all UI text is internationalized and it intentionally excludes locale files, tests, comments, console output, and explicit `i18n-ignore` lines. Do not add `i18n-ignore` merely to silence a user-visible string; use it only for a genuine non-UI literal and leave a short reason beside it.
- When changing UI copy, inspect the three locale entries together and run `node scripts/check-i18n.js <touched-files>`. Include locale-file changes and the command result in the final handoff.

## Icons

- Prefer Lucide icons when adding or replacing icons. Do not use Element Plus icons when a suitable Lucide icon exists.
- Lucide icons are auto-imported; do not add manual imports for them.
- In Vue templates, use kebab-case components with the `i-lucide-` prefix, for example `<i-lucide-eye />`.
- In TSX templates, use the auto-imported `ILucide` PascalCase component name, for example `<ILucideEye />`.
- When an icon is referenced as a component variable or passed as a variable value in TS/TSX or script code, use the auto-imported `IconLucide` PascalCase name, for example `const icon = IconLucideEye` or `icon={IconLucideEye}`.
- Except inside an `el-button`/`ElButton` icon slot, wrap rendered Lucide icons with `el-icon`/`ElIcon`.
- Set icon `size`, `color`, spacing, and other presentation classes on the `el-icon`/`ElIcon` wrapper rather than on the Lucide component. For example, use `<el-icon :size="14" class="view-icon"><i-lucide-eye /></el-icon>` in Vue templates and `<ElIcon size={14} class="view-icon"><ILucideEye /></ElIcon>` in TSX.
- Inside an `el-button`/`ElButton` icon slot, the Lucide component may be used directly because the button provides the icon wrapper and sizing context.

## TypeScript

- Parts of the existing codebase intentionally lack complete TypeScript typing. Do not expand the task to retrofit types in unrelated existing code.
- Add reasonable, focused types for newly introduced TypeScript/TSX code and for existing declarations that must change to support the new code.

## Jira Task Workflow

- When taking over a Jira issue, read the issue, parent issue, description, attachments, comments, status, assignee, priority, and any user-provided API docs or screenshots before planning code changes.
- Move the Jira issue to `In Progress` when implementation starts.
- When the user authorizes pushing the task branch, use that push to associate it with Jira; do not rely on a Jira comment as the development branch association.
- For UI work, reuse existing components, styles, i18n structure, and icon rules from this file.
- If a settings page save changes runtime global settings, refresh the shared settings cache the same way app bootstrap does: refetch settings, call `setSettings(settings)`, and update `TAPDATA_SETTINGS` in localStorage. Do not overwrite the cache with only currently visible settings rows.
- For bulk operations that overwrite, delete, or clear existing task configuration, show a clear UI warning. If an empty array is a valid action, such as clearing receivers, do not disable save only because the array is empty.
- Commit messages must include the Jira key, for example `feat(TAP-12226): short summary`.
- PR descriptions should include a concise summary, validation actually run, and any remaining risks or unrelated worktree changes.
