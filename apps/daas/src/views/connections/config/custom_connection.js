export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
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
        label: vm.$t('connection_form_connection_type'),
        options: [
          {
            label: vm.$t('connection_form_source'),
            tip: vm.$t('connection_form_source_tip'),
            value: 'source'
          },
          {
            label: vm.$t('connection_form_target'),
            tip: vm.$t('connection_form_target_tip'),
            value: 'target'
          },
          {
            label: vm.$t('connection_form_source_and_target'),
            tip: vm.$t('connection_form_source_and_target_tip'),
            value: 'source_and_target'
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
      // {
      //   type: 'input',
      //   field: 'connectionTimeOut',
      //   label: vm.$t('connection_form_custom_connection_connection_time_out'),
      //   rules: [
      //     {
      //       required: true,
      //       validator(rule, value, callback) {
      //         if (!value) {
      //           callback(new Error(vm.$t('tips_not_null')))
      //         } else if (!/^\d+$/.test(value)) {
      //           callback(new Error(vm.$t('tips_must_number')))
      //         } else {
      //           callback()
      //         }
      //       }
      //     }
      //   ]
      // },
      // {
      //   type: 'input',
      //   field: 'readTimeOut',
      //   label: vm.$t('connection_form_custom_connection_read_time_out'),
      //   rules: [
      //     {
      //       required: true,
      //       validator(rule, value, callback) {
      //         if (!value) {
      //           callback(new Error(vm.$t('tips_not_null')))
      //         } else if (!/^\d+$/.test(value)) {
      //           callback(new Error(vm.$t('tips_must_number')))
      //         } else {
      //           callback()
      //         }
      //       }
      //     }
      //   ]
      // },
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
        type: 'select',
        field: 'jsEngineName',
        label: 'JS引擎版本',
        options: [
          {
            label: '新版',
            value: 'graal.js'
          },
          {
            label: '旧版',
            value: 'nashorn'
          }
        ],
        required: true
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
      },
      {
        type: 'select',
        field: 'accessNodeType',
        label: vm.$t('connection_form_access_node'),
        options: [
          {
            label: vm.$t('connection_form_automatic'),
            value: 'AUTOMATIC_PLATFORM_ALLOCATION'
          },
          {
            label: vm.$t('connection_form_manual'),
            value: 'MANUALLY_SPECIFIED_BY_THE_USER'
          }
        ],
        tips: vm.$t('connection_form_access_node_tip'),
        required: true
      },
      {
        type: 'slot',
        slot: 'accessNodeProcessId',
        show: false,
        filterable: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'accessNodeType',
                value: 'MANUALLY_SPECIFIED_BY_THE_USER'
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
