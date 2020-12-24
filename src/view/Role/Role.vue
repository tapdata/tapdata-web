<template>
	<div class="role" v-loading="loading">
		<head class="head">
			<i class="iconfont icon-left-circle back-btn-icon" style="color: #f00;"></i>
			<h1>{{ $t('role.settingTitle') }}</h1>
			<span>{{ $t('role.currentRole') }}: {{ roleName }}</span>
		</head>

		<div class="role-tableBox">
			<div class="headTitle">
				<h4>{{ $t('role.pageVisible') }}</h4>
				<p>{{ $t('role.pageShowTip') }}</p>
			</div>
			<ul class="role-table page-table">
				<li class="role-head">
					<el-row class="e-row">
						<el-col class="e-col borderRight" :span="22">
							{{ $t('role.choosePage') }}
						</el-col>
						<el-col class="e-col" :span="2">{{ $t('role.bulkOperate') }}</el-col>
					</el-row>
				</li>
				<li v-for="item in dataList" :key="item.id">
					<el-row class="e-row">
						<el-col class="e-col borderRight" :span="22">
							<el-checkbox
								v-for="second in item.children"
								:key="second.name"
								v-model="second.checkAll"
								@change="handleCheckChange($event, item, second)"
								v-cloak
							>
								<span>
									{{ $t('role.roleNavName.' + second.name) }}
								</span>
							</el-checkbox>
						</el-col>
						<el-col class="e-col" :span="2">
							<el-checkbox v-model="item.checked" @change="handleAllCheck($event, item)" v-cloak>
								<span>
									{{ $t('role.allCheck') }}
								</span>
							</el-checkbox>
						</el-col>
					</el-row>
					<!-- <template v-else>
						<el-row class="e-row">
							<el-col class="e-col borderRight" :span="22">
								<el-checkbox v-model="item.checkAll" @change="handleCheckChange($event, item)" v-cloak>
									<span>
										{{ $t('role.roleNavName.' + item.name) }}
									</span>
								</el-checkbox>
							</el-col>

							<el-col class="e-col" :span="2">
								<el-checkbox v-model="item.checked" @change="handleAllCheck($event, item)" v-cloak>
									<span>
										{{ $t('role.allCheck') }}
									</span>
								</el-checkbox>
							</el-col>
						</el-row>
					</template> -->
				</li>
			</ul>
			<div class="headTitle">
				<h4>{{ $t('role.funcPermission') }}</h4>
				<p>{{ $t('role.choosePermissionTip') }}</p>
			</div>
			<ul class="role-table">
				<li class="role-head">
					<el-row class="e-row">
						<el-col class="e-col" :span="3">
							{{ $t('role.module') }}
						</el-col>
						<el-col class="e-col borderLeft" :span="19">
							{{ $t('role.functionDataPermission') }}
						</el-col>
						<el-col class="e-col borderLeft" :span="2">{{ $t('role.bulkOperate') }}</el-col>
					</el-row>
				</li>
				<li class="module-style">
					<el-row class="e-row" v-for="item in moduleList" :key="item.id">
						<el-col :span="3">
							<span class="nav">{{ $t('role.roleNavName.' + item.name) }}</span>
						</el-col>
						<el-col :span="19" class="e-col borderLine">
							<ul>
								<li>
									<el-checkbox
										class="checkbox-radio"
										v-for="second in item.children"
										:key="second.name"
										:disabled="!item.checkAll"
										v-model="second.checkAll"
										@change="handleChange($event, item, second)"
										v-cloak
									>
										<div>{{ $t('role.roleNavName.' + second.name) }}</div>
										<el-radio-group v-model="radio" style="display: block">
											<el-radio :label="1">All data</el-radio>
											<el-radio :label="2">Only self</el-radio>
										</el-radio-group>
									</el-checkbox>
								</li>
								<li v-if="item.classification">
									<el-checkbox
										class="checkbox-radio"
										v-for="second in item.classification"
										:key="second.name"
										:disabled="!item.checkAll"
										v-model="second.checkAll"
										@change="handleChange($event, item, second)"
										v-cloak
									>
										<div>{{ $t('role.roleNavName.' + second.name) }}</div>
										<el-radio-group v-model="radio" style="display: block">
											<el-radio :label="1">All data</el-radio>
											<el-radio :label="2">Only self</el-radio>
										</el-radio-group>
									</el-checkbox>
								</li>
								<li v-if="item.functional">
									<el-checkbox
										class="checkbox-radio"
										v-for="second in item.functional"
										:key="second.name"
										:disabled="!item.checkAll"
										v-model="second.checkAll"
										@change="handleChange($event, item, second)"
										v-cloak
									>
										<div>{{ $t('role.roleNavName.' + second.name) }}</div>
										<el-radio-group v-model="radio" style="display: block">
											<el-radio :label="1">All data</el-radio>
											<el-radio :label="2">Only self</el-radio>
										</el-radio-group>
									</el-checkbox>
								</li>
							</ul>
							<div></div>
						</el-col>
						<el-col class="e-col" :span="2">
							<el-checkbox v-model="item.checkAll" @change="handleCheckChange($event, item)" v-cloak>
								{{ $t('role.allCheck') }}
							</el-checkbox>
						</el-col>

						<!-- <div v-if="item.children && item.children.length && item.children[0].isNav">
							<el-row class="e-row" v-for="second in item.children" :key="second.name">
								<el-col :span="3">
									<span class="nav">{{ $t('role.roleNavName.' + second.name) }}</span>
								</el-col>
								<el-col :span="19" class="e-col borderLine">
									<el-checkbox-group
										v-model="second.checkedCities"
										@change="handleCheckedCitiesChange(item, second)"
										v-cloak
									>
										<el-checkbox
											v-for="p in second.children"
											:label="p.name"
											:key="p.name"
											:disabled="!second.checkAll"
											v-cloak
										>
											{{ $t('role.roleNavName.' + p.name) }}
										</el-checkbox>
									</el-checkbox-group>
								</el-col>
								<el-col class="e-col" :span="2">
									<el-checkbox
										v-model="item.checkAll"
										@change="handleCheckChange($event, item)"
										v-cloak
									>
										{{ $t('role.allCheck') }}
									</el-checkbox>
								</el-col>
							</el-row>
						</div> -->
					</el-row>
				</li>
			</ul>
			<div class="btn">
				<el-button size="mini" @click="back">{{ $t('dataVerify.back') }}</el-button>
				<el-button size="mini" type="primary" :loading="saveloading" @click="saveSubmit('ruleForm')">{{
					$t('app.save')
				}}</el-button>
			</div>
		</div>
		<!-- <el-form-item
				:label="$t('role.roleName')"
				prop="name"
				:rules="[{ required: true, message: '角色名称不能为空', trigger: 'blur' }]"
			>
				<el-input v-model="form.name"></el-input>
			</el-form-item>

			<el-form-item :label="$t('role.roleDesc')">
				<el-input v-model="form.description"></el-input>
			</el-form-item>
			<el-form-item :label="$t('role.defaultRole')">
				<el-switch v-model="form.register_user_default"></el-switch>
			</el-form-item> -->
		<!-- <el-form-item class="btn"> -->

		<!-- </el-form-item> -->
		<!-- </el-form> -->
	</div>
</template>

<script>
import factory from '@/api/factory';
// const rolesModel = factory('role');
const roleMappingModel = factory('roleMapping');

let pageSort = [
	{ children: [{ name: 'Dashboard' }] },
	{ children: [{ name: 'datasource' }] },
	{ name: 'data_transmission', children: [{ name: 'Data_SYNC' }, { name: 'Data_verify' }] },
	{
		name: 'data_government',
		children: [
			{ name: 'data_catalog' },
			{ name: 'data_quality' },
			{ name: 'time_to_live' },
			{ name: 'data_lineage' },
			{ name: 'data_rules' },
			{ name: 'Topology' },
			{ name: 'dictionary' }
		]
	},
	{
		name: 'data_publish',
		children: [
			{ name: 'API_management' },
			{ name: 'API_data_explorer' },
			{ name: 'API_doc_test' },
			{ name: 'API_stats' },
			{ name: 'API_clients' },
			{ name: 'API_server' }
		]
	},
	{ children: [{ name: 'data_collect' }] },
	{
		name: 'system_management',
		children: [
			{ name: 'schedule_jobs' },
			{ name: 'Cluster_management' },
			{ name: 'agents' },
			{ name: 'servers_oversee' },
			{ name: 'user_management' },
			{ name: 'role_management' },
			{ name: 'system_settings' }
		]
	}
];

let moduleMapping = [
	{ name: 'Dashboard', children: [{ name: 'Dashboard' }] },
	{
		name: 'datasource',
		children: [{ name: 'datasource_creation' }, { name: 'datasource_edition' }, { name: 'datasource_delete' }],
		classification: [{ name: 'datasource_category_management' }, { name: 'datasource_category_application' }]
	},
	{
		name: 'Data_SYNC',
		children: [
			{ name: 'SYNC_job_creation' },
			{ name: 'SYNC_job_edition' },
			{ name: 'SYNC_job_delete' },
			{ name: 'SYNC_job_operation' }
		],
		classification: [{ name: 'SYNC_category_management' }, { name: 'SYNC_category_application' }],
		functional: [{ name: 'SYNC_job_import' }, { name: 'SYNC_job_export' }, { name: 'create_new_table_in_SYNC' }]
	},
	{
		name: 'SYNC_Function_management',
		children: [{ name: 'datasource_creation' }, { name: 'datasource_edition' }, { name: 'datasource_delete' }]
	},
	{
		name: 'data_catalog',
		children: [{ name: 'new_model_creation' }, { name: 'data_catalog_edition' }]
	},
	{
		name: 'data_quality',
		children: [{ name: 'new_model_creation' }, { name: 'data_catalog_edition' }]
	},
	{
		name: 'Data_verify',
		children: [
			{ name: 'verify_job_creation' },
			{ name: 'verify_job_edition' },
			{ name: 'verify_job_delete' },
			{ name: 'verify_job_execution' }
		]
	},
	{
		name: 'data_government',
		children: [
			{ name: 'data_catalog' },
			{ name: 'data_quality' },
			{ name: 'time_to_live' },
			{ name: 'data_lineage' },
			{ name: 'data_rules' },
			{ name: 'Topology' },
			{ name: 'dictionary' }
		]
	},
	{
		name: 'data_publish',
		children: [
			{ name: 'API_management' },
			{ name: 'API_data_explorer' },
			{ name: 'API_doc_test' },
			{ name: 'API_stats' },
			{ name: 'API_clients' },
			{ name: 'API_server' }
		]
	},
	{ children: [{ name: 'data_collect' }] },
	{
		name: 'system_management',
		children: [
			{ name: 'schedule_jobs' },
			{ name: 'Cluster_management' },
			{ name: 'agents' },
			{ name: 'servers_oversee' },
			{ name: 'user_management' },
			{ name: 'role_management' },
			{ name: 'system_settings' }
		]
	}
];

// let pageSort = [
// 	{ name: ['Dashboard'] },
// 	{ name: ['datasource'] },
// 	{ name: ['Data_SYNC', 'Data_verify'] },
// 	{ name: ['data_catalog', 'data_quality', 'time_to_live', 'data_lineage', 'data_rules', 'topology', 'dictionary'] },
// 	{ name: ['API_management', 'API_data_explorer', 'API_doc_&_test', 'API_stats', 'API_clients', 'API_server'] },
// 	{ name: 'data_collect' },
// 	{
// 		name: [
// 			'schedule_jobs',
// 			'Cluster_management',
// 			'agents',
// 			'servers_oversee',
// 			'user_management',
// 			'role_management',
// 			'system_settings'
// 		]
// 	}
// ];
export default {
	data() {
		return {
			loading: false,
			saveloading: false,
			permissLoading: false,
			title: '',
			form: {
				name: '',
				description: '',
				register_user_default: false
			},
			dataList: [],
			rolemappings: [],
			roleusers: [],
			selectRole: [],
			permissionList: [],
			roleName: '',
			radio: 1,
			moduleList: []
		};
	},

	created() {
		this.title = this.$route.query.id ? this.$t('role.editroleTitle') : this.$t('role.addroleTitle');
		this.getPermission();
		// if (this.$route.params.id) {
		// 	this.getUserDataApi();
		// }
	},

	methods: {
		// 获取用户权限数据
		getMappingData(mappingData) {
			this.loading = true;
			roleMappingModel
				.get({ 'filter[where][roleId]': this.$route.query.id })
				.then(res => {
					if (res && res.data && res.data.length) {
						res.data.forEach(item => {
							if (item.principalType === 'USER') {
								this.roleusers.push(item.principalId);
							}
							if (item.principalType === 'PERMISSION') {
								let selected = this.permissionList.filter(v => v.name === item.principalId);
								if (selected && selected.length > 0) {
									selected[0].self_only = item.self_only;
									this.selectRole.push(selected[0].name);
								}
							}
						});
						this.rolemappings = res.data;
						if (mappingData.length)
							mappingData.filter(item => {
								if (this.selectRole && this.selectRole.length) {
									this.$set(item, 'checkAll', this.selectRole.includes(item.name));
									if (item.children && item.children.length) {
										item.children.filter(childItem => {
											this.$set(childItem, 'checkAll', this.selectRole.includes(childItem.name));
											if (childItem.children && childItem.children.length)
												childItem.children.filter(check => {
													if (this.selectRole.includes(check.name))
														childItem.checkedCities.push(check.name);
												});
										});
									}
								}
							});
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},

		// 获取权限信息
		getPermission() {
			let self = this;
			this.permissLoading = true;
			self.$api('Permissions')
				.get({})
				.then(res => {
					if (res) {
						if (res.data && res.data.length) {
							self.permissionList = res.data;
							var obj = {};
							res.data.map(item => {
								obj[item.name] = item;
							});
							// var newArr = [];
							// for (var i = 0; i < res.data.length; i++) {
							// 	if (!res.data[i].isHidden) {
							// 		var item = res.data[i];
							// 		var parent = obj[item.parentId];
							// 		if (item.name === 'Dashboard') {
							// 			self.$set(item, 'checkAll', true);
							// 		}
							// 		if (parent) {
							// 			if (item.parentId === 'Dashboard') {
							// 				self.$set(item, 'checkAll', true);
							// 			}
							// 			if (parent.children) {
							// 				parent.children.push(item);
							// 			} else {
							// 				parent.children = [];
							// 				parent.children.push(item);
							// 			}
							// 			self.$set(parent, 'checkedCities', []);
							// 			self.$set(parent, 'isNav', true);
							// 		} else {
							// 			newArr.push(item);
							// 		}
							// 	}
							// }

							// 页面排序  ---- 开始
							let pageMap = {};
							res.data.forEach(item => {
								pageMap[item.name] = item;
							});

							let pageMenu = items => {
								return items.map(item => {
									let page = pageMap[item.name];
									let menu = Object.assign({}, item, page);
									return menu;
								});
							};

							let moduleFun = items => {
								return items.map(item => {
									let page = pageMap[item.name];
									let menu = Object.assign({}, item, page);
									return menu;
								});
							};

							this.dataList = pageMenu(pageSort);
							this.moduleList = moduleFun(moduleMapping);
							// 页面排序  ---- 结束
							this.getMappingData(this.dataList);
						}
					}
				})
				.finally(() => {
					this.permissLoading = false;
				});
		},

		// 选择获取全部数据(第一级)
		handleOneCheckAll(event, item) {
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', true);
			}
			// if (item.children && item.children.length) {
			// 	for (let i = 0; i < item.children.length; i++) {
			// 		if (item.checkAll) {
			// 			this.$set(item.children[i], 'checkAll', true);
			// 		} else {
			// 			this.$set(item.children[i], 'checkAll', false);
			// 			// item.children[i].checkAll = false;
			// 		}
			// 		if (item.children[i].children && item.children[i].children.length) {
			// 			for (let k = 0; k < item.children[i].children.length; k++) {
			// 				if (item.children[i].checkAll) {
			// 					item.children[i].checkedCities.push(item.children[i].children[k].name);
			// 				} else {
			// 					item.children[i].checkedCities = [];
			// 				}
			// 			}
			// 		}
			// 	}
			// }
		},

		// 没有三级菜单
		handleCheckChange(event, item, second) {
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', false);
			}
			if (typeof second.checkAll === 'undefined') {
				this.$set(second, 'checkAll', true);
			}

			// item.isIndeterminate = checkedCount.length > 0 && checkedCount.length < item.children.length;
			// item.checkAll = checkedCount.length === item.children.length;
		},

		// 二级菜单选择(有三级菜单)
		handleCheckAllChange(event, item, second) {
			let arr = [];
			if (second.children && second.children.length) {
				for (let a = 0; a < second.children.length; a++) {
					arr.push(second.children[a].name);
				}
			}

			if (typeof second.checkedCities === 'undefined') {
				this.$set(second, 'checkedCities', arr);
			}
			second.checkedCities = event ? arr : [];
			if (typeof second.checkAll === 'undefined') {
				this.$set(second, 'checkAll', true);
			}
			// if (typeof second.isIndeterminate === 'undefined') {
			// 	this.$set(second, 'isIndeterminate', true);
			// }

			// let checkedCount = item.children.filter(el => {
			// 	return el.checkAll;
			// });
			// item.isIndeterminate = checkedCount.length > 0 && checkedCount.length < item.children.length;
			// item.checkAll = checkedCount.length === item.children.length;

			// for (let a = 0; a < item.children.length; a++) {
			// 	if (!item.children[a].checkAll) {
			// 		item.isIndeterminate = true;
			// 		// for (let a = 0; a < item.children.length; a++) {
			// 		// 	if (item.children[a].checkAll) {
			// 		// 		break;
			// 		// 	} else {
			// 		// 		item.isIndeterminate = false;
			// 		// 		item.checkAll = false;
			// 		// 	}
			// 		// }
			// 		break;
			// 	} else {
			// 		item.isIndeterminate = false;
			// 		item.checkAll = false;
			// 	}
			// }
		},

		// 二级单选
		handleChange(even, item, second) {
			if (typeof second.checkAll === 'undefined') {
				this.$set(second, 'checkAll', false);
			}
		},

		// 三级单选
		handleCheckedCitiesChange(item, second) {
			// let checkedCount = second.checkedCities.length;
			if (typeof second.checkAll === 'undefined') {
				this.$set(second, 'checkAll', false);
			}
			// if (typeof second.isIndeterminate === 'undefined') {
			// 	this.$set(second, 'isIndeterminate', true);
			// }
			if (typeof item.isIndeterminate === 'undefined') {
				this.$set(item, 'isIndeterminate', true);
			}
			// second.isIndeterminate = checkedCount > 0 && checkedCount < second.children.length;
			// second.checkAll = checkedCount === second.children.length;
			// if (checkedCount === 0) {
			// 	second.isIndeterminate = true;
			// }
			// for (let a = 0; a < second.children.length; a++) {
			// 	if (!second.children[a].checkAll) {
			// 		second.isIndeterminate = true;
			// 		for (let b = 0; b < item.children.length; b++) {
			// 			if (item.children[b].checkedCities.length > 0) {
			// 				break;
			// 			} else {
			// 				item.isIndeterminate = false;
			// 				item.firstCheckAll = false;
			// 			}
			// 		}
			// 		break;
			// 	} else {
			// 		item.isIndeterminate = false;
			// 		item.firstCheckAll = true;
			// 	}
			// }
		},

		// 页面全选
		handleAllCheck(event, item) {
			if (typeof item.checked === 'undefined') {
				this.$set(item, 'checked', false);
			} else {
				item.checkAll = event;
			}
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', true);
			}
			if (item.children && item.children.length) {
				for (let i = 0; i < item.children.length; i++) {
					if (item.checked) {
						this.$set(item.children[i], 'checkAll', true);
					} else {
						this.$set(item.children[i], 'checkAll', false);
					}
					// if (item.children[i].children && item.children[i].children.length) {
					// 	for (let k = 0; k < item.children[i].children.length; k++) {
					// 		if (item.children[i].checkAll) {
					// 			item.children[i].checkedCities.push(item.children[i].children[k].name);
					// 		} else {
					// 			item.children[i].checkedCities = [];
					// 		}
					// 	}
					// }
				}
			}
		},

		// 保存
		saveSubmit() {
			let self = this;
			self.saveloading = true;
			// const record = {
			// 	name: this.form.name,
			// 	description: this.form.description,
			// 	register_user_default: this.form.register_user_default
			// };
			const roleId = this.$route.query.id;
			// const method = roleId ? 'patch' : 'post';

			// if (roleId) {
			// 	record.id = roleId;
			// } else {
			// 	record.user_id = this.$cookie.get('user_id');
			// }

			// 获取选中数据
			let arr = [],
				sendChild = [],
				childrenArr = [];

			for (let i = 0; i < self.dataList.length; i++) {
				if (self.dataList[i].checkAll) {
					arr.push(self.dataList[i].name);
					if (self.dataList[i].children && self.dataList[i].children.length)
						for (let k = 0; k < self.dataList[i].children.length; k++) {
							if (self.dataList[i].children[k].checkAll) {
								sendChild.push(self.dataList[i].children[k].name);
								childrenArr = childrenArr.concat(self.dataList[i].children[k].checkedCities);
							}
						}
				}
			}
			let saveRoleArr = [...arr, ...sendChild, ...childrenArr];

			self.$api('users').deletePermissionRoleMapping(roleId);
			let newRoleMappings = [];

			saveRoleArr.forEach(selectPermission => {
				if (selectPermission)
					newRoleMappings.push({
						principalType: 'PERMISSION',
						principalId: selectPermission,
						roleId: roleId
					});
			});
			roleMappingModel.post(newRoleMappings);

			this.$message.success(this.$t('message.saveOK'));
			self.saveloading = false;

			// rolesModel[method](record)
			// 	.then(res => {
			// 		if (res && res.data) {
			// 			// let rolemappings = this.rolemappings.filter(rolemapping => {
			// 			// 	if (rolemapping.principalType === 'PERMISSION') {
			// 			// 		return true;
			// 			// 	}
			// 			// });
			// 			// let rolemappingId = [];
			// 			// rolemappings.forEach(rolemapping => {
			// 			// 	rolemappingId.push(rolemapping.id);
			// 			// });
			// 			self.$api('users').deletePermissionRoleMapping(res.data.id);
			// 			let newRoleMappings = [];

			// 			saveRoleArr.forEach(selectPermission => {
			// 				if (selectPermission)
			// 					newRoleMappings.push({
			// 						principalType: 'PERMISSION',
			// 						principalId: selectPermission,
			// 						roleId: res.data.id
			// 					});
			// 			});
			// 			roleMappingModel.post(newRoleMappings);

			// 			this.$message.success(this.$t('message.saveOK'));
			// 		}
			// 	})
			// 	.catch(e => {
			// 		if (e.response && e.response.msg) {
			// 			if (e.response.msg.indexOf('already exists')) {
			// 				this.$message.error(this.$t('role.alreadyExists'));
			// 			} else {
			// 				this.$message.error(`${e.response.msg}`);
			// 			}
			// 		}
			// 	})
			// 	.finally(() => {
			// 		self.saveloading = false;
			// 	});
		},

		// 返回
		back() {
			this.$router.push({ name: 'roles' });
		}
	}
};
</script>

<style lang="less" scoped>
.role {
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;
	.head {
		display: block;
		padding: 0 20px;
		border-bottom: 1px solid #dedee4;
		i {
			display: inline-block;
			cursor: pointer;
		}
		h1 {
			display: inline-block;
			height: 60px;
			padding-right: 30px;
			line-height: 60px;
			font-size: 16px;
			color: #333;
			font-weight: bold;
		}
		span {
			font-size: 12px;
			color: #666;
		}
	}

	.role-tableBox {
		// display: flex;
		// flex-direction: column;
		height: calc(100% - 41px);
		padding: 10px 20px;
		overflow: auto;
		.headTitle {
			padding-bottom: 8px;
			h4 {
				display: inline-block;
				padding-right: 20px;
				font-size: 14px;
				color: #333;
			}
			p {
				display: inline-block;
				font-size: 12px;
				color: #666;
			}
		}
		.role-table {
			position: relative;
			margin-bottom: 20px;
			border: 1px solid #e0e0e0;
			overflow: auto;
			// .header {
			// 	height: 40px;
			// 	line-height: 40px;
			// 	text-align: center;
			// 	border-bottom: 1px solid #e7e7e7;
			// 	background: #f8f8f9;
			// }

			li {
				min-height: 39px;
				line-height: 40px;
				overflow: hidden;
				border-bottom: 1px solid #e7e7e7;
			}
			.role-head {
				min-height: 29px;
				height: 30px !important;
				line-height: 30px;
				font-size: 12px;
				color: #999;
				background-color: #f5f5f5;
				.e-col {
					padding-left: 12px;
				}
			}
			.module-style {
				.e-row {
					border-bottom: 1px solid #e7e7e7;
					&:last-child {
						border-bottom: 0;
					}
					.e-col {
						padding: 5px 0;
					}
					.nav {
						padding-left: 12px;
						font-size: 14px;
					}
				}
			}

			.vertical-line {
				position: absolute;
				left: 20%;
				top: 0;
				width: 1px;
				height: 100%;
				background: #ddd;
			}

			.center-line {
				left: 40%;
			}

			.left {
				float: left;
				width: 20%;
				padding-left: 10px;
				line-height: 40px;
				user-select: none;
				cursor: pointer;
				box-sizing: border-box;
			}

			.center {
				float: left;
				width: 80%;
				padding-left: 10px;
				line-height: 40px;
				user-select: none;
				cursor: pointer;
				text-align: left;
				box-sizing: border-box;
				border-left: 1px solid #e7e7e7;
			}

			.one {
				padding-left: 20px;
			}

			.right {
				width: 80%;
				float: right;
				line-height: 40px;
				// padding-left: 10px;
				box-sizing: border-box;
				border-left: 1px solid #e7e7e7;
				.rightRow {
					line-height: 39px;
					border-bottom: 1px solid #e7e7e7;
				}
				.check {
					padding-left: 10px;
					border-left: 1px solid #e7e7e7;
				}
				.left {
					width: 20%;
					border-right: 0;
				}
				li:last-child {
					border-bottom: 0;
				}
			}

			.item-icon {
				margin-left: -5px;
				padding: 5px;
			}

			.line {
				clear: both;
				width: 100%;
				height: 1px;
				background: #e0e0e0;
			}
			.h40 {
				height: 39px;
				line-height: 39px;
			}
			.authority {
				float: right;
				width: 60%;
				border-left: 1px solid #e7e7e7;
			}
			.borderRight {
				border-right: 1px solid #e7e7e7;
			}
			.borderLine {
				border-left: 1px solid #e7e7e7;
				border-right: 1px solid #e7e7e7;
			}
		}

		.authority-table {
			margin-top: 20px;
		}
	}
	.btn {
		width: 100%;
		padding-top: 20px;
		text-align: center;
	}
}

[v-cloak] {
	display: none;
}
</style>
<style lang="less">
.role {
	.role-table {
		.e-row {
			.el-checkbox {
				min-width: 130px;
				margin: 0 10px;
			}
			.checkbox-radio {
				.el-checkbox__input {
					padding-top: 3px;
					vertical-align: top;
				}
				.el-radio {
					display: block !important;
					padding: 5px 0;
					font-size: 12px;
					color: #666;
				}
			}
		}
	}
}
</style>
