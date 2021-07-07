export default function(vm) {
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
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'collection_name',
        label: vm.$t('dataForm.form.restApi.collection_name'),
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
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
        field: 'unique_keys',
        label: vm.$t('dataForm.form.custom_connection.unique_keys'),
        required: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
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
        show: false,
        dependOn: [
          {
            triggerOptions: [
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
      }
    ]
  }
}
