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
				field: 'instance',
				label: '选择区域',
				options: [
					{
						label: '实例1',
						value: 'instance1'
					},
					{
						label: '实例2',
						value: 'instance2'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'region',
				label: '选择可用区',
				options: [
					{
						label: '可用1',
						value: 'region1'
					},
					{
						label: '可用2',
						value: 'region2'
					}
				],
				required: true
			}
		]
	};
}
