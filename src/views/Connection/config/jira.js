export default function(vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.t('dataForm.form.connectionType'),
        options: [
          {
            label: vm.t('dataForm.form.options.sourceAndTarget'),
            tip: vm.t('dataForm.form.options.sourceAndTargetTips'),
            value: 'source_and_target'
          },
          {
            label: vm.t('dataForm.form.options.source'),
            tip: vm.t('dataForm.form.options.sourceTips'),
            value: 'source'
          },
          {
            label: vm.t('dataForm.form.options.target'),
            tip: vm.t('dataForm.form.options.targetTips'),
            value: 'target'
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'jiraUrl',
        label: '数据库地址',
        required: true
      },
      {
        type: 'input',
        field: 'jiraUsername',
        label: vm.t('dataForm.form.userName')
      },
      {
        type: 'input',
        field: 'jiraPassword',
        label: vm.t('dataForm.form.password'),
        domType: 'password',
        showPassword: true
      }
    ]
  }
}
