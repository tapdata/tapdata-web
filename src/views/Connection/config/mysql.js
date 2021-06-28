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
				type: 'radio',
				field: 'connection_type',
				label: vm.t('dataForm.form.connectionType'),
				options: [
					{
						label: vm.t('dataForm.form.options.sourceAndTarget'),
						tip: vm.t('dataForm.form.options.sourceAndTargetTips'),
						value: 'source_and_target'
					},
					{
						label: vm.t('dataForm.form.options.source'),
						tip: vm.t('dataForm.form.options.sourceTips'),
						value: 'source'
					},
					{
						label: vm.t('dataForm.form.options.target'),
						tip: vm.t('dataForm.form.options.targetTips'),
						value: 'target'
					}
				],
				required: true
			},
			// {
			// 	type: 'input',
			// 	field: 'database_host',
			// 	label: vm.t('dataForm.form.host'),
			// 	rules: [
			// 		{
			// 			required: true,
			// 			validator(rule, value, callback) {
			// 				let port = this.value['database_port'];
			// 				if (!value || !value.trim()) {
			// 					callback(new Error(vm.t('dataForm.error.noneHost')));
			// 				} else if (!port) {
			// 					callback(new Error(vm.t('dataForm.error.nonePort')));
			// 				} else if (!/^\d+$/.test(port)) {
			// 					callback(new Error(vm.t('dataForm.error.portNumber')));
			// 				} else if (port < 1 || port > 65535) {
			// 					callback(new Error(vm.t('dataForm.error.portRange')));
			// 				} else {
			// 					callback();
			// 				}
			// 			}
			// 		}
			// 	],
			// 	appendSlot: (h, data) => {
			// 		return h('FbInput', {
			// 			props: {
			// 				value: data['database_port'],
			// 				config: {
			// 					placeholder: vm.t('dataForm.form.port')
			// 				}
			// 			},
			// 			on: {
			// 				input(val) {
			// 					data['database_port'] = val;
			// 				}
			// 			}
			// 		});
			// 	}
			// },
			{
				type: 'input',
				field: 'database_host',

				label: vm.t('dataForm.form.host'),
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value || !value.trim()) {
								callback(new Error(vm.t('dataForm.error.noneHost')))
							} else {
								callback()
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'database_port',
				label: vm.t('dataForm.form.port'),
				required: true,
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value) {
								callback(new Error(vm.t('dataForm.error.nonePort')))
							} else if (!/^\d+$/.test(value)) {
								callback(new Error(vm.t('dataForm.error.portNumber')))
							} else if (value < 1 || value > 65535) {
								callback(new Error(vm.t('dataForm.error.portRange')))
							} else {
								callback()
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'database_name',
				label: vm.t('dataForm.form.databaseName'),
				required: true
			},
			{
				type: 'input',
				field: 'database_username',
				label: vm.t('dataForm.form.userName')
			},
			{
				type: 'input',
				field: 'plain_password',
				label: vm.t('dataForm.form.password'),
				domType: 'password',
				showPassword: true
			},
			{
				type: 'switch',
				field: 'schemaAutoUpdate',
				label: vm.t('dataForm.form.ReloadSchema')
			},
			{
				type: 'input',
				field: 'table_filter',
				domType: 'textarea',
				label: vm.t('dataForm.form.tableFilter'),
				//tips: vm.t('dataForm.form.tableFilterTips'),
				maxlength: 500,
				showWordLimit: true
			},
			{
				type: 'slot',
				slot: 'tableFilter'
			},
			{
				type: 'input',
				field: 'additionalString',
				label: vm.t('dataForm.form.additionalString')
			},
			{
				type: 'select',
				field: 'database_datetype_without_timezone',
				label: vm.t('dataForm.form.timeZone'),
				//tips: vm.t('dataForm.form.timeZoneTips'),
				options: [],
				show: true
			},
			{
				type: 'slot',
				slot: 'timezone',
				show: true
			}
		]
	}
}
