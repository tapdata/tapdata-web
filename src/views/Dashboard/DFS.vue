<template>
	<section class="drs-dashboard-wrapper" v-loading="loading">
		<ElCard>
			<div slot="header" class="card-title">
				<span>任务总览</span>
			</div>
			<div class="info">
				<div>
					<span @click="jump()">
						<span class="title">总数：</span><span class="blue">{{ totalStatus.total || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">运行：</span><span class="green">{{ totalStatus.running || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">停止：</span><span class="blue">{{ totalStatus.stop || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">错误：</span><span class="red">{{ totalStatus.error || 0 }}</span>
					</span>
				</div>
				<div></div>
			</div>
		</ElCard>
		<ElCard>
			<div slot="header" class="card-title">
				<span>运行任务状态</span>
			</div>
			<div class="info">
				<div>
					<span @click="jump()">
						<span class="title">总数：</span><span class="blue">{{ runningStatus.total || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">全量：</span><span class="blue">{{ runningStatus.initializing || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">全量完成：</span><span class="blue">{{ runningStatus.initialized || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">增量：</span><span class="blue">{{ runningStatus.cdc || 0 }}</span>
					</span>
				</div>
				<div>
					<span @click="jump()">
						<span class="title">增量延迟：</span><span class="orange">{{ runningStatus.Lag || 0 }}</span>
					</span>
				</div>
			</div>
		</ElCard>
		<ElCard>
			<div slot="header" class="card-title">
				<span>传输总览（事件统计）</span>
				<!-- 暂时隐藏筛选功能 -->
				<!-- 				<el-select v-model="currentAgent" placeholder="请选择" class="fr" size="mini">
					<ElOption value="-1" label="汇总"></ElOption>
					<ElOption v-for="item in agentList" :key="item.id" :label="item.server" :value="item.id">
					</ElOption>
				</el-select> -->
			</div>
			<section v-loading="transferLoading">
				<div class="transfer-chart" ref="transferChart"></div>
			</section>
		</ElCard>
		<!-- 		<ElCard class="table">
			<div slot="header" class="card-title">
				<span>agent状态概览</span>
			</div>
			<ElTable :data="agentList">
				<el-table-column prop="server" label="服务器" />
				<el-table-column prop="item2" label="agent状态" />
				<el-table-column prop="item3" label="运行时间" />
				<el-table-column prop="item4" label="总任务" />
				<el-table-column prop="item5" label="停止" />
				<el-table-column prop="item6" label="异常" />
				<el-table-column prop="item7" label="延迟" />
				<el-table-column prop="item8" label="增量" />
				<el-table-column prop="item9" label="全量" />
				<el-table-column prop="item10" label="">
					<i class="el-icon-info icon-info" title="详情"></i>
				</el-table-column>
			</ElTable>
		</ElCard> -->
	</section>
</template>

<script>
import echarts from '@/plugins/echarts'

export default {
	data() {
		return {
			totalStatus: {}, // 任务总览数据
			runningStatus: {}, // 运行任务状态数据
			agentStatus: {}, // agent状态数据
			currentAgent: '-1', // 当前agent
			agentList: [], // agent列表
			transferLoading: true, // 传输总览loading
			transferData: {}, // 传输总览数据
			transferChart: null, // 传输总览图表实例
			loading: true // 页面加载
		}
	},

	computed: {
		// 传输总览图表配置
		transferChartOptions() {
			return {
				grid: {
					// left: '5%',
					left: 0,
					top: '3%',
					// right: '2%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					show: false,
					type: 'value'
				},
				yAxis: {
					type: 'category',
					axisLine: { show: false },
					axisTick: { show: false },
					data: ['总输入', '总输出', '总插入', '总更新', '总删除'].reverse()
				},
				series: [
					{
						type: 'bar',
						label: {
							show: true,
							position: 'right',
							formatter: '{c}次'
						},
						data: [
							{
								value: this.transferData.totalDelete || 0,
								itemStyle: {
									color: '#e06c6c'
								}
							},
							{
								value: this.transferData.totalUpdate || 0,
								itemStyle: {
									color: '#e6b451'
								}
							},
							{
								value: this.transferData.totalInsert || 0,
								itemStyle: {
									color: '#d9742c'
								}
							},
							{
								value: this.transferData.totalOutput || 0,
								itemStyle: {
									color: '#48b6e2'
								}
							},
							{
								value: this.transferData.totalInput || 0,
								itemStyle: {
									color: '#7ba75d'
								}
							}
						]
					}
				],
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					}
				}
			}
		}
	},

	methods: {
		// 跳转页面
		jump(path) {
			path && this.$router.push(path)
		},
		// 图表resize
		resizeFn() {
			this.transferChart && this.transferChart.resize()
		}
	},

	created() {
		// this.agentList = [
		// 	{
		// 		id: 1,
		// 		server: '192.16.1.186',
		// 		item2: '正常',
		// 		item3: '10天05小时',
		// 		item4: 5,
		// 		item5: 1,
		// 		item6: 1,
		// 		item7: 1,
		// 		item8: 1,
		// 		item9: 2
		// 	},
		// 	{
		// 		id: 2,
		// 		server: '192.16.1.187',
		// 		item2: '正常',
		// 		item3: '10天05小时',
		// 		item4: 5,
		// 		item5: 1,
		// 		item6: 1,
		// 		item7: 1,
		// 		item8: 1,
		// 		item9: 2
		// 	}
		// ];

		// agent列表
		this.$axios
			.get('tm/api/clusterStates')
			.then(data => {
				this.agentList = data || []

				// agent状态
				let obj = {
					total: this.agentList.length,
					running: 0,
					stopped: 0,
					down: 0
				}
				this.agentList.forEach(v => {
					if (v.engine && v.engine.status) {
						obj[v.engine.status] = obj[v.engine.status] + 1
					}
				})
				this.agentStatus = obj
			})
			.finally(() => {
				this.transferLoading = false
			})

		// 统计数据
		this.$axios
			.get('tm/api/DataFlows/chart')
			.then(data => {
				// 任务总览
				const chart1 = data.chart1 || {}
				let obj1 = {
					total: chart1.totalDataFlows
				}
				if (chart1.statusCount && chart1.statusCount.length) {
					chart1.statusCount.forEach(v => {
						obj1[v._id] = v.count
					})
				}
				obj1.stop = (obj1.stopping || 0) + (obj1.draft || 0) + (obj1.paused || 0)
				this.totalStatus = obj1

				// 运行任务状态
				const chart4 = data.chart4 || {}
				chart4.total = (chart4.initializing || 0) + (chart4.initialized || 0) + (chart4.cdc || 0)
				this.runningStatus = chart4

				// 传输总览
				const chart2 = data.chart2 || []
				this.transferData = chart2 ? chart2[0] : {}
				this.transferData = chart2 ? chart2[0] : {}
				this.transferChart.setOption(this.transferChartOptions)
			})
			.finally(() => {
				this.loading = false
			})
	},

	mounted() {
		// 初始化传输总览柱状图
		this.transferChart = echarts.init(this.$refs.transferChart)
		this.transferChart.setOption(this.transferChartOptions)

		// 窗口变化重绘图表
		window.addEventListener('resize', this.resizeFn)
	},

	beforeDestroy() {
		// 移除resize事件
		window.removeEventListener('resize', this.resizeFn)
	}
}
</script>

<style lang="scss" scoped>
.drs-dashboard-wrapper {
	.card-title {
		font-size: 14px;
		line-height: 20px;
		.fr {
			float: right;
		}
	}
	.el-card {
		margin-bottom: 20px;
		.info {
			display: flex;
			padding: 15px 0;
			> div {
				flex: 1;
				text-align: center;
				color: map-get($fontColor, slight);
				> span {
					cursor: pointer;
					> span {
						font-size: 20px;
						display: inline-block;
						vertical-align: middle;
						&.title {
							font-size: 16px;
						}
						&.green {
							color: map-get($color, success);
						}
						&.blue {
							color: map-get($color, primary);
						}
						&.orange {
							color: map-get($color, warning);
						}
						&.red {
							color: map-get($color, danger);
						}
					}
				}
			}
		}
		.transfer-chart {
			height: 240px;
		}
		.icon-info {
			color: map-get($color, primary);
			font-size: 20px;
			cursor: pointer;
		}
	}
}
</style>

<style lang="scss">
.drs-dashboard-wrapper {
	.el-card__header {
		padding: 12px;
	}
	.el-card__body {
		padding: 20px 12px;
	}
}
</style>
