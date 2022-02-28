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
        label: vm.$t('dataForm.form.connectionType'),
        options: [
          {
            label: vm.$t('dataForm.form.options.target'),
            tip: vm.$t('dataForm.form.options.targetTips'),
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
        label: vm.$t('dataForm.form.host')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: '接口鉴权Token',
        domType: 'password',
        showPassword: true,
        required: true
      },
      {
        type: 'select',
        field: 'vika_space_id',
        label: '空间站名称',
        options: [],
        required: true
      }
    ]
  }
}
