export default function(vm) {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source',
			request_interval: 5
		},
		items: [
			{
				type: 'radio',
				field: 'connection_type',
				label: vm.t('dataForm.form.connectionType'),
				options: [
					{
						label: vm.t('dataForm.form.options.source'),
						tip: vm.t('dataForm.form.options.sourceTips'),
						value: 'source'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'auth_type',
				label: vm.t('dataForm.form.restApi.auth_type'),
				options: [
					{
						label: 'None',
						value: ''
					},
					{
						label: 'OAuth2',
						value: 'oauth2'
					}
				]
			},
			{
				type: 'input',
				field: 'request_interval',
				label: vm.t('dataForm.form.restApi.request_interval_tip'),
				required: true,
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value) {
								callback(new Error('同步间隔时间不能为空'))
							} else if (!/^\d+$/.test(value)) {
								callback(new Error('同步间隔时间只能为数字'))
							} else {
								callback()
							}
						}
					}
				]
			},
			{
				type: 'input',
				field: 'collection_name',
				label: vm.t('dataForm.form.restApi.collection_name'),
				required: true
			},
			{
				type: 'input',
				field: 'unique_keys',
				label: vm.t('dataForm.form.restApi.unique_keys'),
				required: true
			},
			{
				type: 'slot',
				slot: 'req_pre_process',
				label: vm.t('dataForm.form.restApi.req_pre_process')
			},
			{
				type: 'slot',
				slot: 'resp_pre_process',
				label: vm.t('dataForm.form.restApi.resp_pre_process')
			},
			{
				type: 'select',
				field: 'data_sync_mode',
				label: vm.t('dataForm.form.restApi.data_sync_mode'),
				options: [
					{
						label: vm.t('dataForm.form.restApi.url_info_INCREMENTAL_SYNC'),
						value: 'INCREMENTAL_SYNC'
					},
					{
						label: vm.t('dataForm.form.restApi.url_info_INITIAL_SYNC'),
						value: 'INITIAL_SYNC'
					},
					{
						label: vm.t('dataForm.form.restApi.url_info_INITIAL_INCREMENTAL_SYNC'),
						value: 'INITIAL_INCREMENTAL_SYNC'
					}
				],
				required: true
			}
		]
	}
}
