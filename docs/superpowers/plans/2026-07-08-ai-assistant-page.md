# AI Assistant Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a concise AI Assistant demo page to DaaS with one chat, local LLM key configuration, streaming response handling, and clickable TapData result references.

**Architecture:** Keep the Vue page focused on layout and interaction. Put stream parsing, local config defaults, message creation, and result sample data in a small pure TypeScript module so behavior can be checked without mounting the full app. Wire the page through existing DaaS `Layout`, `PageContainer`, static menu, and i18n files.

**Tech Stack:** Vue 3 `<script setup>`, Element Plus, Vue Router, `@tap/business` `PageContainer`, localStorage, Fetch streaming API, Node 22 type-stripping for lightweight logic checks.

---

### Task 1: Logic Layer

**Files:**
- Create: `apps/daas/src/views/ai-assistant/logic.ts`
- Create: `apps/daas/test/ai-assistant-logic.test.ts`

- [ ] Write a failing Node-runnable test for default config, URL joining, SSE chunk parsing, demo response result metadata, and message IDs.
- [ ] Run `node --experimental-strip-types apps/daas/test/ai-assistant-logic.test.ts` and verify it fails because `logic.ts` does not exist yet.
- [ ] Implement `logic.ts` with typed config, messages, results, table preview rows, stream parser, and helper functions.
- [ ] Re-run the test and verify it passes.

### Task 2: Vue Page

**Files:**
- Create: `apps/daas/src/views/ai-assistant/Index.vue`

- [ ] Build a `PageContainer hide-header mode="blank"` page with Linear-inspired inner surface.
- [ ] Add a top bar with `New Chat` and `LLM Config`.
- [ ] Add a document-like conversation body with no AI avatar, compact object token links, a table preview block, and bottom composer.
- [ ] Add an Element Plus config dialog for Base URL, Auth Token, Model, and Chat Path.
- [ ] Add stream request handling. Use configured OpenAI-compatible endpoint when available; fall back to a local demo stream so the page works without keys.

### Task 3: Routing, Menu, And Labels

**Files:**
- Modify: `apps/daas/src/router/routes.ts`
- Modify: `apps/daas/src/router/menu.ts`
- Modify: `apps/daas/src/i18n/langs/zh-CN.js`
- Modify: `apps/daas/src/i18n/langs/zh-TW.js`
- Modify: `apps/daas/src/i18n/langs/en.js`

- [ ] Add route `/ai-assistant` named `aiAssistant` under the main layout.
- [ ] Add a visible top-level menu item with no permission code for the demo.
- [ ] Add page title and UI labels in all three DaaS locale files.

### Task 4: Verification

**Files:**
- All files above.

- [ ] Run the logic test and verify it passes.
- [ ] Run a non-network TypeScript or Vite parse check if available without reinstalling dependencies.
- [ ] Inspect changed files with `git diff --check`.
- [ ] Start or reuse a local DaaS dev server only if dependencies allow it without network prompts; otherwise report that browser verification was not run.
