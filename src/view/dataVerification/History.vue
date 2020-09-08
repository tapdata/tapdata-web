<template>
	<section class="data-flow-wrap" v-loading="restLoading">
		<div class="panel-main">
			<div class="tip">校验历史</div>
			<div class="title">POSS_SOURCE UAT BATCH1</div>
			<div class="text">内容校验 ( 重复执行 )</div>
			<div class="task-list" v-loading="restLoading">
				<el-table
					v-loading="loading"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					style="border: 1px solid #dedee4;border-top: none;"
					class="dv-table"
					row-key="id"
					:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
					@sort-change="handleSortTable"
					@selection-change="handleSelectionChange"
					:default-sort="{ prop: flowProp, order: flowOrder }"
				>
					<el-table-column type="selection" width="45" :selectable="handleSelectable"> </el-table-column>
					<el-table-column :label="$t('dataFlow.taskName')" :show-overflow-tooltip="true">
						<template slot-scope="scope">
							<span>{{ scope.row.name }}</span>
							<div style="margin-left: 20px;color:#ccc">
								{{ scope.row.user ? scope.row.user.email : '' }}
							</div>
						</template>
					</el-table-column>
					<el-table-column label="源/目标行数" width="120">
						<template>
							<span>
								源表:33333
							</span>
							<div style="color:#ccc">
								目标:66666
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" sortable="custom" label="校验结果" width="180">
						<template slot-scope="scope">
							<div>
								<span :style="`color: ${colorMap[scope.row.status]};`" class="row-result">
									<i class="iconfont icon-cuowu"></i>
									<span>{{ scope.row.statusLabel }}</span>
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="status" sortable="custom" label="执行状态" width="180">
						<template slot-scope="scope">
							<div>
								<span :style="`color: ${colorMap[scope.row.status]};`">
									{{ scope.row.statusLabel }}
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataFlow.operate')" width="180">
						<template slot-scope="scope">
							<div v-if="!scope.row.hasChildren">
								<el-tooltip class="item" :content="$t('dataFlow.detail')" placement="bottom">
									<el-button type="text" @click="handlesShowDrawer">
										<i class="iconfont  task-list-icon icon-chaxun"></i>
									</el-button>
								</el-tooltip>
								<el-tooltip class="item" :content="$t('dataFlow.edit')" placement="bottom">
									<el-button type="text" :disabled="statusBtMap[scope.row.status].edit">
										<i class="iconfont  task-list-icon  icon-ceshishenqing"></i>
									</el-button>
								</el-tooltip>
								<el-tooltip class="item" :content="$t('message.delete')" placement="bottom">
									<el-button
										type="text"
										:disabled="statusBtMap[scope.row.status].delete"
										@click="handleDelete(scope.row.id)"
									>
										<i class="iconfont task-list-icon icon-shanchu"></i>
									</el-button>
								</el-tooltip>
							</div>
						</template>
					</el-table-column>
				</el-table>
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
		</div>
		<div class="panel-main">
			<div class="tip">校验详情</div>
			<el-table :data="tableData" border style="width: 100%">
				<el-table-column prop="date" label="日期" width="180"> </el-table-column>
				<el-table-column prop="name" label="姓名" width="180"> </el-table-column>
				<el-table-column prop="address" label="地址"> </el-table-column>
			</el-table>
			<div class="error-band">
				<i class="iconfont icon-warning-circle"></i>
				<span>ERROR XXXXXXXXXXXXXXXXXXXXXXXXXXXX</span>
			</div>
			<el-table :data="tableData" border style="width: 100%">
				<el-table-column prop="date" label="日期" width="180"> </el-table-column>
				<el-table-column prop="name" label="姓名" width="180"> </el-table-column>
				<el-table-column prop="address" label="地址"> </el-table-column>
			</el-table>
		</div>
	</section>
</template>

<script>
export default {
	data() {
		return {
			tableData: [
				{
					date: '2016-05-02',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1518 弄'
				},
				{
					date: '2016-05-04',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1517 弄'
				},
				{
					date: '2016-05-01',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1519 弄'
				},
				{
					date: '2016-05-03',
					name: '王小虎',
					address: '上海市普陀区金沙江路 1516 弄'
				}
			]
		};
	}
};
</script>

<style lang="less" scoped>
.data-flow-wrap {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	.title {
		height: 15px;
		font-size: 14px;
		font-weight: bold;
		color: #48b6e2;
	}
	.text {
		height: 13px;
		font-size: 12px;
		font-weight: 400;
		color: #666666;
	}
	.panel-left {
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
			background: #f5f5f5;
			border: 1px solid #dedee4;
		}
		.pagination {
			height: 40px;
			line-height: 40px;
		}
	}
}
.task-list {
	flex: 1;
	overflow: hidden;
	padding: 0 10px 10px 10px;
	display: flex;
	flex-direction: column;
	font-size: 14px;
}
.error-band {
	height: 54px;
	background: #fdf6ec;
	color: #e6a23c;
	border: 1px solid #f8e2c0;
	margin: 10px 0;
	padding: 10px;
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
.delete-icon {
	color: #606266 !important;
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
	/*margin-top: 10px;*/
	margin-bottom: 10px;
}

.el-table .sort-caret {
	border: 3px solid transparent !important;
}

.task-list .el-pagination {
	width: 100%;
	padding-top: 10px;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	text-align: right;
	overflow: hidden;
	z-index: 999;
}

.back-btn-icon {
	color: #666;
}
.add-btn-icon {
	color: #fff;
}
</style>
