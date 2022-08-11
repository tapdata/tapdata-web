module.exports = {
  '/api/MonitoringLogs/query': {
    reqId: '93',
    ts: 95,
    code: 'ok',
    data: {
      total: '@integer(0, 100)',
      'items|20': [
        {
          id: '@id',
          date: '@date',
          logTags: ['fugiat sed do est'],
          errorStack: 'nisi id nostrud est',
          'message|20-100': 'ab cd shiwo',
          'level|1': ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
          timestamp: '@integer(1659044028561, 1659944028561)',
          nodeId: '@cuid',
          nodeName: '@name',
          taskId: '@cuid',
          taskName: '@name',
          user_id: '@cuid'
        }
      ]
    }
  }
}
