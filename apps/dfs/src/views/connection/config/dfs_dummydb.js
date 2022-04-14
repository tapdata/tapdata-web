export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
    },
    defaultModel: {
      connection_type: 'source',
      increamentalTps: 100,
      initialReadSize: 100000
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
          },
          {
            label: vm.$t('dataForm_form_options_target'),
            tip: vm.$t('dataForm_form_options_targetTips'),
            value: 'target'
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'initialReadSize',
        label: vm.$t('dataForm_form_initialReadSize'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm_error_portNumber')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'increamentalTps',
        label: vm.$t('dataForm_form_incrementalTps'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm_error_portNumber')))
              } else {
                callback()
              }
            }
          }
        ]
      }
    ]
  }
}
