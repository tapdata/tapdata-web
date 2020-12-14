<template>
	<section class="data-flow-wrap" v-loading="restLoading">
		<div class="panel-left" v-show="formData.panelFlag">
			<Classification
				ref="classification"
				:authority="'SYNC_category_management'"
				@nodeChecked="nodeChecked"
			></Classification>
		</div>
		<div class="panel-main">
			<div class="mappingTemplate">
				{{ formData.mappingTemplate === 'custom' ? $t('dataFlow.custom') : $t('dataFlow.clusterClone') }}
			</div>
			<!-- <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
				<el-tab-pane :label="$t('tableFlow.task_view')" name="dataFlow"></el-tab-pane>
				<el-tab-pane :label="$t('tableFlow.table_view')" name="tableFlow"></el-tab-pane>
			</el-tabs> -->
			<div class="topbar">
				<!-- <div class="panelBtn"></div> -->
				<ul class="search-bar">
					<li :class="[{ panelOpen: formData.panelFlag }, 'item', 'panelBtn']" @click="handlePanelFlag">
						<i class="iconfont icon-xiangshangzhanhang"></i>
						<span>{{ formData.panelFlag ? $t('dataFlow.closeSetting') : $t('dataFlow.openPanel') }}</span>
					</li>
					<li class="item">
						<el-input
							:placeholder="$t('dataFlow.searchPlaceholder')"
							clearable
							prefix-icon="el-icon-search"
							v-model="formData.search"
							size="mini"
							@change="screenFn"
						></el-input>
					</li>
					<li class="item">
						<el-select
							v-model="formData.status"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.taskStatusPlaceholder')"
							style="width:160px"
							@change="screenFn"
						>
							<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</li>
					<li class="item">
						<el-select
							v-model="formData.way"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.taskSettingPlaceholder')"
							style="width:160px"
							@change="screenFn"
						>
							<el-option
								v-for="item in optionsKey"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</li>
					<li class="item">
						<el-select
							v-model="formData.executionStatus"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.executionStatus')"
							style="width:160px"
							@change="screenFn"
						>
							<el-option
								v-for="opt in ['initializing', 'cdc', 'initialized', 'Lag']"
								:key="opt"
								:label="$t('dataFlow.status.' + opt)"
								:value="opt"
							></el-option>
						</el-select>
					</li>
					<li class="item">
						<el-button class="btn" size="mini" @click="handleClear">
							<i class="iconfont icon-shuaxin1 back-btn-icon"></i>
						</el-button>
					</li>
				</ul>
				<div class="topbar-buttons">
					<el-button
						v-readonlybtn="'SYNC_category_application'"
						size="mini"
						class="btn"
						v-show="multipleSelection.length > 0"
						@click="handleClassify"
					>
						<i class="iconfont icon-biaoqian back-btn-icon"></i>
						<span> {{ $t('dataFlow.taskBulkTag') }}</span>
					</el-button>
					<el-dropdown @command="handleCommand" v-show="multipleSelection.length > 0 && bulkOperation">
						<el-button class="btn btn-dropdowm" size="mini">
							<i class="iconfont icon-piliang back-btn-icon"></i>
							<span> {{ $t('dataFlow.taskBulkOperation') }}</span>
						</el-button>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item command="bulkExport" v-readonlybtn="'SYNC_job_export'">{{
								$t('dataFlow.bulkExport')
							}}</el-dropdown-item>
							<el-dropdown-item command="bulkScheuled" v-readonlybtn="'SYNC_job_operation'">{{
								$t('dataFlow.bulkScheuled')
							}}</el-dropdown-item>
							<el-dropdown-item command="bulkStopping" v-readonlybtn="'SYNC_job_operation'">{{
								$t('dataFlow.bulkStopping')
							}}</el-dropdown-item>
							<el-dropdown-item command="batchDelete" v-readonlybtn="'SYNC_job_delete'">{{
								$t('dataFlow.batchDelete')
							}}</el-dropdown-item>
							<el-dropdown-item command="batchRest" v-readonlybtn="'SYNC_job_operation'">{{
								$t('dataFlow.batchRest')
							}}</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
					<el-button
						v-readonlybtn="'SYNC_Function_management'"
						size="mini"
						class="btn"
						@click="handleGoFunction"
					>
						<i class="iconfont icon-hanshu back-btn-icon"></i>
						<span> {{ $t('dataFlow.taskBulkFx') }}</span>
					</el-button>
					<el-button v-readonlybtn="'SYNC_job_import'" size="mini" class="btn" @click="handleImport">
						<i class="iconfont icon-daoru back-btn-icon"></i>
						<span> {{ $t('dataFlow.bulkImport') }}</span>
					</el-button>
					<el-button
						v-readonlybtn="'SYNC_job_creation'"
						class="btn btn-create"
						type="primary"
						size="mini"
						@click="create"
					>
						<i class="iconfont icon-jia add-btn-icon"></i>
					</el-button>
				</div>
			</div>
			<div class="task-list" v-loading="restLoading">
				<el-table
					v-loading="loading"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					style="border: 1px solid #dedee4;"
					class="dv-table"
					row-key="id"
					:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
					@sort-change="handleSortTable"
					@selection-change="handleSelectionChange"
					:default-sort="{ prop: flowProp, order: flowOrder }"
				>
					<el-table-column type="selection" width="45" :selectable="handleSelectable"> </el-table-column>
					<el-table-column
						:label="$t('dataFlow.taskName') + '/' + $t('dataFlow.creatdor')"
						:show-overflow-tooltip="true"
					>
						<template slot-scope="scope">
							<span>{{ scope.row.name }}</span>
							<div style="margin-left: 20px;color:#ccc">
								{{ scope.row.user ? scope.row.user.email : '' }}
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataFlow.syncType')" width="120">
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
					<el-table-column prop="status" sortable="custom" :label="$t('dataFlow.taskStatus')" width="180">
						<template slot-scope="scope">
							<div>
								<span :style="`color: ${colorMap[scope.row.status]};`">
									{{ scope.row.statusLabel }}
								</span>
								<span
									style="color: #999"
									v-if="!scope.row.hasChildren && scope.row.statusList && scope.row.statusList.length"
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
					<el-table-column
						prop="input"
						sortable="input"
						:label="
							$t('dataFlow.totalInput') +
								'/' +
								$t('dataFlow.totalOutput') +
								'/' +
								$t('dataFlow.runningSpeed')
						"
						width="200"
					>
						<template slot-scope="scope">
							<span
								>{{ scope.row.input }} / {{ scope.row.output }} / {{ scope.row.transmissionTime }}</span
							>
						</template>
					</el-table-column>
					<el-table-column
						prop="listtags"
						:label="$t('dataFlow.category')"
						:formatter="listtagsFormatter"
						width="120"
					>
					</el-table-column>
					<el-table-column
						prop="startTime"
						:label="$t('dataFlow.creationTime')"
						width="140"
						sortable="custom"
						:formatter="formatterStartTime"
					></el-table-column>
					<el-table-column :label="$t('dataFlow.taskSwitch')" width="70">
						<template slot-scope="scope">
							<div v-if="!scope.row.hasChildren" v-readonlybtn="'SYNC_job_operation'">
								<el-tooltip
									class="item"
									effect="dark"
									:content="$t('dataFlow.draftNotStart')"
									:manual="!(['draft'].includes(scope.row.status) && scope.row.checked != true)"
									placement="top-start"
								>
									<el-switch
										v-model="scope.row.newStatus"
										inactive-value="stopping"
										active-value="scheduled"
										:disabled="
											statusBtMap[scope.row.status].switch &&
												!(scope.row.status == 'draft' && scope.row.checked == true)
										"
										@change="
											handleStatus(scope.row.id, scope.row.status, scope.row.newStatus, scope.row)
										"
									></el-switch>
								</el-tooltip>
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataFlow.operate')" width="180">
						<template slot-scope="scope">
							<div v-if="!scope.row.hasChildren">
								<el-tooltip class="item" :content="$t('dataFlow.detail')" placement="bottom">
									<el-button
										type="text"
										@click="handleDetail(scope.row.id, 'detail', scope.row.mappingTemplate)"
									>
										<i class="iconfont  task-list-icon icon-chaxun"></i>
									</el-button>
								</el-tooltip>
								<el-tooltip class="item" :content="$t('dataFlow.edit')" placement="bottom">
									<el-button
										type="text"
										:disabled="statusBtMap[scope.row.status].edit"
										@click="handleDetail(scope.row.id, 'edit', scope.row.mappingTemplate)"
										v-readonlybtn="'SYNC_job_edition'"
									>
										<i class="iconfont  task-list-icon  icon-ceshishenqing"></i>
									</el-button>
								</el-tooltip>
								<el-tooltip
									class="item"
									:content="$t('dialog.jobSchedule.jobSecheduleSetting')"
									placement="bottom"
								>
									<el-button
										type="text"
										:disabled="
											scope.row.setting.sync_type !== 'initial_sync' ||
												scope.row.status === 'running'
										"
										v-readonlybtn="'SYNC_job_edition'"
										@click="handleTaskscheduling(scope.row.id, scope.row)"
									>
										<i class="iconfont  task-list-icon  icon-lishi2"></i>
									</el-button>
								</el-tooltip>
								<el-tooltip
									class="item"
									:content="$t('dialog.jobSchedule.jobSecheduleSetting')"
									placement="bottom"
								>
								</el-tooltip>
								<el-tooltip class="item" :content="$t('message.delete')" placement="bottom">
									<el-button
										type="text"
										:disabled="statusBtMap[scope.row.status].delete"
										@click="handleDelete(scope.row)"
										v-readonlybtn="'SYNC_job_delete'"
									>
										<i class="iconfont task-list-icon icon-shanchu"></i>
									</el-button>
								</el-tooltip>
								<el-dropdown
									v-show="moreAuthority"
									@command="handleRowCommand($event, scope.row)"
									class="item"
								>
									<el-button type="text"
										><i class="iconfont icon-gengduo3  task-list-icon"></i
									></el-button>
									<el-dropdown-menu slot="dropdown">
										<el-dropdown-item command="dataVerify" v-readonlybtn="'Data_verify'">{{
											$t('dataVerify.dataVerify')
										}}</el-dropdown-item>
										<el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
											$t('dataFlow.dataFlowExport')
										}}</el-dropdown-item>
										<el-dropdown-item command="copy" v-readonlybtn="'SYNC_job_creation'">{{
											$t('dataFlow.copy')
										}}</el-dropdown-item>
										<el-dropdown-item
											:disabled="statusBtMap[scope.row.status].reset"
											command="reset"
											v-readonlybtn="'SYNC_job_operation'"
											>{{ $t('dataFlow.button.reset') }}</el-dropdown-item
										>
										<el-dropdown-item
											command="force_stopping"
											:disabled="statusBtMap[scope.row.status].forceStop"
											v-readonlybtn="'SYNC_job_operation'"
											>{{ $t('dataFlow.status.force_stopping') }}</el-dropdown-item
										>
										<el-dropdown-item command="tag" v-readonlybtn="'SYNC_category_application'">{{
											$t('dataFlow.addTag')
										}}</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
							</div>
						</template>
					</el-table-column>
				</el-table>
				<el-pagination
					class="pagination"
					background
					layout="prev, pager, next,sizes,total"
					:page-sizes="[20, 30, 50, 100]"
					:page-size="pagesize"
					:total="totalNum"
					:current-page.sync="currentPage"
					@current-change="handleCurrentChange"
					@size-change="handleSizeChange"
				>
				</el-pagination>
			</div>
		</div>
		<SelectClassify
			ref="SelectClassify"
			:dialogVisible="dialogVisible"
			type="dataflow"
			:tagLists="tagList"
			v-on:dialogVisible="handleDialogVisible"
			v-on:operationsClassify="handleOperationClassify"
		></SelectClassify>
		<el-dialog
			:title="$t('dataFlow.importantReminder')"
			:close-on-click-modal="false"
			:visible.sync="deleteDialogVisible"
			width="30%"
		>
			<p>
				{{ $t('message.deteleMessage') }}
				<span @click="delLinkDataflow" style="color:#48B6E2;cursor: pointer"> {{ deleteObj.name }}</span> ?
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="deleteDialogVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="confirmDleteFlow">{{ $t('metaData.deleteNode') }}</el-button>
			</span>
		</el-dialog>
		<DownAgent
			v-if="downLoadAgetntdialog"
			:downLoadNum="downLoadNum"
			type="taskRunning"
			:lastDataNum="firstNum"
			@closeAgentDialog="closeAgentDialog"
		></DownAgent>
		<SkipError
			v-if="selectedJob.dataItem"
			ref="SelectClassify"
			:dialogVisible="dialogVisibleSkipError"
			:errorEvents="errorEvents"
			:taskName="selectedJob.dataItem.name"
			v-on:dialogVisible="handleSkipErrorVisible"
			v-on:operationsSkipError="handleOperationSkipError"
		></SkipError>
		<el-dialog
			:title="$t('dialog.jobSchedule.jobSecheduleSetting')"
			:close-on-click-modal="false"
			:visible.sync="taskSettingsDialog"
			custom-class="jobSeceduleDialog"
			width="50%"
		>
			<el-form :model="formSchedule" label-width="100px">
				<el-form-item :label="$t('dialog.jobSchedule.job')">
					<div>{{ formSchedule.name }}</div>
				</el-form-item>
				<el-form-item :label="$t('dialog.jobSchedule.sync')">
					<el-switch v-model="formSchedule.isSchedule"> </el-switch>
				</el-form-item>
				<el-form-item :label="$t('dialog.jobSchedule.expression')" v-if="formSchedule.isSchedule">
					<el-input
						v-model="formSchedule.cronExpression"
						:placeholder="$t('dialog.jobSchedule.expressionPlaceholder')"
					>
					</el-input>
				</el-form-item>
			</el-form>
			<div v-if="formSchedule.isSchedule" class="text">
				<p>{{ $t('dialog.jobSchedule.explanation') }}</p>
				<p>{{ $t('dialog.jobSchedule.grammar') }}</p>
				<ul>
					<li v-for="item in timeTextArr" :key="item">
						<p>{{ $t('dialog.jobSchedule.' + item) }}</p>
						<span>*</span>
					</li>
				</ul>
				<p>{{ $t('dialog.jobSchedule.example') }}</p>
				<p>* */1 * * * ? * // {{ $t('dialog.jobSchedule.runMinute') }}</p>
				<p>0 0 2 * * ? * // {{ $t('dialog.jobSchedule.runDay') }}</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="taskSettingsDialog = false">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="saveTaskSetting">{{ $t('app.save') }}</el-button>
			</span>
		</el-dialog>
	</section>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import factory from '../../api/factory';
import ws from '../../api/ws';
const dataFlows = factory('DataFlows');
const MetadataInstance = factory('MetadataInstances');
const cluster = factory('cluster');
import { toRegExp } from '../../util/util';
import Classification from '@/components/Classification';
import SelectClassify from '../../components/SelectClassify';
import SkipError from '../../components/SkipError';
import DownAgent from '../downAgent/agentDown';

export default {
	components: { Classification, SelectClassify, DownAgent, SkipError },
	data() {
		return {
			authorityMore:
				this.$has('SYNC_job_export') ||
				this.$has('Data_verify') ||
				this.$has('SYNC_job_creation') ||
				this.$has('SYNC_job_operation') ||
				this.$has('SYNC_category_application'),
			taskSettingsDialog: false, //任务调度设置弹窗开关
			downLoadAgetntdialog: false, //判断是否安装agent
			downLoadNum: 0,
			firstNum: undefined,
			selectedJob: {
				id: '',
				oldStatus: '',
				status: '',
				dataItem: null
			},
			deleteDialogVisible: false,
			checkedTags: [],
			activeName: 'dataFlow',
			listtags: [],
			tagList: [],
			wsData: [],
			dialogVisible: false,
			restLoading: false,
			colorMap: {
				running: '#67C23A',
				paused: '#F19149',
				draft: '#F56C6C',
				scheduled: '#cccccc',
				stopping: '#F19149',
				error: '#f53724'
			},
			loading: false,
			order: '',
			flowProp: localStorage.getItem('flowProp') || 'createTime',
			flowOrder: localStorage.getItem('flowOrder') || 'descending',
			tableData: [],
			newData: [],
			currentPage: 1,
			pagesize: localStorage.getItem('flowPagesize') * 1 || 20,
			totalNum: 0,
			syncType: {
				initial_sync: this.$t('dataFlow.initial_sync'),
				cdc: this.$t('dataFlow.cdc'),
				'initial_sync+cdc': this.$t('dataFlow.initial_sync') + this.$t('dataFlow.cdc')
			},
			optionsKey: [
				{
					label: this.$t('dataFlow.initial_sync'),
					value: 'initial_sync'
				},
				{
					label: this.$t('dataFlow.cdc'),
					value: 'cdc'
				},
				{
					label: this.$t('dataFlow.initial_sync') + this.$t('dataFlow.cdc'),
					value: 'initial_sync+cdc'
				}
			],
			options: [
				{
					label: this.$t('dataFlow.status.running'),
					value: 'running'
				},
				{
					label: this.$t('dataFlow.status.paused'),
					value: 'paused'
				},
				{
					label: this.$t('dataFlow.status.error'),
					value: 'error'
				},
				{
					label: this.$t('dataFlow.status.draft'),
					value: 'draft'
				},
				{
					label: this.$t('dataFlow.status.scheduled'),
					value: 'scheduled'
				},
				{
					label: this.$t('dataFlow.status.stopping'),
					value: 'stopping'
				},
				{
					label: this.$t('dataFlow.status.force_stopping'),
					value: 'force stopping'
				}
			],
			multipleSelection: [],
			formData: {
				search: '',
				timeData: [],
				status: '',
				person: '',
				way: '',
				executionStatus: '',
				classification: [],
				panelFlag: true,
				mappingTemplate: ''
			},
			statusBtMap: {
				scheduled: { switch: true, delete: true, edit: true, detail: false, forceStop: true, reset: true },
				draft: { switch: true, delete: false, edit: false, detail: true, forceStop: true, reset: false },
				running: { switch: false, delete: true, edit: true, detail: false, forceStop: true, reset: true },
				stopping: { switch: true, delete: true, edit: true, detail: false, forceStop: false, reset: true },
				error: { switch: false, delete: false, edit: false, detail: false, forceStop: true, reset: false },
				paused: { switch: false, delete: false, edit: false, detail: true, forceStop: true, reset: false },
				'force stopping': {
					switch: true,
					delete: true,
					edit: true,
					detail: true,
					forceStop: true,
					reset: true
				}
			},
			dataFlowId: '',
			deleteObj: {
				name: '',
				id: ''
			},
			dialogVisibleSkipError: false,
			errorEvents: [],
			currentStatus: '',
			oldStatus: '',
			currentId: '',
			taskName: '',

			formSchedule: {
				id: '',
				name: '',
				isSchedule: false,
				cronExpression: '',
				taskData: null
			},
			moreAuthority:
				this.$has('Data_verify') ||
				this.$has('SYNC_job_export') ||
				this.$has('SYNC_job_creation') ||
				this.$has('SYNC_job_operation') ||
				this.$has('SYNC_category_application'),
			bulkOperation:
				this.$has('SYNC_job_export') || this.$has('SYNC_job_operation') || this.$has('SYNC_job_delete'),
			timeTextArr: ['second', 'minute', 'hour', 'day', 'month', 'week', 'year']
		};
	},
	created() {
		this.formData = this.$store.state.dataFlows;
		this.formData.mappingTemplate = this.$route.query ? this.$route.query.mapping : '';
		this.formData.status = this.$route.query ? this.$route.query.dataFlowStatus : '';
		this.formData.executionStatus =
			this.$route.query && this.$route.query.executionStatus ? this.$route.query.executionStatus : '';

		this.screenFn();
		this.keyupEnter();
		window.windows = [];
		let self = this;
		ws.on('watch', this.wsWatch);
		this.inter = setInterval(() => {
			self.wsData.forEach(dat => {
				self.$set(
					self.tableData,
					self.tableData.findIndex(it => it.id == dat.id),
					self.cookRecord(
						_.merge(
							self.tableData.find(it => it.id == dat.id),
							dat
						)
					)
				);
			});
			self.wsData.length = 0;
		}, 3000);

		if (this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT')) {
			this.getDataApi();
			if (!this.downLoadNum) {
				self.timer = setInterval(() => {
					self.getDataApi();
					if (this.downLoadNum) {
						clearInterval(self.timer);
					}
				}, 5000);
			}
		}
	},
	beforeDestroy() {
		ws.off('watch', this.wsWatch);
		clearInterval(this.inter);
	},
	watch: {
		'$route.query'(query) {
			this.formData.mappingTemplate = query.mapping;
			this.getData();
		}
	},
	computed: {
		maxHeight: function() {
			let height = document.body.clientHeight - 140 + 'px';
			return height;
		}
	},
	methods: {
		// 获取Agent是否安装
		getDataApi() {
			let params = {};
			if (
				this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT') &&
				!parseInt(this.$cookie.get('isAdmin')) &&
				localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS'
			) {
				params['filter[where][systemInfo.username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			}
			cluster.get(params).then(res => {
				if (res.data) {
					if (!this.firstNum) {
						this.firstNum = res.data.length || 0;
						this.downLoadNum = 0;
					}
					if (this.firstNum) {
						this.downLoadNum = res.data.length;
					}
				}
			});
		},

		closeAgentDialog() {
			if (this.selectedJob.id) {
				this.handleStatus(
					this.selectedJob.id,
					this.selectedJob.oldStatus,
					this.selectedJob.status,
					this.selectedJob.dataItem
				);
			}
			this.downLoadAgetntdialog = false;
		},
		// // 刷新agent
		// handleRefreAgent() {
		// 	this.getDataApi();
		// },

		// 面板显示隐藏
		handlePanelFlag() {
			this.$set(this.formData, 'panelFlag', !this.formData.panelFlag);
			this.$store.commit('dataFlows', this.formData);
		},
		wsWatch(data) {
			this.wsData.push(data.data.fullDocument);
		},
		handleDialogVisible() {
			this.dialogVisible = false;
		},
		handleClassify() {
			if (this.multipleSelection.length === 0) {
				this.$message.info(this.$t('dataFlow.selectRowdata'));
				return;
			}
			this.tagList = this.handleSelectTag();
			this.dialogVisible = true;
		},
		handlerAddTag(id, listTags) {
			this.dataFlowId = id;
			this.tagList = listTags || [];
			this.dialogVisible = true;
		},
		handleSelectTag() {
			let tagList = {};
			this.multipleSelection.forEach(row => {
				if (row.listtags && row.listtags.length > 0) {
					tagList[row.listtags[0].id] = {
						value: row.listtags[0].value
					};
				}
			});
			return tagList;
		},
		handleOperationClassify(listtags) {
			let attributes = [];
			if (this.dataFlowId) {
				let node = {
					id: this.dataFlowId,
					listtags: listtags
				};
				attributes.push(node);
			} else {
				this.multipleSelection.forEach(row => {
					row.listtags = row.listtags || [];
					let node = {
						id: row.id,
						listtags: listtags
					};
					attributes.push(node);
				});
			}
			dataFlows.patchAll({ attrs: attributes }).then(() => {
				this.dataFlowId = '';
				this.getData();
			});
		},
		//kipError
		handleSkipErrorVisible(visible, data) {
			if (data === 'cancelError') {
				this.handleCancelSkipError();
			}
			this.dialogVisibleSkipError = false;
		},
		handleCancelSkipError() {
			let data = {
				status: this.selectedJob.oldStatus
			};
			dataFlows.updateById(this.selectedJob.id, data);
			this.getData();
		},
		handleOperationSkipError(errorEvents) {
			this.startJob(errorEvents);
		},
		handleGoFunction() {
			top.location.href = '/#/JsFuncs';
		},
		getTempKeys() {
			let tk = [];
			window.windows.forEach(it => {
				if (it.parent != null && it.tempKey) tk.push(it.tempKey);
			});
			return tk;
		},
		create() {
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { mapping: this.formData.mappingTemplate }
			});
			window.windows.push(window.open(routeUrl.href, '_blank'));
			window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
		},
		handleDetail(id, type, mappingTemplate) {
			const h = this.$createElement;
			if (type === 'edit') {
				this.$msgbox({
					title: this.$t('dataFlow.importantReminder'),
					customClass: 'dataflow-clickTip',
					message: h('p', null, [
						h('span', null, this.$t('dataFlow.modifyEditText')),
						h('span', { style: 'color: #48b6e2' }, this.$t('dataFlow.nodeLayoutProcess')),
						h('span', null, '、'),
						h('span', { style: 'color: #48b6e2' }, this.$t('dataFlow.nodeAttributes')),
						h('span', null, '、'),
						h('span', { style: 'color: #48b6e2' }, this.$t('dataFlow.matchingRelationship')),
						h('span', null, '，'),
						h('span', null, this.$t('dataFlow.afterSubmission')),
						h('span', { style: 'color: #48b6e2' }, this.$t('dataFlow.reset')),
						h('span', null, this.$t('dataFlow.runNomally')),
						h('span', null, this.$t('dataFlow.editLayerTip'))
					]),
					dangerouslyUseHTMLString: true,
					showCancelButton: true,
					confirmButtonText: this.$t('dataFlow.continueEditing'),
					cancelButtonText: this.$t('message.cancel'),
					type: 'warning'
				}).then(() => {
					let routeUrl = this.$router.resolve({
						path: '/job',
						query: { id: id, mapping: mappingTemplate }
					});
					setTimeout(() => {
						document.querySelectorAll('.el-tooltip__popper').forEach(it => {
							it.outerHTML = '';
						});
						window.windows.push(window.open(routeUrl.href, 'edit_' + id));
						window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
					}, 200);
				});
			} else {
				let routeUrl = this.$router.resolve({
					path: '/job',
					query: { id: id, isMoniting: true, mapping: mappingTemplate }
				});
				window.open(routeUrl.href, 'monitor_' + id);
			}
			setTimeout(() => {
				document.querySelectorAll('.el-tooltip__popper').forEach(it => {
					it.outerHTML = '';
				});
			}, 200);
		},

		handleImport() {
			let routeUrl = this.$router.resolve({
				path: '/upload'
			});
			window.open(routeUrl.href, '_blank');
		},
		handleCommand(command) {
			if (command === 'bulkExport') {
				this.handleDownload();
			} else if (command === 'bulkScheuled') {
				this.handleAllStatus('scheduled');
			} else if (command === 'bulkStopping') {
				this.handleAllStatus('stopping');
			} else if (command === 'batchDelete') {
				this.handleAllDelete();
			} else if (command === 'batchRest') {
				this.handleAllRest();
			}
		},
		handleDownload() {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let multipleSelection = [];
			this.multipleSelection.map(item => {
				multipleSelection.push(item.id);
			});
			let where = {
				_id: {
					in: multipleSelection
				}
			};
			MetadataInstance.download(where);
		},
		handleRowCommand(command, node) {
			let id = node.id;
			let where = {
				_id: {
					in: [id]
				}
			};

			switch (command) {
				case 'dataVerify':
					this.$router.push({ name: 'dataVerification', query: { name: node.name, id: node.id } });
					break;
				case 'export':
					MetadataInstance.download(where);
					break;
				case 'copy':
					this.handlerCopy(id);
					break;
				case 'tag':
					this.handlerAddTag(node.id, node.listtags);
					break;
				case 'reset':
					this.handleReset(id);
					break;
				case 'force_stopping':
					this.$confirm(this.$t('message.forceStoppingMessage'), this.$t('dataFlow.importantReminder'), {
						confirmButtonText: this.$t('dataFlow.button.force_stop'),
						cancelButtonText: this.$t('message.cancel'),
						type: 'warning',
						closeOnClickModal: false
					}).then(() => {
						this.handleStatus(id, 'force stopping');
					});
					break;
				default:
					break;
			}
		},
		handleSelectable(row) {
			if (row.hasChildren) {
				return false;
			} else {
				return true;
			}
		},
		screenFn() {
			// localStorage.setItem('flowSearch', this.formData.search);
			// localStorage.setItem('flowStatus', this.formData.status);
			// localStorage.setItem('flowWay', this.formData.way);
			// localStorage.setItem('flowExecutionStatus', this.formData.executionStatus);
			this.currentPage = 1;
			this.getData();
		},
		keyupEnter() {
			document.onkeydown = e => {
				// let body = document.getElementsByTagName('body')[0];
				if (e.keyCode === 13) {
					this.getData();
				}
			};
		},
		async getData(params) {
			this.loading = true;

			this.$store.commit('dataFlows', this.formData);

			let where = {};
			if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS')
				where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			let order = 'createTime DESC';
			if (this.order) {
				order = this.order;
			}
			if (this.formData) {
				if (this.formData.status && this.formData.status !== '') {
					where.status = this.formData.status;
				}
				if (this.formData.mappingTemplate && this.formData.mappingTemplate !== '') {
					where.mappingTemplate = this.formData.mappingTemplate;
				}
				if (this.formData.way && this.formData.way !== '') {
					where['setting.sync_type'] = this.formData.way;
				}
				if (this.formData.search && this.formData.search !== '') {
					let word = toRegExp(this.formData.search);
					where.or = [
						{
							name: { like: word, options: 'i' }
						},
						{
							'stages.name': { like: word, options: 'i' }
						},
						{
							'stages.tableName': { like: word, options: 'i' }
						}
					];
				}
				if (this.formData.executionStatus) {
					if (this.formData.executionStatus === 'Lag') {
						where['stats.stagesMetrics.replicationLag'] = {
							gt: 0
						};
					} else if (this.formData.executionStatus === 'initialized') {
						where.and = [
							{
								'stats.stagesMetrics.status': {
									inq: ['initialized']
								}
							},
							{
								'stats.stagesMetrics.status': {
									nin: ['cdc', 'initializing']
								}
							}
						];
					} else {
						where['stats.stagesMetrics.status'] = this.formData.executionStatus;
					}
				}
				if (this.formData.timeData && this.formData.timeData.length !== 0) {
					let dates = _.cloneDeep(this.formData.timeData);
					if (dates[1]) {
						dates[1] = new Date(dates[1]);
						dates[1].setHours(dates[1].getHours() + 24);
					}
					where.createTime = {
						between: dates
					};
				}
			}
			if (this.checkedTags && this.checkedTags.length) {
				where['listtags.id'] = {
					in: this.checkedTags
				};
			}
			let _params = Object.assign(
				{
					filter: JSON.stringify({
						where: where,
						order: order,
						limit: this.pagesize,
						skip: (this.currentPage - 1) * this.pagesize,
						fields: {
							id: true,
							name: true,
							status: true,
							executeMode: true,
							category: true,
							stopOnError: true,
							last_updated: true,
							createTime: true,
							children: true,
							stats: true,
							checked: true,
							stages: true,
							setting: true,
							user_id: true,
							startTime: true,
							listtags: true,
							mappingTemplate: true
						}
					})
				},
				params
			);
			await dataFlows
				.get(_params)
				.then(res => {
					if (res && res.data) {
						this.handleData(res.data);
						this.tableData = res.data;
						let msg = {
							type: 'watch',
							collection: 'DataFlows',
							filter: {
								where: { 'fullDocument._id': { $in: this.tableData.map(it => it.id) } }, //查询条件
								fields: {
									'fullDocument.id': true,
									'fullDocument.name': true,
									'fullDocument.status': true,
									'fullDocument.checked': true,
									'fullDocument.executeMode': true,
									'fullDocument.stopOnError': true,
									'fullDocument.last_updated': true,
									'fullDocument.createTime': true,
									'fullDocument.children': true,
									'fullDocument.stats': true,
									'fullDocument.stages.id': true,
									'fullDocument.stages.name': true,
									'fullDocument.errorEvents': true
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
				})
				.finally(() => {
					this.loading = false;
				});
			this.getCount(where);
		},
		handleData(data) {
			if (!data) return;
			data.forEach(item => {
				this.cookRecord(item);
			});
		},
		cookRecord(item) {
			item.newStatus = ['running', 'scheduled'].includes(item.status) ? 'scheduled' : 'stopping';
			item.statusLabel = this.$t('dataFlow.status.' + item.status.replace(/ /g, '_'));
			let statusMap = {};
			if (item.stats) {
				item.hasChildren = false;
				item.input = item.stats.input ? item.stats.input.rows : '--';
				item.output = item.stats.output ? item.stats.output.rows : '--';
				item.transmissionTime = item.stats.transmissionTime
					? ((item.input * 1000) / item.stats.transmissionTime).toFixed(0)
					: '--';
				let children = item.stages;
				item.children = [];
				if (children) {
					let finishedCount = 0;
					children.forEach(k => {
						let stage = '';
						let node = {};
						if (item.stats.stagesMetrics) {
							stage = item.stats.stagesMetrics.filter(v => k.id === v.stageId);
						}
						if (!stage.length) {
							node = {
								id: item.id + k.id,
								name: k.name,
								input: '--',
								output: '--',
								transmissionTime: '--',
								hasChildren: true,
								statusLabel: '--'
							};
						} else {
							let stg = stage[0];
							let statusLabel = stg.status ? this.$t('dataFlow.status.' + stg.status) : '--';
							if (stg.status === 'cdc') {
								let lag = `(${this.$t('dataFlow.lag')}${this.getLag(stg.replicationLag)})`;
								statusLabel += lag;
								statusMap.cdc = true;
							}
							if (stg.status === 'initializing') {
								statusMap.initializing = true;
							}
							if (stg.status === 'initialized') {
								finishedCount += 1;
							}
							node = {
								id: item.id + k.id,
								name: k.name,
								input: stg.input.rows,
								output: stg.output.rows,
								transmissionTime: stg.transmissionTime,
								hasChildren: true,
								statusLabel
							};
						}
						item.children.push(node);
					});
					if (finishedCount && !statusMap.cdc && !statusMap.initializing) {
						statusMap.initialized = true;
					}
					let statusList = [];
					for (const key in statusMap) {
						statusList.push(key);
					}
					item.statusList = statusList;
				}
			} else {
				item.input = '--';
				item.output = '--';
				item.transmissionTime = '--';
			}
			return item;
		},
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
		},
		getCount(where) {
			where = {
				where: where
			};
			dataFlows.count(where).then(res => {
				if (res.data) {
					this.totalNum = res.data.count;
				}
			});
		},

		deleteConfirm(callback) {
			this.$confirm(this.$t('message.deteleJobMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('metaData.deleteNode'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning',
				closeOnClickModal: false
			}).then(callback);
		},

		handleAllDelete() {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let multipleSelection = this.multipleSelection.map(item => item.id);

			let where = {
				_id: {
					inq: multipleSelection
				}
			};
			this.deleteConfirm(() => {
				dataFlows.deleteAll(where).then(res => {
					if (res.data && res.data.success) {
						this.getData();
						this.responseHandler(res.data, this.$t('message.deleteOK'));
					} else if (res.data && res.data.fail) {
						this.$message.info(this.$t('message.deleteFail'));
					}
				});
			}, '');
		},

		listtagsFormatter(row) {
			let value = '';
			if (row.listtags && row.listtags.length !== 0) {
				value = row.listtags[row.listtags.length - 1].value;
			}
			return value;
		},
		handleDelete(data) {
			this.deleteDialogVisible = true;
			this.deleteObj = data;
			// this.deleteConfirm(() => {
			// 	dataFlows.delete(data.id).then(res => {
			// 		if (res.statusText === 'OK' || res.status === 200) {
			// 			this.getData();
			// 			this.$message.success(this.$t('message.deleteOK'));
			// 		} else {
			// 			this.$message.info(this.$t('message.deleteFail'));
			// 		}
			// 	});
			// }, data.name);
		},

		// 删除任务编排
		confirmDleteFlow() {
			dataFlows.delete(this.deleteObj.id).then(res => {
				if (res.data && res.data.count === 1) {
					this.getData();
					this.$message.success(this.$t('message.deleteOK'));
				}
			});
			this.deleteDialogVisible = false;
		},

		delLinkDataflow() {
			window.open('/#/job?id=' + this.deleteObj.id, '_blank');
		},

		statusConfirm(callback, handleCatch, data) {
			let message = this.$t('message.stopMessage');
			if (data && data.stages && data.stages.find(s => s.type === 'aggregation_processor')) {
				message = this.$t('message.stopAggregation_message').replace('XXX', data.name);
			}
			if (data && data.setting && data.setting.sync_type !== 'cdc') {
				message = this.$t('message.stopInitial_syncMessage');
			}
			this.$confirm(message, this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('message.confirm'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning',
				closeOnClickModal: false
			})
				.then(callback)
				.catch(handleCatch);
		},

		async startJob(errorEvents) {
			let { id, oldStatus, dataItem, status } = this.selectedJob;
			//判断若任务因错误停止，弹出错误列表
			if (!errorEvents && oldStatus === 'error') {
				let errorEvents = await dataFlows.get([id]);
				errorEvents = errorEvents ? errorEvents.data : {};
				if (errorEvents.setting.stopOnError && errorEvents.errorEvents && errorEvents.errorEvents.length > 0) {
					this.dialogVisibleSkipError = true;
					this.errorEvents = errorEvents.errorEvents;
					return;
				}
			}
			let data = { status };
			//errorEvents为启动时过滤的错误
			if (errorEvents) {
				data.errorEvents = errorEvents;
			}
			//启动任务时判断任务内是否存在聚合处理器，若存在，则弹框提示
			if (dataItem && dataItem.stages && dataItem.stages.find(s => s.type === 'aggregation_processor')) {
				this.$confirm(
					this.$t('message.startAggregation_message').replace('XXX', dataItem.name),
					this.$t('dataFlow.importantReminder'),
					{
						confirmButtonText: this.$t('message.confirm'),
						cancelButtonText: this.$t('message.cancel'),
						type: 'warning',
						closeOnClickModal: false
					}
				)
					.then(() => {
						//若任务内存在聚合处理器，启动前先重置
						dataFlows.reset(id).then(() => {
							this.getStatus(id, data);
						});
					})
					.catch(() => {
						this.getData();
					});
			} else {
				this.getStatus(id, data);
			}
		},

		// 运行开关
		async handleStatus(id, oldStatus, status, dataItem) {
			this.selectedJob.id = id;
			this.selectedJob.oldStatus = oldStatus;
			this.selectedJob.status = status;
			this.selectedJob.dataItem = dataItem;
			if (this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT') && !this.downLoadNum) {
				this.downLoadAgetntdialog = true;
				return;
			}
			let data = {};
			if (oldStatus === 'force stopping') {
				data['status'] = oldStatus;
			} else {
				data['status'] = status;
			}

			if (status === 'stopping') {
				this.statusConfirm(
					() => {
						this.getStatus(id, data);
					},
					() => {
						this.getData();
					},
					dataItem
				);
			} else {
				this.startJob();
			}
		},

		async getStatus(id, data) {
			await dataFlows.updateById(id, data).then(() => {
				this.getData();
				this.$message.success(this.$t('message.operationSuccuess'));
			});
		},

		handleAllStatus(status) {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let multipleSelection = this.multipleSelection.map(item => item.id);
			let initData = []; // 设置初始化类型数据

			if (status === 'stopping') {
				//全部停止
				this.multipleSelection.map(item => {
					this.tableData.map(row => {
						if (row.id === item.id && row.status === 'running' && row.setting.sync_type !== 'cdc') {
							initData.push(row);
						}
					});
				});
			}

			let where = {
				_id: {
					in: multipleSelection
				}
			};
			let attributes = {
				status: status
			};

			let request = () => {
				dataFlows.update(where, attributes).then(res => {
					this.getData();
					this.responseHandler(res.data, this.$t('message.operationSuccuess'));
				});
			};

			if (status === 'stopping') {
				this.statusConfirm(
					() => {
						request();
					},
					() => {
						this.getData();
					},
					initData
				);
			} else {
				request();
			}
		},
		handleReset(id) {
			this.restConfirm(() => {
				this.restLoading = true;
				dataFlows
					.reset(id)
					.then(() => {
						this.getData();
						this.$message.success(this.$t('message.resetOk'));
					})
					.catch(() => {
						this.$message.info(this.$t('message.cancelReset'));
					})
					.finally(() => {
						this.restLoading = false;
					});
			});
		},

		restConfirm(callback) {
			this.$confirm(this.$t('message.resetMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('dataFlow.button.reset'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning',
				closeOnClickModal: false
			}).then(callback);
		},

		handleAllRest() {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let multipleSelection = this.multipleSelection.map(item => item.id);

			let where = multipleSelection;
			this.restConfirm(() => {
				this.restLoading = true;
				dataFlows
					.resetAll(where)
					.then(res => {
						this.getData();
						this.responseHandler(res.data, this.$t('message.resetOk'));
					})
					.catch(() => {
						this.$message.info(this.$t('message.cancelReset'));
					})
					.finally(() => {
						this.restLoading = false;
					});
			});
		},
		handlerCopy(id) {
			let self = this;
			dataFlows
				.copy(id)
				.then(() => {
					self.getData();
					this.$message.success(this.$t('message.copySuccess'));
				})
				.catch(() => {
					this.$message.info(this.$t('message.copyFail'));
				});
		},
		formatterTime(row) {
			let time = row.createTime ? this.$moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
			return time;
		},
		formatterStartTime(row) {
			let time = row.startTime ? this.$moment(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '';
			return time;
		},
		handleSortTable(column) {
			let currentOrder = column.order === 'ascending' ? 'ASC' : 'DESC';
			let mapping = {
				status: 'status',
				last_updated: 'last_updated',
				createTime: 'createTime',
				input: 'stats.input.rows',
				output: 'stats.output.rows',
				transmissionTime: 'stats.transmissionTime'
			};
			this.order = mapping[column.prop] + ' ' + currentOrder;

			localStorage.setItem('flowOrder', column.order);
			localStorage.setItem('flowProp', column.prop);

			if (localStorage.getItem('flowOrder') && localStorage.getItem('flowProp')) {
				let prop = localStorage.getItem('flowOrder') === 'ascending' ? 'ASC' : 'DESC';
				this.order = localStorage.getItem('flowProp') + ' ' + prop;
			}
			this.getData();
		},
		handleClear() {
			this.formData.search = '';
			this.formData.status = '';
			this.formData.way = '';
			this.formData.executionStatus = '';
			this.$refs.classification.clear();
			this.checkedTags = [];
			this.currentPage = 1;
			this.screenFn();
		},
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		handleCurrentChange(cpage) {
			this.currentPage = cpage;
			this.getData();
		},
		handleSizeChange(psize) {
			this.pagesize = psize;
			localStorage.setItem('flowPagesize', psize);
			this.getData();
		},
		nodeChecked(checkedTags) {
			this.checkedTags = checkedTags;
			this.getData();
		},
		responseHandler(data, msg) {
			let failList = data.fail || [];
			if (failList.length) {
				let msgMapping = {
					5: this.$t('dataFlow.multiError.notFound'),
					6: this.$t('dataFlow.multiError.statusError'),
					7: this.$t('dataFlow.multiError.otherError'),
					8: this.$t('dataFlow.multiError.statusError')
				};
				let nameMapping = {};
				this.tableData.forEach(item => {
					nameMapping[item.id] = item.name;
				});
				this.$message.warning({
					dangerouslyUseHTMLString: true,
					message: failList
						.map(item => {
							return `<div style="line-height: 24px;"><span style="color: #409EFF">${
								nameMapping[item.id]
							}</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`;
						})
						.join('')
				});
			} else if (msg) {
				this.$message.success(msg);
			}
		},
		handleTabClick(val) {
			if (val.name === 'tableFlow') {
				this.$router.push({
					name: 'tableFlows'
				});
			}
		},

		// 任务调度设置
		handleTaskscheduling(id, data) {
			this.taskSettingsDialog = true;
			this.formSchedule.id = id;
			this.formSchedule.name = data.name;
			this.formSchedule.isSchedule = data.setting.isSchedule;
			this.formSchedule.cronExpression = data.setting.cronExpression;
			this.formSchedule.taskData = data;
		},

		// 任务调度设置保存
		saveTaskSetting() {
			let data = this.formSchedule.taskData;
			data.setting.isSchedule = this.formSchedule.isSchedule;
			data.setting.cronExpression = this.formSchedule.cronExpression;
			dataFlows
				.patchId(this.formSchedule.id, data)
				.then(result => {
					if (result && result.data) {
						this.$message.success(this.$t('message.saveOK'));
					}
				})
				.catch(() => {
					this.$message.error(this.$t('message.saveFail'));
				})
				.finally(() => {
					this.taskSettingsDialog = false;
				});
		}
	}
};
</script>

<style lang="less" scoped>
.data-flow-wrap {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	.panel-left {
		width: 250px;
		height: 100%;
		box-sizing: border-box;
	}
	.panel-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		.topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 10px;
			.panelBtn {
				padding: 5px 12px;
				color: #666;
				cursor: pointer;
				font-size: 12px;
				border: 1px solid #dcdfe6;
				border-radius: 3px;
				.iconfont {
					display: inline-block;
					font-size: 12px;
					transform: rotate(00deg);
				}
			}
			.panelOpen {
				.iconfont {
					transform: rotate(180deg) !important;
				}
			}
			.panelBtn:hover {
				color: #48b6e2;
			}
			.btn + .btn {
				margin-left: 5px;
			}
			.btn {
				padding: 7px;
				background: #f5f5f5;
				i.iconfont {
					font-size: 12px;
				}
				&.btn-dropdowm {
					margin-left: 5px;
				}
				&.btn-create {
					margin-left: 5px;
					background: #48b6e2;
				}
			}
			.search-bar {
				display: flex;
				align-items: center;
				height: 50px;
				.item {
					margin-right: 10px;
				}
			}
		}
		.pagination {
			height: 40px;
			line-height: 40px;
		}
	}
}
.task-list {
	flex: 1;
	overflow: hidden;
	padding: 0 10px 10px 10px;
	display: flex;
	flex-direction: column;
	font-size: 14px;
	.dv-table {
		flex: 1;
		overflow: hidden;
	}
	.el-button.is-disabled {
		color: #c0c4cc;
	}
	.el-button--text {
		color: #606266;
	}
}

.task-list-menu-cion {
	font-size: 20px;
}

.task-list-menu {
	margin-bottom: 10px;
}

.task-list-icon {
	font-size: 18px;
}
.delete-icon {
	color: #606266 !important;
}

.task-list-time-picker {
	width: 240px;
}

.task-list-menu-left {
	float: left;
}

.task-list-menu-right {
	float: right;
	margin-right: 20px;
	/*margin-top: 10px;*/
	margin-bottom: 10px;
}

.el-table .sort-caret {
	border: 3px solid transparent !important;
}

.task-list .el-pagination {
	width: 100%;
	padding-top: 10px;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	text-align: right;
	overflow: hidden;
	z-index: 999;
}

.back-btn-icon {
	color: #666;
}
.add-btn-icon {
	color: #fff;
}
.mappingTemplate {
	margin-left: 10px;
	margin-top: 5px;
	font-size: 14px;
	font-weight: bold;
	color: #333;
}
</style>
<style lang="less">
.task-list .el-pagination .el-pagination__total {
	float: left;
}
.task-list .el-form--inline .el-form-item {
	margin-right: 4px;
}
.dv-table thead {
	color: #333;
	th {
		padding: 5px 0;
		background: #fafafa;
	}
}
.dataFlowsFlow .el-form-item__content {
	line-height: 0;
}
.dataflow-clickTip .el-message-box__status {
	top: 25% !important;
}
.jobSeceduleDialog {
	.text {
		padding-left: 100px;
		line-height: 28px;
		color: #999;
		ul {
			display: flex;
			flex-direction: row;
			text-align: center;
			li {
				padding-right: 20px;
			}
		}
	}
	.box {
		padding-left: 0;
	}
}
</style>
