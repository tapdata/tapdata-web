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
				label: vm.$t('editor.fileFormBuilder.includeFilename')
			},
			{
				type: 'input',
				field: 'exclude_filename',
				label: vm.$t('editor.fileFormBuilder.excludeFilename')
			},
			{
				type: 'input',
				field: 'file_schema',
				label: vm.$t('editor.fileFormBuilder.fileSchema')
			},
			{
				type: 'input',
				field: 'plain_password',
				label: vm.$t('editor.fileFormBuilder.excelPassword')
			},
			{
				type: 'slot',
				slot: 'excel',
				label: vm.$t('editor.fileFormBuilder.excelValue'),
				required: true
			}
		]
	};
}
