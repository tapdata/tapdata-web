export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
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
        type: 'radio',
        field: 'isUrl',
        show: true,
        label: vm.$t('dataForm_form_options_connectionMode'),
        customClass: 'mongodb-item',
        isVertical: false,
        button: true,
        outerTip: true,
        options: [
          {
            label: vm.$t('dataForm_form_options_URIMode'),
            tip: vm.$t('dataForm_form_options_URIModeTips'),
            value: true,
            disabled: false
          },
          {
            label: vm.$t('dataForm_form_options_standardMode'),
            tip: vm.$t('connection_form_mongo_standard_mode_tip'),
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
        label: vm.$t('dataForm_form_databaseUri'),
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

        label: vm.$t('dataForm_form_host'),
        placeholder: vm.$t('connection_form_database_host_placeholder'),
        tip: vm.$t('connection_form_database_host_tips'),
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
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
        label: vm.$t('dataForm_form_databaseName'),
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
        label: vm.$t('dataForm_form_userName'),
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
        label: vm.$t('dataForm_form_password'),
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
        label: vm.$t('dataForm_form_additionalString'),
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
        label: vm.$t('dataForm_form_ssl'),
        customClass: 'mongodb-item',
        isVertical: false,
        button: true,
        outerTip: true,
        options: [
          {
            label: vm.$t('dataForm_form_options_sslTSL'),
            tip: vm.$t('dataForm_form_options_sslTSLTip'),
            value: true
          },
          {
            label: vm.$t('dataForm_form_options_sslTop'),
            tip: vm.$t('dataForm_form_options_sslTopTips'),
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
        label: vm.$t('dataForm_form_sslKey'),
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
            validator: (rule, value, callback) => {
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
                callback(new Error(vm.$t('dataForm_error_noneSslKey')))
              } else {
                callback()
              }
            }
          }
        ],
        on: {
          change(file) {
            vm.model['sslCert'] = file
          }
        }
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.$t('dataForm_form_sslPass'),
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
        label: vm.$t('dataForm_form_sslValidate'),
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
        label: vm.$t('dataForm_form_sslCA'),
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
                callback(new Error(vm.$t('dataForm_error_noneSslCA')))
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
