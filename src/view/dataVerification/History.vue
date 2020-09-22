<template>
	<section class="data-verify-history-wrap" v-loading="loading">
		<div class="panel-main">
			<div class="table-wrap">
				<el-table :data="page.data" height="100%" class="dv-table" border>
					<el-table-column label="校验时间" prop="createTime">
						<template slot-scope="scope">
							{{ $moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
						</template>
					</el-table-column>
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
								<el-button type="text" @click="changeInspectResult(scope.row.id, scope.row.inspect_id)">
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
export default {
	data() {
		return {
			loading: true,
			type: '',
			inspect_id: '',
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
		this.type = this.$route.query.type;
		this.inspect_id = this.$route.query.inspect_id;
		this.search(1);
	},
	methods: {
		search(pageNum) {
			this.loading = true;
			let { current, size } = this.page;
			let currentPage = pageNum || current + 1;
			let where = {
				filter: {
					where: {
						inspect_id: this.inspect_id
					},
					order: 'createTime DESC',
					limit: size,
					skip: (currentPage - 1) * size
				}
			};
			this.$api('InspectResults')
				.get(where)
				.then(res => {
					if (res.data) {
						this.page.data = res.data;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		changeInspectResult(id, inspect_id) {
			let routeUrl = this.$router.resolve({
				path: '/dataVerifyResult',
				query: {
					id: id,
					inspectId: inspect_id,
					type: this.type
				}
			});
			window.open(routeUrl.href, '_blank');
		}
	}
};
</script>

<style lang="less" scoped>
.data-verify-history-wrap {
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
		margin-top: 20px;
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
