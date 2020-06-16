<template>
	<Drawer ref="drawer" :visible.sync="visible" title="新建数据库">
		<div class="test-block" v-if="testing || testLogs">
			<div class="test-block-title">连接测试</div>
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
			<div class="test-result">{{ testResult || '测试中...' }}</div>
		</div>
		<form-builder ref="form" v-model="model" :config="config"></form-builder>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" :loading="testing" @click="submit">Enter</el-button>
			<el-button size="mini" @click="visible = false">Cancel</el-button>
		</span>
	</Drawer>
</template>

<script>
import Drawer from '@/components/Drawer';
import factory from '@/api/factory';
import formConfig from './config';

const databaseTypesModel = factory('DatabaseTypes');
const connectionsModel = factory('connections');
const defaultConfig = [];

export default {
	name: 'DatabaseCreateForm',
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

			model: {
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
				supportUpdatePk: false
			},
			config: {
				items: []
			}
		};
	},
	created() {
		this.getDT();
		this.initTimezones();
		let self = this;
		defaultConfig.push(
			...[
				{
					type: 'input',
					field: 'name',
					label: '连接名称',
					required: true
				},
				{
					type: 'select',
					field: 'database_type',
					label: '数据库类型',
					options: [],
					required: true,
					on: {
						change() {
							self.getFormConfig();
							self.$refs.form.clearValidate();
						}
					}
				}
			]
		);
	},
	methods: {
		initData(data) {
			this.model = Object.assign(this.model, data);
		},
		show() {
			this.visible = true;
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
		checkItems() {
			let val = this.model.connection_type;
			let databaseDatetypeWithoutTimezone = this.config.items.find(
				item => item.field === 'database_datetype_without_timezone'
			);
			let supportUpdatePk = this.config.items.find(item => item.field === 'supportUpdatePk');
			this.$nextTick(() => {
				if (databaseDatetypeWithoutTimezone) {
					databaseDatetypeWithoutTimezone.show = val && ['source', 'source_and_target'].includes(val);
				}
				if (supportUpdatePk) {
					supportUpdatePk.show = val && ['target', 'source_and_target'].includes(val);
				}
				this.$refs.form.$forceUpdate();
			});
		},
		// 获取数据库类型列表
		async getDT() {
			let result = await databaseTypesModel.get();
			if (result.data) {
				let options = result.data.map(dt => {
					return { label: dt.name, value: dt.type };
				});

				let whiteList = ['mysql', 'oracle', 'mongodb', 'sqlserver', 'db2']; //目前白名单
				defaultConfig[1].options = options.filter(opt => whiteList.includes(opt.value));
				// defaultConfig[1].options = options;
				if (options.length) {
					//默认选择第一个数据库类型
					this.model.database_type = options[0].value;
				}
				this.getFormConfig();
			}
		},
		// 按照数据库类型获取表单配置规则
		getFormConfig() {
			let func = formConfig[this.model.database_type];
			if (func) {
				this.initData();
				let config = func(this, 'config.items');
				let items = defaultConfig.concat(config.items);
				let item = items.find(it => it.field === 'database_datetype_without_timezone');
				if (item) {
					item.options = this.timezones;
				}
				this.config.items = items;
				this.initData(config.defaultModel); //切换类型会后初始化数据
				this.checkItems();
			}
		},
		async test(id) {
			this.testing = true;
			this.testResult = '';
			this.testLogs = null;
			let result = await connectionsModel.get([id]);
			if (result.data) {
				const data = result.data;
				let validate_details = data.response_body && data.response_body.validate_details;
				this.testLogs = validate_details;
				this.$refs.drawer.$el.getElementsByTagName('main')[0].scrollTop = 0;
				if (data.status === 'ready') {
					this.testing = false;
					this.testResult = '测试通过';
				} else if (data.status === 'invalid') {
					this.testResult = '测试未通过';
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
					connectionsModel
						.post(params)
						.then(res => {
							if (res.statusText === 'OK') {
								this.test(res.data.id);
							}
						})
						.catch(err => {
							if (err && err.response.status === 500) {
								this.$message.error('连接名称已存在');
							} else {
								this.$message.error('保存失败');
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
	margin-bottom: 15px;
	padding: 15px;
	background: #f1f1f1;
	font-size: 12px;
	line-height: 20px;
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
