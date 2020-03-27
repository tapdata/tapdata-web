<template>
	<div class="preview" ref="boxHeight">
		<el-tabs type="border-card" class="tabBox">
			<el-tab-pane label="Test Results">
				<template>
					<el-select v-model="selectNode" :placeholder="$t('message.placeholderSelect')">
						<el-option
								v-for="item in nodeList"
								:key="item.id"
								:label="item.tableName"
								:value="item.id">
						</el-option>
					</el-select>
					<el-table border :height="tableHeight" class="tableStyle" :data="itemList" v-loading="isloading">
						<el-table-column
								v-for="(head, key) in headers"
								:key="key" :prop="head"
								:label="head">
							<template slot-scope="scope">
								{{scope.row[head]}}
							</template>
						</el-table-column>
					</el-table>
				</template>
			</el-tab-pane>
			<el-tab-pane label="Logs">
				<template>
					<el-input
							class="inputStyle"
							:placeholder="$t('message.search')"
							v-model="search">
						<i slot="prefix" class="el-input__icon el-icon-search"></i>
					</el-input>
					<ul class="log" v-show="logCount > 0" ref="logContainer"></ul>
					<div v-show="logCount === 0" class="noText">
						<i class="iconfont icon icon-zanwushuju1" style="font-size: 174px"></i>
					</div>
				</template>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>
<script>
	import factory from '../../api/factory';
	import $ from 'jquery';

	const DataFlowsDebugs = factory('DataFlowsDebugs');
	const logsModel = factory('logs');
	export default {
		name: "Preview",
		props: {
			dataFlow: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				lastTime: '',
				tableHeight: '',
				nodeList: [], //下拉
				selectNode: '',
				tableName: '',
				tableName_list: [],
				search: '',
				item: 1,
				logCount: [],
				tableList: [],
				itemList: [],
				headers: [],
				activeTab: null,
				totalItems: 0,
				isloading: false,
				timer: null, //定时器
				status: '',
				// 通知
				notify: {
					show: false,
					msg: '',
					datatype: 1
				},
			};
		},

		mounted() {
			this.$nextTick(() => {
				this.tableHeight = this.$refs.boxHeight.clientHeight - 158;
			});

			this.nodeList = this.dataFlow.stages;
			if (this.nodeList.length > 0) {
				this.selectNode = this.nodeList[0].id;
			}
			// 这是一个定时器
			this.timer = setInterval(() => {
				this.getDataTableApi();
				this.getLogsData();
			}, 5000);
			this.$on("selected:stage", (selectStage) => {
				this.selectNode = selectStage.id;
			});
		},

		watch: {
			selectNode(val) {
				this.selectNode = val;
				this.getDataTableApi();
			},
			search(val) {
				this.search = val;
				this.getLogsData();
			},
		},

		methods: {
			async getDataTableApi() {
				// let tableList = [];
				let headerList = [];
				let params = {
					'filter[where][__tapd8.dataFlowId][regexp]': `^${this.dataFlow.id}$`,
					'filter[where][__tapd8.stageId]': this.selectNode
				};

				await DataFlowsDebugs.get(params).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						// this.nodeList = Object.keys(res.data);   // 获取下拉项
						if (res.data && res.data.length > 0) {
							// for(let i in res.data) {  // 获取选择后对应的表格数据
							//   if(this.selectNode === i) {
							//     tableList = res.data[i];
							//   }
							// }
							res.data.forEach(item => {
								delete item._id;
								delete item.__tapd8;
							});
							res.data.forEach(item => {  // 获取表头
								for (let key of Object.keys(item)) {
									headerList.push(key);
								}
							});
							headerList = headerList.filter((element, index, self) => { //表头去重
								return self.indexOf(element) === index;
							});
							this.headers = headerList;
							this.itemList = res.data;
						}
					}
				});
			},

			async getLogsData() {  //获取日志
				let paramas = {
					'filter[order]': 'date DESC',
					'filter[where][contextMap.dataFlowId][regexp]': `^${this.dataFlow.id}$`
				};
				// console.log(this.lastTime);
				if (!this.lastTime) {
					paramas['filter[limit]'] = 100;
				} else {
					paramas['filter[where][millis][gt]'] = this.lastTime;
				}
				if (this.search) {
					paramas['filter[where][$text][search]'] = this.search;
				}

				logsModel.get(paramas).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data && res.data.length > 0) {
							this.lastTime = res.data[0].millis;
							let logCount = res.data.length;
							this.logCount += logCount;

							for (let i = logCount - 1; i >= 0; i--) {
								let item = res.data[i];
								$(this.$refs.logContainer).prepend(
									$(`<li style="padding-bottom:10px;">
                        <span>[<i style="font-weight: bold;" class="${item.level == 'ERROR' ? 'redColor' : ''}">${item.level}</i>]</span> &nbsp;
                        <span>${item.date}</span>&nbsp;
                        <span>[${item.threadName}]</span>&nbsp;
                        <span>${item.loggerName}</span>&nbsp;-&nbsp;
                        <span>${item.message}</span>
                      </li>`)
								);
								item.date = item.date ? this.$moment(item.date).format('YYYY-MM-DD HH:mm:ss') : '';
								item.last_updated = item.last_updated ? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';
							}

						}
					}
				}).catch(err => {

				});
			},
		},
		destroyed() {
			//清除定时器
			clearInterval(this.timer);
			this.timer = null;
		}
	};
</script>
<style scope lang="less">
	.preview {
		width: 100%;
		height: 100%;
		padding: 20px;
		box-sizing: border-box;
		overflow: hidden;

		.tabBox {
			height: 100%;
			overflow: hidden;
		}

		.metadata-tap-bar {
			background-color: #00000000;
			border-bottom: 1px solid #00000030;
		}

		.tableStyle {
			margin-top: 20px;
		}

		li {
			list-style: none;
		}

		.redColor {
			color: red;
		}

		.mar0 {
			height: 100%;
			margin-bottom: 0 !important;
		}

		.inputStyle {
			width: 300px;
		}

		.log {
			width: 100%;
			display: inline-block;
			height: calc(100% - 103px);
			padding-top: 20px;
			overflow: auto;
		}

		.noText {
			display: flex;
			height: calc(100% - 60px);
			align-items: center;
			justify-content: center;
			color: #1976D2;
			font-size: 16px;
			background-color: #fff;
		}
	}

</style>
<style lang="less">
	.preview {
		.el-tab-pane, .card {
			height: 100% !important;
		}

		.el-tabs__content {
			height: calc(100% - 40px) !important;
			box-sizing: border-box;
		}

		.slider-color {
			background-color: #449dff;
		}

		.mar0 {
			justify-content: flex-end;

			.input-group {
				padding-top: 15px;
			}
		}

		.tabs__bar {
			height: 60px;
		}

		.table__overflow {
			border: 1px solid #efefef;
		}
	}
</style>
