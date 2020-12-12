<template>
	<div class="roles">
		<div class="roles-box">
			<div class="mappingTemplate">{{ $t('role.roleManagement') }}</div>
			<div class="topbar">
				<!-- <div class="panelBtn"></div> -->
				<ul class="search-bar">
					<li class="item">
						<el-input
							:placeholder="$t('role.selectRoleName')"
							v-model="searchNav.keyword"
							size="mini"
							class="input-with-select"
							suffix-icon="el-icon-search"
						>
							<el-select v-model="searchNav.selectedSeachType" slot="prepend" size="mini">
								<el-option :label="$t('role.fuzzyMatching')" value="0"></el-option>
								<el-option :label="$t('role.preciseMatching')" value="1"></el-option>
							</el-select>
						</el-input>
					</li>
				</ul>
				<div class="topbar-buttons">
					<el-button class="btn btn-create" size="mini" icon="el-icon-plus" @click="createRole()">{{
						$t('role.create')
					}}</el-button>
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
					<el-table-column :label="$t('role.roleName')" :show-overflow-tooltip="true" width="240">
						<template slot-scope="scope">
							<div>{{ scope.row.name }}</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('role.description')" :show-overflow-tooltip="true">
						<template slot-scope="scope">
							<div>{{ scope.row.description }}</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('role.associatUsers')" width="80">
						<template slot-scope="scope">
							<span>{{ scope.row.name }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="status" sortable="custom" :label="$t('role.founder')" width="180">
						<template slot-scope="scope">
							<div>
								{{ scope.row.name }}
							</div>
						</template>
					</el-table-column>
					<el-table-column :label="$t('role.operate')" width="260">
						<template slot-scope="scope">
							<el-button type="text" @click="handleSettingPermissions(scope.row.id)">
								{{ $t('role.settingPermissions') }}
							</el-button>

							<el-button
								type="text"
								@click="handleDetail(scope.row.id, 'edit', scope.row.mappingTemplate)"
								v-readonlybtn="'SYNC_job_edition'"
							>
								{{ $t('role.associatUsers') }}
							</el-button>
							<el-button type="text" @click="createRole(scope.row.id, scope.row)">
								{{ $t('role.edit') }}
							</el-button>
							<el-button
								type="text"
								@click="handleDelete(scope.row)"
								v-if="scope.row.name != 'admin' && !scope.row.read_only"
								v-readonlybtn="'SYNC_job_delete'"
							>
								{{ $t('role.delete') }}
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
		<!-- 创建角色 -->
		<el-dialog :title="$t('role.createRole')" :visible.sync="dialogFormVisible" width="30%">
			<el-form :model="form" label-width="80px">
				<el-form-item :label="$t('role.roleName')">
					<el-input
						v-model="form.name"
						:placeholder="$t('role.selectRoleName')"
						autocomplete="off"
					></el-input>
				</el-form-item>
				<el-form-item :label="$t('role.roleDesc')">
					<el-input
						type="textarea"
						:placeholder="$t('role.selectDesc')"
						v-model="form.description"
						autocomplete="off"
					></el-input>
				</el-form-item>
				<el-form-item :label="$t('role.defaultRole')">
					<el-switch
						v-model="form.register_user_default"
						inactive-color="#dcdfe6"
						:active-text="form.register_user_default ? $t('role.yes') : $t('role.no')"
						style="margin-right: 20px"
					></el-switch>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="dialogFormVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button size="mini" type="primary" @click="createSave">{{ $t('message.confirm') }}</el-button>
			</div>
		</el-dialog>

		<!-- 删除角色 -->
		<el-dialog
			:title="$t('dataFlow.importantReminder')"
			:close-on-click-modal="false"
			:visible.sync="deleteDialogVisible"
			width="30%"
		>
			<p>
				{{ $t('role.delete_remind') }}
				<span @click="delLinkRole(deleteObj.id)" style="color:#48B6E2;cursor: pointer">
					{{ deleteObj.name }}</span
				>
				?
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="deleteDialogVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="confirmDelete">{{ $t('metaData.deleteNode') }}</el-button>
			</span>
		</el-dialog>
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
			pagesize: 20,
			totalNum: 0,
			currentPage: 1,
			dialogFormVisible: false,
			form: {
				name: '',
				description: '',
				register_user_default: false
			},
			deleteDialogVisible: false,
			roleId: '',
			deleteObj: {
				id: '',
				name: ''
			}
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
		createRole(id, item) {
			this.dialogFormVisible = true;
			if (id) {
				this.roleId = id;
				this.form = {
					name: item.name,
					description: item.description,
					register_user_default: item.register_user_default
				};
			} else {
				this.roleId = '';
			}
		},

		// 设置权限
		handleSettingPermissions(id) {
			this.$router.push({ name: 'role', query: { id } });
		},

		// 删除角色
		handleDelete(data) {
			this.deleteObj = {
				id: data.id,
				name: data.name
			};
			this.deleteDialogVisible = true;
		},

		// 确认删除角色
		async confirmDelete() {
			rolesModel
				.delete(this.deleteObj.id, this.deleteObj.name)
				.then(res => {
					if (res && res.data) {
						this.handleDataApi();
						this.$message.success(this.$t('role.delete_success'));
					}
				})
				.catch(() => {
					this.$message.error(this.$t('role.delete_error'));
				})
				.finally(() => {
					this.deleteDialogVisible = false;
				});
		},

		// 删除角色权限查看
		delLinkRole(id) {
			this.$router.push({ name: 'role', query: { id } });
		},

		// 创建保存
		createSave() {
			let self = this;
			const record = {
				name: this.form.name,
				description: this.form.description,
				register_user_default: this.form.register_user_default
			};
			const method = this.roleId ? 'patch' : 'post';
			if (this.roleId) {
				record.id = this.roleId;
			} else {
				record.user_id = this.$cookie.get('user_id');
			}

			rolesModel[method](record)
				.then(res => {
					if (res && res.data) {
						this.$message.success(this.$t('message.saveOK'));
					}
				})
				.catch(e => {
					if (e.response && e.response.msg) {
						if (e.response.msg.indexOf('already exists')) {
							this.$message.error(this.$t('role.alreadyExists'));
						} else {
							this.$message.error(`${e.response.msg}`);
						}
					}
				})
				.finally(() => {
					self.dialogFormVisible = false;
				});
		},

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
		.input-with-select {
			.el-select .el-input {
				width: 100px;
			}
			.el-input-group__append,
			.el-input-group__prepend {
				background: #fff;
			}
		}
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
