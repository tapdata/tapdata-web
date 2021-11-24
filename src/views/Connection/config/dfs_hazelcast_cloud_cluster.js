export default function (vm) {
  const fileChange = (file, field, field2) => {
    if (file) {
      let reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        let text = reader.result
        vm.model[field] = text
        if (field2) {
          vm.model[field2] = text
        }
      }
    } else {
      vm.model[field] = ''
    }
  }
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'target'
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('connection_form_hazecast_connection_type'),
        customClass: 'large-item',
        isVertical: false,
        button: true,
        outerTip: true,
        options: [
          {
            label: vm.$t('connection_form_hazecast_options_target'),
            tip: vm.$t('connection_form_hazecast_options_target_tips'),
            value: 'target'
          }
        ],
        required: true
      },
      {
        type: 'input',
        field: 'database_name',
        label: vm.$t('connection_form_hazecast_database_name'),
        placeholder: 'Please enter the cluster name',
        required: true
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('connection_form_hazecast_plain_password'),
        domType: 'password',
        placeholder: 'Please enter the token',
        showPassword: true
      },
      {
        type: 'switch',
        field: 'ssl',
        label: vm.$t('connection_form_hazecast_ssl'),
        influences: [
          {
            field: 'sslKeyFile',
            byValue: false,
            value: ''
          },
          {
            field: 'sslPass',
            byValue: true,
            value: ''
          }
        ]
      },
      {
        type: 'file',
        field: 'sslKeyFile',
        placeholder: 'Please upload files',
        label: vm.$t('connection_form_hazecast_sslKey'),
        buttonText: 'Select',
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              let value = vm.model.sslKey
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
                if (v) {
                  callback()
                }
                callback(new Error(vm.$t('dataForm.error.noneSslKey')))
              } else {
                callback()
              }
            }
          }
        ],
        on: {
          change(file) {
            fileChange(file, 'sslKey', 'sslCert')
          }
        }
      },
      {
        type: 'file',
        field: 'sslCAFile',
        label: vm.$t('connection_form_hazecast_sslCA'),
        placeholder: 'Please upload files',
        buttonText: 'Select',
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ],
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              let ssl = vm.model.sslValidate
              if (ssl && !v) {
                callback(new Error(vm.$t('dataForm.error.noneSslCA')))
              } else {
                callback()
              }
            }
          }
        ],
        on: {
          change(file) {
            fileChange(file, 'sslCA')
          }
        }
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.$t('connection_form_hazecast_sslPass'),
        domType: 'password',
        placeholder: 'Please enter the key file Password',
        showPassword: true,
        show: false,
        dependOn: [
          {
            triggerOptions: [
              {
                field: 'ssl',
                value: true
              }
            ],
            triggerConfig: {
              show: true
            }
          }
        ]
      }
    ]
  }
}
