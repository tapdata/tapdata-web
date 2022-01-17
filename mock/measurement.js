module.exports = {
  '/api/measurement/query': {
    data: {
      samples: [
        {
          cpuUsage: [12, 312, 323, 2123, 123, 23],
          time: [123123123, 12312312, 12312312, 123123123, 123123123]
        }
      ],
      statistics: [
        {
          output: 123213,
          input: 1,
          insert: 2,
          update: 3,
          delete: 4
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  }
}
