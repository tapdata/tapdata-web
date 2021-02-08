export default function(vm) {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source_and_target'
		},
		items: [
			{
				type: 'select',
				field: 'instances',
				label: '选择实例',
				options: [
					{
						label: '实例1',
						value: 'instance1'
					},
					{
						label: '实例2',
						value: 'instance2'
					}
				],
				required: true
			},
			{
				type: 'radio',
				field: 'connectionType',
				label: vm.$t('dataForm.form.connectionType'),
				options: [
					{
						label: 'RDS实例',
						tip: vm.$t('dataForm.form.options.sourceAndTargetTips'),
						value: 'rds'
					},
					{
						label: '云外自建库',
						tip: vm.$t('dataForm.form.options.sourceTips'),
						value: 'tapdata'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'region',
				label: 'RDS地域',
				options: [
					{
						label: 'RDS地域1',
						value: 'region1'
					},
					{
						label: 'RDS地域2',
						value: 'region2'
					}
				],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'connectionType',
								value: 'tapdata'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'zone',
				label: 'RDS可用区',
				options: [
					{
						label: 'RDS可用区1',
						value: 'zone1'
					},
					{
						label: 'RDS可用区2',
						value: 'zone2'
					}
				],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'connectionType',
								value: 'tapdata'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				],
				required: true
			},
			// {
			// 	type: 'select',
			// 	field: 'DRS_instances',
			// 	label: 'RDS实例',
			// 	options: [
			// 		{
			// 			label: 'RDS实例1',
			// 			value: 'DRS_instances1'
			// 		},
			// 		{
			// 			label: 'RDS实例2',
			// 			value: 'DRS_instances2'
			// 		}
			// 	],
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connectionType',
			// 					value: 'tapdata'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	],
			// 	required: true
			// },
			// {
			// 	type: 'select',
			// 	field: 'IP_type',
			// 	label: 'IPV4/IPV4',
			// 	options: [
			// 		{
			// 			label: 'IPv4/IPv6',
			// 			value: 'IPv4/IPv6'
			// 		}
			// 	],
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connectionType',
			// 					value: 'tapdata'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	],
			// 	required: true
			// },
			{
				type: 'input',
				field: 'database_host',
				label: vm.$t('dataForm.form.host'),
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value || !value.trim()) {
								callback(new Error(vm.$t('dataForm.error.noneHost')));
							} else {
								callback();
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'database_port',
				label: vm.$t('dataForm.form.port'),
				required: true,
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value) {
								callback(new Error(vm.$t('dataForm.error.nonePort')));
							} else if (!/^\d+$/.test(value)) {
								callback(new Error(vm.$t('dataForm.error.portNumber')));
							} else if (value < 1 || value > 65535) {
								callback(new Error(vm.$t('dataForm.error.portRange')));
							} else {
								callback();
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'database_name',
				label: vm.$t('dataForm.form.databaseName'),
				required: true
			},
			{
				type: 'input',
				field: 'database_username',
				label: vm.$t('dataForm.form.userName')
			},
			{
				type: 'input',
				field: 'plain_password',
				label: vm.$t('dataForm.form.password'),
				domType: 'password',
				showPassword: true
			}
		]
	};
}
