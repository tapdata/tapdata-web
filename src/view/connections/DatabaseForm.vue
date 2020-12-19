<template>
	<div class="databaseFrom">
		<header class="header">
			{{ $route.query.id ? $t('connection.editDataSource') : $t('connection.createNewDataSource') }}
		</header>
		<div class="databaseFrom-body">
			<main class="databaseFrom-main">
				<div class="title">
					<div class="img-box">
						<img :src="getImgByType(databaseType)" />
					</div>
					<div class="content">{{ typeMap[databaseType] }}</div>
				</div>
				<div class="form"><form-builder ref="form" v-model="model" :config="config"></form-builder></div>
			</main>
			<gitbook></gitbook>
		</div>
		<footer slot="footer" class="footer">
			<el-button size="mini" type="primary" :loading="testing" @click="submit">
				{{ $t('dataForm.submit') }}
			</el-button>
			<el-button size="mini" @click="goBack()">{{ $t('dataForm.cancel') }}</el-button>
		</footer>
		<Test
			@dialogTestVisible="handleTestVisible"
			:dialogTestVisible="testData.dialogTestVisible"
			:testData="testData"
		></Test>
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
import { getImgByType, TYPEMAP, handleProgress } from './util';

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
	sslKeyFile: null
};

export default {
	name: 'DatabaseForm',
	components: { gitbook, Test },
	data() {
		return {
			visible: false,
			testing: false,
			timezones: [],
			dataTypes: [],
			whiteList: ['mysql', 'oracle', 'mongodb', 'sqlserver', 'db2', 'postgres', 'elasticsearch'], //目前白名单,
			model: Object.assign({}, defaultModel),
			config: {
				items: []
			},
			checkItems: null,
			databaseType: '',
			typeMap: TYPEMAP,
			timer: null,
			status: {
				ready: 'success',
				invalid: 'exception',
				testing: 'warning'
			},
			testData: {
				testLogs: null,
				testResult: '',
				progress: 0,
				dialogTestVisible: false
			}
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
				showWordLimit: true
			}
		];
	},
	beforeDestroy() {
		this.clearInterval();
	},
	destroyed() {
		this.clearInterval();
	},
	methods: {
		getImgByType,
		async initData(data) {
			let editData = null;
			if (this.$route.query.id) {
				if (this.model.database_type === 'mongodb') {
					editData = await this.$api('connections').customQuery([this.$route.query.id]);
				} else {
					editData = await this.$api('connections').get([this.$route.query.id]);
				}
				this.model = Object.assign(this.model, editData.data);
			} else this.model = Object.assign(this.model, data, { name: this.model.name });
		},
		clearInterval() {
			// 清除定时器
			clearInterval(this.timer);
			this.timer = null;
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
					itemIsUrl.disabled = true;
					this.model.isUrl = false;
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
			this.testData.dialogTestVisible = false;
			this.testData.progress = 0;
			this.testData.testResult = this.status['testing'];
		},
		goBack() {
			this.$router.push('/connections');
		},
		async test(id) {
			this.clearInterval();
			this.testData.testResult = this.status['testing'];
			this.testData.estLogs = [];
			let result = null;
			if (this.model.database_type === 'mongodb') {
				result = await connectionsModel.customQuery([id]);
			} else {
				result = await connectionsModel.get([id]);
			}
			if (result.data) {
				const data = result.data;
				let validate_details = data.response_body && data.response_body.validate_details;
				this.testData.testLogs = validate_details || [];
				this.testData.testResult = this.status[data.status] || this.status['testing'];
				this.testData.progress = handleProgress(this.testData.testLogs);
				if (['testing'].includes(data.status)) {
					this.timer = setInterval(() => {
						this.test(id);
					}, 3000);
				}
			}
		},
		submit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					let params = Object.assign({}, this.model, {
						sslCert: this.model.sslKey,
						user_id: this.$cookie.get('user_id'),
						status: 'testing',
						schema: {},
						retry: 0,
						nextRetry: null,
						response_body: {},
						project: '',
						listtags: []
					});
					if (!params.id) {
						delete params.id;
					}
					delete params.sslKeyFile;
					delete params.sslCAFile;
					if (params.database_type === 'mongodb') {
						params.fill = params.isUrl ? 'uri' : '';
						delete params.isUrl;
					}
					connectionsModel[this.model.id ? 'patchId' : 'post'](params)
						.then(res => {
							let id = res.data.id;
							this.model.id = id;
							this.testData.dialogTestVisible = true;
							this.test(id);
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
			});
		},

		// 跳转到重复数据源
		clickLinkSource() {
			window.open('/#/connection/' + this.connectionObj.id, '_blank');
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
			.form {
				overflow-y: auto;
				padding: 0 20px;
				width: 640px;
				margin: 0 auto;
			}
			.title {
				display: flex;
				justify-content: flex-start;
				width: 826px;
				margin: 40px auto 20px auto;
			}
			.img-box {
				display: flex;
				width: 54px;
				height: 54px;
				justify-content: center;
				align-items: center;
				background: #fff;
				border: 1px solid #dedee4;
				border-radius: 3px;
				margin-left: 225px;
				img {
					width: 60%;
				}
			}
			.content {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-left: 15px;
				font-size: 28px;
			}
			.test {
				margin-left: 200px;
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
		box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(222, 222, 228, 100);
		border-left: none;
	}
	.footer {
		height: 46px;
		background-color: #fafafa;
		padding-left: 27%;
		border: 1px solid #dedee4;
		border-left: none;
		line-height: 46px;
	}
}
</style>
<style lang="less">
.databaseFrom .el-form--label-right .el-form-item {
	.el-form-item__label .e-form-builder-item-label {
		float: right;
	}
	margin-bottom: 16px;
}
.databaseFrom .el-form--label-right .el-form-item {
	.el-form-item__label {
		display: inline-block;
	}
}
</style>
