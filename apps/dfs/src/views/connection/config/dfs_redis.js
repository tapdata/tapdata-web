export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
    },
    defaultModel: {
      connection_type: 'target'
    },
    items: [
      // {
      //   type: 'radio',
      //   field: 'connection_type',
      //   label: vm.$t('dataForm_form_connectionType'),
      //   options: [
      //     {
      //       label: vm.$t('dataForm_form_options_target'),
      //       tip: vm.$t('dataForm_form_options_targetTips'),
      //       value: 'target'
      //     }
      //   ],
      //   required: true
      // },
      {
        type: 'input',
        field: 'database_host',

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
      // {
      //   type: 'input',
      //   field: 'database_username',
      //   label: vm.$t('dataForm_form_userName')
      // },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm_form_password'),
        domType: 'password'
      }
    ]
  }
}
