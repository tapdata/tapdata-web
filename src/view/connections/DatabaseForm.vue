<template>
	<div class="databaseFrom">
		<header class="header">
			{{ $route.query.id ? $t('connection.editDataSource') : $t('connection.createNewDataSource') }}
		</header>
		<div class="databaseFrom-body">
			<main class="databaseFrom-main">
				<header v-if="$route.query.id" class="edit-header-box">
					<div class="edit-header">
						<div class="img-box">
							<img :src="getImgByType(databaseType)" />
						</div>
						<div class="content">{{ model.name }}</div>
						<div class="addBtn" @click="dialogEditNameVisible = true">
							{{ $t('connection.rename') }}
						</div>
					</div>
				</header>
				<header class="edit-header-box" v-else>
					<div class="edit-header">
						<div class="img-box">
							<img :src="getImgByType(databaseType)" />
						</div>
						<div class="content-box">
							<div class="content">
								{{ typeMap[databaseType] }}
								<div class="addBtn" @click="dialogDatabaseTypeVisible = true">
									{{ $t('connection.change') }}
								</div>
							</div>
							<div class="tip">
								{{ $t('dataForm.form.guide') }}
								<a style="color: #48B6E2" href="https://docs.tapdata.net/data-source">{{
									$t('dataForm.form.guideDoc')
								}}</a>
							</div>
						</div>
					</div>
				</header>
				<div class="form-wrap">
					<div class="form">
						<form-builder ref="form" v-model="model" :config="config">
							<div
								class="url-tip"
								slot="urlTip"
								v-if="model.isUrl"
								v-html="$t('dataForm.form.uriTips.content')"
							></div>
							<div class="url-tip" slot="tableFilter">{{ $t('dataForm.form.tableFilterTips') }}</div>
							<div class="url-tip" slot="timezone">
								{{ $t('dataForm.form.timeZoneTips') }}
							</div>
							<div class="url-tip" slot="fileUrl"></div>
						</form-builder>
						<!-- 文件数据库 -->
						<template v-if="model.database_type === 'file' && model.connection_type === 'source'">
							<div class="fileBox">
								<div class="file-label">{{ $t('dataForm.form.file.fileUrl') }}</div>
								<div class="file-form-content">
									<el-form
										:model="model"
										ref="fileForm"
										label-width="100px"
										class="demo-ruleForm"
										label-position="top"
										:inline-message="true"
									>
										<el-row
											type="flex"
											:gutter="20"
											class="loopFrom"
											v-for="(item, index) in model.file_sources"
											:key="index"
										>
											<el-col :span="24" class="fromLoopBox">
												<el-form-item
													required
													:label="$t('dataForm.form.file.path')"
													:prop="'file_sources.' + index + '.path'"
													:rules="{
														required: true,
														message: $t('dataForm.form.file.fileNone'),
														trigger: 'blur'
													}"
												>
													<el-input
														v-model="item.path"
														size="mini"
														:placeholder="$t('dataForm.form.file.pathPlaceholder')"
													></el-input>
												</el-form-item>
												<el-form-item :label="$t('dataForm.form.file.recursive')" prop="path">
													<el-switch v-model="item.recursive"></el-switch>
												</el-form-item>
												<el-form-item :label="$t('dataForm.form.file.csvFijlter')">
													<el-select
														v-model="item.selectFileType"
														size="mini"
														style="width: 100%;"
														@change="changeFileInclude(item, item.selectFileType)"
													>
														<el-option
															:label="$t('dataForm.form.file.include_filename')"
															value="include"
														></el-option>
														<el-option
															:label="$t('dataForm.form.file.exclude_filename')"
															value="exclude"
														></el-option>
													</el-select>
												</el-form-item>
												<el-form-item v-if="item.selectFileType === 'include'">
													<el-input
														v-model="item.include_filename"
														size="mini"
														:placeholder="$t('dataForm.form.file.includePlaceholder')"
													></el-input>
												</el-form-item>
												<el-form-item v-else>
													<el-input
														v-model="item.exclude_filename"
														size="mini"
														:placeholder="$t('dataForm.form.file.excludePlaceholder')"
													></el-input>
												</el-form-item>
												<p style="font-size: 12px; color: #666;">
													{{ $t('dataForm.form.file.viewExpression') }}
												</p>
											</el-col>
											<el-col :span="2" style="margin-right: -40px;">
												<el-button plain style="padding: 0;" @click="removeRow(item, index)">
													<i class="iconfont icon-quxiao remove"></i>
												</el-button>
											</el-col>
										</el-row>
										<el-button type="text" style="padding: 0;" @click="addPathRow()">
											{{ $t('dataForm.form.file.addPath') }}
										</el-button>
									</el-form>
								</div>
							</div>
						</template>

						<el-button size="mini" class="test" @click="startTest()">{{
							$t('connection.testConnection')
						}}</el-button>
						<span class="status">
							<span class="error" v-if="['invalid'].includes(status)">
								<i class="el-icon-error"></i>
								<span>
									{{ $t('connection.status.invalid') }}
								</span>
							</span>
							<span class="success" v-if="['ready'].includes(status)">
								<i class="el-icon-success"></i>
								<span>
									{{ $t('connection.status.ready') }}
								</span>
							</span>
							<span class="warning" v-if="['testing'].includes(status)">
								<i class="el-icon-warning"></i>
								<span>
									{{ $t('connection.status.testing') }}
								</span>
							</span>
						</span>
					</div>
				</div>
				<footer slot="footer" class="footer">
					<div class="footer-btn">
						<el-button size="mini" @click="goBack()">{{ $t('dataForm.cancel') }}</el-button>
						<el-button size="mini" type="primary" :loading="submitBtnLoading" @click="submit">
							{{ $t('dataForm.submit') }}
						</el-button>
					</div>
				</footer>
			</main>
			<gitbook></gitbook>
		</div>
		<Test
			ref="test"
			:dialogTestVisible.sync="dialogTestVisible"
			:formData="model"
			@returnTestData="returnTestData"
		></Test>
		<DatabaseTypeDialog
			:dialogVisible.sync="dialogDatabaseTypeVisible"
			@databaseType="handleDatabaseType"
		></DatabaseTypeDialog>
		<el-dialog
			:title="$t('connection.rename')"
			:close-on-click-modal="false"
			:visible.sync="dialogEditNameVisible"
			width="30%"
		>
			<span>
				<el-input v-model="rename" maxlength="100" show-word-limit clearable></el-input>
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleCancelRename" size="mini">{{ $t('dataForm.cancel') }}</el-button>
				<el-button @click="submitEdit()" size="mini" type="primary" :loading="editBtnLoading">{{
					$t('message.confirm')
				}}</el-button>
			</span>
		</el-dialog>
		<!-- <el-dialog
			:title="$t('dataForm.dialogTitle')"
			:close-on-click-modal="false"
			:visible.sync="repeatDialogVisible"
			width="30%"
		>
			<p>
				{{ $t('dataForm.error.sourceNameExist') }}
				<span @click="clickLinkSource" style="color:#48B6E2;cursor: pointer">
					{{ connectionObj.name }}</span
				>
				{{ $t('dataForm.error.noCreate') }}
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="repeatDialogVisible = false">{{ $t('dataForm.close') }}</el-button>
			</span>
		</el-dialog> -->
	</div>
</template>

<script>
import factory from '@/api/factory';
import formConfig from './config';
import gitbook from './GitBook';
import Test from './Test';
import { getImgByType, TYPEMAP } from './util';
import DatabaseTypeDialog from './DatabaseTypeDialog';

const databaseTypesModel = factory('DatabaseTypes');
const connectionsModel = factory('connections');
let defaultConfig = [];
const defaultModel = {
	id: '',
	name: '',
	database_type: '',
	connection_type: '',
	database_host: '',
	database_port: '',
	database_name: '',
	database_username: '',
	database_password: '',
	plain_password: '',
	table_filter: '',
	additionalString: '',
	thin_type: '',
	database_owner: '',
	node_name: '',
	database_schema: '',
	plugin_name: '',
	pgsql_log_decorder_plugin_name: '',
	database_datetype_without_timezone: '',
	supportUpdatePk: false,

	isUrl: true,
	database_uri: '',
	ssl: false,
	sslKey: '',
	sslPass: '',
	schemaAutoUpdate: false,
	sslValidate: false,
	sslCA: '',
	sslCAFile: null,
	sslKeyFile: null,

	ftp_passive: true, // 连接方式
	connection_timeout_seconds: 60, //连接超时时间
	data_timeout_seconds: 60, //传输超时时间
	fileDefaultCharset: '', // 编码格式
	file_upload_chunk_size: 261120, //文件上传文件块大小
	file_upload_mode: '', //文件上传模式
	overwriteSetting: '', //当同名文件存在时
	extendSourcePath: false, // 继承目录结构
	outputPath: '', // 文件输出绝对路径
	file_source_protocol: '', //协议类型
	vc_mode: '', // 版本管理
	file_sources: [
		{
			path: '',
			recursive: false,
			selectFileType: 'include',
			include_filename: '',
			exclude_filename: ''
		}
	]
};

export default {
	name: 'DatabaseForm',
	components: { gitbook, Test, DatabaseTypeDialog },
	data() {
		return {
			// modelForm: {},
			rules: [],
			visible: false,
			timezones: [],
			dataTypes: [],
			whiteList: ['mysql', 'oracle', 'mongodb', 'sqlserver', 'postgres', 'elasticsearch', 'redis', 'file'], //目前白名单,
			model: Object.assign({}, defaultModel),
			config: {
				items: []
			},
			checkItems: null,
			databaseType: '',
			typeMap: TYPEMAP,
			timer: null,
			status: '',
			dialogTestVisible: false,
			dialogDatabaseTypeVisible: false,
			dialogEditNameVisible: false,
			submitBtnLoading: false,
			editBtnLoading: false,
			connectionTypeOption: '',
			isUrlOption: '',
			rename: ''
			// repeatDialogVisible: false,
			// connectionObj: {
			// 	name: '',
			// 	id: ''
			// }
		};
	},
	created() {
		this.databaseType = this.$route.query.databaseType;
		this.getDT(this.databaseType);
		this.initTimezones();
		let self = this;
		defaultConfig = [
			{
				type: 'input',
				field: 'name',
				label: self.$t('dataForm.form.connectionName'),
				required: true,
				maxlength: 100,
				showWordLimit: true,
				show: true
			}
		];
	},
	watch: {
		// 文件选中类型默认端口号
		'model.file_source_protocol'(val) {
			if (val === 'smb') {
				this.model.database_port = '445';
			} else if (val === 'ftp') {
				this.model.database_port = '21';
			}
		}
	},
	methods: {
		getImgByType,
		async initData(data) {
			let editData = null;
			this.checkTestConnectionAvailable(); //先检测agent
			if (this.$route.query.id) {
				if (this.model.database_type === 'mongodb') {
					editData = await this.$api('connections').customQuery([this.$route.query.id]);
				} else {
					editData = await this.$api('connections').get([this.$route.query.id]);
				}
				this.model = Object.assign(this.model, editData.data);
				this.rename = this.model.name;
			} else this.model = Object.assign(this.model, data, { name: this.model.name });

			if (this.model.database_type === 'file' && this.model.file_sources) {
				this.model.file_sources.forEach(item => {
					if (item.exclude_filename) {
						this.$set(item, 'selectFileType', 'exclude');
					} else {
						this.$set(item, 'selectFileType', 'include');
					}
				});
			}
		},
		checkDataTypeOptions(type) {
			this.model.database_type = type;
			this.getFormConfig();
		},
		initTimezones() {
			let timezones = [{ label: '(Database Timezone)', value: '' }];

			for (let i = -11; i < 15; i++) {
				let timezone = '';
				if (i >= -9 && i <= 9) {
					timezone = '0' + Math.abs(i);
				} else {
					timezone = Math.abs(i);
				}
				timezone += ':00';

				if (i < 0) {
					timezone = '-' + timezone;
				} else {
					timezone = '+' + timezone;
				}

				timezones.push({ label: timezone, value: timezone });
			}
			this.timezones = timezones;
		},
		// 获取数据库类型列表
		async getDT(type) {
			let result = await databaseTypesModel.get();
			if (result.data) {
				let options = result.data.map(dt => {
					return { label: dt.name, value: dt.type };
				});
				this.dataTypes = options;
				this.checkDataTypeOptions(type);
			}
		},
		// 按照数据库类型获取表单配置规则
		getFormConfig() {
			let func = formConfig[this.model.database_type];
			if (func) {
				let config = func(this);
				let items = defaultConfig.concat(config.items);
				let item = items.find(it => it.field === 'database_datetype_without_timezone');
				if (item) {
					item.options = this.timezones;
				}
				let itemIsUrl = items.find(it => it.field === 'isUrl');
				if (this.model.database_type === 'mongodb' && this.$route.query.id && itemIsUrl) {
					itemIsUrl.options[0].disabled = true;
					this.model.isUrl = false;
				}
				if (this.$route.query.id) {
					//编辑模式下 不展示
					defaultConfig[0].show = false;
					defaultConfig[0].required = false;
				}
				this.config.form = config.form;
				this.config.items = items;
				this.initData(
					Object.assign(defaultModel, config.defaultModel, { database_type: this.model.database_type })
				); //切换类型会后初始化数据
				this.checkItems = config.checkItems; //根据model变化更新表单项显示或隐藏
				this.checkItems && this.checkItems();
			}
		},
		handleTestVisible() {
			this.dialogTestVisible = false;
		},
		goBack() {
			this.$router.push('/connections');
		},
		submit() {
			this.submitBtnLoading = true;
			let falg = false;
			if (this.model.database_type === 'file' && this.model.connection_type === 'source') {
				this.$refs.fileForm.validate(valid => {
					if (!valid) {
						falg = true;
					}
				});
			}

			this.$refs.form.validate(valid => {
				if (valid && !falg) {
					let params = Object.assign(
						{},
						{
							sslCert: this.model.sslKey,
							// user_id: this.$cookie.get('user_id'),
							status: 'testing',
							schema: {},
							retry: 0,
							nextRetry: null,
							response_body: {},
							project: '',
							submit: true
						},
						this.model
					);
					delete params.sslKeyFile;
					delete params.sslCAFile;
					delete params.status; //编辑的情况下不传status
					if (!params.id) {
						delete params.id;
					}
					if (!params.id) {
						params['status'] = this.status ? this.status : 'testing'; //默认值 0 代表没有点击过测试
					}
					if (params.database_type === 'mongodb') {
						params.fill = params.isUrl ? 'uri' : '';
						delete params.isUrl;
					}

					if (params.database_type !== 'file') {
						delete params.file_sources;
						delete params.fileDefaultCharset;
						delete params.file_upload_chunk_size;
						delete params.file_upload_mode;
						delete params.overwriteSetting;
						delete params.extendSourcePath;
						delete params.outputPath;
						delete params.file_source_protocol;
						delete params.vc_mode;
					}

					connectionsModel[this.model.id ? 'patchId' : 'post'](params)
						.then(res => {
							let id = res.data.id;
							this.model.id = id;
							this.$message.success(this.$t('message.saveOK'));
							this.goBack();
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
								this.$message.error(this.$t('message.saveFail'));
							}
						})
						.finally(() => {
							this.submitBtnLoading = false;
						});
				} else {
					this.submitBtnLoading = false;
				}
			});
		},
		//开始测试
		async startTest() {
			let result = await this.$api('Workers').getAvailableAgent();
			if (!result.data.result || result.data.result.length === 0) {
				this.$message.error(this.$t('dataForm.form.agentMsg'));
			} else {
				this.$refs.form.validate(valid => {
					if (valid) {
						this.dialogTestVisible = true;
						if (this.$route.query.id) {
							//编辑需要特殊标识 updateSchema = false editTest = true
							this.$refs.test.start(false, true);
						} else {
							this.$refs.test.start(false);
						}
					}
				});
			}
		},
		returnTestData(data) {
			if (!data.status || data.status === null) return;
			this.status = data.status;
		},
		//取消
		handleCancelRename() {
			this.dialogEditNameVisible = false;
			this.rename = this.model.name;
		},
		//保存名字
		submitEdit() {
			this.editBtnLoading = true;
			if (this.rename === '') {
				this.rename = this.model.name;
				this.$message.error(this.$t('dataForm.form.connectionName') + this.$t('formBuilder.noneText'));
				return;
			}
			this.model.name = this.rename;
			let params = {
				name: this.model.name,
				id: this.model.id
			};
			this.$api('connections')
				.patchId(params)
				.then(() => {
					this.editBtnLoading = false;
					this.$message.success(this.$t('message.saveOK'));
					this.dialogEditNameVisible = false;
				})
				.catch(err => {
					this.editBtnLoading = false;
					if (err && err.response) {
						if (err.response.msg.indexOf('duplication for names') > -1) {
							this.$message.error(this.$t('dataForm.error.connectionNameExist'));
						} else {
							this.$message.error(err.response.msg);
						}
					} else {
						this.$message.error(this.$t('dataForm.saveFail'));
					}
				});
		},
		// 跳转到重复数据源
		clickLinkSource() {
			window.open('/#/connection/' + this.connectionObj.id, '_blank');
		},
		//检测agent 是否可用
		async checkTestConnectionAvailable() {
			let result = await this.$api('Workers').getAvailableAgent();
			if (!result.data.result || result.data.result.length === 0) {
				this.$message.error(this.$t('dataForm.form.agentMsg'));
			}
		},
		handleDatabaseType(type) {
			this.dialogDatabaseTypeVisible = false;
			if (this.whiteList.includes(type)) {
				this.$router.push({
					path: '/connections/create',
					query: {
						databaseType: type
					}
				});
				location.reload();
			} else {
				top.location.href = '/#/connection';
				localStorage.setItem('connectionDatabaseType', type);
			}
		},
		// 文件类型添加文件路径
		addPathRow() {
			let list = {
				path: '',
				recursive: false,
				selectFileType: 'include',
				include_filename: '',
				exclude_filename: ''
			};
			this.model.file_sources.push(list);
		},

		// 文件类型删除文件路径
		removeRow(item, index) {
			// this.index = this.model.file_sources.indexOf(item);
			if (this.model.file_sources.length > 1) {
				if (index !== -1) {
					this.model.file_sources.splice(index, 1);
				}
			}
		},

		// 文件保留丢弃字段
		changeFileInclude(item, val) {
			val === 'include' ? (item.exclude_filename = '') : (item.include_filename = '');
		}
	}
};
</script>

<style scoped lang="less">
.databaseFrom {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
	.databaseFrom-body {
		display: flex;
		flex: 1;
		overflow: hidden;
		.databaseFrom-main {
			display: flex;
			flex: 1;
			flex-direction: column;
			.form-wrap {
				display: flex;
				overflow-y: auto;
			}
			.form {
				padding: 0 20px;
				width: 640px;
				margin: 0 auto;
				padding-right: 200px;
				.url-tip {
					font-size: 12px;
					color: #999;
					line-height: 18px;
				}
				.fileBox {
					display: flex;
					flex: 1;
					div.file-label {
						width: 210px;
						padding-right: 20px;
						line-height: 28px;
						font-size: 12px;
						color: #606266;
						text-align: right;
						box-sizing: border-box;
					}
					.file-form-content {
						width: calc(100% - 200px);
						padding: 0 10px;
					}
					.fromLoopBox {
						padding: 10px 20px 20px !important;
						margin-bottom: 12px;
						box-sizing: border-box;
						background-color: #fff;
						border: 1px solid #dedee4;
						border-radius: 3px;
						.el-input--mini .el-input__inner {
							width: 100%;
						}
					}
				}
			}
			.edit-header-box {
				border-bottom: 1px solid #eee;
				padding-bottom: 20px;
				margin-bottom: 20px;
			}
			.edit-header {
				display: flex;
				justify-content: flex-start;
				width: 578px;
				margin: 0 auto;
				margin-top: 40px;
			}
			.title {
				display: flex;
				justify-content: flex-start;
				width: 568px;
				margin: 40px auto 20px auto;
			}
			.img-box {
				display: flex;
				width: 52px;
				height: 52px;
				justify-content: center;
				align-items: center;
				background: #fff;
				border-radius: 3px;
				margin-right: 10px;
				img {
					width: 100%;
				}
			}
			.content {
				display: flex;
				align-items: center;
				margin-left: 15px;
				font-size: 22px;
				max-width: 445px;
				white-space: nowrap;
				word-break: break-word;
				text-overflow: ellipsis;
				overflow: hidden;
			}
			.addBtn {
				color: #48b6e2;
				cursor: pointer;
				font-size: 12px;
				margin-top: 22px;
				margin-left: 10px;
			}
			.content-box {
				.addBtn {
					color: #48b6e2;
					cursor: pointer;
					font-size: 12px;
					margin-top: 0;
					margin-left: 10px;
				}
				.tip {
					margin-left: 15px;
					font-size: 12px;
					color: #999;
					margin-top: 5px;
					line-height: 18px;
					width: 430px;
				}
			}
			.test {
				margin-left: 200px;
				margin-bottom: 20px;
				margin-top: 16px;
				background: #fafafa;
			}
		}
		.status {
			font-size: 12px;
			margin-top: 2px;
			.error {
				color: #f56c6c;
			}
			.success {
				color: #67c23a;
			}
			.warning {
				color: #e6a23c;
			}
		}
	}
	.header {
		height: 50px;
		line-height: 50px;
		padding-left: 20px;
		background-color: rgba(250, 250, 250, 100);
		color: rgba(51, 51, 51, 100);
		font-size: 18px;
		text-align: left;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(222, 222, 228, 100);
		border-left: none;
		position: relative;
	}
	.footer {
		height: 62px;
		background-color: #fff;
		margin: 10px auto;
		border-left: none;
		line-height: 62px;
		.footer-btn {
			width: 450px;
			display: flex;
			border-top: 1px solid #dedee4;
			align-items: center;
			justify-content: flex-end;
			padding-top: 18px;
		}
		button {
			width: 140px;
			height: 32px;
			margin-left: 20px;
		}
	}
}
</style>
<style lang="less">
.databaseFrom .el-form--label-right .el-form-item {
	.el-form-item__label .e-form-builder-item-label {
		float: right;
	}
	margin-top: 16px;
}
.databaseFrom .el-form--label-right .el-form-item {
	.el-form-item__label {
		display: inline-block;
		padding: 0 20px 0 0;
	}
}
.databaseFrom .form {
	.url-tip {
		margin-top: -14px;
		b {
			color: #666;
		}
	}
	.file-form-content {
		.el-form-item {
			margin-bottom: 6px;
		}
		.el-form-item__label {
			padding-bottom: 0;
			line-height: 28px;
			font-size: 12px;
		}
		.el-form-item__content {
			line-height: 30px;
		}
	}
}
</style>
