<template>
	<section class="data-flow-wrap" v-loading="restLoading">
		<TablePage
			ref="table"
			row-key="id"
			class="data-flow-list"
			:title="mappingTemplate === 'custom' ? $t('dataFlow.custom') : $t('dataFlow.clusterClone')"
			:classify="{ authority: 'SYNC_category_management', types: ['dataflow'] }"
			:remoteMethod="getData"
			@selection-change="
				val => {
					multipleSelection = val;
				}
			"
			@classify-submit="handleOperationClassify"
			@sort-change="handleSortTable"
		>
			<div slot="search">
				<ul class="search-bar">
					<li>
						<el-input
							:placeholder="$t('dataFlow.searchPlaceholder')"
							clearable
							prefix-icon="el-icon-search"
							v-model="searchParams.keyword"
							size="mini"
							@input="table.fetch(1, 800)"
						></el-input>
					</li>
					<li>
						<el-select
							v-model="searchParams.status"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.taskStatusPlaceholder')"
							style="width:160px"
							@input="table.fetch(1)"
						>
							<el-option
								v-for="item in statusOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</li>
					<li>
						<el-select
							v-model="searchParams.progress"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.taskSettingPlaceholder')"
							style="width:160px"
							@input="table.fetch(1)"
						>
							<el-option
								v-for="item in progressOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</li>
					<li>
						<el-select
							v-model="searchParams.executionStatus"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.executionStatus')"
							style="width:160px"
							@input="table.fetch(1)"
						>
							<el-option
								v-for="opt in ['initializing', 'cdc', 'initialized', 'Lag']"
								:key="opt"
								:label="$t('dataFlow.status.' + opt)"
								:value="opt"
							></el-option>
						</el-select>
					</li>
					<li>
						<el-button size="mini" type="text" @click="reset()">{{ $t('button.reset') }}</el-button>
					</li>
				</ul>
			</div>
			<div slot="operation">
				<el-button
					v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
					v-readonlybtn="'SYNC_category_application'"
					size="mini"
					class="btn"
					v-show="multipleSelection.length > 0"
					@click="$refs.table.showClassify(handleSelectTag())"
				>
					<i class="iconfont icon-biaoqian back-btn-icon"></i>
					<span> {{ $t('dataFlow.taskBulkTag') }}</span>
				</el-button>
				<el-dropdown @command="handleCommand($event)" v-show="multipleSelection.length > 0 && bulkOperation">
					<el-button class="btn btn-dropdowm" size="mini">
						<i class="iconfont icon-piliang back-btn-icon"></i>
						<span> {{ $t('dataFlow.taskBulkOperation') }}</span>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
							$t('dataFlow.bulkExport')
						}}</el-dropdown-item>
						<el-dropdown-item command="run" v-readonlybtn="'SYNC_job_operation'">{{
							$t('dataFlow.bulkScheuled')
						}}</el-dropdown-item>
						<el-dropdown-item command="stop" v-readonlybtn="'SYNC_job_operation'">{{
							$t('dataFlow.bulkStopping')
						}}</el-dropdown-item>
						<el-dropdown-item command="del" v-readonlybtn="'SYNC_job_delete'">{{
							$t('dataFlow.batchDelete')
						}}</el-dropdown-item>
						<el-dropdown-item command="initialize" v-readonlybtn="'SYNC_job_operation'">{{
							$t('dataFlow.batchRest')
						}}</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<el-button v-readonlybtn="'SYNC_Function_management'" size="mini" class="btn" @click="handleGoFunction">
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

			<el-table-column
				type="selection"
				width="45"
				:reserve-selection="true"
				:selectable="row => !row.hasChildren"
			>
			</el-table-column>
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
					$t('dataFlow.totalInput') + '/' + $t('dataFlow.totalOutput') + '/' + $t('dataFlow.runningSpeed')
				"
				width="200"
			>
				<template slot-scope="scope">
					<span>{{ scope.row.input }} / {{ scope.row.output }} / {{ scope.row.transmissionTime }}</span>
				</template>
			</el-table-column>
			<el-table-column
				prop="listtags"
				:label="$t('dataFlow.category')"
				:formatter="listtagsFormatter"
				width="120"
			>
			</el-table-column>
			<el-table-column prop="startTime" :label="$t('dataFlow.creationTime')" width="140" sortable="custom">
				<template slot-scope="scope">
					{{ $moment(scope.row.startTime).format('YYYY-MM-DD HH:mm:ss') }}
				</template>
			</el-table-column>
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
								:value="['running', 'scheduled'].includes(scope.row.status) ? 'scheduled' : 'stopping'"
								inactive-value="stopping"
								active-value="scheduled"
								:disabled="
									$disabledByPermission('SYNC_job_operation_all_data', scope.row.user_id) ||
										(statusBtMap[scope.row.status] &&
											statusBtMap[scope.row.status].switch &&
											!(scope.row.status == 'draft' && scope.row.checked == true))
								"
								@input="$event === 'scheduled' ? run([scope.row.id], scope.row) : stop([scope.row.id])"
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
								<i class="iconfont icon-chaxun"></i>
							</el-button>
						</el-tooltip>
						<el-tooltip class="item" :content="$t('dataFlow.edit')" placement="bottom">
							<el-button
								type="text"
								:disabled="
									$disabledByPermission('SYNC_job_edition_all_data', scope.row.user_id) ||
										(statusBtMap[scope.row.status] && statusBtMap[scope.row.status].edit)
								"
								@click="handleDetail(scope.row.id, 'edit', scope.row.mappingTemplate)"
								v-readonlybtn="'SYNC_job_edition'"
							>
								<i class="iconfont icon-ceshishenqing"></i>
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
									scope.row.setting.sync_type !== 'initial_sync' || scope.row.status === 'running'
								"
								v-readonlybtn="'SYNC_job_edition'"
								@click="handleTaskscheduling(scope.row.id, scope.row)"
							>
								<i class="iconfont icon-lishi2"></i>
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
								:disabled="
									$disabledByPermission('SYNC_job_delete_all_data', scope.row.user_id) ||
										(statusBtMap[scope.row.status] && statusBtMap[scope.row.status].delete)
								"
								@click="del([scope.row.id])"
								v-readonlybtn="'SYNC_job_delete'"
							>
								<i class="iconfont icon-shanchu"></i>
							</el-button>
						</el-tooltip>
						<el-dropdown v-show="moreAuthority" @command="handleCommand($event, scope.row)" class="item">
							<el-button type="text"><i class="iconfont icon-gengduo3"></i></el-button>
							<el-dropdown-menu slot="dropdown">
								<el-dropdown-item command="validate" v-readonlybtn="'Data_verify'">{{
									$t('dataVerify.dataVerify')
								}}</el-dropdown-item>
								<el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
									$t('dataFlow.dataFlowExport')
								}}</el-dropdown-item>
								<el-dropdown-item command="copy" v-readonlybtn="'SYNC_job_creation'"
									>{{ $t('dataFlow.copy') }}
								</el-dropdown-item>
								<el-dropdown-item
									:disabled="
										$disabledByPermission('SYNC_job_operation_all_data', scope.row.user_id) ||
											(statusBtMap[scope.row.status] && statusBtMap[scope.row.status].reset)
									"
									command="initialize"
									v-readonlybtn="'SYNC_job_operation'"
									>{{ $t('dataFlow.button.reset') }}</el-dropdown-item
								>
								<el-dropdown-item
									command="forceStop"
									:disabled="
										(statusBtMap[scope.row.status] && statusBtMap[scope.row.status].forceStop) ||
											$disabledByPermission('SYNC_job_operation_all_data', scope.row.user_id)
									"
									v-readonlybtn="'SYNC_job_operation'"
									>{{ $t('dataFlow.status.force_stopping') }}</el-dropdown-item
								>
								<el-dropdown-item command="setTag" v-readonlybtn="'SYNC_category_application'">{{
									$t('dataFlow.addTag')
								}}</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</div>
				</template>
			</el-table-column>
		</TablePage>
		<!-- <div class="panel-main">
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
		</div> -->
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
				<p>0 */1 * * * ? * // {{ $t('dialog.jobSchedule.runMinute') }}</p>
				<p>0 0 2 * * ? * // {{ $t('dialog.jobSchedule.runDay') }}</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="taskSettingsDialog = false">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="saveTaskSetting">{{ $t('app.save') }}</el-button>
			</span>
		</el-dialog>
		<DownAgent ref="agentDialog" type="taskRunning"></DownAgent>
		<SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
	</section>
</template>

<script>
import factory from '../../api/factory';
// import ws from '../../api/ws';
const dataFlows = factory('DataFlows');
const MetadataInstance = factory('MetadataInstances');
// const cluster = factory('cluster');
import { toRegExp } from '../../util/util';
import SkipError from '../../components/SkipError';
import DownAgent from '../downAgent/agentDown';
import TablePage from '@/components/TablePage';

export default {
	components: { TablePage, DownAgent, SkipError },
	data() {
		return {
			mappingTemplate: '',
			searchParams: {
				keyword: '',
				status: '',
				progress: '',
				executionStatus: '',
				timeData: ''
			},
			order: 'createTime DESC',
			progressOptions: [
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
			statusOptions: [
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

			taskSettingsDialog: false, //任务调度设置弹窗开关
			selectedJob: {
				id: '',
				oldStatus: '',
				status: '',
				dataItem: null
			},
			//-----------------------

			activeName: 'dataFlow',
			listtags: [],
			wsData: [],
			restLoading: false,
			colorMap: {
				running: '#67C23A',
				paused: '#F19149',
				draft: '#F56C6C',
				scheduled: '#cccccc',
				stopping: '#F19149',
				error: '#f53724'
			},
			flowProp: localStorage.getItem('flowProp') || 'createTime',
			flowOrder: localStorage.getItem('flowOrder') || 'descending',
			newData: [],
			currentPage: 1,
			pagesize: localStorage.getItem('flowPagesize') * 1 || 20,
			totalNum: 0,
			syncType: {
				initial_sync: this.$t('dataFlow.initial_sync'),
				cdc: this.$t('dataFlow.cdc'),
				'initial_sync+cdc': this.$t('dataFlow.initial_sync') + this.$t('dataFlow.cdc')
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
	computed: {
		table() {
			return this.$refs.table;
		}
	},
	created() {
		// window.windows = [];
		this.mappingTemplate = this.$route.query.mapping;
		// let self = this;
		// ws.on('watch', this.wsWatch);
		// this.inter = setInterval(() => {
		// 	self.wsData.forEach(dat => {
		// 		self.$set(
		// 			self.tableData,
		// 			self.tableData.findIndex(it => it.id == dat.id),
		// 			self.cookRecord(
		// 				_.merge(
		// 					self.tableData.find(it => it.id == dat.id),
		// 					dat
		// 				)
		// 			)
		// 		);
		// 	});
		// 	self.wsData.length = 0;
		// }, 3000);
	},
	beforeDestroy() {
		// ws.off('watch', this.wsWatch);
		// clearInterval(this.inter);
	},
	watch: {
		'$route.query'(query) {
			this.mappingTemplate = query.mapping;
			this.table.fetch(1);
		}
	},
	methods: {
		reset() {
			this.searchParams = {
				keyword: '',
				status: '',
				progress: '',
				executionStatus: '',
				timeData: ''
			};
			this.table.fetch(1);
		},
		getData({ page, tags }) {
			let { current, size } = page;
			let { keyword, status, progress, executionStatus, timeData } = this.searchParams;

			let where = {
				mappingTemplate: this.mappingTemplate
			};
			let fields = {
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
			};
			if (keyword && keyword.trim()) {
				where.or = [
					{ name: { like: toRegExp(keyword), options: 'i' } },
					{ original_name: { like: toRegExp(keyword), options: 'i' } }
				];
			}
			if (tags && tags.length) {
				where['listtags.id'] = {
					in: tags
				};
			}
			if (executionStatus) {
				if (executionStatus === 'Lag') {
					where['stats.stagesMetrics.replicationLag'] = {
						gt: 0
					};
				} else if (executionStatus === 'initialized') {
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
					where['stats.stagesMetrics.status'] = executionStatus;
				}
			}
			if (timeData && timeData.length) {
				let dates = this.timeData.concat();
				if (dates[1]) {
					dates[1] = new Date(dates[1]);
					dates[1].setHours(dates[1].getHours() + 24);
				}
				where.createTime = {
					between: dates
				};
			}
			status && (where.status = status);
			progress && (where['setting.sync_type'] = progress);
			let filter = {
				order: this.order,
				limit: size,
				fields: fields,
				skip: (current - 1) * size,
				where
			};
			return Promise.all([
				this.$api('DataFlows').count({ where: where }),
				this.$api('DataFlows').get({
					filter: JSON.stringify(filter)
				})
			]).then(([countRes, res]) => {
				let list = res.data || [];
				// let msg = {
				// 	type: 'watch',
				// 	collection: 'DataFlows',
				// 	filter: {
				// 		where: { 'fullDocument._id': { $in: this.tableData.map(it => it.id) } }, //查询条件
				// 		fields: {
				// 			'fullDocument.id': true,
				// 			'fullDocument.name': true,
				// 			'fullDocument.status': true,
				// 			'fullDocument.checked': true,
				// 			'fullDocument.executeMode': true,
				// 			'fullDocument.stopOnError': true,
				// 			'fullDocument.last_updated': true,
				// 			'fullDocument.createTime': true,
				// 			'fullDocument.children': true,
				// 			'fullDocument.stats': true,
				// 			'fullDocument.stages.id': true,
				// 			'fullDocument.stages.name': true,
				// 			'fullDocument.errorEvents': true
				// 		}
				// 	}
				// };
				// let int = setInterval(() => {
				// 	if (ws.ws.readyState == 1) {
				// 		ws.send(msg);
				// 		clearInterval(int);
				// 	}
				// }, 2000);
				this.table.setCache({
					keyword,
					status,
					progress,
					executionStatus,
					timeData
				});
				return {
					total: countRes.data.count,
					data: list.map(item => {
						return this.cookRecord(item);
					})
				};
			});
		},
		cookRecord(item) {
			item.statusLabel = this.$t('dataFlow.status.' + item.status.replace(/ /g, '_'));
			let statusMap = {};
			let getLag = lag => {
				let r = '0s';
				if (lag) {
					let m = this.$moment.duration(lag, 'seconds');
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
			};
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
								let lag = `(${this.$t('dataFlow.lag')}${getLag(stg.replicationLag)})`;
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
			let ids = [];
			if (this.dataFlowId) {
				ids = [this.dataFlowId];
			} else {
				ids = this.multipleSelection.map(r => r.id);
			}
			let attributes = {
				id: ids,
				listtags
			};
			dataFlows.batchUpdateListtags(attributes).then(() => {
				this.dataFlowId = '';
				this.table.fetch();
			});
		},
		create() {
			let routeUrl = this.$router.resolve({
				path: '/job',
				query: { mapping: this.mappingTemplate }
			});
			window.open(routeUrl.href, '_blank');
			// window.windows.push(window.open(routeUrl.href, '_blank'));
			// window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
		},
		handleDetail(id, type, mappingTemplate) {
			const h = this.$createElement;
			if (type === 'edit') {
				this.$confirm(
					h('p', null, [
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
					this.$t('dataFlow.importantReminder'),
					{
						customClass: 'dataflow-clickTip',
						confirmButtonText: this.$t('dataFlow.continueEditing'),
						type: 'warning'
					}
				).then(() => {
					let routeUrl = this.$router.resolve({
						path: '/job',
						query: { id: id, mapping: mappingTemplate }
					});
					setTimeout(() => {
						document.querySelectorAll('.el-tooltip__popper').forEach(it => {
							it.outerHTML = '';
						});
						window.open(routeUrl.href, 'edit_' + id);
						// window.windows.push(window.open(routeUrl.href, 'edit_' + id));
						// window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
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
				path: '/upload?type=dataflow'
			});
			window.open(routeUrl.href, '_blank');
		},
		handleCommand(command, node) {
			let ids = [];
			if (node) {
				ids = [node.id];
			} else {
				ids = this.multipleSelection.map(item => item.id);
			}
			this[command](ids, node);
		},
		export(ids) {
			let where = {
				_id: {
					in: ids
				}
			};
			MetadataInstance.download(where);
		},
		run(ids, node) {
			if (this.$refs.agentDialog.checkAgent()) {
				if (node) {
					this.$refs.errorHandler.checkError(node, () => {
						//启动任务时判断任务内是否存在聚合处理器，若存在，则弹框提示
						if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
							const h = this.$createElement;
							let arr = this.$t('message.startAggregation_message').split('XXX');
							this.$confirm(
								h('p', [
									arr[0] + '(',
									h('span', { style: { color: '#48b6e2' } }, node.name),
									')' + arr[1]
								]),
								this.$t('dataFlow.importantReminder'),
								{
									type: 'warning',
									closeOnClickModal: false
								}
							)
								.then(() => {
									//若任务内存在聚合处理器，启动前先重置
									dataFlows.reset(node.id).then(() => {
										this.changeStatus(ids, { status: 'scheduled' });
									});
								})
								.catch(() => {
									this.table.fetch();
								});
						} else {
							this.changeStatus(ids, { status: 'scheduled' });
						}
					});
				} else {
					this.changeStatus(ids, { status: 'scheduled' });
				}
			}
		},
		stop(ids) {
			let message = this.$t('message.stopMessage');
			let list = this.table.list;
			for (let i = 0; i < list.length; i++) {
				let node = list[i];
				if (ids.includes(node.id)) {
					if (node.setting && !node.setting.sync_type.includes('cdc')) {
						message = this.$t('message.stopInitial_syncMessage');
					}
					if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
						const h = this.$createElement;
						let arr = this.$t('message.stopAggregation_message').split('XXX');
						message = h('p', [
							arr[0] + '(',
							h('span', { style: { color: '#48b6e2' } }, node.name),
							')' + arr[1]
						]);
					}
				}
			}
			this.$confirm(message, this.$t('dataFlow.importantReminder'), {
				type: 'warning',
				closeOnClickModal: false
			})
				.then(() => {
					this.changeStatus(ids, { status: 'stopping' });
				})
				.catch(() => {
					this.table.fetch();
				});
		},
		forceStop(ids) {
			this.$confirm(this.$t('message.forceStoppingMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('dataFlow.button.force_stop'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning',
				closeOnClickModal: false
			}).then(() => {
				this.changeStatus(ids, { status: 'force stopping' });
			});
		},
		del(ids) {
			let where = {
				_id: {
					inq: ids
				}
			};
			this.$confirm(this.$t('message.deteleJobMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('classification.deleteNode'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning',
				closeOnClickModal: false
			}).then(() => {
				dataFlows.deleteAll(where).then(res => {
					if (res.data && res.data.success) {
						this.table.fetch();
						if (ids.length > 1) {
							this.responseHandler(res.data, this.$t('message.deleteOK'));
						}
					} else if (res.data && res.data.fail) {
						this.$message.info(this.$t('message.deleteFail'));
					}
				});
			});
		},
		initialize(ids) {
			this.$confirm(this.$t('message.resetMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('dataFlow.button.reset'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning',
				closeOnClickModal: false
			}).then(() => {
				this.restLoading = true;
				dataFlows
					.resetAll(ids)
					.then(res => {
						this.table.fetch();
						if (ids.length > 1) {
							this.responseHandler(res.data, this.$t('message.resetOk'));
						}
					})
					.catch(() => {
						this.$message.info(this.$t('message.cancelReset'));
					})
					.finally(() => {
						this.restLoading = false;
					});
			});
		},
		validate(ids, node) {
			this.$router.push({ name: 'dataVerification', query: { name: node.name, id: node.id } });
		},
		copy(ids, node) {
			dataFlows
				.copy(node.id)
				.then(() => {
					this.table.fetch();
					this.$message.success(this.$t('message.copySuccess'));
				})
				.catch(() => {
					this.$message.info(this.$t('message.copyFail'));
				});
		},
		setTag(ids, node) {
			this.dataFlowId = node.id;
			this.$refs.table.showClassify(node.listTags || []);
		},
		changeStatus(ids, { status, errorEvents }) {
			let where = {
				_id: {
					in: ids
				}
			};
			let attributes = {
				status
			};
			errorEvents && (attributes.errorEvents = errorEvents);
			dataFlows.update(where, attributes).then(res => {
				this.table.fetch();
				if (ids.length > 1) {
					this.responseHandler(res.data, this.$t('message.operationSuccuess'));
				}
			});
		},
		skipHandler(id, errorEvents) {
			this.changeStatus([id], { status: 'scheduled', errorEvents });
		},
		listtagsFormatter(row) {
			let value = '';
			if (row.listtags && row.listtags.length !== 0) {
				value = row.listtags[row.listtags.length - 1].value;
			}
			return value;
		},
		handleSortTable({ order, prop }) {
			let mapping = {
				status: 'status',
				last_updated: 'last_updated',
				createTime: 'createTime',
				input: 'stats.input.rows',
				output: 'stats.output.rows',
				transmissionTime: 'stats.transmissionTime'
			};
			this.order = `${order ? mapping[prop] : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
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
				this.table.list.forEach(item => {
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
		},
		handleGoFunction() {
			top.location.href = '/#/JsFuncs';
		}
		// 面板显示隐藏
		// wsWatch(data) {
		// 	this.wsData.push(data.data.fullDocument);
		// },
	}
};
</script>

<style lang="less" scoped>
.data-flow-wrap {
	height: 100%;
	.data-flow-list {
		.search-bar {
			display: flex;
			li + li {
				margin-left: 10px;
			}
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
	}
}
</style>
<style lang="less">
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
