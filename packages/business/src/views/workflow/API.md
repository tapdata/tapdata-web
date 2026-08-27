# TAP-12613 工作流前端对接 API

本文记录 **前端实际对接** 的接口：封装位置、用途、请求/响应要点、以及被哪个页面使用。

- 后端契约原文：`tapdata_v3/.omx/plans/TAP-12613-workflow-frontend-api.zh-CN.md`
- 前端封装：`packages/api/src/core/workflows.ts`（已从 `packages/api/src/core/index.ts` 导出）
- 页面：`packages/business/src/views/workflow/`

已作废、不要再调：

- `PUT /api/workflows`（无 id）
- `GET /api/workflows/{id}/variable-schema`（正确路径无 `{id}`）

---

## 1. 公共约定

| 项 | 说明 |
| --- | --- |
| Base | 与现有 TM 相同 |
| 鉴权 | 登录后由 axios 拦截器把 `access_token` 拼到 URL，与任务/连接接口一致 |
| 成功判定 | HTTP 多为 200；必须看 `code === "ok"`。拦截器成功时已解开 `data`，业务代码拿到的是 `data` 本身 |
| 分页 | `{ total, items }` |
| 时间 | ISO-8601 字符串，例如 `2026-08-25T01:50:00.438+00:00` |
| 权限 | 复用任务 View / Start / Stop；按当前登录用户隔离 |

统一响应：

```json
{
  "reqId": "string",
  "ts": 1787622599532,
  "code": "ok",
  "message": "失败时的本地化文案",
  "data": {}
}
```

校验 vs 保存失败不要混：

| 入口 | `code` | 前端看哪里 |
| --- | --- | --- |
| `POST /api/workflows/validate` | 永远 `ok` | `data.valid`、`data.issues[]` |
| `POST/PUT /api/workflows` spec 不合法 | `Workflow.CompileError` | `data` 就是 `issues[]`（没有 `valid` 包一层） |

---

## 2. 接口总表

### 2.1 工作流定义 `/api/workflows`

| 方法 | 路径 | 前端函数 | 作用 | 使用页面 |
| --- | --- | --- | --- | --- |
| GET | `/api/workflows` | `fetchWorkflows` | 定义列表（默认不含软删） | 列表 |
| POST | `/api/workflows` | `createWorkflow` | 创建定义，初始 `enabled=false`、`currentVersion=1` | 编辑器保存 |
| GET | `/api/workflows/{id}` | `getWorkflow` | 详情（含 spec / compiledPlan） | 编辑器、手动运行前补 spec |
| PUT | `/api/workflows/{id}` | `updateWorkflow` | 更新定义（须未启用、无活动运行） | 编辑器保存 |
| DELETE | `/api/workflows/{id}` | `deleteWorkflow` | 软删 | 列表 |
| POST | `/api/workflows/validate` | `validateWorkflowSpec` | 不落库校验，Body = **Spec 本身** | 编辑器校验/保存前 |
| GET | `/api/workflows/variable-schema` | `getWorkflowVariableSchema` | 条件变量目录 | 编辑器进入时 |
| GET | `/api/workflows/capabilities` | `getWorkflowCapabilities` | 任务能力位（能否当触发器/启停/等待 CDC 等） | 编辑器选任务后 |
| POST | `/api/workflows/{id}/enable` | `enableWorkflow` | 启用并写触发基线 | 列表、编辑器 |
| POST | `/api/workflows/{id}/disable` | `disableWorkflow` | 禁用后才允许再编辑 | 列表、编辑器 |
| POST | `/api/workflows/{id}/run` | `runWorkflow` | 手动运行（须已启用），`triggerType=MANUAL` | 列表、编辑器 |
| POST | `/api/workflows/{id}/test` | `testWorkflow` | 试跑（可不启用），会真实执行 | 列表、编辑器 |
| GET | `/api/workflows/{id}/versions` | `getWorkflowVersions` | 版本历史（软删后仍可查） | 编辑器「版本」抽屉 |
| POST | `/api/workflows/{id}/validate` | `validateWorkflowById` | 校验已落库当前版本 | **已封装，页面未调** |

### 2.2 运行 `/api/workflow-runs`

| 方法 | 路径 | 前端函数 | 作用 | 使用页面 |
| --- | --- | --- | --- | --- |
| GET | `/api/workflow-runs` | `fetchWorkflowRuns` | 运行列表（可按定义/触发/状态/时间筛） | 运行列表、某工作流的运行 |
| GET | `/api/workflow-runs/{runId}` | `getWorkflowRun` | 详情：步骤时间线、等待进度、被抑制触发 | 运行详情（活动中 1.5s 轮询） |
| POST | `/api/workflow-runs/{runId}/stop` | `stopWorkflowRun` | 请求停止，不回滚已完成动作 | 运行详情 |
| POST | `/api/workflow-runs/{runId}/resume` | `resumeWorkflowRun` | 从失败步骤继续（同一 runId） | 运行详情 |
| POST | `/api/workflow-runs/{runId}/rerun` | `rerunWorkflowRun` | 按当前定义从头新开一条运行 | 运行详情 |

### 2.3 触发记录 `/api/workflow-trigger-records`

| 方法 | 路径 | 前端函数 | 作用 | 使用页面 |
| --- | --- | --- | --- | --- |
| GET | `/api/workflow-trigger-records` | `fetchWorkflowTriggerRecords` | 触发/抑制/错过历史 | **已封装，页面未调**；详情里的抑制记录来自运行详情的 `suppressedTriggers` |

### 2.4 现有 TM 资源（spec 只存 id，不新建配置）

| 方法 | 路径 | 前端函数 | 作用 | 使用页面 |
| --- | --- | --- | --- | --- |
| GET | `/api/Task` | `fetchTasks` | 任务选择器（复制 `migrate` + 开发 `sync`） | `ResourceSelect` |
| GET | `/api/Inspects` | `fetchInspects` | 校验任务选择器 | `ResourceSelect`（`INSPECT_DIFF_BREACHED`） |
| GET | `/api/webhook/list` | `getWebhookList` | 历史系统 Webhook 列表。新步骤请在表单填 `webhookUrl` | 兼容旧 `webhookId` |
| GET | `/api/Connections` | `fetchConnections` | 连接选择器（JS 步骤可用连接） | `ResourceSelect`（`JAVASCRIPT`） |

Webhook 步骤在工作流内直接填 `webhookUrl`、`webhookBody`（JSON 模板）和可选 `webhookToken`。旧步骤仅有 `webhookId` 时仍可运行。

---

## 3. 定义接口详情

### 3.1 `GET /api/workflows` — 列表

**作用：** 工作流管理页表格数据。列表文档不含 `spec` / `compiledPlan`，画布必须再调详情。

**Query：** `filter` = JSON 字符串（`where` / `sort` / `skip` / `limit`）。服务端默认补 `deleted=false`。

前端实际请求（`List.vue`）：

```json
{
  "where": {
    "name": { "like": "...", "options": "i" },
    "enabled": true,
    "triggerSummary": "SCHEDULE_DAILY",
    "lastRunStatus": "FAILED"
  },
  "limit": 20,
  "skip": 0,
  "sort": ["last_updated DESC"]
}
```

以上 `where` 字段均为可选。

**响应 `data`：** `{ total, items: WorkflowDefinitionDto[] }`

列表项带来的运行摘要（不必先拉 runs）：

| 字段 | 作用 |
| --- | --- |
| `enabled` / `triggerSummary` / `nextFireAt` | 启用态、触发类型、下次定时 |
| `hasActiveRun` / `activeRunId` | 是否占用唯一活动实例；「查看运行中」跳 `activeRunId` |
| `lastRunId` / `lastRunStatus` / `lastRunTriggerType` | 最近一次运行 |
| `lastRunStartedAt` / `lastRunEndedAt` / `lastRunDurationMs` | 时间与耗时 |
| `lastRunErrorCode` | 最近失败码，成功为 `null` |
| `currentVersion` / `currentDefinitionHash` | 保存时乐观锁 |

列表约 8s 被动轮询一次（`withPassive`，不顺延会话）。

---

### 3.2 `POST /api/workflows` — 创建

**作用：** 新建工作流。成功后 `enabled=false`，`currentVersion=1`。

**Body：**

```json
{
  "name": "MDM_触发",
  "description": "可选",
  "spec": { }
}
```

| 字段 | 必填 | 作用 |
| --- | --- | --- |
| `name` | 是 | 当前用户下唯一；重复 → `Workflow.NameDuplicate` |
| `description` | 否 | 描述 |
| `spec` | 是 | 触发器 + 步骤。`spec.name` 与外层 `name` 对齐 |

**成功：** 完整 `WorkflowDefinitionDto`（含 `spec` + `compiledPlan`）。编辑器会 `replace` 到 `workflowEdit`。

**失败：** spec 不合法时 `code=Workflow.CompileError`，`data` 为 `issues[]`。保存前会先调 validate。

---

### 3.3 `GET /api/workflows/{id}` — 详情

**作用：** 打开编辑器；列表行没有 spec 时，手动运行/试跑前补全触发器，以便弹出 `contextTaskId`。

**成功：** `spec` + `compiledPlan` + 版本元数据 + 运行摘要。  
**软删或不存在：** `code=Workflow.NotFound`（HTTP 仍常为 200）。

---

### 3.4 `PUT /api/workflows/{id}` — 更新

**作用：** 覆盖当前定义并生成新版本。仅未启用、无活动运行时可调。

**Body：** 与创建相同，并带乐观锁：

| 字段 | 作用 |
| --- | --- |
| `expectedVersion` | 等于详情 `currentVersion`，不匹配 → `Workflow.VersionConflict` |
| `expectedDefinitionHash` | 等于 `currentDefinitionHash`，不匹配 → `Workflow.VersionConflict` |

前端每次保存都会带上这两项。成功后 `currentVersion + 1`。

启用中 → `Workflow.EnabledCannotEdit`（先 disable）。  
有活动运行 → `Workflow.HasActiveRun`。

---

### 3.5 `DELETE /api/workflows/{id}` — 软删

**作用：** 列表删除。成功 `data` 为空。之后详情 `NotFound`，列表不可见。运行 / 版本 / 触发记录仍在。

须已禁用且无活动实例，否则 `HasActiveRun`。

---

### 3.6 `POST /api/workflows/validate` — 不落库校验

**作用：** 「校验」按钮，以及保存前的预检。把问题标到步骤 `stepId` / `fieldPath`。

**Body 直接是 `WorkflowSpec`**，不要包 `{ spec: ... }`。

始终 `code=ok`：

```json
{
  "valid": false,
  "issues": [
    {
      "stepId": "sxxxx",
      "fieldPath": "taskIds",
      "errorCode": "Workflow.InspectStartStopForbidden",
      "localizedArgs": ["6a8d..."]
    }
  ],
  "compiledPlan": null,
  "definitionHash": null
}
```

| issues 字段 | 前端用法 |
| --- | --- |
| `stepId` | 高亮对应步骤；触发器级错误可能为 `null` |
| `fieldPath` | 高亮字段，如 `taskIds`、`trigger.intervalMs` |
| `errorCode` | 错误码 |
| `localizedArgs` | 占位参数，如任务 id |

`valid=true` 时带 `compiledPlan`、`definitionHash`。

---

### 3.7 `GET /api/workflows/variable-schema` — 条件变量目录

**作用：** 条件 / If-Else 的变量下拉。无 path id。当前目录项 `availableAtCompileTime` 均为 `false`（运行时变量）。

| path | type | 作用 |
| --- | --- | --- |
| `run.id` | string | 当前运行 id |
| `run.triggerType` | string | 本运行触发类型 |
| `run.startedAt` | number | 开始时间 epoch ms |
| `trigger.taskId` | string | 事件/指标源任务 |
| `trigger.observedValue` | number | 观测值 |
| `steps.<stepId>.status` | string | 某步状态 |
| `steps.<stepId>.output` | object | JS / Webhook 输出 |
| `steps.<stepId>.errorCode` | string | 某步错误码 |

条件 `variable` 填这些 path。变量不存在或类型不对会硬失败，不会当 false。

---

### 3.8 `GET /api/workflows/capabilities?taskIds=` — 任务能力

**作用：** 选任务后刷新。决定哪些任务能进触发器、WAIT、TASK_START/STOP，以及 CDC/快照等待是否可选。不要在前端写死 Inspect/心跳规则。

前端把 spec 里收集到的任务 id 用逗号拼到 `taskIds`。空列表不请求，能力表清空。

```json
{
  "taskId": "6a8cff0ac28007692104b50b",
  "syncType": "migrate",
  "inspect": false,
  "heartbeat": false,
  "triggerSupported": true,
  "conditionSupported": true,
  "waitSupported": true,
  "startStopSupported": true,
  "cdcMilestoneSupported": true,
  "snapshotMilestoneSupported": true,
  "delayMetricSupported": true
}
```

| 能力位 | 为 false 时 UI |
| --- | --- |
| `startStopSupported` | 禁用放入 `TASK_START` / `TASK_STOP`（Inspect、心跳一定 false） |
| `cdcMilestoneSupported` | 禁用对该任务使用 `WAIT` + `CDC_ENTERED` |
| `snapshotMilestoneSupported` | 禁用 `WAIT` + `SNAPSHOT_DONE` |
| `delayMetricSupported` | 禁止作为 `INCREMENT_DELAY_BREACHED` 源 |
| `triggerSupported` | 禁止放进事件类触发器 `taskIds` |
| `inspect` | 用 `INSPECT_DIFF_BREACHED` 的 `inspectIds`，不要当普通任务启停 |

---

### 3.9 `POST /api/workflows/{id}/enable` — 启用

**作用：** 编译 + 解析引用 + 写触发基线。启用瞬间已超限/已 ERROR **不会**立刻开火。

成功返回更新后的定义：`enabled=true`，写入 `enabledBy` / `enabledAt` / `runAsUserId`。定时类会填 `nextFireAt`。

已软删 → `DeletedCannotEnable`。引用任务不存在 → `TaskNotFound`。

---

### 3.10 `POST /api/workflows/{id}/disable` — 禁用

**作用：** `enabled=false`，之后才允许 PUT 编辑。会保留 `enabledBy` / `enabledAt` / `runAsUserId`。

---

### 3.11 `POST /api/workflows/{id}/run` 与 `/test` — 手动运行 / 试跑

**作用：**

| | `/run` | `/test` |
| --- | --- | --- |
| 定义须启用 | 是 | 否 |
| `triggerType` | `MANUAL` | `MANUAL_TEST` |
| 是否真实执行 | 是 | 是（不是 dry-run） |

**Body 可选：** `{ "contextTaskId": "..." }`

事件/指标型触发器（任务启停、ERROR、快照完成、进入增量、增量延迟、校验不一致）手动跑、试跑都必须带 `contextTaskId`，且属于 `trigger.taskIds` 或 `trigger.inspectIds`。前端会先弹 `ContextTaskDialog`。选了两个及以上源时，编辑器会显示 `trigger.join`：`ANY`（默认，任一达到）/ `ALL`（全部达到后再触发一次）。

成功（准入接受）：

```json
{
  "decision": "ACCEPTED",
  "runId": "6a8cf4c8c28007692104a9ce",
  "triggerRecordId": "6a8cf4c8c28007692104a9cd",
  "activeRunId": null,
  "reason": null
}
```

已有活动实例（**不是 HTTP 错误**）：

```json
{
  "decision": "SUPPRESSED",
  "runId": null,
  "activeRunId": "6a8cf4c8c28007692104a9ce",
  "triggerRecordId": "...",
  "reason": "active run already exists"
}
```

前端：`ACCEPTED` 跳新 `runId`；`SUPPRESSED` 提示「已有运行中的实例」并跳 `activeRunId`。

不传 `contextTaskId` → `Workflow.ContextTaskRequired`。  
id 不在清单 → `Workflow.ContextTaskNotInList`。  
未启用调 `/run` → `Workflow.NotEnabled`。

`decision`：`ACCEPTED` | `SUPPRESSED` | `MISSED` | `IGNORED_WORKFLOW_ORIGIN`。手动 API 常见前两个。

---

### 3.12 `GET /api/workflows/{id}/versions` — 版本列表

**作用：** 编辑器「版本」抽屉。按 version 降序。软删后仍可查。运行实例钉死在创建时的版本，后续编辑不影响正在跑的实例。

```json
{
  "id": "...",
  "workflowId": "...",
  "version": 2,
  "definitionHash": "sha256...",
  "createTime": "2026-08-25T05:00:00.000+00:00",
  "spec": {},
  "compiledPlan": {}
}
```

---

## 4. 运行接口详情

### 4.1 `GET /api/workflow-runs` — 运行列表

**作用：** 全部运行，或某个工作流的运行（路由 `/workflow/:id/runs` 时带 `workflowId`）。

| Query | 默认 | 作用 |
| --- | --- | --- |
| `workflowId` | 无 | 按定义筛；已软删定义也可以 |
| `triggerType` | 无 | 触发类型，含 `MANUAL_TEST` |
| `status` | 无 | 运行状态 |
| `from` / `to` | 无 | `startedAt` 上下限，epoch **毫秒** |
| `skip` | 0 | 分页 |
| `limit` | 20 | 最大 100 |

列表项一般 **不含** `steps` / `suppressedTriggers`。点进详情再拉。

---

### 4.2 `GET /api/workflow-runs/{runId}` — 运行详情

**作用：** 运行页主数据。活动状态（`CREATED` / `RUNNING` / `WAITING` / `RETRY_WAIT`）每 1.5s 轮询。

比列表多：`steps[]`（时间线，同一步可多次 attempt）、`suppressedTriggers[]`（运行中被挡住的触发）、`waitProgress`（仅等待/重试中有值）。

运行 `status`：

| status | 含义 | UI |
| --- | --- | --- |
| `CREATED` | 刚准入 | 运行中 |
| `RUNNING` | 正在执行 | 可停止 |
| `WAITING` | 等待任务就绪 | 展示 `waitDeadline` / `waitProgress` |
| `RETRY_WAIT` | 失败后等重试间隔 | 运行中 |
| `SUCCEEDED` | 全部成功 | 成功 |
| `COMPLETED_WITH_WARNINGS` | 有步骤 SKIP 后仍走完 | 成功但警告 |
| `CONDITION_NOT_MET` | 线性 CONDITION 不满足 | 未继续（不是失败） |
| `FAILED` | 失败停住 | 可 resume / rerun |
| `STOPPED` | 用户停止 | 不补偿 |

`active=true` 表示占用「同一 Workflow 最多一个活动实例」。

`waitProgress` 示例：

```json
{
  "join": "ALL",
  "predicate": "CDC_ENTERED",
  "unmetTasks": [
    {
      "taskId": "...",
      "status": "running",
      "snapshotMilestone": "FINISH",
      "cdcMilestone": null,
      "reason": "cdc=null,status=running"
    }
  ]
}
```

终态时 `waitProgress` 为 `null`。  
`errorCode=Workflow.UnknownExternalResult` 时只提供 resume 或 rerun，禁止当成可自动重放。

---

### 4.3 `POST /api/workflow-runs/{runId}/stop` — 停止

**作用：** 只阻止后续步骤，已完成的启停/Webhook/告警/JS **不回滚**。终态再停 → `Workflow.StopNotAllowed`。

成功后状态可能仍短暂 `RUNNING`，直到扫描器把 `stopRequestedAt` 落成 `STOPPED`，需继续轮询详情。

---

### 4.4 `POST /api/workflow-runs/{runId}/resume` — 从失败继续

**作用：** 仅 `FAILED`，且当前定义哈希与该运行 `definitionHash` 一致。从失败步骤追加，已成功步骤不重做。

定义已改 → `Workflow.DefinitionHashMismatch`（改用 rerun）。  
非 FAILED → `ResumeNotAllowed`。

---

### 4.5 `POST /api/workflow-runs/{runId}/rerun` — 从头重跑

**作用：** 按**当前定义**新开一条 `MANUAL` 运行。响应同 `TriggerDecision`。原运行保留，`rerunOfRunId` 指向源。若 `SUPPRESSED` 则跳已有 `activeRunId`。

---

## 5. 现有 TM 资源接口（选择器）

封装在 `ResourceSelect.vue`。Workflow spec **只存 id**。

### 5.1 `GET /api/Task` — 任务列表

**作用：** 触发器任务、WAIT / TASK_START / TASK_STOP 的任务下拉。

须按任务列表同样的方式查：`syncType` 用字符串 `'migrate'`、`'sync'` 各请求一次再合并。不要传空 `where`（会走 TaskFilter 的 `$nin` 路径，和数据复制/数据开发列表不一致，下拉容易空）。也不要用 `syncType: { $in: [...] }`（服务端会按 String 强转）。

| 场景 | filter |
| --- | --- |
| 打开下拉 | `{ where: { syncType }, limit: 200, order: "last_updated DESC" }`，`syncType` 分别为 `migrate`、`sync` |
| 按名搜索 | 额外 `where.name = { like, options: "i" }` |
| 回显已选项 | `{ where: { id: { in: ids } }, limit: ids.length, order: "last_updated DESC" }` |

响应：`{ total, items }`，使用 `id` / `name` / `status`。

---

### 5.2 `GET /api/Inspects` — 校验任务列表

**作用：** 触发器 `INSPECT_DIFF_BREACHED` 的 `inspectIds`。

```json
{
  "where": { "name": { "like": "...", "options": "i" } },
  "limit": 200,
  "order": "last_updated DESC"
}
```

---

### 5.3 `GET /api/webhook/list` — Webhook 配置列表

**作用：** 仅兼容旧步骤的 `webhookId`。新 `WEBHOOK` 步骤在表单填写 `webhookUrl` + JSON `webhookBody`。

Query：`filter` JSON，例如 `{ "order": "createTime DESC", "limit": 100 }`。  
选项展示 `mark` 或 `url`；`open === false` 标为 closed。

---

### 5.4 `GET /api/Connections` — 连接列表

**作用：** `JAVASCRIPT` 步骤可选的 `connectionIds`（脚本里用到的连接）。

带 `noSchema: 1`，避免把 schema 大字段拉回来。

```json
{
  "where": {},
  "limit": 200,
  "order": "last_updated DESC",
  "noSchema": 1
}
```

---

## 6. 页面调用顺序

### 6.1 列表 `/workflow`

```
GET  /api/workflows?filter=...          表格
POST /api/workflows/{id}/enable|disable 启用/禁用
POST /api/workflows/{id}/run|test       运行/试跑（事件型先 GET 详情拿 taskIds）
DELETE /api/workflows/{id}              删除
```

### 6.2 编辑器 `/workflow/create`、`/workflow/:id/edit`

```
进入
  GET  /api/workflows/variable-schema
  GET  /api/workflows/{id}                         编辑已有
  GET  /api/Task | Inspects | webhook/list | Connections   选择器
  GET  /api/workflows/capabilities?taskIds=a,b     选任务后 debounce 刷新

校验 / 保存前
  POST /api/workflows/validate                     Body = spec

新建 / 更新
  POST /api/workflows
  PUT  /api/workflows/{id}                         带 expectedVersion / expectedDefinitionHash

启用 / 禁用 / 试跑 / 版本
  POST /api/workflows/{id}/enable|disable|run|test
  GET  /api/workflows/{id}/versions
```

### 6.3 运行列表 `/workflow/runs`、`/workflow/:id/runs`

```
GET /api/workflow-runs?workflowId=&triggerType=&status=&from=&to=&skip=&limit=
```

### 6.4 运行详情 `/workflow/run/:runId`

```
GET  /api/workflow-runs/{runId}                    进入 + 活动中 1.5s 轮询
POST /api/workflow-runs/{runId}/stop
POST /api/workflow-runs/{runId}/resume
POST /api/workflow-runs/{runId}/rerun
```

---

## 7. 前端会处理的错误码

拦截器会 toast `message`。编辑器额外识别：

| code | 含义 | 前端动作 |
| --- | --- | --- |
| `Workflow.CompileError` | 保存编译失败 | `data` 当 `issues[]` 标红 |
| `Workflow.NameDuplicate` | 名称重复 | toast |
| `Workflow.EnabledCannotEdit` | 已启用不可编辑 | 先禁用 |
| `Workflow.HasActiveRun` | 有活动运行 | 跳活动运行 / 先停止 |
| `Workflow.NotEnabled` | 未启用不能 `/run` | 改用试跑或先启用 |
| `Workflow.VersionConflict` | 乐观锁失败 | 重新拉详情再保存 |
| `Workflow.ContextTaskRequired` / `ContextTaskNotInList` | 事件型缺上下文任务 | 弹出选择框 |
| `Workflow.StopNotAllowed` | 终态不能停 | 按钮按 `active` 控制 |
| `Workflow.ResumeNotAllowed` / `DefinitionHashMismatch` | 不能从失败继续 | 改用 rerun |
| `Workflow.UnknownExternalResult` | 未知外部结果 | 只提供 resume / rerun |

`getWorkflowErrorPayload(error)` 从 axios 错误体取 `code` / `message` / `data`。

---

## 8. Spec 里存什么（和接口的关系）

完整字段见后端契约第 7 节。前端保存体：

```json
{
  "name": "...",
  "description": "...",
  "spec": {
    "name": "...",
    "description": "...",
    "trigger": { "type": "MANUAL" },
    "steps": []
  }
}
```

| 资源 | spec 字段 | 来源接口 |
| --- | --- | --- |
| 同步/复制任务 | `trigger.taskIds`、`steps[].taskIds` | `GET /api/Task` |
| 校验任务 | `trigger.inspectIds` | `GET /api/Inspects` |
| Webhook | `steps[].webhookUrl` / `webhookBody` / `webhookToken`；旧 `webhookId` 仍可用 | 步骤内配置 |
| 连接 | `steps[].connectionIds` | `GET /api/Connections` |

不要在 spec 里填 `MANUAL_TEST`（那是试跑接口写的 triggerType）。If/Else 只允许一层。
