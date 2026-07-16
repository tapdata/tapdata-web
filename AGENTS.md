# Repository Guidelines

## Icons

- Prefer Lucide icons when adding or replacing icons. Do not use Element Plus icons when a suitable Lucide icon exists.
- Lucide icons are auto-imported; do not add manual imports for them.
- In Vue templates, use kebab-case components with the `i-lucide-` prefix, for example `<i-lucide-eye />`.
- In TSX templates, use the auto-imported `ILucide` PascalCase component name, for example `<ILucideEye />`.
- When an icon is referenced as a component variable or passed as a variable value in TS/TSX or script code, use the auto-imported `IconLucide` PascalCase name, for example `const icon = IconLucideEye` or `icon={IconLucideEye}`.
- Except inside an `el-button`/`ElButton` icon slot, wrap rendered Lucide icons with `el-icon`/`ElIcon`.
- Set icon `size`, `color`, spacing, and other presentation classes on the `el-icon`/`ElIcon` wrapper rather than on the Lucide component. For example, use `<el-icon :size="14" class="view-icon"><i-lucide-eye /></el-icon>` in Vue templates and `<ElIcon size={14} class="view-icon"><ILucideEye /></ElIcon>` in TSX.
- Inside an `el-button`/`ElButton` icon slot, the Lucide component may be used directly because the button provides the icon wrapper and sizing context.

## TypeScript and Validation

- Parts of the existing codebase intentionally lack complete TypeScript typing. Do not expand the task to retrofit types in unrelated existing code.
- Add reasonable, focused types for newly introduced TypeScript/TSX code and for existing declarations that must change to support the new code.
- Do not run repository-wide type checks or builds by default for localized changes. These checks may fail because of unrelated legacy issues and are not required unless the user explicitly requests them.
- Prefer targeted inspection or lightweight checks when validation is useful, without treating unrelated existing type errors as part of the task.

## Jira Task Workflow

- When taking over a Jira issue, read the issue, parent issue, description, attachments, comments, status, assignee, priority, and any user-provided API docs or screenshots before planning code changes.
- Move the Jira issue to `In Progress` when implementation starts.
- Create feature branches with the Jira key in the branch name, for example `feat/TAP-12226-short-description`.
- To associate the branch with Jira, push the branch to the connected remote repository. Do not rely on a Jira comment as the development branch association.
- Before editing, run `git status --short --branch` and identify unrelated user changes. Do not revert, stage, commit, or overwrite unrelated user changes.
- Keep implementation scoped to the issue. For UI work, reuse existing components, styles, i18n structure, and icon rules from this file.
- If a settings page save changes runtime global settings, refresh the shared settings cache the same way app bootstrap does: refetch settings, call `setSettings(settings)`, and update `TAPDATA_SETTINGS` in localStorage. Do not overwrite the cache with only currently visible settings rows.
- For bulk operations that overwrite, delete, or clear existing task configuration, show a clear UI warning. If an empty array is a valid action, such as clearing receivers, do not disable save only because the array is empty.
- Validate localized frontend changes with targeted checks such as `git diff --check` and `pnpm exec eslint <touched-files>`. Do not run full repository checks unless requested.
- Before committing, stage only files related to the Jira issue, then inspect `git diff --cached --stat` and `git diff --cached --check`.
- Commit messages must include the Jira key, for example `feat(TAP-12226): short summary`.
- PR descriptions should include a concise summary, validation actually run, and any remaining risks or unrelated worktree changes.
