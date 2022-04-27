export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
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
        label: vm.$t('connection_form_connection_type'),
        options: [
          {
            label: vm.$t('connection_form_source_and_target'),
            tip: vm.$t('connection_form_source_and_target_tip'),
            value: 'source_and_target'
          },
          {
            label: vm.$t('connection_form_source'),
            tip: vm.$t('connection_form_source_tip'),
            value: 'source'
          },
          {
            label: vm.$t('connection_form_target'),
            tip: vm.$t('connection_form_target_tip'),
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
        label: vm.$t('connection_form_host'),
        tips: vm.$t('connection_form_kafka_host_tip'),
        required: true,
        rules: [
          {
            validator(rule, value, callback) {
              if (!value || !value.trim()) {
                callback(new Error(vm.$t('dataForm.error.noneHost')))
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
        label: vm.$t('dataForm.form.kafka.topicExpression'),
        show: true,
        required: true
      },
      {
        type: 'switch', //开启 kerberos 认证
        field: 'krb5',
        label: vm.$t('connection_kafka_kerberos_attest'),
        show: true,
        tips: vm.$t('connection_kafka_kerberos_tip')
      },
      {
        type: 'file',
        field: 'krb5Keytab',
        fileNameField: 'krb5KeytabName',
        accept: '.keytab',
        maxFileSize: 128,
        base64: true,
        label: vm.$t('connection_kafka_kerberos_config_keytab'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'krb5',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error(vm.$t('connection_kafka_kerberos_none_keytab')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'file',
        field: 'krb5Conf',
        fileNameField: 'krb5ConfName',
        accept: '.conf',
        maxFileSize: 128,
        base64: true,
        label: vm.$t('connection_kafka_kerberos_config_conf'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'krb5',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error(vm.$t('connection_kafka_kerberos_none_conf')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input', //主体配置
        field: 'krb5Principal',
        label: vm.$t('connection_kafka_kerberos_body_config'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'krb5',
                value: true
              }
            ],
            triggerConfig: {
              show: true,
              required: true
            }
          }
        ]
      },
      {
        type: 'input', //服务名
        field: 'krb5ServiceName',
        label: vm.$t('connection_kafka_kerberos_service_name'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'krb5',
                value: true
              }
            ],
            triggerConfig: {
              show: true,
              required: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('connection_form_database_username'),
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
        label: vm.$t('connection_form_database_password'),
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
        type: 'select', //加密方式
        field: 'kafkaSaslMechanism',
        label: vm.$t('connection_kafka_encryption'),
        show: true,
        options: [
          {
            label: 'PLAIN',
            value: 'PLAIN'
          },
          {
            label: 'SHA256',
            value: 'SHA256'
          },
          {
            label: 'SHA512',
            value: 'SHA512'
          }
        ],
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
        label: vm.$t('dataForm.form.kafka.lonoreFormat'),
        tips: vm.$t('connection_form_kafka_lonore_format_tip'),
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
        tips: vm.$t('connection_form_kafka_ignore_push_error_tip'),
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
        type: 'select',
        field: 'accessNodeType',
        label: vm.$t('connection_form_access_node'),
        options: [
          {
            label: vm.$t('connection_form_automatic'),
            value: 'AUTOMATIC_PLATFORM_ALLOCATION'
          },
          {
            label: vm.$t('connection_form_manual'),
            value: 'MANUALLY_SPECIFIED_BY_THE_USER'
          }
        ],
        tips: vm.$t('connection_form_access_node_tip'),
        required: true
      },
      {
        type: 'slot',
        slot: 'accessNodeProcessId',
        show: false,
        filterable: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'accessNodeType',
                value: 'MANUALLY_SPECIFIED_BY_THE_USER'
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      }
    ]
  }
}
