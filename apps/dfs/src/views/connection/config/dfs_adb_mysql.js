export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'source'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm_form_connectionType'),
        customClass: 'large-item',
        isVertical: false,
        button: true,
        outerTip: true,
        options: [
          {
            label: vm.$t('dataForm_form_options_source'),
            tip: vm.$t('dataForm_form_options_sourceTips'),
            value: 'source'
          }
          // {
          //   label: vm.$t('dataForm_form_options_target'),
          //   tip: vm.$t('dataForm_form_options_targetTips'),
          //   value: 'target'
          // }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'database_host',

        disabled: false,
        label: vm.$t('dataForm_form_host'),
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value || !value.trim()) {
                callback(new Error(vm.$t('dataForm_error_noneHost')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'database_port',
        customClass: 'small-item',
        label: vm.$t('dataForm_form_port'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(vm.$t('dataForm_error_nonePort')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm_error_portNumber')))
              } else if (value < 1 || value > 65535) {
                callback(new Error(vm.$t('dataForm_error_portRange')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'database_name',
        label: vm.$t('dataForm_form_databaseName'),
        required: true
      },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('dataForm_form_userName')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm_form_password'),
        domType: 'password',
        showPassword: true
      },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.$t('dataForm_form_additionalString')
      },
      {
        type: 'select',
        field: 'database_datetype_without_timezone',
        label: vm.$t('dataForm_form_timeZone'),
        //tips: vm.$t('dataForm_form_timeZoneTips'),
        options: [],
        show: true,
        tip: vm.$t('connection_form_impact_type')
      }
    ]
  }
}
