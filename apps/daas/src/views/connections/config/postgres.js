export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px'
    },
    defaultModel: {
      connection_type: 'source_and_target',
      thin_type: 'SID',
      supportUpdatePk: false,
      pgsql_log_decorder_plugin_name: 'wal2json_streaming'
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
      {
        type: 'input',
        field: 'database_port',
        label: vm.$t('dataForm.form.port'),
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error(vm.$t('dataForm.error.nonePort')))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error(vm.$t('dataForm.error.portNumber')))
              } else if (value < 1 || value > 65535) {
                callback(new Error(vm.$t('dataForm.error.portRange')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      // {
      // 	type: 'input',
      // 	field: 'database_host',
      // 	label: vm.$t('dataForm.form.host'),
      // 	rules: [
      // 		{
      // 			required: true,
      // 			validator: (rule, value, callback) => {
      // 				let port = vm.model['database_port'] || '';
      // 				if (!value || !value.trim()) {
      // 					callback(new Error(vm.$t('dataForm.error.noneHost')));
      // 				} else if (!port) {
      // 					callback(new Error(vm.$t('dataForm.error.nonePort')));
      // 				} else if (!/\d+/.test(port)) {
      // 					callback(new Error(vm.$t('dataForm.error.portNumber')));
      // 				} else if (port < 1 || port > 65535) {
      // 					callback(new Error(vm.$t('dataForm.error.portRange')));
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
      // 					placeholder: vm.$t('dataForm.form.port')
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
        type: 'input',
        field: 'database_name',
        label: vm.$t('dataForm.form.databaseName'),
        required: true
      },
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
      },
      {
        type: 'input',
        field: 'database_owner',
        label: vm.$t('dataForm.form.databaseOwner'),
        required: true
      },
      {
        type: 'select',
        field: 'pgsql_log_decorder_plugin_name',
        label: vm.$t('dataForm.form.plugin_name'),
        options: [
          { label: 'json streaming', value: 'wal2json_streaming' },
          { label: 'json streaming on rds', value: 'wal2json_rds_streaming' },
          { label: 'pgoutput', value: 'pgoutput' }
        ],
        show: true,
        required: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'target'
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      },
      {
        type: 'switch',
        field: 'schemaAutoUpdate',
        label: vm.$t('dataForm.form.ReloadSchema')
      },
      {
        type: 'input',
        field: 'table_filter',
        domType: 'textarea',
        label: vm.$t('dataForm.form.tableFilter'),
        tips: vm.$t('connection_form_database_owner_tip'),
        maxlength: 500,
        showWordLimit: true
      },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.$t('dataForm.form.additionalString')
      },
      {
        type: 'select',
        field: 'database_datetype_without_timezone',
        label: vm.$t('dataForm.form.timeZone'),
        tips: vm.$t('connection_form_impact_type'),
        options: [],
        show: true
      },
      {
        type: 'switch',
        field: 'supportUpdatePk',
        label: vm.$t('dataForm.form.supportUpdatePk'),
        show: true,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'connection_type',
                value: 'source'
              }
            ],
            triggerConfig: {
              show: false
            }
          }
        ]
      }
    ]
  }
}
