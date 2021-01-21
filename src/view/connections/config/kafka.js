export default function(vm) {
	return {
		form: {
			labelPosition: 'right',
			labelWidth: '200px'
		},
		defaultModel: {
			connection_type: 'source_and_target',
			kafkaAcks: '-1',
			kafkaCompressionType: 'gzip'
		},
		items: [
			{
				type: 'radio',
				field: 'connection_type',
				label: vm.$t('dataForm.form.connectionType'),
				options: [
					{
						label: vm.$t('dataForm.form.options.sourceAndTarget'),
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
				required: true,
				rules: [
					{
						validator(rule, value, callback) {
							if (!value || !value.trim()) {
								callback(new Error(vm.$t('dataForm.error.noneHost')));
							} else {
								callback();
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
				type: 'input',
				field: 'kafkaPatternTopics',
				label: vm.$t('dataForm.form.kafka.topicExpression'),
				show: true,
				rules: [
					{
						required: true,
						validator(rule, value, callback) {
							if (!value || !value.trim()) {
								callback(new Error(vm.$t('dataForm.error.noneHost')));
							} else if (value.length < 1 || value.length > 256) {
								callback(new Error(vm.$t('dataForm.error.kafkaNameRange')));
							} else {
								callback();
							}
						}
					}
				]
			},

			{
				type: 'switch', // 忽略非JSON Object格式消息
				field: 'kafkaIgnoreInvalidRecord',
				label: vm.$t('dataForm.form.kafka.lonoreFormat'),
				show: true,
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'connection_type',
								value: 'target'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				]
			},

			{
				type: 'slot',
				slot: 'lonoreFormatTip',
				dependOn: [
					{
						triggerOptions: [
							{
								field: 'connection_type',
								value: 'target'
							}
						],
						triggerConfig: {
							show: false
						}
					}
				]
			},
			{
				type: 'select', //ACK确认机制
				field: 'kafkaAcks',
				label: vm.$t('dataForm.form.kafka.kafkaAcks'),
				show: true,
				options: [
					{ label: vm.$t('dataForm.form.kafka.kafkaAcks0'), value: '0' },
					{ label: vm.$t('dataForm.form.kafka.kafkaAcks1'), value: '1' },
					{ label: vm.$t('dataForm.form.kafka.kafkaAcks_1'), value: '-1' },
					{ label: vm.$t('dataForm.form.kafka.kafkaAcksAll'), value: 'all' }
				],
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
				type: 'select', //消息压缩类型
				field: 'kafkaCompressionType',
				label: vm.$t('dataForm.form.kafka.kafkaCompressionType'),
				show: true,
				options: [
					{ label: 'gzip', value: 'gzip' },
					{ label: 'snappy', value: 'snappy' },
					{ label: 'lz4', value: 'lz4' },
					{ label: 'zstd', value: 'zstd' }
				],
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
				type: 'switch', //是否忽略推送消息异常,
				field: 'kafkaIgnorePushError',
				label: vm.$t('dataForm.form.kafka.kafkaIgnorePushError'),
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
				type: 'slot',
				slot: 'pushErrorTip',
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
			}
			// {
			// 	type: 'radio',
			// 	field: 'kafkaSelectTopics',
			// 	label: vm.$t('dataForm.form.kafka.chooseTheme'),
			// 	options: [
			// 		{
			// 			label: vm.$t('dataForm.form.kafka.topicName'),
			// 			tip: vm.$t('dataForm.form.kafka.directlyNameTip'),
			// 			value: 'kafkaRawTopics'
			// 		},
			// 		{
			// 			label: vm.$t('dataForm.form.kafka.topicExpression'),
			// 			tip: vm.$t('dataForm.form.kafka.hostPlaceHolder'),
			// 			value: 'kafkaPatternTopics'
			// 		}
			// 	],
			// 	required: true
			// },
			// {
			// 	type: 'input',
			// 	field: 'kafkaRawTopics',
			// 	label: vm.$t('dataForm.form.kafka.topicName'),
			// 	show: false,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'kafkaSelectTopics',
			// 					value: 'kafkaRawTopics'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: true
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //拉取请求超时时间
			// 	field: 'kafkaConsumerRequestTimeout',
			// 	label: vm.$t('dataForm.form.kafka.requestTimeoutPeriod'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'target'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'switch', // 消息提交读隔离级别
			// 	field: 'kafkaConsumerUseTransactional',
			// 	label: vm.$t('dataForm.form.kafka.readIsolationLevel'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'target'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //单次poll消息最大返回记录数
			// 	field: 'kafkaMaxPollRecords',
			// 	label: vm.$t('dataForm.form.kafka.maximumNumber'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'target'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input',
			// 	field: 'kafkaPollTimeoutMS', // 单次poll消息阻塞超时时间
			// 	label: vm.$t('dataForm.form.kafka.blockingTimeoutTime'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'target'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', // 单次fetch消息最大字节数
			// 	field: 'kafkaMaxFetchBytes',
			// 	label: vm.$t('dataForm.form.kafka.fetchMaximumNumber'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'target'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', // 单次fetch消息阻塞超时时间
			// 	field: 'kafkaMaxFetchWaitMS',
			// 	label: vm.$t('dataForm.form.kafka.fetchBlockTime'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'target'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //推送请求超时时间
			// 	field: 'kafkaProducerRequestTimeout',
			// 	label: vm.$t('dataForm.form.kafka.requestTimeoutPeriod'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //使用事务消息
			// 	field: 'kafkaProducerUseTransactional',
			// 	label: vm.$t('dataForm.form.kafka.transactionMessage'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //请求重试次数
			// 	field: 'kafkaRetries',
			// 	label: vm.$t('dataForm.form.kafka.kafkaRetries'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //分区消息批次字节数
			// 	field: 'kafkaBatchSize',
			// 	label: vm.$t('dataForm.form.kafka.kafkaBatchSize'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },

			// {
			// 	type: 'input', //分区消息批次最大等待时间
			// 	field: 'kafkaLingerMS	',
			// 	label: vm.$t('dataForm.form.kafka.kafkaLingerMS	'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //消息传输超时时间
			// 	field: 'kafkaDeliveryTimeoutMS',
			// 	label: vm.$t('dataForm.form.kafka.kafkaDeliveryTimeoutMS'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //请求最大字节数
			// 	field: 'kafkaMaxRequestSize',
			// 	label: vm.$t('dataForm.form.kafka.kafkaMaxRequestSize'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
			// {
			// 	type: 'input', //缓存消息字节数
			// 	field: 'kafkaBufferMemory',
			// 	label: vm.$t('dataForm.form.kafka.kafkaBufferMemory'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },

			// {
			// 	type: 'input', //分区键字段名
			// 	field: 'kafkaPartitionKey',
			// 	label: vm.$t('dataForm.form.kafka.kafkaPartitionKey'),
			// 	show: true,
			// 	dependOn: [
			// 		{
			// 			triggerOptions: [
			// 				{
			// 					field: 'connection_type',
			// 					value: 'source'
			// 				}
			// 			],
			// 			triggerConfig: {
			// 				show: false
			// 			}
			// 		}
			// 	]
			// },
		]
	};
}
