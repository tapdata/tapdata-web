<template>
	<div class="roles">
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
					<!-- <li class="header">
						<div class="left">菜单列表</div>
						<div class="right">功能权限</div>
					</li> -->
					<div class="vertical-line"></div>
					<li v-for="item in dataList" :key="item.id">
						<div class="left h40">
							<el-checkbox
								@click.native="handleOneCheckAll($event, item)"
								v-cloak
								v-if="!item.parentId"
								:indeterminate="item.isIndeterminate"
								:label="item.name"
								v-model="item.checkAll"
							>
								{{ item.description }}
							</el-checkbox>
						</div>
						<div class="right h40">
							<el-checkbox-group
								v-model="item.checkedCities"
								@change="handleOneCheckedCitiesChange(item)"
							>
								<el-checkbox v-for="m in item.children" :label="m.name" :key="m.id" v-cloak>
									{{ m.description }}
									<el-popover
										popper-class="aggtip"
										width="600"
										trigger="hover"
										:content="$t('dataFlow.nameTip')"
									>
										<span class="icon iconfont icon-bangzhu5" slot="reference"></span>
									</el-popover>
								</el-checkbox>
							</el-checkbox-group>
						</div>
						<div class="line"></div>
						<!-- <ul v-show="item.second && !item.folded">
					<li class="h40" v-for="(second, cur) in item.second" :key="second.id">
						<div class="left">
							<el-checkbox
								v-model="second.checkAll"
								@change="handleCheckAllChange($event, item, second)"
								v-cloak
							>
								{{ second.title }}
							</el-checkbox>
						</div>
						<div class="right">
							<el-checkbox-group
								v-model="second.checkedCities"
								@change="handleCheckedCitiesChange(item, second)"
							>
								<el-checkbox v-for="p in second.list" :label="p.id" :key="p.id" v-cloak>
									{{ p.name }}
								</el-checkbox>
							</el-checkbox-group>
						</div>
						<div class="line"></div>
					</li>
				</ul> -->
					</li>
				</ul>
			</el-form-item>
			<el-form-item class="btn">
				<el-button @click="submitForm('ruleForm')">{{ $t('dataVerify.back') }}</el-button>
				<el-button type="primary" @click="saveSubmit('ruleForm')">{{ $t('app.save') }}</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import factory from '@/api/factory';
const usersModel = factory('users');
const rolesModel = factory('role');
const roleMappingModel = factory('roleMapping');
export default {
	data() {
		return {
			title: '',
			form: {
				name: '',
				description: '',
				register_user_default: false
			},
			dataList: [
				{
					description: '数据校验',
					name: 'Data Publish',
					code: 'dataVer',
					need_permission: true,
					id: '0'
				},
				{ parentId: '0', id: '01', description: '浏览', code: 'dataVer_preview' },
				{
					parentId: '0',
					id: '02',
					description: '修改',
					need_permission: true,
					name: 'Data Explorer',
					code: 'dataVer_modify'
				},
				{
					description: '角色管理',
					id: '1'
				},
				{ parentId: '1', id: '11', description: '浏览', code: 'dataVer_preview' },
				{
					parentId: '1',
					id: '12',
					description: '修改',
					code: 'dataVer_modify'
				},
				{
					description: '任务编排',
					id: '2'
				},
				{
					description: '新增',
					id: '10004',
					parentId: '2'
				},
				{
					description: '修改',
					id: '10005',
					parentId: '2'
				},
				{
					description: '删除',
					id: '1006',
					parentId: '2'
				},
				{
					description: '设置管理',
					id: '3'
				}
			],
			rolemappings: [],
			roleusers: [],
			selectRole: []
		};
	},

	created() {
		this.title = this.$route.query.id ? this.$t('role.editroleTitle') : this.$t('role.addroleTitle');
		this.getPermission();
		if (this.$route.query.id) {
			this.getUserDataApi();
		}
	},

	methods: {
		//  获取用户信息
		getUserDataApi() {
			let params = {
				filter: {
					where: {
						id: this.$route.params.id
					}
				}
			};
			usersModel.get(params).then(res => {
				if (res && res.data) {
					this.form = res.data;
				}
			});

			roleMappingModel.get({ 'filter[where][roleId]': this.$route.params.id }).then(res => {
				if (res && res.data && res.data.length) {
					res.data.forEach(item => {
						if (item.principalType === 'USER') {
							this.roleusers.push(item.principalId);
						}
						if (item.principalType === 'PERMISSION') {
							let selected = this.items.filter(v => v.name === item.principalId);
							if (selected && selected.length > 0) {
								selected[0].self_only = item.self_only;
								this.selectRole.push(selected[0]);
							}
						}
					});
					this.rolemappings = res.data;
				}
			});
		},

		// 获取权限信息
		getPermission() {
			let branchArr = [];
			this.dataList.filter(father => {
				branchArr = this.dataList.filter(child => father.id == child.parentId);
				branchArr.length > 0 ? (father.children = branchArr) : [];
			});
			let authorityArr = [];
			this.dataList.forEach(item => {
				this.$set(item, 'checkedCities', []);
				if (!item.parentId) {
					authorityArr.push(item);
				}
			});
			this.dataList = authorityArr;

			// this.$api('Permissions')
			// 	.get({})
			// 	.then(res => {
			// 		if (res) {
			// 			if (res.data && res.data.length) {
			// 				res.data.forEach(item => {
			// 					if (item.id === item.parentId) {
			// 						this.dataList.children.push(item);
			// 					} else {
			// 						this.dataList.push(item);
			// 					}
			// 				});
			// 			}
			// 		}
			// 	});
		},
		// 点击菜单
		handleOneCheckedCitiesChange(item) {
			let checkedCount = item.checkedCities.length;
			if (typeof item.isIndeterminate === 'undefined') {
				this.$set(item, 'isIndeterminate', false);
			}
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', false);
			}
			item.isIndeterminate = checkedCount > 0 && checkedCount < item.children.length;
			item.checkAll = checkedCount === item.children.length;
		},
		// 选择获取全部数据
		handleOneCheckAll(event, item) {
			let arr = [];
			for (let i = 0; i < item.children.length; i++) {
				arr.push(item.children[i].id);
			}
			debugger;
			item.checkedCities = event.target.checked ? arr : [];
		},

		// 保存
		saveSubmit() {
			const record = {
				user_id: this.$cookie.get('user_id'),
				name: this.form.name,
				description: this.form.description,
				register_user_default: this.form.register_user_default
			};
			const roleId = this.$route.params.id;
			const method = roleId ? 'patch' : 'post';

			if (roleId) {
				record.id = roleId;
			}

			rolesModel[method](record).then(res => {
				if (res && res.data) {
					this.$message.success(this.$t('message.saveOK'));

					let rolemappings = this.rolemappings.filter(rolemapping => {
						if (rolemapping.principalType === 'USER') {
							return this.roleusers.indexOf(rolemapping.principalId) < 0;
						} else if (rolemapping.principalType === 'PERMISSION') {
							return true;
						} else {
							return true;
						}
					});

					rolemappings.forEach(rolemapping => {
						roleMappingModel.delete(rolemapping.id);
					});

					let newRoleMappings = [];
					this.roleusers.forEach(roleuser => {
						let newUser = this.rolemappings.filter(rolemapping => rolemapping.principalId === roleuser);
						if (newUser.length === 0) {
							newRoleMappings.push({
								principalType: 'USER',
								principalId: roleuser,
								roleId: res.data.id
							});
						}
					});
					this.selected.forEach(selectPermission => {
						newRoleMappings.push({
							principalType: 'PERMISSION',
							principalId: selectPermission.name,
							roleId: res.data.id,
							self_only: selectPermission.self_only
						});
					});

					newRoleMappings.forEach(rolemapping => {
						roleMappingModel.post(rolemapping);
					});
				}
			});
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
				border: 1px solid #e0e0e0;
				border-bottom: none;
				overflow: auto;
				// .header {
				// 	height: 40px;
				// 	line-height: 40px;
				// 	text-align: center;
				// 	border-bottom: 1px solid #e7e7e7;
				// 	background: #f8f8f9;
				// }

				.vertical-line {
					position: absolute;
					left: 25%;
					top: 0;
					width: 1px;
					height: 100%;
					background: #ddd;
				}

				.left {
					float: left;
					width: 25%;
					padding-left: 10px;
					user-select: none;
					cursor: pointer;
					box-sizing: border-box;
				}

				.one {
					padding-left: 20px;
				}

				.right {
					width: 75%;
					float: left;
					padding-left: 10px;
					box-sizing: border-box;
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
