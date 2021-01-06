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
				type: 'input',
				field: 'file_schema',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'data_content_xpath',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			}
		]
	};
}
