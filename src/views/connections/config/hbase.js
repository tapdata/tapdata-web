/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/7/5
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source'
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
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'database_host',

        label: vm.$t('dataForm.form.host'),
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
      {
        type: 'input',
        field: 'database_port',
        label: vm.$t('dataForm.form.port'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(vm.$t('dataForm.error.nonePort')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm.error.portNumber')))
              } else if (value < 1 || value > 65535) {
                callback(new Error(vm.$t('dataForm.error.portRange')))
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
        label: vm.$t('dataForm.form.databaseName'),
        required: true
      }
    ]
  }
}
