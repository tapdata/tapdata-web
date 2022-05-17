export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '180px'
    },
    defaultModel: {
      connection_type: 'target'
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
            label: vm.$t('dataForm_form_options_target'),
            tip: vm.$t('dataForm_form_options_targetTips'),
            value: 'target'
          }
        ],
        required: true
      },
      // {
      // 	type: 'input',
      // 	field: 'database_host',
      // 	label: vm.$t('dataForm_form_host'),
      // 	rules: [
      // 		{
      // 			required: true,
      // 			validator(rule, value, callback) {
      // 				let port = this.value['database_port'];
      // 				if (!value || !value.trim()) {
      // 					callback(new Error(vm.$t('dataForm_error_noneHost')));
      // 				} else if (!port) {
      // 					callback(new Error(vm.$t('dataForm_error_nonePort')));
      // 				} else if (!/^\d+$/.test(port)) {
      // 					callback(new Error(vm.$t('dataForm_error_portNumber')));
      // 				} else if (port < 1 || port > 65535) {
      // 					callback(new Error(vm.$t('dataForm_error_portRange')));
      // 				} else {
      // 					callback();
      // 				}
      // 			}
      // 		}
      // 	],
      // 	appendSlot: (h, data) => {
      // 		return h('FbInput', {
      // 			props: {
      // 				value: data['database_port'],
      // 				config: {
      // 					placeholder: vm.$t('dataForm_form_port')
      // 				}
      // 			},
      // 			on: {
      // 				input(val) {
      // 					data['database_port'] = val;
      // 				}
      // 			}
      // 		});
      // 	}
      // },
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
      {
        type: 'input',
        field: 'database_name',
        label: vm.$t('dataForm_form_databaseName'),
        required: true
      },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('dataForm_form_userName')
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm_form_password'),
        domType: 'password',
        showPassword: true
      },
      // {
      //   type: 'switch',
      //   field: 'schemaAutoUpdate',
      //   label: vm.$t('dataForm_form_ReloadSchema')
      // },
      // {
      //   type: 'input',
      //   field: 'table_filter',
      //   domType: 'textarea',
      //   label: vm.$t('dataForm_form_tableFilter'),
      //   tip: vm.$t('dataForm_form_tableFilterTips'),
      //   maxlength: 500,
      //   showWordLimit: true
      // },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.$t('dataForm_form_additionalString')
      },
      {
        type: 'select',
        field: 'database_datetype_without_timezone',
        label: vm.$t('dataForm_form_timeZone'),
        tip: vm.$t('dataForm_form_timeZoneTips'),
        options: [],
        show: true
      }
    ]
  }
}
