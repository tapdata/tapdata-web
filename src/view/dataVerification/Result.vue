<template>
	<section class="data-flow-wrap" v-loading="loading">
		<div class="panel-main">
			<div class="tip">校验历史</div>
			<div class="main main-border">
				<div class="title">POSS_SOURCE UAT BATCH1</div>
				<div class="text" v-if="type === 'row_count'">行数校验</div>
				<div class="text" v-else>内容校验 ( 重复执行 )</div>
				<el-table
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					class="dv-table"
					border
				>
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
							<span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
							<div style="color:#ccc">
								{{ scope.row.target ? scope.row.target.connectionName : 0 }}
							</div>
						</template>
					</el-table-column>
					<el-table-column label="源/目标行数">
						<template slot-scope="scope">
							<span>{{ scope.row.source_total ? scope.row.source_total : 0 }}</span>
							<div>
								{{ scope.row.target_total ? scope.row.target_total : 0 }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="progress" label="校验进度" width="80px">
						<template slot-scope="scope">
							<div>
								<span>{{ `${scope.row.progress * 100}%` }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" label="校验结果">
						<template slot-scope="scope">
							<span>{{ `行数差: ${scope.row.target_total + scope.row.source_total}` }}</span>
							<div>
								{{ `内容差: ${scope.row.source_only + scope.row.target_only + scope.row.row_failed}` }}
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataFlow.operate')" width="60px" v-if="type !== 'row_count'">
						<template slot-scope="scope">
							<el-tooltip class="item" placement="bottom">
								<el-button type="text" @click="changeInspectResult(scope.row.taskId)">
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
		<div class="panel-main" v-if="type !== 'row_count'">
			<div class="tip">校验详情</div>
			<div class="main">
				<ul class="inspect-result">
					<li>
						<span>
							{{ `源表: ${resultData[0].source.table} / ${resultData[0].source.connectionName}` }}
						</span>
						<span style="color: #ccc">
							{{ `( 行数: ${resultData[0].source_total} )` }}
						</span>
					</li>
					<li>
						<span>
							{{ `目标表: ${resultData[0].target.table} / ${resultData[0].target.connectionName}` }}
						</span>
						<span style="color: #ccc">
							{{ `( 行数: ${resultData[0].target_total} )` }}
						</span>
					</li>
					<li>
						<span>{{ `校验结果: ${resultData[0].result}` }}</span>
						<span>{{ `行数差异: ${resultData[0].target_total - resultData[0].source_total}` }}</span>
						<span>{{
							`内容差异: ${resultData[0].source_only +
								resultData[0].target_only +
								resultData[0].row_failed}`
						}}</span>
					</li>
				</ul>
				<div class="error-band" v-if="resultData[0].status === 'error'">
					<i class="iconfont icon-warning-circle"></i>
					<span>{{ resultData[0].errorMsg }}</span>
				</div>
				<div v-for="item in inspectResult" :key="item.id" class="inspect-details">
					<ul class="father-table">
						<li>源表字段名</li>
						<li>值</li>
						<li>目标字段名</li>
						<li>值</li>
					</ul>
					<ul class="sub-table" v-for="detail in item.details" :key="detail.id">
						<li>{{ detail.source.type }}</li>
						<li>{{ detail.source.value }}</li>
						<li>{{ detail.target.type }}</li>
						<li>{{ detail.target.value }}</li>
					</ul>
				</div>
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
			id: '',
			inspect_id: '',
			type: '',
			inspectResult: [],
			resultData: [],
			loading: false,
			colorMap: {
				running: '#ee5353'
			}
		};
	},
	created() {
		this.id = this.$route.query.id;
		this.inspect_id = this.$route.query.inspect_id;
		this.type = this.$route.query.type;
		this.getData(this.id, this.inspect_id);
	},
	methods: {
		getData(id, inspect_id) {
			this.loading = true;
			let where = {
				filter: {
					where: {
						id: id,
						inspect_id: inspect_id
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
							this.tableData = res.data[0].stats;
							if (this.tableData.length > 0) {
								this.changeInspectResult(this.tableData[0].taskId);
							}
						}
					} else {
						this.loading = false;
					}
				});
		},
		changeInspectResult(taskId) {
			this.resultData = this.tableData.filter(item => item.taskId === taskId);
			let where = {
				filter: {
					where: {
						taskId: taskId,
						inspect_id: '5f5d7c939edc7f1190b7d656'
					},
					order: 'createTime DESC',
					limit: this.pagesize,
					skip: (this.currentPage - 1) * this.pagesize
				}
			};
			this.$api('InspectDetails')
				.get(where)
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							this.inspectResult = res.data;
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
			.row-result {
				color: #fff;
				border-radius: 10px;
				background-color: #ee5353;
			}
			.error-band {
				background: #fdf6ec;
				border: 1px solid #f8e2c0;
				color: #e6a23c;
				margin: @margin;
				padding-left: @margin;
				line-height: 36px;
				font-size: 12px;
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
			.inspect-result {
				font-size: 12px;
				margin: @margin;
				li {
					margin-top: 10px;
				}
			}
			.inspect-details {
				margin: 0 10px;
				li {
					min-width: 0;
					font-size: 12px;
					box-sizing: border-box;
					text-overflow: ellipsis;
					vertical-align: middle;
					position: relative;
					text-align: left;
					padding: 3px 10px;
				}
				.father-table {
					display: flex;
					li {
						flex: 1;
						background-color: #f5f5f5;
						border-left: 1px solid #dedee4;
						border-top: 1px solid #dedee4;
					}
					li:last-child {
						border-right: 1px solid #dedee4;
					}
				}
				.sub-table {
					display: flex;
					li {
						flex: 1;
						border-left: 1px solid #dedee4;
						border-bottom: 1px solid #dedee4;
						border-top: 1px solid #dedee4;
					}
					li:last-child {
						border-right: 1px solid #dedee4;
					}
				}
			}
			.inspect-details:last-child {
				margin-bottom: 10px;
				margin-top: 10px;
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
