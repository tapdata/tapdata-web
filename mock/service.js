const Mock = require('mockjs')
const Random = Mock.Random
const product = require('./ecloud_product.json')

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
		memory: 4 // 内存大小，单位 G
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
		agentId: '@id'
	}
}
module.exports = {
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
	'/api/tcm/product/status': {
		code: 'ok',
		data: '7'
	},
	'/api/tcm/product/:id': {
		code: 'ok',
		message: '系统错误',
		data: product
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
			total: 100,
			'items|10': [agent]
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
	}
}
