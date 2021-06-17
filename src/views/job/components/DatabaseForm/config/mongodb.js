export default function (vm) {
  const fileChange = (file, field) => {
    if (file) {
      let reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        let text = reader.result
        vm.model[field] = text
      }
    } else {
      vm.model[field] = ''
    }
  }
  return {
    defaultModel: {
      connection_type: 'source_and_target',
      isUrl: true,
      ssl: false,
      sslValidate: false
    },
    checkItems() {
      let vm = this
      let isUrl = vm.model.isUrl
      let ssl = vm.model.ssl
      let sslValidate = vm.model.sslValidate
      vm.$nextTick(() => {
        vm.config.items = vm.config.items.map(item => {
          if (item.showByUrl) {
            item.show = item.showByUrl === 1 ? isUrl : !isUrl
          }
          if (item.showWhenSslTrue) {
            item.show = ssl
          }
          if (item.showWhenSslValidateTrue) {
            item.show = ssl && sslValidate
          }
          if (item.show === false) {
            vm.model[item.field] = item.type === 'switch' ? false : ''
            if (['sslKey', 'sslCA'].includes(item.field)) {
              vm.model[item.field + 'File'] = null
            }
          }
          return item
        })
        vm.$refs.form.$forceUpdate()
      })
    },
    items: [
      {
        type: 'radio',
        field: 'connection_type',
        label: vm.$t('dataForm.form.connectionType'),
        options: [
          {
            label: vm.$t('dataForm.form.options.sourceAndTarget'),
            value: 'source_and_target'
          },
          { label: vm.$t('dataForm.form.options.source'), value: 'source' },
          { label: vm.$t('dataForm.form.options.target'), value: 'target' }
        ],
        required: true
      },
      {
        type: 'switch',
        field: 'isUrl',
        label: vm.$t('dataForm.form.isUrl'),
        on: {
          change() {
            vm.checkItems()
          }
        }
      },
      {
        type: 'input',
        field: 'database_uri',
        label: vm.$t('dataForm.form.databaseUri'),
        domType: 'textarea',
        showByUrl: 1,
        required: true,
        tips: vm.$t('dataForm.form.uriTips.content')
      },
      {
        type: 'input',
        field: 'database_host',

        label: vm.$t('dataForm.form.host'),
        placeholder: vm.$t('dataForm.form.databaseHostPlaceholder'),
        showByUrl: 2,
        show: false,
        rules: [
          {
            required: true,
            validator: (rule, value, callback) => {
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
        field: 'database_name',
        label: vm.$t('dataForm.form.databaseName'),
        showByUrl: 2,
        show: false,
        required: true
      },
      {
        type: 'input',
        field: 'database_username',
        label: vm.$t('dataForm.form.userName'),
        showByUrl: 2,
        show: false,
        required: true
      },
      {
        type: 'input',
        field: 'plain_password',
        label: vm.$t('dataForm.form.password'),
        domType: 'password',
        showByUrl: 2,
        show: false,
        showPassword: true
      },
      {
        type: 'input',
        field: 'additionalString',
        label: vm.$t('dataForm.form.additionalString'),
        showByUrl: 2,
        show: false
      },
      {
        type: 'switch',
        field: 'ssl',
        label: vm.$t('dataForm.form.ssl'),
        on: {
          change() {
            vm.checkItems()
          }
        }
      },
      {
        type: 'file',
        field: 'sslKeyFile',
        label: vm.$t('dataForm.form.sslKey'),
        showWhenSslTrue: true,
        show: false,
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
            fileChange(file, 'sslKey')
          }
        }
      },
      {
        type: 'input',
        field: 'sslPass',
        label: vm.$t('dataForm.form.sslPass'),
        show: false,
        showWhenSslTrue: true
      },
      {
        type: 'switch',
        field: 'sslValidate',
        label: vm.$t('dataForm.form.sslValidate'),
        show: false,
        showWhenSslTrue: true,
        on: {
          change() {
            vm.checkItems()
          }
        }
      },
      {
        type: 'file',
        field: 'sslCAFile',
        label: vm.$t('dataForm.form.sslCA'),
        show: false,
        showWhenSslValidateTrue: true,
        showWhenSslTrue: true,
        rules: [
          {
            required: true,
            validator: (rule, v, callback) => {
              let value = vm.model.sslKey
              let ssl = vm.model.sslValidate
              if (ssl && (!value || !value.trim())) {
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
        field: 'table_filter',
        label: vm.$t('dataForm.form.tableFilter'),
        tips: vm.$t('dataForm.form.tableFilterTips'),
        maxlength: 500,
        showWordLimit: true
      }
    ]
  }
}
