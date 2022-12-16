export const Table = {
  'zh-cn': {
    connectionIdWrap: '连接',
    tableNameWrap: '表',
    totalReadMethod: {
      title: '全量数据读取',
      dataSource: ['全量读取', '自定义sql']
    },
    increasePoll: {
      title: '增量数据读取',
      dataSource: ['日志CDC', '自定义sql']
    },
    initialOffset: 'sql增量条件',
    increaseSyncInterval: '增量同步间隔(ms)',
    increaseReadSize: '每次读取数量(行)',
    maxTransactionDuration: '事务最大时长(小时)',
    existDataProcessMode: {
      title: '已有数据处理',
      dataSource: ['保持目标端原有表结构和数据', '清除目标端原有表结构及数据', '保持目标端原有表结构，清除数据']
    },
    writeStrategy: {
      title: '数据写入模式',
      dataSource: ['追加写入', '更新已存在或者插入新数据']
    },
    updateConditionFields: '更新条件字段',
    initialConcurrentSpace: '全量多线程写入',
    cdcConcurrentSpace: '增量多线程写入',
    attrs: { accessNodeProcessId: '所属agent' }
  },
  'zh-tw': {
    connectionIdWrap: '連接',
    tableNameWrap: '表',
    totalReadMethod: {
      title: '全量數據讀取',
      dataSource: ['全量讀取', '自定義sql']
    },
    increasePoll: {
      title: '增量數據讀取',
      dataSource: ['日誌CDC', '自定義sql']
    },
    initialOffset: 'sql增量條件',
    increaseSyncInterval: '增量同步間隔(ms)',
    increaseReadSize: '每次讀取數量(行)',
    maxTransactionDuration: '事務最大時長(小時)',
    existDataProcessMode: {
      title: '已有數據處理',
      dataSource: ['保持已存在的數據', '運行前刪除已存在的數據', '運行前刪除表結構']
    },
    writeStrategy: {
      title: '數據寫入模式',
      dataSource: ['追加寫入', '更新已存在或者插入新數據']
    },
    updateConditionFields: '更新條件字段',
    initialConcurrentSpace: '全量多線程寫入',
    cdcConcurrentSpace: '增量多線程寫入',
    attrs: { accessNodeProcessId: '所屬agent' }
  },
  'en-us': {
    connectionIdWrap: 'Database',
    tableNameWrap: 'Table',
    totalReadMethod: {
      title: 'Total Read Method',
      dataSource: ['Full Read', 'Customize Sql']
    },
    increasePoll: {
      title: 'Increase Poll',
      dataSource: ['CDC', 'Customize Sql']
    },
    initialOffset: 'Increment Condition',
    increaseSyncInterval: 'Increase Sync Interval (ms)',
    increaseReadSize: 'Increase Read Size (row)',
    maxTransactionDuration: 'Max Transaction Duration (h)',
    existDataProcessMode: {
      title: 'Exist Data Process Mode',
      dataSource: ['Keep Data', 'Drop Table', 'Remove Data']
    },
    writeStrategy: {
      title: 'Write Strategy',
      dataSource: ['Append Write', 'Update Or Insert']
    },
    updateConditionFields: 'Update Condition Fields',
    initialConcurrentSpace: 'Initial concurrent',
    cdcConcurrentSpace: 'CDC concurrent',
    attrs: { accessNodeProcessId: 'Agent' }
  }
}
