module.exports = {
  '/api/sharedCache': {
    code: 'ok',
    data: {
      total: 6,
      'items|1-10': [
        {
          id: '@id',
          name: '@name',
          'status|1': ['running', 'ready', 'error'],
          tableName: '所属表',
          connectionName: '@name',
          connectionId: '@id',
          cacheTimeAt: '2022-02-25T13:07:49.812+00:00',
          createTime: '2022-02-25T13:07:49.812+00:00'
        }
      ]
    }
  }
}
