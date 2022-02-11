export default function () {
  return {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: '连接名称',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input'
      },
      connection_type: {
        type: 'string',
        title: '连接类型',
        required: true,
        default: 'source',
        enum: [
          {
            label: '源',
            value: 'source',
            tip: '此数据连接在Tapdata 中只能作为源使用，不能作用为目标'
          },
          {
            label: '目标',
            value: 'target',
            tip: '此数据连接在Tapdata 中只能作为目标使用，不能作用为源'
          },
          {
            label: '源&目标',
            value: 'source_and_target',
            tip: '此数据连接在Tapdata 中能同时作为源和目标使用'
          }
        ],
        'x-decorator': 'ElFormItem',
        'x-component': 'RadioTipGroup'
      },
      database_host: {
        type: 'string',
        title: '数据库地址',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入数据库地址' }
        }
      },
      database_port: {
        type: 'string',
        title: '数据库端口',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入数据库端口' }
        }
      },
      database_name: {
        type: 'string',
        title: '数据库名称',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入数据库名称' }
        }
      },
      database_username: {
        type: 'string',
        title: '账号',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入账号' }
        }
      },
      plain_password: {
        type: 'string',
        title: '密码',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入密码' }
        }
      }
    }
  }
}
