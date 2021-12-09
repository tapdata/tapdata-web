export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      increamentalTps: 100,
      initialReadSize: 100000
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm.form.connectionType'),
        customClass: 'large-item',
        isVertical: false,
        button: true,
        outerTip: true,
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
        field: 'initialReadSize',
        label: vm.$t('dataForm.form.initialReadSize'),
        required: true
      },
      {
        type: 'input',
        field: 'increamentalTps',
        label: vm.$t('dataForm.form.incrementalTps'),
        required: true
      }
    ]
  }
}
