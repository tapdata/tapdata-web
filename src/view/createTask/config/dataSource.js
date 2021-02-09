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
				field: 's_connectionType',
				label: '源端连接来源',
				options: [
					{
						label: 'RDS实例',
						value: 'rds'
					},
					{
						label: '云外建库',
						value: 'tapdata'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 's_region',
				label: '源端地域',
				options: [
					{
						label: '可用地域1',
						value: 'region1'
					},
					{
						label: '可用地域2',
						value: 'region2'
					}
				],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 's_connectionType',
								value: 'tapdata'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 's_zone',
				label: '源端可用区',
				options: [
					{
						label: '可用地域1',
						value: 'zone1'
					}
				],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 's_connectionType',
								value: 'tapdata'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				],
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
				field: 't_connectionType',
				label: '目标端连接来源',
				options: [
					{
						label: 'RDS实例',
						value: 'rds'
					},
					{
						label: '云外建库',
						value: 'tapdata'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 't_region',
				label: '目标端地域',
				disabled: true,
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 't_connectionType',
								value: 'tapdata'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 't_zone',
				label: '目标端可用区',
				disabled: true,
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 't_connectionType',
								value: 'tapdata'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				],
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
