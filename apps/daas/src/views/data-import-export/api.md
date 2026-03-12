分组管理 API 文档

概述

分组管理（Group Management）提供了项目分组的创建、查询、修改、删除，以及分组导入导出功能。所有 API 的 Base URL 为：/api/groupInfo

通用响应格式

所有接口返回统一的响应格式（除导出接口外）：

{
  "code": "ok",
  "data": {},
  "message": null
}

API 接口列表

1. 查询分组列表

查询所有分组信息，支持分页和筛选。

接口信息

URL: /api/groupInfo/groupList

Method: GET

Summary: 获取分组列表

请求参数

参数名

类型

必填

说明

filter

String

否

JSON格式的筛选条件

Filter 参数格式

{
  "skip": 0,
  "limit": 20,
  "where": {
    "name": "group name"
  }
}

请求示例

GET /api/groupInfo/groupList?filter={"skip":0,"limit":20,"sort":{"createAt":-1}}

响应示例

{
  "code": "ok",
  "data": {
    "total": 10,
    "items": [
      {
        "id": "65a1b2c3d4e5f6789",
        "name": "开发环境分组",
        "description": "开发环境的任务和连接",
        "resourceItemList": [
          {
            "id": "task001",
            "name": "数据同步任务",
            "type": "SYNC_TASK"
          },
          {
            "id": "conn001",
            "name": "MySQL连接",
            "type": "CONNECTION"
          }
        ],
        "createAt": "2024-01-15T10:30:00Z",
        "lastUpdAt": "2024-01-16T14:20:00Z"
      }
    ]
  }
}

2. 新增分组

创建一个新的项目分组。

接口信息

URL: /api/groupInfo

Method: POST

Summary: 新增分组

Content-Type: application/json

请求体

{
  "name": "生产环境分组",
  "description": "生产环境的所有资源",
  "resourceItemList": [
    {
      "id": "task001",
      "type": "SYNC_TASK"
    },
    {
      "id": "conn001", 
      "type": "CONNECTION"
    },
    {
      "id": "module001",
      "type": "MODULE"
    }
  ]
}

请求参数说明

字段

类型

必填

说明

name

String

是

分组名称，需唯一

description

String

否

分组描述

resourceItemList

Array

否

资源项列表

resourceItemList[].id

String

是

资源ID

resourceItemList[].type

String

是

资源类型，可选值见下方

资源类型枚举

SYNC_TASK - 数据同步任务

MIGRATE_TASK - 数据迁移任务

CONNECTION - 数据源连接

MODULE - 处理器/模块

INSPECT_TASK - 数据校验任务

SHARE_CACHE - 共享缓存

响应示例

{
  "code": "ok",
  "data": {
    "id": "65a1b2c3d4e5f6789",
    "name": "生产环境分组",
    "description": "生产环境的所有资源",
    "resourceItemList": [...],
    "createAt": "2024-01-15T10:30:00Z"
  }
}

3. 修改分组

更新已存在的分组信息。

接口信息

URL: /api/groupInfo

Method: PATCH

Summary: 修改分组

Content-Type: application/json

请求体

{
  "id": "65a1b2c3d4e5f6789",
  "name": "生产环境分组-更新",
  "description": "更新后的描述",
  "resourceItemList": [
    {
      "id": "task002",
      "type": "SYNC_TASK"
    }
  ]
}

请求参数说明

字段

类型

必填

说明

id

String

是

分组ID

name

String

否

新的分组名称

description

String

否

新的描述

resourceItemList

Array

否

更新后的资源列表

响应示例

{
  "code": "ok",
  "data": {
    "id": "65a1b2c3d4e5f6789",
    "name": "生产环境分组-更新",
    "lastUpdAt": "2024-01-16T15:30:00Z"
  }
}

4. 删除分组

逻辑删除指定的分组（软删除）。

接口信息

URL: /api/groupInfo/{id}

Method: DELETE

Summary: 删除分组

路径参数

参数名

类型

必填

说明

id

String

是

分组ID

请求示例

DELETE /api/groupInfo/65a1b2c3d4e5f6789

响应示例

{
  "code": "ok",
  "data": null
}

5. 批量导出分组

将一个或多个分组及其关联的资源导出为 .tar 文件。

接口信息

URL: /api/groupInfo/batch/load

Method: GET

Summary: 批量导出分组

Response: 文件流（application/octet-stream）

请求参数

参数名

类型

必填

说明

id

String[]

是

分组ID列表（可传多个）

请求示例

# 导出单个分组
GET /api/groupInfo/batch/load?id=65a1b2c3d4e5f6789

# 导出多个分组
GET /api/groupInfo/batch/load?id=65a1b2c3d4e5f6789&id=65a1b2c3d4e5f6790

响应说明

Content-Type: application/octet-stream

Content-Disposition: attachment; filename="生产环境分组-20240115.tar"

导出的 tar 文件包含以下内容：

生产环境分组-20240115.tar
├── GroupInfo.json          # 分组元数据
├── Task.json              # 任务配置
├── Connections.json       # 连接配置（敏感信息已脱敏）
├── Modules.json           # 模块配置
├── MetadataInstances.json # 元数据实例
└── Inspect.json           # 校验任务配置

错误响应

{
  "code": "GroupInfo.Not.Found",
  "message": "分组不存在"
}

6. 批量导入分组

从 .tar 文件导入分组及其关联资源。

接口信息

URL: /api/groupInfo/batch/import

Method: POST

Summary: 批量导入分组

Content-Type: multipart/form-data

请求参数

参数名

类型

必填

默认值

说明

file

File

是

-

要导入的 .tar 文件

importMode

String

否

group_import

导入模式

导入模式说明

模式

说明

group_import

标准导入，重名资源重命名为 {name}_backup_{timestamp}

replace

替换导入，重名资源直接替换

请求示例（cURL）

curl -X POST "http://localhost:3000/api/groupInfo/batch/import?importMode=group_import" \
  -H "Authorization: Bearer {token}" \
  -F "file=@生产环境分组-20240115.tar"

响应示例

{
  "code": "ok",
  "data": null
}

导入流程

导入过程分为以下阶段：

Stage 1: 导入连接资源（Connections）

Stage 2: 导入任务资源（Tasks、Inspect Tasks）

Stage 3: 导入模块资源（Modules）

Stage 4: 保存分组信息（GroupInfo）

每个阶段都有详细的日志记录，便于追踪导入进度。

错误响应

{
  "code": "error",
  "message": "Group import failed, fileName=xxx.tar, error=..."
}

7. 查询导入导出记录

查询分组导入导出的历史记录。

接口信息

URL: /api/groupInfo/record/list

Method: GET

Summary: 查询导入导出记录列表

请求参数

参数名

类型

必填

说明

filter

String

否

JSON格式的筛选条件

Filter 参数示例

{
  "skip": 0,
  "limit": 20,
  "where": {
    "type": "import",
    "status": "completed"
  }
}

请求示例

GET /api/groupInfo/record/list?filter={"where":{"type":"import"}}

响应示例

{
  "code": "ok",
  "data": {
    "total": 5,
    "items": [
      {
        "id": "65a1b2c3d4e5f6789",
        "type": "import",
        "fileName": "生产环境分组-20240115.tar",
        "status": "completed",
        "operator": "admin",
        "operationTime": "2024-01-15T10:30:00Z",
        "message": null,
        "details": [
          {
            "groupId": "65a1b2c3d4e5f6789",
            "groupName": "生产环境分组",
            "message": null,
            "recordDetails": [
              {
                "resourceType": "CONNECTION",
                "resourceName": "MySQL连接",
                "action": "IMPORTED",
                "message": null
              },
              {
                "resourceType": "SYNC_TASK",
                "resourceName": "数据同步任务",
                "action": "IMPORTED",
                "message": null
              }
            ]
          }
        ]
      }
    ]
  }
}

记录状态枚举

importing - 导入中

exporting - 导出中

completed - 已完成

failed - 失败

记录类型枚举

import - 导入记录

export - 导出记录

资源操作枚举

IMPORTED - 已导入

EXPORTED - 已导出

REPLACED - 已替换

SKIPPED - 已跳过

ERRORED - 错误

数据模型

GroupInfoDto

分组信息数据传输对象

interface GroupInfoDto {
  id?: string;                    // 分组ID
  name: string;                   // 分组名称（唯一）
  description?: string;           // 分组描述
  resourceItemList?: ResourceItem[];  // 资源列表
  createAt?: Date;                // 创建时间
  lastUpdAt?: Date;               // 更新时间
  createUser?: string;            // 创建用户
  lastUpdBy?: string;             // 更新用户
}

ResourceItem

资源项

interface ResourceItem {
  id: string;                     // 资源ID
  name?: string;                  // 资源名称（查询时自动填充）
  type: ResourceType;             // 资源类型
}

GroupInfoRecordDto

导入导出记录

interface GroupInfoRecordDto {
  id: string;                     // 记录ID
  type: 'import' | 'export';      // 记录类型
  fileName: string;               // 文件名
  status: string;                 // 状态
  operator: string;               // 操作人
  operationTime: Date;            // 操作时间
  message?: string;               // 错误信息（如有）
  details: GroupInfoRecordDetail[];  // 详细记录
}

GroupInfoRecordDetail

记录详情

interface GroupInfoRecordDetail {
  groupId: string;                // 分组ID
  groupName: string;              // 分组名称
  message?: string;               // 消息（如重名提示）
  recordDetails: RecordDetail[];  // 资源详情
}

interface RecordDetail {
  resourceType: ResourceType;     // 资源类型
  resourceName: string;           // 资源名称
  action: RecordAction;           // 操作
  message?: string;               // 错误信息
}

错误码

错误码

说明

HTTP状态码

GroupInfo.Name.Existed

分组名称已存在

400

GroupInfo.Not.Found

分组不存在

404

使用示例

完整工作流示例

1. 创建分组

curl -X POST "http://localhost:3000/api/groupInfo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "测试环境分组",
    "description": "测试环境资源",
    "resourceItemList": [
      {"id": "task001", "type": "SYNC_TASK"},
      {"id": "conn001", "type": "CONNECTION"}
    ]
  }'

2. 导出分组

curl -X GET "http://localhost:3000/api/groupInfo/batch/load?id=65a1b2c3d4e5f6789" \
  -H "Authorization: Bearer {token}" \
  -o "测试环境分组.tar"

3. 导入分组

curl -X POST "http://localhost:3000/api/groupInfo/batch/import?importMode=group_import" \
  -H "Authorization: Bearer {token}" \
  -F "file=@测试环境分组.tar"

4. 查询导入记录

curl -X GET "http://localhost:3000/api/groupInfo/record/list?filter={\"where\":{\"type\":\"import\"}}" \
  -H "Authorization: Bearer {token}"

