const express = require('express')
const app = express()
const port = 30300

const Mock = require('mockjs')
const service = require('./service')
const hostname = '0.0.0.0'

const list = {
  '/api/DataFlowInsights/runtimeMonitor': {
    throughput: {
      data: [
        {
          statsType: 'throughput',
          createTime: 1620633775336,
          dataFlowId: '@id',
          granularity: 'flow_minute',
          statsData: [
            {
              t: '2021-04-28 18:50:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:51:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:52:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:53:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:54:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:55:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:56:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:57:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:58:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 18:59:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 19:00:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 19:01:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 19:02:00',
              inputSize: 0,
              outputSize: 0,
              inputCount: 0,
              outputCount: 0
            },
            {
              t: '2021-04-28 19:03:00',
              inputSize: 39375,
              outputSize: 39375,
              inputCount: 15570,
              outputCount: 15570
            },
            {
              t: '2021-04-28 19:04:00',
              inputSize: 18750,
              outputSize: 18750,
              inputCount: 6001,
              outputCount: 6001
            },
            {
              t: '2021-04-28 19:05:00',
              inputSize: 17344,
              outputSize: 17344,
              inputCount: 6437,
              outputCount: 6437
            },
            {
              t: '2021-04-28 19:06:00',
              inputSize: 15469,
              outputSize: 15469,
              inputCount: 5619,
              outputCount: 5619
            },
            {
              t: '2021-04-28 19:07:00',
              inputSize: 16407,
              outputSize: 16407,
              inputCount: 5989,
              outputCount: 5989
            },
            {
              t: '2021-04-28 19:08:00',
              inputSize: 12657,
              outputSize: 12657,
              inputCount: 4575,
              outputCount: 4575
            },
            {
              t: '2021-04-28 19:09:00',
              inputSize: 12657,
              outputSize: 12657,
              inputCount: 5773,
              outputCount: 5773
            }
          ]
        }
      ],
      code: 'ok',
      msg: 'ok'
    },
    trans_time: {
      data: [
        {
          statsType: 'trans_time',
          createTime: 1620633775585,
          dataFlowId: '608940e76ea5330010a5e00e',
          granularity: 'flow_minute',
          statsData: [
            { t: '2021-04-28 18:50:00', d: 0 },
            { t: '2021-04-28 18:51:00', d: 0 },
            { t: '2021-04-28 18:52:00', d: 0 },
            { t: '2021-04-28 18:53:00', d: 0 },
            { t: '2021-04-28 18:54:00', d: 0 },
            { t: '2021-04-28 18:55:00', d: 0 },
            { t: '2021-04-28 18:56:00', d: 0 },
            { t: '2021-04-28 18:57:00', d: 0 },
            { t: '2021-04-28 18:58:00', d: 0 },
            { t: '2021-04-28 18:59:00', d: 0 },
            { t: '2021-04-28 19:00:00', d: 0 },
            { t: '2021-04-28 19:01:00', d: 0 },
            { t: '2021-04-28 19:02:00', d: 0 },
            { t: '2021-04-28 19:03:00', d: '0.56' },
            { t: '2021-04-28 19:04:00', d: '1.43' },
            { t: '2021-04-28 19:05:00', d: '1.12' },
            { t: '2021-04-28 19:06:00', d: '1.38' },
            { t: '2021-04-28 19:07:00', d: '1.44' },
            { t: '2021-04-28 19:08:00', d: '1.57' },
            { t: '2021-04-28 19:09:00', d: '1.35' }
          ]
        }
      ],
      code: 'ok',
      msg: 'ok'
    },
    repl_lag: {
      data: [
        {
          statsType: 'repl_lag',
          createTime: 1620633775588,
          dataFlowId: '608940e76ea5330010a5e00e',
          granularity: 'flow_minute',
          statsData: [
            { t: '2021-04-28 18:50:00', d: 0 },
            { t: '2021-04-28 18:51:00', d: 0 },
            { t: '2021-04-28 18:52:00', d: 0 },
            { t: '2021-04-28 18:53:00', d: 0 },
            { t: '2021-04-28 18:54:00', d: 0 },
            { t: '2021-04-28 18:55:00', d: 0 },
            { t: '2021-04-28 18:56:00', d: 0 },
            { t: '2021-04-28 18:57:00', d: 0 },
            { t: '2021-04-28 18:58:00', d: 0 },
            { t: '2021-04-28 18:59:00', d: 0 },
            { t: '2021-04-28 19:00:00', d: 0 },
            { t: '2021-04-28 19:01:00', d: 0 },
            { t: '2021-04-28 19:02:00', d: 0 },
            { t: '2021-04-28 19:03:00', d: 0 },
            { t: '2021-04-28 19:04:00', d: 0 },
            { t: '2021-04-28 19:05:00', d: 0 },
            { t: '2021-04-28 19:06:00', d: 0 },
            { t: '2021-04-28 19:07:00', d: 0 },
            { t: '2021-04-28 19:08:00', d: 0 },
            { t: '2021-04-28 19:09:00', d: 0 }
          ]
        }
      ],
      code: 'ok',
      msg: 'ok'
    },
    data_overview: {
      data: [
        {
          statsType: 'data_overview',
          createTime: 1620633775572,
          dataFlowId: '608940e76ea5330010a5e00e',
          granularity: 'flow',
          statsData: {
            t: '2021-04-28 19:10:39',
            inputSize: 155625,
            outputSize: 155625,
            inputCount: 3320000,
            outputCount: 3320000
          }
        }
      ],
      code: 'ok',
      msg: 'ok'
    }
  }
}

const argv = process.argv

for (const url in service) {
  let mockData = service[url]
  app.all(url, (req, res) => {
    // 根据参入参数，处理
    switch (url) {
      case '/api/DataFlowInsights/runtimeMonitor':
        res
          .status(200)
          .end(JSON.stringify(Mock.mock(list[url][req.query?.statsType])))
        break
      case '/api/Settings':
        res.status(200).end(JSON.stringify(Mock.mock(mockData)))
        break
      default:
        res.status(200).end(JSON.stringify(Mock.mock(mockData)))
    }
  })
}

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
