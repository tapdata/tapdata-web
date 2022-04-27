/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/7/5
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
    },
    defaultModel: {
      connection_type: 'target'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('connection_form_connection_type'),
        options: [
          // {
          //   label: vm.$t('connection_form_source_and_target'),
          //   tip: vm.$t('connection_form_source_and_target_tip'),
          //   value: 'source_and_target'
          // },
          // {
          //   label: vm.$t('connection_form_source'),
          //   tip: vm.$t('connection_form_source_tip'),
          //   value: 'source'
          // },
          {
            label: vm.$t('connection_form_target'),
            tip: vm.$t('connection_form_target_tip'),
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
        type: 'input',
        field: 'database_host',
        label: vm.$t('connection_form_host'),
        tip: vm.$t('connection_form_kudu_host_tip'),
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
        ]
      },
      // {
      //   type: 'slot',
      //   slot: 'kududatabase'
      // },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('connection_form_database_username')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('connection_form_database_password'),
        domType: 'password',
        showPassword: true
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
