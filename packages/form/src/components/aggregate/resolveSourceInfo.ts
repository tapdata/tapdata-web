import { getConnectionNoSchema } from '@tap/api/src/core/connections'

export interface SourceInfo {
  /** 连接名称 */
  connectionName: string
  /** 数据库名称 */
  databaseName: string
  /** 表名 */
  tableName: string
  /** 连接ID */
  connectionId: string
  /** 数据库类型，如 MongoDB */
  databaseType: string
}

/**
 * 从 MongoDB URI 中解析数据库名称
 * 格式: mongodb://user:pass@host:port/database?params
 */
function parseDatabaseFromUri(uri: string): string {
  try {
    // 去掉协议前缀 mongodb:// 或 mongodb+srv://
    const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, '')
    // 去掉认证信息 user:pass@
    const afterAuth = withoutProtocol.includes('@')
      ? withoutProtocol.slice(withoutProtocol.indexOf('@') + 1)
      : withoutProtocol
    // 去掉 host:port（可能有多个逗号分隔的 host）
    // 找到第一个 / 后面就是 database?params
    const slashIndex = afterAuth.indexOf('/')
    if (slashIndex === -1) return ''
    const afterSlash = afterAuth.slice(slashIndex + 1)
    // 去掉查询参数
    const qIndex = afterSlash.indexOf('?')
    return qIndex === -1 ? afterSlash : afterSlash.slice(0, qIndex)
  } catch {
    return ''
  }
}

/**
 * 从连接详情中解析数据库名称
 */
function resolveDatabaseName(connection: any): string {
  // 优先取顶层 database_name（后端可能已经解析好了）
  if (connection.database_name) {
    return connection.database_name
  }

  const config = connection.config || {}

  // isUri 模式：从 URI 中解析
  if (config.isUri && config.uri) {
    return parseDatabaseFromUri(config.uri) || ''
  }

  // 非 URI 模式：直接取 config.database
  return config.database || ''
}

/**
 * 沿 DAG 向上遍历，找到第一个 type=table 的源节点
 * @param currentNodeId  当前节点 ID
 * @param findNodeById   根据 ID 查找节点的函数（从 dataflowStore 或 formScope 获取）
 */
function findSourceTableNode(
  currentNodeId: string,
  findNodeById: (id: string) => any,
): any | null {
  const visited = new Set<string>()

  const walk = (nodeId: string): any | null => {
    if (visited.has(nodeId)) return null
    visited.add(nodeId)

    const node = findNodeById(nodeId)
    if (!node) return null

    if (node.type === 'table') return node

    const parentIds: string[] = node.$inputs || []
    for (const pid of parentIds) {
      const found = walk(pid)
      if (found) return found
    }
    return null
  }

  return walk(currentNodeId)
}

/**
 * 解析当前聚合节点对应的源数据节点信息
 *
 * @param currentNodeId  当前聚合节点 ID
 * @param findNodeById   根据 ID 查找 DAG 节点的函数
 * @returns  源节点信息，包含连接名称、数据库名称、表名等
 *
 * @example
 * ```ts
 * import { resolveSourceInfo } from '@tap/form'
 *
 * const info = await resolveSourceInfo(nodeId, dataflowStore.findNodeById)
 * // info.connectionName  → 'mongodb_source'
 * // info.databaseName    → 'source'
 * // info.tableName       → 'orders'
 * // info.databaseType    → 'MongoDB'
 * ```
 */
export async function resolveSourceInfo(
  currentNodeId: string,
  findNodeById: (id: string) => any,
): Promise<SourceInfo | null> {
  const sourceNode = findSourceTableNode(currentNodeId, findNodeById)
  if (!sourceNode) return null

  const connectionId: string = sourceNode.connectionId
  const tableName: string = sourceNode.tableName || ''

  if (!connectionId) return null

  const connection = await getConnectionNoSchema(connectionId)
  if (!connection) return null

  return {
    connectionName: connection.name || '',
    databaseName: resolveDatabaseName(connection),
    tableName,
    connectionId,
    databaseType: connection.database_type || '',
  }
}

