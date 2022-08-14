module.exports = {
  '/api/Task/chart': {
    reqId: 'f3d6efb7-7a11-4e43-951c-e8c6a0b6370e',
    ts: 1652415702474,
    code: 'ok',
    data: {
      chart5: { total: 142, valueDiff: 1, passed: 130, error: 5, countDiff: 6 },
      chart4: { Lag: 4, cdc: 23, initialized: 5, initializing: 0 },
      chart3: {
        total: 1400,
        items: [
          { count: 840, _id: 'edit' },
          { count: 0, _id: 'preparing' },
          { count: 8, _id: 'scheduling' },
          { count: 73, _id: 'schedule_failed' },
          { count: 0, _id: 'wait_run' },
          { count: 25, _id: 'running' },
          { count: 2, _id: 'stopping' },
          { count: 0, _id: 'pausing' },
          { count: 267, _id: 'error' },
          { count: 98, _id: 'complete' },
          { count: 232, _id: 'stop' }
        ]
      },
      chart2: { Lag: 40, cdc: 133, initialized: 0, initializing: 1 },
      chart1: {
        total: 665,
        items: [
          { count: 148, _id: 'edit' },
          { count: 4, _id: 'scheduling' },
          { count: 0, _id: 'schedule_failed' },
          { count: 0, _id: 'wait_run' },
          { count: 9, _id: 'running' },
          { count: 0, _id: 'stopping' },
          { count: 0, _id: 'pausing' },
          { count: 0, _id: 'paused' },
          { count: 157, _id: 'error' },
          { count: 158, _id: 'complete' },
          { count: 189, _id: 'stop' }
        ]
      },
      chart6: {
        inputTotal: 417641008,
        insertedTotal: 239155393,
        updatedTotal: 33905439,
        deletedTotal: 8350087,
        outputTotal: 417668247
      }
    }
  },
  '/api/verify': {
    reqId: '@id',
    ts: '@time',
    code: 'ok',
    data: {
      total: 30,
      'items|20': [
        {
          tableName: '@name',
          connectionId: '@cuid',
          diff: '@integer(1000, 5500)',
          id: '@id',
          progress: '@integer(0, 100)',
          connectionName: '@name'
        }
      ]
    }
  }
}
