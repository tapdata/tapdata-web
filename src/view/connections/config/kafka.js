export default function(vm) {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source_and_target',
			kafkaSelectTopics: 'kafkaRawTopics'
		},
		items: [
			{
				type: 'radio',
				field: 'connection_type',
				label: vm.$t('dataForm.form.connectionType'),
				options: [
					{
						label: vm.$t('dataForm.form.options. '),
						tip: vm.$t('dataForm.form.options.sourceAndTargetTips'),
						value: 'source_and_target'
					},
					{
						label: vm.$t('dataForm.form.options.source'),
						tip: vm.$t('dataForm.form.options.sourceTips'),
						value: 'source'
					},
					{
						label: vm.$t('dataForm.form.options.target'),
						tip: vm.$t('dataForm.form.options.targetTips'),
						value: 'target'
					}
				],
				required: true
			},
			{
				type: 'input',
				field: 'kafkaBootstrapServers',
				label: vm.$t('dataForm.form.host'),
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value || !value.trim()) {
								callback(new Error(vm.$t('dataForm.error.noneHost')));
							}
						}
					}
				]
			},
			{
				type: 'slot',
				slot: 'kafkaUri'
			},
			{
				type: 'radio',
				field: 'kafkaSelectTopics',
				label: vm.$t('dataForm.form.kafka.chooseTheme'),
				options: [
					{
						label: vm.$t('dataForm.form.kafka.topicName'),
						tip: vm.$t('dataForm.form.kafka.directlyNameTip'),
						value: 'kafkaRawTopics'
					},
					{
						label: vm.$t('dataForm.form.kafka.topicExpression'),
						tip: vm.$t('dataForm.form.kafka.hostPlaceHolder'),
						value: 'kafkaPatternTopics'
					}
				],
				required: true
			},
			{
				type: 'input',
				field: 'kafkaRawTopics',
				label: vm.$t('dataForm.form.kafka.topicName'),
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'kafkaSelectTopics',
								value: 'kafkaRawTopics'
							}
						],
						triggerConfig: {
							show: true
						}
					}
				]
			},
			{
				type: 'input',
				field: 'kafkaPatternTopics',
				label: vm.$t('dataForm.form.kafka.topicExpression'),
				show: false,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'kafkaSelectTopics',
								value: 'kafkaPatternTopics'
							}
						],
						triggerConfig: {
							show: true
						}
					}
				]
			},
			{
				type: 'input',
				field: 'kafkaConsumerRequestTimeout',
				label: vm.$t('dataForm.form.kafka.requestTimeoutPeriod'),
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'connection_type',
								value: 'source'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				]
			},
			{
				type: 'input', //拉取请求超时时间
				field: 'kafkaConsumerRequestTimeout',
				label: vm.$t('dataForm.form.kafka.requestTimeoutPeriod'),
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'connection_type',
								value: 'source'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				]
			},
			{
				type: 'switch',
				field: 'kafkaConsumerUseTransactional',
				label: vm.$t('dataForm.form.kafka.readIsolationLevel')
			},
			{
				type: 'input',
				field: 'kafkaMaxPollRecords',
				label: vm.$t('dataForm.form.kafka.maximumNumber')
			},
			{
				type: 'input',
				field: 'kafkaPollTimeoutMS',
				label: vm.$t('dataForm.form.kafka.blockingTimeoutTime')
			},
			{
				type: 'input',
				field: 'kafkaMaxFetchBytes',
				label: vm.$t('dataForm.form.kafka.fetchMaximumNumber')
			},
			{
				type: 'input',
				field: 'kafkaMaxFetchWaitMS',
				label: vm.$t('dataForm.form.kafka.fetchBlockTime')
			},
			{
				type: 'switch',
				field: 'kafkaIgnoreInvalidRecord',
				label: vm.$t('dataForm.form.kafka.lonoreFormat')
			},

			{
				type: 'slot',
				slot: 'kafkaIgnoreInvalidRecord'
			}
		]
	};
}
