export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      sourceType: 'dds',
      isUrl: false,
      ssl: false,
      sslValidate: false
    },
    items: [
      {
        type: 'radio',
        field: 'isUrl',
        show: true,
        label: vm.$t('dataForm.form.options.connectionMode'),
        customClass: 'mongodb-item',
        isVertical: false,
        button: true,
        outerTip: true,
        options: [
          {
            label: vm.$t('dataForm.form.options.URIMode'),
            tip: vm.$t('dataForm.form.options.URIModeTips'),
            value: true,
            disabled: false
          },
          {
            label: vm.$t('dataForm.form.options.standardMode'),
            tip: '此模式将连接网络中的单独服务器，该服务器提供到数据库的TSL/SSL通道。如果您的数据库位于不可访问的子网中，则可尝试使用此方法',
            value: false,
            disabled: false
          }
        ],
        influences: [
          {
            field: 'database_uri',
            byValue: false,
            value: ''
          },
          {
            field: 'database_host',

            byValue: true,
            value: ''
          },
          {
            field: 'database_name',
            byValue: true,
            value: ''
          },
          {
            field: 'database_username',
            byValue: true,
            value: ''
          },
          {
            field: 'database_password',
            byValue: true,
            value: ''
          },
          {
            field: 'additionalString',
            byValue: true,
            value: ''
          }
        ]
      },
      {
        type: 'input',
        field: 'database_uri',
        label: vm.$t('dataForm.form.databaseUri'),
        domType: 'textarea',
        required: true,
        show: false,
        customClass: 'large-item',
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'isUrl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      },
      {
        type: 'slot',
        slot: 'urlTip',
        show: false,
        customClass: 'mongodb-tip-item',
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'isUrl',
                value: true
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

        label: vm.$t('dataForm.form.host'),
        placeholder: vm.$t('connection_form_database_host_placeholder'),
        tip: vm.$t('connection_form_database_host_tips'),
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
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
                field: 'isUrl',
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
        field: 'database_name',
        label: vm.$t('dataForm.form.databaseName'),
        required: true,
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'isUrl',
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
        field: 'database_username',
        label: vm.$t('dataForm.form.userName'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'isUrl',
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
        label: vm.$t('dataForm.form.password'),
        domType: 'password',
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'isUrl',
                value: true
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ],
        showPassword: true
      },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.$t('dataForm.form.additionalString'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'isUrl',
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
        type: 'radio',
        field: 'ssl',
        label: vm.$t('dataForm.form.ssl'),
        customClass: 'mongodb-item',
        isVertical: false,
        button: true,
        outerTip: true,
        options: [
          {
            label: vm.$t('dataForm.form.options.sslTSL'),
            tip: vm.$t('dataForm.form.options.sslTSLTip'),
            value: true
          },
          {
            label: vm.$t('dataForm.form.options.sslTop'),
            tip: vm.$t('dataForm.form.options.sslTopTips'),
            value: false
          }
        ],
        influences: [
          {
            field: 'sslKeyFile',
            byValue: false,
            value: ''
          },
          {
            field: 'sslPass',
            byValue: true,
            value: ''
          }
        ]
      },
      {
        type: 'file',
        field: 'sslKey',
        fileNameField: 'sslKeyFile',
        label: vm.$t('dataForm.form.sslKey'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
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
            validator: (rule, v, callback) => {
              let value = vm.model.sslKey
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
                if (v) {
                  callback()
                }
                callback(new Error(vm.$t('dataForm.error.noneSslKey')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.$t('dataForm.form.sslPass'),
        domType: 'password',
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        showPassword: true
      },
      {
        type: 'switch',
        field: 'sslValidate',
        label: vm.$t('dataForm.form.sslValidate'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        influences: [
          {
            field: 'sslCAFile',
            byValue: false,
            value: ''
          }
        ]
      },
      {
        type: 'file',
        field: 'sslCA',
        fileNameField: 'sslCAFile',
        label: vm.$t('dataForm.form.sslCA'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              },
              {
                field: 'sslValidate',
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
            validator: (rule, v, callback) => {
              let ssl = vm.model.sslValidate
              if (ssl && !v) {
                callback(new Error(vm.$t('dataForm.error.noneSslCA')))
              } else {
                callback()
              }
            }
          }
        ]
      }
    ]
  }
}
