<template>
	<div class="roles">
		<h1>{{ title }}</h1>
		<el-form ref="form" :model="form" :rules="rules" label-width="140px">
			<el-form-item :label="$t('role.roleName')">
				<el-input v-model="form.name"></el-input>
			</el-form-item>

			<el-form-item :label="$t('role.roleDesc')">
				<el-input v-model="form.name"></el-input>
			</el-form-item>
			<el-form-item :label="$t('role.defaultRole')">
				<el-switch v-model="form.delivery"></el-switch>
			</el-form-item>
			<el-form-item :label="$t('role.rolePermission')">
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
								v-if="!item.second"
								:indeterminate="item.isIndeterminate"
								v-model="item.checkAll"
							>
								{{ item.title }}
							</el-checkbox>
							<span v-if="item.second" v-cloak>{{ item.title }}</span>
						</div>
						<div class="right h40">
							<el-checkbox-group
								v-model="item.checkedCities"
								@change="handleOneCheckedCitiesChange(item)"
							>
								<el-checkbox v-for="m in item.list" :label="m.id" :key="m.id" v-cloak>
									{{ m.name }}
								</el-checkbox>
								<el-popover
									popper-class="aggtip"
									width="600"
									trigger="hover"
									:content="$t('dataFlow.nameTip')"
								>
									<span class="icon iconfont icon-tishi1" slot="reference"></span>
								</el-popover>
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
		</el-form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			title: '角色编辑',
			form: {
				name: '',
				description: '',
				default: ''
			},
			rules: [],
			dataList: [
				{
					title: '概况',
					id: '0',
					checkedCities: [],
					list: [
						{
							name: '浏览',
							id: '10001'
						},
						{
							name: '修改',
							id: '11111'
						}
					]
				},
				{
					title: '会员管理',
					id: '1',
					list: [
						{
							name: '新增',
							id: '10002'
						},
						{
							name: '修改',
							id: '10003'
						}
					],
					checkedCities: []
				},
				{
					title: '会员列表',
					id: '2',
					checkedCities: [],
					list: [
						{
							name: '新增',
							id: '10004'
						},
						{
							name: '修改',
							id: '10005'
						},
						{
							name: '删除',
							id: '1006'
						}
					]
				},
				{
					title: '菜单管理',
					id: '3',
					list: [
						{
							name: '新增',
							id: '10007'
						},
						{
							name: '修改',
							id: '10008'
						}
					],
					checkedCities: []
				}
			]
		};
	},

	methods: {
		// 点击菜单
		handleOneCheckedCitiesChange(item) {
			let checkedCount = item.checkedCities.length;
			if (typeof item.isIndeterminate === 'undefined') {
				this.$set(item, 'isIndeterminate', false);
			}
			if (typeof item.checkAll === 'undefined') {
				this.$set(item, 'checkAll', false);
			}
			item.isIndeterminate = checkedCount > 0 && checkedCount < item.list.length;
			item.checkAll = checkedCount === item.list.length;
		},

		handleOneCheckAll(event, item) {
			let arr = [];
			for (let a = 0; a < item.list.length; a++) {
				arr.push(item.list[a].id);
			}

			item.checkedCities = event.target.checked ? arr : [];
		}
	}
};
</script>

<style lang="less" scoped>
.roles {
	padding: 30px 20px;
	box-sizing: border-box;
	overflow: hidden;
	h1 {
		padding-bottom: 20px;
		font-size: 16px;
		color: #333;
		font-weight: bold;
	}
	.role-table {
		position: relative;
		border: 1px solid #e0e0e0;
		border-bottom: none;
		// .header {
		// 	height: 40px;
		// 	line-height: 40px;
		// 	text-align: center;
		// 	border-bottom: 1px solid #e7e7e7;
		// 	background: #f8f8f9;
		// }

		.vertical-line {
			position: absolute;
			left: 30%;
			top: 0;
			width: 1px;
			height: 100%;
			background: #ddd;
		}

		.left {
			float: left;
			width: 30%;
			padding-left: 10px;
			user-select: none;
			cursor: pointer;
			box-sizing: border-box;
		}

		.one {
			padding-left: 20px;
		}

		.right {
			width: 70%;
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
