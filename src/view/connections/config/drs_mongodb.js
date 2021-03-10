export default function(vm) {
	const fileChange = (file, field) => {
		if (file) {
			let reader = new FileReader();
			reader.readAsText(file);
			reader.onload = () => {
				let text = reader.result;
				vm.model[field] = text;
			};
		} else {
			vm.model[field] = '';
		}
	};
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source_and_target',
			sourceType: 'dds',
			isUrl: true,
			ssl: false,
			sslValidate: false
		},
		items: [
			{
				type: 'slot',
				slot: 'name'
			},
			{
				type: 'select',
				field: 'region',
				label: '选择实例',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 'zone',
				label: '选择实例可用区',
				options: [],
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'region',
								value: ''
							}
						],
						triggerConfig: {
							value: ''
						}
					}
				],
				required: true
			},
			{
				type: 'radio',
				field: 'sourceType',
				label: '连接来源',
				options: [
					{
						label: 'DDS实例',
						tip: '创建移动云内的DDS实例为来源的连接',
						value: 'dds'
					},
					{
						label: 'ECS自建库',
						tip: '创建移动云内ECS自建库内的数据库为来源的连接，开通网络策略',
						value: 'ecs'
					},
					{
						label: '云外自建库',
						tip: '创建来自移动云外部的用户自建数据库连接',
						value: 'selfDB'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 's_region',
				label: 'RDS地域',
				options: [],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'sourceType',
								value: 'selfDB'
							}
						],
						triggerConfig: {
							show: false,
							value: ''
						}
					},
					{
						triggerOptions: [
							{
								field: 'sourceType',
								value: 'ecs'
							}
						],
						triggerConfig: {
							label: 'ECS地域'
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 's_zone',
				label: 'RDS可用区',
				options: [],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'sourceType',
								value: 'selfDB'
							}
						],
						triggerConfig: {
							show: false
						}
					},
					{
						triggerOptions: [
							{
								field: 's_region',
								value: ''
							}
						],
						triggerConfig: {
							value: ''
						}
					},
					{
						triggerOptions: [
							{
								field: 'sourceType',
								value: 'ecs'
							}
						],
						triggerConfig: {
							label: 'ECS可用区'
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'vpc',
				label: '选择VPC',
				options: [],
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'sourceType',
								value: 'ecs'
							}
						],
						triggerConfig: {
							show: true
						}
					}
				],
				required: true
			},
			{
				type: 'slot',
				slot: 'vpc-setting'
			},
			{
				type: 'input',
				field: 'database_uri',
				label: vm.$t('dataForm.form.databaseUri'),
				domType: 'textarea',
				required: true
			},
			{
				type: 'slot',
				slot: 'urlTip'
			},
			{
				type: 'radio',
				field: 'ssl',
				label: vm.$t('dataForm.form.ssl'),
				options: [
					{
						label: vm.$t('dataForm.form.options.sslTSL'),
						tip: vm.$t('dataForm.form.options.sslTSLTip'),
						value: true
					},
					{
						label: vm.$t('dataForm.form.options.sslTop'),
						tip: vm.$t('dataForm.form.options.sslTopTips'),
						value: false
					}
				],
				influences: [
					{
						field: 'sslKeyFile',
						byValue: false,
						value: ''
					},
					{
						field: 'sslPass',
						byValue: true,
						value: ''
					}
				]
			},
			{
				type: 'file',
				field: 'sslKeyFile',
				label: vm.$t('dataForm.form.sslKey'),
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'ssl',
								value: true
							}
						],
						triggerConfig: {
							show: true
						}
					}
				],
				rules: [
					{
						required: true,
						validator: (rule, v, callback) => {
							let value = vm.model.sslKey;
							let ssl = vm.model.ssl;
							if (ssl && (!value || !value.trim())) {
								if (v) {
									callback();
								}
								callback(new Error(vm.$t('dataForm.error.noneSslKey')));
							} else {
								callback();
							}
						}
					}
				],
				on: {
					change(file) {
						fileChange(file, 'sslKey');
					}
				}
			},
			{
				type: 'input',
				field: 'sslPass',
				label: vm.$t('dataForm.form.sslPass'),
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'ssl',
								value: true
							}
						],
						triggerConfig: {
							show: true
						}
					}
				]
			},
			{
				type: 'switch',
				field: 'sslValidate',
				label: vm.$t('dataForm.form.sslValidate'),
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'ssl',
								value: true
							}
						],
						triggerConfig: {
							show: true
						}
					}
				],
				influences: [
					{
						field: 'sslCAFile',
						byValue: false,
						value: ''
					}
				]
			},
			{
				type: 'file',
				field: 'sslCAFile',
				label: vm.$t('dataForm.form.sslCA'),
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'ssl',
								value: true
							},
							{
								field: 'sslValidate',
								value: true
							}
						],
						triggerConfig: {
							show: true
						}
					}
				],
				rules: [
					{
						required: true,
						validator: (rule, v, callback) => {
							let ssl = vm.model.sslValidate;
							if (ssl && !v) {
								callback(new Error(vm.$t('dataForm.error.noneSslCA')));
							} else {
								callback();
							}
						}
					}
				],
				on: {
					change(file) {
						fileChange(file, 'sslCA');
					}
				}
			}
		]
	};
}
