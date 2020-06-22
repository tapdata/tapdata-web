<template>
	<Drawer ref="drawer" :visible.sync="visible" :title="$t('dataForm.title')">
		<div class="test-block" v-if="testing || testLogs">
			<div class="test-block-title">{{ $t('dataForm.test.title') }}</div>
			<div class="test-log-item" v-for="(item, index) in testLogs" :key="item.sort">
				<div>{{ index + 1 }}. {{ item.show_msg }}</div>
				<div class="test-info">
					<div style="margin-right: 40px">{{ `Required:${item.required}` }}</div>
					<div>{{ `Status:${item.status === 'fail' ? 'failed' : item.status}` }}</div>
				</div>
				<div v-if="item.fail_message" class="test-info">
					Message:
					<b :style="{ color: item.required ? 'red' : '#ffc107' }">{{ item.fail_message }}</b>
				</div>
			</div>
			<div class="test-result">{{ testResult || $t('dataForm.test.testing') }}</div>
		</div>
		<form-builder ref="form" v-model="model" :config="config"></form-builder>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" :loading="testing" @click="submit">
				{{ $t('dataForm.submit') }}
			</el-button>
			<el-button size="mini" @click="visible = false">{{ $t('dataForm.cancel') }}</el-button>
		</span>
	</Drawer>
</template>

<script>
import Drawer from '@/components/Drawer';
import factory from '@/api/factory';
import formConfig from './config';

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
	plain_password: '',
	table_filter: '',
	additionalString: '',
	thin_type: '',
	database_owner: '',
	node_name: '',
	database_schema: '',

	database_datetype_without_timezone: '',
	supportUpdatePk: false,

	isUrl: true,
	database_uri: '',
	ssl: false,
	sslKey: '',
	sslPass: '',
	sslValidate: false,
	sslCA: ''
};

export default {
	name: 'DatabaseForm',
	components: {
		Drawer
	},
	data() {
		return {
			visible: false,
			testing: false,
			testLogs: null,
			testResult: '',
			timezones: [],
			dataTypes: [],
			whiteList: [],

			model: Object.assign({}, defaultModel),
			config: {
				items: []
			},
			checkItems: null
		};
	},
	created() {
		this.getDT();
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
			},
			{
				type: 'select',
				field: 'database_type',
				label: self.$t('dataForm.form.databaseType'),
				options: [],
				required: true,
				on: {
					change() {
						self.getFormConfig();
					}
				}
			}
		];
	},
	methods: {
		initData(data) {
			this.model = Object.assign(this.model, data);
		},
		show({ blackList, whiteList } = {}) {
			this.testing = false;
			this.testResult = '';
			this.testLogs = null;
			this.visible = true;
			this.whiteList = [];
			let list = ['mysql', 'oracle', 'mongodb', 'sqlserver', 'db2']; //目前白名单
			// let list = this.dataTypes;
			if (whiteList && whiteList.length) {
				this.whiteList = whiteList;
			} else if (blackList && blackList.length) {
				for (let i = 0; i < list.length; i++) {
					const element = list[i];
					if (!blackList.includes(element)) {
						this.whiteList.push(element);
					}
				}
			} else {
				this.whiteList = list;
			}
			this.checkDataTypeOptions();
		},
		checkDataTypeOptions() {
			let options = this.dataTypes;
			let list = options.filter(opt => this.whiteList.includes(opt.value));
			defaultConfig[1].options = list;
			if (list.length) {
				//默认选择第一个数据库类型
				this.model.database_type = list[0].value;
			}
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
		async getDT() {
			let result = await databaseTypesModel.get();
			if (result.data) {
				let options = result.data.map(dt => {
					return { label: dt.name, value: dt.type };
				});
				this.dataTypes = options;

				this.checkDataTypeOptions();
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
				this.config.items = items;
				this.initData(
					Object.assign(defaultModel, config.defaultModel, { database_type: this.model.database_type })
				); //切换类型会后初始化数据
				this.checkItems = config.checkItems; //根据model变化更新表单项显示或隐藏
				this.checkItems && this.checkItems();
			}
		},
		async test(id) {
			this.testing = true;
			this.testResult = '';
			this.testLogs = null;
			let result = null;
			if (this.model.database_type === 'mongodb') {
				result = await connectionsModel.customQuery([id]);
			} else {
				result = await connectionsModel.get([id]);
			}
			if (result.data) {
				const data = result.data;
				let validate_details = data.response_body && data.response_body.validate_details;
				this.testLogs = validate_details;
				this.$refs.drawer.$el.getElementsByTagName('main')[0].scrollTop = 0;
				if (data.status === 'ready') {
					this.testing = false;
					this.testResult = this.$t('dataForm.test.success');
					this.visible = false;
					this.$message.success(this.$t('dataForm.saveSuccess'));
					this.$emit('success');
				} else if (data.status === 'invalid') {
					this.testResult = this.$t('dataForm.test.fail');
					this.testing = false;
				} else {
					setTimeout(() => {
						this.test(id);
					}, 3000);
				}
			}
		},
		submit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (!this.model.id) {
						delete this.model.id;
					}
					let params = Object.assign({}, this.model, {
						user_id: this.$cookie.get('user_id'),
						status: 'testing',
						schema: {},
						retry: 0,
						nextRetry: null,
						response_body: {},
						project: '',
						listtags: []
					});
					connectionsModel[this.model.id ? 'patch' : 'post'](params)
						.then(res => {
							if (res.statusText === 'OK') {
								this.$set(this.model, 'id', res.data.id);
								this.test(res.data.id);
							}
						})
						.catch(err => {
							if (err && err.response.status === 500) {
								this.$message.error(this.$t('dataForm.error.connectionNameExist'));
							} else {
								this.$message.error(this.$t('dataForm.saveFail'));
							}
						});
				}
			});
		}
	}
};
</script>

<style scoped lang="less">
.test-block {
	margin: 0 auto 15px auto;
	padding: 15px;
	background: #f1f1f1;
	font-size: 12px;
	line-height: 20px;
	width: 400px;
	box-sizing: border-box;
	.test-block-title {
		margin-bottom: 5px;
		font-size: 14px;
	}
	.test-info {
		display: flex;
		margin-left: 14px;
	}
	.test-result {
		margin-top: 10px;
		font-size: 14px;
	}
}
</style>
