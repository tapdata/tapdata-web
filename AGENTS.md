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
