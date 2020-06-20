<template>
	<div class="editor-container" v-loading="loading">
		<div class="action-buttons">
			<template v-if="['draft'].includes(status)">
				<div :class="[{btnHover:['draft'].includes(status)},'headImg']" v-show="!isSaving" @click="draftSave">
					<span class="iconfont icon-yunduanshangchuan"></span>
					<span class="text">{{ $t('dataFlow.button.saveDraft') }}</span>
				</div>

				<div class="headImg" v-show="isSaving" style="color: #48B6E2;">
					<span class="el-icon-loading"></span>
					<span class="text" style="color: #48B6E2;">{{ $t('dataFlow.button.saveing') }}</span>
				</div>
			</template>

			<el-tooltip
				class="job-head-title"
				effect="dark"
				:content="$t('dataFlow.button.stop_capture')"
				placement="bottom"
				v-if="['scheduled', 'running'].includes(status) && executeMode === 'running_debug'"
			>
				<div
					:class="[
						'headImg',
						{ btnHover: ['scheduled', 'running'].includes(status) && executeMode === 'running_debug' }
					]"
					@click="stopCapture"
				>
					<span class="iconfont icon-zanting3"></span>
				</div>
			</el-tooltip>

			<el-tooltip
				class="job-head-title"
				effect="dark"
				:content="$t('dataFlow.button.capture')"
				placement="bottom"
				v-if="['running'].includes(status) && executeMode === 'normal'"
			>
				<div
					:class="['headImg', { btnHover: ['running'].includes(status) && executeMode === 'normal' }]"
					@click="capture"
				>
					<span class="iconfont icon-yulan1"></span>
				</div>
			</el-tooltip>

			<el-tooltip
				class="job-head-title"
				effect="dark"
				:content="$t('dataFlow.button.reloadSchema')"
				placement="bottom"
			>
				<div
					:class="['headImg', { btnHover: ['paused', 'error', 'draft'].includes(status) }]"
					@click="reloadSchema"
				>
					<span class="iconfont icon-yunshuaxin"></span>
				</div>
			</el-tooltip>

			<el-tooltip
				class="job-head-title"
				effect="dark"
				:content="$t('dataFlow.button.preview')"
				placement="bottom"
				v-if="['paused', 'error', 'draft'].includes(status)"
			>
				<div :class="['headImg', { btnHover: ['paused', 'error', 'draft'].includes(status) }]" @click="preview">
					<span class="iconfont icon-yulan1"></span>
				</div>
			</el-tooltip>

			<el-tooltip class="item" effect="dark" :content="$t('dataFlow.button.logs')" placement="bottom">
				<div class="headImg btnHover" @click="showLogs">
					<span class="iconfont icon-rizhi1"></span>
				</div>
			</el-tooltip>
			<el-autocomplete
				v-if="!['scheduled', 'paused', 'running', 'stopping', 'force stopping'].includes(status)"
				class="inline-input searchNode"
				id="searchNode"
				v-model="state1"
				size="mini"
				:fetch-suggestions="querySearch"
				placeholder="查找节点"
				@select="handleSearchNode"
				hide-loading
				clearable
				suffix-icon="el-icon-search"
			></el-autocomplete>
			<div
				class="headImg round"
				@click="showSetting"
				:class="['headImg', { btnHover: ['paused', 'error', 'draft'].includes(status) }]"
			>
				<span class="iconfont icon-shezhi"></span>
				<span class="text" v-if="sync_type === 'initial_sync+cdc'">{{
					$t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc')
				}}</span>
				<span class="text" v-if="sync_type === 'initial_sync'">{{ $t('dataFlow.initial_sync') }}</span>
				<span class="text" v-if="sync_type === 'cdc'">{{ $t('dataFlow.cdc') }}</span>
			</div>

			<el-tag
				:type="
					status === 'running'
						? 'success'
						: status === 'error'
						? 'danger'
						: status === 'paused'
						? 'warning'
						: 'info'
				"
				effect="plain"
				size="small"
				style="margin-left: 30px;border-radius: 20px;"
				>{{ $t('dataFlow.state') }}: {{ $t('dataFlow.status.' + status.replace(/ /g, '_')) }}
			</el-tag>
			<!-- <div
				class="headImg borderStyle"
				@click="start"
				:title="$t('dataFlow.button.start')"
				:disabled="dataFlowId !== null && ['draft', 'paused', 'error'].includes(status) ? false : true"
			>
				<span class="iconfont icon-yunhang1"></span>
			</div> -->
			<template v-if="!['draft'].includes(status)">
				<el-tooltip class="item" effect="dark" :content="$t('dataFlow.button.start')" placement="bottom">
					<el-button
						class="headImg borderStyle iconfont icon-yunhang1"
						@click="start"
						:disabled="dataFlowId !== null && ['paused', 'error'].includes(status) ? false : true"
					>
					</el-button>
				</el-tooltip>

				<el-tooltip class="item" effect="dark" :content="$t('dataFlow.button.stop')" placement="bottom">
					<el-button
						class="headImg borderStyle iconfont icon-zanting2"
						@click="stop(false)"
						:disabled="dataFlowId !== null && ['running'].includes(status) ? false : true"
					></el-button>
				</el-tooltip>

				<el-tooltip
					class="item"
					effect="dark"
					:content="$t('dataFlow.button.reset')"
					:hide-after="1000"
					placement="bottom"
				>
					<el-button
						class="headImg borderStyle iconfont icon-shuaxin3"
						@click="reset"
						:disabled="dataFlowId !== null && ['paused', 'error'].includes(status) ? false : true"
					></el-button>
				</el-tooltip>

				<el-tooltip
					class="job-head-title"
					effect="dark"
					:content="$t('dataFlow.button.force_stop')"
					placement="bottom"
				>
					<el-button
						class="headImg borderStyle iconfont icon-zanting3"
						@click="stop(true)"
						:disabled="dataFlowId !== null && ['stopping'].includes(status) ? false : true"
					>
					</el-button>
				</el-tooltip>
			</template>

			<div class="headImg round" v-if="isEditable()" @click="submitLayer" style="float: right;">
				<span class="iconfont icon-icon_fabu"></span>
				<span class="text">{{ $t('dataFlow.button.submit') }}</span>
			</div>
			<!-- <el-button size="mini" type="primary" @click="switchModel">Model</el-button> -->
		</div>

		<el-dialog
			:title="$t('dataFlow.submitConfirmation')"
			custom-class="dialogConfig"
			:visible.sync="dialogFormVisible"
			width="600px"
			:close-on-click-modal="!dialogFormVisible"
		>
			<el-form :model="form" label-position="left">
				<el-form-item :label="$t('dataFlow.taskName')">
					<el-input class="e-input" v-model="form.taskName" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item :label="$t('dataFlow.implementationModalities')">
					<el-select v-model="sync_type" size="mini" disabled>
						<el-option v-for="item in settingList" :key="item.type" :label="item.name" :value="item.type">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button class="e-button" @click="dialogFormVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button class="e-button" type="primary" @click="submitTemporary">{{
					$t('dataFlow.submitOnly')
				}}</el-button>
				<el-button class="e-button" type="primary" @click="start">{{ $t('dataFlow.submitExecute') }}</el-button>
			</div>
		</el-dialog>
		<el-dialog title="系统提示" :visible.sync="tempDialogVisible" width="30%">
			<el-form :model="form">
				<span>有草稿存在，继续编辑？</span>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="loadData">取 消</el-button>
				<el-button type="primary" @click="openTempSaved">确 定</el-button>
			</div>
		</el-dialog>
		<AddBtnTip v-if="isEditable()"></AddBtnTip>
	</div>
</template>

<script>
import $ from 'jquery';
import factory from '../../api/factory';
import editor from '../../editor/index';
import breakText from '../../editor/breakText';
import log from '../../log';
import AddBtnTip from './addBtnTip';
import { FORM_DATA_KEY, JOIN_TABLE_TPL } from '../../editor/constants';
import { EditorEventType } from '../../editor/lib/events';
import _ from 'lodash';
// import ws, { EventName } from "../../api/ws";

const dataFlowsApi = factory('DataFlows');
let changeData = null;
let timer = null;
export default {
	name: 'Job',
	dataFlow: null,
	components: { AddBtnTip },
	data() {
		return {
			dialogFormVisible: false,
			form: {
				taskName: '',
				type: this.$t('dataFlow.button.quantitative') + '+' + this.$t('dataFlow.button.increment')
			},
			// run model: editable,readonly
			model: 'editable',

			dataFlowId: null,
			tempDialogVisible:false,
			status: 'draft',
			executeMode: 'normal',

			loading: true,
			disabledDataVerify: false,
			cells: [],
			state1: '',
			editable: false,
			isSaving: false,
			sync_type: 'initial_sync+cdc',
			settingList: [
				{
					type: 'initial_sync+cdc',
					name: this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc')
				},
				{ type: 'initial_sync', name: this.$t('dataFlow.initial_sync') },
				{ type: 'cdc', name: this.$t('dataFlow.cdc') }
			],
			flowDataName: ''
		};
	},
	watch: {
		status: {
			handler() {
				this.setEditable(this.isEditable());
			}
		}
	},
	mounted() {
		let self = this;

		// build editor
		self.editor = editor({
			container: $('.editor-container'),
			actionBarEl: $('.editor-container .action-buttons'),
			scope: self
		});
		if (localStorage.hasOwnProperty('tempSaved')) {
			self.loading = false;
			this.tempDialogVisible = true;
			return;
		}
		this.loadData();
	},

	methods: {
		isEditable() {
			return ['draft', 'error', 'paused'].includes(this.status);
		},
		loadData() {
			let self = this;
			this.tempDialogVisible = false;
			if (self.$route.query && self.$route.query.id) {
				self.loadDataFlow(self.$route.query.id);
			} else {
				self.loading = false;
				self.onGraphChanged();
			}
		},
		openTempSaved() {
			this.tempDialogVisible = false;
			this.initData(JSON.parse(localStorage.getItem('tempSaved')));
			localStorage.removeItem('tempSaved');
		},
		initData(data) {
			let self = this, dataFlow = data;
			self.dataFlowId = dataFlow.id;
			self.status = dataFlow.status;
			self.executeMode = dataFlow.executeMode;
			self.sync_type = dataFlow.setting.sync_type;
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
				self.handleJoinTables(dataFlow.stages, self.editor.graph.graph);
			} else {
				self.editor.setData(dataFlow);
			}
			if (['scheduled', 'running', 'stopping', 'force stopping'].includes(self.status)) {
				self.setEditable(false);
			}
			if (self.executeMode !== 'normal') {
				self.showCapture();
			}

			self.polling();
			self.onGraphChanged();
		},
		onGraphChanged() {
			let self = this;
			this.editor.graph.on(EditorEventType.DATAFLOW_CHANGED, () => {
				changeData = this.getDataFlowData(true);
				if (changeData) {
					let	settingSetInterval = () => {
						timer = setTimeout(() => {
							if (["draft", "error", "paused"].includes(this.status)) {
								self.timeSave();
							}
							timer = null;
						}, 10000);
					};
					if (timer) {
						clearTimeout(timer);
						settingSetInterval();
					} else {
						settingSetInterval();
					}
				}
			});
		},
		/**
		 * submit temporary
		 */
		submitTemporary() {
			let self = this,
				data = this.getDataFlowData();

			if (data) {
				if (data.id) {
					data.id = data.id;
				}
				data.status = 'paused';
				data.name = this.form.taskName;
				data.executeMode = 'normal';
				self.doSave(data, err => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
					} else {
						this.$message.success(self.$t('message.saveOK'));
						self.editor.setData(data);
						self.$router.push({ path: '/dataFlows' });
					}
				});
			}
			clearTimeout(timer);
			timer = null;
			this.dialogFormVisible = false;
		},

		/****
		 * Auto save
		 */
		timeSave() {
			let data = this.getDataFlowData(true), maxKey = 1;
			localStorage.setItem('tempSaved', JSON.stringify(data));
		},
		//点击draft save按钮
		async draftSave() {
			this.isSaving = true;
			if (localStorage.getItem('tempSaved') && JSON.parse(localStorage.getItem('tempSaved')).id == this.dataFlowId)
				localStorage.removeItem('tempSaved');
			let self = this,
				promise = null,
				lastString = '',
				data = this.getDataFlowData(true);

			let params = {
				'filter[order]': 'name DESC',
				'filter[limit]': 1,
				'filter[where][name][like]': data.name
			};

			let result = await dataFlowsApi.get(params);
			if (result && result.data.length > 0) {
				this.flowDataName = result.data[0].name;
				if (this.flowDataName) {
					lastString = this.flowDataName.charAt(this.flowDataName.length - 1, 1);

					if (lastString > 1 && data.name == this.$t('dataFlow.newTaksName')) {
						data.name = data.name + (lastString * 1 + 1);
					} else {
						data.name = data.name;
					}
				}
			}

			promise = dataFlowsApi.draft(data);

			if (promise) {
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
									path: '/job',
									query: {
										id: dataFlow.id
									}
								});
							}
							self.polling();
						}
					})
					.finally(() => {
						changeData = null;
						self.loading = false;
						self.isSaving = false;
					});
			}
		},

		/**
		 * show submit layer
		 */
		submitLayer() {
			this.dialogFormVisible = true;
			if (this.dialogFormVisible) {
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
						self.initData(result.data);
					} else {
						self.$message.error(self.$t('message.api.get.error'));
					}

					self.loading = false;
				})
				.catch(err => {
					log(err);
					self.$message.error(self.$t('message.api.get.error'));
					self.loading = false;
				});
		},

		/**
		 * Polling task
		 */
		polling() {
			let self = this;
			if (self.dataFlowId) {
				if (!['scheduled', 'running', 'stopping', 'force stopping'].includes(self.status)) return;

				dataFlowsApi
					.get([self.dataFlowId], {
						fields: [
							'id',
							'status',
							'last_updated',
							'createTime',
							'executeMode',
							'stopOnError',
							'user_id',
							'user',
							'startTime',
							'stats',
							'pingTime',
							'stopTime'
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

							if (['scheduled', 'running', 'stopping', 'force stopping'].includes(newStatus)) {
								if (self.timeoutId) clearTimeout(self.timeoutId);
								self.timeoutId = setTimeout(self.polling.bind(self), 2000);
							} else {
								self.executeMode = 'normal';
							}
							Object.assign(this.dataFlow, result.data);
							self.editor.emit('dataFlow:updated', _.cloneDeep(result.data));
						}
					})
					.catch(err => {
						log(err);
						self.$message.error(self.$t('message.api.get.error'));
					});
			}
		},

		/**
		 * get editor data
		 * @return {{name: *, description: string, status: string, executeMode: string, category: string, stopOnError: boolean, mappingTemplate: string, emailWaring: {edited: boolean, started: boolean, error: boolean, paused: boolean}, stages: Array, setting: *} & {editorData: string}}
		 */
		getDataFlowData(autoSave) {
			// validate
			if (!autoSave) {
				let verified = this.editor.validate();
				if (verified !== true) {
					this.$message.error(verified);
					return;
				}
			}

			let editorData = this.editor.getData();
			let graphData = editorData.graphData;
			let settingData = editorData.settingData;
			this.sync_type = settingData.sync_type;
			settingData.notificationInterval = settingData.notificationInterval
				? Number(settingData.notificationInterval)
				: 300;
			settingData.notificationWindow = settingData.notificationWindow
				? Number(settingData.notificationWindow)
				: 0;
			settingData.readBatchSize = settingData.readBatchSize ? Number(settingData.readBatchSize) : 1000;
			settingData.readCdcInterval = settingData.readCdcInterval ? Number(settingData.readCdcInterval) : 500;
			settingData.transformerConcurrency = settingData.transformerConcurrency
				? Number(settingData.transformerConcurrency)
				: 8;
			settingData.processorConcurrency = settingData.processorConcurrency
				? Number(settingData.processorConcurrency)
				: 1;
			let distanceForSink = editorData.distanceForSink || {};

			let cells = graphData.cells ? graphData.cells : [];
			let edgeCells = {};
			let nodeCells = {};
			cells.forEach(cell => {
				if (cell.type === 'app.Link') edgeCells[cell.id] = cell;
				else nodeCells[cell.id] = cell;
			});

			let postData = Object.assign(
				{
					name: editorData.name,
					description: '',
					status: this.status || 'draft', // draft/scheduled/running/paused/stopping/error/force stopping
					executeMode: this.executeMode || 'normal',
					category: '数据库克隆',
					stopOnError: false,
					mappingTemplate: 'cluster-clone',
					emailWaring: {
						edited: true,
						started: false,
						error: true,
						paused: false
					},
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

				if (['app.Database'].includes(cell.type)) {
					postData.mappingTemplate = 'cluster-clone';

					Object.assign(stage, {
						type: 'database',
						readCdcInterval: 500,
						readBatchSize: 1000
					});
				} else if (['app.Table', 'app.Collection', 'app.ESNode'].includes(cell.type)) {
					postData.mappingTemplate = 'custom';

					Object.assign(stage, {
						dataQualityTag: false,
						joinTables: Object.values(edgeCells)
							.filter(edge => edge.target && edge.target.id === cell.id)
							.map(edge => edge[FORM_DATA_KEY] && edge[FORM_DATA_KEY].joinTable)
					});
				}
			});
			Object.values(edgeCells).forEach(cell => {
				if (cell.type === 'app.Link') {
					let sourceId = cell.source.id;
					let targetId = cell.target.id;
					if (sourceId && stages[sourceId]) stages[sourceId].outputLanes.push(targetId);
					if (targetId && stages[targetId]) stages[targetId].inputLanes.push(sourceId);
				}
			});
			postData.stages = Object.values(stages);

			if (this.dataFlowId) postData.id = this.dataFlowId;

			return postData;
		},

		/**
		 * get data flow stage and include inputSchema, outputSchema, schema
		 */
		getStages() {
			let dataFlowData = this.getDataFlowData(true);
			let stages = dataFlowData.stages;
			let { graph } = this.editor.getData() || {};
			let dataFlowId = this.dataFlowId;
			stages.forEach(stage => {
				let cell = graph.getCell(stage.id) || {};
				let schema = cell.getSchema();
				let outputSchema = cell.getOutputSchema();
				let inputSchema = cell.getInputSchema();
				if (schema) stage.schema = schema;
				if (outputSchema) stage.outputSchema = outputSchema;
				if (inputSchema) stage.inputSchema = inputSchema;

				stage.dataFlowId = dataFlowId;
			});
			return stages;
		},

		/**
		 * request server do save data flow
		 * @param data
		 * @param cb
		 */
		doSave(data, cb) {
			let self = this;
			if (localStorage.getItem('tempSaved') && JSON.parse(localStorage.getItem('tempSaved')).id == this.dataFlowId)
				localStorage.removeItem('tempSaved');
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
									path: '/job',
									query: {
										id: dataFlow.id
									}
								});
							}

							if (typeof cb === 'function') {
								cb(null, dataFlow);
							}

							self.polling();
						} else {
							if (typeof cb === 'function') {
								cb(result, null);
							}
						}
						self.loading = false;
					})
					.catch(e => {
						self.loading = false;
						if (typeof cb === 'function') {
							cb(e, null);
						}
					});

				let stages = self.getStages();
				dataFlowsApi
					.saveStage(stages)
					.then(() => {})
					.catch(() => {});
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
							this.$message.error(`${self.$t('message.exists_name')}: ${data.name}`);
							self.loading = false;
						} else {
							_doSave();
						}
					})
					.catch(e => {
						self.loading = false;
						if (typeof cb === 'function') {
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

				self.doSave(data, err => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
					} else {
						this.$message.success(self.$t('message.saveOK'));
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
					data.id = data.id;
				}
				if (this.form.taskName) {
					data.name = this.form.taskName;
				}

				data.status = 'scheduled';
				data.executeMode = 'normal';
				self.doSave(data, err => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
					} else {
						this.$message.success(self.$t('message.saveOK'));
						self.setEditable(false);
						self.editor.setData(data);
					}
				});
			}
			clearTimeout(timer);
			timer = null;
			this.dialogFormVisible = false;
		},

		/**
		 * stop button handler
		 * @param forceStop
		 */
		stop(forceStop) {
			let self = this,
				data = {
					id: self.dataFlowId,
					status: forceStop === true ? 'force stopping' : 'stopping'
				};

			self.$confirm(
				forceStop === true ? self.$t('message.forceStoppingMessage') : self.$t('message.stopMessage'),
				self.$t('dataFlow.importantReminder'),
				{
					confirmButtonText:
						forceStop === true ? self.$t('dataFlow.button.force_stop') : self.$t('dataFlow.button.stop'),
					cancelButtonText: self.$t('message.cancel'),
					type: 'warning'
				}
			).then(() => {
				self.doSave(data, err => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
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
			if (['paused', 'error', 'draft'].includes(this.status)) {
				if (data) {
					if (data.id) {
						data = {
							id: data.id,
							status: ['scheduled', 'running', 'stopping'].includes(data.status)
								? data.status
								: 'scheduled',
							executeMode: 'editing_debug'
						};
					} else {
						Object.assign(data, {
							status: 'scheduled',
							executeMode: 'editing_debug'
						});
					}
					self.doSave(data, err => {
						if (err) {
							this.$message.error(self.$t('message.saveFail'));
						} else {
							this.$message.success(self.$t('message.saveOK'));
							this.showCapture();
						}
					});
				}
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
						executeMode: 'running_debug'
					};
				} else {
					Object.assign(data, {
						executeMode: 'running_debug'
					});
				}
				self.doSave(data, err => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
					} else {
						this.$message.success(self.$t('message.saveOK'));
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
						executeMode: 'normal'
					},
					err => {
						if (err) {
							this.$message.error(self.$t('message.saveFail'));
						} else {
							this.$message.success(self.$t('message.saveOK'));
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
				self.$confirm(self.$t('message.resetMessage'), self.$t('dataFlow.importantReminder'), {
					confirmButtonText: self.$t('dataFlow.button.reset'),
					cancelButtonText: self.$t('message.cancel'),
					type: 'warning'
				}).then(() => {
					this.loading = true;
					dataFlowsApi
						.reset(data.id)
						.then(res => {
							if (res.statusText === 'OK' || res.status === 200) {
								self.$message.success(self.$t('message.resetOk'));
							} else {
								self.$message.error(self.$t('message.resetFailed'));
							}
						})
						.finally(() => {
							setTimeout(() => {
								this.loading = false;
							}, 5000);
						});
				});
			}
		},

		/**
		 * show setting button handler
		 */
		showSetting() {
			log('Job.showSetting');
			if (['paused', 'error', 'draft'].includes(this.status)) {
				let name = '';
				if (this.$route.query.name) {
					name = this.$route.query.name;
				}
				this.editor.showSetting(name);
			}
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
			if (['paused', 'error', 'draft'].includes(this.status)) {
				this.editor.reloadSchema();
			}
		},

		/**
		 * switch edit mode
		 * @param editable
		 */
		setEditable(editable) {
			log('Job.setEditable', editable, this.dataFlow);
			this.editable = editable;
			if (this.dataFlow) {
				delete this.dataFlow.editorData;
				this.editor.setEditable(editable, this.dataFlow);
			} else {
				this.$message.error(this.$t('message.save_before_running'));
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
				collection: 'app.Collection',
				table: 'app.Table',
				database: 'app.Database',
				mongodb: 'app.Database',
				mongo_view: 'app.Collection',
				view: 'app.Table',
				'dummy db': 'app.Dummy',
				elasticsearch: 'app.ESNode',
				file: 'app.FileNode',
				gridfs: 'app.GridFSNode',
				'rest api': 'app.ApiNode',
				field_processor: 'app.FieldProcess',
				aggregation_processor: 'app.Aggregate',
				js_processor: 'app.Script',
				row_filter_processor: 'app.DataFilter',
				java_processor: 'app.FieldProcess'
			};
			if (data) {
				data.map(v => {
					let formData = _.cloneDeep(v);
					delete formData.inputLanes;
					delete formData.outputLanes;
					if (['table', 'view', 'collection', 'mongo_view'].includes(v.type)) {
						let node = {
							type: mapping[v.type],
							id: v.id,
							freeTransform: false,
							form_data: formData,
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
					} else if (v.type && ['dummy db', 'gridfs', 'file', 'elasticsearch', 'rest api'].includes(v.type)) {
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
							form_data: formData
						};
						cells.push(node);
					} else if (v.type === 'database') {
						let node = {
							type: mapping[v.type],
							id: v.id,
							freeTransform: false,
							form_data: formData,
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
							'field_processor',
							'java_processor',
							'js_processor',
							'aggregation_processor',
							'row_filter_processor'
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
						if (['field_processor'].includes(v.type)) {
							node.form_data = formData;
						} else if (['aggregation_processor'].includes(v.type)) {
							node.form_data = formData;
						} else if (['js_processor'].includes(v.type)) {
							node.form_data = formData;
						} else if (['row_filter_processor'].includes(v.type)) {
							node.form_data = formData;
						}
						cells.push(node);
					}
					if (v.outputLanes) {
						v.outputLanes.map(k => {
							let node = {
								type: 'app.Link',
								source: {
									id: v.id
								},
								target: {
									id: k
								},
								router: {
									name: 'manhattan'
								},
								connector: {
									name: 'rounded'
								},
								form_data: {
									label: '',
									joinTable: _.cloneDeep(JOIN_TABLE_TPL)
								},
								labels: '',
								attrs: {}
							};
							cells.push(node);
						});
					}
				});
			}
			log('job loadSchema cells', cells);
			this.cells = cells;
			return {
				cells: cells
			};
		},
		/**
		 * handler join table on after reverse editor data
		 * @param stages
		 * @param graph
		 */
		handleJoinTables(stages, graph) {
			log('Job.handleJoinTables', stages, graph);
			if (stages) {
				stages.map(stage => {
					if (
						stage.joinTables &&
						stage.joinTables.length > 0 &&
						stage.inputLanes &&
						stage.inputLanes.length > 0 &&
						![
							'field_processor',
							'java_processor',
							'js_processor',
							'aggregation_processor',
							'row_filter_processor'
						].includes(stage.type)
					) {
						// 目标节点 数据节点 jointables
						// tableName -> joinTable
						let joinTables = {};
						stage.joinTables.map(table => {
							joinTables[table.stageId] = table;
						});

						let cell = graph.getCell(stage.id);
						graph.getConnectedLinks(cell, { inbound: true }).forEach(link => {
							let sourceCell = link.getSourceCell();
							let sourceDataCells = sourceCell.getFirstDataNode().filter(cell => !!joinTables[cell.id]);
							if (sourceDataCells && sourceDataCells.length > 0) {
								let formData = link.getFormData();
								formData.joinTable = joinTables[sourceDataCells[0].id];
							}
						});
					}
				});
			}
		},
		querySearch(queryString, cb) {
			let dataCells = this.editor.getAllCells();
			let dataCellName = [];
			dataCells.forEach(cell => {
				let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null;
				let tableName = {
					value: formData.tableName || formData.name,
					cell: cell
				};
				dataCellName.push(tableName);
			});
			var restaurants = dataCellName;
			var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
			// 调用 callback 返回建议列表的数据
			cb(results);
		},
		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
			};
		},
		handleSearchNode(item) {
			//选中当前节点
			this.editor.graph.selectionPosition(item.cell);
		}
	},

	beforeDestroy() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		this.editor.destroy();
		if (timer) {
			clearInterval(timer);
		}
	}
};
</script>
<style scoped lang="less">
.fixBtn {
	position: fixed;
	bottom: 30px;
	left: 260px;
	z-index: 99;
}
</style>
<style lang="less">
@import '../../editor/style/editor';
.popperFixbtn {
	width: 160px !important;
	.btnList {
		width: 160px;
		span {
			display: block;
			width: 100%;
			padding: 5px 0;
			color: #333;
			font-size: 12px;
			cursor: pointer;
			i {
				float: right;
				color: #999;
				font-size: 12px;
			}
		}
	}
}
.dialogConfig {
	.el-dialog__header {
		background: rgba(250, 250, 250, 1);
		border: 1px solid rgba(222, 222, 228, 1);
	}
	.el-dialog__body {
		padding-bottom: 0;
	}
	.e-input,
	.el-select {
		width: calc(100% - 120px);
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
		width: 120px;
		line-height: 30px;
		font-size: 13px;
	}
	.el-button {
		padding: 8px 20px;
	}
}
.searchNode {
	.el-input__inner {
		border-radius: 20px;
		height: 24px;
	}
	margin-right: 8px;
}
.el-tooltip__popper.is-dark {
	background-color: #d3d3d3 !important;
	color: #333 !important;
	font-size: 16px;
}
// 控制主题颜色

.el-tooltip__popper[x-placement^='bottom'] .popper__arrow::after {
	border-bottom-color: #d3d3d3 !important;
}

.el-tooltip__popper[x-placement^='bottom'] .popper__arrow {
	border-bottom-color: #d3d3d3 !important;
}
</style>
