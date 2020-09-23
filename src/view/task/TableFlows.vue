<template>
	<div style="height: 100%;">
		<el-container class="table-flows-wrap">
			<div class="panel-left" v-if="formData.panelFlag">
				<metaData v-on:nodeClick="nodeClick"></metaData>
			</div>
			<el-container>
				<el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
					<el-tab-pane label="任务视图" name="dataFlow"></el-tab-pane>
					<el-tab-pane label="表视图" name="tableFlow"></el-tab-pane>
				</el-tabs>
				<el-header height="auto">
					<el-form class="search-bar" size="mini" :inline="true">
						<el-form-item>
							<div
								:class="[{ panelOpen: formData.panelFlag }, 'item', 'panelBtn']"
								@click="handlePanelFlag"
							>
								<i class="iconfont icon-xiangshangzhanhang"></i>
								<span>{{
									formData.panelFlag ? $t('dataFlow.closeSetting') : $t('dataFlow.openPanel')
								}}</span>
							</div>
						</el-form-item>
						<el-form-item>
							<el-input
								clearable
								style="width: 300px;"
								v-model="formData.keyword"
								:placeholder="$t('dataFlow.searchPlaceholder')"
								@change="screenFn"
							></el-input>
						</el-form-item>
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
							<el-select
								v-model="formData.executionStatus"
								size="mini"
								clearable
								:placeholder="$t('dataFlow.executionStatus')"
								style="width:160px"
								@change="screenFn"
							>
								<el-option
									v-for="opt in ['initializing', 'cdc', 'initialized']"
									:key="opt"
									:label="$t('dataFlow.status.' + opt)"
									:value="opt"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="item" v-if="checkedTag && checkedTag !== ''">
							<el-tag size="small" closable @close="handleClose()">{{ checkedTag.value }}</el-tag>
						</el-form-item>
						<el-form-item>
							<el-button style="padding: 7px;" icon="el-icon-refresh-right" @click="reset()"></el-button>
						</el-form-item>
						<el-form-item style="margin-right: 0;flex:1;text-align:right;">
							<el-button @click="rowCheckAll">
								<i class="iconfont icon-jiekoufuwu"></i>
								<span>批量校验</span>
							</el-button>
						</el-form-item>
					</el-form>
				</el-header>
				<el-main class="main">
					<div class="table">
						<el-table
							:data="page.data"
							height="100%"
							style="width: 100%"
							v-loading="loading"
							:row-class-name="rowClassHandler"
							@sort-change="sortHandler"
							@selection-change="selectHandler"
						>
							<el-table-column type="selection" width="44" align="center"></el-table-column>
							<el-table-column sortable="custom" label="源表/目标表" prop="stages.name">
								<template slot-scope="scope">
									<div class="table-item">
										<div class="table-source">[S] {{ scope.row.stages.name }}</div>
										<div class="from-db">{{ scope.row.databaseName }}</div>
										<div v-for="item in scope.row.outf" :key="item.name">
											<div class="table-target">[T] {{ item.name }}</div>
											<div class="from-db">{{ item.databaseName }}</div>
										</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column
								sortable="custom"
								prop="name"
								label="所在任务/执行时间"
								width="250"
								align="center"
							>
								<template slot-scope="scope">
									<div class="table-item">
										<div>{{ scope.row.name }}</div>
										<div class="dark-color">{{ scope.row.startTime }}</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column sortable="custom" prop="status" label="状态" width="120">
								<template slot-scope="scope">
									<img
										v-if="scope.row.status == 'running'"
										style="width: 12px;height: 15px;vertical-align: middle;"
										src="../../../static/editor/running-blue.svg"
									/>
									<span class="primary-color" v-show="scope.row.name">{{
										scope.row.statusLabel
									}}</span>
								</template>
							</el-table-column>
							<el-table-column label="阶段" width="120">
								<template slot-scope="scope">
									<span>
										{{ scope.row.cdcStatusStr }} (<span class="dark-color"
											>{{ scope.row.ratio }}%</span
										>)
									</span>
								</template>
							</el-table-column>
							<el-table-column label="输出/输入" width="120">
								<template slot-scope="scope">
									<div class="table-item">
										<div>
											<span class="dark-color">[输出]</span>&nbsp;
											<span>{{ scope.row.output }}</span>
										</div>
										<div>
											<span class="dark-color">[输入]</span>&nbsp;
											<span>{{ scope.row.input }}</span>
										</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column label="速度(条/s)" width="120" align="center">
								<template slot-scope="scope">
									<span>{{ scope.row.speed }}</span>
								</template>
							</el-table-column>
							<el-table-column label="行数" width="150" align="center">
								<template slot-scope="scope">
									<i class="el-icon-loading" v-show="scope.row.noshow"></i>
									<div v-show="!scope.row.noshow">
										<div class="table-target">[S] {{ scope.row.output }}</div>
										<div v-show="!scope.row.noshow" v-for="item in scope.row.outf" :key="item.name">
											<div :class="{ red: scope.row.red }">[T] {{ item.input.rows }}</div>
										</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column width="120" align="center">
								<template slot-scope="scope">
									<el-link size="mini" type="primary" @click="rowCheck(scope.row)">行数检查</el-link
									><br />
								</template>
							</el-table-column>
						</el-table>
					</div>
					<el-pagination
						background
						class="pagination"
						:current-page.sync="page.current"
						:page-sizes="[10, 20, 50, 100]"
						:page-size.sync="page.size"
						layout="total, sizes, prev, pager, next, jumper"
						:total="page.total"
						@size-change="getData(1)"
						@current-change="getData"
					>
					</el-pagination>
				</el-main>
			</el-container>
			<SelectClassify
				ref="SelectClassify"
				:dialogVisible="dialogVisible"
				type="dataflow"
				:tagLists="tagList"
				v-on:dialogVisible="handleDialogVisible"
				v-on:operationsClassify="handleOperationClassify"
			></SelectClassify>
		</el-container>
	</div>
</template>

<script>
import factory from '../../api/factory';
import ws from '../../api/ws';
import metaData from '../metaData';
import SelectClassify from '../../components/SelectClassify';

const dataFlows = factory('DataFlows');

export default {
	name: 'TableFlows',
	components: { metaData, SelectClassify },
	data() {
		return {
			loading: true,
			dialogVisible: false,
			tagList: [],
			activeName: 'tableFlow',
			searchParams: this.$store.state.tableFlows,
			page: {
				data: null,
				current: 1,
				size: 10,
				total: 0,
				sortBy: 'name',
				order: 'ASC'
			},
			statusOptions: ['running', 'paused', 'error', 'draft', 'scheduled', 'stopping', 'force_stopping'],
			syncOtions: [
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
			selections: [],
			formData: {
				keyword: '',
				status: '',
				person: '',
				way: '',
				executionStatus: '',
				classification: [],
				panelFlag: true
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
			]
		};
	},
	created() {
		this.getFlowOptions();
		this.getData();
	},
	methods: {
		handlePanelFlag() {
			this.formData.panelFlag = !this.formData.panelFlag;
		},
		handleDialogVisible() {
			this.dialogVisible = false;
		},
		handleClassify() {
			if (this.multipleSelection.length === 0) {
				this.$message.info('please select row data');
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
		handleClose() {
			this.checkedTag = '';
			this.getData();
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
			dataFlows.patchAll({ attrs: attributes }).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.dataFlowId = '';
					this.getData();
				}
			});
		},
		rowClassHandler({ rowIndex }) {
			return `table-row-${rowIndex}`;
		},
		selectHandler(val) {
			this.selections = val;
		},
		sortHandler({ prop, order }) {
			this.page.sortBy = prop;
			this.page.order = order;
			this.getData(1);
		},
		getFlowOptions() {
			setTimeout(() => {
				let list = [];
				for (let i = 0; i < 10; i++) {
					list.push({
						name: 'flow_' + i,
						id: 'ID_' + i
					});
				}
				this.flowOptions = list;
			}, 2000);
		},
		reset() {
			this.searchParams = {
				flowId: '',
				keyword: '',
				status: '',
				way: '',
				executionStatus: ''
			};
			this.getData(1);
		},
		searchParamsChange() {
			this.$store.commit('tableFlows', this.searchParams);
		},
		nodeClick(data) {
			if (data) {
				this.checkedTag = {
					id: data.id,
					value: data.value
				};
				this.getData();
			}
		},
		screenFn() {
			this.page.current = 1;
			this.getData();
		},
		keyupEnter() {
			document.onkeydown = e => {
				if (e.keyCode === 13) {
					this.getData();
				}
			};
		},
		rowCheck(item) {
			this.$set(item, 'noshow', true);
			if (item.input != item.output) {
				this.$set(item, 'red', true);
			}
			let that = this;
			setTimeout(() => that.$set(item, 'noshow', false), 1500);
		},
		rowCheckAll() {
			this.page.data.forEach(it => this.rowCheck(it));
		},
		async getData(pageNum) {
			this.loading = true;
			this.$store.commit('tableFlows', this.formData);
			let { current, size, sortBy, order } = this.page;
			//let { keyword, flowId } = this.searchParams;
			let currentPage = pageNum || current;
			let where = {};

			if (!parseInt(this.$cookie.get('isAdmin'))) where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			if (this.formData) {
				if (this.formData.status && this.formData.status !== '') where.status = this.formData.status;
				if (this.formData.way && this.formData.way !== '') where['setting.sync_type'] = this.formData.way;
				if (this.formData.keyword && this.formData.keyword !== '') where.name = this.formData.keyword;
				if (this.formData.executionStatus) where['cdcStatus'] = this.formData.executionStatus;
			}
			if (this.checkedTag && this.checkedTag !== '') {
				where['listtags'] = [this.checkedTag.id];
			}
			let _params = Object.assign({}, where, {
				order: order === 'descending' ? 'DESC' : 'ASC',
				orderBy: sortBy,
				limit: size,
				skip: (currentPage - 1) * size
			});

			await dataFlows.tableFlow(_params).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.handleData(res.data.datas);
						this.page.data = res.data.datas;
						this.page.total = res.data.count;
						let msg = {
							type: 'watch',
							collection: 'DataFlows',
							filter: {
								where: { 'fullDocument._id': { $in: this.page.data.map(it => it.id) } }, //查询条件
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
									'fullDocument.stages.name': true
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
				}
				this.loading = false;
			});
		},
		handleData(data) {
			if (!data) return;
			data.forEach(item => {
				this.cookRecord(item);
			});
		},
		cookRecord(item) {
			if (item.startTime) item.startTime = this.$moment(item.startTime).format('YYYY-MM-DD HH:mm:ss');
			item.statusLabel = this.$t('dataFlow.status.' + item.status.replace(/ /g, '_'));
			if (item.stages.statsStatus) item.cdcStatusStr = this.$t('dataFlow.status.' + item.stages.statsStatus);
			if (item.stages.output) item.output = item.stages.output.rows;
			else item.output = '--';
			if (item.outf && item.outf.length) {
				item.input = 0;
				item.outf.forEach(it => {
					if (!it.input) it.input = { rows: 0 };
					item.input += it.input.rows;
					if (item.stages.transmissionTime == 0 && it.transmissionTime > 0)
						item.stages.transmissionTime = it.transmissionTime;
				});
			} else item.input = '--';
			if (typeof item.output == 'number' && item.stages.transmissionTime > 0)
				item.speed = ((item.output * 1000) / item.stages.transmissionTime).toFixed(0);
			else item.speed = '--';
			if (item.totalCount) {
				if (item.totalCount.findWhere({ stageId: item.stages.stageId }))
					item.ratio = (
						(item.output / item.totalCount.findWhere({ stageId: item.stages.stageId }).dataCount) *
						100
					).toFixed(0);
			}
			return item;
		},
		handleTabClick(val) {
			if (val.name === 'dataFlow') {
				this.$router.push({
					name: 'dataFlows'
				});
			}
		}
	}
};
</script>
<style lang="less" scoped>
@primaryColor: #48b6e2;
@darkColor: #aaaaaa;
.ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.table-flows-wrap {
	height: 100%;
	overflow: hidden;
	.iconfont {
		font-size: 14px;
	}
	.search-bar {
		height: 100%;
		display: flex;
		align-items: center;
		.panelBtn {
			padding: 0 12px;
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
		.el-form-item {
			margin-bottom: 0;
		}
	}
	.main {
		display: flex;
		flex-direction: column;
		.table {
			flex: 1;
			overflow: hidden;
			.table-item {
				line-height: 18px;
				.ellipsis;
				div {
					.ellipsis;
				}
				.table-source {
					color: @primaryColor;
				}
				.from-db {
					padding-left: 20px;
					color: @darkColor;
				}
			}
			.dark-color {
				color: @darkColor;
			}
			.primary-color {
				color: @primaryColor;
			}
			.el-button {
				padding: 5px;
				cursor: pointer;
				&:hover {
					color: #48b6e2;
				}
			}
			.el-button + .el-button {
				margin-left: 5px;
			}
		}
		.pagination {
			padding: 20px 0;
			text-align: right;
		}
	}
}
</style>
<style lang="less">
.el-tabs__item {
	height: 29px;
	line-height: 25px;
	font-size: 12px;
}
.red {
	color: red;
}
</style>
