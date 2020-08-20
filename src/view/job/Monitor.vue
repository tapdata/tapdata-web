<template>
	<div class="e-job-monitor">
		<el-form>
			<el-form-item class="e-form-item">
				<el-col :span="16">
					<el-select v-model="stageId" size="mini">
						<el-option key="all" :label="$t('dataFlow.allNode')" value="all"> </el-option>
						<el-option v-for="item in flow.stages" :key="item.id" :label="item.name" :value="item.id">
						</el-option>
					</el-select>
				</el-col>
				<el-col :span="4" style="text-align: right;">
					<el-button class="e-button" type="primary" v-if="stageId !== 'all'" @click="seeNodeData">{{
						$t('dataFlow.button.viewConfig')
					}}</el-button>
				</el-col>
				<el-col :span="4" style="float: right; text-align: right;">
					<el-button
						class="e-button"
						size="mini"
						type="primary"
						@click="handleGoDataVerify"
						:loading="loading"
						>{{ $t('dataVerify.dataVerify') }}</el-button
					>
				</el-col>
			</el-form-item>
		</el-form>
		<div class="echartMain">
			<div class="echartlist">
				<echart-head :data="taskDetailsObj"></echart-head>
				<div
					class="info fl"
					v-if="stageType === 'table' || stageType === 'collection' || stageType === 'database'"
					v-loading="apiLoading"
				>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.nodeName') }}:</span>
						<el-tooltip :content="stage.nodeName" placement="bottom-start">
							<!-- @click="handTableName(stage)" style="color: #48b6e2;cursor: pointer;" -->
							<span class="info-text">{{ stage.nodeName }}</span>
						</el-tooltip>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.ownedLibrary') }}:</span>
						<el-tooltip :content="stage.name" placement="bottom-start">
							<!-- @click="handDatabaseName(stage)" -->
							<span class="info-text">{{ stage.name }}</span>
						</el-tooltip>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataForm.form.host') }}:</span>
						<el-tooltip :content="stage.database_host" placement="bottom-start">
							<span class="row-text">{{ stage.database_host }}</span>
						</el-tooltip>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataForm.form.databaseName') }}:</span>
						<span class="info-text">{{ stage.database_name }}</span>
					</div>
					<div class="info-list" v-if="stage.database_type !== 'mongodb'">
						<span class="info-label">{{ $t('dataFlow.ownedUser') }}:</span>
						<span class="info-text">{{ stage.database_owner }}</span>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataForm.form.databaseType') }}:</span>
						<span class="info-text">{{ stage.database_type }}</span>
					</div>
					<!-- <div class="info-list">
						<span class="info-label">{{ $t('dataFlow.inputNumber') }}:</span>
						<span class="info-text"> {{ flow.inputNumber }}</span>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.outputNumber') }}:</span>
						<span class="info-text">{{ flow.outputNumber }}</span>
					</div> -->
				</div>
				<div class="info fl" v-else>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.taskName') }}:</span>
						<el-tooltip :content="flow.name" placement="bottom-start">
							<span class="info-text" style="color: #48b6e2;">{{ flow.name }}</span>
						</el-tooltip>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.creatdor') }}:</span>
						<el-tooltip :content="flow.name">
							<span class="info-text">{{ flow.username }}</span>
						</el-tooltip>
					</div>
					<div class="info-list" v-if="flow.startTime">
						<span class="info-label">{{ $t('dataFlow.executionTime') }}:</span>
						<span class="info-text">{{ $moment(flow.startTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
					</div>
					<div v-if="flow.finishTime" class="info-list">
						<span class="info-label">{{ $t('dataFlow.finishTime') }}:</span>
						<span class="info-text">{{ $moment(flow.finishTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.inputNumber') }}:</span>
						<span class="info-text"> {{ flow.inputNumber }}</span>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.outputNumber') }}:</span>
						<span class="info-text">{{ flow.outputNumber }}</span>
					</div>
					<div class="info-list">
						<span class="info-label">{{ $t('dataFlow.timePoint') }}:</span>
						<div class="row-text">
							<div v-for="(item, index) in cdcLastTimes" :key="index">
								<span>{{ $t('dataFlow.sourceLibrary') }}: </span>
								<span> {{ item.sourceConnectionName }} </span>
								<ul class="cdcTarget">
									<li v-for="(childerItem, childerIndex) in item.targetList" :key="childerIndex">
										<span class="cdcTime"
											>{{ $moment(childerItem.cdcTime).format('YYYY-MM-DD HH:mm:ss') }}
										</span>
										<span
											>{{ $t('dataFlow.targetLibrary') }}: {{ childerItem.targetConnectionName }}
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="echartlist">
				<echart-head :data="screeningObj" @twoRadio="getTwoRadio"></echart-head>
				<shaftless-echart
					:sliderBar="sliderBar"
					class="fr echartMain"
					:echartObj="dataScreening"
					v-if="dataScreening"
					:echartsId="'dataScreeningId'"
					style="width: 100%"
				></shaftless-echart>
			</div>

			<div class="echartlist">
				<echart-head :data="inputOutputObj" @getSpeed="getSpeed"></echart-head>
				<div class="floatLayer">
					<span style="background-color:rgba(72,182,226,.3);color:#48b6e2;"
						>{{ $t('dataFlow.average') }}:{{ this.inputAverage }}</span
					>
					<span style="background-color:rgba(98,165,105,.3);color:#62a569;"
						>{{ $t('dataFlow.average') }}:{{ this.outputAverage }}</span
					>
				</div>
				<echarts-compinent
					:sliderBar="sliderBar"
					:echartObj="throughputData"
					v-if="throughputData"
					:echartsId="'echartsId'"
					style="width: 100%"
				></echarts-compinent>
			</div>
			<div class="echartlist">
				<echart-head :data="transfObj" @getTime="getTime"></echart-head>
				<div class="floatLayer">
					<span style="background-color:rgba(251,142,0,.3);color:#fb8e00;"
						>{{ $t('dataFlow.current') }}:{{ this.currentTime }}</span
					>
				</div>
				<echarts-compinent
					:sliderBar="sliderBar"
					:echartObj="transfData"
					v-if="transfData"
					:echartsId="'transfId'"
					style="width: 100%"
				></echarts-compinent>
			</div>
			<div class="echartlist">
				<echart-head :data="replicateObj" @getTime="getTime"></echart-head>
				<div class="floatLayer">
					<span style="background-color:rgba(7245,108,108,.3);color:#f56c6c;"
						>{{ $t('dataFlow.current') }}:{{ this.ransfTime }}</span
					>
				</div>
				<echarts-compinent
					:sliderBar="sliderBar"
					:echartObj="replicateData"
					v-if="replicateData"
					:echartsId="'replicateId'"
					style="width: 100%"
				></echarts-compinent>
			</div>
		</div>
	</div>
</template>
<script>
import echartHead from './components/echartHead';
import echartsCompinent from '../../components/echartsCompinent';
import shaftlessEchart from '../../components/shaftlessEchart';
import factory from '../../api/factory';
import { EditorEventType } from '../../editor/lib/events';
import ws from '../../api/ws';
const dataFlows = factory('DataFlows');
const connectionApi = factory('connections');
let currentStageData = null;
export default {
	name: 'JobMonitor',
	components: { echartHead, echartsCompinent, shaftlessEchart },
	props: {
		dataFlow: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			tooltipFlag: false,
			apiLoading: false,
			loading: false,
			stageType: '',
			sliderBar: null,
			dpx: 'QPS',
			selectFlow: 'flow_', // 选中节点
			speed: '',
			time: '',
			stageId: 'all',
			flow: {
				name: '',
				username: '',
				createTime: '',
				status: '',
				startTime: '',
				inputNumber: '',
				outputNumber: '',
				stages: [],
				id: '',
				cdcLastTimes: []
			},
			stage: {
				nodeName: '',
				database_host: '',
				database_name: '',
				database_owner: '', // 所属用户
				database_type: '',
				name: ''
			},
			throughputData: {
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					// data: [this.$t('dataFlow.input'),this.$t('dataFlow.output')],
				},
				grid: {
					show: false
				},
				toolbox: {
					show: true,
					feature: {
						dataZoom: {
							yAxisIndex: 'none'
						}
					}
				},
				xAxis: {
					axisLine: {
						lineStyle: {
							color: '#48b6e2',
							width: 2 // 这里是为了突出显示加上的
						}
					},
					data: []
				},
				yAxis: {
					axisLine: {
						lineStyle: {
							color: '#48b6e2'
						}
					},
					axisLabel: {
						formatter: function(value) {
							if (value >= 10000) {
								value = value / 10000 + 'W';
							}
							return value;
						}
					}
				},
				series: [
					{
						name: this.$t('dataFlow.input'),
						type: 'line',
						smooth: true,
						data: [],
						itemStyle: {
							color: '#2ba7c3'
						},
						lineStyle: {
							color: '#2ba7c3'
						}
					},
					{
						name: this.$t('dataFlow.output'),
						type: 'line',
						smooth: true,
						data: [],
						itemStyle: {
							color: '#61a569'
						},
						lineStyle: {
							color: '#8cd5c2' // 改变折线点的颜色
						}
					}
				]
			},
			transfData: {
				tooltip: {
					trigger: 'axis'
				},
				grid: {
					show: false
				},
				legend: {
					// data: [this.$t('dataFlow.input'),this.$t('dataFlow.output')],
				},
				toolbox: {
					show: true
					// feature: {
					//   dataZoom: {
					//     yAxisIndex: 'none'
					//   },
					// }
				},
				xAxis: {
					axisLine: {
						lineStyle: {
							color: '#fb8e00',
							width: 2 // 这里是为了突出显示加上的
						}
					},
					data: []
				},
				yAxis: {
					axisLine: {
						lineStyle: {
							color: '#fb8e00',
							width: 2 // 这里是为了突出显示加上的
						}
					},
					axisLabel: {
						formatter: function(value) {
							if (value >= 10000) {
								value = value / 10000 + 'W';
							}
							return value;
						}
					}
				},
				series: [
					{
						type: 'line',
						smooth: true,
						data: [],
						itemStyle: {
							color: '#fb8e00'
						},
						lineStyle: {
							color: '#fb8e00'
						}
					}
				]
			},
			replicateData: {
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					// data: ['最高气温', '最低气温'],
				},
				grid: {
					show: false
				},
				toolbox: {
					show: true,
					feature: {
						dataZoom: {
							yAxisIndex: 'none'
						}
					}
				},
				xAxis: {
					axisLine: {
						lineStyle: {
							color: '#f56c6c'
						}
					},
					data: []
				},
				yAxis: {
					axisLine: {
						lineStyle: {
							color: '#f56c6c'
						}
					},
					axisLabel: {
						formatter: function(value) {
							if (value >= 10000) {
								value = value / 10000 + 'W';
							}
							return value;
						}
					}
				},
				series: [
					{
						type: 'line',
						data: [],
						smooth: true,
						itemStyle: {
							color: '#f56c6c'
						},
						lineStyle: {
							color: '#f56c6c'
						}
					}
				]
			},

			dataScreening: null, // 数据总览的echart数据
			screeningObj: null, // 数据总览的头
			taskDetailsObj: null,

			inputOutputObj: null,
			transfObj: null,
			storeData: null,
			replicateObj: null,
			throughput_time: [],
			inputAverage: '', // 输入平均值
			outputAverage: '', // 输出平均值
			currentTime: '', // 当前耗时
			ransfTime: '', // 传输耗时
			throughputTime: 'minute',
			isThroughputAll: '',
			dataOverviewAll: '',
			transfTime: 'minute',
			replicateTime: 'minute',
			transfType: '',
			replicateType: '',
			dataOverviewType: '',

			selectId: '',
			timer: null, // 定时器
			timer1: null, // 定时器
			timer2: null, // 定时器
			timer3: null, // 定时器
			intervalThroughputpop: 20000,
			intervalTransf: 20000,
			intervalReplicate: 20000,
			cdcLastTimes: []
		};
	},

	mounted() {
		this.sliderBar = this.editor.rightSidebar;
		this.$on(EditorEventType.SELECTED_STAGE, selectStage => {
			if (selectStage) {
				this.stageId = selectStage.id;
				this.getStageDataApi(selectStage.form_data.connectionId);
				this.stage.nodeName = selectStage.form_data.name;
				this.stageType = selectStage.type;
				let rightTabPanel = this.editor.getRightTabPanel();
				let panel = rightTabPanel.getChildByName('nodeSettingPanel');
				if (this.editor.seeMonitor) {
					this.editor.getRightSidebar().show();
					panel = rightTabPanel.getChildByName('monitor');
				}
				rightTabPanel.select(panel);
			} else {
				this.stageId = 'all';
			}
		});
		this.flow = this.dataFlow;

		this.taskDetailsObj = {
			title: this.$t('dataFlow.taskDetail'),
			type: 'taskDetails'
		};

		this.screeningObj = {
			title: this.$t('dataFlow.dataScreening'),
			type: 'screening',
			isScreeing: false
		};

		this.inputOutputObj = {
			title: this.$t('dataFlow.inputOutput'),
			isScreeing: false,
			isIput: true,
			isSpeed: true,
			loading: false,
			type: 'throughput',
			tip: this.$t('dataFlow.throughputpop')
		};

		this.transfObj = {
			title: this.$t('dataFlow.transf'),
			type: 'transf',
			isIput: true,
			loading: false,
			tip: this.$t('dataFlow.transtime_pop')
		};

		this.replicateObj = {
			title: this.$t('dataFlow.replicate'),
			type: 'replicate',
			isIput: true,
			loading: false,
			tip: this.$t('dataFlow.replicate_pop')
		};
		// this.flow.createTime = this.dataFlow.createTime
		// 	? this.$moment(this.dataFlow.createTime).format('YYYY-MM-DD HH:mm:ss')
		// 	: '';
		this.flow.username = (this.dataFlow.user && this.dataFlow.user.email) || '';
		let self = this;
		ws.on('dataFlowInsight', function(data) {
			self.storeData = data.statsData;
			self.dataProcessing(data);
		});
		this.getApiData();
	},

	watch: {
		dataFlow: {
			handler(val) {
				this.flow = val;
				this.flow.createTime = val.createTime ? this.$moment(val.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
				this.flow.startTime = val.startTime ? this.$moment(val.startTime).format('YYYY-MM-DD HH:mm:ss') : '';
				this.flow.finishTime = val.finishTime ? this.$moment(val.finishTime).format('YYYY-MM-DD HH:mm:ss') : '';

				this.flow.username = (val.user && val.user.email) || '';
				this.flow.status = val.status;
				if (this.flow.status === 'force stopping') {
					this.flow.status = 'force_stopping';
				}

				let cdcList = [];
				if (this.flow.cdcLastTimes && this.flow.cdcLastTimes.length) {
					this.flow.cdcLastTimes.forEach(item => {
						let flag = cdcList.find(ele => ele.sourceConnectionId === item.sourceConnectionId);
						if (!flag) {
							cdcList.push({
								sourceConnectionName: item.sourceConnectionName,
								sourceConnectionId: item.sourceConnectionId,
								targetList: [item]
							});
						} else {
							flag.targetList.push(item);
						}
					});
				}
				this.cdcLastTimes = cdcList || [];
			},
			deep: true
		},
		stageId: {
			handler(val) {
				let cell = this.editor.getAllCells();
				this.selectId = val;
				if (val === 'all') {
					this.selectFlow = 'flow_';
					this.stageType = '';
				} else {
					this.selectFlow = 'stage_';

					cell.forEach(item => {
						if (item.get('id') === val) {
							currentStageData = item.getFormData();
						}
					});
					this.stageType = currentStageData.type;
					this.getStageDataApi(currentStageData.connectionId);
				}
				this.getApiData();
			},
			deep: true
		}
	},

	methods: {
		// // 点击节点跳转到表
		// handTableName(data) {
		// 	top.location.href = '/#/metadataInstances/' + data.id;
		// },

		// // 跳转到所属库
		// handDatabaseName(data) {
		// 	debugger;
		// 	top.location.href = '/#/metadataInstances/' + data.id;
		// },

		getApiData() {
			if (this.stageId === 'all') {
				this.selectFlow = 'flow_';
			} else {
				this.selectFlow = 'stage_';
			}

			let msg = {
				type: 'dataFlowInsight',
				granularity: {
					throughput: this.selectFlow + this.throughputTime,
					trans_time: this.selectFlow + this.transfTime,
					repl_lag: this.selectFlow + this.replicateTime,
					data_overview: this.dataOverviewAll
				},
				dataFlowId: this.flow.id
			};
			if (this.stageId != 'all') {
				msg['stageId'] = this.stageId;
			}

			if (ws.ws.readyState == 1) ws.send(msg);
		},
		// 获取所有节点
		getAllCellsNode(queryString) {
			let dataCells = this.editor.getAllCells();
			let dataCellName = [];
			dataCells.forEach(cell => {
				let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null;
				let tableName = { value: formData.tableName, cell: cell };
				dataCellName.push(tableName);
			});
			var restaurants = dataCellName;
			var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
			// 调用 callback 返回建议列表的数据
			return results;
		},

		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
			};
		},

		seeNodeData() {
			let result = this.getAllCellsNode();
			let selectCell = null;
			result.forEach(item => {
				if (this.stageId === item.cell.id) {
					selectCell = item.cell;
				}
			});
			if (this.stageId && this.stageId !== 'all') {
				this.editor.seeMonitor = false;
				this.editor.graph.selectionPosition(selectCell);
			}
			// else {
			// 	this.editor.showSetting(true);
			// 	this.$message.error(this.$t('dataFlow.selectNode'));
			// }
		},

		// 输入输出获取数据
		getSpeed(data, time) {
			this.isThroughputAll = data;
			this.throughputTime = time;
			switch (time) {
				case 'second':
					this.intervalThroughputpop = 20000;
					break;
				case 'minute':
					this.intervalThroughputpop = 60000;
					break;
				case 'hour':
					this.intervalThroughputpop = 360000;
					break;
				case 'day':
					this.intervalThroughputpop = 86400000;
					break;
			}
			this.getApiData();
		},

		// 获取返回的单位
		getTwoRadio(data, type) {
			this.dataOverviewType = type;
			this.dataOverviewAll = data;
			this.getApiData();
		},

		// 获取返回的时间
		getTime(data, type) {
			if (type === 'transf') {
				this.transfType = type;
				this.transfTime = data;
				switch (data) {
					case 'second':
						this.intervalTransf = 20000;
						break;
					case 'minute':
						this.intervalTransf = 60000;
						break;
					case 'hour':
						this.intervalTransf = 360000;
						break;
					case 'day':
						this.intervalTransf = 86400000;
						break;
				}
			} else if (type === 'replicate') {
				switch (data) {
					case 'second':
						this.intervalReplicate = 20000;
						break;
					case 'minute':
						this.intervalReplicate = 60000;
						break;
					case 'hour':
						this.intervalReplicate = 360000;
						break;
					case 'day':
						this.intervalReplicate = 86400000;
						break;
				}
				this.replicateType = type;
				this.replicateTime = data;
			}
			this.getApiData();
		},

		// 数据处理
		dataProcessing(data) {
			let timeList = [],
				ttimeList = [],
				rttimeList = [],
				inputSizeList = [],
				outputSizeList = [],
				inputCountList = [],
				outputCountList = [],
				dataList = [],
				tdataList = [];
			function ptime(type) {
				data.statsData[type].forEach(time => {
					switch (data.granularity[type].split('_')[1]) {
						case 'second':
							time.t = time.t.substring(11, 19);
							break;
						case 'minute':
							time.t = time.t.substring(11, 16);
							break;
						case 'hour':
							time.t = time.t.substring(11, 16);
							break;
						case 'day':
							time.t = time.t.substring(6, 10);
					}
				});
			}
			ptime('repl_lag');
			ptime('trans_time');
			ptime('throughput');
			let time = data.statsData.data_overview.t;
			// let inputSize = data.statsData.data_overview.inputSize;
			// let outputSize = data.statsData.data_overview.outputSize;
			// let inputCount = data.statsData.data_overview.inputCount;
			// let outputCount = data.statsData.data_overview.outputCount;

			let statisticsData = [88, 123, 45, 788, 11];
			this.getScreening(time, statisticsData);

			data.statsData.throughput.forEach(item => {
				timeList.push(item.t); // 时间
				inputSizeList.push(item.inputSize);
				outputSizeList.push(item.outputSize);
				inputCountList.push(item.inputCount);
				outputCountList.push(item.outputCount);
			});

			if (this.isThroughputAll === 'qps') {
				this.dpx = 'QPS';
				this.inputAverage = inputCountList[inputCountList.length - 1];
				this.outputAverage = outputCountList[outputCountList.length - 1];
				this.getThroughputEchart(timeList, inputCountList, outputCountList);
			} else {
				this.dpx = 'KB';
				this.inputAverage = inputSizeList[inputSizeList.length - 1];
				this.outputAverage = outputSizeList[outputSizeList.length - 1];
				this.getThroughputEchart(timeList, inputSizeList, outputSizeList);
			}
			data.statsData.trans_time.forEach(item => {
				ttimeList.push(item.t); // 时间
				dataList.push(item.d);
			});
			this.currentTime = dataList[dataList.length - 1];
			this.getTransTime(ttimeList, dataList);
			data.statsData.repl_lag.forEach(item => {
				rttimeList.push(item.t); // 时间
				tdataList.push(item.d);
			});
			this.ransfTime = dataList[tdataList.length - 1];
			this.getReplicateTime(rttimeList, tdataList);
		},

		getScreening(time, seriesData) {
			this.dataScreening = {
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
					type: 'value',
					min: 0,
					axisLine: { show: false },
					axisTick: { show: false },
					splitLine: { show: false },
					splitArea: { show: false },
					axisLabel: {
						formatter: function() {
							return '';
						}
					}
				},
				series: [
					{
						type: 'bar',
						data: seriesData,
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
								}
							}
						}
					}
				]
			};
		},

		getThroughputEchart(time, series1, series2) {
			this.throughputData.xAxis.data = time;
			this.throughputData.series[0].data = series1;
			this.throughputData.series[1].data = series2;
		},

		getTransTime(time, series) {
			this.transfData.xAxis.data = time;
			this.transfData.series[0].data = series;
		},

		getReplicateTime(time, series) {
			this.replicateData.xAxis.data = time;
			this.replicateData.series[0].data = series;
		},

		// 获取stage的节点信息
		getStageDataApi(id) {
			this.apiLoading = true;
			connectionApi
				.customQuery([id])
				.then(res => {
					if (res.data) {
						this.stage = res.data;
						this.stage.nodeName = currentStageData.name;
					}
				})
				.finally(() => {
					this.apiLoading = false;
				});
		},

		// 跳转到数据校验页面
		handleGoDataVerify() {
			this.loading = true;
			dataFlows
				.get([this.flow.id], {
					fields: ['validateBatchId', 'validateStatus', 'validateFailedMSG']
				})
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						this.loading = false;
						if (
							Object.keys(res.data).length === 0 ||
							(res.data.validateBatchId && res.data.validateBatchId === '')
						) {
							this.editor.showDataVerify();
						} else {
							this.editor.showResult();
						}
					}
				});
		},

		// tooltip的可控
		visibilityChange(event) {
			const ev = event.target;
			const ev_height = ev.offsetHeight; // 文本的实际高度
			const content_height = this.$refs.tlp.$el.parentNode.clientHeight; // 文本容器高度
			if (content_height < ev_height) {
				// 实际内容高度 > 文本高度 =》内容溢出
				this.tooltipFlag = true; // NameIsIncludeWord ? true : !!false
			} else {
				// 否则为不溢出
				this.tooltipFlag = false;
			}
		}
	},

	destroyed() {
		// 清除定时器
		clearInterval(this.timer);
		this.timer = null;
	}
};
</script>
<style scoped lang="less">
.e-job-monitor {
	width: 100%;
	padding: 5px 12px 10px;
	box-sizing: border-box;
	position: relative;
	.e-form-item {
		.e-button {
			height: 30px;
			line-height: 30px;
			padding: 0 10px;
			font-size: 12px;
		}
	}
	.e-job-monitor-btn {
		position: absolute;
		top: 15px;
		right: 15px;
	}
	.el-form-item {
		margin-bottom: 0;
	}

	.echartMain {
		height: 100%;

		.echartlist {
			position: relative;
			width: 100%;
			height: 330px;
			margin-top: 6px;
			border: 1px solid #dcdfe6;
			border-radius: 3px;
			box-shadow: 1.414px 1.414px 5px rgba(0, 0, 0, 0.1);
			overflow: hidden;
			.echartMain {
				width: 100% !important;
				height: calc(100% - 40px);
			}

			.floatLayer {
				position: absolute;
				left: 20px;
				top: 50px;

				span {
					display: inline-block;
					min-width: 60px;
					margin-bottom: 10px;
					padding: 3px 6px;
					font-size: 12px;
					background: #f00;
				}
			}

			.info {
				width: 100%;
				height: calc(100% - 40px);
				padding: 20px 10px 10px 30px;
				box-sizing: border-box;
				overflow: auto;
				.info-list {
					display: flex;
					padding-bottom: 15px;
					overflow: hidden;
					.info-label {
						display: block;
						width: 90px;
						font-size: 12px;
						color: #999;
					}

					.row-text {
						display: block;
						max-width: calc(100% - 95px);
						font-size: 12px;
						color: #333;
					}

					.cdcTarget {
						padding: 5px 0;
						color: #999;
					}
					.cdcTime {
						padding-right: 15px;
					}

					.info-text {
						display: block;
						max-width: calc(100% - 95px);
						height: 16px;
						font-size: 12px;
						color: #333;
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
					}
				}
			}
		}
	}
}
</style>
