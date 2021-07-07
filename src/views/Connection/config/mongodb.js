export default function(vm) {
  const fileChange = (file, field) => {
    if (file) {
      let reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        let text = reader.result
        vm.model[field] = text
      }
    } else {
      vm.model[field] = ''
    }
  }
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      isUrl: true,
      ssl: false,
      sslValidate: false
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
        type: 'radio',
        field: 'isUrl',
        label: vm.$t('dataForm.form.options.connectionMode'),
        options: [
          {
            label: vm.$t('dataForm.form.options.URIMode'),
            tip: vm.$t('dataForm.form.options.URIModeTips'),
            value: true,
            disabled: false
          },
          {
            label: vm.$t('dataForm.form.options.standardMode'),
            tip: vm.$t('dataForm.form.options.standardModeTips'),
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
        slot: 'urlTip'
      },
      {
        type: 'input',
        field: 'database_host',

        label: vm.$t('dataForm.form.host'),
        placeholder: vm.$t('dataForm.form.databaseHostPlaceholder'),
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
        field: 'sslKeyFile',
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
        ],
        on: {
          change(file) {
            fileChange(file, 'sslKey')
          }
        }
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.$t('dataForm.form.sslPass'),
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
        ]
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
        field: 'sslCAFile',
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
        ],
        on: {
          change(file) {
            fileChange(file, 'sslCA')
          }
        }
      },
      {
        type: 'switch',
        field: 'schemaAutoUpdate',
        label: vm.$t('dataForm.form.ReloadSchema')
      },
      {
        type: 'input',
        field: 'table_filter',
        domType: 'textarea',
        label: vm.$t('dataForm.form.tableFilter'),
        //tips: vm.$t('dataForm.form.tableFilterTips'),
        maxlength: 500,
        showWordLimit: true
      },
      {
        type: 'slot',
        slot: 'tableFilter'
      }
    ]
  }
}
