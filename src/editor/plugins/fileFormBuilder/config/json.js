export default function(vm) {
	return {
		form: {
			labelPosition: 'top',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source_and_target',
			thin_type: 'SID',
			supportUpdatePk: false
		},
		items: [
			{
				type: 'input',
				field: 'include_filename',
				label: vm.$t('dataForm.form.userName')
			},
			{
				type: 'input',
				field: 'exclude_filename',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'select',
				field: 'json_type',
				label: vm.$t('dataForm.form.databaseOwner'),
				option: [
					{ label: 'ArrayBegin', value: 'ArrayBegin' },
					{ label: 'ObjectBegin', value: 'ObjectBegin' }
				],
				required: true
			},
			{
				type: 'input',
				field: 'tags_filter',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			}
		]
	};
}
