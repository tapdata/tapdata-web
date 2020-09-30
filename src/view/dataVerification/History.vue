<template>
	<section class="data-verify-history-wrap" v-loading="loading">
		<div class="panel-main">
			<div class="tip">{{ $t('dataVerification.verifyHistory') }}</div>
			<div class="title">{{ name }}</div>
			<div class="table-wrap">
				<el-table :data="page.data" height="100%" class="dv-table" border>
					<el-table-column :label="$t('dataVerification.verifyTime')" prop="createTime">
						<template slot-scope="scope">
							{{ $moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('dataVerification.sourceTotalRows')"
						prop="source_total"
					></el-table-column>
					<el-table-column
						:label="$t('dataVerification.targetTotalRows')"
						prop="target_total"
					></el-table-column>
					<el-table-column prop="progress" :label="$t('dataVerification.verifyProgress')" width="80px">
						<template slot-scope="scope">
							<div>
								<span>{{
									`${
										(Math.round(scope.row.progress * 1000) / 1000) * 100
											? (Math.round(scope.row.progress * 1000) / 1000) * 100
											: 0
									}%`
								}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.verifyResult')" width="180">
						<template slot-scope="scope" v-if="scope.row.status !== 'error'">
							<div class="inspect-result">
								<div v-if="scope.row.target_total - scope.row.source_total !== 0">
									<span class="error" v-if="scope.row.target_total - scope.row.source_total !== 0">
										<i class="el-icon-error"></i>
										<span>
											{{ $t('dataVerification.rowConsistent') }}
											{{ Math.abs(scope.row.target_total - scope.row.source_total) }}
										</span>
									</span>
								</div>
								<div
									v-if="
										scope.row.difference_number !== 0 &&
											scope.row.inspect &&
											scope.row.inspect.inspectMethod !== 'row_count'
									"
								>
									<span class="error" v-if="scope.row.difference_number">
										<i class="el-icon-error"></i>
										<span>
											{{ $t('dataVerification.contConsistent') }}
											{{ scope.row.difference_number }}
										</span>
									</span>
								</div>
								<span
									class="success"
									v-if="
										scope.row.difference_number === 0 &&
											scope.row.target_total - scope.row.source_total === 0
									"
								>
									<i class="el-icon-success"></i>
									<span>{{ $t('dataVerification.consistent') }}</span>
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.verifyStatus')" prop="status"></el-table-column>
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
			name: '',
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
		this.inspect_id = this.$route.query.inspectId;
		this.name = this.$route.query.name;
		this.search(1);
	},
	methods: {
		search(pageNum) {
			this.loading = true;
			let { current, size } = this.page;
			let currentPage = pageNum || current + 1;
			let where = {
				where: {
					inspect_id: { regexp: `^${this.inspect_id}$` }
				},
				order: 'createTime DESC',
				limit: size,
				skip: (currentPage - 1) * size
			};
			Promise.all([
				this.$api('InspectResults').count(where),
				this.$api('InspectResults').get({
					filter: JSON.stringify(where)
				})
			])
				.then(([countRes, res]) => {
					if (res.data) {
						this.page.data = res.data;
						this.page.current = currentPage;
						this.page.total = countRes.data.count;
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
					type: this.type,
					name: this.name
				}
			});
			window.open(routeUrl.href, '_blank');
		}
	}
};
</script>

<style lang="less" scoped>
@margin: 10px;
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
		.tip {
			height: 30px;
			font-size: 12px;
			background: #f5f5f5;
			border: 1px solid #dedee4;
			padding-left: @margin;
			line-height: 30px;
		}
		.title {
			font-weight: bold;
			color: #48b6e2;
			padding-left: @margin;
			margin: 10px 0;
		}
		.table-wrap {
			margin: 0 10px;
			flex: 1;
			display: flex;
			flex-direction: column;
			.inspect-result {
				.error,
				.success {
					padding: 0 8px 0 5px;
					display: inline-block;
					line-height: 20px;
					color: #fff;
					border-radius: 20px;
				}
				.error {
					background: #f56c6c;
				}
				.success {
					background: #70ae48;
				}
			}
			.pagination {
				padding: 20px 0;
				text-align: right;
			}
		}
	}
}
</style>
