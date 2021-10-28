/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/6/11
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px'
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
      {
        type: 'select',
        field: 'mqType',
        label: vm.$t('dataForm.form.mq.mqType'),
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
        label: vm.$t('dataForm.form.connectionType'),
        customClass: 'large-item',
        isVertical: false,
        button: true,
        outerTip: true,
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
        required: true,
        tip: '多个队列用逗号隔开',
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
        field: 'mqTopicSet',
        show: true,
        label: vm.$t('dataForm.form.mq.mqTopicSet'),
        tip: '多个主题用逗号隔开',
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
        label: 'MQ连接串',
        required: true,
        show: false,
        tip: '示例tcp://127.0.0.1:61616,支持tcp,nio,udp,ssl,http(s)',
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
        label: '数据库地址',
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
        label: '端口',
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
        label: vm.$t('dataForm.form.userName')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm.form.password'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'routeKeyField',
        label: vm.$t('dataForm.form.mq.routeKeyField'),
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
