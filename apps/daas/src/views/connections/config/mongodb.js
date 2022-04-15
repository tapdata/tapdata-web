export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      isUrl: true,
      ssl: false
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
        required: true,
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
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
        ],
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
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
          },
          {
            field: 'sslKey',
            byValue: true,
            value: ''
          },
          {
            field: 'sslPass',
            byValue: true,
            value: ''
          }
        ],
        isVertical: false,
        button: true,
        outerTip: true,
        customClass: 'large-item'
      },
      {
        type: 'file',
        field: 'sslKey',
        fileNameField: 'sslKeyFile',
        label: vm.$t('dataForm.form.sslKey'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: false
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
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
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: false
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'switch',
        field: 'sslValidate',
        label: vm.$t('dataForm.form.sslValidate'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: false
              }
            ],
            triggerConfig: {
              show: false
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
        tips: vm.$t('connection_form_impact_type'),
        maxlength: 500,
        showWordLimit: true
      },
      {
        type: 'switch',
        field: 'shareCdcEnable',
        label: vm.$t('connection_form_shared_mining'),
        tips: vm.$t('connection_form_shared_mining_tip'),
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
        type: 'switch',
        field: 'showShareConfig',
        show: false
      },
      {
        type: 'select',
        field: 'persistenceMongodb_uri_db',
        label: vm.$t('share_form_setting_connection_name'),
        options: [],
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'shareCdcEnable',
                value: true
              },
              {
                field: 'showShareConfig',
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
        slot: 'shareCdc-tip',
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'shareCdcEnable',
                value: true
              },
              {
                field: 'showShareConfig',
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
        type: 'select',
        field: 'persistenceMongodb_collection',
        label: vm.$t('share_form_setting_table_name'),
        options: [],
        allowCreate: true,
        filterable: true,
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'shareCdcEnable',
                value: true
              },
              {
                field: 'showShareConfig',
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
        type: 'select',
        field: 'share_cdc_ttl_day',
        label: vm.$t('share_form_setting_log_time'),
        options: [],
        required: true,
        show: false,
        allowCreate: true,
        filterable: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'shareCdcEnable',
                value: true
              },
              {
                field: 'showShareConfig',
                value: true
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
