export default function (vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
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
        label: vm.$t('dataForm.form.connectionType'),
        options: [
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
        field: 'initialReadSize',
        label: '初始化数据大小',
        required: true
      },
      {
        type: 'input',
        field: 'increamentalTps',
        label: '测试速率',
        required: true
      }
    ]
  }
}
