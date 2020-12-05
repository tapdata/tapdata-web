<template>
	<div class="roles" v-loading="loading">
		<h1>{{ title }}</h1>
		<el-form ref="form" :model="form" label-width="140px" class="e-form">
			<el-form-item
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
			</el-form-item>
			<el-form-item :label="$t('role.rolePermission')" class="role-tableBox">
				<ul class="role-table col-xs-offset-2 col-md-offset-1 col-sm-offset-2">
					<!-- <div class="vertical-line"></div> -->
					<li v-for="item in dataList" :key="item.id">
						<div class="left">
							<el-checkbox
								@change="handleOneCheckAll($event, item)"
								v-cloak
								v-model="item.checkAll"
								:disabled="item.name === 'Dashboard'"
							>
								{{ $t('role.roleNavName.' + item.name) }}
							</el-checkbox>
						</div>
						<div class="center" v-if="item.children && item.children.length && !item.children[0].isNav">
							<el-checkbox
								v-for="second in item.children"
								:key="second.name"
								:disabled="!item.checkAll"
								v-model="second.checkAll"
								@change="handleCheckChange($event, item, second)"
								v-cloak
							>
								{{ $t('role.roleNavName.' + second.name) }}
							</el-checkbox>
						</div>
						<ul class="right" v-if="item.children && item.children.length && item.children[0].isNav">
							<li v-for="second in item.children" :key="second.name">
								<div class="left">
									<el-checkbox
										v-model="second.checkAll"
										:disabled="!item.checkAll"
										@change="handleCheckAllChange($event, item, second)"
										v-cloak
									>
										{{ $t('role.roleNavName.' + second.name) }}
									</el-checkbox>
								</div>
								<div class="right check">
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
								</div>
							</li>
						</ul>
					</li>
				</ul>
			</el-form-item>
			<el-form-item class="btn">
				<el-button @click="back">{{ $t('dataVerify.back') }}</el-button>
				<el-button type="primary" :loading="saveloading" @click="saveSubmit('ruleForm')">{{
					$t('app.save')
				}}</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import factory from '@/api/factory';
const rolesModel = factory('role');
const roleMappingModel = factory('roleMapping');
export default {
	data() {
		return {
			loading: false,
			saveloading: false,
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
			permissionList: []
		};
	},

	created() {
		this.title = this.$route.params.id ? this.$t('role.editroleTitle') : this.$t('role.addroleTitle');
		this.getPermission();
		if (this.$route.params.id) {
			this.getUserDataApi();
		}
	},

	methods: {
		//  获取用户信息
		getUserDataApi() {
			this.loading = true;
			let params = {
				filter: {
					where: {
						id: this.$route.params.id
					}
				}
			};
			rolesModel.get(params).then(res => {
				if (res && res.data && res.data.length) {
					this.form = res.data[0];
				}
			});

			roleMappingModel
				.get({ 'filter[where][roleId]': this.$route.params.id })
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
						this.dataList.filter(item => {
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
			this.loading = true;
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
							var newArr = [];
							for (var i = 0; i < res.data.length; i++) {
								if (!res.data[i].isHidden) {
									var item = res.data[i];
									var parent = obj[item.parentId];
									if (item.name === 'Dashboard') {
										self.$set(item, 'checkAll', true);
									}
									if (parent) {
										if (item.parentId === 'Dashboard') {
											self.$set(item, 'checkAll', true);
										}
										if (parent.children) {
											parent.children.push(item);
										} else {
											parent.children = [];
											parent.children.push(item);
										}
										self.$set(parent, 'checkedCities', []);
										self.$set(parent, 'isNav', true);
									} else {
										newArr.push(item);
									}
								}
							}
							this.dataList = newArr;
						}
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},

		// 选择获取全部数据(第一级)
		handleOneCheckAll(event, item) {
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', true);
			}
			if (item.children && item.children.length) {
				for (let i = 0; i < item.children.length; i++) {
					if (item.checkAll) {
						this.$set(item.children[i], 'checkAll', true);
					} else {
						this.$set(item.children[i], 'checkAll', false);
						// item.children[i].checkAll = false;
					}
					if (item.children[i].children && item.children[i].children.length) {
						for (let k = 0; k < item.children[i].children.length; k++) {
							if (item.children[i].checkAll) {
								item.children[i].checkedCities.push(item.children[i].children[k].name);
							} else {
								item.children[i].checkedCities = [];
							}
						}
					}
				}
			}
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

		// // 点击所有
		// checkSecondAll(item) {
		// 	if (typeof item.firstCheckAll === 'undefined') {
		// 		this.$set(item, 'firstCheckAll', true);
		// 	}
		// 	for (let a = 0; a < item.children.length; a++) {
		// 		this.checkItemAll(item.firstCheckAll, item.children[a]);
		// 	}
		// 	item.isIndeterminate = false;
		// },

		// checkItemAll(flag, item) {
		// 	let arr = [];
		// 	for (let a = 0; a < item.children.length; a++) {
		// 		arr.push(item.children[a].id);
		// 	}
		// 	if (typeof item.checkedCities === 'undefined') {
		// 		this.$set(item, 'checkedCities', arr);
		// 	}
		// 	item.checkedCities = flag ? arr : [];
		// 	item.checkAll = flag;
		// },
		// 单选
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

		// 保存
		saveSubmit() {
			let self = this;
			self.saveloading = true;
			const validated = this.$refs.form.validate();
			if (!validated) {
				return false;
			}
			const record = {
				name: this.form.name,
				description: this.form.description,
				register_user_default: this.form.register_user_default
			};
			const roleId = this.$route.params.id;
			const method = roleId ? 'patch' : 'post';

			if (roleId) {
				record.id = roleId;
			} else {
				record.user_id = this.$cookie.get('user_id');
			}

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

			rolesModel[method](record)
				.then(res => {
					if (res && res.data) {
						// let rolemappings = this.rolemappings.filter(rolemapping => {
						// 	if (rolemapping.principalType === 'PERMISSION') {
						// 		return true;
						// 	}
						// });
						// let rolemappingId = [];
						// rolemappings.forEach(rolemapping => {
						// 	rolemappingId.push(rolemapping.id);
						// });
						self.$api('users').deletePermissionRoleMapping(res.data.id);
						let newRoleMappings = [];

						saveRoleArr.forEach(selectPermission => {
							if (selectPermission)
								newRoleMappings.push({
									principalType: 'PERMISSION',
									principalId: selectPermission,
									roleId: res.data.id
								});
						});
						roleMappingModel.post(newRoleMappings);

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
					self.saveloading = false;
				});
		},

		// 返回
		back() {
			this.$router.push({ name: 'roles' });
		}
	}
};
</script>

<style lang="less" scoped>
.roles {
	height: 100%;
	padding: 30px 20px;
	box-sizing: border-box;
	overflow: hidden;
	h1 {
		padding-bottom: 20px;
		font-size: 16px;
		color: #333;
		font-weight: bold;
	}
	.e-form {
		height: calc(100% - 41px);
		.role-tableBox {
			height: 540px;
			.role-table {
				position: relative;
				height: 520px;
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
					overflow: hidden;
					border-bottom: 1px solid #e7e7e7;
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
					user-select: none;
					cursor: pointer;
					box-sizing: border-box;
				}

				.center {
					float: left;
					width: 80%;
					padding-left: 10px;
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
			}
		}
		.btn {
			text-align: center;
		}
	}
}

[v-cloak] {
	display: none;
}
</style>
<style lang="less">
.roles {
	.el-input__inner {
		width: 450px;
	}
}
</style>
