<template>
	<section class="dashboard" v-if="isNew">
		<el-row :gutter="20" class="e-row">
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="migrationJobObj" @getAllData="getAllData"></echart-head>
					<div class="info fl">
						<span>{{ $t('app.Home.allTask') }}</span>
						<span class="number">{{ migrationTotal }}</span>
					</div>
					<ul class="jobList">
						<li
							v-for="task in migrationTaskList"
							:key="task.name"
							@click="handleMigrationStatus(task.name)"
						>
							<span class="text" :style="`color: ${colorMap[task.name]};`">{{
								$t('dataFlow.status.' + task.name)
							}}</span
							><span>{{ task.value }}</span>
						</li>
						<!-- <li>
							<span style="color: #FDB01C">{{ $t('dataFlow.status.paused') }}</span
							><span>5</span>
						</li>
						<li>
							<span style="color: #F97066">{{ $t('dataFlow.status.error') }}</span
							><span>5</span>
						</li>
						<li>
							<span style="color: #CCC">{{ $t('dataFlow.status.draft') }}</span
							><span>5</span>
						</li> -->
					</ul>
					<div class="chart">
						<pieChart
							:echartObj="allMigrationJobsEchart"
							v-if="allMigrationJobsEchart"
							echartsId="allMigrationJobId"
							style="width: 100%"
						></pieChart>
					</div>
				</div>
			</el-col>
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="migrationJobStatusObj" @getUnit="getUnit"></echart-head>
					<ul class="status-box">
						<li v-for="item in taskStatusStatistics" :key="item.value">
							<p>{{ item.name }}</p>
							<div
								@click="jumpMigrationTask(item.value)"
								:class="{ lagColor: item.value === 'Lag' && migrationJobStatusList[item.value] > 0 }"
							>
								{{ migrationJobStatusList[item.value] }}
							</div>
						</li>
					</ul>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="20" class="e-row">
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="syncJobObj" @getAllData="getAllData"></echart-head>
					<div class="info fl">
						<span>{{ $t('app.Home.allTask') }}</span>
						<span class="number">{{ syncTotal }}</span>
					</div>
					<ul class="jobList">
						<li v-for="task in syncTaskList" :key="task.name" @click="handleSncyStatus(task.name)">
							<span class="text" :style="`color: ${colorMap[task.name]};`">{{
								$t('dataFlow.status.' + task.name)
							}}</span
							><span>{{ task.value }}</span>
						</li>
					</ul>
					<div class="chart">
						<pieChart
							:echartObj="allsyncJobsEchart"
							v-if="allsyncJobsEchart"
							echartsId="allsyncJobId"
							style="width: 100%"
						></pieChart>
					</div>
				</div>
			</el-col>
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="syncJobStatusObj" @getUnit="getUnit"></echart-head>
					<ul class="status-box">
						<li v-for="item in taskStatusStatistics" :key="item.value">
							<p>{{ item.name }}</p>
							<div
								@click="jumpSyncTask(item.value)"
								:class="{ lagColor: item.value === 'Lag' && syncJobStatusList[item.value] > 0 }"
							>
								{{ syncJobStatusList[item.value] }}
							</div>
						</li>
					</ul>
				</div>
			</el-col>
		</el-row>

		<el-row :gutter="20" class="e-row">
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="screeningObj" @getUnit="getUnit"></echart-head>
					<div class="unit">{{ $t('dataFlow.unit') }}:{{ $t('dataFlow.rowCount') }}</div>
					<shaftless-echart
						class="charts-box"
						:sliderBar="sliderBar"
						:echartObj="dataScreening"
						v-if="dataScreening"
						:echartsId="'dataScreeningId'"
						style="width: 100%"
					></shaftless-echart>
				</div>
			</el-col>
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="dataValidationObj" @getUnit="getUnit"></echart-head>
					<ul class="status-box">
						<li v-for="item in validList" :key="item.value">
							<p>{{ item.name }}</p>
							<div
								@click="jumpSyncTask(item.value)"
								:class="{ lagColor: item.value === 'Lag' && syncJobStatusList[item.value] > 0 }"
							>
								{{ syncJobStatusList[item.value] }}
							</div>
						</li>
					</ul>
				</div>
			</el-col>
			<!-- <el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="transferTaskObj" @getAllData="getAllData"></echart-head>
					<el-table
						:data="transfer.tableData"
						:height="transfer.height"
						:show-header="transfer.isHeader"
						style="width: 100%"
					>
						<el-table-column prop="name">
							<template slot-scope="scope">
								<span class="taskNameStyle" @click="hanleName(scope.row)">{{ scope.row.name }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="setting">
							<template slot-scope="scope">
								<span>
									{{
										scope.row.setting && scope.row.setting.sync_type
											? syncType[scope.row.setting.sync_type]
											: ''
									}}
								</span>
							</template>
						</el-table-column>
						<el-table-column prop="status">
							<template slot-scope="scope">
								<div>
									<span :style="`color: ${colorMap[scope.row.status]};`">
										{{ $t('dataFlow.status.' + scope.row.status) }}
									</span>
									<span
										style="color: #999"
										v-if="
											!scope.row.hasChildren &&
												scope.row.statusList &&
												scope.row.statusList.length
										"
									>
										(
										<span v-for="(key, index) in scope.row.statusList" :key="key">
											{{ $t('dataFlow.status.' + key) }}
											<span v-if="index < scope.row.statusList.length - 1">&nbsp;</span>
										</span>
										)
									</span>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="createTime" :formatter="formatterTime"></el-table-column>
					</el-table>
				</div>
			</el-col> -->
		</el-row>

		<el-row :gutter="20" class="e-row">
			<el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="serverProcessObj" @getAllData="getAllData"></echart-head>
					<el-table :data="serverProcess.tableData" :height="transfer.height" style="width: 100%">
						<el-table-column prop="systemInfo.ip" :label="$t('app.Home.server')"> </el-table-column>
						<el-table-column prop="management.status" :label="$t('app.Home.managementSide')">
							<template slot-scope="scope">
								<span :style="`color: ${colorServeMap[scope.row.management.status]};`">
									{{ $t('app.Home.' + scope.row.management.status) }}
								</span>
							</template>
						</el-table-column>
						<el-table-column prop="engine.status" :label="$t('app.Home.taskTransfer')">
							<template slot-scope="scope">
								<span :style="`color: ${colorServeMap[scope.row.engine.status]};`">{{
									$t('app.Home.' + scope.row.engine.status)
								}}</span>
							</template>
						</el-table-column>
						<el-table-column prop="apiServer.status" :label="$t('app.Home.apiService')">
							<template slot-scope="scope">
								<span :style="`color: ${colorServeMap[scope.row.apiServer.status]};`">{{
									$t('app.Home.' + scope.row.apiServer.status)
								}}</span>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-col>
			<!-- <el-col :span="12" class="e-col">
				<div class="charts-list">
					<echart-head :data="taskRankingObj" @getAllData="getAllData"></echart-head>
					<shaftless-echart
						class="charts-box"
						:sliderBar="sliderBar"
						:echartObj="ranking"
						v-if="dataScreening"
						:echartsId="'rankingId'"
						style="width: 100%"
					></shaftless-echart>
				</div>
			</el-col> -->
		</el-row>
	</section>
	<iframe v-else src="/old/index.html#/dashboard" frameborder="0" style="height:100%; width: 100%;"></iframe>
</template>

<script>
import echartHead from './components/echartHead';
// import elTables from './components/elTables';
import shaftlessEchart from '../../components/shaftlessEchart';
import pieChart from '../../components/pieChart';
import factory from '../../api/factory';
import moment from 'moment';
const cluster = factory('cluster');
const DataFlows = factory('DataFlows');
// const insights = factory('insights');
// import echartsCompinent from '../../components/echartsCompinent';

export default {
	components: { echartHead, pieChart, shaftlessEchart },
	data() {
		return {
			isNew: window._TAPDATA_OPTIONS_.platform === 'DAAS',
			migrationTotal: '',
			syncTotal: '',
			migrationTaskList: [],
			syncTaskList: [],
			jobObj: null,
			screeningObj: {}, // 传输总览
			sliderBar: null,
			transferTaskObj: {}, // 传输任务
			wrongTaskObj: null, //错误任务
			taskRankingObj: {}, // 任务传输排行
			serverProcessObj: {}, //服务器与进程
			taskStatusObj: null, // 任务状态统计
			syncJobStatusList: {
				Lag: 0,
				cdc: 0,
				initialized: 0,
				initializing: 0
			},
			migrationJobStatusList: {
				Lag: 0,
				cdc: 0,
				initialized: 0,
				initializing: 0
			},
			taskStatusStatistics: [
				{ name: this.$t('app.Home.initialization'), value: 'initializing' },
				{ name: this.$t('app.Home.loadingFinished'), value: 'initialized' },
				{ name: this.$t('app.Home.incremental'), value: 'cdc' },
				{ name: this.$t('app.Home.incrementalLag'), value: 'Lag' }
			],
			validList: [
				{ name: this.$t('app.Home.allValid'), value: 'all' },
				{ name: this.$t('app.Home.checkSame'), value: 'checkSame' },
				{ name: this.$t('app.Home.countDifference'), value: 'count' },
				{ name: this.$t('app.Home.contentDifference'), value: 'content' },
				{ name: 'ERROR', value: 'error' }
			],
			colorMap: {
				running: '#8DC47A',
				paused: '#FDB01C',
				draft: '#CCC',
				error: '#F97066',
				stopping: '#48b6e2'
			},
			colorServeMap: {
				starting: '#48B6E2',
				running: '#8DC47A',
				stopping: '#F97066',
				stopped: '#FDB01C'
			},
			syncType: {
				initial_sync: this.$t('dataFlow.initial_sync'),
				cdc: this.$t('dataFlow.cdc'),
				'initial_sync+cdc': this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc')
			},

			allTaskEchart: {
				tooltip: {
					trigger: 'item',
					formatter: '{b}<br/> {c}'
				},
				legend: {
					data: []
				},
				grid: {
					containLabel: true,
					bottom: '1%'
				},

				color: ['#8DC47A', '#FDB01C', '#F97066', '#CCC', '#48b6e2'],
				series: [
					{
						// name: this.$t('dataFlow.status.running'),
						data: [],
						type: 'pie',
						labelLine: {
							show: false
						},
						avoidLabelOverlap: false,
						label: {
							show: false,
							position: 'center'
						},
						emphasis: {
							label: {
								show: true,
								fontSize: '30',
								fontWeight: 'bold'
							}
						},
						radius: ['40%', '70%']
						// itemStyle: {
						// 	color: '#8DC47A'
						// },
						// lineStyle: {
						// 	color: '#2ba7c3'
						// }
					}
				]
			},
			transfer: {
				height: 360,
				isHeader: false,
				tableData: []
			},
			syncJobObj: {},
			migrationJobObj: {},
			syncJobStatusObj: {},
			migrationJobStatusObj: {},
			dataValidationObj: {}, //数据校验
			allsyncJobsEchart: null,
			allMigrationJobsEchart: null,
			dataScreening: {
				tooltip: {
					show: false,
					trigger: 'none',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999'
						}
					}
				},
				toolbox: {
					show: false
				},
				legend: {
					// data: [this.$('dataFlow.totalOutput'),this.$('dataFlow.totalInput')],
				},
				grid: {
					left: '25%',
					right: '30%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					show: true,
					axisLine: {
						show: false,
						lineStyle: {
							color: '#666',
							width: 0
						}
					},
					data: [
						this.$t('dataFlow.totalOutput'),
						this.$t('dataFlow.totalInput'),
						this.$t('dataFlow.totalInsert'),
						this.$t('dataFlow.totalUpdate'),
						this.$t('dataFlow.totalDelete')
					],
					axisPointer: {
						type: 'shadow'
					},

					nameTextStyle: {
						verticalAlign: 'bottom',
						color: '#F00'
					}
				},
				yAxis: {
					axisLine: { show: false },
					axisTick: { show: false },
					splitLine: { show: false },
					splitArea: { show: false }
				},
				series: [
					{
						type: 'bar',
						data: [],
						barWidth: '100%',
						barGap: '-100%',
						itemStyle: {
							normal: {
								color: function(params) {
									var colorList = ['#7ba75d', '#48b6e2', '#d9742c', '#e6b451', '#e06c6c'];
									return colorList[params.dataIndex];
								},
								label: {
									show: true,
									// verticalAlign: 'middle',
									position: 'top',
									distance: 10
									// formatter: '{b}\n{c}'
								}
							}
						}
					}
				]
			},
			serverProcess: {
				height: 360,
				isHeader: true,
				tableData: []
			},
			unitData: [],
			kbData: [],
			unitType: ''
		};
	},
	mounted() {
		this.getClsterDataApi();
		this.getDataFlowApi();
		// this.getRankingData();

		this.syncJobObj = {
			title: this.$t('app.Home.syncJobsOverview'),
			type: 'syncJobs',
			allFalg: true
		};
		this.migrationJobObj = {
			title: this.$t('app.Home.migrationJobsOverview'),
			type: 'migrationJobs',
			allFalg: true
		};
		this.syncJobStatusObj = {
			title: this.$t('app.Home.syncJobsStatus'),
			type: 'syncJobsStatus',
			allFalg: false
		};
		this.migrationJobStatusObj = {
			title: this.$t('app.Home.migrationJobsStatus'),
			type: 'migrationJobsStatus',
			allFalg: false
		};
		this.screeningObj = {
			title: this.$t('app.Home.transmissionOverview'),
			type: 'screening',
			overviewFalg: false
		};
		this.dataValidationObj = {
			title: this.$t('app.Home.dataValidationTitle'),
			type: 'dataValidation',
			allFalg: false
		};
		// this.taskStatusObj = {
		// 	title: this.$t('app.Home.taskStatusStatistics'),
		// 	type: 'taskStatus',
		// 	overviewFalg: false
		// };
		this.transferTaskObj = {
			title: this.$t('app.Home.transferTask'),
			type: 'transferTask',
			allFalg: true
		};
		// this.wrongTaskObj = {
		// 	title: this.$t('app.Home.wrongTask'),
		// 	type: 'wrongTask',
		// 	allFalg: true
		// };
		this.taskRankingObj = {
			title: this.$t('app.Home.taskRanking') + '  (' + this.$t('app.Home.before') + '10' + ')',
			type: 'taskRanking'
		};
		this.serverProcessObj = {
			title: this.$t('app.Home.serverProcess'),
			type: 'serverProcess',
			allFalg: true
		};

		this.allsyncJobsEchart = JSON.parse(JSON.stringify(this.allTaskEchart));
		this.allMigrationJobsEchart = JSON.parse(JSON.stringify(this.allTaskEchart));
	},
	methods: {
		// 跳转任务状态统计
		jumpSyncTask(val) {
			let routeUrl = this.$router.resolve({
				path: 'dataFlows?mapping=custom',
				query: { executionStatus: val }
			});

			window.open(routeUrl.href);
		},

		// 跳转任务状态统计
		jumpMigrationTask(val) {
			let routeUrl = this.$router.resolve({
				path: 'dataFlows?mapping=cluster-clone',
				query: { executionStatus: val }
			});

			window.open(routeUrl.href);
		},

		// 点击同步运行状态跳转到任务列表
		handleSncyStatus(status) {
			let routeUrl = this.$router.resolve({
				path: '/dataFlows?mapping=custom',
				query: { dataFlowStatus: status }
			});

			window.open(routeUrl.href);
		},

		// 点击迁移运行状态跳转到任务列表
		handleMigrationStatus(status) {
			let routeUrl = this.$router.resolve({
				path: '/dataFlows?mapping=cluster-clone',
				query: { dataFlowStatus: status }
			});
			window.open(routeUrl.href);
		},

		// 获取服务器与进程的数据
		getClsterDataApi() {
			cluster.get().then(res => {
				if (res.data) {
					this.serverProcess.tableData = res.data;
				}
			});
		},

		// 获取dataflows数据
		getDataFlowApi() {
			let self = this;
			let id = '';
			if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				id = this.$cookie.get('user_id');
				// params = {
				// 	filter: {
				// 		where: {
				// 			user_id: {
				// 				regexp: `^${this.$cookie.get('user_id')}$`
				// 			}
				// 		}
				// 	}
				// };
			}
			DataFlows.chart(id).then(res => {
				// res.data.chart1.statusCount.sort((a, b) => (a._id > b._id ? 1 : a._id === b._id ? 0 : -1));
				// res.data.chart1.statusCount.forEach(element => {
				// 	self.taskList.unshift({ name: element._id, value: element.count });
				// });
				// self.taskList.map((item, index) => {
				// 	if (item.name === 'stopping' || item.name === 'scheduled') {
				// 		self.taskList.splice(index, 1);
				// 		self.taskList.push(item);
				// 	}
				// });
				self.migrationTaskList = self.handleDataProcessing(res.data.chart1);
				self.syncTaskList = self.handleDataProcessing(res.data.chart5);

				self.allsyncJobsEchart.series[0].data = self.syncTaskList;
				self.allMigrationJobsEchart.series[0].data = self.migrationTaskList;
				self.syncTotal = res.data.chart5.totalDataFlows;
				self.migrationTotal = res.data.chart1.totalDataFlows;

				self.dataScreening.series[0].data = [
					res.data.chart2[0].totalOutput,
					res.data.chart2[0].totalInput,
					res.data.chart2[0].totalInsert,
					res.data.chart2[0].totalUpdate,
					res.data.chart2[0].totalDelete
				];
				self.unitData = self.dataScreening.series[0].data;
				self.kbData = [res.data.chart2[0].totalOutputDataSize, res.data.chart2[0].totalInputDataSize];
				self.transfer.tableData = res.data.chart3;
				self.migrationJobStatusList = res.data.chart4;
				self.syncJobStatusList = res.data.chart6;

				// self.handleData(res.data.chart3);
			});
		},

		// 数据处理
		handleDataProcessing(dataItem) {
			let statusItem = [];
			dataItem.statusCount.sort((a, b) => (a._id > b._id ? 1 : a._id === b._id ? 0 : -1));
			dataItem.statusCount.forEach(element => {
				statusItem.unshift({ name: element._id, value: element.count });
			});
			statusItem.filter((item, index) => {
				if (item.name === 'stopping' || item.name === 'scheduled') {
					statusItem.splice(index, 1);
				}
			});
			return statusItem;
		},

		// 表格数据格式
		// formatterTime(row) {
		// 	let time = row.createTime ? this.$moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
		// 	return time;
		// },

		// async getRankingData() {
		// 	let barData = (
		// 		await insights.get({
		// 			'filter[limit]': 10,
		// 			'filter[skip]': 0,
		// 			'filter[order]': 'data.total_records desc',
		// 			'filter[where][stats_name]': 'publish_stats',
		// 			'filter[where][stats_granularity]': 'daily'
		// 			// 'filter[where][and][0][stats_time]': moment().format('YYYYMMDD000000')
		// 			//'filter[where][and][1][stats_time][lte]': moment().format('YYYYMMDD000000')
		// 		})
		// 	).data;
		// 	if (barData.length) {
		// 		barData.forEach(item => {
		// 			this.ranking.xAxis.data.push(item.data.api_name);
		// 			this.ranking.series[0].data.push(item.data.total_records);
		// 		});
		// 	}
		// },

		// 点击任务名称跳转到任务
		// hanleName(data) {
		// 	let routeUrl = null;
		// 	if (data.status === 'running') {
		// 		routeUrl = this.$router.resolve({
		// 			path: '/job',
		// 			query: { id: data.id, isMoniting: true }
		// 		});
		// 	} else {
		// 		routeUrl = this.$router.resolve({
		// 			path: '/job',
		// 			query: { id: data.id }
		// 		});
		// 	}

		// 	setTimeout(() => {
		// 		document.querySelectorAll('.el-tooltip__popper').forEach(it => {
		// 			it.outerHTML = '';
		// 		});
		// 		if (data.status === 'draft') {
		// 			window.open(routeUrl.href, 'edit_' + data.id);
		// 		} else {
		// 			window.open(routeUrl.href, 'monitor_' + data.id);
		// 		}
		// 	}, 200);
		// },

		// 点击全部
		getAllData(data) {
			switch (data.type) {
				case 'serverProcess':
					this.$router.push({
						path: '/clusterManagement'
					});
					break;
				case 'syncJobs':
					this.$router.push({
						path: '/dataFlows?mapping=custom'
					});
					break;
				case 'migrationJobs':
					this.$router.push({
						path: '/dataFlows?mapping=cluster-clone'
					});
					break;
			}
		},

		// 获取单位
		getUnit(type) {
			this.unitType = type;
			if (type === 'stage') {
				if (this.kbData.length) {
					this.dataScreening.series[0].data = this.kbData.map(item => {
						return (Number(item) / 1024).toFixed(2);
					});
				}
			} else {
				this.dataScreening.series[0].data = this.unitData;
			}
		},

		//
		// handleData(data) {
		// 	if (!data) return;
		// 	data.forEach(item => {
		// 		this.cookRecord(item);
		// 	});
		// },
		// cookRecord(item) {
		// 	item.newStatus = ['running', 'scheduled'].includes(item.status) ? 'scheduled' : 'stopping';
		// 	item.statusLabel = this.$t('dataFlow.status.' + item.status.replace(/ /g, '_'));
		// 	let statusMap = {};
		// 	if (item.stats) {
		// 		item.hasChildren = false;
		// 		item.input = item.stats.input ? item.stats.input.rows : '--';
		// 		item.output = item.stats.output ? item.stats.output.rows : '--';
		// 		item.transmissionTime = item.stats.transmissionTime
		// 			? ((item.input * 1000) / item.stats.transmissionTime).toFixed(0)
		// 			: '--';
		// 		let children = item.stages;
		// 		item.children = [];
		// 		if (children) {
		// 			let finishedCount = 0;
		// 			children.forEach(k => {
		// 				let stage = '';
		// 				let node = {};
		// 				if (item.stats.stagesMetrics) {
		// 					stage = item.stats.stagesMetrics.filter(v => k.id === v.stageId);
		// 				}
		// 				if (!stage.length) {
		// 					node = {
		// 						id: item.id + k.id,
		// 						name: k.name,
		// 						input: '--',
		// 						output: '--',
		// 						transmissionTime: '--',
		// 						hasChildren: true,
		// 						statusLabel: '--'
		// 					};
		// 				} else {
		// 					let stg = stage[0];
		// 					let statusLabel = stg.status ? this.$t('dataFlow.status.' + stg.status) : '--';
		// 					if (stg.status === 'cdc') {
		// 						let lag = `(${this.$t('dataFlow.lag')}${this.getLag(stg.replicationLag)})`;
		// 						statusLabel += lag;
		// 						statusMap.cdc = true;
		// 					}
		// 					if (stg.status === 'initializing') {
		// 						statusMap.initializing = true;
		// 					}
		// 					if (stg.status === 'initialized') {
		// 						finishedCount += 1;
		// 					}
		// 					node = {
		// 						id: item.id + k.id,
		// 						name: k.name,
		// 						input: stg.input.rows,
		// 						output: stg.output.rows,
		// 						transmissionTime: stg.transmissionTime,
		// 						hasChildren: true,
		// 						statusLabel
		// 					};
		// 				}
		// 				item.children.push(node);
		// 			});
		// 			if (finishedCount && !statusMap.cdc && !statusMap.initializing) {
		// 				statusMap.initialized = true;
		// 			}
		// 			let statusList = [];
		// 			for (const key in statusMap) {
		// 				statusList.push(key);
		// 			}
		// 			item.statusList = statusList;
		// 		}
		// 	} else {
		// 		item.input = '--';
		// 		item.output = '--';
		// 		item.transmissionTime = '--';
		// 	}
		// 	return item;
		// },

		getLag(lag) {
			let r = '0s';
			if (lag) {
				let m = moment.duration(lag, 'seconds');
				if (m.days()) {
					r = m.days() + 'd';
				} else if (m.hours()) {
					r = m.hours() + 'h';
				} else if (m.minutes()) {
					r = m.minutes() + 'm';
				} else {
					r = lag + 's';
				}
			}
			return r;
		}
	}
};
</script>

<style lang="less" scoped>
.dashboard {
	padding: 20px;
	.e-row {
		.e-col {
			height: 340px;
			border-radius: 3px;
			.charts-list {
				height: 320px;
				overflow: hidden;
				box-sizing: border-box;
				border: 1px solid #dcdfe6;
				box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
				.status-box {
					display: flex;
					flex: auto;
					height: calc(100% - 40px);
					align-items: center;
					justify-content: center;
					li {
						display: inline-block;
						padding: 0 30px;
						text-align: center;
						p {
							display: block;
							font-size: 14px;
							color: #666;
							text-align: center;
							user-select: none;
						}
						div {
							padding-top: 30px;
							font-size: 60px;
							color: #48b6e2;
							cursor: pointer;
						}
						.lagColor {
							color: #e6a23c;
						}
					}
				}
			}
			.unit {
				float: right;
				padding: 12px;
				font-size: 12px;
				color: #999;
			}
		}
		.info {
			float: left;
			width: 20%;
			padding: 75px 20px;
			span {
				display: block;
				font-size: 14px;
				color: #666;
				text-align: center;
			}
			.number {
				padding-top: 30px;
				font-size: 60px;
				color: #48b6e2;
			}
		}
		.jobList {
			float: left;
			width: 20%;
			padding: 78px 0;
			li {
				padding-bottom: 10px;
				cursor: pointer;
				span {
					display: inline-block;
					width: 50px;
					text-align: right;
					font-size: 12px;
				}
			}
		}
		.chart {
			float: left;
			width: 50%;
			height: 300px;
		}
		.charts-box {
			height: calc(100% - 40px);
		}
	}
	.taskNameStyle {
		color: #48b6e2;
		cursor: pointer;
	}
}
</style>
