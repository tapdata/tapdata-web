<template>
	<div class="task-list" v-loading="restLoading">
		<div class="task-list-operating-area box-card">
			<el-row :gutter="10">
				<el-form label-width="100px" :data="formData" :inline="true" class="dataFlowsFlow">
					<el-row>
						<el-col :span="16">
							<el-form-item>
								<el-input
									:placeholder="$t('dataFlow.searchPlaceholder')"
									clearable
									prefix-icon="el-icon-search"
									v-model="formData.search"
									size="mini"
									@change="screenFn"
								></el-input>
							</el-form-item>
							<!--							<el-form-item >-->
							<!--								<el-date-picker type="daterange" v-model="formData.timeData" size="small "-->
							<!--												class="task-list-time-picker"-->
							<!--												:range-separator="$t('dataFlow.separator')"-->
							<!--												:start-placeholder="$t('dataFlow.startTime')"-->
							<!--												:end-placeholder="$t('dataFlow.endTime')"-->
							<!--												:placeholder="$t('dataFlow.dataPlaceholder')"></el-date-picker>-->
							<!--							</el-form-item>-->
							<el-form-item>
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
							</el-form-item>
							<el-form-item>
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
							</el-form-item>
							<el-form-item>
								<el-button class="back-btn-icon-box dv-btn-icon" @click="handleClear"
									><i class="iconfont icon-shuaxin1 back-btn-icon"></i
								></el-button>
							</el-form-item>
						</el-col>
						<div class="task-list-menu-right">
							<el-button class="back-btn-icon-box dv-btn-icon" @click="handleGoFuntion"
								><i class="iconfont icon-hanshu back-btn-icon"></i
							></el-button>
							<el-button class="back-btn-icon-box dv-btn-icon" @click="handleImport"
								><i class="iconfont icon-daoru back-btn-icon"></i
							></el-button>
							<el-dropdown @command="handleCommand">
								<el-button class="back-btn-icon-box dv-btn-icon"
									><i class="iconfont icon-piliang back-btn-icon"></i
								></el-button>
								<el-dropdown-menu slot="dropdown">
									<el-dropdown-item command="a">{{ $t('dataFlow.bulkExport') }}</el-dropdown-item>
									<el-dropdown-item command="b">{{ $t('dataFlow.bulkScheuled') }}</el-dropdown-item>
									<el-dropdown-item command="c">{{ $t('dataFlow.bulkStopping') }}</el-dropdown-item>
									<el-dropdown-item command="d">{{ $t('dataFlow.batchDelete') }}</el-dropdown-item>
									<el-dropdown-item command="e">{{ $t('dataFlow.batchRest') }}</el-dropdown-item>
								</el-dropdown-menu>
							</el-dropdown>

							<router-link target="_blank" to="/job">
								<el-button class="add-btn-icon-box"
									><i class="iconfont icon-jia add-btn-icon"></i
								></el-button>
							</router-link>
						</div>
						<!--						<div class="task-list-menu-right">-->
						<!--							<el-button disabled class="back-btn-icon-box dv-btn-icon" ><i class="iconfont icon-hanshu back-btn-icon"></i></el-button>-->
						<!--							<el-button disabled class="back-btn-icon-box dv-btn-icon" ><i class="iconfont icon-biaoqian back-btn-icon"></i></el-button>-->
						<!--							<el-button class="back-btn-icon-box dv-btn-icon" @click="handleAllStatus('scheduled')"><i class="iconfont icon-zanting2 back-btn-icon"></i></el-button>-->
						<!--							<el-button class="back-btn-icon-box dv-btn-icon" @click="handleAllStatus('stopping')"><i class="iconfont icon-yunhang1 back-btn-icon"></i></el-button>-->
						<!--							<el-button disabled class="back-btn-icon-box dv-btn-icon" ><i class="iconfont icon-shanchu1 back-btn-icon"></i></el-button>-->
						<!--							<router-link target="_blank" to="/job">-->
						<!--								<el-button class="add-btn-icon-box" ><i class="iconfont icon-jia add-btn-icon"></i></el-button>-->
						<!--							</router-link>-->
						<!--						</div>-->
					</el-row>
				</el-form>
			</el-row>
		</div>
		<div class="task-list-main">
			<div>
				<!--				<div class="task-list-menu-left">-->
				<!--					<i class="iconfont icon-icon_yingyongguanli"></i>-->
				<!--					<i class="iconfont icon-liebiao"></i>-->
				<!--				</div>-->
			</div>
			<div class="clear"></div>

			<el-table
				v-loading="loading"
				:element-loading-text="$t('dataFlow.dataLoading')"
				:data="tableData"
				style="width: 99%;border: 1px solid #dedee4;"
				class="dv-table"
				:max-height="maxHeight"
				row-key="id"
				:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
				@sort-change="handleSortTable"
				@selection-change="handleSelectionChange"
				:default-sort="{ prop: flowProp, order: flowOrder }"
			>
				<el-table-column type="selection" width="45" :selectable="handleSelectable"> </el-table-column>
				<el-table-column prop="name" :label="$t('dataFlow.taskName')" :show-overflow-tooltip="true">
				</el-table-column>
				<el-table-column
					sortable="custom"
					:label="$t('dataFlow.creatdor')"
					width="180"
					prop="user.email"
				></el-table-column>
				<el-table-column prop="status" sortable="custom" :label="$t('dataFlow.taskStatus')" width="100">
					<template slot-scope="scope" v-if="!scope.row.hasChildren">
						<span :style="`color: ${colorMap[scope.row.status]};`">
							{{
								$t(
									'dataFlow.status.' + scope.row.status && scope.row.status !== undefined
										? scope.row.status.replace(/ /g, '_')
										: scope.row.status
								)
							}}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="input"
					sortable="custom"
					:label="$t('dataFlow.totalInput')"
					width="120"
				></el-table-column>
				<el-table-column
					prop="output"
					sortable="custom"
					:label="$t('dataFlow.totalOutput')"
					width="120"
				></el-table-column>
				<el-table-column
					prop="transmissionTime"
					sortable="custom"
					:label="$t('dataFlow.runningSpeed')"
					width="120"
				></el-table-column>
				<el-table-column
					prop="createTime"
					:label="$t('dataFlow.creationTime')"
					width="140"
					sortable="custom"
					:formatter="formatterTime"
				></el-table-column>
				<el-table-column :label="$t('dataFlow.taskSwitch')" width="70">
					<template slot-scope="scope">
						<div v-if="!scope.row.hasChildren">
							<el-switch
								v-model="scope.row.newStatus"
								inactive-value="stopping"
								:disabled="statusBtMap[scope.row.status].switch"
								active-value="scheduled"
								@change="handleStatus(scope.row.id, scope.row.status, scope.row.newStatus)"
							></el-switch>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="$t('dataFlow.operate')" width="180">
					<template slot-scope="scope">
						<div v-if="!scope.row.hasChildren">
							<el-tooltip class="item" :content="$t('dataFlow.detail')" placement="bottom">
								<el-button
									type="text"
									:disabled="statusBtMap[scope.row.status].detail"
									@click="handleDetail(scope.row.id, 'detail')"
								>
									<i class="iconfont  task-list-icon icon-chaxun"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('dataFlow.edit')" placement="bottom">
								<el-button
									type="text"
									:disabled="statusBtMap[scope.row.status].edit"
									@click="handleDetail(scope.row.id, 'edit')"
								>
									<i class="iconfont  task-list-icon  icon-ceshishenqing"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('message.delete')" placement="bottom">
								<el-button
									type="text"
									:disabled="statusBtMap[scope.row.status].delete"
									@click="handleDelete(scope.row.id)"
								>
									<i class="iconfont task-list-icon icon-shanchu"></i>
								</el-button>
							</el-tooltip>
							<el-dropdown @command="handleRowCommand" class="item">
								<el-button type="text"
									><i class="iconfont icon-gengduo3  task-list-icon"></i
								></el-button>
								<el-dropdown-menu slot="dropdown">
									<el-dropdown-item :command="'export' + scope.row.id">{{
										$t('dataFlow.dataFlowExport')
									}}</el-dropdown-item>
									<el-dropdown-item :command="'copy' + scope.row.id">{{
										$t('dataFlow.copy')
									}}</el-dropdown-item>
									<el-dropdown-item
										:disabled="statusBtMap[scope.row.status].reset"
										:command="'reset' + scope.row.id"
										>{{ $t('dataFlow.reset') }}</el-dropdown-item
									>
									<el-dropdown-item
										:command="'force_stopping' + scope.row.id"
										:disabled="statusBtMap[scope.row.status]['force stopping']"
										>{{ $t('dataFlow.status.force_stopping') }}</el-dropdown-item
									>
								</el-dropdown-menu>
							</el-dropdown>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				background
				class="pagination-bar"
				layout="prev, pager, next,sizes"
				:page-sizes="[20, 30, 50, 100]"
				:page-size="pagesize"
				:total="totalNum"
				@current-change="handleCurrentChange"
				@size-change="handleSizeChange"
			>
				>
			</el-pagination>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import factory from '../../api/factory';
const dataFlows = factory('DataFlows');
const MetadataInstance = factory('MetadataInstances');
export default {
	data() {
		return {
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
				search: localStorage.getItem('flowSearch') || '',
				timeData: [],
				status: localStorage.getItem('flowStatus') || '',
				person: '',
				way: localStorage.getItem('flowWay') || '',
				classification: []
			},
			statusBtMap: {
				scheduled: { switch: true, delete: true, edit: true, detail: true, forceStop: true, reset: true },
				draft: { switch: true, delete: false, edit: false, detail: true, forceStop: true, reset: true },
				running: { switch: false, delete: true, edit: true, detail: true, forceStop: true, reset: true },
				stopping: { switch: true, delete: true, edit: true, detail: true, forceStop: false, reset: true },
				error: { switch: false, delete: false, edit: false, detail: true, forceStop: true, reset: false },
				paused: { switch: false, delete: false, edit: false, detail: true, forceStop: true, reset: false },
				'force stopping': { switch: true, delete: true, edit: true, detail: true, forceStop: true, reset: true }
			}
		};
	},
	created() {
		if (localStorage.getItem('flowOrder') && localStorage.getItem('flowProp')) {
			let prop = localStorage.getItem('flowOrder') === 'ascending' ? 'ASC' : 'DESC';
			this.order = localStorage.getItem('flowProp') + ' ' + prop;
		}
		this.formData = this.$store.state.dataFlows;
		this.screenFn();
		this.keyupEnter();
	},
	computed: {
		maxHeight: function() {
			let height = document.body.clientHeight - 120 + 'px';
			return height;
		}
	},
	methods: {
		handleGoFuntion() {
			top.location.href = '/#/JsFuncs';
		},
		handleDetail(id, type) {
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
						h('span', null, '、'),
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
						query: { id: id }
					});
					setTimeout(() => {
						window.open(routeUrl.href, '_blank');
					}, 200);
				});
			} else {
				let routeUrl = this.$router.resolve({
					path: '/job',
					query: { id: id }
				});
				window.open(routeUrl.href, '_blank');
			}
		},
		handleImport() {
			let routeUrl = this.$router.resolve({
				path: '/upload'
			});
			window.open(routeUrl.href, '_blank');
		},
		handleCommand(command) {
			if (command === 'a') {
				this.handleDownload();
			} else if (command === 'b') {
				this.handleAllStatus('scheduled');
			} else if (command === 'c') {
				this.handleAllStatus('stopping');
			} else if (command === 'd') {
				this.handleAllDelete();
			} else if (command === 'e') {
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
		handleRowCommand(command) {
			if (command.indexOf('export') !== -1) {
				let id = [];
				id.push(command.replace('export', ''));
				let where = {
					_id: {
						in: id
					}
				};
				MetadataInstance.download(where);
			} else if (command.indexOf('copy') !== -1) {
				let id = command.replace('copy', '');
				this.handlerCopy(id);
			} else if (command.indexOf('reset') !== -1) {
				let id = command.replace('reset', '');
				this.handleReset(id);
			} else if (command.indexOf('force_stopping') !== -1) {
				this.$confirm(this.$t('message.forceStoppingMessage'), this.$t('dataFlow.importantReminder'), {
					confirmButtonText: this.$t('dataFlow.button.force_stop'),
					cancelButtonText: this.$t('message.cancel'),
					type: 'warning'
				}).then(() => {
					let id = command.replace('force_stopping', '');
					this.handleStatus(id, 'force stopping');
				});
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
			localStorage.setItem('flowSearch', this.formData.search);
			localStorage.setItem('flowStatus', this.formData.status);
			localStorage.setItem('flowWay', this.formData.way);
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
			let order = 'createTime DESC';
			if (this.order) {
				order = this.order;
			}
			if (this.formData) {
				if (this.formData.status && this.formData.status !== '') {
					where.status = this.formData.status;
				}
				if (this.formData.way && this.formData.way !== '') {
					where['setting.sync_type'] = this.formData.way;
				}
				if (this.formData.search && this.formData.search !== '') {
					where.or = [
						{
							name: { like: this.formData.search, options: 'i' }
						},
						{
							'stages.name': { like: this.formData.search, options: 'i' }
						},
						{
							'stages.tableName': { like: this.formData.search, options: 'i' }
						}
					];
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
							description: true,
							status: true,
							executeMode: true,
							category: true,
							stopOnError: true,
							mappingTemplate: true,
							last_updated: true,
							createTime: true,
							children: true,
							stats: true,
							stages: true,
							setting: true,
							user_id: true
						}
					})
				},
				params
			);
			await dataFlows.get(_params).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.tableData = res.data;
						this.handleData(this.tableData);
					}
				}
				this.loading = false;
			});
			this.getCount(where);
		},
		handleData(data) {
			if (!data) return;

			data.map(item => {
				item.newStatus = ['running', 'scheduled'].includes(item.status) ? 'scheduled' : 'stopping';
				if (item.stats) {
					item.hasChildren = false;
					item.input = item.stats.input ? item.stats.input.rows : '--';
					item.output = item.stats.output ? item.stats.output.rows : '--';
					item.transmissionTime = item.stats.transmissionTime ? item.stats.transmissionTime : '--';
					let children = item.stages;
					item.children = [];

					if (children) {
						children.map(k => {
							let stage = '';
							let node = {};
							if (item.stats.stagesMetrics) {
								stage = item.stats.stagesMetrics.filter(v => k.id === v.stageId);
							}
							if (stage.length === 0) {
								node = {
									id: item.id + k.id,
									name: k.name,
									input: '--',
									output: '--',
									transmissionTime: '--',
									hasChildren: true
								};
							} else {
								node = {
									id: item.id + k.id,
									name: k.name,
									input: stage[0].input.rows,
									output: stage[0].output.rows,
									transmissionTime: stage[0].transmissionTime,
									hasChildren: true
								};
							}
							item.children.push(node);
						});
					}
				} else {
					item.input = '--';
					item.output = '--';
					item.transmissionTime = '--';
				}
			});
		},
		getCount(where) {
			where = {
				where: where
			};
			dataFlows.count(where).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.totalNum = res.data.count;
					}
				}
			});
		},

		deleteConfirm(callback) {
			this.$confirm(this.$t('message.deteleMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('message.delete'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning'
			}).then(callback);
		},

		handleAllDelete() {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let multipleSelection = [];
			this.multipleSelection.map(item => {
				this.tableData.map(row => {
					if (
						row.id === item.id &&
						(row.status === 'paused' || row.status === 'error' || row.status === 'draft')
					) {
						multipleSelection.push(item.id);
					}
				});
			});
			if (multipleSelection.length === 0) {
				return;
			}
			let where = {
				_id: {
					inq: multipleSelection
				}
			};
			this.deleteConfirm(() => {
				dataFlows.deleteAll(where).then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						this.getData();
						this.$message.success(this.$t('message.deleteOK'));
					} else {
						this.$message.info(this.$t('message.deleteFail'));
					}
				});
			});
		},
		handleDelete(id) {
			this.deleteConfirm(() => {
				dataFlows.delete(id).then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						this.getData();
						this.$message.success(this.$t('message.deleteOK'));
					} else {
						this.$message.info(this.$t('message.deleteFail'));
					}
				});
			});
		},

		statusConfirm(callback) {
			this.$confirm(this.$t('message.stopMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('message.confirm'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning'
			}).then(callback);
		},

		handleStatus(id, oldStatus, status) {
			if (oldStatus === 'draft') {
				return;
			}
			let data = {
				status: status
			};
			if (status === 'stopping') {
				this.statusConfirm(() => {
					this.getStatus(id, data);
				});
			} else {
				this.getStatus(id, data);
			}
		},

		async getStatus(id, data) {
			await dataFlows.updateById(id, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.getData();
				}
			});
		},

		handleAllStatus(status) {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let multipleSelection = [];
			let discardData = [];
			if (status === 'scheduled') {
				//全部启动
				this.multipleSelection.map(item => {
					this.tableData.map(row => {
						if (row.id === item.id && (row.status === 'paused' || row.status === 'error')) {
							multipleSelection.push(item.id);
						} else {
							discardData.push(item.id);
						}
					});
				});
			} else if (status === 'stopping') {
				//全部停止
				this.multipleSelection.map(item => {
					this.tableData.map(row => {
						if (row.id === item.id && row.status === 'running') {
							multipleSelection.push(item.id);
						} else {
							discardData.push(item.id);
						}
					});
				});
			}
			if (multipleSelection.length === 0) {
				this.$message.warning(discardData.length + 1);
				return;
			}
			let where = {
				_id: {
					in: multipleSelection
				}
			};
			let attributes = {
				status: status
			};

			if (status === 'stopping') {
				this.statusConfirm(() => {
					dataFlows.update(where, attributes).then(res => {
						if (res.statusText === 'OK' || res.status === 200) {
							this.getData();
						}
					});
				});
			} else {
				dataFlows.update(where, attributes).then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						this.getData();
					}
				});
			}
		},
		handleReset(id) {
			this.restConfirm(() => {
				this.restLoading = true;
				dataFlows
					.reset(id)
					.then(res => {
						if (res.statusText === 'OK' || res.status === 200) {
							this.getData();
							this.$message.success(this.$t('message.resetOk'));
						} else {
							this.$message.info(this.$t('message.cancleReset'));
						}
					})
					.finally(() => {
						this.restLoading = false;
					});
			});
		},

		restConfirm(callback) {
			this.$confirm(this.$t('message.resetMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('dataFlow.reset'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning'
			}).then(callback);
		},

		handleAllRest() {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
				return;
			}
			let errorStatus = [];
			let multipleSelection = [];
			this.multipleSelection.map(item => {
				this.tableData.map(row => {
					if (row.id === item.id && (row.status === 'paused' || row.status === 'error')) {
						multipleSelection.push(item.id);
					} else if (row.id === item.id && (row.status !== 'paused' || row.status !== 'error')) {
						this.$message.info(this.$t('message.notRest'));
						errorStatus.push(item.id);
					}
				});
			});
			if (multipleSelection.length !== 0 && errorStatus.length === 0) {
				let where = multipleSelection;
				this.restConfirm(() => {
					this.restLoading = true;
					dataFlows
						.resetAll(where)
						.then(res => {
							if (res.statusText === 'OK' || res.status === 200) {
								this.getData();
								this.$message.success(this.$t('message.resetOk'));
							} else {
								this.$message.info(this.$t('message.cancleReset'));
							}
						})
						.finally(() => {
							this.restLoading = false;
						});
				});
			} else {
				return;
			}
		},
		handlerCopy(id) {
			let self = this;
			dataFlows.copy(id).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					self.getData();
					this.$message.success(this.$t('message.copySuccess'));
				} else {
					this.$message.error(this.$t('message.copyFail'));
				}
			});
		},
		formatterTime(row) {
			let time = row.createTime ? this.$moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
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
		}
	}
};
</script>

<style lang="less" scoped>
.task-list {
	font-size: 14px;
	margin-left: 20px;
	/*height: calc(100% - 48px);*/
	.el-button.is-disabled {
		color: #c0c4cc;
	}
	.el-button--text {
		color: #606266;
	}
}

.task-list-operating-area {
	border-radius: 3px;
	transition: 0.2s;
	padding-left: 5px;
	margin-left: 0;

	.el-input,
	.el-select {
		display: inline-block;
		width: 240px;
	}

	.el-form-item {
		margin-bottom: 4px;
	}
}
.df-btn-box {
	padding: 0;
	width: 30px;
	height: 28px;
}
.df-btn {
	color: #999;
	font-size: 15px;
}
.el-table .el-table__row .el-table__row--level .el-table__expand-icon {
	width: 25px;
	margin-left: -20px !important;
	float: left !important;
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

.clear {
	clear: both;
}

.item {
	margin-left: 10px;
}
.task-list .el-pagination {
	width: 100%;
	padding: 10px 0;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	text-align: right;
	overflow: hidden;
	z-index: 999;
}
.back-btn-icon-box,
.add-btn-icon-box {
	width: 28px;
	height: 28px;
	display: inline-block;
	border-radius: 4px;
	line-height: 1;
	white-space: nowrap;
	cursor: pointer;
	background: #48b6e2;
	border: 0;
	color: red;
	-webkit-appearance: none;
	text-align: center;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	outline: 0;
	margin: 0;
	-webkit-transition: 0.1s;
	transition: 0.1s;
	font-weight: normal;
	padding: 0;
	font-size: 14px;
}
.dv-btn-icon {
	background: #f5f5f5;
	border: 1px solid #dcdfe6;
}
.back-btn-icon-box:hover {
	background: #dedee4;
}

.back-btn-icon {
	color: #666;
}
.add-btn-icon {
	color: #fff;
}
.dataFlowsFlow {
	margin-top: 10px;
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
.add-btn-icon-box .el-button:focus,
.add-btn-icon-box .el-button:hover {
	background-color: #48b6e2;
}
.dataFlowsFlow .el-form-item__content {
	line-height: 0;
}
.dataflow-clickTip .el-message-box__status {
	top: 25% !important;
}
</style>
