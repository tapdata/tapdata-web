import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class RowFilter extends NodeType {
  constructor() {
    super()
  }

  type = 'row_filter_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: i18n.global.t('packages_dag_nodes_database_jiedianmingcheng'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },
      action: {
        title: i18n.global.t('packages_dag_nodes_rowfilter_zhixingdongzuo'),
        type: 'string',
        required: true,
        default: 'retain',
        enum: [
          {
            label: i18n.global.t('packages_dag_nodes_jointcache_baoliupipeishu'),
            value: 'retain'
          },
          {
            label: i18n.global.t('packages_dag_nodes_rowfilter_diuqipipeishu'),
            value: 'discard'
          }
        ],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          wrapperWidth: 240
        }
      },
      expression: {
        title: i18n.global.t('packages_dag_nodes_rowfilter_tiaojianbiaodashi'),
        type: 'string',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'JsEditor',
        'x-decorator-props': {
          wrapperWidth: 800
        },
        'x-component-props': {
          options: { showPrintMargin: false, useWrapMode: true }
        }
      },
      example: {
        type: 'void',
        'x-component': 'ExpressionExample'
      }
    }
  }
}
