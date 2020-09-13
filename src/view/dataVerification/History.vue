<template>
	<section class="data-verify-wrap">
		<div class="panel-main">
			<div class="table-wrap">
				<el-table
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="page.data"
					height="100%"
					class="dv-table"
					border
				>
					<el-table-column label="校验时间" prop="createTime"></el-table-column>
					<el-table-column label="源表行数" prop="source_total"></el-table-column>
					<el-table-column label="目标行数" prop="target_total"></el-table-column>
					<el-table-column prop="progress" label="校验进度" width="80px">
						<template slot-scope="scope">
							<div>
								<span>{{ `${scope.row.progress * 100}%` }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="校验状态" prop="status"></el-table-column>
					<el-table-column :label="$t('dataFlow.operate')" width="60px">
						<template slot-scope="scope">
							<el-tooltip class="item" :content="$t('dataFlow.detail')" placement="bottom">
								<el-button type="text" @click="changeInspectResult(scope.row.taskId)">
									<i class="iconfont  task-list-icon icon-chaxun"></i>
								</el-button>
							</el-tooltip>
						</template>
					</el-table-column>
				</el-table>
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
			</div>
		</div>
	</section>
</template>

<script>
/* eslint-disable */
let timeout = null;
export default {
	data() {
		return {
			isClassShow: true,
			loading: true,
			searchParams: this.$store.state.dataVerification,
			page: {
				data: null,
				current: 1,
				size: 10,
				total: 0,
				sortBy: '',
				order: ''
			},
			selections: []
		};
	},
	created() {
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
		selectHandler(val) {
			this.selections = val;
		},
		sortHandler({ prop, order }) {
			this.page.sortBy = prop;
			this.page.order = order;
			this.search(1);
		},
		search(pageNum) {
			this.searchParamsChange();
			this.loading = true;
			let { current, size, sortBy, order } = this.page;
			let { keyword } = this.searchParams;
			let currentPage = pageNum || current + 1;
			let where = {
				filter: {
					where: {
						inspect_id: '5f5d7c939edc7f1190b7d656'
					},
					order: 'createTime DESC',
					limit: this.pagesize,
					skip: (this.currentPage - 1) * this.pagesize
				}
			};
			this.$api('InspectResults')
				.get(where)
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							this.loading = false;
							this.page.data = res.data;
						}
					} else {
						this.loading = false;
					}
				});
		},
		reset() {
			this.searchParams = {
				keyword: '',
				compareMethod: '',
				mode: '',
				active: ''
			};
			this.search(1);
		},
		searchParamsChange() {
			this.$store.commit('dataVerification', this.searchParams);
		},
		classClickHandler(node) {
			this.search(1);
		}
	}
};
</script>

<style lang="less" scoped>
.data-verify-wrap {
	display: flex;
	height: 100%;
	overflow: hidden;
	.panel-slider {
		width: 200px;
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
			.iconfont {
				font-size: 12px;
			}
			.el-button {
				padding: 7px;
			}
			.el-button + .el-button {
				margin-left: 5px;
			}
			.search-bar {
				display: flex;
				align-items: center;
				height: 50px;
				.search-item {
					margin-right: 10px;
				}
				.btn-class-collapse {
					.iconfont {
						display: inline-block;
						transform: rotate(0deg);
					}
					&.is-open .iconfont {
						transform: rotate(180deg);
					}
				}
			}
		}
		.table-wrap {
			margin: 0 10px;
			flex: 1;
			display: flex;
			flex-direction: column;
			.pagination {
				padding: 20px 0;
				text-align: right;
			}
		}
	}
}
</style>
