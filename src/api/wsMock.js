import EventEmitter from '../editor/lib/EventEmitter'
const Mock = require('mockjs')
const Random = Mock.Random

const rules = {
  logs: {
    data: [],
    dataFlowId: '230000200909260533',
    type: 'logs'
  },
  watch: {
    type: 'watch',
    data: {
      fullDocument: {
        'stats|1': Boolean,
        'status|1': [
          'draft',
          'error',
          'force stopping',
          'paused',
          'running',
          'scheduled',
          'stopping'
        ]
      }
    }
  },
  dataFlowInsight: {
    type: 'dataFlowInsight',
    collection: 'DataFlowInsight',
    createTime: 1620962829637,
    dataFlowId: '@id',
    granularity: {
      throughput: 'flow_minute',
      trans_time: 'flow_minute',
      repl_lag: 'flow_minute',
      data_overview: 'flow'
    },
    statsData: {
      data_overview: {
        deleteCount: Random.integer(0, 10000),
        deleteSize: Random.integer(0, 10000),
        inputCount: Random.integer(0, 10000),
        inputSize: Random.integer(0, 10000),
        insertCount: Random.integer(0, 10000),
        insertSize: Random.integer(0, 10000),
        outputCount: Random.integer(0, 10000),
        outputSize: Random.integer(0, 10000),
        t: '2021-04-25 17:46:59',
        updateCount: Random.integer(0, 10000),
        updateSize: Random.integer(0, 10000)
      },
      repl_lag: [
        { t: '2021-04-25 16:44:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:45:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:46:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:47:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:48:00', d: Random.integer(0, 100) }
      ],
      throughput: [
        {
          t: '2021-04-25 16:44:00',
          inputSize: Random.integer(0, 100),
          outputSize: Random.integer(0, 100),
          inputCount: Random.integer(0, 100),
          outputCount: Random.integer(0, 100)
        },
        {
          t: '2021-04-25 16:45:00',
          inputSize: Random.integer(0, 100),
          outputSize: Random.integer(0, 100),
          inputCount: Random.integer(0, 100),
          outputCount: Random.integer(0, 100)
        },
        {
          t: '2021-04-25 16:46:00',
          inputSize: Random.integer(0, 100),
          outputSize: Random.integer(0, 100),
          inputCount: Random.integer(0, 100),
          outputCount: Random.integer(0, 100)
        },
        {
          t: '2021-04-25 16:47:00',
          inputSize: Random.integer(0, 100),
          outputSize: Random.integer(0, 100),
          inputCount: Random.integer(0, 100),
          outputCount: Random.integer(0, 100)
        },
        {
          t: '2021-04-25 16:48:00',
          inputSize: Random.integer(0, 100),
          outputSize: Random.integer(0, 100),
          inputCount: Random.integer(0, 100),
          outputCount: Random.integer(0, 100)
        }
      ],
      trans_time: [
        { t: '2021-04-25 16:44:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:45:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:46:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:47:00', d: Random.integer(0, 100) },
        { t: '2021-04-25 16:48:00', d: Random.integer(0, 100) }
      ]
    }
  }
}
const defaultRes = {
  status: 'SUCCESS',
  result: {
    data: []
  }
}

export default class WSMock extends EventEmitter {
  constructor() {
    super()
  }
  // 连接
  connect() {}

  // 发送
  send(msg) {
    this.mockFunc(msg)
  }

  // 准备
  ready(cb) {
    cb?.()
  }

  // 获取agentId
  getAgentId() {}

  // 发送管道
  sendPipe() {}

  // 根据msg的内容模拟mock数据
  mockFunc(msg) {
    let timeout = 5000
    setInterval(() => {
      this.emit(msg?.type, Mock.mock(rules[msg?.type]) ?? defaultRes)
    }, timeout)
  }
}
