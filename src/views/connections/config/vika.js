export default function () {
  return {
    form: {
      labelPosition: 'left',
      labelWidth: '120px',
      labelColon: true
    },
    defaultModel: {
      connection_type: 'source_and_target'
    },
    items: [
      {
        type: 'input',
        field: 'plain_password',
        label: '接口鉴权Token',
        domType: 'password',
        showPassword: true,
        required: true
      },
      {
        type: 'select',
        field: 'vika_space_name',
        label: '空间站名称',
        options: [],
        required: true
      }
    ]
  }
}
