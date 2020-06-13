<template>
	<Drawer :visible.sync="visible" title="新建数据库">
		<form-builder ref="form" v-model="model" :config="config"></form-builder>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" @click="submit">Enter</el-button>
			<el-button size="mini" @click="visible = false">Cancel</el-button>
		</span>
	</Drawer>
</template>

<script>
import Drawer from '@/components/Drawer';
import factory from '@/api/factory';
import formConfig from './config';
import { initTimezones } from '../../util/TimeZone';

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

				database_datetype_without_timezone: initTimezones()
			},
			config: {
				items: []
			}
		};
	},
	created() {
		this.getDT();
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
					required: true
				}
			]
		);
	},
	methods: {
		show() {
			this.visible = true;
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
			let factory = formConfig[this.model.database_type];
			if (factory) {
				let config = factory(this);
				let items = defaultConfig.concat(config.items);
				this.config.items = items;
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
					connectionsModel.post(params);
				}
			});
		}
	}
};
</script>

<style></style>
