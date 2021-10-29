export default function (vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source',
      request_interval: 5,
      custom_type: 'initial_sync'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm.form.connectionType'),
        options: [
          {
            label: vm.$t('dataForm.form.options.source'),
            tip: vm.$t('dataForm.form.options.sourceTips'),
            value: 'source'
          },
          {
            label: vm.$t('dataForm.form.options.target'),
            tip: vm.$t('dataForm.form.options.targetTips'),
            value: 'target'
          },
          {
            label: vm.$t('dataForm.form.options.sourceAndTarget'),
            tip: vm.$t('dataForm.form.options.sourceAndTargetTips'),
            value: 'source_and_target'
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'collection_name',
        label: vm.$t('dataForm.form.restApi.collection_name'),
        required: true,
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
        type: 'input',
        field: 'unique_keys',
        label: vm.$t('dataForm.form.custom_connection.unique_keys'),
        required: true,
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
        type: 'select',
        field: 'custom_type',
        label: vm.$t('dataForm.form.custom_connection.sync_type'),
        options: [
          {
            label: vm.$t('dataForm.form.custom_connection.history_data'),
            value: 'initial_sync'
          },
          {
            label: vm.$t('dataForm.form.custom_connection.increamental_data'),
            value: 'cdc'
          },
          {
            label: vm.$t('dataForm.form.custom_connection.history_increamental_data'),
            value: 'initial_sync+cdc'
          }
        ],
        required: true,
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
        field: 'custom_before_opr',
        label: vm.$t('connection_form_custom_connection_before_operate')
      },
      {
        type: 'slot',
        slot: 'custom_before_script',
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'custom_before_opr',
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
        type: 'slot',
        slot: 'targetScrip',
        label: vm.$t('dataForm.form.custom_connection.on_data_code'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
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
        type: 'slot',
        slot: 'cdcScrip',
        label: vm.$t('dataForm.form.custom_connection.cdc_custom_code'),
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
          },
          {
            triggerOptions: [
              {
                field: 'custom_type',
                value: 'initial_sync'
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'slot',
        slot: 'historyScrip',
        label: vm.$t('dataForm.form.custom_connection.history_custom_code'),
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
          },
          {
            triggerOptions: [
              {
                field: 'custom_type',
                value: 'cdc'
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
        field: 'custom_after_opr',
        label: vm.$t('connection_form_custom_connection_after_operate')
      },
      {
        type: 'slot',
        slot: 'custom_after_script',
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'custom_after_opr',
                value: false
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
