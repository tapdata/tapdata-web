export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px'
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
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
        type: 'select',
        field: 'database_datetype_without_timezone',
        label: vm.$t('dataForm_form_timeZone'),
        //tips: vm.$t('dataForm_form_timeZoneTips'),
        options: [],
        show: true
      },
      {
        type: 'slot',
        slot: 'timezone',
        show: true
      }
    ]
  }
}
