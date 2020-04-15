<template>
	<div class="preview" ref="boxHeight">
		<el-form inline>
			<el-form-item :label="$t('editor.preview.stage')">
				<el-select v-model="stageId" :placeholder="$t('message.placeholderSelect')" size="mini">
					<el-option
							v-for="stage in dataFlow.stages"
							:key="stage.id"
							:label="stage.name"
							:value="stage.id">
					</el-option>
				</el-select>
			</el-form-item>

			<el-form-item :label="$t('editor.preview.table')">
				<el-select v-model="selectTableName" :placeholder="$t('message.placeholderSelect')" size="mini">
					<el-option
							v-for="item in nodeList"
							:key="item"
							:label="item"
							:value="item">
					</el-option>
				</el-select>
			</el-form-item>

			<i class="el-icon-loading" v-if="loading"></i>

		</el-form>

		<el-table border fit :height="tableHeight" class="tableStyle" :data="itemList" v-loading="isloading">
			<el-table-column
					minWidth="120"
					v-for="(head, key) in headers"
					:key="key"
					:prop="head"
					:label="head">
				<template slot-scope="scope">
					<span :title="scope.row[head]">{{scope.row[head]}}</span>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
	import factory from '../../api/factory';
	import {EditorEventType} from "../../editor/lib/events";

	const DataFlowsDebugs = factory('DataFlowsDebugs');
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
				tableHeight: '',
				nodeList: [], //下拉
				selectTableName: '',
				tableName: '',
				tableName_list: [],

				item: 1,
				tableList: [],
				itemList: [],
				headers: [],
				activeTab: null,
				totalItems: 0,
				isloading: false,
				timer: null, //定时器
				status: '',
				stageId: '',
				loading: false,
			};
		},

		mounted() {
			if (this.dataFlow && this.dataFlow.stages && this.dataFlow.stages.length > 0) {
				this.stageId = this.dataFlow.stages[0].id;
			}
			this.getStageTables();
			this.$nextTick(() => {
				this.tableHeight = this.$refs.boxHeight.clientHeight - 90;
			});
			// 这是一个定时器
			this.timer = setInterval(() => {
				this.getStageTables();
			}, 10000);

			this.$on(EditorEventType.SELECTED_STAGE, (selectStage) => {
				if (selectStage) {
					this.stageId = selectStage ? selectStage.id : '';
					this.getStageTables();
				}
			});

			this.$bus.on("currentStageId", (id) => {
				if (id !== "all") {
					this.stageId = id;
				}
				this.getStageTables();
			});
		},

		watch: {
			selectTableName() {
				this.getDataTableApi();
			},
			stageId: {
				handler() {
					this.getStageTables();
				}
			}

		},

		methods: {
			//获取下拉数据
			async getStageTables() {
				let params = {
					'dataFlowId': this.dataFlow.id,
					'stageId': this.stageId
				};
				this.loading = true;
				await DataFlowsDebugs.getTables(params).then(res => {
					if (res.status === 200 && res.statusText === "OK") {
						if (res.data && res.data.data.length > 0) {
							this.nodeList = res.data.data;
							if (!this.selectTableName && this.nodeList.length > 0) {
								this.selectTableName = this.nodeList[0];
							}
							if (!this.nodeList.includes(this.selectTableName)) {
								this.selectTableName = this.nodeList[0];
							}
						}
					}
					this.loading = false;
					this.getDataTableApi();
				}).catch(err => {
					this.loading = false;
				});
			},

			//获取表格数据
			async getDataTableApi() {
				let params = {
					'filter[where][__tapd8.dataFlowId][regexp]': `^${this.dataFlow.id}$`,
					'filter[where][__tapd8.stageId]': this.stageId,
					'filter[where][__tapd8.tableName]': this.selectTableName,
					'filter[order]': 'createTime DESC',
					'filter[limit]': 100
				};
				this.loading = true;
				await DataFlowsDebugs.get(params).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						// this.nodeList = Object.keys(res.data);   // 获取下拉项
						if (res.data && res.data.length > 0) {
							// for(let i in res.data) {  // 获取选择后对应的表格数据
							//   if(this.selectTableName === i) {
							//     tableList = res.data[i];
							//   }
							// }
							// res.data.forEach(item => {
							// 	delete item.id;
							// 	delete item.__tapd8;
							// 	item.last_updated = item.last_updated ? this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';
							// });
							let datas = res.data.map(item => {
								return item.masterData;
							});
							let headerList = [];

							datas.forEach(item => {  // 获取表头
								Object.keys(item).forEach(key => {
									if (!headerList.includes(key)) {
										headerList.push(key);
									}
								});
							});
							headerList.sort();
							this.headers = headerList;
							this.itemList = datas;
						} else {
							this.itemList = [];
						}
					}
					this.loading = false;
				}).catch(err => {
					this.loading = false;
				});
			}
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

		// .tabBox {
		// 	height: 100%;
		// 	overflow: hidden;
		// }
		.el-form {
			position: relative;

			.el-icon-loading {
				right: 10px;
				top: 10px;
				position: absolute;
			}
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

		.mar0 {
			height: 100%;
			margin-bottom: 0 !important;
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

		.el-form-item {
			margin-bottom: 0;
		}
	}
</style>
