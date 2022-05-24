export default function (vm) {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '160px',
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
        required: true,
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              if (!v || !v.trim()) {
                if (v) {
                  callback()
                }
                callback(new Error('The cluster name cannot be empty'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('connection_form_hazecast_plain_password'),
        domType: 'password',
        customClass: 'large-item',
        placeholder: 'Please enter the token',
        showPassword: true,
        required: true,
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              if (!v || !v.trim()) {
                if (v) {
                  callback()
                }
                callback(new Error('The token cannot be empty'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'switch',
        field: 'ssl',
        show: false,
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
        field: 'sslKey',
        fileNameField: 'sslKeyFile',
        accept: '.keystore',
        base64: true,
        noFileType: true,
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
                callback(new Error(vm.$t('connection_form_hazecast_none_sslKey')))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'file',
        field: 'sslCA',
        fileNameField: 'sslCAFile',
        accept: '.truststore',
        base64: true,
        noFileType: true,
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
              let value = vm.model.sslCA
              let ssl = vm.model.ssl
              if (ssl && (!value || !value.trim())) {
                if (v) {
                  callback()
                }
                callback(new Error(vm.$t('connection_form_hazecast_none_sslCA')))
              } else {
                callback()
              }
            }
          }
        ]
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
