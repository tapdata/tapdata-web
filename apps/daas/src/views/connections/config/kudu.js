/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/7/5
 * @description
 */
export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
    },
    defaultModel: {
      connection_type: 'target'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm.form.connectionType'),
        options: [
          // {
          //   label: vm.$t('dataForm.form.options.sourceAndTarget'),
          //   tip: vm.$t('dataForm.form.options.sourceAndTargetTips'),
          //   value: 'source_and_target'
          // },
          // {
          //   label: vm.$t('dataForm.form.options.source'),
          //   tip: vm.$t('dataForm.form.options.sourceTips'),
          //   value: 'source'
          // },
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
        label: vm.$t('dataForm.form.host'),
        tip: vm.$t('connection_form_kudu_host_tip'),
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
      // {
      //   type: 'slot',
      //   slot: 'kududatabase'
      // },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('dataForm.form.userName')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm.form.password'),
        domType: 'password',
        showPassword: true
      }
    ]
  }
}
