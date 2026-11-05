# 任务仪表盘 API

## 状态

- 接口地址：`GET /api/task/dashboard`
- 控制器映射：[TaskController.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/java/com/tapdata/tm/task/controller/TaskController.java#L1102)
- 服务组装：[TaskDashboardService.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/java/com/tapdata/tm/task/service/dashboard/TaskDashboardService.java)
- 响应 DTO：[TaskDashboardVo.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm-api/src/main/java/com/tapdata/tm/task/vo/TaskDashboardVo.java)

## 实际请求结果

```bash
curl "http://localhost:5173/api/task/dashboard?access_token=<ACCESS_TOKEN>"
```

响应示例：

```json
{
    "reqId": "e6af6b69-7739-45a7-8b40-536037a5d4ce",
    "ts": 1775644914982,
    "code": "ok",
    "data": {
        "query": {
            "type": "minute",
            "step": 5,
            "dashboardType": "all",
            "top": 5,
            "startAt": 1775644614,
            "endAt": 1775644914
        },
        "summary": {
            "activeTasks": {
                "total": 33,
                "running": 6,
                "error": 0,
                "maxLag": 3648,
                "minLag": 1939
            },
            "totalThroughput": {
                "current": 3044.2182436487296,
                "peak": 3204.425445089018,
                "dataRate": 2873831.6276055207,
                "changeRate": 0.0
            },
            "connectedDbs": {
                "total": 261,
                "items": [
                    {
                        "id": "6719c1b948930c6f211e8232",
                        "name": "ttt_184",
                        "tableCount": 5000
                    },
                    {
                        "id": "67ada55bd938d0648b2b0844",
                        "name": "sybase_190 - COM_DB",
                        "tableCount": 492
                    },
                    {
                        "id": "667e738da9a7f83f49923fde",
                        "name": "qa_oracle_11g_single_1718086209358_4120",
                        "tableCount": 477
                    }
                ]
            },
            "apiRequests": {
                "total": 0,
                "failed": 0,
                "errorRate": 0.0,
                "avgTime": 0.0
            }
        },
        "trends": {
            "throughput": {
                "ts": [1775644610, 1775644615, "...(每5秒一个数据点，共61个)...", 1775644910],
                "values": [0.0, 3069.82, "...(与ts对齐的吞吐量值)...", 3044.22]
            },
            "apiRequests": {
                "ts": [],
                "values": []
            }
        },
        "tops": {
            "topLaggingTasks": [
                {
                    "taskId": "69d5fed7c8747bdd01439e93",
                    "taskName": "任务 21 - Copy - Copy",
                    "latency": 3648,
                    "throughput": 1.2
                },
                {
                    "taskId": "69d5fdf1c8747bdd014396e2",
                    "taskName": "任务 21",
                    "latency": 2725,
                    "throughput": 1.0002000400080016
                },
                {
                    "taskId": "69d5fe60c8747bdd01439aa6",
                    "taskName": "任务 21 - Copy",
                    "latency": 2297,
                    "throughput": 1.0
                },
                {
                    "taskId": "69d60c7567d5e06cc9e263f3",
                    "taskName": "任务 21 - dummy - Copy - Copy",
                    "latency": 1953,
                    "throughput": 1140.2280456091219
                },
                {
                    "taskId": "69d60a3867d5e06cc9e2527d",
                    "taskName": "任务 21 - dummy - Copy",
                    "latency": 1944,
                    "throughput": 950.8
                }
            ],
            "topThroughputTasks": [
                {
                    "taskId": "69d60c7567d5e06cc9e263f3",
                    "taskName": "任务 21 - dummy - Copy - Copy",
                    "latency": 1953,
                    "throughput": 1140.2280456091219
                },
                {
                    "taskId": "69d60a3867d5e06cc9e2527d",
                    "taskName": "任务 21 - dummy - Copy",
                    "latency": 1944,
                    "throughput": 950.8
                },
                {
                    "taskId": "69d5ff83369dd7d1c8d45d6f",
                    "taskName": "任务 21 - dummy",
                    "latency": 1939,
                    "throughput": 949.9899979996
                },
                {
                    "taskId": "69d5fed7c8747bdd01439e93",
                    "taskName": "任务 21 - Copy - Copy",
                    "latency": 3648,
                    "throughput": 1.2
                },
                {
                    "taskId": "69d5fdf1c8747bdd014396e2",
                    "taskName": "任务 21",
                    "latency": 2725,
                    "throughput": 1.0002000400080016
                }
            ]
        }
    }
}
```

> **说明**：`trends.throughput` 中的 `ts` 和 `values` 数组实际包含 61 个数据点（每 5 秒一个），此处为简洁起见进行了省略。

## 请求

### 请求方法

`GET`

### 请求路径

`/api/task/dashboard`

### 查询参数

| 参数名 | 类型 | 是否必填 | 允许值 | 默认值 | 描述 |
| --- | --- | --- | --- | --- | --- |
| `access_token` | `string` | 在 token-query 模式下必填 | 任意有效的用户访问令牌 | 无 | 通过查询字符串传递的认证令牌。 |
| `type` | `string` | 否 | `minute`、`hours`、`days`、`range` | `minute` | 时间窗口类型；`range` 仅用于趋势 v2。 |
| `step` | `number` | 否 | `minute` 对应 `5`，`hours` 对应 `1`，`days` 对应 `1` | `5` | 旧时间窗口步长；`range` 不使用此参数。 |
| `dashboardType` | `string` | 否 | `all`、`summary`、`activeTasks`、`totalThroughput`、`connectedDbs`、`apiRequests`、`trends`、`tops` | `all` | 控制填充哪个仪表盘板块。 |
| `top` | `number` | 否 | `5`、`10`、`20` | `5` | `tops` 排行榜大小。无效值将回退为 `5`。 |
| `physicalNodeId` | `string` | 否 | 当前用户有权访问的安装 UUID | 无 | 只用于趋势 v2；省略时查询全部节点。 |
| `startAt` | `number` | 否 | 正整数 Unix 秒时间戳 | 无 | 趋势 v2 起始时间，须与 `endAt` 同时提供。 |
| `endAt` | `number` | 否 | 正整数 Unix 秒时间戳 | 无 | 趋势 v2 结束时间，不能晚于当前时间。 |
| `trendSchemaVersion` | `number` | 否 | `2` | 无 | 仅用于 `dashboardType=trends`，启用 nullable 趋势序列与状态字段。 |

### 有效时间窗口

| 请求参数 | 实际范围 |
| --- | --- |
| `type=minute&step=5` | 最近 5 分钟 |
| `type=hours&step=1` | 最近 1 小时 |
| `type=days&step=1` | 最近 24 小时 |
| `type=range&startAt=...&endAt=...&trendSchemaVersion=2` | 指定的半开区间 `[startAt,endAt)`，最长 604800 秒 |
| 旧参数的任何无效组合 | 最近 5 分钟 |

趋势 v2 的新参数仅用于 `dashboardType=trends`，不改变 `summary`、`tops` 或 API KPI 的请求合同。`startAt` 和 `endAt` 必须同时提供，起点早于终点，终点不晚于当前时间，范围不能超过 7 天。允许查询早于最近 7 天的历史窗口；若数据已超过实际保存期，则返回无数据状态。

### 请求示例

```bash
curl "http://localhost:5173/api/task/dashboard?access_token=<ACCESS_TOKEN>"
```

```bash
curl "http://localhost:5173/api/task/dashboard?access_token=<ACCESS_TOKEN>&type=hours&step=1"
```

```bash
curl "http://localhost:5173/api/task/dashboard?access_token=<ACCESS_TOKEN>&dashboardType=apiRequests&type=minute&step=5"
```

```bash
curl "http://localhost:5173/api/task/dashboard?access_token=<ACCESS_TOKEN>&dashboardType=tops&top=10&type=days&step=1"
```

趋势 v2 自定义范围示例：

```bash
curl "http://localhost:5173/api/Task/dashboard?access_token=<ACCESS_TOKEN>&dashboardType=trends&type=range&physicalNodeId=<INSTALL_UUID>&startAt=1775644614&endAt=1775731014&trendSchemaVersion=2"
```

`GET /api/Task/dashboard/nodes` 使用标准 `ResponseMessage` 包装器，`data` 为当前用户可访问的已登记安装节点列表，包含离线节点：

```json
{
  "reqId": "request-id",
  "ts": 0,
  "code": "ok",
  "data": [
    {
      "physicalNodeId": "installation-uuid",
      "label": "agent-name (short-uuid)",
      "status": "running",
      "engineDeployed": true,
      "apiServerDeployed": false
    }
  ]
}
```

前端提供“全部节点”选项，请求全部节点时省略 `physicalNodeId`。节点 ID 是安装 UUID；同一台机器上的不同安装保持独立。

趋势 v2 序列包含 `status`（`ok`、`no_data`、`component_not_deployed`）、`traceability`（`complete`、`partial`、`untraceable`）、`coverage`（`complete`、`partial`、`unknown`）和 `hasUnattributedData`。`ts` 与 `values` 等长且按 Unix 秒升序；缺失采样为 `null`，真实零值保留为 `0`。部分或不可追溯状态应明确标示；全部节点查询可保留旧数据，单节点查询不将无节点标签的旧记录分配给节点。组件未部署且无历史数据时返回 `component_not_deployed`；已有历史数据仍可展示。

7 天及自定义趋势的采样粒度至少为小时，跨日坐标轴包含日期，tooltip 显示完整本地日期时间和浏览器时区。

Apifox 风格请求：

```bash
curl --location --request GET 'http://localhost:5173/api/task/dashboard?access_token=<ACCESS_TOKEN>&dashboardType=tops&type=hours&step=1' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)' \
--header 'Accept: */*' \
--header 'Host: localhost:5173' \
--header 'Connection: keep-alive'
```

## 响应包装器

该接口返回标准包装器 [ResponseMessage.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm-api/src/main/java/com/tapdata/tm/base/dto/ResponseMessage.java)：

```json
{
  "reqId": "string",
  "ts": 0,
  "code": "ok",
  "message": null,
  "stack": null,
  "data": {}
}
```

`data` 为 `TaskDashboardVo`。

## 响应结构

```json
{
  "query": {
    "type": "minute",
    "step": 5,
    "dashboardType": "all",
    "top": 5,
    "startAt": 0,
    "endAt": 0
  },
  "summary": {
    "activeTasks": {
      "total": 0,
      "running": 0,
      "error": 0,
      "maxLag": 0,
      "minLag": 0
    },
    "totalThroughput": {
      "current": 0.0,
      "peak": 0.0,
      "dataRate": 0.0,
      "changeRate": 0.0
    },
    "connectedDbs": {
      "total": 0,
      "items": [
        {
          "id": "string",
          "name": "string",
          "tableCount": 0
        }
      ]
    },
    "apiRequests": {
      "total": 0,
      "failed": 0,
      "errorRate": 0.0,
      "avgTime": 0.0
    }
  },
  "trends": {
    "throughput": {
      "ts": [0],
      "values": [0.0]
    },
    "apiRequests": {
      "ts": [0],
      "values": [0.0]
    }
  },
  "tops": {
    "topLaggingTasks": [
      {
        "taskId": "string",
        "taskName": "string",
        "latency": 0,
        "throughput": 0.0
      }
    ],
    "topThroughputTasks": [
      {
        "taskId": "string",
        "taskName": "string",
        "latency": 0,
        "throughput": 0.0
      }
    ]
  }
}
```

## 字段语义

### query

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `type` | `string` | 后端实际使用的标准化时间类型。 |
| `step` | `number` | 后端实际使用的标准化步长。 |
| `dashboardType` | `string` | 标准化的仪表盘板块选择器。 |
| `top` | `number` | 标准化的排行榜大小。 |
| `startAt` | `number` | 窗口起始时间，Unix 秒级时间戳。 |
| `endAt` | `number` | 窗口结束时间，Unix 秒级时间戳。 |
| `physicalNodeId` | `string` | 趋势 v2 查询的安装 UUID；全部节点查询时为空。 |
| `intervalSeconds` | `number` | 趋势采样间隔，单位为秒。 |
| `trendSchemaVersion` | `number` | 趋势响应版本；`2` 表示可空序列并返回数据状态。 |

### summary.activeTasks

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `total` | `number` | 可见的迁移/同步任务总数。 |
| `running` | `number` | 运行中的任务数。 |
| `error` | `number` | 处于 `error` 或 `schedule_failed` 状态的任务数。 |
| `maxLag` | `number` | 最大任务延迟（毫秒）。 |
| `minLag` | `number` | 最小任务延迟（毫秒）。 |

### summary.totalThroughput

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `current` | `number` | 当前窗口内最新的吞吐量数据点。 |
| `peak` | `number` | 当前窗口内的峰值吞吐量。 |
| `dataRate` | `number` | 最新的输出数据量吞吐量数据点。 |
| `changeRate` | `number` | 从第一个数据点到最后一个数据点的变化百分比。 |

### summary.connectedDbs

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `total` | `number` | 可见的数据源连接总数。 |
| `items` | `array` | 按 `tableCount 降序, name 升序` 排列的前 3 个连接。 |

### summary.apiRequests

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `total` | `number` | 所选窗口内的 API 请求总数。 |
| `failed` | `number` | 失败的 API 请求数。 |
| `errorRate` | `number` | API 监控服务返回的错误率百分比/值。 |
| `avgTime` | `number` | 平均响应时间。 |

### trends

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `throughput.ts` | `array<number>` | Unix 秒级时间戳数组。 |
| `throughput.values` | `array` | 与 `ts` 对齐的吞吐量值；趋势 v2 缺失采样为 `null`。 |
| `apiRequests.ts` | `array<number>` | Unix 秒级时间戳数组。 |
| `apiRequests.values` | `array` | 与 `ts` 对齐的请求速率值；趋势 v2 缺失采样为 `null`。 |

### tops

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `topLaggingTasks` | `array` | 按 `latency 降序`，其次 `throughput 降序` 排列。 |
| `topThroughputTasks` | `array` | 按 `throughput 降序`，其次 `latency 降序` 排列。 |

## dashboardType 行为

| `dashboardType` | 填充的板块 |
| --- | --- |
| `all` | `summary`、`trends`、`tops` |
| `summary` | 仅 `summary` |
| `activeTasks` | 仅 `summary.activeTasks` |
| `totalThroughput` | 仅 `summary.totalThroughput` |
| `connectedDbs` | 仅 `summary.connectedDbs` |
| `apiRequests` | `summary.apiRequests` 和 `trends.apiRequests` |
| `trends` | `trends.throughput` 和 `trends.apiRequests` |
| `tops` | 仅 `tops` |

未请求的板块会以空值或零值返回，因为响应 DTO 在选择性填充之前已完成全部初始化。

## 注意事项

- `access_token` 需使用真实的用户令牌。调用前请将 `<ACCESS_TOKEN>` 替换为实际值。
- `connectedDbs.items` 有意限制为最多 3 条记录。
- `top` 仅影响 `tops` 下的排行榜数组。
- 该接口为用户级作用域，因为控制器/服务流程中使用了当前登录用户。
- 如需获取实际响应示例，请先启动本地 Web/后端服务，然后重新执行：

```bash
curl -i http://localhost:3000/api/task/dashboard
```
