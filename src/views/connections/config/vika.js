export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm.form.connectionType'),
        options: [
          {
            label: vm.$t('dataForm.form.options.sourceAndTarget'),
            tip: vm.$t('dataForm.form.options.sourceAndTargetTips'),
            value: 'source_and_target'
          },
          {
            label: vm.$t('dataForm.form.options.source'),
            tip: vm.$t('dataForm.form.options.sourceTips'),
            value: 'source'
          },
          {
            label: vm.$t('dataForm.form.options.target'),
            tip: vm.$t('dataForm.form.options.targetTips'),
            value: 'target'
          }
        ],
        required: true
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
