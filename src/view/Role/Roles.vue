<template>
	<section class="roles-list-wrap">
		<TablePage
			ref="table"
			row-key="id"
			class="roles-list"
			:title="$t('app.menu.' + $route.name)"
			:remoteMethod="getData"
			@sort-change="handleSortTable"
		>
			<div slot="search">
				<ul class="search-bar">
					<li>
						<el-input
							clearable
							class="input-with-select"
							size="mini"
							v-model="searchParams.keyword"
							:placeholder="$t('role.selectRoleName')"
							@input="table.fetch(1, 800)"
						>
							<el-select
								style="width: 120px;"
								slot="prepend"
								v-model="searchParams.isFuzzy"
								@input="table.fetch(1)"
							>
								<el-option :label="$t('role.fuzzyMatching')" :value="true"></el-option>
								<el-option :label="$t('role.preciseMatching')" :value="false"></el-option>
							</el-select>
						</el-input>
					</li>
					<li v-if="searchParams.keyword">
						<el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
					</li>

					<li v-if="searchParams.keyword">
						<el-button size="mini" type="text" @click="reset('reset')">{{ $t('button.reset') }}</el-button>
					</li>
				</ul>
			</div>
			<div slot="operation">
				<el-button
					v-readonlybtn="'role_creation'"
					class="btn btn-create"
					size="mini"
					@click="openCreateDialog()"
				>
					<i class="iconfont icon-jia add-btn-icon"></i>
					<span>{{ $t('role.create') }}</span>
				</el-button>
			</div>
			<el-table-column :label="$t('role.roleName')" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<div>{{ scope.row.name }}</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('role.description')" :show-overflow-tooltip="true">
				<template slot-scope="scope">
					<div>{{ scope.row.description }}</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('role.associatUsers')" width="100">
				<template slot-scope="scope">
					<span>{{ scope.row.userCount }}</span>
				</template>
			</el-table-column>
			<el-table-column :label="$t('role.founder')">
				<template slot-scope="scope">
					<div>
						{{ scope.row.userEmail }}
					</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('role.defaultRole')" width="90">
				<template slot-scope="scope">
					<el-switch
						v-model="scope.row.register_user_default"
						:disabled="!$has('role_edition')"
						@change="changeRowDefault(scope.row)"
					>
					</el-switch>
				</template>
			</el-table-column>
			<el-table-column :label="$t('role.operate')" width="300">
				<template slot-scope="scope">
					<el-button
						type="text"
						v-readonlybtn="'role_edition'"
						:disabled="$disabledByPermission('role_edition_all_data', scope.row.user_id)"
						@click="handleSettingPermissions(scope.row.id, scope.row.name)"
					>
						{{ $t('role.settingPermissions') }}
					</el-button>

					<el-button
						type="text"
						@click="handleAssociatUsers(scope.row.id)"
						:disabled="
							$disabledByPermission('role_edition_all_data', scope.row.user_id) ||
								scope.row.name === 'admin'
						"
						v-readonlybtn="'role_edition'"
					>
						{{ $t('role.associatUsers') }}
					</el-button>
					<el-button
						type="text"
						v-readonlybtn="'role_edition'"
						:disabled="$disabledByPermission('role_edition_all_data', scope.row.user_id)"
						@click="openCreateDialog(scope.row.id, scope.row)"
					>
						{{ $t('role.edit') }}
					</el-button>
					<el-button
						type="text"
						@click="handleDelete(scope.row)"
						:disabled="
							$disabledByPermission('role_delete_all_data', scope.row.user_id) ||
								scope.row.name === 'admin'
						"
						v-readonlybtn="'role_delete'"
					>
						{{ $t('role.delete') }}
					</el-button>
				</template>
			</el-table-column>
		</TablePage>
		<!-- 创建角色 -->
		<el-dialog
			:title="$t('role.createRole')"
			:close-on-click-modal="false"
			:visible.sync="dialogFormVisible"
			width="600px"
		>
			<el-form :model="form" ref="form" label-width="115px">
				<el-form-item
					:label="$t('role.roleName')"
					prop="name"
					:rules="[{ required: true, message: $t('role.role_null'), trigger: 'blur' }]"
				>
					<el-input v-model="form.name" :placeholder="$t('role.selectRoleName')" size="small"></el-input>
				</el-form-item>
				<el-form-item :label="$t('role.roleDesc')" style="margin-bottom: 10px">
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

		<!-- 关联用户 -->
		<el-dialog
			:title="$t('role.associatUsers')"
			:close-on-click-modal="false"
			:visible.sync="dialogUserVisible"
			width="600px"
		>
			<div class="userBox">
				<el-select v-model="roleusers" filterable multiple :placeholder="$t('role.selectUser')">
					<el-option v-for="item in userGroup" :key="item.id" :label="item.email" :value="item.id">
					</el-option>
				</el-select>
				<div class="num">{{ $t('role.connected') }}: {{ roleusers.length }}</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="dialogUserVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button size="mini" type="primary" @click="saveUser">{{ $t('dataForm.submit') }}</el-button>
			</span>
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
				<el-button size="mini" @click="deleteDialogVisible = false">{{ $t('message.cancel') }}</el-button>
				<el-button size="mini" type="primary" @click="confirmDelete">
					{{ $t('classification.deleteNode') }}
				</el-button>
			</span>
		</el-dialog>
	</section>
</template>

<script>
import TablePage from '@/components/TablePage';
import { toRegExp } from '../../util/util';

export default {
	components: {
		TablePage
	},
	data() {
		return {
			searchParams: {
				keyword: '',
				isFuzzy: true
				// time: ''
			},
			order: 'last_updated DESC',
			tableData: [],
			roleusers: [],
			userGroup: [],
			permissions: [],
			oldUser: [],
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
			dialogUserVisible: false,
			roleId: '',
			deleteObj: {
				id: '',
				name: ''
			}
		};
	},
	created() {
		this.getUserData();
		// this.getDbOptions();
		// this.getCount();
	},
	mounted() {
		this.searchParams = Object.assign(this.searchParams, this.table.getCache());
	},
	computed: {
		table() {
			return this.$refs.table;
		}
	},
	methods: {
		// 重置
		reset(name) {
			if (name === 'reset') {
				this.searchParams = {
					keyword: '',
					isFuzzy: true
				};
			}
			this.table.fetch(1);
		},
		// 获取数据
		getData({ page }) {
			let { current, size } = page;
			let { isFuzzy, keyword } = this.searchParams;
			let where = {};
			if (keyword && keyword.trim()) {
				let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
				where.or = [{ name: filterObj }];
			}
			let filter = {
				order: this.order,
				limit: size,
				skip: (current - 1) * size,
				where
			};
			return Promise.all([
				this.$api('role').count({ where: where }),
				this.$api('users').role({
					filter: JSON.stringify(filter)
				})
			]).then(([countRes, res]) => {
				return {
					total: countRes.data.count,
					data: res.data
				};
			});
		},
		// 获取角色下拉值
		// getDbOptions() {
		// 	this.$api('role')
		// 		.get({})
		// 		.then(res => {
		// 			if (res.data && res.data.length) {
		// 				let options = [];
		// 				res.data.forEach(db => {
		// 					if (db.name !== 'admin') {
		// 						options.push({
		// 							label: db.name,
		// 							value: db.id
		// 						});
		// 					}
		// 				});
		// 				this.createFormConfig.items[3].options = options;
		// 			}
		// 		});
		// },
		handleSortTable({ order, prop }) {
			this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
		},
		// 新建角色(弹窗开关)
		openCreateDialog(id, item) {
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
				this.form = {
					name: '',
					description: '',
					register_user_default: false
				};
				this.$api('Permissions')
					.get({})
					.then(res => {
						if (res && res.data && res.data.length) {
							this.permissions = res.data;
						}
					});
				this.table.fetch();
			}
		},
		// 设置权限
		handleSettingPermissions(id, name) {
			this.$router.push({ name: 'role', query: { id: id, name: name } });
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
			this.$api('role')
				.delete(this.deleteObj.id, this.deleteObj.name)
				.then(res => {
					if (res && res.data) {
						this.table.fetch();
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
		// 查看删除角色权限
		delLinkRole(id) {
			this.$router.push({ name: 'role', query: { id } });
		},

		// 创建保存
		createSave() {
			let self = this;
			this.$refs.form.validate(valid => {
				if (valid) {
					const record = {
						name: this.form.name,
						description: this.form.description,
						register_user_default: this.form.register_user_default
					};
					const method = this.roleId ? 'patch' : 'post';
					if (this.roleId) {
						record.id = this.roleId;
					}
					let newRoleMappings = [];

					this.$api('role')
						[method](record)
						.then(res => {
							if (res && res.data) {
								if (method === 'post') {
									this.permissions.forEach(selectPermission => {
										if (selectPermission.type === 'read' && !selectPermission.isMenu)
											newRoleMappings.push({
												principalType: 'PERMISSION',
												principalId: selectPermission.name,
												roleId: res.data.id
											});
									});
									self.$api('users')
										.deletePermissionRoleMapping(res.data.id, { data: { data: newRoleMappings } })
										.then(res => {
											if (res && res.data) {
												// roleMappingModel.post(newRoleMappings);
												this.$message.success(this.$t('message.saveOK'));
											}
										});
								} else {
									this.$message.success(this.$t('message.saveOK'));
								}
								this.table.fetch();
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
				} else {
					return false;
				}
			});
		},

		// 已关联用户
		async handleAssociatUsers(id) {
			this.dialogUserVisible = true;
			this.roleId = id;
			let _this = this;
			_this.roleusers = [];
			_this.oldUser = [];
			await this.$api('roleMapping')
				.get({ 'filter[where][roleId]': id })
				.then(res => {
					if (res && res.data) {
						res.data.forEach(roleMapping => {
							if (roleMapping.principalType === 'USER') {
								_this.roleusers.push(roleMapping.principalId);
								_this.oldUser.push(roleMapping);
							}
						});
					}
				});
		},

		// 获取用户列表
		async getUserData() {
			await this.$api('users')
				.get({})
				.then(res => {
					if (res && res.data) {
						res.data.forEach(item => {
							if (!item.role) {
								this.userGroup.push(item);
							}
						});
					}
				});
		},

		// 保存关联用户
		saveUser() {
			let newRoleMappings = [];
			this.oldUser.forEach(delRolemapping => {
				this.$api('roleMapping').delete(delRolemapping.id);
			});
			// _this.oldUser
			this.roleusers.forEach(roleuser => {
				if (roleuser) {
					newRoleMappings.push({
						principalType: 'USER',
						principalId: roleuser,
						roleId: this.roleId
					});
				}
			});
			this.$api('roleMapping')
				.post(newRoleMappings)
				.then(res => {
					if (res && res.data) {
						this.roleusers = [];
						res.data.forEach(item => {
							this.roleusers.push(item.principalId);
						});

						this.table.fetch();
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
				});
			this.dialogUserVisible = false;
		},
		// 改变列表默认值val
		changeRowDefault(data) {
			const record = {
				id: data.id,
				name: data.name,
				description: data.description,
				register_user_default: data.register_user_default
			};

			this.$api('role')
				.patch(record)
				.then(res => {
					if (res && res.data) {
						this.table.fetch();
					}
				});
		}
	}
};
</script>
<style lang="less" scoped>
.roles-list-wrap {
	height: 100%;

	.roles-list {
		background-color: rgba(239, 241, 244, 100);
		.search-bar {
			display: flex;
			li + li {
				margin-left: 10px;
			}
		}
		.btn + .btn {
			margin-left: 5px;
		}
		.btn {
			padding: 7px;
			background: #f5f5f5;
			i.iconfont {
				font-size: 12px;
			}
			&.btn-dropdowm {
				margin-left: 5px;
			}
			&.btn-create {
				margin-left: 5px;
			}
		}
	}
}
</style>
<style lang="less">
.roles-list-wrap {
	.table-page-container {
		.table-page-body {
			box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
			.table-page-topbar {
				padding: 10px 10px 0 10px;
				background-color: #fff;
			}
			.el-table {
				padding: 0 10px;
				box-sizing: border-box;
				// border-top: 0;
				// .has-gutter {
				// 	th {
				// 		background-color: #eff1f4 !important;
				// 	}
				// }
			}
			.table-page-pagination {
				margin-top: 0;
				padding: 5px 20px;
				background-color: #fff;
				box-sizing: border-box;
			}
		}
	}
	.userBox {
		.el-select,
		.el-input {
			width: 100%;
		}
		.num {
			padding-top: 10px;
		}
	}
	.el-dialog__body {
		padding: 30px;
	}
	.dialog-footer {
		.el-button {
			width: 80px;
		}
	}
}
</style>
