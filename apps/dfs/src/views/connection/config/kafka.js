export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
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
        label: vm.$t('dataForm_form_connectionType'),
        options: [
          {
            label: vm.$t('dataForm_form_options_sourceAndTarget'),
            tip: vm.$t('dataForm_form_options_sourceAndTargetTips'),
            value: 'source_and_target'
          },
          {
            label: vm.$t('dataForm_form_options_source'),
            tip: vm.$t('dataForm_form_options_sourceTips'),
            value: 'source'
          },
          {
            label: vm.$t('dataForm_form_options_target'),
            tip: vm.$t('dataForm_form_options_targetTips'),
            value: 'target'
          }
        ],
        required: true,
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
      },
      {
        type: 'input',
        field: 'kafkaBootstrapServers',
        label: vm.$t('dataForm_form_host'),
        required: true,
        tip: vm.$t('connection_form_kafka_host_tip'),
        rules: [
          {
            validator(rule, value, callback) {
              if (!value || !value.trim()) {
                callback(new Error(vm.$t('dataForm_error_noneHost')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'kafkaPatternTopics',
        label: vm.$t('dataForm_form_kafka_topicExpression'),
        show: true,
        required: true
      },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('dataForm_form_userName'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'krb5',
                value: true
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm_form_password'),
        domType: 'password',
        showPassword: true,
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'krb5',
                value: true
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'switch', // 忽略非JSON Object格式消息
        field: 'kafkaIgnoreInvalidRecord',
        customClass: 'large-item',
        label: vm.$t('dataForm_form_kafka_lonoreFormat'),
        show: true,
        tip: vm.$t('connection_form_kafka_lonore_format_tip'),
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
        label: vm.$t('dataForm_form_kafka_kafkaAcks'),
        show: true,
        options: [
          { label: vm.$t('dataForm_form_kafka_kafkaAcks0'), value: '0' },
          { label: vm.$t('dataForm_form_kafka_kafkaAcks1'), value: '1' },
          { label: vm.$t('dataForm_form_kafka_kafkaAcks_1'), value: '-1' },
          { label: vm.$t('dataForm_form_kafka_kafkaAcksAll'), value: 'all' }
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
        label: vm.$t('dataForm_form_kafka_kafkaCompressionType'),
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
        label: vm.$t('dataForm_form_kafka_kafkaIgnorePushError'),
        show: true,
        customClass: 'large-item',
        tip: vm.$t('connection_form_kafka_ignore_push_error_tip'),
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
    ]
  }
}
