export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'target',
      database_host: 'https://api.qingflow.com'
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
        label: 'accessToken',
        domType: 'password',
        showPassword: true,
        required: true
      },
      {
        type: 'input',
        field: 'qingFlowUserId',
        label: '用户ID',
        required: true
      },
      {
        type: 'select',
        field: 'qingFlowTagId',
        label: '应用包名称',
        options: [],
        required: true
      }
    ]
  }
}
