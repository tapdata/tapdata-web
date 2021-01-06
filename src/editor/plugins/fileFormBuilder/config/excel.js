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
				field: 'sheet_start',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'sheet_end',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'gridfs_header_type',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'excel_header_start',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'excel_header_end',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'excel_value_start',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'excel_value_end',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			},
			{
				type: 'input',
				field: 'gridfs_header_config',
				label: vm.$t('dataForm.form.databaseOwner'),
				required: true
			}
		]
	};
}
