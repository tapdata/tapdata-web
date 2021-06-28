<template>
	<section class="instance-wrapper main-container" v-loading="loading" v-if="$route.name === 'OperationLog'">
		<div class="main">
			<div class="instance-operation">
				<div class="instance-operation-left">
					<ul>
						<li>
							<ElSelect v-model="searchParams.operationType" @input="search()">
								<ElOption label="操作类型" value=""></ElOption>
								<ElOption
									v-for="(item, key) in operationTypeOptions"
									:key="key"
									:label="item.label"
									:value="item.value"
								></ElOption>
							</ElSelect>
						</li>
						<li class="ml-3">
							<ElButton plain class="btn-refresh" @click="fetch()">
								<i class="iconfont td-icon-shuaxin"></i>
							</ElButton>
						</li>
					</ul>
				</div>
			</div>
			<El-table class="instance-table  table-border mt-3" height="100%" :data="list">
				<ElTableColumn label="用户名" width="120">
					<template slot-scope="scope">
						<div>{{ scope.row.username }}</div>
					</template>
				</ElTableColumn>
				<ElTableColumn label="用户昵称" width="120">
					<template slot-scope="scope">
						<div>{{ scope.row.username }}</div>
					</template>
				</ElTableColumn>
				<ElTableColumn label="操作时间" width="200">
					<template slot-scope="scope">
						<div>{{ $moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
					</template>
				</ElTableColumn>
				<ElTableColumn label="操作对象" width="350">
					<template slot-scope="scope">
						<div>{{ scope.row.parameter1 }}</div>
					</template>
				</ElTableColumn>
				<ElTableColumn label="操作类型" width="120">
					<template slot-scope="scope">
						<div>{{ getTypeText(scope.row) }}</div>
					</template>
				</ElTableColumn>
				<ElTableColumn label="操作描述">
					<template slot-scope="scope">
						<div>{{ getDescFnc(scope.row) }}</div>
					</template>
				</ElTableColumn>
				<div class="instance-table__empty" slot="empty">
					<i class="el-icon-folder-opened"></i>
					<span class="ml-1" v-if="!searchParams.keyword && !searchParams.status">暂无数据</span>
				</div>
			</El-table>
			<ElPagination
				background
				class="mt-3"
				layout="total, sizes, ->, prev, pager, next, jumper"
				:current-page.sync="page.current"
				:page-sizes="[10, 20, 50, 100]"
				:page-size.sync="page.size"
				:total="page.total"
				@size-change="changePage"
				@current-change="changePage"
			>
			</ElPagination>
		</div>
	</section>
	<RouterView v-else></RouterView>
</template>

<script>
import { delayTrigger } from '../../util'
import { INSTANCE_STATUS_MAP } from '../../const'

export default {
	data() {
		return {
			loading: true,
			searchParams: {
				operationType: '',
				status: '',
				keyword: ''
			},
			source: [], // 所有数据
			list: [], // 展示的数据
			page: {
				current: 1,
				size: 10,
				total: 0
			},
			order: 'createAt desc',
			statusMap: INSTANCE_STATUS_MAP,
			VUE_APP_INSTANCE_TEST_BTN: process.env.VUE_APP_INSTANCE_TEST_BTN,
			upgradeDialog: false,
			selectedRow: {},
			agentStatus: 'stop',
			version: '',
			upgradeList: [], // 升级列表
			modularMap: {
				connection: '连接',
				sync: '任务'
			},
			operationMap: {
				create: '创建',
				update: '编辑',
				copy: '复制',
				delete: '删除',
				start: '启动',
				reset: '重置',
				stop: '停止',
				forceStop: '强制停止'
			},
			operationTypeItems: [
				{
					label: '连接',
					value: 'connection',
					items: {
						create: '创建',
						update: '编辑',
						copy: '复制',
						delete: '删除'
					}
				},
				{
					label: '任务',
					value: 'sync',
					items: {
						create: '创建',
						start: '启动',
						update: '编辑',
						copy: '复制',
						reset: '重置',
						delete: '删除',
						stop: '停止',
						forceStop: '强制停止'
					}
				}
			]
		}
	},
	computed: {
		operationTypeOptions() {
			let result = []
			this.operationTypeItems.forEach(el => {
				for (let key in el.items) {
					result.push({
						label: el.items[key] + el.label,
						value: key + '_' + el.value
					})
				}
			})
			return result
		},
		allTypeMap() {
			let obj = {}
			this.operationTypeItems.forEach(el => {
				obj[el.value] = el.label
				for (let key in el.items) {
					obj[key] = el.items[key]
				}
			})
			return obj
		}
	},
	watch: {
		'$route.query'(query) {
			this.searchParams.status = query.status || ''
			this.fetch(1)
		}
	},
	created() {
		let query = this.$route.query
		this.searchParams.status = query.status || ''
		this.fetch()
	},
	methods: {
		search() {
			// let { operationType } = this.searchParams
			this.fetch()
		},

		fetch(pageNum = 1, debounce, hideLoading) {
			delayTrigger(async () => {
				if (!hideLoading) {
					this.loading = true
				}
				this.page.current = pageNum
				let current = this.page.current
				console.log('current', current)
				let { operationType, keyword, status } = this.searchParams
				let where = {
					type: 'userOperation' // 默认用户操作
				}
				if (operationType) {
					let [operation, modular] = operationType?.split('_')
					where['modular'] = modular
					where['operation'] = operation
				}
				if (keyword && keyword.trim()) {
					where.$or = [{ name: { $regex: keyword, $options: 'i' } }, { clusterId: { $regex: keyword, $options: 'i' } }]
				}
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
					.get('tm/api/UserLogs?filter=' + encodeURIComponent(JSON.stringify(filter)))
					.then(data => {
						console.log('data', data)
						let size = this.page.size
						this.source = data || []
						this.page.total = this.source.length
						// this.list = this.source.slice(current * size, size)
						this.changePage()
						// if (!this.source.length && this.source.total > 0) {
						// 	setTimeout(() => {
						// 		this.fetch(this.page.current - 1)
						// 	}, 0)
						// }
					})
					.finally(() => {
						if (!hideLoading) {
							this.loading = false
						}
					})
			}, debounce)
		},
		sortChange({ column, prop, order }) {
			this.order = `${order ? prop : 'createAt'} ${order === 'ascending' ? 'asc' : 'desc'}`
			this.fetch(1)
		},
		changePage() {
			let size = this.page.size
			let current = this.page.current
			this.list = this.source.slice((current - 1) * size, current * size)
			console.log('this.list', current, size, this.list)
		},
		getTypeText(row) {
			return this.operationTypeOptions.find(item => item.value === row.operation + '_' + row.modular)?.label
		},
		getDescFnc(row) {
			console.log('getDesd', this.allTypeMap)
			let allTypeMap = this.allTypeMap
			let { modular, operation, parameter1, rename, oldName } = row
			let result
			// 修改连接 -- 更名
			if (modular === 'connection' && operation === 'update' && rename) {
				result = `将连接名称由【${oldName}】修改为【${parameter1}】`
			} else {
				result = `${allTypeMap[operation]}了${allTypeMap[modular]}【${parameter1}】`
			}
			return result
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
	box-sizing: border-box;
	.pointer {
		cursor: pointer;
	}
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
			color: unset;
			cursor: unset;
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
