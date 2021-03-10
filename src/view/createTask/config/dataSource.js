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
				field: 'source_sourceType',
				label: '源端连接来源',
				options: [
					{
						label: 'RDS实例',
						value: 'rds'
					},
					{
						label: 'DDS实例',
						value: 'dds'
					},
					{
						label: 'ECS自建库',
						value: 'ecs'
					},
					{
						label: '云外自建库',
						value: 'selfDB'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'source_region',
				label: '源端地域',
				options: [],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'source_sourceType',
								value: 'selfDB'
							}
						],
						triggerConfig: {
							show: false,
							value: ''
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'source_zone',
				label: '源端可用区',
				options: [],
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'source_sourceType',
								value: 'selfDB'
							}
						],
						triggerConfig: {
							show: false
						}
					},
					{
						triggerOptions: [
							{
								field: 'source_region',
								value: ''
							}
						],
						triggerConfig: {
							value: ''
						}
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'source_connectionId',
				label: '源端连接',
				loading: false,
				options: [],
				required: true
			},
			{
				type: 'slot',
				slot: 'target'
			},
			{
				type: 'select',
				field: 'target_sourceType',
				label: '目标端连接来源',
				options: [
					{
						label: 'RDS实例',
						value: 'rds'
					},
					{
						label: 'ECS自建库',
						value: 'ecs'
					},
					{
						label: 'DDS实例',
						value: 'dds'
					}
				],
				required: true
			},
			{
				type: 'select',
				field: 'target_region',
				label: '目标端地域',
				disabled: true,
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'target_sourceType',
								value: 'selfDB'
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
				field: 'target_zone',
				label: '目标端可用区',
				disabled: true,
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'target_sourceType',
								value: 'selfDB'
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
				field: 'target_connectionId',
				label: '目标端连接',
				loading: false,
				options: [],
				required: true
			}
		]
	};
}
