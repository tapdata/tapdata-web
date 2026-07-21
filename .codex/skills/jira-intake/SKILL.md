---
name: jira-intake
description: Use when the user asks to read, start, inspect, or summarize a Jira issue/card such as TAP-12345, including parent, status, assignee, priority, description, comments, attachments, transitions, or moving an issue to In Progress through the Atlassian MCP.
---

# Jira Intake

Use this skill to interact with Jira through the Atlassian MCP in a stable, repeatable way.

## Tool Discovery

1. If Atlassian MCP tools are not already visible, call `tool_search` with a query such as `Atlassian Jira get issue transition issue`.
2. Prefer direct Jira issue tools, especially `mcp__atlassian.getJiraIssue`, `mcp__atlassian.getTransitionsForJiraIssue`, and `mcp__atlassian.transitionJiraIssue`.
3. Do not start with Atlassian search or resource discovery for known issue keys. In this environment those paths can fail with a 403 error such as `The app is not installed on this instance`, even when direct Jira issue lookup works.

## Known Tapdata Defaults

- Jira site/cloud id: `https://tapdata.atlassian.net`
- Issue key format: `TAP-12345`
- Direct lookup is the reliable first move when the user gives an issue key.

## Read A Card

For a request like "查看 TAP-12273" or "开始 TAP-12185":

1. Extract the Jira key from the user message.
2. Call `mcp__atlassian.getJiraIssue` directly:
   - `cloudId`: `https://tapdata.atlassian.net`
   - `issueIdOrKey`: the issue key
   - `fields`: include `summary`, `description`, `status`, `issuetype`, `priority`, `labels`, `components`, `assignee`, `reporter`, `created`, `updated`, `resolution`, `project`, `parent`, `attachment`, `comment`, and `issuelinks`
   - `expand`: include `names` when supported
   - `responseContentFormat`: `markdown`
3. If the issue has a parent, call `getJiraIssue` for the parent key too, with at least summary, status, assignee, priority, and description.
4. Report a concise summary in Chinese by default:
   - title and link
   - status, assignee, priority, issue type
   - parent issue if present
   - key requirements from the description
   - important comments
   - attachment names and whether they need follow-up reading
   - any ambiguity or implementation risk

## Start Implementation

When taking over a Jira issue for code work:

1. Read the issue details first, including description, parent, attachments, comments, status, assignee, and priority.
2. Get available transitions with `mcp__atlassian.getTransitionsForJiraIssue`.
3. If a transition to `In Progress` is available and the user asked to start work, call `mcp__atlassian.transitionJiraIssue`.
4. Before editing code, follow the repository's local instructions. In Tapdata frontend repos this usually means:
   - run `git status --short --branch`
   - create a branch containing the Jira key, such as `feat/TAP-12273-short-description`
   - keep changes scoped to the card
   - push the branch to associate it with Jira

Repository-specific `AGENTS.md` instructions override this section when they are more specific.

## Error Handling

- If `mcp__atlassian.search` fails with 403 or says the app is not installed, do not treat that as proof Jira access is unavailable. Fall back to direct `getJiraIssue` by key.
- If `getAccessibleAtlassianResources` or `authv2` transport fails, explain that the current session's Atlassian MCP connection is unhealthy or unavailable. A skill cannot grant missing tools or repair a broken MCP auth transport.
- If direct `getJiraIssue` fails with permission denied, ask the user to confirm the Jira site/account access or open a session where Atlassian MCP is connected.
- If attachments cannot be downloaded through the tool, summarize the attachment metadata and ask the user to provide the file only when the attachment content is necessary.

## Good Prompts

- `用 jira-intake 查看 TAP-12273`
- `开始 TAP-12185，先读卡片和父卡，然后按流程建分支`
- `读取 TAP-12345 的描述、评论和附件，告诉我实现点`
