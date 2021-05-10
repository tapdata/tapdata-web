export default function (vm) {
  return {
    form: {
      labelPosition: 'right',
      labelWidth: '200px'
    },
    defaultModel: {
      connection_type: 'source',
      request_interval: 5
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
          }
        ],
        required: true
      },
      {
        type: 'select',
        field: 'auth_type',
        label: '认证类型',
        options: [
          {
            label: 'None',
            value: ''
          },
          {
            label: 'OAuth2',
            value: 'oauth2'
          }
        ],
      },
      {
        type: 'input',
        field: 'request_interval',
        label: '同步间隔(秒)',
        required: true,
        rules: [
          {
            required: true,
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error('同步间隔时间不能为空'))
              } else if (!/^\d+$/.test(value)) {
                callback(new Error('同步间隔时间只能为数字'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      {
        type: 'input',
        field: 'collection_name',
        label: '集合名称',
        required: true
      },
      {
        type: 'input',
        field: 'unique_keys',
        label: '唯一主键联合主键使用，拆分',
        required: true
      },
      {
        type: 'slot',
        slot: 'req_pre_process',
        label: '请求预处理脚本',
      },
      {
        type: 'slot',
        slot: 'resp_pre_process',
        label: '响应预处理脚本',
      },
      {
        type: 'select',
        field: 'data_sync_mode',
        label: '数据同步模式',
        options: [
          {
            label: '同步实时数据',
            value: 'INCREMENTAL_SYNC'
          },
          {
            label: '同步历史数据',
            value: 'INITIAL_SYNC'
          },
          {
            label: '同步实时数据和同步历史数据',
            value: 'INITIAL_INCREMENTAL_SYNC'
          }
        ],
        required: true
      }
    ]
  }
}
