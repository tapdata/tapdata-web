/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/6/11
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
      {
        type: 'select',
        field: 'mqType',
        label: vm.$t('connection_form_mq_type'),
        options: [
          {
            label: 'ActiveMQ',
            value: '0'
          },
          {
            label: 'RabbitMQ',
            value: '1'
          },
          {
            label: 'RocketMQ',
            value: '2'
          }
        ],
        required: true
      },
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
        field: 'mqTopicSet',
        show: true,
        label: vm.$t('connection_form_mq_topic_set'),
        tip: vm.$t('connection_form_mq_topic_tip'),
        required: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '1'
              }
            ],
            triggerConfig: {
              show: false
            }
          },
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '0'
              }
            ],
            triggerConfig: {
              required: false
            }
          },
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'target'
              }
            ],
            triggerConfig: {
              required: false
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'mqQueueSet',
        label: vm.$t('connection_form_mq_queue_set'),
        show: true,
        required: false,
        tip: vm.$t('connection_form_mq_queue_tip'),
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '2'
              }
            ],
            triggerConfig: {
              show: false
            }
          },
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '1'
              }
            ],
            triggerConfig: {
              required: true
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'brokerURL',
        label: vm.$t('connection_form_mq_broker_url'),
        required: true,
        show: false,
        tip: vm.$t('connection_form_mq_broker_url_tip'),
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '0'
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
        field: 'database_host',
        label: vm.$t('connection_form_mq_database_host'),
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value || !value.trim()) {
                callback(new Error(vm.$t('dataForm.error.noneHost')))
              } else {
                callback()
              }
            }
          }
        ],
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '0'
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
        field: 'database_port',
        label: vm.$t('connection_form_mq_database_port'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(vm.$t('dataForm.error.nonePort')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm.error.portNumber')))
              } else if (value < 1 || value > 65535) {
                callback(new Error(vm.$t('dataForm.error.portRange')))
              } else {
                callback()
              }
            }
          }
        ],
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '0'
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
        field: 'productGroup',
        label: vm.$t('connection_form_mq_producer_group'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '2'
              },
              {
                field: 'connection_type',
                value: 'source_and_target'
              }
            ],
            triggerConfig: {
              show: true
            }
          },
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '2'
              },
              {
                field: 'connection_type',
                value: 'target'
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
        field: 'consumerGroup',
        label: vm.$t('connection_form_mq_consumer_group'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '2'
              },
              {
                field: 'connection_type',
                value: 'source_and_target'
              }
            ],
            triggerConfig: {
              show: true
            }
          },
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '2'
              },
              {
                field: 'connection_type',
                value: 'source'
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
        field: 'database_username',
        label: vm.$t('connection_form_user_name')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('connection_form_password'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'routeKeyField',
        label: vm.$t('connection_form_mq_route_key_field'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '1'
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
        field: 'virtualHost',
        label: vm.$t('connection_form_mq_virtual_host'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '1'
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
