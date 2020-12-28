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
						<el-col class="e-col borderRight" :span="21">
							{{ $t('role.choosePage') }}
						</el-col>
						<el-col class="e-col" :span="3">{{ $t('role.bulkOperate') }}</el-col>
					</el-row>
				</li>
				<li v-for="item in dataList" :key="item.id">
					<el-row class="e-row">
						<el-col class="e-col borderRight" :span="21">
							<el-checkbox
								v-for="second in item.children"
								:key="second.name"
								v-model="second.checkAll"
								@change="handleCheckChange($event, item)"
								v-cloak
							>
								<span>
									{{ $t('role.page.' + second.name) }}
								</span>
							</el-checkbox>
						</el-col>
						<el-col class="e-col" :span="3">
							<el-checkbox v-model="item.checked" @change="handleAllCheck($event, item)" v-cloak>
								<span>
									{{ $t('role.allCheck') }}
								</span>
							</el-checkbox>
						</el-col>
					</el-row>
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
						<el-col class="e-col borderLeft" :span="18">
							{{ $t('role.functionDataPermission') }}
						</el-col>
						<el-col class="e-col borderLeft" :span="3">{{ $t('role.bulkOperate') }}</el-col>
					</el-row>
				</li>
				<li class="module-style">
					<el-row class="e-row" v-for="item in moduleList" :key="item.id">
						<el-col :span="3">
							<span class="nav">{{ $t('role.moduleMeun.' + item.name) }}</span>
						</el-col>
						<el-col :span="21" class="e-col borderLine">
							<!-- 权限 -->
							<el-row class="box">
								<el-col class="e-col" :span="21" v-if="item.children">
									<el-checkbox
										v-for="second in item.children"
										:key="second.name"
										v-model="second.checked"
										@change="handleOneCheckAll($event, item, item.children, second, 'children')"
										:class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"
										v-cloak
									>
										<div>{{ $t('role.roleNavName.' + second.name) }}</div>
										<el-checkbox
											class="e-checkbox"
											v-show="second.allName"
											:disabled="!second.checked"
											v-model="second.checkAllData"
											@change="handleOneAllData($event, item, item.children, second, 'children')"
											v-cloak
										>
											<div>All data</div>
										</el-checkbox>
									</el-checkbox>
								</el-col>
								<el-col class="e-col" :span="3" v-if="item.children">
									<el-checkbox
										class="checkbox-radio"
										v-model="item.checkAll"
										@change="handleAuthoritySelectAll($event, item, item.children)"
										v-cloak
									>
										<div>{{ $t('role.allCheck') }}</div>
										<div class="line"></div>
										<el-checkbox
											class="e-checkbox"
											v-model="item.checkedAllData"
											@change="handleCheckedAllData($event, item, item.children)"
											v-cloak
										>
											<div>All data</div>
										</el-checkbox>
									</el-checkbox>
								</el-col>
							</el-row>
							<!-- 分类权限 -->
							<el-row class="box" v-if="item.classification">
								<el-col class="e-col" :span="21">
									<el-checkbox
										v-for="second in item.classification"
										:key="second.name"
										v-model="second.checked"
										@change="
											handleOneCheckAll($event, item, item.classification, second, 'classify')
										"
										:class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"
										v-cloak
									>
										<div>{{ $t('role.roleNavName.' + second.name) }}</div>
										<!-- <el-checkbox
											class="e-checkbox"
											v-show="second.allName"
											:disabled="!item.checked"
											v-model="second.checkAllData"
											@change="handleChange($event, item, second)"
											v-cloak
										>
											<div>All data</div>
										</el-checkbox> -->
									</el-checkbox>
								</el-col>
								<el-col class="e-col" :span="3">
									<el-checkbox
										class="checkbox-radio checkbox-position"
										v-model="item.classifiyCheckAll"
										@change="handleAuthoritySelectAll($event, item, item.classification)"
										v-cloak
									>
										<div>{{ $t('role.allCheck') }}</div>
									</el-checkbox>
								</el-col>
							</el-row>
							<!-- 导入导出 -->
							<el-row class="box" v-if="item.functional">
								<el-col class="e-col" :span="21">
									<el-checkbox
										v-for="second in item.functional"
										:key="second.name"
										v-model="second.checked"
										@change="handleOneCheckAll($event, item, item.functional, second, 'functional')"
										:class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"
										v-cloak
									>
										<div>{{ $t('role.roleNavName.' + second.name) }}</div>
									</el-checkbox>
								</el-col>
								<el-col class="e-col" :span="3">
									<el-checkbox
										class="checkbox-radio checkbox-position"
										v-model="item.functionCheckAll"
										@change="handleAuthoritySelectAll($event, item, item.functional)"
										v-cloak
									>
										<div>{{ $t('role.allCheck') }}</div>
									</el-checkbox>
								</el-col>
							</el-row>
						</el-col>
					</el-row>
				</li>
			</ul>
		</div>
		<div class="btn">
			<el-button size="mini" @click="back">{{ $t('dataVerify.back') }}</el-button>
			<el-button size="mini" type="primary" :loading="saveloading" @click="saveSubmit('ruleForm')">{{
				$t('app.save')
			}}</el-button>
		</div>
	</div>
</template>

<script>
import factory from '@/api/factory';
// const rolesModel = factory('role');
const roleMappingModel = factory('roleMapping');

let pageSort = [
	{ children: [{ name: 'Dashboard_menu' }] },
	{ children: [{ name: 'datasource_menu' }] },
	{ name: 'data_transmission', children: [{ name: 'Data_SYNC_menu' }, { name: 'Data_verify_menu' }] },
	{
		name: 'data_government',
		children: [
			{ name: 'data_catalog_menu' },
			{ name: 'data_quality_menu' },
			{ name: 'time_to_live_menu' },
			{ name: 'data_lineage_menu' },
			{ name: 'data_rules_menu' },
			{ name: 'Topology_menu' },
			{ name: 'dictionary_menu' }
		]
	},
	{
		name: 'data_publish',
		children: [
			{ name: 'API_management_menu' },
			{ name: 'API_data_explorer_menu' },
			{ name: 'API_doc_test_menu' },
			{ name: 'API_stats_menu' },
			{ name: 'API_clients_menu' },
			{ name: 'API_server_menu' }
		]
	},
	{ children: [{ name: 'data_collect_menu' }] },
	{
		name: 'system_management',
		children: [
			{ name: 'schedule_jobs_menu' },
			{ name: 'Cluster_management_menu' },
			{ name: 'agents_menu' },
			{ name: 'servers_oversee_menu' },
			{ name: 'user_management_menu' },
			{ name: 'role_management_menu' },
			{ name: 'system_settings_menu' }
		]
	}
];

let moduleMapping = [
	{ name: 'Dashboard', functional: [{ name: 'Dashboard' }] },
	{
		name: 'datasource',
		children: [
			{ name: 'datasource', allName: 'datasource_all_data' },
			{ name: 'datasource_creation' },
			{ name: 'datasource_edition', allName: 'datasource_edition_all_data' },
			{ name: 'datasource_delete', allName: 'datasource_delete_all_data' }
		],
		classification: [{ name: 'datasource_category_management' }, { name: 'datasource_category_application' }]
	},
	{
		name: 'Data_SYNC',
		children: [
			{ name: 'Data_SYNC', allName: 'Data_SYNC_all_data' },
			{ name: 'SYNC_job_creation' },
			{ name: 'SYNC_job_edition', allName: 'SYNC_job_edition_all_data' },
			{ name: 'SYNC_job_delete', allName: 'SYNC_job_delete_all_data' },
			{ name: 'SYNC_job_operation', allName: 'SYNC_job_operation_all_data' }
		],
		classification: [{ name: 'SYNC_category_management' }, { name: 'SYNC_category_application' }],
		functional: [{ name: 'SYNC_job_import' }, { name: 'SYNC_job_export' }, { name: 'create_new_table_in_SYNC' }]
	},
	{
		name: 'SYNC_Function_management',
		functional: [
			{ name: 'SYNC_Function_management' },
			{ name: 'datasource_creation' },
			{ name: 'datasource_edition' },
			{ name: 'datasource_delete' }
		]
	},
	{
		name: 'Data_verify',
		children: [
			{ name: 'Data_verify', allName: 'Data_verify_all_data' },
			{ name: 'verify_job_creation' },
			{ name: 'verify_job_edition', allName: 'verify_job_edition_all_data' },
			{ name: 'verify_job_delete', allName: 'verify_job_delete_all_data' },
			{ name: 'verify_job_execution', allName: 'verify_job_execution_all_data' }
		]
	},
	{
		name: 'data_government',
		classification: [{ name: 'data_catalog_category_application' }, { name: 'data_catalog_category_management' }]
	},
	{
		name: 'data_catalog',
		children: [
			{ name: 'data_catalog', allName: 'data_catalog_all_data' },
			{ name: 'new_model_creation' },
			{ name: 'data_catalog_edition', allName: 'data_catalog_edition_all_data' },
			{ name: 'meta_data_deleting', allName: 'meta_data_deleting_all_data' }
		]
	},
	{
		name: 'data_quality',
		children: [
			{ name: 'data_quality', allName: 'data_quality_all_data' },
			{ name: 'data_quality_edition', allName: 'data_quality_edition_all_data' }
		]
	},
	{
		name: 'data_rules',
		children: [
			{ name: 'data_rules', allName: 'data_rules_all_data' },
			{ name: 'data_rule_management', allName: 'data_rule_management_all_data' }
		]
	},
	{
		name: 'time_to_live',
		children: [
			{ name: 'time_to_live', allName: 'time_to_live_all_data' },
			{ name: 'time_to_live_management', allName: 'time_to_live_management_all_data' }
		]
	},
	{
		name: 'data_lineage',
		functional: [{ name: 'data_lineage' }]
	},

	{
		name: 'API_management',
		children: [
			{ name: 'API_management', allName: 'API_management_all_data' },
			{ name: 'API_creation' },
			{ name: 'API_edition', allName: 'API_edition_all_data' },
			{ name: 'API_delete', allName: 'API_delete_all_data' },
			{ name: 'API_publish', allName: 'API_publish_all_data' }
		],
		classification: [{ name: 'API_category_application' }, { name: 'API_category_management' }],
		functional: [{ name: 'API_import' }, { name: 'API_export' }]
	},
	{
		name: 'API_data_explorer',
		children: [
			{ name: 'API_data_explorer', allName: 'API_data_explorer_all_data' },
			{ name: 'API_data_creation' },
			{ name: 'API_data_explorer_deleting' },
			{ name: 'API_data_explorer_export' },
			{ name: 'API_data_download' }
		],
		functional: [{ name: 'API_data_explorer_tagging' }, { name: 'API_data_time_zone_editing' }]
	},
	{
		name: 'API_doc_test',
		functional: [{ name: 'API_doc_test' }]
	},
	{
		name: 'API_stats',
		functional: [{ name: 'API_stats' }]
	},
	{
		name: 'API_clients',
		functional: [{ name: 'API_clients_amangement' }]
	},
	{
		name: 'API_server',
		functional: [{ name: 'API_server_management' }]
	},
	{
		name: 'data_collect',
		children: [{ name: 'data_collect', allName: 'data_collect_all_data' }]
	},

	{
		name: 'schedule_jobs',
		functional: [{ name: 'schedule_jobs' }, { name: 'schedule_jobs_management' }]
	},
	{
		name: 'Cluster_management',
		children: [
			{ name: 'Cluster_management', allName: 'Cluster_management_all_data' },
			{ name: 'Cluster_operation' },
			{ name: 'status_log' }
		]
	},
	{
		name: 'agents',
		functional: [{ name: 'agents' }]
	},
	{
		name: 'user_management',
		children: [
			{ name: 'user_management', allName: 'user_management_all_data' },
			{ name: 'user_creation' },
			{ name: 'user_edition', allName: 'user_edition_all_data' },
			{ name: 'user_delete', allName: 'user_delete_all_data' }
		],
		classification: [{ name: 'user_category_management' }, { name: 'user_category_application' }]
	},
	{
		name: 'role_management',
		children: [
			{ name: 'role_management', allName: 'role_management_all_data' },
			{ name: 'role_creation' },
			{ name: 'role_edition', allName: 'role_edition_all_data' },
			{ name: 'role_delete', allName: 'role_delete_all_data' }
		]
	},
	{
		name: 'system_settings',
		functional: [{ name: 'system_settings' }, { name: 'system_settings_modification' }, { name: 'notice_settings' }]
	}
];
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
		getMappingData(mappingData, pageData) {
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
						if (pageData.length) {
							pageData.forEach(item => {
								if (this.selectRole && this.selectRole.length) {
									if (item.children && item.children.length) {
										item.children.filter(childItem => {
											this.$set(childItem, 'checkAll', this.selectRole.includes(childItem.name));
										});
									}
								}
							});
						}
						if (mappingData.length)
							mappingData.filter(item => {
								if (this.selectRole && this.selectRole.length) {
									if (item.children && item.children.length) {
										item.children.filter(childItem => {
											this.$set(
												childItem,
												'checkAllData',
												this.selectRole.includes(childItem.allName)
											);
											childItem.checkAllData
												? this.$set(childItem, 'checked', true)
												: this.$set(
														childItem,
														'checked',
														this.selectRole.includes(childItem.name)
												  );
										});
										if (item.classification) {
											item.classification.filter(classify => {
												this.$set(classify, 'checked', this.selectRole.includes(classify.name));
											});
										}
										if (item.functional) {
											item.functional.filter(fun => {
												this.$set(fun, 'checked', this.selectRole.includes(fun.name));
											});
										}
										// 				item.children.filter(childItem => {
										// 					this.$set(childItem, 'checkAll', this.selectRole.includes(childItem.name));
										// 					if (childItem.children && childItem.children.length)
										// 						childItem.children.filter(check => {
										// 							if (this.selectRole.includes(check.name))
										// 								childItem.checkedCities.push(check.name);
										// 						});
										// 				});
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
							// var obj = {};
							// res.data.map(item => {
							// 	obj[item.name] = item;
							// });
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
									if (menu.children) {
										menu.children = pageMenu(menu.children);
									}
									if (menu.classification) {
										menu.classification = pageMenu(menu.classification);
									}
									if (menu.functional) {
										menu.functional = pageMenu(menu.functional);
									}
									return menu;
								});
							};

							this.dataList = pageMenu(pageSort);
							this.moduleList = moduleFun(moduleMapping);
							// 页面排序  ---- 结束
							this.getMappingData(this.moduleList, this.dataList);
						}
					}
				})
				.finally(() => {
					this.permissLoading = false;
				});
		},

		// 页面单选
		handleCheckChange(event, item) {
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', false);
			}

			let checkedCount = item.children.filter(el => {
				return el.checkAll;
			});
			item.checked = checkedCount.length === item.children.length;
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
				}
			}
		},

		// 权限单个选择
		handleOneCheckAll(event, item, children, second, type) {
			if (typeof item.checked === 'undefined') {
				this.$set(item, 'checked', true);
			}

			if (!event) {
				second.checkAllData = false;
				item.checkedAllData = false;
			}

			let checkedCount = children.filter(el => {
				return el.checked;
			});

			switch (type) {
				case 'children':
					item.checkAll = checkedCount.length === children.length;
					break;
				case 'classify':
					item.classifiyCheckAll = checkedCount.length === children.length;
					break;
				default:
					item.functionCheckAll = checkedCount.length === children.length;
					break;
			}
		},
		// 权限全选
		handleAuthoritySelectAll(event, item, children) {
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', false);
			} else {
				item.checked = event;
			}
			if (typeof item.checked === 'undefined') {
				this.$set(item, 'checked', true);
			}
			if (children && children.length) {
				for (let i = 0; i < children.length; i++) {
					if (event) {
						this.$set(children[i], 'checked', true);
					} else {
						this.$set(children[i], 'checked', false);
						this.$set(children[i], 'checkAllData', false);
						this.$set(item, 'checkedAllData', false);
					}
				}
			}
		},

		// 权限全部数据单选
		handleOneAllData(event, item, children, second) {
			if (typeof second.checkAllData === 'undefined') {
				this.$set(second, 'checkAllData', true);
			}
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', false);
			} else {
				item.checked = event;
			}
			let checkedCount = children.filter(el => {
				return el.checkAllData;
			});
			let allDataCount = children.filter(el => {
				return el.allName;
			});
			item.checkedAllData = checkedCount.length === allDataCount.length;
		},

		// 权限全部数据全选
		handleCheckedAllData(event, item, children) {
			if (typeof item.checkedAllData === 'undefined') {
				this.$set(item, 'checkedAllData', false);
			} else {
				item.checkAllData = event;
			}
			// if (typeof item.checkAllData === 'undefined') {
			// 	this.$set(item, 'checkAllData', true);
			// }
			if (children && children.length) {
				for (let i = 0; i < children.length; i++) {
					if (event && children[i].checked) {
						this.$set(children[i], 'checkAllData', true);
					} else {
						this.$set(children[i], 'checkAllData', false);
					}
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
			let pageArr = [],
				childreArr = [],
				classifyArr = [],
				functionalArr = [];

			// for (let i = 0; i < self.dataList.length; i++) {
			// 	if (self.dataList[i].checkAll) {
			// 		arr.push(self.dataList[i].name);
			// 		if (self.dataList[i].children && self.dataList[i].children.length)
			// 			for (let k = 0; k < self.dataList[i].children.length; k++) {
			// 				if (self.dataList[i].children[k].checkAll) {
			// 					sendChild.push(self.dataList[i].children[k].name);
			// 					childrenArr = childrenArr.concat(self.dataList[i].children[k].checkedCities);
			// 				}
			// 			}
			// 	}
			// }
			this.dataList.forEach(item => {
				item.children.forEach(child => {
					if (child.checkAll) {
						pageArr.push(child.name);
					}
				});
			});
			this.moduleList.forEach(item => {
				if (item.children && item.children.length)
					item.children.forEach(child => {
						if (child.checked && child.checkAllData) {
							childreArr.push(child.allName);
						} else if (child.checked) {
							childreArr.push(child.name);
						}
					});
				if (item.classification && item.classification.length)
					item.classification.forEach(classify => {
						if (classify.checked) {
							classifyArr.push(classify.name);
						}
					});
				if (item.functional && item.functional.length)
					item.functional.forEach(fun => {
						if (fun.checked) {
							functionalArr.push(fun.name);
						}
					});
			});

			let saveRoleArr = [...pageArr, ...childreArr, ...classifyArr, ...functionalArr];

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
		height: calc(100% - 120px);
		padding: 10px 20px;
		box-sizing: border-box;
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
					.nav {
						padding-left: 12px;
						font-size: 14px;
					}
					.box {
						border-bottom: 1px solid #e7e7e7;
						&:last-child {
							border: 0;
						}
						.e-col {
							padding-top: 8px;
							border-right: 1px solid #e7e7e7;
							box-sizing: border-box;
							&:last-child {
								border: 0;
							}
						}
					}
				}
			}
			.borderRight {
				border-right: 1px solid #e7e7e7;
			}
			.borderLine {
				border-left: 1px solid #e7e7e7;
				border-right: 1px solid #e7e7e7;
			}
		}
	}
	.btn {
		width: 100%;
		padding-top: 18px;
		text-align: center;
		border-top: 1px solid #e7e7e7;
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
				min-width: 120px;
				margin: 0 10px;
			}
			.checkbox-position {
				line-height: 1px;
				vertical-align: top;
				.el-checkbox__input {
					padding-top: 0;
					vertical-align: top;
				}
			}
			.checkbox-radio {
				min-width: 150px;
				.el-checkbox__input {
					padding-top: 3px;
					vertical-align: top;
				}

				.e-checkbox {
					// display: block !important;
					padding: 5px 0;
					margin: 0;
					font-size: 12px;
					color: #666;
				}
			}
		}
	}
}
</style>
