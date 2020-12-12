<template>
	<div class="roles">
		<div class="roles-box">
			<div class="mappingTemplate">
				角色管理
			</div>
			<div class="topbar">
				<!-- <div class="panelBtn"></div> -->
				<ul class="search-bar">
					<li class="item">
						<el-input placeholder="请输入内容" v-model="searchNav.keyword" class="input-with-select">
							<el-select v-model="searchNav.selectedSeachType" slot="prepend" placeholder="请选择">
								<el-option label="餐厅名" value="1"></el-option>
								<el-option label="订单号" value="2"></el-option>
								<el-option label="用户电话" value="3"></el-option>
							</el-select>
							<el-button slot="append" icon="el-icon-search"></el-button>
						</el-input>
					</li>
				</ul>
				<div class="topbar-buttons">
					<el-button class="btn btn-create" size="mini" icon="el-icon-plus" @click="createRole">
						新建
					</el-button>
				</div>
			</div>
			<div class="table-box">
				<el-table
					v-loading="loading"
					:element-loading-text="$t('dataFlow.dataLoading')"
					:data="tableData"
					height="100%"
					style="border: 1px solid #dedee4;"
					class="dv-table"
					row-key="id"
				>
					<el-table-column label="角色名" :show-overflow-tooltip="true" width="240">
						<template slot-scope="scope">
							<div>{{ scope.row.name }}</div>
						</template>
					</el-table-column>
					<el-table-column label="描述" :show-overflow-tooltip="true">
						<template slot-scope="scope">
							<div>{{ scope.row.description }}</div>
						</template>
					</el-table-column>
					<el-table-column label="关联用户" width="80">
						<template slot-scope="scope">
							<span>{{ scope.row.name }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="status" sortable="custom" label="创建人" width="180">
						<template slot-scope="scope">
							<div>
								{{ scope.row.name }}
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('dataFlow.operate')" width="180">
						<template slot-scope="scope">
							<el-button
								type="text"
								@click="handleDetail(scope.row.id, 'detail', scope.row.mappingTemplate)"
							>
								设置权限
							</el-button>

							<el-button
								type="text"
								@click="handleDetail(scope.row.id, 'edit', scope.row.mappingTemplate)"
								v-readonlybtn="'SYNC_job_edition'"
							>
								关联用户
							</el-button>
							<el-button
								type="text"
								@click="handleDelete(scope.row)"
								v-if="scope.row.name != 'admin' && !scope.row.read_only"
								v-readonlybtn="'SYNC_job_delete'"
							>
								删除
							</el-button>
						</template>
					</el-table-column>
				</el-table>
				<el-pagination
					class="pagination"
					background
					layout="prev, pager, next,sizes,total"
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
	</div>
</template>
<script>
import factory from '@/api/factory';
const rolesModel = factory('role');
// const usersModel = factory('users');
export default {
	name: 'Roles',
	data() {
		return {
			searchNav: {
				selectedSeachType: '1',
				keyword: ''
			},
			tableData: [],
			loading: false,
			pagesize: '',
			totalNum: '',
			currentPage: 1
		};
	},
	created() {
		this.handleDataApi();
	},
	methods: {
		// 获取角色列表
		async handleDataApi(params) {
			// let { sortBy, descending, page, rowsPerPage } = this.pagination;
			let where = {};
			let order = 'createTime DESC';
			if (this.order) {
				order = this.order;
			}
			if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			}

			let searchkw = this.searchNav.keyword;
			if (searchkw && this.searchNav.selectedSeachType === '0') {
				where['where[name][regexp]'] = `${searchkw}`;
			} else if (searchkw && this.searchNav.selectedSeachType === '1') {
				where['where[name]'] = `${searchkw}`;
			}

			let _params = Object.assign(
				{
					filter: JSON.stringify({
						where: where,
						order: order,
						limit: this.pagesize,
						skip: (this.currentPage - 1) * this.pagesize
					})
				},
				params
			);

			await rolesModel.get(_params).then(res => {
				if (res && res.data) {
					this.tableData = res.data;
				}
			});
			await rolesModel.count(_params).then(res => {
				if (res && res.data) {
					this.totalNum = res.data.count;
				}
			});
		},

		// 新建角色
		createRole() {},

		// 设置权限
		handleDetail() {},

		// 删除角色
		handleDelete() {},

		// 分页
		handleCurrentChange(cpage) {
			this.currentPage = cpage;
			this.handleDataApi();
		},

		// 分页
		handleSizeChange(psize) {
			this.pagesize = psize;
			localStorage.setItem('flowPagesize', psize);
			this.handleDataApi();
		}
	}
};
</script>
<style scoped lang="less">
.roles {
	display: flex;
	width: 100%;
	height: 100%;
	overflow: hidden;
	box-sizing: border-box;
	.roles-box {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		.mappingTemplate {
			height: 60px;
			line-height: 60px;
			padding-left: 12px;
			font-size: 16px;
			font-weight: bold;
			color: #333;
			box-sizing: border-box;
			border-bottom: 1px solid #dedee4;
		}
		.topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 10px;

			.search-bar {
				display: flex;
				align-items: center;
				height: 50px;
				.item {
					margin-right: 10px;
				}
			}
			// .el-button {
			// 	padding: 4px 15px;
			// }
		}
		.table-box {
			flex: 1;
			overflow: hidden;
			padding: 0 10px 10px 10px;
			display: flex;
			flex-direction: column;
			font-size: 12px;
			.dv-table {
				flex: 1;
				overflow: hidden;
			}
			.el-button.is-disabled {
				color: #c0c4cc;
			}
			.el-button--text {
				color: #606266;
			}
			.el-pagination {
				width: 100%;
				padding-top: 10px;
				-webkit-box-sizing: border-box;
				box-sizing: border-box;
				text-align: right;
				overflow: hidden;
				z-index: 999;
			}
		}
	}
}
</style>
<style lang="less">
.roles {
	.topbar-buttons {
		.el-button {
			font-size: 12px;
			color: #666;
		}
	}
	.search-bar {
	}
	.table-box {
		.dv-table thead {
			color: #333;
			th {
				padding: 5px 0;
				background: #fafafa;
			}
		}
		.el-button {
			font-size: 12px;
		}
	}
}
</style>
