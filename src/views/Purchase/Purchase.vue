<template>
	<section class="purchase-wrapper" v-loading.fullscreen="!productMap || ($route.params.id && !agentInfo)">
		<Header :action="$route.name"></Header>
		<div class="main">
			<!-- 订购页 -->
			<template v-if="pageType === 'form'">
				<ElForm inline-message ref="form" label-position="left" label-width="180px" :model="form">
					<div class="panel" v-if="$route.params.id && agentInfo">
						<div class="panel-title">当前配置</div>
						<ul class="info-list">
							<li class="info-item">
								<span class="label">实例名称</span>
								<span class="value">{{ agentInfo.name }}</span>
							</li>
							<li class="info-item">
								<span class="label">实例ID</span>
								<span class="value">{{ $route.params.id }}</span>
							</li>
							<li class="info-item">
								<span class="label">地域及可用区</span>
								<span class="value">{{ agentInfo.regionFmt }} | {{ agentInfo.zoneFmt }}</span>
							</li>
							<li class="info-item">
								<span class="label">实例规格</span>
								<span class="value">{{ specMap[agentInfo.spec.specType] }}</span>
							</li>
							<li class="info-item">
								<span class="label">同步拓扑</span>
								<span class="value">{{ topologyMap[agentInfo.spec.direction].split('（')[0] }}</span>
							</li>
							<li class="info-item">
								<span class="label">计费模式</span>
								<span class="value">{{
									chargeMap[agentInfo.orderInfo.chargingMode + ',' + agentInfo.orderInfo.periodType]
								}}</span>
							</li>
							<li class="info-item">
								<span class="label">订购时间</span>
								<span class="value">{{ $moment(agentInfo.createAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
							</li>
							<li class="info-item" v-if="isInternet && agentInfo.orderInfo.periodType === 'month'">
								<span class="label">到期时间</span>
								<span class="value">{{ agentInfo.endTimeStr }}</span>
							</li>
						</ul>
					</div>
					<div class="panel" v-if="$route.name === 'Purchase'">
						<ElFormItem label="计费方式">
							<div class="form-item">
								<ElRadioGroup
									class="radio-button"
									:value="form.chargingMode + ',' + form.periodType"
									@input="handlerModeChange"
								>
									<ElRadioButton v-for="(value, key) in chargeMap" :key="value" :label="key">
										{{ value }}
									</ElRadioButton>
								</ElRadioGroup>
								<ElTooltip class="icon-tips" effect="dark" placement="right">
									<div slot="content">
										<template v-if="isInternet">
											<p>
												包月计费：属于预付费，即在新建实例时就需要支付“包月”费用。
											</p>
											<p>
												按量计费：属于后付费，即按小时扣费。从创建实例开始计费，到退订实例时结束计费。
											</p>
										</template>
										<template v-else>
											<p>
												包月计费：属于后付费，按月支付。从创建实例开始计费，到退订实例时结束计费；支持“按月”自动续订。
											</p>
											<p>
												按量计费：属于后付费，按小时扣费。从创建实例开始计费，到退订实例时结束计费；支持“按小时”自动续订。
											</p>
										</template>
										<ElLink style="font-size: 12px" type="primary" @click="toHelp()">了解更多</ElLink>
									</div>
									<img class="icon" src="@/assets/icons/question.svg" />
								</ElTooltip>
							</div>
						</ElFormItem>
						<ElFormItem label="地域及可用区">
							<div class="form-item">
								<ElSelect style="width: 240px" v-model="form.region" @change="regionChange()">
									<ElOptionGroup v-for="group in regionOptions" :key="group.label" :label="group.label">
										<ElOption
											v-for="option in group.options"
											:key="option.label"
											:label="option.label"
											:value="option.value"
										></ElOption>
									</ElOptionGroup>
								</ElSelect>
								<ElRadioGroup class="radio-button" style="margin-left: 3px" v-model="form.zone">
									<ElRadioButton v-for="option in zoneOptions" :key="option.label" :label="option.value">
										{{ option.label }}
									</ElRadioButton>
								</ElRadioGroup>
								<ElTooltip class="icon-tips" effect="dark" placement="right">
									<div slot="content">
										<p style="max-width: 400px">
											可用区：同一地域内独立的物理区域，电力和网络均互相独立的物理数据中心，可以保障可用区间系统性故障的相互隔离
										</p>
									</div>
									<img class="icon" src="@/assets/icons/question.svg" />
								</ElTooltip>
							</div>
							<p class="form-item-tips">
								不同地域的实例之间内网互不相通；选择靠近目标数据库的地域，可降低网络时延、提高目标数据库的访问速度。实例订购后不支持更换地域，请谨慎选择。
							</p>
						</ElFormItem>
					</div>
					<div class="panel" v-if="$route.name !== 'Renew'">
						<div class="panel-title mb-5" v-if="$route.name === 'Modify'">
							变更配置
						</div>
						<ElFormItem label="同步拓扑">
							<ElRadioGroup class="radio-button" :value="form.spec.direction" @input="handlerSyncChange">
								<ElRadioButton v-for="opt in topologyOptions" :key="opt.value" :label="opt.value">
									{{ opt.label }}
								</ElRadioButton>
							</ElRadioGroup>
							<p class="form-item-tips">
								双向同步仅支持 MongoDB to MongoDB 的同步
							</p>
						</ElFormItem>
						<ElFormItem label="实例规格">
							<ElRadioGroup class="radio-button" v-model="form.spec.specType">
								<ElRadioButton v-for="opt in specOptions" :key="opt.value" :label="opt.value" :disabled="opt.disabled">
									{{ opt.label }}
								</ElRadioButton>
							</ElRadioGroup>
						</ElFormItem>
						<ElFormItem required label="实例名称" prop="name" v-if="$route.name === 'Purchase'">
							<ElInput style="width: 400px" v-model="form.name" maxlength="32" minlength="1"></ElInput>
							<p class="form-item-tips">长度限制1～32个字符</p>
						</ElFormItem>
					</div>
					<div class="panel" v-if="$route.name === 'Purchase'">
						<ElFormItem label="订购时长" v-if="isInternet && form.periodType === 'month'">
							<ElRadioGroup v-model="form.duration">
								<template v-for="index in 12">
									<ElRadioButton :key="index" :label="index" :class="{ 'second-line': index > 8 }"
										>{{ index }}个月</ElRadioButton
									>
									<br :key="'br' + index" v-if="index === 8" />
								</template>
							</ElRadioGroup>
						</ElFormItem>
						<ElFormItem label="订购实例数量">
							<span style="font-size: 12px">1个</span>
						</ElFormItem>
					</div>
					<div class="panel" v-if="$route.name === 'Renew'">
						<div class="panel-title mb-5">续订配置</div>
						<ElFormItem label="续订时长">
							<ElRadioGroup v-model="form.duration">
								<template v-for="index in 12">
									<ElRadioButton :key="index" :label="index" :class="{ 'second-line': index > 8 }"
										>{{ index }}个月</ElRadioButton
									>
									<br :key="'br' + index" v-if="index === 8" />
								</template>
							</ElRadioGroup>
						</ElFormItem>
						<ElFormItem label="续订后到期时间">
							<span style="font-size: 12px; color: #f04134">{{ invalidTimeAfterRenew }}</span>
						</ElFormItem>
					</div>
				</ElForm>
			</template>
			<!-- 确认页 -->
			<template v-if="pageType === 'confirm'">
				<div class="confirm-top">
					<ElButton class="btn-back" size="mini" @click="pageType = 'form'">
						<i class="iconfont td-icon-fanhui"></i>
					</ElButton>
					<ElLink style="font-size: 14px; margin-left: 3px" type="primary" @click="pageType = 'form'">
						修改配置
					</ElLink>
				</div>
				<div class="panel">
					<ElTable ref="table" :data="[{}]">
						<ElTableColumn>
							<div slot="header" style="padding-left: 20px">产品名称</div>
							<template>
								<div style="padding-left: 20px">
									数据库复制DRS
									<span v-if="$route.name === 'Modify'">规格变更</span><span v-if="$route.name === 'Renew'">续订</span>
								</div>
							</template>
						</ElTableColumn>
						<ElTableColumn label="配置信息" min-width="150px">
							<template>
								<div class="props-item">
									<span class="label">地域及可用区</span>
									<span class="value">{{ regionMap[form.region] }} | {{ zoneMap[form.zone] }}</span>
								</div>
								<div class="props-item">
									<span class="label">同步拓扑</span>
									<span class="value">
										{{ topologyMap[form.spec.direction].split('（')[0] }}
									</span>
								</div>
								<div class="props-item">
									<span class="label">实例规格</span>
									<span class="value">
										{{ specMap[form.spec.specType] }}
									</span>
								</div>
								<div class="props-item">
									<span class="label">实例名称</span>
									<span class="value">{{ form.name }}</span>
								</div>
							</template>
						</ElTableColumn>
						<ElTableColumn label="实例数量">
							<template>1</template>
						</ElTableColumn>
						<ElTableColumn label="计费模式">
							<template>{{ chargeMap[form.chargingMode + ',' + form.periodType] }}</template>
						</ElTableColumn>
						<ElTableColumn
							label="时长"
							v-if="user.customerType !== '政企集团客户' && form.periodType === 'month' && $route.name !== 'Modify'"
						>
							<template>{{ form.duration }}个月</template>
						</ElTableColumn>
						<ElTableColumn label="单价">
							<template>
								<div style="color: #f04134">
									<span>￥{{ price }}</span>
									<span> {{ unit }}</span>
								</div>
							</template>
						</ElTableColumn>
					</ElTable>
				</div>
				<div class="panel confirm-footer">
					<div>
						<span>费用合计</span>
						<span class="price">￥{{ price }}</span>
						<span v-show="form.chargingMode === '2'">/小时</span>
					</div>
					<div class="agreement">
						<ElCheckbox style="vertical-align: middle" v-model="agree">
							我已阅读并同意
						</ElCheckbox>
						<ElLink size="mini" type="primary" @click="toDoc()">《移动云产品销售协议》</ElLink>
					</div>
					<ElButton style="margin-top: 10px" type="primary" @click="submit()">
						确认购买
					</ElButton>
				</div>
			</template>
			<div class="footer" v-if="pageType === 'form'">
				<div class="info">
					<div>
						<span>费用合计</span>
						<span class="price">￥{{ price }}</span>
						<span> {{ unit }}</span>
					</div>
					<div class="price-tips">
						<span>参考价格，具体扣费请以账单为准。</span>
						<ElLink style="font-size: 12px" type="primary" @click="toChargeDetails()">了解计费详情</ElLink>
					</div>
				</div>
				<ElButton type="primary" @click="toConfirm()">确认订单</ElButton>
			</div>
		</div>
	</section>
</template>

<script>
import Header from './Header'
import { TOPOLOGY_MAP, SPEC_MAP, CHARGE_MAP } from '../../const'
import { toDecimal2 } from '../../util'
const getProductKey = item => {
	return ['chargingMode', 'periodType', 'specType', 'topology'].map(key => item[key]).join('_')
}
export default {
	components: {
		Header
	},
	data() {
		return {
			isInternet: window.__USER_INFO__.isInternet,
			pageType: 'form', //form 表单， confirm 确认页
			agentInfo: null,
			form: {
				region: '',
				zone: '',
				spec: {
					direction: 'unidirectional', // 同步方向：unidirectional 单向；bidirectional 双向
					region: 'same', // 同地域是否相同：same-同资源池；different-跨资源池
					specType: 'medium' // micro-微小，small-小，medium-中，large-大，self-自定义
				},
				name: 'DRS_' + this.$moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 16 * 1000),
				serviceId: '',
				groupId: '',
				measureId: '',
				periodType: 'month',
				duration: 1,
				chargingMode: '1',
				agentType: 'Cloud'
			},
			regionOptions: [],
			zoneOptions: [],
			chargeMap: CHARGE_MAP,
			topologyMap: TOPOLOGY_MAP,
			specMap: SPEC_MAP,
			agree: false,
			productMap: null,
			regionMap: {},
			zoneMap: {}
		}
	},
	computed: {
		price() {
			let product = this.getProductInfo()
			let price = product ? product.price : 0
			return toDecimal2(price * this.form.duration)
		},
		unit() {
			return this.form.chargingMode === '2' ? '/小时' : '/月'
		},
		user() {
			return window.__USER_INFO__ || {}
		},
		topologyOptions() {
			let arr = []
			for (const key in TOPOLOGY_MAP) {
				const value = TOPOLOGY_MAP[key]
				arr.push({
					label: value.split('（')[0],
					value: key
				})
			}
			return arr
		},
		invalidTimeAfterRenew() {
			if (this.agentInfo && this.agentInfo.endTime) {
				let date = new Date(this.agentInfo.endTime)
				date.setMonth(date.getMonth() + this.form.duration)
				return this.$moment(date).format('YYYY-MM-DD')
			}
			return '-'
		},
		specOptions() {
			let arr = []
			let disabled = this.$route.name === 'Modify'
			let agentInfo = this.agentInfo || {}
			let spec = agentInfo.spec || {}
			for (const key in SPEC_MAP) {
				if (spec.specType === key) {
					disabled = false
				}
				arr.push({
					label: SPEC_MAP[key],
					value: key,
					disabled: disabled
				})
			}
			return arr
		}
	},
	created() {
		let id = this.$route.params.id

		this.getRegion((regionMap, zoneMap) => {
			this.regionMap = regionMap
			this.zoneMap = zoneMap
			if (id) {
				this.getInstance(id, regionMap, zoneMap)
			}
		})
	},
	methods: {
		getInstance(id, regionMap, zoneMap) {
			this.$axios.get('api/tcm/agent/' + id).then(data => {
				let orderInfo = data.orderInfo
				let spec = data.spec || {}
				spec = {
					direction: spec.direction,
					region: spec.region,
					specType: spec.specType
				}
				this.form = {
					region: data.region,
					zone: data.zone,
					spec: Object.assign({}, spec),
					name: data.name,
					periodType: orderInfo.periodType,
					duration: orderInfo.duration,
					chargingMode: orderInfo.chargingMode,
					serviceId: orderInfo.serviceId,
					groupId: orderInfo.groupId,
					measureId: orderInfo.measureId
				}
				this.agentInfo = data
				this.agentInfo.spec = spec
				this.agentInfo.regionFmt = regionMap[data.region] || data.region
				this.agentInfo.zoneFmt = zoneMap[data.zone] || data.zone
				this.agentInfo.endTimeStr = data.endTime ? this.$moment(data.endTime).format('YYYY-MM-DD') : ''
			})
		},
		getRegion(cb) {
			this.$axios
				.get('api/tcm/region')
				.then(data => {
					let regionOptions = []
					let zoneOptionsMap = {}
					let regionMap = {}
					let zoneMap = {}
					if (data && data.poolList) {
						data.poolList.forEach(item => {
							let parent = regionOptions.find(it => it.label === item.poolArea)
							if (!parent) {
								parent = {
									label: item.poolArea,
									options: []
								}
								regionOptions.push(parent)
							}
							parent.options.push({
								label: item.poolName,
								value: item.poolId
							})
							zoneOptionsMap[item.poolId] = item.zoneInfo.map(z => {
								zoneMap[z.zoneCode] = z.zoneName
								return {
									label: z.zoneName,
									value: z.zoneCode
								}
							})
							regionMap[item.poolId] = item.poolName
						})
					}
					this.regionOptions = regionOptions
					this.zoneOptionsMap = zoneOptionsMap
					if (regionOptions.length) {
						this.form.region = regionOptions[0].options[0].value
						this.getZone()
						this.getProduct()
					}
					cb && cb(regionMap, zoneMap)
				})
				.catch(e => {
					console.error(e)
					this.$router.replace('/500')
				})
		},
		getZone() {
			let zoneOptionsMap = this.zoneOptionsMap
			let options = zoneOptionsMap[this.form.region]
			this.zoneOptions = options
			if (options.length) {
				this.form.zone = options[0].value
			}
		},
		getProduct() {
			let id = this.form.region
			this.$axios
				.get(`api/tcm/product/${id}`)
				.then(data => {
					this.formatProductData(data)
					let product = this.getProductInfo()
					this.form.serviceId = product.serviceId
					this.form.groupId = product.groupId
					this.form.measureId = product.measureId
				})
				.catch(() => {
					this.$router.replace('/500')
				})
		},
		formatProductData(products) {
			let configMap = {
				2000002298: 'specType',
				2000001012: 'topology'
			}
			let productMap = {}
			for (let i = 0; i < products.length; i++) {
				let prod = products[i]
				let pay = prod.pays[0]
				let configList = pay.configList
				let item = {}
				for (let j = 0; j < configList.length; j++) {
					let config = configList[j]
					let key = configMap[config.configId]
					if (key) {
						item[key] = config.configValue
					}
				}
				item['chargingMode'] = pay.measureType
				item['periodType'] = pay.measureUnit
				let para = pay.paraList.find(it => it.paraType === '1')
				if (para) {
					productMap[getProductKey(item)] = {
						price: Number(para.paraValue),
						serviceId: prod.serviceId,
						groupId: pay.chaGroupId,
						measureId: pay.measureId
					}
				}
			}
			this.productMap = productMap
		},
		getProductInfo() {
			let form = this.form
			let { specType, direction, region } = form.spec
			if (this.productMap) {
				let key = getProductKey({
					specType: this.specMap[specType],
					topology: this.topologyMap[direction],
					chargingMode: form.chargingMode,
					periodType: form.periodType
				})
				return this.productMap[key]
			}
		},
		handlerModeChange(val) {
			let values = val.split(',')
			this.form.duration = 1
			this.form.periodType = values[1] || ''
			this.form.chargingMode = values[0]
		},
		regionChange() {
			this.form.zone = ''
			this.getZone()
			this.getProduct()
		},
		handlerSyncChange(val) {
			let values = val.split('_')
			this.form.spec.direction = values[0]
			this.form.spec.region = values[1]
		},
		toConfirm() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.$route.name === 'Modify' && JSON.stringify(this.form.spec) === JSON.stringify(this.agentInfo.spec)) {
						return this.$alert('该实例规格与所选规格一致', {
							type: 'warning',
							customClass: 'el-message-box--alert'
						})
					}
					this.pageType = 'confirm'
					this.$nextTick(() => {
						this.$refs.table.doLayout()
					})
				}
			})
		},
		submit() {
			if (this.agree) {
				let action = this.$route.name
				let method = {
					Purchase: 'buy',
					Modify: 'modify',
					Renew: 'renew'
				}
				const loading = this.$loading({
					fullscreen: true
				})
				let product = this.getProductInfo()
				this.form.serviceId = product.serviceId
				this.form.groupId = product.groupId
				this.form.measureId = product.measureId
				let successTips = '您的资源已经开始创建，预计需要几分钟时间，您可以到实例列表查看，并进行下一步操作。'
				this[method[action]]()
					.then(data => {
						if (!data.products || !data.products[0] || !data.products[0].orderExtId) {
							return this.toResult({
								type: 'fail',
								action: action
							})
						}
						let orderId = data.products[0].orderExtId
						if (data.payMode === 'PREPAID') {
							return this.toPay(orderId, action, successTips)
						} else {
							let result = {
								type: 'success',
								action: action,
								tips: successTips,
								orderId
							}
							if (data.payMode === 'REVIEW_POSTPAID') {
								result.successTitle = '审批中'
								result.tips = '您的订单正在审批中，请前往订单中心查看审批状态'
							}
							this.toResult(result)
						}
					})
					.catch(err => {
						let message = err.data ? err.data.message : '请求失败'
						this.toResult({
							type: 'fail',
							action: action,
							tips: '失败原因：' + message
						})
					})
					.finally(() => {
						loading.close()
					})
			} else {
				this.$alert('请先阅读并勾选服务协议', {
					type: 'warning',
					customClass: 'el-message-box--alert'
				})
			}
		},
		buy() {
			let params = Object.assign({}, this.form, {
				poolId: this.form.region
			})
			delete params.region
			return this.$axios.post('api/tcm/orders', params)
		},
		modify() {
			let { spec, serviceId, groupId, measureId } = this.form
			return this.$axios.post('api/tcm/orders/change', {
				agentId: this.$route.params.id,
				spec,
				serviceId,
				groupId,
				measureId
			})
		},
		renew() {
			return this.$axios.post('api/tcm/orders/renew', {
				agentId: this.$route.params.id,
				duration: this.form.duration
			})
		},
		toPay(orderId, action, successTips) {
			this.$loading({
				fullscreen: true
			})
			sessionStorage.setItem(
				'result',
				JSON.stringify({
					isPrepay: true,
					action,
					tips: successTips,
					orderId,
					id: this.$route.params.id
				})
			)
			let url = this.$router.resolve({
				name: 'Result'
			})
			return this.$axios
				.post('api/tcm/orders/prepare', {
					orderId,
					returnUrl: encodeURIComponent(location.href.split('#/')[0] + url.href)
				})
				.then(data => {
					location.href = data.payLink
				})
		},
		toResult(result) {
			result.id = this.$route.params.id
			sessionStorage.setItem('result', JSON.stringify(result))
			this.$router.push({
				name: 'Result'
			})
		},
		toDoc() {
			window.open(process.env.VUE_APP_BASE_URL + '/home/about/market', '_blank')
		},
		toHelp() {
			window.open(process.env.VUE_APP_BASE_URL + '/op-help-center/', '_blank')
		},
		toChargeDetails() {
			window.open(process.env.VUE_APP_BASE_URL + '/op-help-center/doc/article/42279', '_blank')
		}
	}
}
</script>

<style lang="scss" scoped>
.purchase-wrapper {
	padding-bottom: 100px;
	.main {
		padding: 10px 20px;
	}
	.panel {
		margin-top: 10px;
		padding: 20px 30px;
		border-radius: 2px;
		background: #fff;
		.panel-title {
			padding-bottom: 20px;
			border-bottom: 1px solid #dedede;
			font-size: 14px;
		}
		.el-form-item:last-child {
			margin-bottom: 0;
		}
		.form-item {
			display: flex;
			align-items: center;
			.icon-tips {
				margin-left: 10px;
			}
		}
		.form-item-tips {
			max-width: 560px;
			margin-top: 5px;
			line-height: 18px;
			font-size: 12px;
			color: #bbb;
		}
	}
	.confirm-footer {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		.info {
			text-align: right;
		}
	}
	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 1000;
		padding: 10px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		background: #fff;
		box-sizing: border-box;
		box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
	}
	.price {
		color: #f04134;
		font-size: 26px;
	}
	.price-tips {
		display: flex;
		align-items: center;
		color: map-get($fontColor, slight);
	}
	.confirm-top {
		display: flex;
		align-items: center;
		.btn-back {
			padding: 5px 5px;
			border-radius: 2px;
			text-align: center;
			font-size: 12px;
			color: map-get($fontColor, normal);
			&:hover {
				color: map-get($color, primary);
			}
		}
	}
	.props-item {
		display: flex;
		align-items: center;
		line-height: 30px;
		white-space: nowrap;
		.label {
			width: 120px;
			color: map-get($fontColor, slight);
		}
		.value {
			color: map-get($fontColor, normal);
		}
	}
	.agreement {
		margin-top: 5px;
	}
	.info-list {
		margin-top: 10px;
		display: flex;
		flex-wrap: wrap;
		.info-item {
			margin-top: 10px;
			padding: 5px 0;
			width: 25%;
			min-width: 300px;
			white-space: nowrap;
			overflow: hidden;
			.label {
				display: inline-block;
				width: 80px;
				color: map-get($fontColor, slight);
				text-align: right;
			}
			.value {
				margin-left: 20px;
			}
		}
	}
}
</style>
<style lang="scss">
.purchase-wrapper {
	.radio-button .el-radio-button__inner {
		min-width: 130px;
		padding: 9px 0;
		text-align: center;
	}
}
</style>
