export default function(vm) {
	return {
		form: {
			labelPosition: 'top',
			labelWidth: '200px'
		},
		defaultModel: {
			json_type: 'ArrayBegin'
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
				type: 'select',
				field: 'json_type',
				label: vm.$t('editor.fileFormBuilder.jsonType'),
				options: [
					{ label: 'ArrayBegin', value: 'ArrayBegin' },
					{ label: 'ObjectBegin', value: 'ObjectBegin' }
				],
				required: true
			}
		]
	};
}
