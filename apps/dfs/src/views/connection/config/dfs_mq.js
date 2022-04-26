/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/6/11
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      mqQueueOrTopic: 'Topic'
    },
    items: [
      {
        type: 'select',
        field: 'mqType',
        label: vm.$t('dataForm_form_mq_mqType'),
        customClass: 'large-item',
        isVertical: false,
        button: true,
        outerTip: true,
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
        label: vm.$t('dataForm_form_connectionType'),
        customClass: 'large-item',
        isVertical: false,
        button: true,
        outerTip: true,
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
        required: true
      },
      {
        type: 'slot',
        slot: 'mqQueueOrTopic',
        label: '主题/队列名称',
        required: true
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
          },
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '1'
              }
            ],
            triggerConfig: {
              value: ''
            }
          },
          {
            triggerOptions: [
              {
                field: 'mqType',
                value: '2'
              }
            ],
            triggerConfig: {
              value: ''
            }
          }
        ]
      },
      // {
      //   type: 'input',
      //   field: 'nameSrvAddr',
      //   label: 'nameSrvAddr',
      //   required: true,
      //   show: false,
      //   dependOn: [
      //     {
      //       triggerOptions: [
      //         {
      //           field: 'mqType',
      //           value: '2'
      //         }
      //       ],
      //       triggerConfig: {
      //         show: true
      //       }
      //     }
      //   ]
      // },
      {
        type: 'input',
        field: 'database_host',
        label: vm.$t('connection_form_database_address'),
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value || !value.trim()) {
                callback(new Error(vm.$t('dataForm_error_noneHost')))
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
              show: false,
              value: ''
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'database_port',
        label: vm.$t('connection_form_port'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(vm.$t('dataForm_error_nonePort')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm_error_portNumber')))
              } else if (value < 1 || value > 65535) {
                callback(new Error(vm.$t('dataForm_error_portRange')))
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
              show: false,
              value: ''
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'mqUserName',
        label: vm.$t('dataForm_form_userName')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm_form_password'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'routeKeyField',
        label: vm.$t('dataForm_form_mq_routeKeyField'),
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
        label: vm.$t('dataForm_form_mq_virtualHost'),
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
