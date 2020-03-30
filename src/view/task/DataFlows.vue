<template>
	<div class="task-list" style="overflow: auto;">
		<div class="task-list-operating-area box-card">
			<el-row :gutter="10">
				<el-form label-width="100px" :data="formData">
					<el-row>
						<el-col :span="8">
							<el-form-item :label="$t('message.sourchName')">
								<el-input
										:placeholder="$t('dataFlow.searchPlaceholder')" prefix-icon="el-icon-search"
										v-model="formData.search"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item :label="$t('dataFlow.dataRange')">
								<el-date-picker type="daterange" v-model="formData.timeData" size="small "
												class="task-list-time-picker"
												:range-separator="$t('dataFlow.separator')"
												:start-placeholder="$t('dataFlow.startTime')"
												:end-placeholder="$t('dataFlow.endTime')"
												:placeholder="$t('dataFlow.dataPlaceholder')"></el-date-picker>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item :label=" $t('dataFlow.taskStatus') ">
								<el-select v-model="formData.status" clearable :placeholder=" $t('dataFlow.taskStatusPlaceholder')">
									<el-option
											v-for="item in options" :key="item.value" :label="item.label"
											:value="item.value"></el-option>
								</el-select>
								<el-button type="primary" size="mini" @click="screenFn">{{ $t('message.filter') }}
								</el-button>
							</el-form-item>

						</el-col>
					</el-row>
					<!--          <el-row>-->
					<!--            <el-col :span="8">-->
					<!--              <el-form-item label="创建人:">-->
					<!--                <el-select v-model="formData.person" clearable placeholder="请选择" multiple >-->
					<!--                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
					<!--              </el-select>-->
					<!--              </el-form-item>-->
					<!--            </el-col>-->
					<!--            <el-col :span="8">-->
					<!--              <el-form-item label="目录分类:">-->
					<!--                <el-select v-model="formData.classification" clearable placeholder="请选择">-->
					<!--                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>-->
					<!--                </el-select>-->
					<!--              </el-form-item>-->
					<!--            </el-col>-->
					<!--          </el-row>-->
				</el-form>
			</el-row>
		</div>
		<div class="task-list-main">
			<div>
				<div class="task-list-menu-left">
					<i class="iconfont icon-icon_yingyongguanli"></i>
					<i class="iconfont icon-liebiao"></i>
				</div>
				<div class="task-list-menu-right">
					<i class="iconfont task-list-menu-cion icon-play-circle" @click="handleAllStatus('paused')"></i>
					<i class="iconfont task-list-menu-cion  icon-zanting" @click="handleAllStatus('running')"></i>
					<i
							class="iconfont task-list-menu-cion  icon-icon_tianjia"
							@click="$router.push({path: '/job'})"></i>
				</div>
			</div>
			<div class="clear"></div>
			<el-table
					:data="tableData" style="width: 99%;border: 1px solid #dedee4;margin-top: 10px;"
					:max-height="maxHeight" row-key="id"
					:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
					@sort-change="handleSortTable"
					@selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55" :selectable="handleSelectable">
				</el-table-column>
				<el-table-column prop="name" :label="$t('dataFlow.taskName')">
				</el-table-column>
				<el-table-column sortable='custom' :label="$t('dataFlow.creatdor')" width="180"></el-table-column>
				<el-table-column prop="status" sortable='custom' :label="$t('dataFlow.taskStatus')" width="100">
					<template slot-scope="scope" v-if="!scope.row.hasChildren">
						<span :style="`color: ${ colorMap[scope.row.status] };`"> {{ $t('dataFlow.status.' + scope.row.status) }} </span>
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
						prop="last_updated" :label="$t('dataFlow.updateTime')" width="140"
						:formatter="formatterTime"></el-table-column>
				<el-table-column :label="$t('dataFlow.updateTime')" width="70">
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
							<el-tooltip class="item" :content="$t('dataFlow.dataMap')" placement="bottom">
								<router-link :to='{path:"/job", query: { id: scope.row.id}}'><i
										class="iconfont task-list-icon icon-yunyingzhongxin"></i></router-link>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('dataFlow.edit')" placement="bottom">
								<router-link :to='{path:"/job", query: { id: scope.row.id}}'><i
										class="iconfont task-list-icon icon-ceshishenqing"></i></router-link>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('dataFlow.copy')" placement="bottom">
								<i class="iconfont task-list-icon icon-fuzhi1"></i>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('message.delete')" placement="bottom">
								<i class="iconfont task-list-icon icon-shanchu" @click="handleDelete(scope.row.id)"></i>
							</el-tooltip>
							<el-tooltip class="item" :content="$t('dataFlow.reset')" placement="bottom">
								<i class="iconfont task-list-icon icon-shuaxin1" @click="handleReset(scope.row.id)"></i>
							</el-tooltip>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>

<script>
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
				let height = document.body.clientHeight - 190 + "px";
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
				let order = '';
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
						where.createTime = {
							between: this.formData.timeData
						};
					}
				}
				let _params = Object.assign({
					filter: JSON.stringify({
						where: where,
						order: order,
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
			},
			handleData(data) {
				if (!data) return;
				data.map(item => {

					item.newStatus = 'running' === item.status ? 'running' : 'paused';

					if (item.stats) {
						item.input = item.stats.input.rows;
						item.output = item.stats.output.rows;
						item.transmissionTime = item.stats.transmissionTime;
						item.hasChildren = false;
						let children = item.stats.stagesMetrics;
						item.children = [];
						if (children) {
							children.map(k => {
								let node = {
									id: k.stageId,
									input: k.input.rows,
									output: k.output.rows,
									transmissionTime: k.transmissionTime,
									hasChildren: true,
								};
								item.children.push(node);
							});
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
			formatterTime(row) {
				let time = row.last_updated ? this.$moment(row.last_updated).format('YYYY-MM-DD HH:mm:ss') : '';
				return time;
			},
			handleSortTable(column) {
				let currentOrder = column.order === "ascending" ? "ASC" : 'DESC';
				let mapping = {
					status: 'status',
					last_updated: 'last_updated',
					input: 'stats.input.rows',
					output: 'stats.output.rows',
					transmissionTime: 'stats.transmissionTime',
				};
				this.order = mapping[column.prop] + " " + currentOrder;
				this.getData();
			},
			handleSelectionChange(val) {
				this.multipleSelection = val;
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
		border: 1px solid #ebebeb;
		border-radius: 3px;
		transition: .2s;
		padding: 10px;
		margin: 20px;
		margin-left: 0px;

		.el-input, .el-select {
			display: inline-block;
			width: 240px;
		}

		.el-form-item {
			margin-bottom: 6px;
		}
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

	.task-list-time-picker {
		width: 240px;
	}

	.task-list-menu-left {
		float: left;
	}

	.task-list-menu-right {
		float: right;
		margin-right: 20px;
	}

	.el-table .sort-caret {
		border: 3px solid transparent !important;
	}

	.clear {
		clear: both;
	}

	.item {
		margin-left: 10px;
		color: #606266;
	}

</style>
