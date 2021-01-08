export default function(vm) {
	return {
		form: {
			labelPosition: 'top',
			labelWidth: '200px'
		},
		defaultModel: {
			seperate: '，'
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
				field: 'seperate',
				label: vm.$t('editor.fileFormBuilder.separate'),
				required: true
			}
		]
	};
}
