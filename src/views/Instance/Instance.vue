<template>
	<section class="instance-wrapper" v-loading="loading" v-if="$route.name === 'Instance'">
		<div class="main">
			<div class="instance-operation">
				<div class="instance-operation-left">
					<ul>
						<li>
							<ElSelect v-model="searchParams.status" @input="search()">
								<ElOption label="全部状态" value=""></ElOption>
								<ElOption v-for="(value, label) in statusOptions" :key="value" :label="label" :value="value"></ElOption>
							</ElSelect>
						</li>
						<li style="margin-left: 10px;">
							<ElInput
								width="200"
								v-model="searchParams.keyword"
								placeholder="按ID/实例名称搜索"
								@input="fetch(1, 800)"
							>
								<i slot="prefix" class="iconfont td-icon-sousuo el-input__icon"></i>
							</ElInput>
						</li>
						<li style="margin-left: 10px;">
							<ElButton plain class="btn-refresh" @click="fetch()">
								<i class="iconfont td-icon-shuaxin"></i>
							</ElButton>
						</li>
					</ul>
				</div>
				<div v-if="VUE_APP_HIDE_INSTANCE_BTN !== 'true'" class="instance-operation-right">
					<ElButton type="primary" @click="toOldPurchase">
						<i class="iconfont td-icon-dinggou" style="margin-right: 5px;"></i>
						<span>订购托管实例</span>
					</ElButton>
					<ElButton type="primary" @click="toPurchase">
						<i class="iconfont td-icon-dinggou" style="margin-right: 5px;"></i>
						<span>实例订购</span>
					</ElButton>
				</div>
			</div>
			<El-table
				class="instance-table  table-border"
				style="margin-top: 10px;"
				height="100%"
				:data="list"
				@sort-change="sortChange"
			>
				<ElTableColumn min-width="200px" label="实例ID/名称">
					<template slot-scope="scope">
						<ElLink :class="['agent-link', $PLATFORM]" type="primary" @click="clickAgent(scope.row)">{{
							scope.row.id
						}}</ElLink>
						<ClipButton :value="scope.row.id"></ClipButton>
						<InlineInput
							style="display: block;"
							:value="scope.row.name"
							@save="updateName($event, scope.row.id)"
						></InlineInput>
					</template>
				</ElTableColumn>
				<ElTableColumn v-if="$PLATFORM === 'drs'" min-width="180px">
					<div slot="header">
						地域及可用区
						<TableFilter v-model="searchParams.zone" :options="zoneOptions" @input="search()"></TableFilter>
					</div>
					<template slot-scope="scope">
						<span>{{ scope.row.regionFmt }}</span>
					</template>
				</ElTableColumn>
				<ElTableColumn label="状态" width="120">
					<template slot-scope="scope">
						<StatusTag type="text" :status="scope.row.status"></StatusTag>
					</template>
				</ElTableColumn>
				<ElTableColumn v-if="$PLATFORM === 'drs'" label="同步拓扑" width="150">
					<template slot-scope="scope">
						<span>{{ scope.row.topology }}</span>
					</template>
				</ElTableColumn>
				<ElTableColumn label="任务数" width="120">
					<template slot-scope="scope">
						<ElTooltip effect="dark" placement="top" :disabled="!scope.row.metric || !scope.row.metric.runningTaskNum">
							<div slot="content">
								<template v-for="(item, index) in scope.row.metric.dataFlows">
									<div v-if="index < 3" :key="item.id">任务名称：{{ item.name }}</div>
								</template>
								<ElLink
									v-if="scope.row.metric.runningTaskNum > 3"
									class="block text-center"
									type="primary"
									@click="toDataFlow(scope.row.tmInfo.agentId)"
									>查看更多</ElLink
								>
							</div>
							<ElLink type="primary" @click="toDataFlow(scope.row.tmInfo.agentId)">{{
								scope.row.metric ? scope.row.metric.runningTaskNum : 0
							}}</ElLink>
						</ElTooltip>
					</template>
				</ElTableColumn>
				<ElTableColumn label="版本" width="180">
					<template slot-scope="scope">
						<span>{{ scope.row.spec && scope.row.spec.version }}</span>
					</template>
				</ElTableColumn>
				<ElTableColumn prop="createAt" sortable="custom" label="创建时间" width="150">
					<template slot-scope="scope">
						<span>{{ $moment(scope.row.createAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
					</template>
				</ElTableColumn>
				<ElTableColumn label="操作" width="120" fixed="right">
					<template slot-scope="scope">
						<ElTooltip
							v-if="$PLATFORM !== 'dfs'"
							effect="dark"
							placement="top"
							popper-class="tooltip--notenter"
							:enterable="false"
							:content="temList[scope.$index].restartTips"
							:disabled="!temList[scope.$index].restartTips"
						>
							<ElLink
								type="primary"
								popper-class="tooltip--notenter"
								:disabled="!!temList[scope.$index].restartTips"
								@click="restart(scope.row)"
								>重启</ElLink
							>
						</ElTooltip>
						<ElDropdown
							v-if="$PLATFORM === 'drs'"
							style="margin-left: 10px;"
							trigger="click"
							@command="handleMore($event, scope.row, scope.$index)"
							@visible-change="dropdownVisibleChange($event, scope.row.id, scope.row.createBy)"
						>
							<ElLink type="primary">
								更多
								<i class="el-icon-arrow-down"></i>
							</ElLink>
							<ElDropdownMenu slot="dropdown">
								<div v-loading="temList[scope.$index].loading">
									<ElTooltip
										effect="dark"
										placement="top"
										popper-class="tooltip--notenter"
										:enterable="false"
										:content="temList[scope.$index].orderTips"
										:disabled="!temList[scope.$index].orderTips"
									>
										<ElDropdownItem
											command="order"
											:class="{ 'dropdown-item--disabled': temList[scope.$index].orderTips }"
											>查看订单</ElDropdownItem
										>
									</ElTooltip>
									<ElTooltip
										effect="dark"
										placement="top"
										popper-class="tooltip--notenter"
										:enterable="false"
										:content="temList[scope.$index].modifyTips"
										:disabled="!temList[scope.$index].modifyTips"
									>
										<ElDropdownItem
											command="modify"
											:class="{ 'dropdown-item--disabled': temList[scope.$index].modifyTips }"
										>
											规格变更
										</ElDropdownItem>
									</ElTooltip>
									<ElTooltip
										v-if="isInternet && scope.row.orderInfo.periodType === 'month'"
										effect="dark"
										popper-class="tooltip--notenter"
										placement="top"
										:enterable="false"
										:content="temList[scope.$index].renewTips"
										:disabled="!temList[scope.$index].renewTips"
									>
										<ElDropdownItem
											command="renew"
											:class="{ 'dropdown-item--disabled': temList[scope.$index].renewTips }"
										>
											续订
										</ElDropdownItem>
									</ElTooltip>
									<ElTooltip
										effect="dark"
										popper-class="tooltip--notenter"
										placement="top"
										:enterable="false"
										:content="temList[scope.$index].cancelTips"
										:disabled="!temList[scope.$index].cancelTips"
									>
										<ElDropdownItem
											command="cancel"
											:class="{ 'dropdown-item--disabled': temList[scope.$index].cancelTips }"
										>
											退订
										</ElDropdownItem>
									</ElTooltip>
								</div>
							</ElDropdownMenu>
						</ElDropdown>
						<ElLink v-if="$PLATFORM === 'dfs'" type="primary" class="mr-2" @click="toDeploy">部署</ElLink>
						<!--						<ElLink v-if="$PLATFORM === 'dfs'" type="primary" :disabled="true">停止</ElLink>-->
					</template>
				</ElTableColumn>
				<div class="instance-table__empty" slot="empty">
					<i class="el-icon-folder-opened"></i>
					<span class="ml-1" v-if="!searchParams.keyword && !searchParams.status && !searchParams.zone">暂无数据</span>
					<span v-else> 没有查到符合条件的结果，<ElLink type="primary" @click="reset">返回列表</ElLink> </span>
				</div>
			</El-table>
			<ElPagination
				background
				style="margin-top: 10px;"
				layout="total, sizes, ->, prev, pager, next, jumper"
				:current-page.sync="page.current"
				:page-sizes="[10, 20, 50, 100]"
				:page-size.sync="page.size"
				:total="page.total"
				@size-change="fetch(1)"
				@current-change="fetch"
			>
			</ElPagination>
		</div>
	</section>
	<RouterView v-else></RouterView>
</template>

<script>
import { delayTrigger, formatAgent } from '../../util'
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import ClipButton from '../../components/ClipButton'
import TableFilter from '../../components/TableFilter'
import { STATUS_MAP } from '../../const'
let timer = null
export default {
	components: {
		InlineInput,
		StatusTag,
		TableFilter,
		ClipButton
	},
	data() {
		return {
			isInternet: window.__USER_INFO__.isInternet,
			loading: true,
			searchParams: {
				status: '',
				keyword: '',
				zone: ''
			},
			list: [],
			temList: [],
			page: {
				current: 0,
				size: 10,
				total: 0
			},
			order: 'createAt desc',
			statusMap: STATUS_MAP,
			zoneOptions: [],
			VUE_APP_HIDE_INSTANCE_BTN: process.env.VUE_APP_HIDE_INSTANCE_BTN
		}
	},
	computed: {
		statusOptions() {
			let options = {}
			let map = this.statusMap
			let dfsFilter = ['Running', 'Stopped', 'Error']
			for (const key in map) {
				const item = map[key]
				let value = key
				if (options[item.text]) {
					value = options[item.text] + ',' + value
				}
				if (this.$PLATFORM === 'dfs') {
					// dfs只保留 运行中、已停止、异常 Running Stopped Error
					if (dfsFilter.indexOf(value) > -1) {
						options[item.text] = value
					}
				} else {
					options[item.text] = value
				}
			}
			return options
		}
	},
	watch: {
		'$route.query'(query, oldQuery) {
			if (oldQuery.region !== query.region) {
				this.searchParams.zone = ''
				this.getZoneOptions()
			}
			this.searchParams.status = query.status || ''
			this.searchParams.zone = query.zone || ''
			this.fetch(1)
		}
	},
	created() {
		let query = this.$route.query
		this.searchParams.status = query.status || ''
		this.searchParams.zone = query.zone || ''
		this.fetch()
		this.getZoneOptions()
		timer = setInterval(() => {
			if (!this || this._isDestroyed) {
				clearInterval(timer)
				timer = null
				return
			}
			this.fetch(this.page.current, 0, true)
		}, 10000)
	},
	destroyed() {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	},
	methods: {
		clickAgent(row) {
			this.$PLATFORM !== 'dfs' && this.$router.push('instance/' + row.id)
		},
		search() {
			let { status, zone } = this.searchParams
			this.$router.replace({
				name: 'Instance',
				query: {
					region: this.$route.query.region,
					zone,
					status
				}
			})
		},
		fetch(pageNum, debounce, hideLoading) {
			delayTrigger(() => {
				if (!hideLoading) {
					this.loading = true
				}
				let region = this.$route.query.region
				let current = pageNum || this.page.current
				let { keyword, status, zone } = this.searchParams
				let where = {}
				if (keyword && keyword.trim()) {
					where.$or = [{ name: { $regex: keyword, $options: 'i' } }, { clusterId: { $regex: keyword, $options: 'i' } }]
				}
				region && (where.region = region)
				zone && (where.zone = zone)
				if (status) {
					where.status = {
						$in: status.split(',')
					}
				}
				let filter = {
					where,
					size: this.page.size,
					page: current,
					sort: [this.order]
				}
				this.$axios
					.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
					.then(data => {
						let list = data.items || []
						this.list = list.map(formatAgent)
						this.page.total = data.total
						this.temList = list.map((it, idx) => {
							let restartTips = ''
							if (it.metric && it.metric.runningTaskNum) {
								restartTips = '实例下无运行的任务才能重启'
							}
							return Object.assign(
								{
									loading: false,
									modifyTips: '',
									cancelTips: '',
									renewTips: '',
									restartTips: restartTips || '',
									orderTips: ''
								},
								this.temList[idx]
							)
						})
						if (!list.length && data.total > 0) {
							setTimeout(() => {
								this.fetch(this.page.current - 1)
							}, 0)
						}
					})
					.finally(() => {
						if (!hideLoading) {
							this.loading = false
						}
					})
			}, debounce)
		},
		getZoneOptions() {
			let { poolList, regionMap, zoneMap } = window.__REGION__
			let region = this.$route.query.region
			if (region) {
				let regionInfo = poolList.find(p => p.poolId === region) || {}
				let zoneInfo = regionInfo.zoneInfo || []
				this.zoneOptions.splice(0, this.zoneOptions.length)
				this.zoneOptions.push(
					...zoneInfo.map(z => {
						return {
							label: regionInfo.poolName + ' | ' + z.zoneName,
							value: z.zoneCode
						}
					})
				)
			} else {
				let options = []
				for (const key in zoneMap) {
					let keyArr = key.split('-')
					let regionKey = keyArr.splice(0, keyArr.length - 1)
					options.push({
						label: regionMap[regionKey.join('-')] + ' | ' + zoneMap[key],
						value: key
					})
				}
				this.zoneOptions = options
			}
		},
		sortChange({ column, prop, order }) {
			this.order = `${order ? prop : 'createAt'} ${order === 'ascending' ? 'asc' : 'desc'}`
			this.fetch(1)
		},
		handleMore(comand, item, index) {
			switch (comand) {
				case 'cancel':
					this.toCancel(item, index)
					break
				case 'modify':
					this.toModify(item, index)
					break
				case 'order':
					this.toOrder(item, index)
					break
				case 'renew':
					this.toRenew(item, index)
					break
				default:
					// this.toOrder(item);
					break
			}
		},
		restart(item) {
			this.$confirm(
				'重启实例 ' + item.name + ' 的所有进程将会关闭并重新启动，导致业务中断，请谨慎操作',
				'是否重启该实例？',
				{
					type: 'warning'
				}
			).then(res => {
				if (!res) {
					return
				}
				this.loading = true
				this.$axios
					.post('api/tcm/agent/restart?agentId=' + item.id)
					.then(() => {
						this.$message.success('重启操作成功')
						this.fetch()
					})
					.catch(() => {
						this.loading = false
					})
			})
		},
		stop(item) {
			console.log('stop', item)
		},
		toOrder(item) {
			this.loading = true
			this.$axios
				.get(`api/tcm/orders/${item.id}`)
				.then(data => {
					let orderId = data.id
					if (orderId) {
						window.open(process.env.VUE_APP_BASE_URL + `/usercenter/mop/order/orderdetail/${orderId}`, '_blank')
					} else {
						this.$message.warning('订单创建中，请稍后再试')
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		toRenew(item, index) {
			if (this.temList[index].renewTips) {
				return
			}
			window.open(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PURCHASE_PATH + '#/renew/' + item.id, '_blank')
		},
		toModify(item, index) {
			if (this.temList[index].modifyTips) {
				return
			}
			window.open(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PURCHASE_PATH + '#/modify/' + item.id, '_blank')
		},
		toCancel(item, index) {
			if (this.temList[index].cancelTips) {
				return
			}
			if (item.metric && item.metric.runningTaskNum) {
				return this.$alert('该实例已创建了同步任务或数据源，请先删除同步任务和数据源再进行退订操作', {
					type: 'warning',
					customClass: 'el-message-box--alert'
				})
			}
			this.$confirm('实例 ' + item.name + ' 退订后不能恢复，且账号不再对该实例计费', '是否退订该实例', {
				type: 'warning'
			}).then(res => {
				if (!res) {
					return
				}
				this.loading = true
				this.$axios
					.post('api/tcm/orders/cancel', {
						instanceId: item.id
					})
					.then(() => {
						this.$message.success('退订操作成功')
						this.fetch()
					})
					.catch(() => {
						this.loading = false
					})
			})
		},
		toOldPurchase() {
			this.$confirm('确认后跳转订购托管实例页面', '是否确认订购托管实例？', {
				type: 'warning'
			}).then(res => {
				if (!res) {
					return
				}
				let downloadUrl = window.App.$router.resolve({
					name: 'Purchase'
				})
				window.open(downloadUrl.href, '_blank')
			})
		},
		toPurchase() {
			if (this.$PLATFORM === 'drs') {
				window.open(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_PURCHASE_PATH, '_blank')
			} else {
				this.$confirm('确认后跳转下载页面', '是否确认订购实例？', {
					type: 'warning'
				}).then(res => {
					if (!res) {
						return
					}
					let downloadUrl = window.App.$router.resolve({
						name: 'FastDownload'
					})

					window.open(downloadUrl.href, '_blank')
				})
			}
		},
		toDeploy() {
			let downloadUrl = window.App.$router.resolve({
				name: 'FastDownload'
			})

			window.open(downloadUrl.href, '_blank')
		},
		updateName(val, id) {
			this.loading = true
			this.$axios
				.post('api/tcm/agent', {
					id,
					name: val
				})
				.then(() => {
					this.$message.success('修改成功')
					this.fetch()
				})
				.catch(() => {
					this.loading = false
				})
		},
		reset() {
			this.searchParams = {
				status: '',
				keyword: '',
				zone: ''
			}
			this.fetch(1)
		},
		dropdownVisibleChange(flag, id, userId) {
			if (flag) {
				let index = this.list.findIndex(it => it.id === id)
				let item = this.temList[index]
				let itemData = this.list[index]
				let user = window.__USER_INFO__ || {}
				if (user.id !== itemData.createBy) {
					item.modifyTips = `请使用账号 ${itemData.createUser} 操作规格变更`
					item.cancelTips = `请使用账号 ${itemData.createUser} 操作退订`
					item.renewTips = `请使用账号 ${itemData.createUser} 操作续订`
					item.orderTips = `请使用账号 ${itemData.createUser} 操作查看订单`
					this.$set(this.temList, index, item)
					return
				}
				if (itemData.metric && itemData.metric.runningTaskNum) {
					let msg = '实例下无运行的任务才能'
					item.modifyTips = msg + '变更规格'
					item.cancelTips = msg + '退订'
					this.$set(this.temList, index, item)
					return
				}
				item.loading = true
				this.$set(this.temList, index, item)
				this.$axios
					.get(`api/tcm/agent/${id}/auth`)
					.then(data => {
						let statusMessage = '当前实例状态不允许此操作'
						item.modifyTips =
							data.change.supportFlag === 'ALLOW'
								? ['Running', 'Error'].includes(itemData.status)
									? ''
									: statusMessage
								: data.change.message
						item.cancelTips =
							data.cancel.supportFlag === 'ALLOW'
								? ['Running', 'Error'].includes(itemData.status)
									? ''
									: statusMessage
								: data.cancel.message
						item.renewTips =
							data.renew.supportFlag === 'ALLOW'
								? ['Running', 'Error', 'Freeze'].includes(itemData.status)
									? ''
									: statusMessage
								: data.renew.message
					})
					.finally(() => {
						item.loading = false
						this.$set(this.temList, index, item)
					})
			}
		},
		toDataFlow(id) {
			this.$router.push({
				name: 'Dataflow',
				query: {
					agentId: id,
					status: 'running'
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.instance-wrapper {
	display: flex;
	width: 100%;
	height: 100%;
	flex-direction: column;
	overflow: hidden;
	.btn-refresh {
		padding: 0;
		height: 32px;
		line-height: 32px;
		width: 32px;
		font-size: 16px;
	}
	.main {
		padding: 20px;
		background: #fff;
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.instance-operation {
		display: flex;
		justify-content: space-between;
		.instance-operation-left {
			li {
				float: left;
			}
		}
	}
	.instance-table {
		flex: 1;
		overflow: auto;
		border-bottom: none;
		.agent-link {
			&.dfs {
				color: unset;
				cursor: unset;
			}
		}
	}
	.instance-table__empty {
		color: map-get($fontColor, light);
	}
}
::v-deep {
	.el-dropdown-menu__item.dropdown-item--disabled {
		color: map-get($color, disable);
		cursor: default;
		&:hover {
			background: unset;
			color: map-get($color, disable);
		}
	}
	.tooltip--notenter {
		pointer-events: none;
	}
}
</style>
