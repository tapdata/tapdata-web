<template>
	<div class="task-list" style="overflow: auto;">
		<div class="task-list-operating-area box-card">
			<el-row :gutter="10">
				<el-form label-width="100px" :data="formData" :inline="true">
					<el-row>
						<el-col :span="16">
							<el-form-item>
								<el-input
										:placeholder="$t('dataFlow.searchPlaceholder')" clearable prefix-icon="el-icon-search"
										v-model="formData.search" size="mini" @change="screenFn"></el-input>
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
								<el-select v-model="formData.status"  size="mini" clearable :placeholder=" $t('dataFlow.taskStatusPlaceholder')" style="width:160px" @change="screenFn">
									<el-option
											v-for="item in options" :key="item.value" :label="item.label"
											:value="item.value"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item>
								<el-button class="df-btn-box" size="mini">
									<i class="iconfont icon-shuaxin1 df-btn" @click="handleClear"></i>
								</el-button>
							</el-form-item>
						</el-col>
						<div class="task-list-menu-right">
							<el-button class="back-btn-icon-box dv-btn-icon" @click="handleAllStatus('paused')"><i class="iconfont icon-xinzeng1 back-btn-icon"></i></el-button>
							<el-button class="back-btn-icon-box dv-btn-icon" @click="handleAllStatus('running')"><i class="iconfont icon-xinzeng1 back-btn-icon"></i></el-button>
							<el-button class="back-btn-icon-box dv-btn-icon" ><i class="iconfont icon-xinzeng1 back-btn-icon"></i></el-button>
							<el-button class="back-btn-icon-box dv-btn-icon" ><i class="iconfont icon-xinzeng1 back-btn-icon"></i></el-button>
							<el-button class="back-btn-icon-box" @click="$router.push({path: '/job'})"><i class="iconfont icon-xinzeng1 back-btn-icon"></i></el-button>
						</div>
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
					:data="tableData" style="width: 99%;border: 1px solid #dedee4;"
					class="dv-table"
					:max-height="maxHeight" row-key="id"
					:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
					@sort-change="handleSortTable"
					@selection-change="handleSelectionChange"
					:default-sort="{ prop: 'createTime', order: 'descending'}">
				<el-table-column type="selection" width="55" :selectable="handleSelectable">
				</el-table-column>
				<el-table-column prop="name" :label="$t('dataFlow.taskName')">
				</el-table-column>
				<el-table-column sortable='custom' :label="$t('dataFlow.creatdor')" width="180"></el-table-column>
				<el-table-column prop="status" sortable='custom' :label="$t('dataFlow.taskStatus')" width="100">
					<template slot-scope="scope" v-if="!scope.row.hasChildren">
						<span :style="`color: ${ colorMap[scope.row.status] };`"> {{ $t('dataFlow.status.' +  scope.row.status && scope.row.status !==undefined ? scope.row.status.replace(/ /g, '_') : scope.row.status )}} </span>
					</template>
				</el-table-column>
				<el-table-column
						prop="input" sortable='custom' :label="$t('dataFlow.totalInput')"
						width="120"></el-table-column>
				<el-table-column
						prop="output" sortable='custom' :label="$t('dataFlow.totalOutput')"
						width="120"></el-table-column>
				<el-table-column
						prop="transmissionTime" sortable='custom' :label="$t('dataFlow.runningSpeed')"
						width="120"></el-table-column>
				<el-table-column
						prop="createTime" :label="$t('dataFlow.creationTime')" width="140" sortable='custom'
						:formatter="formatterTime"></el-table-column>
				<el-table-column :label="$t('dataFlow.taskStatus')" width="70">
					<template slot-scope="scope">
						<div v-if="!scope.row.hasChildren">
							<el-switch
									v-model="scope.row.newStatus"
									inactive-value="paused" active-value="running"
									@change="handleStatus(scope.row.id, scope.row.newStatus)"></el-switch>
						</div>
					</template>
				</el-table-column>
				<el-table-column :label="$t('dataFlow.operate')" width="180">
					<template slot-scope="scope">
						<div v-if="!scope.row.hasChildren">
							<el-tooltip v-if="scope.row.status !== 'scheduled'&& scope.row.status !== 'running'&& scope.row.status !== 'force stopping'&&scope.row.status !== 'stopping'" class="item" :content="$t('dataFlow.edit')" placement="bottom">
								<router-link :to='{path:"/job", query: { id: scope.row.id}}'><i
										class="iconfont task-list-icon  icon-ceshishenqing"></i></router-link>
							</el-tooltip>
							<el-tooltip v-else class="item" :content="$t('dataFlow.detail')" placement="bottom">
								<router-link :to='{path:"/job", query: { id: scope.row.id}}'><i
										class="iconfont task-list-icon icon-chaxun"></i></router-link>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('dataFlow.copy')" placement="bottom">
								<i class="iconfont task-list-icon icon-fuzhi1" @click="handlerCopy(scope.row.id)"></i>
							</el-tooltip>
							<el-tooltip v-if="scope.row.status !== 'scheduled'&& scope.row.status !== 'running'&& scope.row.status !== 'force stopping'&&scope.row.status !== 'stopping'" class="item" :content="$t('message.delete')" placement="bottom">
								<el-button type="text" @click="handleDelete(scope.row.id)">
									<i class="iconfont task-list-icon delete-icon  icon-shanchu"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip v-else class="item" :content="$t('message.delete')" placement="bottom">
								<el-button type="text" disabled  @click="handleDelete(scope.row.id)">
									<i class="iconfont task-list-icon  icon-shanchu"></i>
								</el-button>
							</el-tooltip>
							<el-tooltip  v-if="scope.row.status !== 'scheduled'&& scope.row.status !== 'running'&&scope.row.status !== 'force stopping'&&scope.row.status !== 'stopping'" class="item" :content="$t('dataFlow.reset')" placement="bottom">
								<el-button type="text"   @click="handleReset(scope.row.id)">
									<i class="iconfont task-list-icon delete-icon  icon-shuaxin1" ></i>
								</el-button>
							</el-tooltip>
							<el-tooltip  v-else class="item" :content="$t('dataFlow.reset')" placement="bottom">
								<el-button type="text" disabled @click="handleReset(scope.row.id)">
									<i class="iconfont task-list-icon icon-shuaxin1" ></i>
								</el-button>
							</el-tooltip>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination background
					class="pagination-bar"
					layout="total, prev, pager, next,sizes"
					:page-sizes="[12, 20, 30, 50,100]"
					:page-size="pagesize"
					:total="totalNum"
					@current-change="handleCurrentChange"
					@size-change="handleSizeChange">
					>
			</el-pagination>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import factory from '../../api/factory';
	const dataFlows = factory('DataFlows');
	export default {
		data() {
			return {
				colorMap: {
					running: '#67C23A',
					paused: '#F19149',
					draft: '#F56C6C',
					scheduled: '#cccccc',
					stopping: '#F19149',
					error: '#f53724',
				},
				order: '',
				tableData: [],
				newData: [],
				currentPage:1,
				pagesize: 12,
				totalNum: 0,
				options: [{
					label: this.$t('dataFlow.status.running'),
					value: 'running'
				}, {
					label: this.$t('dataFlow.status.paused'),
					value: 'paused'
				}, {
					label: this.$t('dataFlow.status.error'),
					value: 'error'
				}, {
					label: this.$t('dataFlow.status.draft'),
					value: 'draft'
				}, {
					label: this.$t('dataFlow.status.scheduled'),
					value: 'scheduled'
				}, {
					label: this.$t('dataFlow.status.stopping'),
					value: 'stopping'
				}, {
					label: this.$t('dataFlow.status.force_stopping'),
					value: 'force stopping'
				}],
				multipleSelection: [],
				formData: {
					search: '',
					timeData: [],
					status: '',
					person: '',
					classification: [],
				}
			};
		},
		created() {
			this.formData = this.$store.state.dataFlows;
			this.screenFn();
			this.keyupEnter();
		},
		computed: {
			maxHeight: function () {
				let height = document.body.clientHeight - 220 + "px";
				return height;
			}
		},
		methods: {
			handleSelectable(row) {
				if (row.hasChildren) {
					return false;
				} else {
					return true;
				}
			},
			screenFn() {
				this.getData();
			},
			keyupEnter() {
				document.onkeydown = e => {
					//let body = document.getElementsByTagName('body')[0];
					if (e.keyCode === 13) {
						this.getData();
					}
				};
			},
			async getData(params) {

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
					if (this.formData.search && this.formData.search !== '') {
						where.or = [{
							name: {regex: this.formData.search}
						}, {
							'stages.name': {regex: this.formData.search}
						}, {
							'stages.tableName': {regex: this.formData.search}
						}];
					}
					if (this.formData.timeData && this.formData.timeData.length !== 0) {
						let dates = _.cloneDeep(this.formData.timeData);
						if(dates[1]) {
							dates[1] = new Date(dates[1]);
							dates[1].setHours(dates[1].getHours() + 24);
						}
						where.createTime = {
							between: dates
						};
					}
				}
				let _params = Object.assign({
					filter: JSON.stringify({
						where: where,
						order: order,
						limit:this.pagesize,
						skip:(this.currentPage-1)*this.pagesize,
						fields: {
							"id": true,
							"name": true,
							"description": true,
							"status": true,
							"executeMode": true,
							"category": true,
							"stopOnError": true,
							"mappingTemplate": true,
							"last_updated": true,
							"createTime": true,
							"children": true,
							"stats": true,
							"stages": true
						},
					})
				}, params);
				await dataFlows.get(_params).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							this.tableData = res.data;
							this.handleData(this.tableData);
						}
					}
				});
				this.getCount(where);
			},
			handleData(data) {
				if (!data) return;
				data.map(item => {

					item.newStatus = 'running' === item.status ? 'running' : 'paused';

					if (item.stats) {
						item.hasChildren = false;

						let children = item.stages;
						item.children = [];

						if (children) {
							children.map(k => {
								let stage = '';
								let node = {};

								if(item.stats.stagesMetrics){
									stage = item.stats.stagesMetrics.filter(v => k.id === v.stageId);
								}

								if(stage.length === 0){
									node = {
										id: item.id+k.id,
										name:k.name,
										input:'--',
										output: '--',
										transmissionTime:'--',
										hasChildren: true,
									};
								}else {
									node = {
										id: item.id+k.id,
										name:k.name,
										input: stage[0].input.rows ? stage[0].input.rows :'--',
										output: stage[0].output.rows ?stage[0].output.rows : '--',
										transmissionTime: stage[0].transmissionTime ? stage[0].transmissionTime :'-',
										hasChildren: true,
									};
								}
								item.children.push(node);
							});
						}

						if(item.stats.input && item.stats.outputs){
							item.input = item.stats.input.rows ? item.stats.input.rows:'--';
							item.output = item.stats.output.rows ? item.stats.output.rows:'--';
							item.transmissionTime = item.stats.transmissionTime ? item.stats.transmissionTime:'--';
						}else {
							item.input = '--';
							item.output = '--';
							item.transmissionTime = '--';
						}
					}
				});
			},
			getCount(where){
				where = {
					where: where,
				};
				dataFlows.count(where).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							this.totalNum = res.data.count;
						}
					}
				});
			},
			handleDelete(id) {
				this.$confirm(this.$t('message.deteleMessage'), this.$t('message.prompt'), {
					confirmButtonText: this.$t('message.delete'),
					cancelButtonText: this.$t('message.cancle'),
					type: 'warning'
				}).then(() => {
					dataFlows.delete(id).then(res => {
						if (res.statusText === "OK" || res.status === 200) {
							this.getData();
						}
						this.$message.success(this.$('message.deleteOK'));
					});

				}).catch(() => {
					this.$message.info(this.$t('message.deleteFail'));
				});

			},
			async handleStatus(id, status) {
				let data = {
					status: status,
				};
				status = status === 'running' ? 'paused' : 'scheduled';
				await dataFlows.updateById(id, data).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						this.getData();
					}
				});
			},
			handleAllStatus(status) {
				if (this.multipleSelection.length === 0) {
					return;
				}
				let multipleSelection = [];
				this.multipleSelection.map(item => {
					multipleSelection.push(item.id);
				});
				let where = {
					_id: {
						in: multipleSelection
					},
				};
				let attributes = {
					status: status,
				};
				dataFlows.update(where, attributes).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						this.getData();
					}
				});
			},
			handleReset(id) {
				this.$confirm(this.$t('message.resetMessage'), this.$t('message.prompt'), {
					confirmButtonText: this.$t('dataFlow.reset'),
					cancelButtonText: this.$t('message.cancle'),
					type: 'warning'
				}).then(() => {
					// let attributes = {
					// 	status: 'draft',
					// 	stats: '',
					// };
					dataFlows.reset(id).then(res => {
						if (res.statusText === "OK" || res.status === 200) {
							this.getData();
						}
					});
					this.$message.success(this.$t('message.resetOk'));
				}).catch(() => {
					this.$message.info(this.$t('message.cancleReset'));
				});
			},
			handlerCopy(id){
				let self = this;
				dataFlows.copy(id).then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						self.getData();
						this.$message.success(this.$t('message.copySuccess'));
					} else {
						this.$message.error(this.$t('message.copyFail'));
					}
				}).catch(err => {
					this.$message.error(this.$t('message.copyFail'));
				});
			},
			formatterTime(row) {
				let time = row.createTime ? this.$moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '';
				return time;
			},
			handleSortTable(column) {
				let currentOrder = column.order === "ascending" ? "ASC" : 'DESC';
				let mapping = {
					status: 'status',
					last_updated: 'last_updated',
					createTime: 'createTime',
					input: 'stats.input.rows',
					output: 'stats.output.rows',
					transmissionTime: 'stats.transmissionTime',
				};
				this.order = mapping[column.prop] + " " + currentOrder;
				this.getData();
			},
			handleClear(){
				this.formData.search = '';
				this.formData.status = '';
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
				this.getData();
			},
		},
	};
</script>

<style lang="less" scoped>
	.task-list {
		font-size: 14px;
		margin-left: 20px;
		overflow: auto;
		/*height: calc(100% - 48px);*/
	}

	.task-list-operating-area {
		border-radius: 3px;
		transition: .2s;
		padding-left: 5px;
		margin-left: 0px;

		.el-input, .el-select {
			display: inline-block;
			width: 240px;
		}

		.el-form-item {
			margin-bottom: 6px;
		}
	}
	.df-btn-box{
		padding: 0;
		width: 30px;
		height: 28px;
	}
	.df-btn{
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
	.delete-icon{
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
		margin-top: 7px;
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
	.task-list  .el-pagination{
		width: 100%;
		padding: 10px 50px;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		text-align: right;
		overflow: hidden;
	}
	.back-btn-icon-box{
		width: 28px;
		height: 28px;
		display: inline-block;
		border-radius: 4px;
		line-height: 1;
		white-space: nowrap;
		cursor: pointer;
		background: #48B6E2;
		border: 0;
		color: red;
		-webkit-appearance: none;
		text-align: center;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		outline: 0;
		margin: 0;
		-webkit-transition: .1s;
		transition: .1s;
		font-weight: normal;
		padding:0;
		font-size: 14px;
	}
	.dv-btn-icon{
		background: #f5f5f5;
		border: 1px solid #DCDFE6;
	}
	.back-btn-icon-box:hover{
		background:#6dc5e8;
	}
	.back-btn-icon{
		color: #fff;
	}
</style>
<style lang="less">
	.task-list .el-pagination .el-pagination__total {
		float: left;
	}
	.task-list .el-form--inline .el-form-item{
		margin-right:4px;
	}
	.dv-table  thead{
		color:#333;
		th{
			padding:0;
			background: #fafafa;
		}
	}
</style>
