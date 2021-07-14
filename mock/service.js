const Mock = require('mockjs')
const Random = Mock.Random
const settings = require('./settings.json')
const product = require('./product.json')
const dataflow = require('./dataflow.js')
const connection = require('./connection.js')

const agent = {
  id: '@guid',
  name: 'DRS_@id', // 实例名称
  region: 'CIDC-RP-@increment()', // 地域
  zone: 'CIDC-RP-@increment()-@increment()', // 可用区

  'status|+1': [
    'Creating',
    'Running',
    'Stopping',
    'Stopped',
    'Error',
    'Freezing',
    'Freeze',
    'Restarting',
    'Recovering',
    'FreezeRecovering',
    'Altering',
    'WaitingAlter'
  ], // 实例状态，参考《状态变迁》章节
  freeTime: {
    // 可维护时间设置
    start: '@now',
    end: '@now'
  },

  spec: {
    'direction|1': ['unidirectional', 'bidirectional'], // 同步方向：unidirectional 单向；bidirectional 双向
    'region|1': ['same', 'different'], // 同地域是否相同：same-同资源池；different-跨资源池
    'specType|1': ['micro', 'small', 'medium', 'large'], // micro-微小，small-小，medium-中，large-大，self-自定义
    cpu: 2, // CPU 个数
    memory: 4, // 内存大小，单位 G
    version: 'dfs-v1.0.1-6-dev'
  },

  orderInfo: {
    'chargingMode|+1': ['1', '2'], // 计费模式: period:包周期计费;usageAmount:按使用量
    'periodType|+1': ['month', '1'], // 包周期类型，例如：once、month、year, 注意包年一次性的也是year
    duration: 1 // 订购时长
  },
  message: '', // 状态为异常时，显示错误消息
  customerId: '', // 客户id
  createAt: '@now', // 创建时间
  lastUpdAt: new Date(), // 最后更新时间
  createBy: '', // 创建用户ID
  lastUpdBy: '', // 最后更新用户ID
  metric: {
    runningTaskNum: '@integer(0, 10)',
    'dataFlows|1-10': [
      {
        id: '@id',
        name: '@name'
      }
    ]
  },
  tmInfo: {
    agentId: '@id',
    token: '@guid',
    downloadUrl: 'http://resource.tapdata.net/package/feagent/v1.0.2/'
  }
}
module.exports = Object.assign({}, dataflow, connection, {
  '/api/tcm/user': {
    code: 'ok',
    message: '获取用户信息失败',
    data: {
      //mock用户
      token:
        'Y3VzdG9tSWQ9Q0lEQy1BLWJkMGQ1MDBkMDFkMTQ4N2JhMzk1ZDAxOTNkYWFkMjdjJnVzZXJJZD1DSURDLVUtY2Q4ZTAxYTMyNWVhNGViMGJjZjBiODNmOTczZDVkOWYmYWRtaW49MCZ1c2VybmFtZT15aXpoaWZlaWRpZTEyMw==',
      username: 'yizhifeidie123',
      customerType: '政企集团客户',
      nickname: '12345678902@123.com',
      type: 0,
      userStatus: 1
      //政企审批用户
      // customerId: 'CIDC-A-33c8abc00d474d96883e682f639cbb5f',
      // customerType: '政企集团客户',
      // id: 'CIDC-U-dfd6ef008f3d457cb22e81599a3da8af',
      // internetAccount: false,
      // isCustomer: 1,
      // nickname: 'dingyihui',
      // org: '12507fc57b414fddbc08495fac7835b0',
      // orgName: 'dingyihui',
      // token:
      // 	'Y3VzdG9tSWQ9Q0lEQy1BLTMzYzhhYmMwMGQ0NzRkOTY4ODNlNjgyZjYzOWNiYjVmJnVzZXJJZD1DSURDLVUtZGZkNmVmMDA4ZjNkNDU3Y2IyMmU4MTU5OWEzZGE4YWYmYWRtaW49MSZ1c2VybmFtZT1kaW5neWlodWlfaWFhcw==',
      // type: 0,
      // userStatus: '1.0',
      // username: 'dingyihui_iaas'
      //互联网用户1
      // customerId: 'CIDC-A-625c42caf2e041d3a331f5c62a2e884f',
      // customerType: '互联网客户',
      // id: 'CIDC-U-f71329d2def04d169de790dc842e7691',
      // internetAccount: true,
      // isCustomer: 1,
      // nickname: 'baomihua03@11.com',
      // org: 'ab49c8e869354a3c8cd2670d3017509d',
      // orgName: 'baomihua03@11.com',
      // token:
      // 	'Y3VzdG9tSWQ9Q0lEQy1BLTYyNWM0MmNhZjJlMDQxZDNhMzMxZjVjNjJhMmU4ODRmJnVzZXJJZD1DSURDLVUtZjcxMzI5ZDJkZWYwNGQxNjlkZTc5MGRjODQyZTc2OTEmYWRtaW49MSZ1c2VybmFtZT1iYW9taWh1YTAz',
      // type: 0,
      // userStatus: '1.0',
      // username: 'baomihua03'
      //互联网用户2
      // customerId: 'CIDC-A-2afe6bb0272b4cf3af650a2b478ebe78',
      // customerType: '互联网客户',
      // id: 'CIDC-U-d8373e9390fe449e825977e17db5bdea',
      // internetAccount: true,
      // isCustomer: 1,
      // nickname: '157214086882@163.com',
      // org: '322acb4864054007aedb1ccd841b48cb',
      // orgName: '集团',
      // token:
      // 	'Y3VzdG9tSWQ9Q0lEQy1BLTJhZmU2YmIwMjcyYjRjZjNhZjY1MGEyYjQ3OGViZTc4JnVzZXJJZD1DSURDLVUtZDgzNzNlOTM5MGZlNDQ5ZTgyNTk3N2UxN2RiNWJkZWEmYWRtaW49MSZ1c2VybmFtZT16aG91c2h1eXVlMTIxMDAx',
      // type: 0,
      // userStatus: '1.0',
      // username: 'zhoushuyue121001'
    }
  },
  '/api/tcm/region': {
    code: 'ok',
    data: {
      'poolList|10-30': [
        () => {
          var poolId = 'CIDC-RP-' + Random.integer(1, 10)
          var area = Random.region()
          var city = Random.city()
          var zoneInfo = new Array(Random.integer(1, 3)).fill().map((i, index) => {
            return {
              zoneId: '@id',
              zoneName: city + (index + 1),
              zoneCode: poolId + '-' + (index + 1)
            }
          })
          return Mock.mock({
            poolId: poolId,
            zoneInfo: zoneInfo,
            poolArea: area,
            productType: 'eduverify',
            poolName: area + '-' + city
          })
        }
      ]
    }
  },
  '/api/tcm/agent/regionCount': {
    code: 'ok',
    data: () => {
      let map = {}
      new Array(Random.integer(4, 10)).fill().forEach((i, index) => {
        map['CIDC-RP-' + (index + 1)] = Random.integer(1, 20)
      })
      return map
    }
  },
  '/api/tcm/agent/regionZoneStatusCount': {
    code: 'ok',
    data: () => {
      let map = {}
      new Array(Random.integer(4, 10)).fill().forEach((i, index) => {
        let sMap = {}
        new Array(Random.integer(1, 5)).fill().forEach((i, sIndex) => {
          sMap['CIDC-RP-' + index + '-' + sIndex] = {
            Running: Random.integer(0, 10),
            Error: Random.integer(0, 10),
            Deleted: Random.integer(0, 10)
          }
        })
        map['CIDC-RP-' + index] = sMap
      })
      return map
    }
  },
  '/api/tcm/orders': {
    code: 'ok',
    data: {
      payMode: 'POSTPAID', // PREPAID-预付费 POSTPAID-后付费 REVIEW_POSTPAID-审批后付费
      orderId: '@guid'
    }
  },
  '/api/tcm/orders/prepare': {
    code: 'ok',
    data: {
      payLink: ''
    }
  },
  '/api/tcm/agent': {
    code: 'ok',
    data: {
      total: 1,
      items: [agent]
    }
  },
  '/api/tcm/agent/agentCount': {
    reqId: '77006b00-0afb-4ed5-acf4-916655e83e93',
    code: 'ok',
    data: { agentTotalCount: 4, agentRunningCount: 1, twoWayAgentRunningCount: 0 }
  },
  '/api/tcm/agent/:id': {
    code: 'ok',
    data: agent
  },
  '/api/tcm/product/:id': {
    reqId: '32d58465-2e03-4548-a8c4-c4e0102c6417',
    code: 'ok',
    data: product
  },
  '/api/tcm/productRelease/': {
    code: 'ok',
    data: {
      'items|10': [
        () => {
          return {
            productType: 'agent',
            lbsVersion: 'v1.19.0-1434-g2a5ff7efa' + Random.integer(0, 10),
            supportResPools: Random.integer(0, 10),
            enable: Random.boolean(),
            version: 'v1.19.0-1434-g2a5ff7efa' + Random.integer(0, 10),
            changeList: '上次更新版本是哈哈哈哈哈哈哈哈哈哈哈哈哈哈或或或或或或或或'
          }
        }
      ]
    }
  },
  '/tm/api/Workers/availableAgent': {
    data: {
      result: [
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172519,
          worker_type: 'connector',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        },
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172520,
          worker_type: 'transformer',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/clusterStates/updataAgent': {
    data: {
      status: '1'
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/clusterStates': {
    'data|0-10': [
      {
        id: '@id',
        systemInfo: {
          hostname: '@name',
          uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
          ip: '10.233.67.116',
          ips: ['10.233.67.116'],
          time: 1620812073175,
          accessCode: '<ACCESS_CODE>',
          username: '',
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278'
        },
        reportInterval: 20000,
        engine: { processID: ' 10491', 'status|1': ['running', 'stopped'] },
        management: { processID: ' 10484', 'status|1': ['running', 'stopped'] },
        apiServer: { processID: ' 10493', 'status|1': ['running', 'stopped'] },
        customMonitorStatus: [
          {
            uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
            id: '@id',
            name: '@name',
            command: '7',
            arguments: '',
            'status|1': ['stopped', 'running']
          }
        ],
        uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
        'status|1': ['running', 'down'],
        insertTime: '2021-05-12T09:34:33.176Z',
        ttl: '2021-05-12T09:35:13.176Z',
        last_updated: '2021-05-12T09:34:33.177Z',
        createTime: '2021-01-28T08:59:46.302Z',
        agentName: 'tapdaas-test2',
        custIP: '10.233.67.191',
        customMonitor: [
          {
            uuid: '568c765b-9bc0-4950-ba24-46fd48884980',
            id: '601a1434aa4cc500b3adf9cb',
            name: '7',
            command: '7',
            arguments: ''
          }
        ],
        updateTime: '2021-03-25T08:47:29.245Z',
        managementOperation: {
          _id: '60786d75252a040057bfaf10',
          status: 4,
          msg: '执行超时',
          operation: 'restart',
          ttl: 1618505127738
        },
        apiServerOperation: {
          _id: '604b3cf1fb4a8302ffe5e510',
          status: 4,
          msg: '执行超时',
          operation: 'start',
          ttl: 1615543576247
        },
        engineOperation: {
          _id: '6084e3b958c76a2315177468',
          status: 2,
          msg: '',
          operation: 'start',
          ttl: 1619321840158
        }
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/Settings': settings,
  '/api/tcm/config/version/latest/:id': {
    reqId: '064b73bf-639a-440b-a930-8b30d38febc3',
    code: 'ok',
    data: {
      version: 'v1.0.7-cloud-dev',
      tmServerUrl: 'http://192.168.1.182:30104/tm/api/',
      token: '@guid',
      downloadUrl: 'http://resource.tapdata.net/package/feagent/v1.0.2/'
    }
  },
  '/api/tcm/productRelease/:id': {
    reqId: '40948acc-789d-4da6-865f-985163bb01e8',
    code: 'ok',
    data: 'http://resource.tapdata.net/package/feagent/dfs-v1.19.0-543-g14662271f-test/'
  },
  '/tm/api/DatabaseTypes': {
    code: 'ok',
    data: []
  }
})
