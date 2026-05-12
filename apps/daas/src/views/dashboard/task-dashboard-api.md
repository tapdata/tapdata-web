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
| `type` | `string` | 否 | `minute`、`hours`、`days` | `minute` | 时间窗口类型。 |
| `step` | `number` | 否 | `minute` 对应 `5`，`hours` 对应 `1`，`days` 对应 `1` | `5` | 时间窗口步长。无效组合将回退到默认窗口。 |
| `dashboardType` | `string` | 否 | `all`、`summary`、`activeTasks`、`totalThroughput`、`connectedDbs`、`apiRequests`、`trends`、`tops` | `all` | 控制填充哪个仪表盘板块。 |
| `top` | `number` | 否 | `5`、`10`、`20` | `5` | `tops` 排行榜大小。无效值将回退为 `5`。 |

### 有效时间窗口

| 请求参数 | 实际范围 |
| --- | --- |
| `type=minute&step=5` | 最近 5 分钟 |
| `type=hours&step=1` | 最近 1 小时 |
| `type=days&step=1` | 最近 24 小时 |
| 任何无效组合 | 最近 5 分钟 |

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
| `throughput.values` | `array<number>` | 与 `ts` 对齐的吞吐量值。 |
| `apiRequests.ts` | `array<number>` | Unix 秒级时间戳数组。 |
| `apiRequests.values` | `array<number>` | 与 `ts` 对齐的请求速率值。 |

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
