<template>
	<el-container class="guide-wrap" v-if="steps[activeStep]">
		<el-header class="guide-header" height="48px">
			<a class="logo" href="/">
				<img :src="logoUrl" />
			</a>
			<a style="color: #fff;cursor: pointer;" @click="signOut">
				<i class="el-icon-switch-button"></i>
			</a>
		</el-header>
		<el-container style="overflow: hidden;flex: 1;">
			<el-header class="step-header" height="42px">
				<span>{{ $t('guide.guide_title') }}</span>
				<ul class="step-box">
					<li v-for="(step, index) in steps" :key="index" :class="{ active: activeStep >= index }">
						<span class="step-index">{{ index + 1 }}</span>
						<span>{{ step.text }}</span>
					</li>
				</ul>
			</el-header>
			<el-container style="overflow: hidden;flex: 1;">
				<el-container>
					<el-main class="guide-main">
						<!-- 步骤1 -->
						<div class="body step-1" v-if="steps[activeStep].index === 1">
							<div class="title">{{ $t('guide.step_1_title') }}</div>
							<div class="desc">{{ $t('guide.step_1_desc') }}</div>
							<AgentDownloadContent></AgentDownloadContent>
						</div>
						<!-- 步骤2、步骤3 -->
						<div class="body" v-if="[2, 3].includes(steps[activeStep].index)">
							<div class="title">{{ stepMap[steps[activeStep].index].title }}</div>
							<div class="desc">{{ stepMap[steps[activeStep].index].desc }}</div>
							<template v-if="!selectedDatabaseType">
								<el-select
									class="select-connection"
									popper-class="select-connection-popper"
									:value="stepMap[steps[activeStep].index].selectedConnection.id"
									placeholder="Choose a source connection"
									@input="handleConnectionSelect"
								>
									<el-option value="0">
										<div class="select-connection-option">
											<div class="img">
												<i class="el-icon-circle-plus"></i>
											</div>
											<div class="name">{{ stepMap[steps[activeStep].index].btnLabel }}</div>
										</div>
									</el-option>
									<el-option
										v-for="opt in stepMap[steps[activeStep].index].connectionList"
										:key="opt.id"
										:value="opt.id"
										:label="opt.name + ' (' + $t('connection.status.' + opt.status) + ')'"
									>
										<div class="select-connection-option">
											<div class="img">
												<img :src="getImgByType(opt.database_type)" />
											</div>
											<div class="name">
												{{ opt.name }} ({{ $t('connection.status.' + opt.status) }})
											</div>
										</div>
									</el-option>
								</el-select>
								<div class="error-msg">
									{{ errorMsg }}
								</div>
							</template>
							<template v-if="selectedDatabaseType">
								<div class="database-type">
									<div class="img">
										<img :src="getImgByType(selectedDatabaseType)" />
									</div>
									<div class="database-name">{{ typeMap[selectedDatabaseType] }}</div>
									<el-button
										class="btn-change"
										type="text"
										size="mini"
										@click="showConnectDialog = true"
									>
										{{ $t('connection.change') }}
									</el-button>
								</div>
								<FormBuilder
									class="create-form"
									ref="form"
									v-model="connectionForm"
									:config="config"
								></FormBuilder>
								<div class="btn-test">
									<el-button size="mini" @click="startTest()">
										{{ $t('connection.testConnection') }}
									</el-button>
									<span :class="'status ' + status" v-if="status">
										<i class="status-icon el-icon-error"></i>
										<i class="status-icon el-icon-success"></i>
										<i class="status-icon el-icon-warning"></i>
										<span>{{ $t('connection.status.' + status) }}</span>
									</span>
								</div>
							</template>
						</div>
						<!-- 步骤1 -->
						<div class="body step-3" v-if="steps[activeStep].index === 4">
							<div class="title">{{ $t('guide.step_4_title') }}</div>
							<div class="desc">{{ $t('guide.step_4_desc') }}</div>
							<FbRadio class="task-type-radio" v-model="taskType" :config="taskTypeConfig"></FbRadio>
						</div>
					</el-main>
					<el-footer class="guide-footer" height="80px">
						<el-button
							class="btn-step"
							v-if="steps[activeStep].index > 2 || selectedDatabaseType"
							@click="back(selectedDatabaseType)"
						>
							{{ $t('guide.btn_back') }}
						</el-button>
						<el-button
							v-if="steps[activeStep].index !== 4"
							type="primary"
							class="btn-step"
							:loading="loading"
							@click="next()"
						>
							<span v-show="selectedDatabaseType">{{ $t('guide.btn_save') }}</span>
							<span>{{ $t('guide.btn_next') }}</span>
						</el-button>
						<el-button v-else type="primary" class="btn-step" :loading="loading" @click="next()">
							{{ $t('guide.btn_to_dataflow') }}
							<el-button class="btn-pass" type="text" @click="toDashboard()">
								{{ $t('guide.btn_to_dashboard') }}
							</el-button>
						</el-button>
					</el-footer>
				</el-container>
				<el-aside class="right-aside" width="600px">
					<div class="markdown-body" v-html="selectedDatabaseType ? mdHtml : steps[activeStep].md"></div>
				</el-aside>
			</el-container>
		</el-container>
		<DatabaseTypeDialog
			:allwoType="['mysql', 'oracle', 'mongodb']"
			:dialogVisible.sync="showConnectDialog"
			@databaseType="handleDatabaseTypeChange"
		></DatabaseTypeDialog>
		<Test
			ref="test"
			:dialogTestVisible.sync="dialogTestVisible"
			:formData="connectionForm"
			@returnTestData="returnTestData"
		></Test>
	</el-container>
</template>
<script>
import AgentDownloadContent from '@/components/AgentDownloadContent.vue';
import DatabaseTypeDialog from '@/view/connections/DatabaseTypeDialog.vue';
import { signOut } from '../util/util';
import { getImgByType, TYPEMAP } from './connections/util';
import { uuid } from '../editor/util/Schema';
import Test from '../view/connections/Test';

import formConfig from './connections/config';

export default {
	components: {
		AgentDownloadContent,
		DatabaseTypeDialog,
		Test
	},
	data() {
		return {
			loading: false,
			logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
			typeMap: TYPEMAP,
			steps: [],
			activeStep: 0,
			errorMsg: '',
			showConnectDialog: false,
			connectionList: [],
			stepMap: {
				2: {
					title: this.$t('guide.step_2_title'),
					desc: this.$t('guide.step_2_desc'),
					selectedConnection: {},
					connectionList: [],
					btnLabel: this.$t('guide.step_2_btn_label')
				},
				3: {
					title: this.$t('guide.step_3_title'),
					desc: this.$t('guide.step_3_desc'),
					selectedConnection: {},
					connectionList: [],
					btnLabel: this.$t('guide.step_3_btn_label')
				}
			},
			selectedDatabaseType: '',
			connectionForm: {},
			config: {
				form: {
					labelPosition: 'right',
					labelWidth: '200px',
					itemStyle: 'margin-bottom: 16px;',
					size: 'small'
				},
				items: []
			},
			taskType: 'cluster-clone',
			taskTypeConfig: {
				options: [
					{
						label: this.$t('guide.task_type_clone'),
						value: 'cluster-clone',
						tip: this.$t('guide.task_type_clone_tips')
					},
					{
						label: this.$t('guide.task_type_custom'),
						value: 'custom',
						tip: this.$t('guide.task_type_custom_tips')
					}
				]
			},
			dialogTestVisible: false,
			status: '',
			mdHtml: ''
		};
	},
	created() {
		this.getDataApi(this.getSteps);
		this.getConnections();
	},
	methods: {
		getImgByType,
		// 获取Agent是否安装
		getDataApi(cb) {
			if (parseInt(this.$cookie.get('isAdmin')) || localStorage.getItem('BTN_AUTHS') === 'BTN_AUTHS') {
				cb(true);
				return;
			}
			this.loading = true;
			let params = {};
			params['filter[where][systemInfo.username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			this.$api('cluster')
				.get(params)
				.then(res => {
					cb(res.data && res.data.length > 0);
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getConnections() {
			let where = {
				database_type: {
					in: ['mysql', 'oracle', 'mongodb']
				},
				user_id: {
					regexp: `^${this.$cookie.get('user_id')}$`
				}
			};
			let fields = {
				name: true,
				connection_type: true,
				database_type: true,
				status: true,
				id: true
			};
			let filter = {
				order: 'createTime DESC',
				fields: fields,
				where
			};
			this.$api('connections')
				.get({
					filter: JSON.stringify(filter)
				})
				.then(res => {
					if (res.data) {
						let list = res.data || [];
						let sourceList = [];
						let targetList = [];
						list.forEach(it => {
							if (it.connection_type === 'source') {
								sourceList.push(it);
							}
							if (it.connection_type === 'target') {
								targetList.push(it);
							}
						});
						this.stepMap[2].connectionList = sourceList;
						this.stepMap[3].connectionList = targetList;
						this.connectionList = list;
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getSteps(hasDownloadAgent) {
			const steps = [
				{ index: 1, text: this.$t('guide.step_1'), md: require('../../static/md/guide/agent_download.md') },
				{ index: 2, text: this.$t('guide.step_2'), md: require('../../static/md/guide/select_connection.md') },
				{ index: 3, text: this.$t('guide.step_3'), md: require('../../static/md/guide/select_connection.md') },
				{ index: 4, text: this.$t('guide.step_4'), md: require('../../static/md/guide/select_task.md') }
			];
			if (hasDownloadAgent) {
				this.steps = steps.slice(1, 4);
			} else {
				this.steps = steps.concat();
			}
		},
		next() {
			if (this.steps[this.activeStep].index === 1) {
				this.getDataApi(hasDownloadAgent => {
					if (hasDownloadAgent) {
						this.activeStep += 1;
					} else {
						this.$message.error(this.$t('guide.agent_not_install'));
					}
				});
			} else if ([2, 3].includes(this.steps[this.activeStep].index)) {
				if (this.selectedDatabaseType) {
					this.$refs.form.validate(valid => {
						if (valid) {
							this.createConnection();
						}
					});
				} else if (this.stepMap[this.steps[this.activeStep].index].selectedConnection.id) {
					this.activeStep += 1;
				} else {
					let msg = this.$t('guide.not_' + (this.steps[this.activeStep].index === 2 ? 'source' : 'target'));
					this.errorMsg = msg;
				}
			} else {
				this.toDashboard(() => {
					let stages = this.getStages();

					let routeUrl = this.$router.resolve({
						path: '/job',
						query: { mapping: this.taskType }
					});
					let _window = window.open(routeUrl.href, '_blank');
					_window.tpdata = {
						stages,
						status: 'draft',
						executeMode: 'normal'
					};
				});
			}
		},
		toDashboard(cb) {
			this.loading = true;
			this.$api('users')
				.upsertWithWhere(
					{
						id: this.$cookie.get('user_id')
					},
					{
						isCompleteGuide: true
					}
				)
				.then(() => {
					this.$cookie.delete('show_guide');
					this.$router.replace('/');
					cb && cb();
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getTypeProps(connection) {
			let type = connection.database_type;
			if (this.taskType === 'cluster-clone') {
				return {
					type: 'database',
					database_type: type,
					dropTable: false,
					dropType: 'no_drop',
					includeTables: [],
					name: connection.name,
					readBatchSize: 1000,
					readCdcInterval: 500,
					table_prefix: '',
					table_suffix: '',
					syncObjects: [],
					joinTables: undefined
				};
			}
			if (type === 'mongodb') {
				return {
					type: 'collection',
					name: 'Collection'
				};
			} else {
				return {
					type: 'table',
					name: 'Table'
				};
			}
		},
		getStages() {
			let stageDefault = {
				connectionId: '',
				dataQualityTag: false,
				distance: 1,
				freeTransform: false,
				id: '',
				inputLanes: [],
				joinTables: [],
				name: '',
				outputLanes: [],
				type: ''
			};
			let source = this.stepMap[2].selectedConnection;
			let target = this.stepMap[3].selectedConnection;
			let sourceId = uuid();
			let targetId = uuid();
			let stages = [
				Object.assign(
					{},
					stageDefault,
					{
						id: sourceId,
						connectionId: source.id,
						outputLanes: [targetId],
						distance: 1
					},
					this.getTypeProps(source)
				),
				Object.assign(
					{},
					stageDefault,
					{
						id: targetId,
						connectionId: target.id,
						inputLanes: [sourceId],
						distance: 0,
						joinTables: [
							{
								arrayUniqueKey: '',
								connectionId: '',
								isArray: false,
								joinKeys: [{ source: '', target: '' }],
								joinPath: '',
								joinType: 'upsert',
								manyOneUpsert: false,
								stageId: sourceId,
								tableName: ''
							}
						]
					},
					this.getTypeProps(target)
				)
			];
			return stages;
		},
		back(falg) {
			this.errorMsg = '';
			if (falg) {
				this.selectedDatabaseType = null;
			} else {
				this.activeStep -= 1;
			}
		},
		handleConnectionSelect(v) {
			if (v === '0') {
				this.showConnectDialog = true;
			} else {
				this.stepMap[this.steps[this.activeStep].index].selectedConnection = this.connectionList.find(
					c => c.id === v
				);
			}
			this.errorMsg = '';
		},
		handleDatabaseTypeChange(type) {
			this.selectedDatabaseType = type;
			this.showConnectDialog = false;
			this.connectionForm = {};
			this.config.items = [];
			this.$refs.form && this.$refs.form.clearValidate();
			this.getFormConfig();
			this.mdHtml = require(`../../static/md/connection/${type.toLowerCase()}.md`);
		},
		signOut() {
			this.$confirm(this.$t('app.signOutMsg'), this.$t('app.signOut')).then(() => {
				signOut();
			});
		},
		// 按照数据库类型获取表单配置规则
		getFormConfig() {
			let func = formConfig[this.selectedDatabaseType];
			if (func) {
				let config = func(this);
				let items = [
					{
						type: 'input',
						field: 'name',
						label: this.$t('dataForm.form.connectionName'),
						required: true,
						maxlength: 100,
						showWordLimit: true
					}
				];
				let model = {
					name: '',
					database_port: ''
				};
				if (this.steps[this.activeStep].index === 2) {
					model.connection_type = 'source';
				} else {
					model.connection_type = 'target';
				}
				config.items.forEach(it => {
					if (
						((it.rules && it.rules.some(r => r.required === true)) ||
							it.required ||
							['isUrl', 'database_username', 'database_password', 'plain_password'].includes(it.field)) &&
						it.field !== 'connection_type'
					) {
						items.push(it);
						model[it.field] = it.field === 'isUrl' ? true : '';
					}
				});
				this.config.items = items;
				this.connectionForm = model;
			}
		},
		createConnection() {
			let params = Object.assign({}, this.connectionForm, {
				database_type: this.selectedDatabaseType,
				user_id: this.$cookie.get('user_id'),
				status: 'testing',
				schema: {},
				retry: 0,
				nextRetry: null,
				response_body: {},
				project: '',
				listtags: []
			});

			if (params.database_type === 'mongodb') {
				params.fill = params.isUrl ? 'uri' : '';
				delete params.isUrl;
			}
			this.loading = true;
			this.$api('connections')
				.post(params)
				.then(res => {
					let connection = res.data || {};
					this.stepMap[this.steps[this.activeStep].index].selectedConnection = connection;
					this.selectedDatabaseType = null;
					this.activeStep += 1;
					this.errorMsg = '';

					this.getConnections();
					// this.test(id);
				})
				.catch(err => {
					if (err && err.response) {
						if (err.response.msg.indexOf('duplication for names') > -1) {
							this.$message.error(this.$t('dataForm.error.connectionNameExist'));
						} else if (err.response.msg.indexOf('duplicate source') > -1) {
							// this.connectionObj.name = err.response.data.name;
							// this.connectionObj.id = err.response.data.id;
							// this.repeatDialogVisible = true;
							this.$message.error(this.$t('dataForm.error.duplicateSource'));
						} else {
							this.$message.error(err.response.msg);
						}
					} else {
						this.$message.error(this.$t('dataForm.saveFail'));
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		startTest() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.dialogTestVisible = true;
					this.$refs.test.start();
				}
			});
		},
		returnTestData(data) {
			if (!data.status || data.status === null) return;
			this.status = data.status;
		}
	}
};
</script>
<style lang="less">
.select-connection-popper {
	.el-select-dropdown__item {
		height: 64px;
		padding: 10px;
	}
	.select-connection-option {
		display: flex;
		align-items: center;
		.img {
			padding: 6px;
			width: 44px;
			height: 44px;
			line-height: 32px;
			border: 1px solid #dedee4;
			border-radius: 3px;
			box-sizing: border-box;
			text-align: center;
			color: #999;
			img {
				display: block;
				width: 100%;
				height: 100%;
			}
		}
		.name {
			margin-left: 10px;
		}
	}
}
</style>
<style lang="less" scoped>
.guide-wrap {
	height: 100%;
	background: rgba(250, 250, 250, 1);
	.guide-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 7px;
		background: rgba(54, 54, 54, 1);
		.logo {
			margin-left: 8px;
			display: block;
			width: 99px;
			img {
				display: block;
				height: 100%;
				width: 100%;
				object-fit: contain;
			}
		}
	}
	.step-header {
		padding-right: 600px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #fff;
		border-bottom: 1px solid #dedee4;
		color: rgba(102, 102, 102, 100);
		font-size: 12px;
		.step-box {
			margin-left: 20px;
			display: flex;
			align-items: center;
			li + li {
				margin-left: 54px;
				&::before {
					content: '';
					position: absolute;
					top: 10px;
					left: -42px;
					height: 1px;
					width: 30px;
					background: #bbb;
				}
			}
			li {
				position: relative;
				display: flex;
				align-items: center;
				&.active {
					color: #48b6e2;
					&::before {
						background: #48b6e2;
					}
					.step-index {
						border-color: #fff;
						background: #48b6e2;
						color: #fff;
					}
				}
				.step-index {
					margin-right: 7px;
					width: 20px;
					height: 20px;
					line-height: 20px;
					text-align: center;
					border: 1px solid #aaa;
					border-radius: 50%;
					font-family: Roboto;
					font-weight: bold;
					box-sizing: border-box;
				}
			}
		}
	}
	.right-aside {
		background: #fafafa;
		border-left: 1px solid #dedee4;
	}
	.guide-main {
		background: #fff;
		overflow: auto;
		.body {
			margin: 0 auto;
			padding-bottom: 50px;
			width: 850px;
			.title {
				padding: 20px 200px;
				color: rgba(51, 51, 51, 100);
				font-size: 28px;
				font-weight: bold;
				text-align: left;
			}
			.desc {
				padding: 0 200px;
				margin-bottom: 20px;
				color: #999;
				font-size: 12px;
			}
		}
	}
	.guide-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		border-top: 1px solid #dedee4;
	}
	.btn-step {
		width: 212px;
		position: relative;
		.btn-pass {
			position: absolute;
			top: 50%;
			right: -20px;
			transform: translate(100%, -50%);
		}
	}
	.btn-step + .btn-step {
		margin-left: 32px;
	}
	.select-connection {
		display: block;
		width: 450px;
		margin: 0 200px;
	}
	.database-type {
		padding: 0 200px;
		display: flex;
		align-items: center;
		.img {
			padding: 10px;
			width: 54px;
			height: 54px;
			border: 1px solid #dedee4;
			box-sizing: border-box;
			img {
				display: block;
				width: 100%;
				height: 100%;
			}
		}
		.database-name {
			margin-left: 15px;
			font-size: 28px;
		}
		.btn-change {
			margin-top: 10px;
			margin-left: 15px;
		}
	}
	.create-form {
		margin-top: 20px;
		padding-right: 200px;
	}
	.btn-test {
		padding-left: 200px;
		.status {
			margin-left: 10px;
			font-size: 12px;
			&.invalid {
				color: #f56c6c;
				.el-icon-error {
					display: inline-block;
				}
			}
			&.ready {
				color: #67c23a;
				.el-icon-success {
					display: inline-block;
				}
			}
			&.testing {
				color: #e6a23c;
				.el-icon-warning {
					display: inline-block;
				}
			}
			.status-icon {
				display: none;
			}
		}
	}
	.error-msg {
		padding: 0 200px;
		line-height: 26px;
		color: rgba(238, 83, 83, 100);
		font-size: 14px;
	}
	.task-type-radio {
		padding: 0 200px;
		box-sizing: border-box;
	}
	.step-1 {
		.os-buttons {
			margin-top: 66px;
			display: flex;
			justify-content: space-between;
			.el-button {
				position: relative;
				width: 260px;
				font-family: Roboto;
				&.active {
					color: #48b6e2;
					border-color: #c8e9f6;
					background-color: #edf8fc;
				}
				i {
					position: absolute;
					left: 19px;
					top: 9px;
					font-size: 19px;
				}
			}
		}
	}
}
</style>
