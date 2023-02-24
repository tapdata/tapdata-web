import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class JointCache extends NodeType {
  constructor() {
    super()
  }

  type = 'cache_lookup_processor'

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      cacheId: {
        title: i18n.t('packages_dag_nodes_jointcache_duiyinghuancunjie'),
        type: 'string',
        required: true,
        enum: [
          {
            label: i18n.t('packages_dag_nodes_jointcache_baoliupipeishu'),
            value: 'retain',
          },
          {
            label: i18n.t('packages_dag_nodes_jointcache_chuangjianpipeishu'),
            value: 'discard',
          },
        ],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          wrapperWidth: 240,
        },
        // 'x-component': 'ComboSelect'
      },
      joinSettings: {
        type: 'array',
        title: i18n.t('packages_dag_nodes_jointcache_guanlianshezhi'),
        required: true,
        default: [{ cacheKey: 1 }],
        'x-decorator': 'FormItem',
        'x-component': 'ArrayTable',
        items: {
          type: 'object',
          properties: {
            column1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: i18n.t(
                  'packages_dag_nodes_jointcache_huancunbiaozhujian'
                ),
                align: 'center',
              },
              properties: {
                cacheKey: {
                  type: 'string',
                  'x-component': 'PreviewText.Input',
                },
              },
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: i18n.t(
                  'packages_dag_nodes_jointcache_yuanbiaoguanlianjian'
                ),
                align: 'center',
              },
              properties: {
                sourceKey: {
                  type: 'void',
                  properties: {
                    sourceKey: {
                      type: 'string',
                      enum: [
                        {
                          label: 'AVG',
                          value: 'AVG',
                        },
                        {
                          label: 'SUM',
                          value: 'SUM',
                        },
                        {
                          label: 'MAX',
                          value: 'MAX',
                        },
                        {
                          label: 'MIN',
                          value: 'MIN',
                        },
                        {
                          label: 'COUNT',
                          value: 'COUNT',
                        },
                      ],
                      'x-component': 'Select',
                    },
                  },
                },
              },
            },
          },
        },
      },
      joinKey: {
        title: i18n.t('packages_dag_nodes_jointcache_xierulujing'),
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: {
            placeholder: i18n.t(
              'packages_dag_nodes_jointcache_qingxuanzehuochuang'
            ),
          },
        },
      },
      script: {
        type: 'string',
      },
    },
  }
}
