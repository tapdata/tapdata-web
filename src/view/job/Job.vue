<template>
	<div class="editor-container" v-loading="loading">
		<div class="action-buttons">
			<!-- <el-button size="mini" type="default" @click="reloadSchema"
				>{{ $t("dataFlow.button.reloadSchema") }}
			</el-button>
			<el-button
				v-if="['draft', 'paused', 'error'].includes(status)"
				size="mini"
				type="default"
				@click="showSetting"
				>{{ $t("dataFlow.button.setting") }}
			</el-button> -->
			<!-- <el-button v-if="dataFlowId && 'draft' !== status" size="mini" type="default" @click="showLogs"
				>{{ $t("dataFlow.button.logs") }}
			</el-button> -->

			<!-- editing debug -->
			<!-- <el-button v-if="['paused', 'error', 'draft'].includes(status)" size="mini" type="default" @click="preview"
				>{{ $t("dataFlow.button.preview") }}
			</el-button> -->

			<!-- running debug -->
			<el-button
				v-if="['scheduled', 'running'].includes(status) && executeMode === 'normal'"
				size="mini"
				type="default"
				@click="capture"
				>{{ $t("dataFlow.button.capture") }}
			</el-button>
			<el-button
				v-if="['scheduled', 'running'].includes(status) && executeMode === 'running_debug'"
				size="mini"
				type="default"
				@click="stopCapture"
				>{{ $t("dataFlow.button.stop_capture") }}
			</el-button>

			<!-- <el-button
				v-if="dataFlowId !== null && ['draft', 'paused', 'error'].includes(status)"
				size="mini"
				type="success"
				@click="start"
				>{{ $t("dataFlow.button.start") }}
			</el-button> -->
			<!-- <el-button
				v-if="dataFlowId !== null && ['scheduled', 'running'].includes(status)"
				size="mini"
				type="danger"
				@click="stop(false)"
				>{{ $t("dataFlow.button.stop") }}
			</el-button> -->
			<el-button
				v-if="dataFlowId !== null && ['stopping'].includes(status)"
				size="mini"
				type="danger"
				@click="stop(true)"
				>{{ $t("dataFlow.button.force_stop") }}
			</el-button>
			<!-- <el-button
				v-if="dataFlowId !== null && !['scheduled', 'running', 'stopping', 'force stopping'].includes(status)"
				size="mini"
				type="default"
				@click="reset"
				>{{ $t("dataFlow.button.reset") }}
			</el-button> -->
			<!-- <el-button
				v-if="!['scheduled', 'running', 'stopping', 'force stopping'].includes(status)"
				size="mini"
				type="primary"
				@click="save"
				>{{ $t("dataFlow.button.save") }}
			</el-button> -->
			<div class="headImg" @click="save" v-if="!['scheduled', 'running', 'stopping', 'force stopping'].includes(status)">
				<span class="iconfont icon-yunduanshangchuan"></span>
				<span class="text">{{$t('dataFlow.button.save')}}</span>
			</div>
			 <div  class="headImg" v-if="['paused', 'error', 'draft'].includes(status)" @click="preview" :title="$t('dataFlow.button.preview')">
				<span class="iconfont icon-openeye"></span>
			</div>
			<div  class="headImg" @click="reloadSchema" :title="$t('dataFlow.button.reloadSchema')">
				<span class="iconfont icon-yunshuaxin"></span>
			</div>
			<div  class="headImg"	@click="showLogs" :title="$t('dataFlow.button.debug')">
				<span class="iconfont icon-debug-"></span>
			</div>
			<div  class="headImg round" @click="showSetting" 	v-if="['draft', 'paused', 'error'].includes(status)">
				<span class="iconfont icon-shezhi"></span>
				<span class="text">{{$t('dataFlow.button.quantitative')}} + {{$t('dataFlow.button.increment')}}</span>
			</div>

			<el-tag
				:type="status === 'running'
					? 'success'
					: status === 'error'
					? 'danger'
					: status === 'paused'
					? 'warning'
					: 'info'
				"
				effect="plain"
				size="small"
				style="margin-left: 50px;border-radius: 20px;"
				>{{ $t("dataFlow.state") }}: {{ $t("dataFlow.status." + status.replace(/ /g, "_")) }}
			</el-tag>
			<div  class="headImg borderStyle" @click="start" :title="$t('dataFlow.button.start')"	v-if="dataFlowId !== null && ['draft', 'paused', 'error'].includes(status)">
				<span class="iconfont icon-yunhang1"></span>
			</div>
			<div  class="headImg borderStyle" @click="stop(false)" :title="$t('dataFlow.button.stop')"	v-if="dataFlowId !== null && ['scheduled', 'running'].includes(status)">
				<span class="iconfont icon-zanting2"></span>
			</div>
			<div  class="headImg borderStyle" @click="reset" :title="$t('dataFlow.button.reset')"	v-if="dataFlowId !== null && !['scheduled', 'running', 'stopping', 'force stopping'].includes(status)">
				<span class="iconfont icon-shuaxin3"></span>
			</div>
			<div  class="headImg round" @click="submitLayer" style="float: right;">
				<span class="iconfont icon-icon_fabu"></span>
				<span class="text">{{$t('dataFlow.button.submit')}}</span>
			</div>
			<!-- <el-button size="mini" type="primary" @click="switchModel">Model</el-button> -->
		</div>
		<el-dialog :title="$t('dataFlow.submitConfirmation')" custom-class="dialogConfig" :visible.sync="dialogFormVisible">
			<el-form :model="form" label-position="left">
				<el-form-item :label="$t('dataFlow.taskName')">
					<el-input class="e-input" v-model="form.taskName" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item :label="$t('dataFlow.implementationModalities')">
					<el-input class="e-input" v-model="form.type" autocomplete="off" disabled></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button class="e-button" @click="dialogFormVisible = false">{{$t('message.cancel')}}</el-button>
				<el-button class="e-button" type="primary" @click="submitTemporary">{{$t('dataFlow.submitOnly')}}</el-button>
				<el-button class="e-button" type="primary" @click="start">{{$t('dataFlow.submitExecute')}}</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import $ from "jquery";
import factory from "../../api/factory";
import editor from "../../editor/index";
import breakText from "../../editor/breakText";
import log from "../../log";
import { FORM_DATA_KEY, JOIN_TABLE_TPL } from "../../editor/constants";
import {EditorEventType} from "../../editor/lib/events";
import _ from "lodash";

const dataFlowsApi = factory("DataFlows");
let changeData = null;
let timer = null;
export default {
	name: "Job",
	dataFlow: null,
	data() {
		return {
			dialogFormVisible: false,
			form:{
				taskName: '',
				type: this.$t('dataFlow.button.quantitative') + '+' + this.$t('dataFlow.button.increment')
			},
			// run model: editable,readonly
			model: "editable",

			dataFlowId: null,
			status: "draft",
			executeMode: "normal",

			loading: true,
			disabledDataVerify: false,
			cells: []
		};
	},

	watch: {
		/* executeMode: {
				handler(){
					if( this.executeMode !== 'normal') {
						this.showCapture();
					}
				}
			}, */
		status: {
			handler() {
				if (["draft", "error", "paused"].includes(this.status)) {
					this.setEditable(true);
				} else {
					this.setEditable(false);
				}
			}
		}
	},
	mounted() {
		let self = this;

		// build editor
		self.editor = editor({
			container: $(".editor-container"),
			actionBarEl: $(".editor-container .action-buttons")
		});

		// load dataFlow if exists data flow id
		if (self.$route.query && self.$route.query.id) {
			self.loadDataFlow(self.$route.query.id);
		} else {
			self.loading = false;
		}

		// self.editor.getUI().getBackButtonEl().on('click', () => {
		// 	self.$router.push({path: '/dataFlows'});
		// });
		 this.editor.graph.on(EditorEventType.DATAFLOW_CHANGED, () =>{
			changeData = this.getDataFlowData(true);
		});

		timer = setInterval(() => {
			if(changeData) {
				this.timeSave();
			}
		}, 10000);
	},

	beforeDestroy() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		this.editor.destroy();
		timer.clearTimeout();
	},

	methods: {
		/**
		 * submit temporary
		 */
      	submitTemporary() {
			let self = this,
          	data = this.getDataFlowData();

			if (data) {
				if (data.id) {
					data = {
						id: data.id,
						status: 'paused',
						name: this.form.taskName
					};
				}
				data.status = 'paused';
				data.executeMode = "normal";
				data.name = this.form.taskName;
				self.doSave(data, (err, dataFlow) => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
					} else {
						this.$message.success(self.$t('message.saveOK'));
						self.setEditable(false);
					}
				});
			}
		},

		/****
		 * Auto save
		 */
		timeSave() {
			let self = this,
				data = this.getDataFlowData(true),
				promise = dataFlowsApi.draft(data);

			if(promise) {
				promise.then((result) => {
					if (result && result.data) {
						let dataFlow = result.data;
						self.dataFlowId = dataFlow.id;
						self.status = dataFlow.status;
						self.executeMode = dataFlow.executeMode;

						self.dataFlow = dataFlow;

						if (!self.$route.query || !self.$route.query.id) {
							self.$router.push({
								path: '/job',
								query: {
									id: dataFlow.id
								}
							});
						}
						self.polling();
					}
				}).finally(() => {
					changeData = null;
					self.loading = false;
				});
			}
		},

		/**
		 * show submit layer
		 */
		submitLayer() {
			this.dialogFormVisible = true;
			if(this.dialogFormVisible) {
				let editorData = this.editor.getData();
				this.form.taskName = editorData.name;
			}
		},

		/**
		 * load data flow by id
		 * @param id
		 */
		loadDataFlow(id) {
			let self = this;
			dataFlowsApi
				.get([id])
				.then(result => {
					if (result && result.data) {
						let dataFlow = result.data;

						self.dataFlowId = dataFlow.id;
						self.status = dataFlow.status;
						self.executeMode = dataFlow.executeMode;

						self.dataFlow = dataFlow;
						// 管理端api创建任务来源以及editorData 数据丢失情况
						if (!dataFlow.editorData && dataFlow.stages) {
							// 1. 拿到创建所有的节点数据
							let cells = JSON.stringify(this.creatApiEditorData(dataFlow.stages));
							dataFlow.editorData = cells;

							// 2. 调用画布创建节点方法
							self.editor.setData(dataFlow);

							// 3. 更新schema
							self.editor.reloadSchema();

							// 4. 节点布局
							self.editor.graph.layoutDirectedGraph();

							// 5. 处理joinTables
							self.handleJoinTables(dataFlow.stages);
						} else {
							self.editor.setData(dataFlow);
						}
						if (["scheduled", "running", "stopping", "force stopping"].includes(self.status)) {
							self.setEditable(false);
						}
						if (self.executeMode !== "normal") {
							self.showCapture();
						}

						self.polling();
					} else {
						log(result);
						self.$message.error(self.$t("message.api.get.error"));
					}

					self.loading = false;
				})
				.catch(err => {
					log(err);
					self.$message.error(self.$t("message.api.get.error"));
					self.loading = false;
				});
		},

		/**
		 * Polling task
		 */
		polling() {
			let self = this;
			if (self.dataFlowId) {
				if (!["scheduled", "running", "stopping", "force stopping"].includes(self.status)) return;

				dataFlowsApi
					.get([self.dataFlowId], {
						fields: [
							"id",
							"status",
							"last_updated",
							"createTime",
							"executeMode",
							"stopOnError",
							"user_id",
							"user",
							"startTime",
							"stats",
							"pingTime",
							"stopTime"
						]
					})
					.then(result => {
						if (result && result.data) {
							let newStatus = result.data.status;
							if (self.status !== newStatus) {
								self.status = newStatus;
							}

							if (self.executeMode !== result.data.executeMode)
								self.executeMode = result.data.executeMode;

							if (["scheduled", "running", "stopping", "force stopping"].includes(newStatus)) {
								if (self.timeoutId) clearTimeout(self.timeoutId);
								self.timeoutId = setTimeout(self.polling.bind(self), 2000);
							} else {
								self.executeMode = "normal";
							}
							Object.assign(this.dataFlow, result.data);
							self.editor.emit("dataFlow:updated", _.cloneDeep(result.data));
						}
					})
					.catch(err => {
						log(err);
						self.$message.error(self.$t("message.api.get.error"));
					});
			}
		},

		/**
		 * get editor data
		 * @return {{name: *, description: string, status: string, executeMode: string, category: string, stopOnError: boolean, mappingTemplate: string, emailWaring: {edited: boolean, started: boolean, error: boolean, paused: boolean}, stages: Array, setting: *} & {editorData: string}}
		 */
		getDataFlowData(autoSave) {
			// validate
			if(!autoSave) {
				let verified = this.editor.validate();
				if (verified !== true) {
					this.$message.error(verified);
					return;
				}
			}

			let editorData = this.editor.getData();
			let graphData = editorData.graphData;
			let settingData = editorData.settingData;
			settingData.notificationInterval = Number(settingData.notificationInterval);
			settingData.notificationWindow = Number(settingData.notificationWindow);
			settingData.readBatchSize = Number(settingData.readBatchSize);
			settingData.readCdcInterval = Number(settingData.readCdcInterval);
			let distanceForSink = editorData.distanceForSink || {};

			let cells = graphData.cells ? graphData.cells : [];
			let edgeCells = {};
			let nodeCells = {};
			cells.forEach(cell => {
				if (cell.type === "app.Link") edgeCells[cell.id] = cell;
				else nodeCells[cell.id] = cell;
			});

			let postData = Object.assign(
				{
					name: editorData.name,
					description: "",
					status: this.status || "draft", // draft/scheduled/running/paused/stopping/error/force stopping
					executeMode: this.executeMode || "normal",
					category: "数据库克隆",
					stopOnError: false,
					mappingTemplate: "cluster-clone",
					emailWaring: { edited: true, started: false, error: true, paused: false },
					stages: [],
					setting: settingData
				},
				{
					editorData: JSON.stringify(graphData)
				}
			);

			let stages = {};
			Object.values(nodeCells).forEach(cell => {
				let stage = (stages[cell.id] = Object.assign(
					{
						id: cell.id,
						inputLanes: [],
						outputLanes: [],
						// syncType: "initial_sync+cdc",
						distance: distanceForSink[cell.id]
					},
					cell[FORM_DATA_KEY] || {}
				));

				if (["app.Database"].includes(cell.type)) {
					postData.mappingTemplate = "cluster-clone";

					Object.assign(stage, {
						type: "database",
						readCdcInterval: 500,
						readBatchSize: 1000
					});
				} else if (["app.Table", "app.Collection", "app.ESNode"].includes(cell.type)) {
					postData.mappingTemplate = "custom";

					Object.assign(stage, {
						dataQualityTag: false,
						joinTables: Object.values(edgeCells)
							.filter(edge => edge.target && edge.target.id === cell.id)
							.map(edge => edge[FORM_DATA_KEY] && edge[FORM_DATA_KEY].joinTable)
					});
				}
			});
			Object.values(edgeCells).forEach(cell => {
				if (cell.type === "app.Link") {
					let sourceId = cell.source.id;
					let targetId = cell.target.id;
					if (sourceId && stages[sourceId]) stages[sourceId].outputLanes.push(targetId);
					if (targetId && stages[targetId]) stages[targetId].inputLanes.push(sourceId);
				}
			});
			postData.stages = Object.values(stages);

			log("Job.getDataFlowData", editorData, postData);

			if (this.dataFlowId) postData.id = this.dataFlowId;

			return postData;
		},

		/**
		 * request server do save data flow
		 * @param data
		 * @param cb
		 */
		doSave(data, cb) {
			let self = this;

			log("Job.doSave", data);

			const _doSave = function() {
				let promise = data.id ? dataFlowsApi.patch(data) : dataFlowsApi.post(data);

				promise
					.then(result => {
						if (result && result.data) {
							let dataFlow = result.data;

							self.dataFlowId = dataFlow.id;
							self.status = dataFlow.status;
							self.executeMode = dataFlow.executeMode;

							self.dataFlow = dataFlow;

							if (!self.$route.query || !self.$route.query.id) {
								self.$router.push({
									path: "/job",
									query: {
										id: dataFlow.id
									}
								});
							}

							if (typeof cb === "function") {
								cb(null, dataFlow);
							}

							self.polling();
						} else {
							if (typeof cb === "function") {
								cb(result, null);
							}
						}
						self.loading = false;
					})
					.catch(e => {
						self.loading = false;
						if (typeof cb === "function") {
							cb(e, null);
						}
					});
			};

			if (data.name) {
				let params = {
					name: data.name
				};
				if (data.id) {
					params.id = {
						neq: data.id
					};
				}
				self.loading = true;
				dataFlowsApi
					.count({ where: JSON.stringify(params) })
					.then(result => {
						if (result && result.data && result.data.count > 0) {
							this.$message.error(`${self.$t("message.exists_name")}: ${data.name}`);
							self.loading = false;
						} else {
							_doSave();
						}
					})
					.catch(e => {
						self.loading = false;
						if (typeof cb === "function") {
							cb(e, null);
						}
					});
			} else {
				_doSave();
			}
		},

		/**
		 * save button handler
		 */
		save() {
			let self = this,
				data = this.getDataFlowData();

			if (data) {
				if (data.id) delete data.status;

				self.doSave(data, (err, entityData) => {
					if (err) {
						this.$message.error(self.$t("message.saveFail"));
					} else {
						this.$message.success(self.$t("message.saveOK"));
					}
				});
			}
		},

		/**
		 * start button handler
		 */
		start() {
			let self = this,
				data = this.getDataFlowData();

			if (data) {
				if (data.id) {
					data = {
						id: data.id,
						status: "scheduled"
					};
				}
				data.status = "scheduled";
				data.executeMode = "normal";
				self.doSave(data, (err, dataFlow) => {
					if (err) {
						this.$message.error(self.$t("message.saveFail"));
					} else {
						this.$message.success(self.$t("message.saveOK"));
						self.setEditable(false);
					}
				});
			}
		},

		/**
		 * stop button handler
		 * @param forceStop
		 */
		stop(forceStop) {
			let self = this,
				data = {
					id: self.dataFlowId,
					status: forceStop === true ? "force stopping" : "stopping"
				};

			self.$confirm(
				forceStop === true ? self.$t("dataFlow.stop_job.force_stop_msg") : self.$t("dataFlow.stop_job.msg"),
				self.$t("dataFlow.stop_job.tip"),
				{
					confirmButtonText:
						forceStop === true ? self.$t("dataFlow.button.force_stop") : self.$t("dataFlow.button.stop"),
					cancelButtonText: self.$t("message.cancel"),
					type: "warning"
				}
			).then(() => {
				self.doSave(data, (err, dataFlow) => {
					if (err) {
						this.$message.error(self.$t("message.saveFail"));
					} else {
						// self.$message.success('Stop success');
						self.setEditable(true);
					}
				});
			});
		},

		/**
		 * preview button handler
		 */
		preview() {
			let self = this,
				data = this.getDataFlowData();

			if (data) {
				if (data.id) {
					data = {
						id: data.id,
						status: ["scheduled", "running", "stopping"].includes(data.status) ? data.status : "scheduled",
						executeMode: "editing_debug"
					};
				} else {
					Object.assign(data, {
						status: "scheduled",
						executeMode: "editing_debug"
					});
				}
				self.doSave(data, (err, dataFlow) => {
					if (err) {
						this.$message.error(self.$t("message.saveFail"));
					} else {
						this.$message.success(self.$t("message.saveOK"));
						this.showCapture();
					}
				});
			}
		},

		/**
		 * capture button handler
		 */
		capture() {
			let self = this,
				data = this.getDataFlowData();

			if (data) {
				if (data && data.id) {
					data = {
						id: data.id,
						executeMode: "running_debug"
					};
				} else {
					Object.assign(data, {
						executeMode: "running_debug"
					});
				}
				self.doSave(data, (err, dataFlow) => {
					if (err) {
						this.$message.error(self.$t("message.saveFail"));
					} else {
						this.$message.success(self.$t("message.saveOK"));
						this.showCapture();
					}
				});
			}
		},

		/**
		 * stop capture button handler
		 */
		stopCapture() {
			let self = this,
				data = this.getDataFlowData();

			if (data && data.id) {
				self.doSave(
					{
						id: data.id,
						executeMode: "normal"
					},
					(err, dataFlow) => {
						if (err) {
							this.$message.error(self.$t("message.saveFail"));
						} else {
							this.$message.success(self.$t("message.saveOK"));
							// this.showCapture();
						}
					}
				);
			}
		},

		/**
		 * reset button handler
		 */
		reset() {
			let self = this,
				data = this.getDataFlowData();

			if (data && data.id) {
				self.$confirm(self.$t("dataFlow.reset_job.msg"), self.$t("dataFlow.reset_job.tip"), {
					confirmButtonText: self.$t("dataFlow.button.reset"),
					cancelButtonText: self.$t("message.cancel"),
					type: "warning"
				}).then(() => {
					dataFlowsApi.reset(data.id).then(res => {
						if (res.statusText === "OK" || res.status === 200) {
							self.$message.success(self.$t("message.resetOk"));
						} else {
							self.$message.error(self.$t("message.resetFailed"));
						}
					});
				});
			}
		},

		/**
		 * show setting button handler
		 */
		showSetting() {
			log("Job.showSetting");
			let name = "";
			if (this.$route.query.name) {
				name = this.$route.query.name;
			}
			this.editor.showSetting(name);
		},

		/**
		 * show logs button handler
		 */
		showLogs() {
			this.editor.showLogs(this.dataFlow);
		},

		/**
		 * show capture button handler
		 */
		showCapture() {
			this.editor.showCapture(this.dataFlow);
		},

		/**
		 * reload shcema
		 */
		reloadSchema() {
			this.editor.reloadSchema();
		},

		/**
		 * switch edit mode
		 * @param editable
		 */
		setEditable(editable) {
			log("Job.setEditable", editable, this.dataFlow);
			if (this.dataFlow) {
				delete this.dataFlow.editorData;
				this.editor.setEditable(editable, this.dataFlow);
			} else {
				this.$message.error(this.$t("message.save_before_running"));
			}
		},

		/**
		 * Reverse editor data
		 * @param data
		 * @return {{cells: Array}}
		 */
		creatApiEditorData(data) {
			// 1. 创建cell 2. 加载schema 3.自动布局
			let cells = [];
			let mapping = {
				collection: "app.Collection",
				table: "app.Table",
				database: "app.Database",
				mongodb: "app.Database",
				mongo_view: "app.Collection",
				view: "app.Table",
				"dummy db": "app.Dummy",
				elasticsearch: "app.ESNode",
				file: "app.FileNode",
				gridfs: "app.GridFSNode",
				"rest api": "app.ApiNode",
				field_processor: "app.FieldProcess",
				aggregation_processor: "app.Aggregate",
				js_processor: "app.Script",
				row_filter_processor: "app.DataFilter",
				java_processor: "app.FieldProcess"
			};
			if (data) {
				data.map((v, index) => {
					if (["table", "view", "collection", "mongo_view"].includes(v.type)) {
						let node = {
							type: mapping[v.type],
							id: v.id,
							freeTransform: false,
							form_data: {
								connectionId: v.connectionId,
								databaseType: v.databaseType,
								tableName: v.tableName,
								sql: v.sql || "",
								dropTable: false,
								type: v.type,
								primaryKeys: v.primaryKeys,
								name: v.name
							},
							schema: null,
							outputSchema: null,
							attrs: {
								label: {
									text: breakText.breakText(v.tableName, 125)
								}
							},
							angle: 0
						};
						cells.push(node);
					} else if (v.type && ["dummy db", "gridfs", "file", "elasticsearch", "rest api"].includes(v.type)) {
						let node = {
							type: mapping[v.type],
							id: v.id,
							freeTransform: false,
							schema: null,
							outputSchema: null,
							attrs: {
								label: {
									text: breakText.breakText(v.name, 125)
								}
							},
							form_data: {
								connectionId: v.connectionId,
								name: v.name,
								filter: v.filter,
								tableName: v.tableName,
								dropTable: false,
								type: v.type,
								primaryKeys: v.primaryKeys
							}
						};
						cells.push(node);
					} else if (v.type === "database") {
						let node = {
							type: mapping[v.type],
							id: v.id,
							freeTransform: false,
							form_data: {
								connectionId: v.connectionId,
								name: v.name,
								table_prefix: "",
								table_suffix: "",
								type: v.type,
								excludeTables: []
							},
							schema: null,
							outputSchema: null,
							attrs: {
								label: {
									text: breakText.breakText(v.name, 125)
								}
							}
						};
						cells.push(node);
					} else if (
						[
							"field_processor",
							"java_processor",
							"js_processor",
							"aggregation_processor",
							"row_filter_processor"
						].includes(v.type)
					) {
						let node = {
							type: mapping[v.type],
							id: v.id,
							freeTransform: false,
							angle: 0,
							schema: null,
							outputSchema: null,
							attrs: {
								label: {
									text: breakText.breakText(v.name, 95)
								}
							}
						};
						if (["field_processor"].includes(v.type)) {
							node.form_data = {
								operations: v.operations,
								name: v.name,
								scripts: v.scripts
							};
						} else if (["aggregation_processor"].includes(v.type)) {
							node.form_data = {
								type: v.type,
								name: v.name,
								aggregations: v.aggregations
							};
						} else if (["js_processor"].includes(v.type)) {
							node.form_data = {
								type: v.type,
								name: v.name,
								script: v.script
							};
						} else if (["row_filter_processor"].includes(v.type)) {
							node.form_data = {
								expression: v.expression,
								name: v.name,
								action: v.action,
								type: v.type
							};
						}
						cells.push(node);
					}
					if (v.outputLanes) {
						v.outputLanes.map(k => {
							let node = {
								type: "app.Link",
								source: {
									id: v.id
								},
								target: {
									id: k
								},
								router: {
									name: "manhattan"
								},
								connector: {
									name: "rounded"
								},
								form_data: {
									label: "",
									joinTable: _.cloneDeep(JOIN_TABLE_TPL)
								},
								labels: "",
								attrs: {}
							};
							cells.push(node);
						});
					}
				});
			}
			log("job loadSchema cells", cells);
			this.cells = cells;
			return {
				cells: cells
			};
		},
		handleJoinTables(data) {
			if (data) {
				data.map(v => {
					if (
						v.joinTables &&
						v.inputLanes &&
						[
							"field_processor",
							"java_processor",
							"js_processor",
							"aggregation_processor",
							"row_filter_processor"
						].includes(v.type)
					) {
						// 目标节点 数据节点 jointable
						let linkDtata = this.cells
							.filter(cell => cell.type === "app.Link" && [cell.target.id])
							.includes(v.inputLanes);
						if (linkDtata && linkDtata.length > 0) {
							linkDtata.map(link => {
								v.joinTables.map(table => {
									if (link.tableName === table.tableName) {
										link.form_data = table;
									}
								});
							});
						}
					}
				});
			}
		}
	}
};
</script>

<style lang="less">
@import "../../editor/style/editor";
.dialogConfig {
    .el-dialog__header {
      background:rgba(250,250,250,1);
      border:1px solid rgba(222, 222, 228, 1);
    }
    .el-dialog__body {
      padding-bottom: 0;
    }
    .e-input {
      width: calc(100% - 80px);
      height: 30px;
      line-height: 30px;
      input {
        height: 30px;
        line-height: 30px;
      }
    }
    .el-form-item__content {
      line-height: 30px;
    }
    .el-form--label-left .el-form-item__label {
      width: 80px;
      line-height: 30px;
      font-size: 14px;
    }
    .el-button {
      padding: 8px 20px;
    }
  }
</style>
