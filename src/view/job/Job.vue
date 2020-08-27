<template>
	<div class="editor-container" v-loading="loading" style="position: relative;">
		<!-- <simpleScene v-if="$route.query.isSimpleScene"></simpleScene> -->
		<simpleScene v-if="isSimple" ref="simpleScene"></simpleScene>
		<newDataFlow v-if="newDataFlowV" ref="newDataFlowV"></newDataFlow>
		<div
			class="action-buttons"
			style="display:flex;align-items: center;justify-content: space-between;padding-right: 10px;"
		>
			<div class="flex-center">
				<el-button
					v-if="isEditable() && !isMoniting"
					class="action-btn"
					size="mini"
					:loading="isSaving"
					@click="draftSave"
				>
					<i class="iconfont icon-baocun"></i>
					<span>{{ isSaving ? $t('dataFlow.button.saveing') : $t('dataFlow.button.save') }}</span>
				</el-button>

				<el-autocomplete
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

				<el-button-group class="action-btn-group">
					<el-button
						v-if="['scheduled', 'running'].includes(status) && executeMode === 'running_debug'"
						class="action-btn"
						size="mini"
						@click="stopCapture"
					>
						<i class="iconfont icon-zanting3"></i>
						<span>{{ $t('dataFlow.button.stop_capture') }}</span>
					</el-button>
					<el-button
						v-if="['running'].includes(status) && executeMode === 'normal'"
						class="action-btn"
						size="mini"
						@click="capture"
					>
						<i class="iconfont icon-yulan1"></i>
						<span>{{ $t('dataFlow.button.capture') }}</span>
					</el-button>
					<el-button
						v-if="!statusBtMap[status].reloadSchema"
						class="action-btn"
						size="mini"
						@click="reloadSchema"
					>
						<i class="iconfont icon-kujitongbucopy"></i>
						<span>{{ $t('dataFlow.button.reloadSchema') }}</span>
					</el-button>
					<el-button v-if="isEditable()" class="action-btn" size="mini" @click="preview">
						<i class="iconfont icon-yulan1"></i>
						<span>{{ $t('dataFlow.button.preview') }}</span>
					</el-button>
					<el-button class="action-btn" size="mini" @click="showLogs">
						<i class="iconfont icon-rizhi1"></i>
						<span>{{ $t('dataFlow.button.logs') }}</span>
					</el-button>
				</el-button-group>

				<el-button class="btn-setting" size="mini" @click="showSetting">
					<i class="iconfont icon-shezhi1"></i>
					<span class="btn-setting-text">{{
						{
							'initial_sync+cdc': $t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc'),
							initial_sync: $t('dataFlow.initial_sync'),
							cdc: $t('dataFlow.cdc')
						}[sync_type]
					}}</span>
				</el-button>
			</div>
			<div class="flex-center">
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
					size="mini"
					style="margin-left: 30px;margin-right: 10px;border:none;"
				>
					<span class="spinner-box">
						<el-image
							v-if="status === 'running'"
							style="width: 15px; height: 15px;"
							src="static/editor/running.svg"
						></el-image>
						<el-image
							v-if="status === 'stopping'"
							style="width: 15px; height: 15px;"
							src="static/editor/stopping.svg"
						></el-image>
						<el-image
							v-if="status === 'scheduled'"
							style="width: 15px; height: 15px;"
							src="static/editor/scheduled.svg"
						></el-image>
					</span>
					<span
						:style="{
							color: status === 'scheduled' ? '#b0e58c' : status === 'stopping' ? '#fccd85' : ''
						}"
						>{{ $t('dataFlow.state') }}: {{ $t('dataFlow.status.' + status.replace(/ /g, '_')) }}</span
					>
				</el-tag>

				<el-button-group class="action-btn-group">
					<el-button
						:disabled="statusBtMap[status].start"
						class="action-btn btn-operatiton"
						size="mini"
						@click="start()"
					>
						<i class="mr-5 iconfont icon-yunhang1"></i>
						<span>{{ $t('dataFlow.button.start') }}</span>
					</el-button>
					<el-button
						:disabled="statusBtMap[status].stop"
						class="action-btn btn-operatiton"
						size="mini"
						@click="stop()"
					>
						<i class="mr-5 iconfont icon-zanting2"></i>
						<span>{{ $t('dataFlow.button.stop') }}</span>
					</el-button>
					<el-button
						:disabled="statusBtMap[status].reset"
						class="action-btn btn-operatiton"
						size="mini"
						@click="reset"
					>
						<i class="mr-5 iconfont icon-shuaxin3"></i>
						<span>{{ $t('dataFlow.button.reset') }}</span>
					</el-button>
					<el-button
						:disabled="statusBtMap[status].forceStop"
						class="action-btn btn-operatiton"
						size="mini"
						@click="stop(true)"
					>
						<i class="mr-5 iconfont icon-zanting3"></i>
						<span>{{ $t('dataFlow.button.force_stop') }}</span>
					</el-button>
				</el-button-group>

				<el-button
					v-if="!statusBtMap[status].edit && !editable"
					class="btn-edit"
					size="mini"
					type="primary"
					@click="setEditable(true)"
				>
					<i class="mr-5 iconfont icon-bianji2"></i>
					<span>{{ $t('dataFlow.edit') }}</span>
				</el-button>
			</div>
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
				<el-button class="e-button" type="primary" @click="start">{{ $t('dataFlow.submitExecute') }}</el-button>
			</div>
		</el-dialog>
		<el-dialog
			:title="$t('dataFlow.systemHint')"
			custom-class="systemHint"
			:before-close="loadData"
			:visible.sync="tempDialogVisible"
		>
			<el-form :model="form">
				<span class="text">{{ $t('dataFlow.systemText') }}</span>
				<div class="content">
					<el-row v-for="item in tempData" :key="item.id">
						<el-col :span="20"
							><el-link @click="openTempSaved(item)" type="primary">{{
								item.split('$$$')[2]
							}}</el-link></el-col
						>
						<el-col :span="4">
							<el-button size="mini" @click="openTempSaved(item)" type="text">{{
								$t('dataFlow.stystemOpen')
							}}</el-button>
							<el-button size="mini" class="delStyle" @click="deleteTempData(item)" type="text">{{
								$t('message.delete')
							}}</el-button>
						</el-col>
					</el-row>
				</div>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="text" class="delet" @click="delAllTempData">{{
					$t('dataFlow.stystemDeleteAll')
				}}</el-button>
				<!-- <el-button size="mini" @click="loadData">{{ $t('dataFlow.stystemOpenAll') }}</el-button> -->
				<el-button size="mini" @click="loadData">{{ $t('dataFlow.stystemLgnoreAll') }}</el-button>
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
import { statusBtMap } from '../../editor/states';
import { db2db } from '../../editor/simpleSceneData';
import log from '../../log';
import ws from '../../api/ws';
import AddBtnTip from './addBtnTip';
import simpleScene from './SimpleScene';
import newDataFlow from '@/components/newDataflowName';
import { FORM_DATA_KEY, JOIN_TABLE_TPL } from '../../editor/constants';
import { EditorEventType } from '../../editor/lib/events';
import _ from 'lodash';

const dataFlowsApi = factory('DataFlows');
let changeData = null;
export default {
	name: 'Job',
	dataFlow: null,
	components: { AddBtnTip, simpleScene, newDataFlow },
	data() {
		return {
			dialogFormVisible: false,
			form: {
				taskName: '',
				type: this.$t('dataFlow.button.quantitative') + '+' + this.$t('dataFlow.button.increment')
			},

			dataFlowId: null,
			tempDialogVisible: false,
			tempKey: 0,
			tempId: false,
			tempData: [],
			status: 'draft',
			executeMode: 'normal',
			isPreview: false, //只有这一个场景需要切换编辑状态

			loading: true,
			cells: [],
			state1: '',
			editable: false,
			isMoniting: false,
			isSimple: false,
			newDataFlowV: false,
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
			flowDataName: '',
			statusBtMap
		};
	},
	watch: {
		status: {
			handler() {
				if (this.isPreview) this.setEditable(this.isEditable());
			}
		}
	},
	created() {
		if (this.$route.query.isSimple == 'true') this.isSimple = true;
	},
	mounted() {
		let self = this;
		// build editor
		self.editor = editor({
			container: $('.editor-container'),
			actionBarEl: $('.editor-container .action-buttons'),
			scope: self
		});
		if (self.$route.query.isMoniting == 'true') self.isMoniting = true;
		if (self.$route.query.isSimple == 'true') {
			this.initData(db2db.data);
			this.loading = false;
			setTimeout(() => self.initSimple(), 1100);
			return;
		}
		if (window.name && window.name.length > 200) {
			this.initData(JSON.parse(window.name));
			window.name = '';
			this.loading = false;
			return;
		}
		if (!window.tpdata)
			Object.keys(localStorage).forEach(key => {
				if (
					key.startsWith('tapdata.dataflow.$$$') &&
					window.tempKeys &&
					!window.tempKeys.includes(parseInt(key.split('$$$')[1]))
				)
					this.tempData.push(key);
			});
		else {
			this.initData(window.tpdata);
			this.loading = false;
			return;
		}
		if (!this.isMoniting && this.tempData.length > 0) {
			self.loading = false;
			this.tempDialogVisible = true;
			return;
		}
		this.loadData();
		this.wsWatch();
		this.editor.graph.on(EditorEventType.DRAFT_SAVE, () => {
			this.draftSave();
		});
	},

	methods: {
		isEditable() {
			return ['draft', 'error', 'paused'].includes(this.status);
		},
		loadData() {
			this.tempDialogVisible = false;
			if (this.$route.query && this.$route.query.id) {
				this.loadDataFlow(this.$route.query.id);
			} else {
				this.loading = false;
				this.onGraphChanged();
				this.loading = false;
				this.setEditable(true);
				if (!this.dataFlow) document.title = this.$t('dataFlow.newTaksName');
			}
		},
		/****
		 * Auto save
		 */
		timeSave() {
			if (this.isMoniting) return;
			let data = this.getDataFlowData(true);
			if (this.tempKey == 0) {
				this.tempKey = 1;
				Object.keys(localStorage).forEach(key => {
					if (key.startsWith('tapdata.dataflow.$$$'))
						if (parseInt(key.split('$$$')[1]) >= this.tempKey)
							this.tempKey = parseInt(key.split('$$$')[1]) + 1;
				});
			}
			if (!this.tempId) this.tempId = 'tapdata.dataflow.$$$' + this.tempKey + '$$$' + data.name;
			else {
				localStorage.removeItem(this.tempId);
				this.tempId = 'tapdata.dataflow.$$$' + this.tempKey + '$$$' + data.name;
			}
			try {
				localStorage.setItem(this.tempId, JSON.stringify(data));
			} catch (e) {
				try {
					let ids = [],
						size = 0;
					Object.keys(localStorage).forEach(key => {
						if (key.startsWith('tapdata.dataflow.$$$'))
							ids.push({ id: parseInt(key.split('$$$')[1]), item: key });
					});
					ids = ids.sort((a, b) => a.id - b.id);
					for (let i = 0; i < ids.length; i++) {
						size += localStorage.getItem(ids[i].item).length;
						localStorage.removeItem(ids[i].item);
						if (size > JSON.stringify(data).length) break;
					}
					localStorage.setItem(this.tempId, JSON.stringify(data));
				} catch (err) {
					log(err);
				}
			}
			window.tempKey = this.tempKey;
		},
		openTempSaved(key) {
			this.tempDialogVisible = false;
			let tdata = JSON.parse(localStorage.getItem(key));
			localStorage.removeItem(key);
			if (tdata.id != this.$route.query.id) {
				let routeUrl = this.$router.resolve({
					path: '/job',
					query: { id: tdata.id }
				});
				window.opener.windows.push(window.open(routeUrl.href, '_blank'));
				window.opener.windows[window.opener.windows.length - 1].tpdata = tdata;
				this.loadData();
			} else this.initData(tdata);
		},
		deleteTempData(key) {
			this.tempData.splice(this.tempData.indexOf(key), 1);
			localStorage.removeItem(key);
			if (this.tempData.length == 0) {
				this.tempDialogVisible = false;
				this.loadData();
			}
		},
		delAllTempData() {
			Object.keys(localStorage).forEach(key => {
				if (key.startsWith('tapdata.dataflow.$$$')) localStorage.removeItem(key);
			});
			this.tempData.length == 0;
			this.tempDialogVisible = false;
			this.loadData();
		},
		simpleRefresh() {
			let self = this;
			self.editor.graph.paper.getMountedViews().forEach(ele => {
				if (ele.$el) ele.$el.show();
			});
			self.$refs.simpleScene.cellHtml = self.editor.graph.paper
				.getMountedViews()
				.map(ele => {
					if (ele.model.isElement) return ele.$el[0].outerHTML;
					else return '';
				})
				.join('');
			self.$refs.simpleScene.renderCell();
			self.editor.graph.paper.getMountedViews().forEach(ele => {
				if (ele.$el) ele.$el.hide();
			});
			try {
				if (this.editor.graph.graph.getElements()[self.$refs.simpleScene.activeStep - 1].validate())
					self.$refs.simpleScene.stepValid();
			} catch (e) {
				log(e.message);
			}
		},
		simpleGoNext(step) {
			let self = this;
			if (step == 3) {
				this.newDataFlowV = true;
				if (this.$refs.newDataFlowV) this.$refs.newDataFlowV.dialogVisibleSetting = true;
				return;
			} else this.newDataFlowV = false;
			this.editor.graph.selectCell(this.editor.graph.graph.getElements()[step - 1]);
			setTimeout(() => {
				self.simpleRefresh();
			}, 10);
		},
		initSimple() {
			let self = this;
			this.editor.graph.isSimple = true;
			document.body.getElementsByClassName('e-sidebar-right')[0].style.zIndex = 2000;
			this.editor.graph.selectCell(this.editor.graph.graph.getElements()[0]);
			setTimeout(() => {
				self.simpleRefresh();
			}, 10);
		},
		initData(data) {
			let dataFlow = data;
			this.dataFlowId = dataFlow.id;
			this.status = dataFlow.status;
			this.executeMode = dataFlow.executeMode;
			this.sync_type = dataFlow.setting.sync_type;
			this.dataFlow = dataFlow;
			document.title = dataFlow.name;
			// 管理端api创建任务来源以及editorData 数据丢失情况
			if (!dataFlow.editorData && dataFlow.stages) {
				// 1. 拿到创建所有的节点数据
				let cells = JSON.stringify(this.creatApiEditorData(dataFlow.stages));
				dataFlow.editorData = cells;
				// 2. 调用画布创建节点方法
				this.editor.setData(dataFlow);
				// 3. 更新schema
				this.editor.reloadSchema();
				// 4. 节点布局
				this.editor.graph.layoutDirectedGraph();
				// 5. 处理joinTables
				this.handleJoinTables(dataFlow.stages, this.editor.graph.graph);
			} else {
				this.editor.setData(dataFlow);
			}
			if (this.statusBtMap[this.status].start || this.isMoniting) this.setEditable(false);
			else this.setEditable(true);
			if (this.executeMode !== 'normal') this.showCapture();

			this.onGraphChanged();
			this.wsSend();
		},
		wsSend() {
			if (this.dataFlowId) {
				let msg = {
					type: 'watch',
					collection: 'DataFlows',
					filter: {
						where: { 'fullDocument._id': { $in: [this.dataFlowId] } }, //查询条件
						fields: {
							'fullDocument.id': true,
							'fullDocument.name': true,
							'fullDocument.status': true,
							'fullDocument.executeMode': true,
							'fullDocument.stopOnError': true,
							'fullDocument.last_updated': true,
							'fullDocument.createTime': true,
							'fullDocument.children': true,
							'fullDocument.stats': true,
							'fullDocument.stages.id': true,
							'fullDocument.stages.name': true,
							'fullDocument.setting': true,
							'fullDocument.cdcLastTimes': true,
							'fullDocument.listtags': true,
							'fullDocument.finishTime': true,
							'fullDocument.startTime': true
						}
					}
				};
				let int = setInterval(() => {
					if (ws.ws.readyState == 1) {
						ws.send(msg);
						clearInterval(int);
					}
				}, 2000);
			}
		},
		wsWatch() {
			let self = this;
			ws.on('watch', function(data) {
				let dat = data.data.fullDocument;
				self.status = dat.status;

				if (self.executeMode !== dat.executeMode) self.executeMode = dat.executeMode;

				if (!self.statusBtMap[self.status].start) {
					self.executeMode = 'normal';
				}
				delete self.dataFlow.validateBatchId;
				delete self.dataFlow.validateStatus;
				delete self.dataFlow.validationSettings;

				Object.assign(self.dataFlow, dat);
				self.editor.emit('dataFlow:updated', _.cloneDeep(dat));
			});
		},
		onGraphChanged() {
			if (this.isSimple) {
				this.editor.graph.on(EditorEventType.DATAFLOW_CHANGED, () => {
					this.simpleRefresh();
				});
				return;
			}
			let self = this;
			this.editor.graph.on(EditorEventType.DATAFLOW_CHANGED, () => {
				changeData = this.getDataFlowData(true);
				if (changeData) self.timeSave();
			});
		},
		//点击draft save按钮
		async draftSave() {
			this.isSaving = true;
			localStorage.removeItem(this.tempId);
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
					.catch(e => {
						if (e.response.data === 'duplication for names') {
							self.$message.error(self.$t('message.exists_name'));
						} else {
							self.$message.error(self.$t('message.saveFail'));
						}
					})
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
						}
						self.$message.success(self.$t('message.saveOK'));
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
						Object.keys(localStorage).forEach(key => {
							if (key.startsWith('tapdata.dataflow.$$$') && key.split('$$$')[2] == result.data.name)
								if (JSON.parse(localStorage.getItem(key)).id == result.data.id)
									localStorage.removeItem(key);
						});
					} else {
						self.$message.error(self.$t('message.api.get.error'));
						self.setEditable(false);
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
					status: this.status || 'draft',
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
		checkJoinTableStageId() {
			let stages = this.getDataFlowData(true).stages;
			let cells = this.editor.graph.graph.getCells();
			let valid = true;
			stages.forEach(stage => {
				if (stage.joinTables)
					stage.joinTables.forEach(jt => {
						let finded = false;
						cells.reduce((finded, cell) => {
							if (cell.id == jt.id) finded = true;
						});
						try {
							if (!finded) cells.filter(cell => cell.id == stage.id)[0].updateOutputSchema();
						} catch (e) {
							alert('jointables stageid chaeck failed===>>' + stage.id);
							valid = false;
						}
					});
			});
			return valid;
		},

		/**
		 * request server do save data flow
		 * @param data
		 * @param cb
		 */
		doSave(data, cb) {
			let self = this;
			if (!this.checkJoinTableStageId()) return;
			localStorage.removeItem(this.tempId);
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

							if (typeof cb === 'function') {
								cb(null, dataFlow);
							}

							let stages = self.getStages();
							dataFlowsApi
								.saveStage(stages)
								.then(() => {
									if (!self.$route.query || !self.$route.query.id) {
										self.$router.push({
											path: '/job',
											query: {
												id: dataFlow.id
											}
										});
										self.wsWatch();
										self.wsSend();
									}
								})
								.catch(() => {
									this.$message.error(self.$t('message.saveFail'));
								});
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
				this.loading = true;
				self.doSave(data, (err, rest) => {
					if (err) {
						self.$message.error(err.response.data);
					} else {
						this.$message.success(self.$t('message.taskStart'));
						self.$router.push({
							path: '/job',
							query: {
								id: rest.id,
								isMoniting: true
							}
						});
						location.reload();
						self.$message.success(self.$t('message.taskStart'));
					}
				});
			}
			this.loading = false;
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
				forceStop === true
					? self.$t('message.forceStoppingMessage')
					: this.sync_type === 'cdc'
					? self.$t('message.stopMessage')
					: self.$t('message.stopInitial_syncMessage'),
				self.$t('dataFlow.importantReminder'),
				{
					confirmButtonText:
						forceStop === true ? self.$t('dataFlow.button.force_stop') : self.$t('message.confirm'),
					cancelButtonText: self.$t('message.cancel'),
					type: 'warning'
				}
			).then(() => {
				self.doSave(data, err => {
					if (err) {
						this.$message.error(self.$t('message.saveFail'));
					} else {
						// self.$message.success('Stop success');
						//self.setEditable(true);
					}
				});
			});
		},

		preview() {
			let self = this,
				data = this.getDataFlowData();
			if (!self.statusBtMap[this.status].start) {
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
					this.isPreview = true;
					self.doSave(data, err => {
						if (err) {
							this.$message.error(self.$t('message.saveFail'));
						} else {
							// this.$message.success(self.$t('message.saveOK'));
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
						// this.$message.success(self.$t('message.saveOK'));
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
							this.loading = false;
						});
				});
			}
		},

		/**
		 * show setting button handler
		 */
		showSetting() {
			log('Job.showSetting');
			this.editor.showSetting(!this.editable);
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
			log('Job.setEditable', editable, this.dataFlow);
			this.editable = editable;
			if (editable && this.$route.query.isMoniting) {
				this.$router.push({
					path: '/job',
					query: {
						id: this.dataFlow.id
					}
				});
				location.reload();
			}
			if (this.dataFlow) {
				delete this.dataFlow.editorData;
				this.editor.setEditable(editable, this.dataFlow);
			} else {
				//this.$message.error(this.$t('message.save_before_running'));
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
									text:
										v.tableName !== '' && v.tableName
											? breakText.breakText(v.tableName, 125)
											: v.type
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
									text: v.name !== '' && v.name ? breakText.breakText(v.name, 125) : v.type
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
									text: v.name !== '' && v.name ? breakText.breakText(v.name, 125) : v.type
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
									text: v.name !== '' && v.name ? breakText.breakText(v.name, 95) : v.type
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
						v.outputLanes = v.outputLanes.filter(d => d);
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
	}
};
</script>
<style scoped lang="less">
.spinner-box {
	display: inline-block;
	padding: 0 5px;
	vertical-align: middle;
	.spinner {
		align-items: center;
		background: #fff;
		border-radius: 50%;
		display: flex;
		height: 15px;
		justify-content: center;
		// margin: 1em 1em 2em 1em;
		width: 15px;
	}
	.canvas_gif {
		animation: spinner 2s linear infinite;
		// border: 1px solid transparent;

		border-radius: 100%;
		align-items: center;
		height: 1em;
		width: 1em;
	}
	.scheduled_gif {
		border: 0.1em solid transparent;
		border-top: 0.1em solid #67c23a;
		border-right: 0.1em solid #67c23a;
	}

	.stopping_gif {
		border-top: 0.1em solid rgb(241, 145, 73);
		border-right: 0.1em solid rgb(241, 145, 73);
	}
}

@keyframes spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
<style lang="less">
@import '../../editor/style/editor';
.editor-container {
	.flex-center {
		display: flex;
		align-items: center;
	}
	.mr-5 {
		margin-right: 5px;
	}
	.action-btn-group {
		display: flex;
	}
	.action-btn,
	.btn-setting {
		border: none;
		background: #eee;
		color: #606266;
		&.is-disabled,
		&.btn-operatiton.is-disabled {
			background: #eee;
			color: #bbb;
			&:hover {
				color: #bbb;
				background: #eee;
			}
		}
		&:hover,
		&:focus {
			color: #606266;
			background: rgba(225, 225, 225, 1);
		}
	}
	.btn-operatiton {
		padding: 0 10;
		background: rgba(225, 225, 225, 1);
	}
	.action-btn {
		margin-right: 10px;
		padding: 0 6px;
		line-height: 26px;
		height: 26px;
		border-left: 1px solid #ddd;
		z-index: 1;
		&.btn-operatiton {
			padding: 0 10px 0 6px;
			background: rgba(225, 225, 225, 1);
			&:hover {
				background: #cfcfcf;
			}
		}
		&:first-child {
			border: none;
		}
		.iconfont {
			font-size: 12px;
		}
	}
	.btn-setting {
		padding: 0;
		&:hover {
			.iconfont {
				color: #606266;
				background: #e1e1e1;
			}
		}
		.iconfont {
			display: inline-block;
			text-align: center;
			font-size: 12px;
			line-height: 26px;
			height: 26px;
			width: 26px;
			color: #606266;
			background: rgba(225, 225, 225, 1);
		}
		.btn-setting-text {
			display: inline-block;
			padding: 0 6px;
		}
	}
	.btn-edit {
		padding: 6px 10px;
		.iconfont {
			font-size: 12px;
		}
	}
}

.systemHint {
	.el-dialog__body {
		overflow: hidden;
		padding: 20px !important;
		box-sizing: border-box;
		.el-form {
			overflow: hidden;
			.text {
				display: inline-block;
				padding-bottom: 30px;
			}
			.content {
				max-height: 260px;
				overflow: auto;
				.el-row {
					padding-bottom: 5px;
					.el-button--text {
						color: #666;
					}
					.el-button--text:hover {
						color: #409eff;
					}
					.delStyle:hover {
						color: #f56c6c;
					}
				}
			}
		}
	}
	.delet.el-button--text {
		color: #f56c6c;
	}
	.delet.el-button--text:hover {
		color: #f00;
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
	.el-input {
		display: block;
	}
	.el-input__inner {
		height: 26px;
		background: #eee;
		color: rgba(170, 170, 170, 1);
	}
	.el-input--mini .el-input__icon {
		line-height: 26px;
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
