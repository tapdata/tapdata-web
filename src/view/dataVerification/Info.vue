<template>
	<section class="data-flow-wrap" v-loading="restLoading">
		<div class="panel-main">
			<div class="tip">校验历史</div>
			<div class="main main-border">
				<div class="title">POSS_SOURCE UAT BATCH1</div>
				<div class="text">内容校验 ( 重复执行 )</div>
				<el-table
					v-loading="loading"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					class="dv-table"
					border
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
				<el-table :data="tableData" border class="dv-table">
					<el-table-column prop="date" label="日期" width="180"> </el-table-column>
					<el-table-column prop="name" label="姓名" width="180"> </el-table-column>
					<el-table-column prop="address" label="地址"> </el-table-column>
				</el-table>
				<div class="error-band">
					<i class="iconfont icon-warning-circle"></i>
					<span>ERROR XXXXXXXXXXXXXXXXXXXXXXXXXXXX</span>
				</div>
				<el-table :data="tableData" border class="dv-table">
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
import factory from '../../api/factory';
const dataVerify = factory('dataVerify');
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
	},
	created() {
		this.getData();
	},
	methods: {
		getData() {
			dataVerify.get().then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.listData = res.data;
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
