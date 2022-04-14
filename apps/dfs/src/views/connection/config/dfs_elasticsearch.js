export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
    },
    defaultModel: {
      connection_type: 'target',
      thin_type: 'SID',
      supportUpdatePk: false
    },
    items: [
      // {
      //   type: 'radio',
      //   field: 'connection_type',
      //   label: vm.$t('dataForm_form_connectionType'),
      //   options: [
      //     {
      //       label: vm.$t('dataForm_form_options_target'),
      //       tip: vm.$t('dataForm_form_options_targetTips'),
      //       value: 'target'
      //     }
      //   ],
      //   required: true
      // },
      // {
      // 	type: 'input',
      // 	field: 'database_host',
      // 	label: vm.$t('dataForm_form_host'),
      // 	rules: [
      // 		{
      // 			required: true,
      // 			validator: (rule, value, callback) => {
      // 				let port = vm.model['database_port'];
      // 				if (!value || !value.trim()) {
      // 					callback(new Error(vm.$t('dataForm_error_noneHost')));
      // 				} else if (!port) {
      // 					callback(new Error(vm.$t('dataForm_error_nonePort')));
      // 				} else if (!/\d+/.test(port)) {
      // 					callback(new Error(vm.$t('dataForm_error_portNumber')));
      // 				} else if (port < 1 || port > 65535) {
      // 					callback(new Error(vm.$t('dataForm_error_portRange')));
      // 				} else {
      // 					callback();
      // 				}
      // 			}
      // 		}
      // 	],
      // 	appendSlot: h => {
      // 		return h('FbInput', {
      // 			props: {
      // 				value: vm.model['database_port'],
      // 				config: {
      // 					placeholder: vm.$t('dataForm_form_port')
      // 				}
      // 			},
      // 			on: {
      // 				input(val) {
      // 					vm.model['database_port'] = val;
      // 				}
      // 			}
      // 		});
      // 	}
      // },
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

        label: vm.$t('dataForm_form_host'),
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value || !value.trim()) {
                callback(new Error(vm.$t('dataForm_error_noneHost')))
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
        label: vm.$t('dataForm_form_port'),
        customClass: 'small-item',
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(vm.$t('dataForm_error_nonePort')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm_error_portNumber')))
              } else if (value < 1 || value > 65535) {
                callback(new Error(vm.$t('dataForm_error_portRange')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      // {
      //   type: 'input',
      //   field: 'database_name',
      //   label: vm.$t('dataForm_form_indexPrefix'),
      //   required: true
      // },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('dataForm_form_userName'),
        showByUrl: 2
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm_form_password'),
        domType: 'password',
        showByUrl: 2
      },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.$t('dataForm_form_additionalString')
      }
    ]
  }
}
