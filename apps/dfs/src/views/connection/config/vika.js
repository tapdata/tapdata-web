export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'target',
      database_host: 'https://api.vika.cn/fusion/v1'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm_form_connectionType'),
        options: [
          {
            label: vm.$t('dataForm_form_options_target'),
            tip: vm.$t('dataForm_form_options_targetTips'),
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
        label: vm.$t('dataForm_form_host')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('connection_form_vika_plain_password'),
        domType: 'password',
        showPassword: true,
        required: true
      },
      {
        type: 'select',
        field: 'vika_space_id',
        label: vm.$t('connection_form_vika_vika_space_id'),
        options: [],
        required: true
      }
    ]
  }
}
