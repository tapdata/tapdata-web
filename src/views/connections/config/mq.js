/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/6/11
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
      {
        type: 'select',
        field: 'mqType',
        label: vm.$t('dataForm.form.mq.mqType'),
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
        field: 'mqQueueSet',
        label: vm.$t('dataForm.form.mq.mqQueueSet'),
        required: true
      },
      {
        type: 'slot',
        slot: 'queueTip'
      },
      {
        type: 'input',
        field: 'mqTopicSet',
        label: vm.$t('dataForm.form.mq.mqTopicSet'),
        required: true
      },
      {
        type: 'slot',
        slot: 'topicTip'
      },
      {
        type: 'input',
        field: 'brokerURL',
        label: 'BrokerURL',
        required: true,
        show: false,
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
        label: vm.$t('dataForm.form.mq.database_host'),
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
        label: vm.$t('dataForm.form.mq.database_port'),
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
        field: 'mqUserName',
        label: vm.$t('dataForm.form.userName'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'mqPassword',
        label: vm.$t('dataForm.form.password'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'routeKeyField',
        label: vm.$t('dataForm.form.mq.routeKeyField'),
        required: true,
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
        label: vm.$t('dataForm.form.mq.virtualHost'),
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
