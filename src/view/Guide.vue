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
				<span>新用户引导</span>
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
						<div class="body step-1" v-show="steps[activeStep].index === 1">
							<div class="title">Agent下载与安装</div>
							<div class="desc">
								Tapdata DFS云版需要先在本地安装agent以确保连接数据库和数据传输服务的正常运行,
								您可以根据要安装服务器的类型在下方选择相应的类型进行下载安装
							</div>
							<AgentDownloadContent></AgentDownloadContent>
						</div>
						<!-- 步骤2 -->
						<div class="body step-2" v-show="steps[activeStep].index === 2">
							<div class="title">创建数据源连接</div>
							<div class="desc">
								数据源连接指的是可以作为源的数据库、file、GridFS、REST API等类型的数据连接,
								必须先创建数据源才能创建迁移或同步任务
							</div>
							<template v-if="!selectedDatabaseType">
								<el-select
									class="select-connection"
									:value="sourceConnection"
									placeholder="Choose a source connection"
									@input="v => (v === '0' ? (showConnectDialog = true) : (sourceConnection = v))"
								>
									<el-option value="0">
										<span>
											<i class="el-icon-circle-plus"></i>
										</span>
										<span>创建新的源连接</span>
									</el-option>
									<el-option v-for="opt in connectionOptions" :key="opt.id" :value="opt.id">
										{{ opt.name }} ({{ $t('connection.status.' + opt.status) }})
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
								<form-builder
									class="create-form"
									ref="form"
									v-model="connectionForm"
									:config="config"
								></form-builder>
							</template>
						</div>
						<!-- 步骤3 -->
						<div class="body step-2" v-show="steps[activeStep].index === 3">
							<div class="title">创建目标连接</div>
							<div class="desc">
								目标连接指的是可以作为数据传输目标的数据库、file、GridFS、REST API等类型的连接,
								必须先创建目标连接才能创建迁移或同步任务
							</div>
						</div>
					</el-main>
					<el-footer class="guide-footer" height="80px">
						<el-button
							class="btn-step"
							v-if="steps[activeStep].index > 2 || selectedDatabaseType"
							@click="back(selectedDatabaseType)"
						>
							上一步
						</el-button>
						<el-button type="primary" class="btn-step" :loading="loading" @click="next()">
							<span v-show="selectedDatabaseType">保存，</span>
							<span>下一步</span>
						</el-button>
					</el-footer>
				</el-container>
				<el-aside class="right-aside" width="600px">111</el-aside>
			</el-container>
		</el-container>
		<DatabaseTypeDialog
			:allwoOtherType="false"
			:dialogVisible.sync="showConnectDialog"
			@databaseType="handlerDatabaseTypeChange"
		></DatabaseTypeDialog>
	</el-container>
</template>
<script>
import AgentDownloadContent from '@/components/AgentDownloadContent.vue';
import DatabaseTypeDialog from '@/view/connections/DatabaseTypeDialog.vue';
import { signOut } from '../util/util';
import { getImgByType, TYPEMAP } from './connections/util';

import formConfig from './connections/config';

const steps = [
	{ index: 1, text: 'Agent下载与安装' },
	{ index: 2, text: '设置数据源' },
	{ index: 3, text: '设置目标' },
	{ index: 4, text: '选择任务类型，开启数据传输之旅' }
];
export default {
	components: {
		AgentDownloadContent,
		DatabaseTypeDialog
	},
	data() {
		return {
			loading: false,
			logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
			typeMap: TYPEMAP,
			steps: [],
			activeStep: 0,
			sourceConnection: null,
			errorMsg: '',
			showConnectDialog: false,
			connectionOptions: [],
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
			}
		};
	},
	created() {
		this.getDataApi(this.getSteps);
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
					in: window.getSettingByKey('ALLOW_CONNECTION_TYPE')
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
						this.connectionOptions = res.data || [];
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		getSteps(hasDownloadAgent) {
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
						this.$message.error('系统检测到 Agent 并未安装, 请下载安装后重试');
					}
				});
			}
			if (this.steps[this.activeStep].index === 2) {
				if (this.sourceConnection) {
					this.activeStep += 1;
				} else if (this.selectedDatabaseType) {
					this.$refs.form.validate(valid => {
						if (valid) {
							this.createConnection();
						}
					});
				} else {
					this.errorMsg = 'Please choose a source type';
				}
			} else {
				this.activeStep += 1;
			}
		},
		back(falg) {
			if (falg) {
				this.selectedDatabaseType = null;
			} else {
				this.activeStep -= 1;
			}
		},
		handlerDatabaseTypeChange(type) {
			this.selectedDatabaseType = type;
			this.showConnectDialog = false;
			this.connectionForm = {};
			this.config.items = [];
			this.$refs.form && this.$refs.form.clearValidate();
			this.getFormConfig();
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
			this.$api('connections')
				.post(params)
				.then(res => {
					let id = res.data.id;
					this.sourceConnection = id;
					this.selectedDatabaseType = null;
					this.activeStep += 1;
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
				});
		}
	}
};
</script>
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
				color: rgba(102, 102, 102, 100);
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
		width: 250px;
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
	.error-msg {
		line-height: 26px;
		color: rgba(238, 83, 83, 100);
		font-size: 14px;
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
