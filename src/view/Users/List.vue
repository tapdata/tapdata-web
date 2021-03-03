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
					<li>
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
					</li>

					<li>
						<el-button size="mini" type="text" @click="reset()">{{ $t('button.refresh') }}</el-button>
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
					{{ scope.row.source }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.status')" prop="status" sortable="custom">
				<template slot-scope="scope">
					{{ scope.row.status }}
				</template>
			</el-table-column>
			<el-table-column :label="$t('user.opera')">
				<template slot-scope="scope">
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="handleActive(scope.row)"
					>
						{{ $t('user.activation') }}
					</el-button>
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="changeName(scope.row)"
					>
						{{ $t('user.freeze') }}
					</el-button>
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
						:disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
						@click="remove(scope.row)"
						>{{ $t('user.check') }}</el-button
					>
					<el-button
						v-readonlybtn="'user_edition'"
						size="mini"
						type="text"
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
				isFuzzy: true,
				time: ''
			},
			showTooltip: false,
			order: 'name DESC',
			list: null,
			multipleSelection: [],
			statusBtMap: {
				run: { draft: true, error: true, paused: true },
				stop: { running: true },
				delete: { draft: true, error: true, paused: true },
				edit: { draft: true, error: true, paused: true },
				reset: { draft: true, error: true, paused: true },
				forceStop: { stopping: true }
			},
			createDialogVisible: false,
			createForm: {
				username: '',
				email: '',
				password: '',
				roleusers: [],
				status: '3',
				accesscode: ''
			},
			createFormConfig: {
				form: {
					labelPosition: 'right',
					labelWidth: '100px',
					size: 'small'
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
						maxlength: 150
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
									}

									if (v.length < 5) {
										return callback(new Error(this.$t('user.pass_hint')));
									}
									return callback();
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
							{ label: this.$t('user.notVerified'), value: '1' },
							{ label: this.$t('user.notActivated'), value: '2' },
							{ label: this.$t('user.activated'), value: '3' },
							{ label: this.$t('user.rejected'), value: '4' }
						],
						required: true
					}
				]
			}
		};
	},
	created() {
		this.getDbOptions();
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
			let { isFuzzy, keyword, time } = this.searchParams;
			let where = {};
			if (keyword && keyword.trim()) {
				let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
				where.or = [{ name: filterObj }, { email: filterObj }];
			}
			if (time) {
				where.last_updated = {
					gt: new Date(time[0])
					// lt: this.$moment(time[1]).format('YYYY-MM-DD HH:mm:ss')
				};
			}

			if (tags && tags.length) {
				where['classifications.id'] = {
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
				return {
					total: countRes.data.count,
					data: res.data
				};
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
		handleSortTable({ order, prop }) {
			this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`;
			this.table.fetch(1);
		},
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		handleSelectTag() {
			let tagList = {};
			this.multipleSelection.forEach(row => {
				if (row.classifications && row.classifications.length > 0) {
					tagList[row.classifications[0].id] = {
						value: row.classifications[0].value
					};
				}
			});
			return tagList;
		},
		handleOperationClassify() {
			debugger;
			this.$api('UserGroup')
				.get({})
				.then(() => {
					this.table.fetch();
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
				status: '3',
				accesscode: ''
			};
			this.$refs.form.clearValidate();
		},
		// 保存用户表单
		createNewUser() {
			this.$refs.form.validate(valid => {
				if (valid) {
					let params = this.createForm;
					this.$api('users')
						[this.createForm.id ? 'patch' : 'post'](params)
						.then(() => {
							this.$message.success('message.saveOK');
						})
						.catch(() => {
							this.$message.error('message.saveFail');
						})
						.finally(() => {
							this.createDialogVisible = false;
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
		},
		changeName(item) {
			this.$prompt('', this.$t('connection.rename'), {
				inputPattern: /^[_a-zA-Z][0-9a-zA-Z_\.\-]*$/, // eslint-disable-line
				inputErrorMessage: this.$t('dialog.placeholderTable'),
				inputValue: item.name || item.original_name,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.$api('MetadataInstances')
							.updateById(item.id, {
								name: instance.inputValue
							})
							.then(() => {
								this.$message.success(this.$t('message.saveOK'));
								this.table.fetch();
								done();
							})
							.catch(() => {
								this.$message.info(this.$t('message.saveFail'));
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
			this.$confirm(message, this.$t('user.activationUserTitle'), {
				type: 'warning',
				closeOnClickModal: false,
				beforeClose: (action, instance, done) => {
					if (action === 'confirm') {
						instance.confirmButtonLoading = true;
						this.$api('users')
							.post(item.id)
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
	.user-list {
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
