# JS 节点试运行与样本数据 API

## 概览

- 控制器：[TaskController.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/java/com/tapdata/tm/task/controller/TaskController.java#L1261)
- 请求 DTO：[TestRunDto.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm-common/src/main/java/com/tapdata/tm/commons/dag/vo/TestRunDto.java)
- 业务实现：[TaskNodeServiceImpl.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/java/com/tapdata/tm/task/service/impl/TaskNodeServiceImpl.java#L536)
- 响应包装器：[ResponseMessage.java](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm-api/src/main/java/com/tapdata/tm/base/dto/ResponseMessage.java)

控制器基路径同时支持：

- `/api/task`
- `/api/Task`

本文档覆盖两个接口：

- `POST /api/task/migrate-js/test-run`
- `GET /api/task/migrate-js/mock-data`

## 认证

沿用管理端通用认证方式，请求需带有效登录态。当前代码路径支持以下任一方式：

- Query 参数 `access_token`
- 请求头 `authorization`
- 请求头 `user_id`

## 1. 触发 JS 节点试运行

### 请求

- 方法：`POST`
- 路径：`/api/task/migrate-js/test-run`
- 控制器方法：[testRun](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/java/com/tapdata/tm/task/controller/TaskController.java#L1263)

### 功能说明

触发指定任务中 JS 节点的试运行。接口本身只负责下发试运行任务，不直接返回试运行结果数据。

服务端会执行以下动作：

1. 根据 `taskId` 找到原任务。
2. 清理该任务对应测试任务的历史日志。
3. 基于当前任务 DAG 构造一份试运行 DAG。
4. 将指定 JS 节点后的输出接到虚拟目标节点。
5. 把试运行任务投递给可用 agent 执行。

### 请求体

`Content-Type: application/json`


| 字段                      | 类型       | 是否必填 | 说明                     |
| ----------------------- | -------- | ---- | ---------------------- |
| `taskId`                | `string` | 是    | 原任务 ID。                |
| `jsNodeId`              | `string` | 是    | 待试运行的 JS 节点 ID。        |
| `tableName`             | `string` | 条件必填 | 迁移任务场景下用于限定源表。         |
| `rows`                  | `number` | 否    | 试运行抽取的样本行数。            |
| `script`                | `string` | 否    | 覆盖节点当前脚本；为空时使用任务中已有脚本。 |
| `version`               | `number` | 否    | 试运行任务版本号。              |
| `testRunInputEventJson` | `string` | 否    | 自定义试运行输入事件 JSON 字符串。   |
| `sql`                   | `string` | 否    | DTO 中存在，但当前接口实现未消费该字段。 |
| `logOutputCount`        | `number` | 否    | DTO 中存在，但当前接口实现未消费该字段。 |


### 请求示例

```bash
curl --location 'http://localhost:5173/api/task/migrate-js/test-run?access_token=<ACCESS_TOKEN>' \
--header 'Content-Type: application/json' \
--data '{
  "taskId": "67f5c4d0f1c2b53f61d8a001",
  "jsNodeId": "node_js_01",
  "tableName": "customer",
  "rows": 10,
  "version": 12,
  "script": "function process(record){ record.after.level = \"gold\"; return record; }",
  "testRunInputEventJson": "{\"after\":{\"id\":1,\"name\":\"alice\"}}"
}'
```

### 成功响应

该接口返回标准包装器，`data` 为空：

```json
{
  "reqId": "4d9f2d6d-2d8d-45d9-a2cf-2d6f710a1111",
  "ts": 1775644914982,
  "code": "ok",
  "message": null,
  "stack": null,
  "data": null
}
```

### 失败场景

常见失败条件：

- 任务不存在或 `taskId` 非法。
- 当前任务找不到可用 agent，服务层会抛出 `no agent`。
- 节点类型与试运行逻辑不匹配。

### 说明

- 该接口是“触发型”接口，不保证返回时试运行已经结束。
- 试运行日志和结果需通过现有试运行结果链路获取，本接口本身不回传日志内容。

## 2. 获取 JS 节点前置样本数据

### 请求

- 方法：`GET`
- 路径：`/api/task/migrate-js/mock-data`
- 控制器方法：[mockDate](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/java/com/tapdata/tm/task/controller/TaskController.java#L1270)

### 功能说明

返回指定 JS 节点前置数据节点的样本数据，结果会被包装成试运行事件结构，每条记录放在 `after` 字段下。

服务端处理逻辑：

1. 根据 `taskId` 找到任务。
2. 查找 `jsNodeId` 的前置节点。
3. 取第一个 `DataParentNode` 类型的前置数据节点。
4. 根据连接能力，从源端查询样本数据。
5. 将结果转换为 `sampleData: [{ "after": ... }]` 结构返回。

### 请求体

注意：该接口当前实现为 `GET + RequestBody`，这不是常见 REST 风格；如果经过网关或代理，需确认不会丢弃请求体。

`Content-Type: application/json`


| 字段                      | 类型       | 是否必填 | 说明                            |
| ----------------------- | -------- | ---- | ----------------------------- |
| `taskId`                | `string` | 是    | 原任务 ID。                       |
| `jsNodeId`              | `string` | 是    | JS 节点 ID。                     |
| `tableName`             | `string` | 是    | 取样本数据的表名。                     |
| `rows`                  | `number` | 否    | 按表查询时的样本条数；当 `sql` 为空时使用。     |
| `sql`                   | `string` | 否    | 自定义 SQL 查询语句；非空时优先走 SQL 取样路径。 |
| `script`                | `string` | 否    | 当前接口未使用。                      |
| `version`               | `number` | 否    | 当前接口未使用。                      |
| `testRunInputEventJson` | `string` | 否    | 当前接口未使用。                      |
| `logOutputCount`        | `number` | 否    | 当前接口未使用。                      |


### 取样模式

- `sql` 非空：调用数据源原生命令能力取样，要求连接具备 `run_raw_command_function` 能力。
- `sql` 为空：按 `tableName + rows` 取样，要求连接具备 `query_by_advance_filter_function` 能力。

建议约束：

- `sql` 与 `rows` 二选一传递更清晰。
- 如果传了 `sql`，`rows` 会被忽略。

### 请求示例

```bash
curl --location --request GET 'http://localhost:5173/api/task/migrate-js/mock-data?access_token=<ACCESS_TOKEN>' \
--header 'Content-Type: application/json' \
--data '{
  "taskId": "67f5c4d0f1c2b53f61d8a001",
  "jsNodeId": "node_js_01",
  "tableName": "customer",
  "rows": 5
}'
```

按 SQL 取样示例：

```bash
curl --location --request GET 'http://localhost:5173/api/task/migrate-js/mock-data?access_token=<ACCESS_TOKEN>' \
--header 'Content-Type: application/json' \
--data '{
  "taskId": "67f5c4d0f1c2b53f61d8a001",
  "jsNodeId": "node_js_01",
  "tableName": "customer",
  "sql": "select * from customer order by id limit 1"
}'
```

### 成功响应示例

```json
{
  "reqId": "2f4c8416-7ca1-41a3-baf8-04290c033b1b",
  "ts": 1775791967774,
  "code": "ok",
  "data": {
    "sampleData": [
      {
        "after": {
          "duration": "P0Y0M0DT0H9M9.777616S",
          "is_active": true,
          "count_val": 973,
          "price": 195.71,
          "created_at": "2026-01-24 05:35:14",
          "category_type": 44,
          "id": 1,
          "title": "item_1",
          "ext_info": "{\"rank\": 1, \"seed\": 0.6318327314525833}",
          "remarks": "auto_generated_61e44fb868cc7457c91aabe0e2624315",
          "short_code": "code_90"
        }
      }
    ]
  }
}
```

返回特征：

- `sampleData` 为数组。
- 每条样本记录包装在 `after` 字段中，便于直接作为试运行输入事件使用。
- 字段值保持源端返回形态，可能出现布尔、整数、小数、时间字符串、ISO-8601 时长字符串、JSON 字符串等多种类型。

当 `jsNodeId` 没有前置节点时，当前实现直接返回空对象：

```json
{
  "reqId": "dbe52f93-6a59-470d-b524-7e8be6711111",
  "ts": 1775644914982,
  "code": "ok",
  "data": {}
}
```

### 失败场景

服务层已定义的典型业务错误码如下：


| 错误码                                       | 说明                |
| ----------------------------------------- | ----------------- |
| `MockData.TaskNotFound`                   | 任务不存在。            |
| `MockData.PreNodeNotFound`                | 未找到 JS 节点的前置数据节点。 |
| `MockData.ConnectionNotFound`             | 前置节点关联的数据源连接不存在。  |
| `MockData.ConnectionNotSupportRawCommand` | 连接不支持执行原始命令。      |
| `MockData.ConnectionNotSupportQuery`      | 连接不支持按过滤条件取数。     |
| `MockData.SampleDataError`                | 获取样本数据失败。         |


错误文案定义见：

- [messages_zh_CN.properties](/Users/shihuangzhu/IdeaProjects/tapdata_v3/new_tapdata/manager/tm/src/main/resources/messages_zh_CN.properties#L498)

## 响应包装器

两个接口都返回标准包装器：

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

实际序列化结果中，值为 `null` 的字段可能被省略，所以有些响应只会看到 `reqId`、`ts`、`code`、`data`。

字段含义：


| 字段        | 类型              | 说明             |
| --------- | --------------- | -------------- |
| `reqId`   | `string`        | 请求唯一标识。        |
| `ts`      | `number`        | 服务端响应时间戳。      |
| `code`    | `string`        | 成功通常为 `ok`。    |
| `message` | `string`        | 失败时的错误信息。      |
| `stack`   | `string`        | 异常堆栈，通常仅调试时使用。 |
| `data`    | `object | null` | 业务返回数据。        |


