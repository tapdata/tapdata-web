<template>
	<section class="data-flow-wrap" v-loading="loading">
		<div class="panel-main">
			<div class="tip">{{ $t('dataVerification.tableDetail') }}</div>
			<div class="main main-border">
				<div class="title">{{ name }}</div>
				<div class="text" v-if="type === 'row_count'">{{ $t('dataVerification.rowVerify') }}</div>
				<div class="text" v-if="type === 'field'">{{ $t('dataVerification.contentVerify') }}</div>
				<div class="text" v-if="type === 'jointField'">{{ $t('dataVerification.jointVerify') }}</div>
				<div class="error-band" style="width: 96.5%;" v-if="errorMsg && type === 'row_count'">
					<i class="iconfont icon-warning-circle"></i>
					<span>{{ errorMsg }}</span>
				</div>
				<el-table
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					highlight-current-row
					@current-change="handleCurrentChange"
					ref="singleTable"
					height="100%"
					class="dv-table"
					border
				>
					<el-table-column :label="$t('dataVerification.sourceTable')">
						<template slot-scope="scope">
							<span>{{ scope.row.source ? scope.row.source.table : '' }}</span>
							<div style="color:#ccc">
								{{ scope.row.source ? scope.row.source.connectionName : '' }}
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.targetTable')">
						<template slot-scope="scope">
							<span>{{ scope.row.target ? scope.row.target.table : 0 }}</span>
							<div style="color:#ccc">
								{{ scope.row.target ? scope.row.target.connectionName : 0 }}
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataVerification.sourceRows')">
						<template slot-scope="scope">
							<span>{{ scope.row.source_total ? scope.row.source_total : 0 }}</span>
							<div>
								{{ scope.row.target_total ? scope.row.target_total : 0 }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="progress" :label="$t('dataVerification.verifyProgress')" width="80px">
						<template slot-scope="scope">
							<div>
								<span>{{
									`${
										(Math.round(scope.row.progress * 1000) / 1000) * 100
											? (Math.round(scope.row.progress * 1000) / 1000) * 100
											: 0
									} %`
								}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" :label="$t('dataVerification.verifyResult')">
						<template slot-scope="scope" v-if="scope.row.status !== 'error'">
							<span v-if="scope.row.target_total - scope.row.source_total !== 0">{{
								$t('dataVerification.rowConsistent') +
									' : ' +
									Math.abs(scope.row.target_total - scope.row.source_total)
							}}</span>
							<div
								v-if="
									scope.row.source_only + scope.row.target_only + scope.row.row_failed !== 0 &&
										type !== 'row_count'
								"
							>
								{{ $t('dataVerification.contConsistent') + ' : ' }}
								{{ scope.row.source_only + scope.row.target_only + scope.row.row_failed }}
							</div>
							<span
								class="success"
								v-if="
									(type !== 'row_count' &&
										scope.row.source_only + scope.row.target_only + scope.row.row_failed === 0 &&
										scope.row.target_total - scope.row.source_total === 0) ||
										(type === 'row_count' && scope.row.target_total - scope.row.source_total === 0)
								"
							>
								<span>{{ $t('dataVerification.consistent') }}</span>
							</span>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataFlow.operate')" width="60px" v-if="type !== 'row_count'">
						<template slot-scope="scope">
							<el-button type="text" @click="changeInspectResult(1, scope.row.taskId)">
								<i class="iconfont  task-list-icon icon-chaxun"></i>
							</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<!--			<el-pagination-->
			<!--				class="pagination"-->
			<!--				background-->
			<!--				layout="total,prev, pager, next,sizes"-->
			<!--				:page-sizes="[20, 30, 50, 100]"-->
			<!--				:page-size.sync="tablePageSize"-->
			<!--				:total="tableTotal"-->
			<!--				:current-page.sync="tableCurrentPage"-->
			<!--				@current-change="getData"-->
			<!--				@size-change="getData(1)"-->
			<!--			>-->
			<!--			</el-pagination>-->
		</div>
		<div class="panel-main" v-if="type !== 'row_count'">
			<div class="tip">{{ $t('dataVerification.verifyDetail') }}</div>
			<div class="main">
				<ul class="inspect-result" v-if="resultData && resultData[0] && resultData[0].status">
					<li>
						<span>
							{{
								$t('dataVerification.sourceTable') +
									' : ' +
									resultData[0].source.table +
									' / ' +
									resultData[0].source.connectionName
							}}
						</span>
						<span style="color: #ccc">
							{{ `( Row: ${resultData[0].source_total} )` }}
						</span>
					</li>
					<li>
						<span>
							{{
								$t('dataVerification.targetTable') +
									' : ' +
									resultData[0].target.table +
									' / ' +
									resultData[0].target.connectionName
							}}
						</span>
						<span style="color: #ccc">
							{{ `( Row: ${resultData[0].target_total} )` }}
						</span>
					</li>
					<li>
						<span>{{ $t('dataVerification.verifyResult') + ' : ' + resultData[0].result }}</span>
					</li>
					<li>
						<span>{{
							$t('dataVerification.rowConsistent') +
								' : ' +
								Math.abs(resultData[0].target_total - resultData[0].source_total)
						}}</span>
					</li>
					<li>
						<span>{{ $t('dataVerification.contConsistent') + ' : ' }}</span>
						<span>{{
							resultData[0].source_only + resultData[0].target_only + resultData[0].row_failed
						}}</span>
					</li>
				</ul>
				<div class="error-band" v-if="resultData && resultData[0] && resultData[0].status === 'error'">
					<i class="iconfont icon-warning-circle"></i>
					<span>{{ resultData[0].errorMsg }}</span>
				</div>
				<div class="inspect-result-box">
					<div v-for="item in inspectResult" :key="item.id" class="inspect-details">
						<ul class="father-table">
							<li>{{ $t('dataVerification.inconsistentType') }}</li>
							<li>{{ $t('dataVerification.sourceFieldName') }}</li>
							<li>{{ $t('dataVerification.Value') }}</li>
							<li>{{ $t('dataVerification.targetFieldName') }}</li>
							<li>{{ $t('dataVerification.Value') }}</li>
						</ul>
						<ul class="sub-table" v-for="detail in item.details" :key="detail.id">
							<li>
								{{
									detail.type === 'uniqueField'
										? $t('dataVerification.uniqueField')
										: $t('dataVerification.otherField')
								}}
							</li>
							<li>{{ detail.source.key }}</li>
							<li :class="{ red: detail.source.value !== detail.target.value }">
								{{ detail.source.value }}
							</li>
							<li>{{ detail.target.key }}</li>
							<li :class="{ red: detail.source.value !== detail.target.value }">
								{{ detail.target.value }}
							</li>
						</ul>
					</div>
				</div>
			</div>
			<el-pagination
				class="pagination"
				background
				layout="total,prev, pager, next,sizes"
				:page-sizes="[20, 30, 50, 100]"
				:page-size.sync="inspectPageSize"
				:total="inspectTotal"
				:current-page.sync="inspectResultCurrentPage"
				@current-change="changeInspectResult(inspectResultCurrentPage, taskId)"
				@size-change="changeInspectResult(1)"
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
			taskId: '',
			inspect_id: '',
			type: '',
			name: '',
			inspectResult: [],
			resultData: [],
			loading: false,
			tableCurrentPage: 1,
			inspectResultCurrentPage: 1,
			tableTotal: 1,
			inspectTotal: 1,
			inspectPageSize: 30,
			tablePageSize: 20,
			colorMap: {
				running: '#ee5353'
			},
			currentRow: null,
			errorMsg: ''
		};
	},
	created() {
		this.id = this.$route.query.id;
		this.inspect_id = this.$route.query.inspectId;
		this.getData(1, this.id, this.inspect_id);
	},
	watch: {
		tableData: function() {
			if (this.type !== 'row_count') {
				this.$nextTick(function() {
					this.$refs.singleTable.setCurrentRow(this.tableData[0]);
				});
			}
		}
	},
	methods: {
		getData(pageNum, id, inspect_id) {
			this.loading = true;
			let currentPage = pageNum || this.tableCurrentPage + 1;
			let where = {
				where: {
					id: id,
					inspect_id: { regexp: `^${inspect_id}$` }
				},
				order: 'createTime DESC',
				limit: this.tablePageSize,
				skip: (currentPage - 1) * this.tablePageSize
			};
			Promise.all([
				this.$api('InspectResults').count(where),
				this.$api('InspectResults').get({
					filter: JSON.stringify(where)
				})
			])
				.then(([countRes, res]) => {
					if (res.data) {
						this.loading = false;
						this.type = res.data[0].inspect ? res.data[0].inspect.inspectMethod : '';
						this.name = res.data[0].inspect ? res.data[0].inspect.name : '';
						this.tableData = res.data[0].stats;
						if (this.tableData.length > 0) {
							this.taskId = this.tableData[0].taskId;
							this.errorMsg = res.data[0].status === 'error' ? res.data[0].errorMsg : undefined;
							this.changeInspectResult(1, this.tableData[0].taskId);
						}
						this.tableCurrentPage = currentPage;
						this.tableTotal = countRes.data.count;
						this.setCurrent(this.tableData[0] || null);
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		setCurrent(row) {
			this.$refs.singleTable.setCurrentRow(row);
		},
		handleCurrentChange(val) {
			this.currentRow = val;
		},
		changeInspectResult(pageNum, taskId) {
			if (taskId) {
				this.taskId = taskId;
			}
			let currentPage = pageNum || this.inspectResultCurrentPage + 1;
			this.resultData = this.tableData.filter(item => item.taskId === this.taskId);
			let where = {
				where: {
					taskId: this.taskId,
					inspect_id: { regexp: `^${this.inspect_id}$` },
					inspectResultId: { regexp: `^${this.id}$` }
				},
				order: 'createTime DESC',
				limit: this.inspectPageSize,
				skip: (currentPage - 1) * this.inspectPageSize
			};
			Promise.all([
				this.$api('InspectDetails').count(where),
				this.$api('InspectDetails').get({
					filter: JSON.stringify(where)
				})
			])
				.then(([countRes, res]) => {
					if (res.data) {
						let data = res.data || [];
						if (data.length > 0) {
							data.map(item => {
								let source = item.source || {};
								let target = item.target || {};
								let sourceKeys = Object.keys(source);
								let targetKeys = Object.keys(target);
								let key = Array.from(new Set([...sourceKeys, ...targetKeys])); //找出所有的key的并集
								key.forEach(i => {
									let sourceValue = '';
									let targetValue = '';
									if (sourceKeys.filter(v => i === v)) {
										sourceValue = source[i];
									} else {
										sourceValue = '';
									}
									if (targetKeys.filter(v => i === v)) {
										targetValue = target[i];
									} else {
										targetValue = '';
									}
									let node = {
										type: item.type,
										source: {
											key: i,
											value: sourceValue
										},
										target: {
											key: i,
											value: targetValue
										}
									};
									item['details'] = item['details'] || [];
									item['details'].push(node);
								});
							});
						}
						this.inspectResult = res.data;
						this.inspectResultCurrentPage = currentPage;
						this.inspectTotal = countRes.data.count;
					}
				})
				.finally(() => {
					this.loading = false;
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
				margin: 10px;
				line-height: 20px;
				max-height: 160px;
				text-overflow: ellipsis;
				overflow-y: scroll;
				font-size: 12px;
				padding: 8px;
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
			.inspect-result-box {
				overflow: auto;
				.red {
					color: #ee5353;
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
						word-wrap: break-word;
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
				.inspect-details {
					margin-bottom: 10px;
					margin-top: 10px;
				}
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
