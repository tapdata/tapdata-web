<template>
	<section class="user-list-wrap">
		<TablePage
			ref="table"
			row-key="id"
			class="user-list"
			:title="$t('app.menu.' + $route.name)"
			:desc="$t('user.des')"
			:classify="{ authority: 'data_catalog_category_management', types: ['user'] }"
			:remoteMethod="getData"
			@selection-change="handleSelectionChange"
			@classify-submit="handleOperationClassify"
			@sort-change="handleSortTable"
		>
			<div class="tapNav" slot="nav">
				<ul class="mune">
					<li
						v-for="item in muneList"
						:key="item.icon"
						:class="activePanel === item.key ? 'active' : ''"
						@click="handleTapClick(item.key)"
					>
						<i :class="['iconfont', item.icon]"></i>
						<span slot="title">{{ item.name }}</span>
						<!-- <i class="" v-if="item.key !== 'all' && item.key + 'Count' > 0">
							{{ item.key + 'Count' }}
						</i> -->

						<el-badge
							class="item-badge"
							v-if="item.key + 'Count' === 'notActivatedCount'"
							:value="notActivatedCount"
							:max="99"
							:hidden="!notActivatedCount"
						>
						</el-badge>
						<el-badge
							class="item-badge"
							v-if="item.key + 'Count' === 'notVerifiedCount'"
							:value="notVerifiedCount"
							:max="99"
							:hidden="!notVerifiedCount"
						>
						</el-badge>
						<el-badge
							class="item-badge"
							v-if="item.key + 'Count' === 'rejectedCount'"
							:value="rejectedCount"
							:max="99"
							:hidden="!rejectedCount"
						>
						</el-badge>
					</li>
				</ul>
			</div>
			<div slot="search">
				<ul class="search-bar">
					<li>
						<el-input
							clearable
							class="input-with-select"
							size="mini"
							v-model="searchParams.keyword"
							:placeholder="$t('user.userNameEmail')"
							@input="table.fetch(1, 800)"
						>
							<el-select
								style="width: 120px;"
								slot="prepend"
								v-model="searchParams.isFuzzy"
								@input="table.fetch(1)"
							>
								<el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
								<el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
							</el-select>
						</el-input>
					</li>
					<!-- <li>
						<el-date-picker
							v-model="searchParams.time"
							size="mini"
							type="datetimerange"
							:start-placeholder="$t('user.startTime')"
							:end-placeholder="$t('user.endTime')"
							:placeholder="$t('user.changeTime')"
							@input="table.fetch(1)"
						>
						</el-date-picker>
					</li> -->

					<li>
						<el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
					</li>

					<li>
						<el-button size="mini" type="text" @click="reset('reset')">{{ $t('button.reset') }}</el-button>
					</li>
				</ul>
			</div>
			<div slot="operation">
				<el-button
					v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
					v-readonlybtn="'data_catalog_category_application'"
					size="mini"
					class="btn"
					v-show="multipleSelection.length > 0"
					@click="$refs.table.showClassify(handleSelectTag())"
				>
					<i class="iconfont icon-biaoqian back-btn-icon"></i>
					<span> {{ $t('dataFlow.taskBulkTag') }}</span>
				</el-button>
				<el-dropdown @command="handleCommand($event)" v-show="multipleSelection.length > 0">
					<el-button class="btn btn-dropdowm" size="mini">
						<i class="iconfont icon-piliang back-btn-icon"></i>
						<span> {{ $t('dataFlow.taskBulkOperation') }}</span>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="activated" v-readonlybtn="'user_edition'">{{
							$t('user.bulkActivation')
						}}</el-dropdown-item>
						<el-dropdown-item command="rejected" v-readonlybtn="'user_edition'">{{
							$t('user.bulkFreeze')
						}}</el-dropdown-item>
						<el-dropdown-item command="notActivated" v-readonlybtn="'user_edition'">{{
							$t('user.bulkCheck')
						}}</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<el-button
					v-readonlybtn="'new_model_creation'"
					class="btn btn-create"
					size="mini"
					@click="openCreateDialog"
				>
					<i class="iconfont icon-jia add-btn-icon"></i>
					<span>{{ $t('user.creatUser') }}</span>
				</el-button>
			</div>
			<el-table-column
				v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
				type="selection"
				width="45"
				:reserve-selection="true"
			>
			</el-table-column>
			<el-table-column :label="$t('user.userName')" prop="name" sortable="custom">
				<template slot-scope="scope">
					<div class="metadata-name">
						<p>{{ scope.row.username }}</p>
						<div class="parent ellipsis">
							{{ scope.row.email }}
						</div>
					</div>
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.role')" prop="roleMappings">
				<template slot-scope="scope">
					{{ permissionsmethod(scope.row.roleMappings) }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.changeTime')" prop="last_updated">
				<template slot-scope="scope">
					{{ $moment(scope.row.last_updated).format('YYYY-MM-DD HH:mm:ss') }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.source')" prop="source">
				<template slot-scope="scope">
					{{ scope.row.source ? $t('user.' + scope.row.source) : '' }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.status')" prop="status" sortable="custom">
				<template slot-scope="scope">
					{{ scope.row.status ? $t('user.' + scope.row.status) : '' }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.opera')">
				<template slot-scope="scope">
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						v-if="scope.row.status === 'rejected' || scope.row.status === 'notActivated'"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="handleActive(scope.row)"
					>
						{{ $t('user.activation') }}
					</el-button>
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						v-if="scope.row.status !== 'rejected'"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="handleFreeze(scope.row)"
					>
						{{ $t('user.freeze') }}
					</el-button>
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						v-if="scope.row.status === 'notVerified'"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="handleCheck(scope.row)"
						>{{ $t('user.check') }}</el-button
					>
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						v-if="scope.row.status === 'activated' || scope.row.status === 'rejected'"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="edit(scope.row)"
						>{{ $t('user.edit') }}</el-button
					>
					<el-button
						v-readonlybtn="'user_delete'"
						size="mini"
						type="text"
						:disabled="$disabledByPermission('user_delete_all_data', scope.row.user_id)"
						@click="remove(scope.row)"
						>{{ $t('user.delete') }}</el-button
					>
				</template>
			</el-table-column>
		</TablePage>
		<el-dialog
			width="600px"
			:title="createForm.id ? $t('user.editUser') : $t('user.creatUser')"
			:close-on-click-modal="false"
			:visible.sync="createDialogVisible"
			custom-class="creatDialog"
		>
			<FormBuilder ref="form" v-model="createForm" :config="createFormConfig"></FormBuilder>
			<div>
				<span class="label">{{ $t('user.activationCode') }}</span>
				<span style="padding-right: 30px">{{ createForm.accesscode || '-' }}</span>
				<el-button @click="resetAccesCode" type="text" size="mini">{{ $t('button.reset') }}</el-button>
				<el-tooltip
					placement="top"
					manual
					:content="$t('dialog.downAgent.copied')"
					popper-class="copy-tooltip"
					:value="showTooltip"
					v-if="createForm.accesscode"
				>
					<span
						class="operaKey"
						v-clipboard:copy="createForm.accesscode"
						v-clipboard:success="onCopy"
						@mouseleave="showTooltip = false"
					>
						<el-button type="text" size="mini">{{ $t('message.copy') }}</el-button>
					</span>
				</el-tooltip>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="createDialogVisible = false" size="mini">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="createNewUser()" size="mini">{{ $t('message.confirm') }}</el-button>
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
			showTooltip: false,
			order: 'name DESC',
			list: null,
			multipleSelection: [],
			roleMappding: [],
			createDialogVisible: false,
			activePanel: 'all',
			muneList: [
				{ name: this.$t('user.all'), key: 'all' },
				{ name: this.$t('user.notActivated'), key: 'notActivated', count: 0 },
				{ name: this.$t('user.notVerified'), key: 'notVerified', count: 0 },
				{ name: this.$t('user.rejected'), key: 'rejected', count: 0 }
			],
			notActivatedCount: 0,
			notVerifiedCount: 0,
			rejectedCount: 0,
			createForm: {
				username: '',
				email: '',
				password: '',
				roleusers: [],
				status: 'activated',
				accesscode: ''
			},
			createFormConfig: {
				form: {
					labelPosition: 'right',
					labelWidth: '100px',
					size: 'small',
					inlineMessage: true
				},
				items: [
					{
						type: 'input',
						label: this.$t('user.userName'),
						field: 'username',
						required: true
					},
					{
						type: 'input',
						label: this.$t('user.email'),
						field: 'email',
						required: true,
						maxlength: 150,
						rules: [
							{
								required: true,
								validator: (rule, v, callback) => {
									if (!v || !v.trim()) {
										return callback(new Error(this.$t('user.emailNull')));
									} else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)) { // eslint-disable-line
										return callback(new Error(this.$t('user.email_must_valid')));
									} else {
										return callback();
									}
								}
							}
						]
					},
					{
						type: 'input',
						field: 'password',
						label: this.$t('user.password'),
						domType: 'password',
						showPassword: true,
						rules: [
							{
								required: true,
								validator: (rule, v, callback) => {
									if (!v || !v.trim()) {
										return callback(new Error(this.$t('user.passwordNull')));
									} else if (v.length < 5) {
										return callback(new Error(this.$t('user.pass_hint')));
									} else if (/[\s\u4E00-\u9FA5]/.test(v)) {
										return callback(new Error(this.$t('account.passwordNotCN')));
									} else {
										return callback();
									}
								}
							}
						]
					},
					{
						type: 'select',
						label: this.$t('user.role'),
						field: 'roleusers',
						multiple: true,
						options: [],
						required: true
					},
					{
						type: 'select',
						label: this.$t('user.status'),
						field: 'status',
						options: [
							{ label: this.$t('user.notVerified'), value: 'notVerified' },
							{ label: this.$t('user.notActivated'), value: 'notActivated' },
							{ label: this.$t('user.activated'), value: 'activated' },
							{ label: this.$t('user.rejected'), value: 'rejected' }
						],
						required: true
					}
				]
			},
			count1: 0,
			count2: 0
		};
	},
	created() {
		this.getDbOptions();
		this.getCount();
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
		getData({ page, tags }) {
			let { current, size } = page;
			let { isFuzzy, keyword } = this.searchParams;
			let where = {};
			if (keyword && keyword.trim()) {
				let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
				where.or = [{ name: filterObj }, { email: filterObj }];
			}
			if (this.activePanel !== 'all') {
				where.status = this.activePanel;
			}

			if (tags && tags.length) {
				where['listtags.id'] = {
					in: tags
				};
			}
			let filter = {
				order: this.order,
				limit: size,
				skip: (current - 1) * size,
				where
			};
			return Promise.all([
				this.$api('users').count({ where: where }),
				this.$api('users').get({
					filter: JSON.stringify(filter)
				})
			]).then(([countRes, res]) => {
				if (where.status) {
					this[where.status + 'Count'] = countRes.data.count;
				}
				return {
					total: countRes.data.count,
					data: res.data
				};
			});
		},
		getCount() {
			Promise.all([
				this.$api('users').count({ where: { status: 'notActivated' } }),
				this.$api('users').count({ where: { status: 'notVerified' } }),
				this.$api('users').count({ where: { status: 'rejected' } })
			]).then(([notActivatedCount, notVerifiedCount, rejectedCount]) => {
				this.notActivatedCount = notActivatedCount.data.count;
				this.notVerifiedCount = notVerifiedCount.data.count;
				this.rejectedCount = rejectedCount.data.count;
			});
		},
		// 获取角色下拉值
		getDbOptions() {
			// let filter = {
			// 	fields: {
			// 		name: true,
			// 		id: true,
			// 		database_type: true,
			// 		connection_type: true,
			// 		status: true
			// 	}
			// };
			this.$api('role')
				.get({})
				.then(res => {
					if (res.data && res.data.length) {
						let options = [];
						res.data.forEach(db => {
							if (db.name !== 'admin') {
								options.push({
									label: db.name,
									value: db.id
								});
							}
						});
						this.createFormConfig.items[3].options = options;
					}
				});
		},
		// taps标签页切换
		handleTapClick(val) {
			this.activePanel = val;
			this.table.fetch(1);
		},
		handleSortTable({ order, prop }) {
			this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
		},
		// 选中数据
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},

		// 选择分类
		handleSelectTag() {
			let tagList = {};
			this.multipleSelection.forEach(row => {
				if (row.listtags && row.listtags.length > 0) {
					tagList[row.listtags[0].id] = {
						value: row.listtags[0].value
					};
				}
			});
			return tagList;
		},
		// 分类设置保存
		handleOperationClassify(listtags) {
			let ids = this.multipleSelection.map(item => {
				return item.id;
			});
			let where = {
				id: {
					inq: ids
				}
			};
			this.$api('users')
				.update(where, { listtags: listtags })
				.then(() => {
					this.table.fetch();
				});
		},
		// 获取角色关联的用户的数据
		getMappingModel(id) {
			this.$api('roleMapping')
				.get({ 'filter[where][principalId]': id })
				.then(res => {
					if (res && res.data) {
						this.roleMappding = res.data;
						this.createForm.roleusers = res.data.map(item => item.roleId);
					}
				});
		},
		// 创建用户弹窗
		openCreateDialog() {
			this.createDialogVisible = true;

			this.createForm = {
				username: '',
				email: '',
				password: '',
				roleusers: [],
				status: 'activated',
				accesscode: ''
			};
			this.$refs.form.clearValidate();
		},
		// 保存用户表单
		createNewUser() {
			let that = this;
			this.$refs.form.validate(valid => {
				if (valid) {
					let params = that.createForm;
					params.source = 'creat';

					that.$api('users')
						[that.createForm.id ? 'patch' : 'post'](params)
						.then(res => {
							if (res) {
								// 过滤不存在角色
								let roleIdArr = [];
								if (res.data.roleMappings.length) {
									that.createFormConfig.items[3].options.filter(item => {
										if (that.createForm.roleusers.indexOf(item.value) > -1) {
											roleIdArr.push(item.value);
										}
									});
								} else {
									roleIdArr = that.createForm.roleusers;
								}

								// 删除以前角色id
								that.roleMappding.forEach(rolemapping => {
									that.$api('roleMapping').delete(rolemapping.id);
								});

								let newRoleMappings = [];
								roleIdArr.forEach(roleuser => {
									newRoleMappings.push({
										principalType: 'USER',
										principalId: res.data.id,
										roleId: roleuser
									});
								});
								that.$api('roleMapping')
									.post(newRoleMappings)
									.then(() => {
										that.$message.success(this.$t('message.saveOK'));
									});
							}
						})
						.catch(() => {
							that.$message.success(this.$t('message.saveOK'));
						})
						.finally(() => {
							that.createDialogVisible = false;
						});
				}
			});
		},
		// 编辑用户
		edit(item) {
			this.createDialogVisible = true;
			this.createForm = {
				id: item.id,
				username: item.username,
				email: item.email,
				password: '',
				roleusers: item.roleusers,
				status: item.status ? item.status : '',
				accesscode: item.accesscode
			};
			this.getMappingModel(item.id);
		},

		// 删除用户
		remove(item) {
			const h = this.$createElement;
			let message = h('p', [
				this.$t('user.delUser') + ' ',
				h('span', { style: { color: '#48b6e2' } }, item.username),
				this.$t('user.deluserLast')
			]);
			this.$confirm(message, this.$t('user.delUserTitle'), {
				type: 'warning',
				closeOnClickModal: false,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.$api('users')
							.delete(item.id)
							.then(() => {
								this.$message.success(this.$t('message.deleteOK'));
								this.table.fetch();
								done();
							})
							.catch(() => {
								this.$message.info(this.$t('message.deleteFail'));
							})
							.finally(() => {
								instance.confirmButtonLoading = false;
							});
					} else {
						done();
					}
				}
			});
		},
		// 激活
		handleActive(item) {
			const h = this.$createElement;
			let message = h('p', [
				this.$t('user.activetionUser') + ' ',
				h('span', { style: { color: '#48b6e2' } }, item.username),
				this.$t('user.activetionUserLast')
			]);
			let params = {
				id: item.id,
				status: 'activated'
			};
			let successMsg = this.$t('user.activetionSuccess');
			let errorMsg = this.$t('user.activetionError');
			this.$confirm(
				message,
				this.$t('user.activationUserTitle'),
				this.handleStatus(params, successMsg, errorMsg)
			);
		},
		// 冻结
		handleFreeze(item) {
			const h = this.$createElement;
			let message = h('p', [
				this.$t('user.freezeUser') + ' ',
				h('span', { style: { color: '#48b6e2' } }, item.username),
				this.$t('user.freezeUserLast')
			]);
			let params = {
				id: item.id,
				status: 'rejected'
			};
			let successMsg = this.$t('user.freezeSuccess');
			let errorMsg = this.$t('user.freezeError');
			this.$confirm(message, this.$t('user.freezeUserTitle'), this.handleStatus(params, successMsg, errorMsg));
		},
		// 校验
		handleCheck(item) {
			const h = this.$createElement;
			let message = h('p', [
				this.$t('user.checkUser') + ' ',
				h('span', { style: { color: '#48b6e2' } }, item.username),
				this.$t('user.checkUserLast')
			]);
			let params = {
				id: item.id,
				status: 'notActivated'
			};
			let successMsg = this.$t('user.freezeSuccess');
			let errorMsg = this.$t('user.freezeError');
			this.$confirm(message, this.$t('user.checkUserTitle'), this.handleStatus(params, successMsg, errorMsg));
		},
		// 改变状态提示
		handleStatus(data, successMsg, errorMsg) {
			return {
				type: 'warning',
				closeOnClickModal: false,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.$api('users')
							.patch(data)
							.then(() => {
								this.$message.success(successMsg);
								this.table.fetch();
								done();
							})
							.catch(() => {
								this.$message.info(errorMsg);
							})
							.finally(() => {
								instance.confirmButtonLoading = false;
							});
					} else {
						done();
					}
				}
			};
		},
		// 批量操作处理
		handleCommand(command) {
			let ids = this.multipleSelection.map(item => {
				return item.id;
			});
			let where = {
				id: {
					inq: ids
				}
			};
			this.$api('users')
				.update(where, { status: command })
				.then(() => {
					this.table.fetch();
					this.$message.success(this.$t('message.operationSuccuess'));
				});
		},
		// 关联用户
		permissionsmethod(data) {
			let html = '';
			if (data && data.length) {
				data.forEach(item => {
					if (item.role && item.role.name) {
						html += ' ' + item.role.name + ',';
					}
				});
			}
			return html.substring(0, html.lastIndexOf(','));
		},
		// 重置激活码
		resetAccesCode() {
			const S4 = function() {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			};
			const NewGuid = function() {
				return S4() + S4() + '' + S4() + '' + S4() + '' + S4() + '' + S4() + S4() + S4();
			};
			this.createForm.accesscode = NewGuid();
		},
		// 复制激活码
		onCopy() {
			this.showTooltip = true;
		}
	}
};
</script>
<style lang="less" scoped>
.user-list-wrap {
	height: 100%;

	.tapNav {
		height: 28px;
		background-color: rgba(239, 241, 244, 100);
		.mune {
			display: inline-block;
			height: 28px;
			line-height: 25px;
			font-size: 12px;
			border-radius: 0px 3px 0px 0px;
			background-color: rgba(244, 245, 247, 100);
			box-shadow: 0 -1px 10px 0px rgba(0, 0, 0, 0.15);
			li {
				float: left;
				width: 100px;
				height: 28px;
				color: #666;
				cursor: pointer;
				text-align: center;
				border-right: 1px solid #dedee4;

				&:last-child {
					border-right: 0;
				}
			}
			li.active {
				height: 29px;
				border-radius: 3px 3px 0px 0px;
				background-color: #fff;
				border-right: 0;
				border-left: 0;
				// box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
			}
		}
	}
	.user-list {
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
		.metadata-name {
			.name {
				color: #48b6e2;
				a {
					color: inherit;
					cursor: pointer;
				}
			}
			.tag {
				margin-left: 5px;
				color: #999999;
				background: #f5f5f5;
				border: 1px solid #dedee4;
			}
			.parent {
				color: #cccccc;
			}
		}
	}
}
</style>
<style lang="less">
.user-list-wrap {
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
				border-top: 0;
				.has-gutter {
					th {
						background-color: #eff1f4 !important;
					}
				}
			}
			.table-page-pagination {
				margin-top: 0;
				padding: 5px 20px;
				background-color: #fff;
				box-sizing: border-box;
			}
		}
	}
}
.creatDialog {
	.el-dialog__body {
		padding: 30px;
		.el-form {
			.el-form-item {
				margin-bottom: 12px;
				.el-form-item__label {
					text-align: left;
				}
			}
		}
		.label {
			display: inline-block;
			width: 100px;
			padding-right: 12px;
			text-align: left;
			font-size: 12px;
			box-sizing: border-box;
		}
	}
}
</style>
