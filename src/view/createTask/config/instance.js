export default function() {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'target'
		},
		items: [
			{
				type: 'select',
				field: 'region',
				label: '选择区域',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 'zone',
				label: '选择可用区',
				options: [],
				required: true
			}
		]
	};
}
