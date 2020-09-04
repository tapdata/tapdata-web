<template>
	<el-container class="table-flows-wrap">
		<el-container>
			<el-header height="auto" style="padding-top: 20px;">
				<el-form class="search-bar" size="mini" :inline="true" :model="searchParams">
					<el-form-item>
						<el-input
							clearable
							style="width: 300px;"
							v-model="searchParams.keyword"
							placeholder="请输入表名"
							@input="keyup()"
						></el-input>
					</el-form-item>
					<el-form-item>
						<el-select
							v-model="searchParams.flowId"
							placeholder="选择任务"
							:loading="!flowOptions"
							@input="search(1)"
						>
							<el-option
								v-for="opt in flowOptions"
								:key="opt.id"
								:label="opt.name"
								:value="opt.id"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-select v-model="searchParams.status" placeholder="任务状态" @input="search(1)">
							<el-option
								v-for="opt in statusOptions"
								:key="opt"
								:value="opt"
								:label="$t('dataFlow.status.' + opt)"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-select v-model="searchParams.way" placeholder="同步类型" @input="search(1)">
							<el-option
								v-for="opt in syncOtions"
								:key="opt.value"
								:value="opt.value"
								:label="opt.label"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-select v-model="searchParams.executionStatus" placeholder="阶段" @input="search(1)">
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
									<div class="table-source">[S] {{ scope.row.name }}</div>
									<div class="from-db">MYSQL</div>
									<div class="table-target">[T] TARGET_HKEDV</div>
									<div class="from-db">ORACAL</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column label="所在任务/执行时间" width="150" align="center">
							<template slot-scope="scope">
								<div class="table-item">
									<div>{{ scope.row.name }}</div>
									<div class="dark-color">2020-02-21 12:22:33</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column sortable="custom" label="状态" width="120">
							<template slot-scope="scope">
								<img
									style="width: 12px;height: 15px;vertical-align: middle;"
									src="../../../static/editor/running-blue.svg"
								/>
								<span class="primary-color" v-show="scope.row.name">运行中</span>
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
						<el-table-column label="更新/插入/删除" width="120">
							<template slot-scope="scope">
								<div class="table-item">
									<div>
										<span class="dark-color">[更新]</span>&nbsp;
										<span>{{ scope.row.out }}</span>
									</div>
									<div>
										<span class="dark-color">[插入]</span>&nbsp;
										<span>{{ scope.row.out }}</span>
									</div>
									<div>
										<span class="dark-color">[删除]</span>&nbsp;
										<span>{{ scope.row.out }}</span>
									</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column sortable="custom" label="速度(条/s)" width="120" align="center">
							<template slot-scope="scope">
								<span>{{ scope.row.out }}</span>
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
						<el-table-column lsortable="custom" label="行数对比" width="150" align="center">
							<template slot-scope="scope">
								<div class="table-item">
									<div>{{ scope.row.in }}/{{ scope.row.out }}</div>
									<div class="dark-color">2020-02-21 12:22:33</div>
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
					@size-change="search(1)"
					@current-change="search"
				>
				</el-pagination>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
let timeout = null;
export default {
	name: 'TableFlows',
	data() {
		return {
			loading: true,
			searchParams: this.$store.state.tableFlows,
			page: {
				data: null,
				current: 1,
				size: 10,
				total: 0,
				sortBy: '',
				order: ''
			},
			flowOptions: null,
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
			selections: []
		};
	},
	created() {
		this.getFlowOptions();
		this.search(1);
	},
	methods: {
		keyup() {
			if (timeout) {
				window.clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				this.search(1);
				timeout = null;
			}, 800);
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
		search(pageNum) {
			this.searchParamsChange();
			this.loading = true;
			// let { current, size, sortBy, order } = this.page;
			// let { keyword, flowId } = this.searchParams;
			// let currentPage = pageNum || current + 1;
			// let where = {};

			// let filter = {
			// 	limit: size,
			// 	skip: (currentPage - 1) * size,
			// 	where
			// };
			// if (sortBy && order) {
			// 	filter.order = `${sortBy} ${order === 'descending' ? 'desc' : 'asc'}`;
			// }
			// Promise.all([
			// 	this.$api('MetadataInstances').count({ where }),
			// 	this.$api('MetadataInstances').get({ filter })
			// ])
			// 	.then(([resCount, resGet]) => {
			// 		this.page.data = resGet.data;
			// 		this.page.current = currentPage;
			// 		this.page.total = resCount.data.count;
			// 		this.$nextTick(() => {
			// 			this.renderRowBg(resGet.data);
			// 		});
			// 	})
			// 	.finally(() => {
			// 		this.loading = false;
			// 	});
			setTimeout(() => {
				this.loading = false;
				let list = [
					{ name: 'SOURCE_IM_DEPT_INDEX', num: 20, in: 12333, out: 32222 },
					{ name: 'SOURCE_IM_DEPT_INDEX', num: 50, in: 12333, out: 32222 },
					{ name: 'SOURCE_IM_DEPT_INDEX', num: 30, in: 12333, out: 32222 },
					{ name: 'SOURCE_IM_DEPT_INDEX', num: 80, in: 12333, out: 32222 }
				];
				this.page.data = list;
				this.page.current = pageNum || 1;
				this.page.total = 4;
				this.$nextTick(() => {
					this.renderRowBg(list);
				});
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
