export const Aggregate = {
  'zh-cn': {
    primaryKeys: '主键',
    aggregations: {
      title: '聚合',
      aggFunction: '聚合函数',
      aggExpression: '作用目标',
      name: {
        title: '子处理名称',
        tooltip: `后续节点的脚本编辑需要引用此子处理的名称进行指定的数据处理，故不同的子处理名称不可重复。`
      },
      filterPredicate: '过滤器',
      groupByExpression: '分组字段',
      addition: '添加聚合 '
    },
    return: '返回示例'
  },
  'zh-tw': {
    primaryKeys: '主鍵',
    aggregations: {
      title: '聚合',
      aggFunction: '聚合函數',
      aggExpression: '作用目標',
      name: {
        title: '子處理名稱',
        tooltip: `後續節點的腳本編輯需要引用此子處理的名稱進行指定的數據處理，故不同的子處理名稱不可重復。`
      },
      filterPredicate: '過濾器',
      groupByExpression: '分組字段',
      addition: '添加聚合 '
    },
    return: '返回示例'
  },
  'en-us': {
    primaryKeys: 'Primary Keys',
    aggregations: {
      title: 'Aggregation',
      aggFunction: 'Function',
      aggExpression: 'Target Field',
      name: {
        title: 'Name',
        tooltip: `Subsequent script editing of nodes needs to reference the name of this subprocess for specific data processing. Therefore, the name of different subprocesses cannot be repeated.`
      },
      filterPredicate: 'Filter',
      groupByExpression: 'Group Field',
      addition: 'Add'
    },
    return: 'Return'
  }
}
