import i18n from '@/i18n'
export default function () {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '144px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'target'
    },
    items: [
      {
        type: 'radio',
        field: 'sync_type',
        label: i18n.t('task_setting_sync_type'),
        options: [
          {
            label: i18n.t('task_setting_initial_sync_cdc'),
            tip: i18n.t('task_setting_initial_sync_cdc_tip'),
            value: 'initial_sync+cdc'
          },
          {
            label: i18n.t('task_setting_initial_sync'),
            tip: i18n.t('task_setting_initial_sync_tip'),
            value: 'initial_sync'
          },
          {
            label: i18n.t('task_setting_cdc'),
            tip: i18n.t('task_setting_cdc_tip'),
            value: 'cdc'
          }
        ],
        required: true,
        isVertical: false,
        button: true,
        outerTip: true
      },
      {
        type: 'radio',
        field: 'distinctWriteType',
        label: i18n.t('task_setting_full_write_mode'),
        options: [
          {
            label: i18n.t('task_setting_update_write_mode'),
            tip: i18n.t('task_setting_update_write_mode_tip'),
            value: 'intellect'
          },
          {
            label: i18n.t('task_setting_remoive_rewrite_mode'),
            tip: i18n.t('task_setting_remoive_rewrite_mode_tip'),
            value: 'compel'
          }
        ],
        required: true,
        isVertical: false,
        button: true,
        outerTip: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'sync_type',
                value: 'cdc'
              }
            ],
            triggerConfig: {
              value: 'intellect',
              options: [
                {
                  label: i18n.t('task_setting_update_write_mode'),
                  tip: i18n.t('task_setting_update_write_mode_tip'),
                  value: 'intellect'
                }
              ]
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'readBatchSize',
        label: i18n.t('task_setting_read_number'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(i18n.t('task_setting_read_number_cannot_empty')))
              } else if (value < 1 || value > 999999) {
                callback(new Error(i18n.t('task_setting_read_number_ranges')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(i18n.t('task_setting_read_number_only_number')))
              } else {
                callback()
              }
            }
          }
        ],
        customClass: 'read-batch-size'
      },
      {
        type: 'switch',
        field: 'stopOnError',
        label: i18n.t('task_setting_stop_on_error')
      },
      {
        type: 'switch',
        field: 'cdcConcurrency',
        label: i18n.t('task_setting_incremental_concurrency_switch'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'sync_type',
                value: 'initial_sync'
              }
            ],
            triggerConfig: {
              show: false
            }
          },
          {
            triggerOptions: [
              {
                field: 'noPrimaryKey',
                value: true
              }
            ],
            triggerConfig: {
              value: false
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'transformerConcurrency',
        label: i18n.t('task_setting_incremental_concurrency'),
        required: true,
        show: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(i18n.t('task_setting_incremental_concurrency_cannot_empty')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(i18n.t('task_setting_incremental_concurrency_only_number')))
              } else {
                callback()
              }
            }
          }
        ],
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'cdcConcurrency',
                value: false
              }
            ],
            triggerConfig: {
              show: false
            }
          },
          {
            triggerOptions: [
              {
                field: 'sync_type',
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
        type: 'switch',
        field: 'noPrimaryKey',
        label: i18n.t('task_setting_no_primary_sync_switch'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'sync_type',
                value: 'initial_sync'
              }
            ],
            triggerConfig: {
              show: false
            }
          },
          {
            triggerOptions: [
              {
                field: 'cdcConcurrency',
                value: true
              }
            ],
            triggerConfig: {
              value: false
            }
          }
        ]
      },
      // {
      //   type: 'switch',
      //   field: 'bidirectional',
      //   label: i18n.t('task_setting_two_way_switch'),
      //   show: false
      // },
      {
        type: 'switch',
        field: 'isOpenAutoDDL',
        label: i18n.t('task_setting_automatic_ddl'),
        show: true,
        tip: i18n.t('task_setting_automatic_ddl_tip')
      },
      {
        type: 'switch',
        field: 'needToCreateIndex',
        label: i18n.t('task_setting_automatic_index'),
        show: false
      },
      {
        type: 'slot',
        field: 'syncPoints',
        slot: 'syncPoints',
        label: i18n.t('task_setting_sync_points'),
        show: false
      },
      {
        type: 'slot',
        field: 'cronExpression',
        slot: 'cronExpression',
        label: i18n.t('task_setting_cron_expression'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'sync_type',
                value: 'initial_sync'
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
        field: 'scheduleTime',
        slot: 'scheduleTime',
        label: i18n.t('task_setting_schedule_time'),
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'sync_type',
                value: 'initial_sync+cdc'
              }
            ],
            triggerConfig: {
              show: true
            }
          },
          {
            triggerOptions: [
              {
                field: 'sync_type',
                value: 'cdc'
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
