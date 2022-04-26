const Mock = require('mockjs')
const Random = Mock.Random
const settings = require('./settings.json')
const dataflow = require('./dataflow.js')
const connection = require('./connection.js')
const messages = require('./messages.js')
const verification = require('./verification.js')
const metadata = require('./metadata.js')
const user = require('./user.js')

const agent = {
  id: '@guid',
  name: 'DRS_@id', // 实例名称
  region: 'CIDC-RP-@increment()', // 地域
  zone: 'CIDC-RP-@increment()-@increment()', // 可用区
  'status|+1': ['Creating', 'Running', 'Stopping', 'Stopped'], // 实例状态，参考《状态变迁》章节
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
    ],
    systemInfo: {
      cpus: 8,
      totalmem: 8412450816,
      installationDirectory: 'D:\\all\\agent\\test',
      ips: ['172.17.144.1', '192.168.2.18']
    }
  },
  tmInfo: {
    agentId: '@id',
    token: '@guid',
    downloadUrl: 'http://resource.tapdata.net/package/feagent/v1.0.2/',
    'updateStatus|1': ['preparing', 'downloading', 'upgrading', 'done', 'fail'],
    updateMsg: '',
    updateTime: '',
    'pingTime|1': [1626874131176, ''],
    updateVersion: 'v1.0.7-cloud-dev',
    progres: '@integer(0, 100)'
  },
  'agentType|1': ['Cloud', '']
}
module.exports = Object.assign({}, dataflow, connection, messages, verification, metadata, user, {
  '/tm/api/users/self': {
    data: {
      account_status: 1,
      accesscode: '54ef0f8245fef4bec05524bc9029efb8',
      username: '13025460560',
      email: '60b08aaea11ba4bb3f867142@custom.com',
      emailVerified: true,
      id: '60bed757ad41c00010b55152',
      userId: '60b08aaea11ba4bb3f867142',
      customId: '60b08aaea11ba4bb3f867142',
      isPrimary: '0',
      role: 0,
      user_id: '60bda0204c0811001009f41a',
      isCompleteGuide: true,
      last_updated: '2021-06-16T04:26:50.007Z',
      createTime: '2021-06-08T02:35:03.116Z',
      roleMappings: [
        {
          id: '60bed757ad41c00010b55153',
          principalType: 'USER',
          principalId: '60bed757ad41c00010b55152',
          roleId: '5cda998c39a8c094a56811cf',
          role: {
            description: 'default role for cloud users',
            name: 'cloud default',
            register_user_default: true,
            user_id: null,
            id: '5cda998c39a8c094a56811cf',
            modified: '2021-07-23T08:44:01.029Z',
            created: '2021-07-23T08:44:01.029Z'
          }
        },
        {
          id: '60bed757ad41c00010b55154',
          principalType: 'USER',
          principalId: '60bed757ad41c00010b55152',
          roleId: '5d31ae1ab953565ded04badd',
          role: {
            created: '2021-06-07T11:22:39.175Z',
            description: '新注册用户的默认角色',
            modified: '2021-07-22T07:39:42.745Z',
            name: '新用户默认角色',
            register_user_default: true,
            user_id: '60bda0204c0811001009f41a',
            id: '5d31ae1ab953565ded04badd'
          }
        }
      ],
      guideData: {
        noShow: true,
        updateTime: 1627288426187,
        action: false
      }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/tm/api/users/:id': {
    code: 'ok',
    msg: 'ok',
    data: {}
  },
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
  '/api/tcm/agent/delete/:id': {
    code: 'ok',
    data: {},
    msg: ''
  },
  '/api/tcm/agent/stop/:id': {
    code: 'ok',
    data: {},
    msg: ''
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
  '/api/tcm/orders/cancel': {
    code: 'ok',
    msg: 'ok',
    data: {}
  },
  '/api/tcm/connection/delete': {
    code: 'ok',
    msg: 'ok',
    data: {}
  },
  '/api/tcm/orders': {
    code: 'ok',
    data: {
      payMode: 'POSTPAID', // PREPAID-预付费 POSTPAID-后付费 REVIEW_POSTPAID-审批后付费
      orderId: '@guid',
      agentId: '@guid'
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
      total: Random.integer(1, 20),
      'items|1-20': [agent]
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
    data: [
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011537363073',
            chaGroupName: '单向同步-小规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '4' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '2'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001313', templateName: '单向同步-小规格' }],
            measureDesc: '单向同步-小规格按周期收费-',
            measureId: '9202059001',
            measureName: '单向同步-小规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013130001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '单向同步-小规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '400',
                tempId: 3.100001313e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013130002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001313e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-小规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001313e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011537363073',
            chaGroupName: '单向同步-小规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '4' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '2'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001344', templateName: '单向同步-小规格' }],
            measureDesc: '单向同步-小规格按量收费',
            measureId: '9202059032',
            measureName: '单向同步-小规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013440002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001344e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013440004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '单向同步-小规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '0.84',
                tempId: 3.100001344e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013440003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001344e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013440005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001344e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013440006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001344e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013440007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001344e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013440008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '单向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001344e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-小规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001344e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013440001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '单向同步-小规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000976',
                tempId: 3.100001344e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011538453074',
            chaGroupName: '单向同步-标准规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '8' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '4'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001328', templateName: '单向同步-标准规格' }],
            measureDesc: '单向同步-标准规格按周期收费',
            measureId: '9202059016',
            measureName: '单向同步-标准规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013280001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '单向同步-标准规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '850',
                tempId: 3.100001328e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013280002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001328e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-标准规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001328e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011538453074',
            chaGroupName: '单向同步-标准规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '8' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '4'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001343', templateName: '单向同步-标准规格' }],
            measureDesc: '单向同步-标准规格按量收费',
            measureId: '9202059031',
            measureName: '单向同步-标准规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013430002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001343e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013430004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '单向同步-标准规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '1.78',
                tempId: 3.100001343e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013430003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001343e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013430005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001343e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013430006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001343e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013430007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001343e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013430008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '单向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001343e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-标准规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001343e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013430001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '单向同步-标准规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000975',
                tempId: 3.100001343e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011538473076',
            chaGroupName: '单向同步-大规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '32' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '16'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [
              { templateCode: '7000000028', templateId: '3100001327', templateName: '单向同步-大规格按周期收费' }
            ],
            measureDesc: '单向同步-大规格按周期收费',
            measureId: '9202059015',
            measureName: '单向同步-大规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013270001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '单向同步-大规格按周期收费',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '1780',
                tempId: 3.100001327e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013270002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '单向同步-大规格按周期收费',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001327e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-大规格按周期收费',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001327e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011538473076',
            chaGroupName: '单向同步-大规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '32' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '16'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001342', templateName: '单向同步-大规格' }],
            measureDesc: '单向同步-大规格按量收费',
            measureId: '9202059030',
            measureName: '单向同步-大规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013420002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '单向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001342e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013420004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '单向同步-大规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '3.71',
                tempId: 3.100001342e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013420003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '单向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001342e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013420005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '单向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001342e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013420006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '单向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001342e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013420007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '单向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001342e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013420008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '单向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001342e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-大规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001342e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013420001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '单向同步-大规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000974',
                tempId: 3.100001342e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011638343094',
            chaGroupName: '单向同步-中规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '16' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '8'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001326', templateName: '单向同步-中规格' }],
            measureDesc: '单向同步-中规格按周期收费',
            measureId: '9202059014',
            measureName: '单向同步-中规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013260001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '单向同步-中规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '1190',
                tempId: 3.100001326e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013260002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001326e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-中规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001326e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011638343094',
            chaGroupName: '单向同步-中规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '16' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '单向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '8'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001341', templateName: '单向同步-中规格' }],
            measureDesc: '单向同步-中规格按量收费',
            measureId: '9202059029',
            measureName: '单向同步-中规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013410002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001341e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013410004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '单向同步-中规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '2.48',
                tempId: 3.100001341e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013410003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001341e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013410005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001341e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013410006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001341e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013410007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001341e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013410008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '单向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001341e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '单向同步-中规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001341e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013410001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '单向同步-中规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000973',
                tempId: 3.100001341e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011642583103',
            chaGroupName: '双向同步-小规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '4' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '2'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001317', templateName: '双向同步-小规格' }],
            measureDesc: '双向同步-小规格按周期收费',
            measureId: '9202059005',
            measureName: '双向同步-小规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013170001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '双向同步-小规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '800',
                tempId: 3.100001317e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013170002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001317e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-小规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001317e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011642583103',
            chaGroupName: '双向同步-小规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '4' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '2'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001332', templateName: '双向同步-小规格' }],
            measureDesc: '双向同步-小规格按量收费',
            measureId: '9202059020',
            measureName: '双向同步-小规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013320002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001332e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013320004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '双向同步-小规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '1.68',
                tempId: 3.100001332e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013320003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001332e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013320005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001332e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013320006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001332e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013320007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001332e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013320008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '双向同步-小规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001332e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-小规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001332e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013320001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '双向同步-小规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000964',
                tempId: 3.100001332e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011642593104',
            chaGroupName: '双向同步-标准规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '8' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '4'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001316', templateName: '双向同步-标准规格' }],
            measureDesc: '双向同步-标准规格按周期收费',
            measureId: '9202059004',
            measureName: '双向同步-标准规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013160001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '双向同步-标准规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '1700',
                tempId: 3.100001316e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013160002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001316e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-标准规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001316e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011642593104',
            chaGroupName: '双向同步-标准规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '8' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '4'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001331', templateName: '双向同步-标准规格' }],
            measureDesc: '双向同步-标准规格按量收费',
            measureId: '9202059019',
            measureName: '双向同步-标准规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013310002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001331e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013310004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '双向同步-标准规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '3.56',
                tempId: 3.100001331e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013310003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001331e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013310005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001331e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013310006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001331e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013310007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001331e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013310008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '双向同步-标准规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001331e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-标准规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001331e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013310001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '双向同步-标准规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000963',
                tempId: 3.100001331e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011643003105',
            chaGroupName: '双向同步-大规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '32' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '16'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001315', templateName: '双向同步-大规格' }],
            measureDesc: '双向同步-大规格按周期收费',
            measureId: '9202059003',
            measureName: '双向同步-大规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013150001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '双向同步-大规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '3560',
                tempId: 3.100001315e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013150002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001315e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-大规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001315e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011643003105',
            chaGroupName: '双向同步-大规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '32' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '16'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001330', templateName: '双向同步-大规格' }],
            measureDesc: '双向同步-大规格按量收费',
            measureId: '9202059018',
            measureName: '双向同步-大规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013300002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.10000133e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013300004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '双向同步-大规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '7.42',
                tempId: 3.10000133e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013300003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.10000133e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013300005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.10000133e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013300006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.10000133e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013300007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.10000133e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013300008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '双向同步-大规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.10000133e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-大规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.10000133e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013300001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '双向同步-大规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000962',
                tempId: 3.10000133e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011643023106',
            chaGroupName: '双向同步-中规格',
            chargeType: '2',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '16' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '8'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000028', templateId: '3100001314', templateName: '双向同步-中规格' }],
            measureDesc: '双向同步-中规格按周期收费',
            measureId: '9202059002',
            measureName: '双向同步-中规格按周期收费',
            measureType: '1',
            measureUnit: 'month',
            paraList: [
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '收费金额（元）',
                paraId: '31000013140001',
                paraKind: 'F',
                paraName: '收费金额（元）',
                paraRemark: '双向同步-中规格',
                paraType: '1',
                paraUnit: '元/月',
                paraValue: '2380',
                tempId: 3.100001314e9,
                templateParaNumber: '90000101'
              },
              {
                defaultValue: '0',
                paraDesc: '收费周期',
                paraId: '31000013140002',
                paraKind: '',
                paraName: '收费周期',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001314e9,
                templateParaNumber: '90000102'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-中规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001314e9,
                templateParaNumber: '90000103'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      },
      {
        ebossOfferChaList: [
          { canEmpty: '0', canModify: '1', characterId: '0000000030', characterName: '资源池', characterValue: '' },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000021',
            characterName: '审批流程实例ID',
            characterValue: ''
          },
          {
            canEmpty: '0',
            canModify: '1',
            characterId: '0000000001',
            characterName: '基础产品订购实例ID',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '1',
            characterId: '0000000019',
            characterName: '移动云子账号',
            characterValue: ''
          },
          {
            canEmpty: '1',
            canModify: '0',
            characterId: '0000000022',
            characterName: '移动云产品订购实例ID',
            characterValue: ''
          }
        ],
        pays: [
          {
            chaGroupId: '2102011643023106',
            chaGroupName: '双向同步-中规格',
            chargeType: '1',
            configList: [
              { configCode: 'memory', configId: '2000000077', configName: '内存', configValue: '16' },
              {
                configCode: 'drsNodeCpu',
                configId: '2000001012',
                configName: '传输方式',
                configValue: '双向同步（同区域）'
              },
              {
                configCode: 'nodeKernelSpecification',
                configId: '2000002188',
                configName: 'CPU核数',
                configValue: '8'
              },
              { configCode: 'productOrderNum', configId: '2000002310', configName: '数量 x ', configValue: '1' }
            ],
            ladderList: [{ templateCode: '7000000030', templateId: '3100001329', templateName: '双向同步-中规格' }],
            measureDesc: '双向同步-中规格按量收费',
            measureId: '9202059017',
            measureName: '双向同步-中规格按量收费',
            measureType: '2',
            measureUnit: '1',
            paraList: [
              {
                defaultValue: '0',
                paraDesc: '按哪种类型进行计费',
                paraId: '31000013290002',
                paraKind: 'C',
                paraName: '计费量类型',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '2',
                tempId: 3.100001329e9,
                templateParaNumber: '90000302'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '',
                paraId: '31000013290004',
                paraKind: 'C',
                paraName: '单价金额（元）',
                paraRemark: '双向同步-中规格',
                paraType: '1',
                paraUnit: '元/小时',
                paraValue: '4.96',
                tempId: 3.100001329e9,
                templateParaNumber: '90000304'
              },
              {
                defaultValue: '0',
                paraDesc: '话单中使用的使用量单位',
                paraId: '31000013290003',
                paraKind: 'C',
                paraName: '话单中使用量单位',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '11',
                tempId: 3.100001329e9,
                templateParaNumber: '90000303'
              },
              {
                defaultValue: '0',
                paraDesc: '实际的使用量单位',
                paraId: '31000013290005',
                paraKind: 'C',
                paraName: '单价计费单位',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '4',
                tempId: 3.100001329e9,
                templateParaNumber: '90000305'
              },
              {
                defaultValue: '0',
                paraDesc: '配合单价进行计费的单位的数量，如5元/10分钟，单位数量填10',
                paraId: '31000013290006',
                paraKind: 'C',
                paraName: '单价计费单位数量',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '1',
                tempId: 3.100001329e9,
                templateParaNumber: '90000306'
              },
              {
                defaultValue: '0',
                paraDesc: '使用量按哪种周期进行累计',
                paraId: '31000013290007',
                paraKind: 'C',
                paraName: '使用量累计周期',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001329e9,
                templateParaNumber: '90000307'
              },
              {
                defaultValue: '0',
                paraDesc: '对单价单位数量属性的取整',
                paraId: '31000013290008',
                paraKind: 'C',
                paraName: '取整方式',
                paraRemark: '双向同步-中规格',
                paraType: '',
                paraUnit: '',
                paraValue: '0',
                tempId: 3.100001329e9,
                templateParaNumber: '90000308'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc: '折扣（%）',
                paraId: '30032',
                paraKind: 'D',
                paraName: '折扣（%）',
                paraRemark: '双向同步-中规格',
                paraType: '2',
                paraUnit: '%',
                paraValue: '100',
                tempId: 3.100001329e9,
                templateParaNumber: '90000309'
              },
              {
                defaultValue: '0',
                paraCode: '陆超超 import',
                paraDesc:
                  '移动云平台在新场景配置时按序列自动生成，与话单中填写的chargemode保持一致。话单中不填时配置空',
                paraId: '31000013290001',
                paraKind: 'C',
                paraName: '话单类型',
                paraRemark: '双向同步-中规格',
                paraType: '5',
                paraUnit: '',
                paraValue: '11000961',
                tempId: 3.100001329e9,
                templateParaNumber: '90000301'
              }
            ],
            templateList: []
          }
        ],
        poolId: 'CIDC-RP-33',
        poolName: 'CIDC-RP-33=华东-上海1',
        productType: 'eclouddrs',
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        serviceListId: '',
        serviceName: '数据库复制DRS'
      }
    ]
  },
  '/api/tcm/productRelease/deploy/:agentId': {
    reqId: 'a5d27040-92d5-4fbc-9604-79bfe7fb35ef',
    code: 'ok',
    data: {
      downloadUrl: 'http://resource.tapdata.net/package/feagent/dfs-v1.0.4-072701-test/',
      links: [
        {
          os: 'windows',
          command:
            'tapdata start backend --downloadUrl http://resource.tapdata.net/package/feagent/dfs-v1.0.4-072701-test/ --token a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1ZzYUNHGRnJEk2X4G9sJmnxSNEx9s4VxUiCqtYEHZsby8CdqzyKRV+X1Oji+FmTnLB3ZIixKS7ZNhQBwHnT4walzeJC82LVUMnNUoaR5kaMTY7ckbUhdcxVrnuCTNgbQl55LgOPp4wUnwaT0gCU25fr3K9z5UB1xedPbvCvLk9WG9Ow0k3TSdx/WoKrpcJ0lSkEWZGd16lAvp9KJTQcKsP17bsMb+HDeEE1ZyYQ9tQcvOUzemzRFDdk+M+HHrBNTV3bJ7ejoLXRMTceWq9XRYL8Vtbg97gwUKJxICzeXTWB087K8l0HbHj4iVXiJK4t/WjaB6ZC2MvSxEhkmiLFxbhVK9Oalb3Xkas5J00uIGfosfdCh6sSJHXGMgVj2IclpMybspGG/kUM5o6alv+sMe6Qfu7LPzNGD/iuDnGuj2DPHCt3RRixVA+bGDENd5xheMdS0sTuM9Sqzs86CGJ+dicVCAmtsmFKrof9Q3V8MWkBtCK1V4RPvaUaFBo3pPNIoFKK5XxIZ880WiQf2eb5j8/uc9vKecCCjIbHgM+FrbFNf'
        },
        {
          os: 'linux',
          command:
            "wget 'http://resource.tapdata.net/package/feagent/dfs-v1.0.4-072701-test/tapdata' && chmod +x tapdata && ./tapdata start backend --downloadUrl http://resource.tapdata.net/package/feagent/dfs-v1.0.4-072701-test/ --token a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1ZzYUNHGRnJEk2X4G9sJmnxSNEx9s4VxUiCqtYEHZsby8CdqzyKRV+X1Oji+FmTnLB3ZIixKS7ZNhQBwHnT4walzeJC82LVUMnNUoaR5kaMTY7ckbUhdcxVrnuCTNgbQl55LgOPp4wUnwaT0gCU25fr3K9z5UB1xedPbvCvLk9WG9Ow0k3TSdx/WoKrpcJ0lSkEWZGd16lAvp9KJTQcKsP17bsMb+HDeEE1ZyYQ9tQcvOUzemzRFDdk+M+HHrBNTV3bJ7ejoLXRMTceWq9XRYL8Vtbg97gwUKJxICzeXTWB087K8l0HbHj4iVXiJK4t/WjaB6ZC2MvSxEhkmiLFxbhVK9Oalb3Xkas5J00uIGfosfdCh6sSJHXGMgVj2IclpMybspGG/kUM5o6alv+sMe6Qfu7LPzNGD/iuDnGuj2DPHCt3RRixVA+bGDENd5xheMdS0sTuM9Sqzs86CGJ+dicVCAmtsmFKrof9Q3V8MWkBtCK1V4RPvaUaFBo3pPNIoFKK5XxIZ880WiQf2eb5j8/uc9vKecCCjIbHgM+FrbFNf"
        },
        {
          os: 'docker',
          command:
            "docker run -itd ccr.ccs.tencentyun.com/tapdata/dfs-flow-engine:v1.0.4-072701 'tapdata start backend  --token a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1ZzYUNHGRnJEk2X4G9sJmnxSNEx9s4VxUiCqtYEHZsby8CdqzyKRV+X1Oji+FmTnLB3ZIixKS7ZNhQBwHnT4walzeJC82LVUMnNUoaR5kaMTY7ckbUhdcxVrnuCTNgbQl55LgOPp4wUnwaT0gCU25fr3K9z5UB1xedPbvCvLk9WG9Ow0k3TSdx/WoKrpcJ0lSkEWZGd16lAvp9KJTQcKsP17bsMb+HDeEE1ZyYQ9tQcvOUzemzRFDdk+M+HHrBNTV3bJ7ejoLXRMTceWq9XRYL8Vtbg97gwUKJxICzeXTWB087K8l0HbHj4iVXiJK4t/WjaB6ZC2MvSxEhkmiLFxbhVK9Oalb3Xkas5J00uIGfosfdCh6sSJHXGMgVj2IclpMybspGG/kUM5o6alv+sMe6Qfu7LPzNGD/iuDnGuj2DPHCt3RRixVA+bGDENd5xheMdS0sTuM9Sqzs86CGJ+dicVCAmtsmFKrof9Q3V8MWkBtCK1V4RPvaUaFBo3pPNIoFKK5XxIZ880WiQf2eb5j8/uc9vKecCCjIbHgM+FrbFNf'"
        }
      ]
    }
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
  '/api/tcm/orders/checkAgent': {
    reqId: '1f3d1e66-a3f9-4a81-b844-2592c8618978',
    code: 'ok',
    data: {
      // agentId: '621dd6a54970eb5f888b650a',
      deployInfo: {
        downloadUrl: 'http://resource.tapdata.net/package/feagent/dfs-v2.1.0-22022705/',
        links: [
          {
            os: 'windows',
            command:
              'a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1QyffbvacyCNlUtZCQx0C+88f4sdUFZHADy+yui595cioqtyyPpL6brC38mSHWK+FxYcZnqccStKX3m05nKNDt6Lh/30Pdm7fv3jqwvJtWomH6bUTiX+f1wI8nXv55VUJWaAOk2V/R2ZQ66aDo7ousyLHKD6hCz+UJiiG1hgc27DQe+bBxKoCycX7Pmsmd0V45V5WJpR9JPJlo6Ys+M77ZkPitKxmPvUoOGZFIIbRNxJDPPxjSvnsvoaK28O0pibl4fwDHkQ80CTAkPUFLok1I8+SQXhyzRbocR9Noas6jZ5yrq6M6z1+nh8xirmseiKYCI3EXiPuz5LatPWHiTC8uYoNe0ilu9Raf3bottTpfxUozBk8Y7SD7aD9XZR1z94LdRDJ67XNhXUm2Czx0fUiPItMYKiBJhfJcerpvDds1nQ0p95enCQHGzaAwuAJ8QLam3n/Y9cghGEecE/wUiBJljsfk4Vr2CXDRkfDPMGzwcvZohv3PhnE1kHK/E6jjSmdxu8zka+4ibbCcBOIF1406p6EtDUYRdAirikyHQFrNs1'
          },
          {
            os: 'linux',
            command:
              "wget 'http://resource.tapdata.net/package/feagent/dfs-v2.1.0-22022705/tapdata' && chmod +x tapdata && ./tapdata start backend --downloadUrl http://resource.tapdata.net/package/feagent/dfs-v2.1.0-22022705/ --token 'a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1QyffbvacyCNlUtZCQx0C+88f4sdUFZHADy+yui595cioqtyyPpL6brC38mSHWK+FxYcZnqccStKX3m05nKNDt6Lh/30Pdm7fv3jqwvJtWomH6bUTiX+f1wI8nXv55VUJWaAOk2V/R2ZQ66aDo7ousyLHKD6hCz+UJiiG1hgc27DQe+bBxKoCycX7Pmsmd0V45V5WJpR9JPJlo6Ys+M77ZkPitKxmPvUoOGZFIIbRNxJDPPxjSvnsvoaK28O0pibl4fwDHkQ80CTAkPUFLok1I8+SQXhyzRbocR9Noas6jZ5yrq6M6z1+nh8xirmseiKYCI3EXiPuz5LatPWHiTC8uYoNe0ilu9Raf3bottTpfxUozBk8Y7SD7aD9XZR1z94LdRDJ67XNhXUm2Czx0fUiPItMYKiBJhfJcerpvDds1nQ0p95enCQHGzaAwuAJ8QLam3n/Y9cghGEecE/wUiBJljsfk4Vr2CXDRkfDPMGzwcvZohv3PhnE1kHK/E6jjSmdxu8zka+4ibbCcBOIF1406p6EtDUYRdAirikyHQFrNs1'"
          },
          {
            os: 'docker',
            command:
              "docker run -itd tapdata-docker.pkg.coding.net/dfs/flow-engine/dfs-flow-engine:v2.1.0-22022705 /opt/agent/tapdata start backend  --token 'a/HZzXh5MDbwPGd8hCzZYYF0XXgDZ287oY34Sx3QAq5Z7zikkMRcI62kZHXq8RRJj6VrJcSY6ehw4iM8d8LW1QyffbvacyCNlUtZCQx0C+88f4sdUFZHADy+yui595cioqtyyPpL6brC38mSHWK+FxYcZnqccStKX3m05nKNDt6Lh/30Pdm7fv3jqwvJtWomH6bUTiX+f1wI8nXv55VUJWaAOk2V/R2ZQ66aDo7ousyLHKD6hCz+UJiiG1hgc27DQe+bBxKoCycX7Pmsmd0V45V5WJpR9JPJlo6Ys+M77ZkPitKxmPvUoOGZFIIbRNxJDPPxjSvnsvoaK28O0pibl4fwDHkQ80CTAkPUFLok1I8+SQXhyzRbocR9Noas6jZ5yrq6M6z1+nh8xirmseiKYCI3EXiPuz5LatPWHiTC8uYoNe0ilu9Raf3bottTpfxUozBk8Y7SD7aD9XZR1z94LdRDJ67XNhXUm2Czx0fUiPItMYKiBJhfJcerpvDds1nQ0p95enCQHGzaAwuAJ8QLam3n/Y9cghGEecE/wUiBJljsfk4Vr2CXDRkfDPMGzwcvZohv3PhnE1kHK/E6jjSmdxu8zka+4ibbCcBOIF1406p6EtDUYRdAirikyHQFrNs1'"
          }
        ]
      }
    }
  },
  '/tm/api/DatabaseTags/availableTags': {
    reqId: '8630a994-21c1-4dba-a1da-ae1bac64e4b5',
    ts: 1650080436214,
    code: 'ok',
    data: [
      { name: 'localDatabase', desc: '本地自建库' },
      { name: 'cloudDatabase', desc: '云数据库' },
      { name: 'mq', desc: '消息队列' },
      { name: 'nosql', desc: 'NoSQL数据库' },
      { name: 'saas', desc: 'SaaS应用' }
    ]
  }
})
