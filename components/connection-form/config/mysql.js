/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/7/26
 * @description
 */
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
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入账号' }
        }
      },
      plain_password: {
        type: 'string',
        title: '密码',
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入密码', type: 'password' }
        }
      },
      schemaAutoUpdate: {
        type: 'boolean',
        title: '定期加载Schema',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Switch'
      },
      table_filter: {
        type: 'string',
        title: '包含表',
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '逗号分隔的表达式列表，使用*代表任意长度任意字符' }
        }
      },
      additionalString: {
        type: 'string',
        title: '其他连接串参数',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入其他连接串参数' }
        }
      },
      database_datetype_without_timezone: {
        type: 'string',
        title: '时间类型的时区',
        required: true,
        default: '',
        enum: [
          {
            label: '(Database Timezone)',
            value: ''
          },
          {
            label: 'UTC -11',
            value: '-11:00'
          },
          {
            label: 'UTC -10',
            value: '-10:00'
          },
          {
            label: 'UTC -9',
            value: '-09:00'
          },
          {
            label: 'UTC -8',
            value: '-08:00'
          },
          {
            label: 'UTC -7',
            value: '-07:00'
          },
          {
            label: 'UTC -6',
            value: '-06:00'
          },
          {
            label: 'UTC -5',
            value: '-05:00'
          },
          {
            label: 'UTC -4',
            value: '-04:00'
          },
          {
            label: 'UTC -3',
            value: '-03:00'
          },
          {
            label: 'UTC -2',
            value: '-02:00'
          },
          {
            label: 'UTC -1',
            value: '-01:00'
          },
          {
            label: 'UTC +0',
            value: '+00:00'
          },
          {
            label: 'UTC +1',
            value: '+01:00'
          },
          {
            label: 'UTC +2',
            value: '+02:00'
          },
          {
            label: 'UTC +3',
            value: '+03:00'
          },
          {
            label: 'UTC +4',
            value: '+04:00'
          },
          {
            label: 'UTC +5',
            value: '+05:00'
          },
          {
            label: 'UTC +6',
            value: '+06:00'
          },
          {
            label: 'UTC +7',
            value: '+07:00'
          },
          {
            label: 'UTC +8',
            value: '+08:00'
          },
          {
            label: 'UTC +9',
            value: '+09:00'
          },
          {
            label: 'UTC +10',
            value: '+10:00'
          },
          {
            label: 'UTC +11',
            value: '+11:00'
          },
          {
            label: 'UTC +12',
            value: '+12:00'
          },
          {
            label: 'UTC +13',
            value: '+13:00'
          },
          {
            label: 'UTC +14',
            value: '+14:00'
          }
        ],
        'x-decorator': 'ElFormItem',
        'x-component': 'Select'
      }
    }
  }
}
