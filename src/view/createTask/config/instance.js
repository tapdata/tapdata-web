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
				loading: true,
				required: true
			},
			{
				type: 'select',
				field: 'zone',
				label: '选择可用区',
				loading: true,
				options: [],
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'region',
								value: ''
							}
						],
						triggerConfig: {
							value: ''
						}
					}
				],
				required: true
			}
		]
	};
}
