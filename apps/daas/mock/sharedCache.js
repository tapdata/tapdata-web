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
          createTime: '@datetime',
          cacheTime: '@datetime',
          connection: {
            name: '@name'
          }
        }
      ]
    }
  }
}
