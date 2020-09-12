<template>
	<section class="data-flow-wrap" v-loading="loading">
		<div class="panel-main">
			<div class="tip">校验历史</div>
			<div class="main main-border">
				<div class="title">POSS_SOURCE UAT BATCH1</div>
				<div class="text">内容校验 ( 重复执行 )</div>
				<el-table
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					class="dv-table"
					border
				>
					<el-table-column type="selection"> </el-table-column>
					<el-table-column label="源表">
						<template slot-scope="scope">
							<span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
							<div style="color:#ccc">
								{{ scope.row.source ? scope.row.source.connectionName : '' }}
							</div>
						</template>
					</el-table-column>
					<el-table-column label="目标表">
						<template slot-scope="scope">
							<span>{{ scope.row.target ? scope.row.target.table : '' }}</span>
							<div style="color:#ccc">
								{{ scope.row.target.target ? scope.row.target.connectionName : '' }}
							</div>
						</template>
					</el-table-column>
					<el-table-column label="源/目标行数">
						<template slot-scope="scope">
							<span>{{ scope.row.source_total ? scope.row.target.source_total : '' }}</span>
							<div style="color:#ccc">
								{{ scope.row.target_total ? scope.row.target_total : '' }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="progress" label="校验进度">
						<template slot-scope="scope">
							<div>
								<span>{{ `${scope.row.progress * 100}%` }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" label="校验结果">
						<template slot-scope="scope">
							<div>
								<span :style="`color: ${colorMap[scope.row.status]};`" class="row-result">
									<i class="iconfont icon-cuowu"></i>
									<span>{{
										scope.row.source_only + scope.row.target_only + scope.row.row_failed
									}}</span>
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" label="操作"></el-table-column>
					<el-table-column :label="$t('dataFlow.operate')">
						<template slot-scope="scope">
							<el-tooltip class="item" :content="$t('dataFlow.detail')" placement="bottom">
								<el-button type="text" @click="handlesShowDrawer(scope.row.taskId)">
									<i class="iconfont  task-list-icon icon-chaxun"></i>
								</el-button>
							</el-tooltip>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<el-pagination
				class="pagination"
				background
				layout="prev, pager, next,sizes"
				:page-sizes="[20, 30, 50, 100]"
				:page-size="pagesize"
				:total="totalNum"
				:current-page.sync="currentPage"
				@current-change="handleCurrentChange"
				@size-change="handleSizeChange"
			>
			</el-pagination>
		</div>
		<div class="panel-main">
			<div class="tip">校验详情</div>
			<div class="main">
				<el-table border class="dv-table">
					<el-table-column prop="date" label="日期" width="180"> </el-table-column>
					<el-table-column prop="name" label="姓名" width="180"> </el-table-column>
					<el-table-column prop="address" label="地址"> </el-table-column>
				</el-table>
				<div class="error-band">
					<i class="iconfont icon-warning-circle"></i>
					<span>ERROR XXXXXXXXXXXXXXXXXXXXXXXXXXXX</span>
				</div>
				<el-table border class="dv-table">
					<el-table-column prop="date" label="日期" width="180"> </el-table-column>
					<el-table-column prop="name" label="姓名" width="180"> </el-table-column>
					<el-table-column prop="address" label="地址"> </el-table-column>
				</el-table>
			</div>
			<el-pagination
				class="pagination"
				background
				layout="prev, pager, next,sizes"
				:page-sizes="[20, 30, 50, 100]"
				:page-size="pagesize"
				:total="totalNum"
				:current-page.sync="currentPage"
				@current-change="handleCurrentChange"
				@size-change="handleSizeChange"
			>
			</el-pagination>
		</div>
	</section>
</template>

<script>
export default {
	data() {
		return {
			tableData: [],
			loading: false
		};
	},
	created() {
		this.id = this.$route.query.id;
		this.getData(this.id);
	},
	methods: {
		getData(id) {
			this.loading = true;
			let where = {
				filter: {
					where: {
						inspect_id: id
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
							this.tableData = res.data.stats;
						}
					} else {
						this.loading = false;
					}
				});
		}
	}
};
</script>

<style lang="less" scoped>
@margin: 10px;
.data-flow-wrap {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
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
		.main {
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			.dv-table {
				margin: @margin;
				width: 97.5%;
			}
			.error-band {
				background: #fdf6ec;
				border: 1px solid #f8e2c0;
				color: #e6a23c;
				margin: @margin;
				padding-left: @margin;
			}
			.title {
				font-weight: bold;
				color: #48b6e2;
				padding-left: @margin;
				margin: 20px 0 0 0;
			}
			.text {
				color: #666;
				font-size: 12px;
				margin-top: @margin;
				padding-left: @margin;
			}
		}
		.main-border {
			border-right: 1px solid #dedee4;
		}
		.pagination {
			border-top: 1px solid #dedee4;
			border-right: 1px solid #dedee4;
			padding: 10px 5px;
		}
	}
}
</style>
