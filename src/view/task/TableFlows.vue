<template>
	<div style="height: 100%;">
		<div style=" border-bottom: 1px solid #e2e2e7;text-align:center">
			<div style="border-top: 2px solid gray; float:left; width:180px; height: 40px; background-color:#f5f5f5; ">
				<span style="position: relative; top:20%;">任务视图</span>
			</div>
			<div
				style="border-top: 2px solid #48b6e2; border-left: 1px solid #e2e2e7;  border-right: 1px solid #e2e2e7;float:left; width:180px; height: 40px;"
			>
				<span style="position: relative; top:20%;">表视图</span>
			</div>
			<div style="clear:both;"></div>
		</div>
		<el-container class="table-flows-wrap">
			<div class="panel-left" v-if="formData.panelFlag">
				<metaData v-on:nodeClick="nodeClick"></metaData>
			</div>
			<el-container>
				<el-header height="auto" style="padding-top: 20px;">
					<el-form class="search-bar" size="mini" :inline="true">
						<el-form-item>
							<i class="iconfont icon-xiangshangzhanhang"></i>
							<span>{{
								formData.panelFlag ? $t('dataFlow.closeSetting') : $t('dataFlow.openPanel')
							}}</span>
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

						<el-form-item>
							<el-button style="padding: 7px;" icon="el-icon-refresh-right" @click="reset()"></el-button>
						</el-form-item>
						<el-form-item style="margin-right: 0;flex:1;text-align:right;">
							<el-button>
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
							<el-table-column sortable="custom" label="源表/目标表">
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
							<el-table-column label="所在任务/执行时间" width="150" align="center">
								<template slot-scope="scope">
									<div class="table-item">
										<div>{{ scope.row.name }}</div>
										<div class="dark-color">{{ scope.row.startTime }}</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column sortable="custom" label="状态" width="120">
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
							<el-table-column sortable="custom" label="阶段" width="120">
								<template slot-scope="scope">
									<span>
										初始化中 (<span class="dark-color">{{ scope.row.num }}%</span>)
									</span>
								</template>
							</el-table-column>
							<el-table-column label="输出/输入" width="120">
								<template slot-scope="scope">
									<div class="table-item">
										<div>
											<span class="dark-color">[输出]</span>&nbsp;
											<span>{{ scope.row.out }}</span>
										</div>
										<div>
											<span class="dark-color">[输入]</span>&nbsp;
											<span>{scope.row.in}}</span>
										</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column sortable="custom" label="速度(条/s)" width="120" align="center">
								<template slot-scope="scope">
									<span>{{ scope.row.out }}</span>
								</template>
							</el-table-column>
							<el-table-column lsortable="custom" label="行数对比" width="150" align="center">
								<template slot-scope="scope">
									<div class="table-item">
										<div>{{ scope.row.in }}/{{ scope.row.out }}</div>
										<div class="dark-color">2020-02-21 12:22:33</div>
									</div>
								</template>
							</el-table-column>
							<el-table-column sortable="custom" label="传输状况" width="120" align="center">
								<template slot-scope="scope">
									<div v-if="scope.row.out < 1000">
										<el-tag size="mini" type="success">Normal</el-tag>
									</div>
									<div>
										<el-tag size="mini" type="warning">Warning</el-tag>
									</div>
									<div>
										<el-tag size="mini" type="danger">Error</el-tag>
									</div>
								</template>
							</el-table-column>
							<el-table-column width="120" align="center">
								<template>
									<el-link size="mini" type="primary">行数检查</el-link><br />
									<el-link size="mini" type="primary">忽略异常</el-link>
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
import axios from 'axios';
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
			searchParams: this.$store.state.tableFlows,
			page: {
				data: null,
				current: 1,
				size: 10,
				total: 0,
				sortBy: '',
				order: ''
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
				search: '',
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
		axios.get('/api/web/users/gateway/userInfo4Web');
		this.getFlowOptions();
		this.getData();
	},
	methods: {
		handlePanelFlag() {
			this.formData.panelFlag = !this.formData.panelFlag;
			this.$store.commit('dataFlows', this.formData);
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
		renderRowBg(list) {
			list.forEach((item, index) => {
				let el = document.querySelector('.table-row-' + index);
				let len = Math.floor(el.clientWidth * (item.num / 100));
				el.style.boxShadow = `${len}px 0 0 0 #f5f5f5 inset`;
			});
		},
		selectHandler(val) {
			this.selections = val;
		},
		sortHandler({ prop, order }) {
			this.page.sortBy = prop;
			this.page.order = order;
			this.search(1);
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
			this.search(1);
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
		async getData(pageNum) {
			this.loading = true;
			this.$store.commit('tableFlows', this.formData);
			let { current, size, sortBy, order } = this.page;
			//let { keyword, flowId } = this.searchParams;
			let currentPage = pageNum || current + 1;
			let where = {};

			if (!parseInt(this.$cookie.get('isAdmin'))) where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			if (this.formData) {
				if (this.formData.status && this.formData.status !== '') where.status = this.formData.status;
				if (this.formData.way && this.formData.way !== '') where['setting.sync_type'] = this.formData.way;
				if (this.formData.search && this.formData.search !== '') where.name = this.formData.search;
				if (this.formData.executionStatus) where['stats.stagesMetrics.status'] = this.formData.executionStatus;
			}
			if (this.checkedTag && this.checkedTag !== '') {
				where['listtags.id'] = {
					in: [this.checkedTag.id]
				};
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
						this.handleData(res.data);
						this.page.data = res.data;
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
			if (item.input || item.output) {
				item.input = item.input ? item.input.rows : '--';
				item.output = item.output ? item.output.rows : '--';
				item.transmissionTime = item.transmissionTime
					? ((item.input * 1000) / item.transmissionTime).toFixed(0)
					: '--';
			} else {
				item.input = '--';
				item.output = '--';
				item.transmissionTime = '--';
			}
			return item;
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
