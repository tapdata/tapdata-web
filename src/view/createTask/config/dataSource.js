export default function() {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		items: [
			{
				type: 'slot',
				slot: 'source'
			},
			{
				type: 'select',
				field: 's_connection',
				label: '源端连接来源',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 's_region',
				label: '源端地域',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 's_instance',
				label: '源端可用区',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 's_connectionId',
				label: '源端连接',
				options: [],
				required: true
			},
			{
				type: 'slot',
				slot: 'target'
			},
			{
				type: 'select',
				field: 't_connection',
				label: '目标端连接来源',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 't_region',
				label: '目标端地域',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 't_instance',
				label: '目标端可用区',
				options: [],
				required: true
			},
			{
				type: 'select',
				field: 't_connectionId',
				label: '目标端连接',
				options: [],
				required: true
			}
		]
	};
}
