module.exports = {
  '/api/measurement/query': {
    data: {
      samples: [
        {
          'inputQps|20': ['@integer(0, 100)'],
          'outputQps|20': ['@integer(0, 100)'],
          'transmitionTime|20': ['@integer(100, 1000)'],
          'time|20': ['@time(yyyy-MM-dd HH:mm:ss)']
        },
        {
          replicateLag: ['@integer(0, 10)'],
          time: ['@time(yyyy-MM-dd HH:mm:ss)']
        },
        {
          'outputEvents|2': ['@integer(0, 1000)'], // 总输出
          'inputEvents|2': ['@integer(0, 1000)'], // 总输入
          'insertCount|2': ['@integer(0, 1000)'], // 总插入
          'updateCount|2': ['@integer(0, 1000)'], // 总更新
          'deleteCount|2': ['@integer(0, 1000)'] // 总删除
        }
      ],
      statistics: [
        {
          initialTime: '@time(yyyy-MM-dd HH:mm:ss)', //全量同步完成时间
          initialTotal: '@integer(0, 1000)', // 全量数量
          initialWrite: '@integer(0, 1000)', // 已完成数据
          cdcTime: '@time(yyyy-MM-dd HH:mm:ss)', // 增量时间点
          outputEvents: '@integer(0, 1000)', // 总输出
          inputEvents: '@integer(0, 1000)', // 总输入
          insertCount: '@integer(0, 1000)', // 总插入
          updateCount: '@integer(0, 1000)', // 总更新
          deleteCount: '@integer(0, 1000)' // 总删除
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  }
}
