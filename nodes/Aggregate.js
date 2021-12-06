import { NodeType } from './extends/NodeType'

export class Aggregate extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {
    maxInputs: 1 // 最大输入个数
  }

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      primaryKeys: {
        title: '主键',
        type: 'string',
        required: true,
        enum: [
          {
            label: '保留匹配数据',
            value: 'retain'
          },
          {
            label: '创建匹配数据',
            value: 'discard'
          }
        ],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          wrapperWidth: 240
        }
      },
      aggregations: {
        type: 'array',
        'x-component': 'ArrayAggregate'
        // 'x-decorator': 'FormItem',
        // default: [
        //   {
        //     aggFunction: 'COUNT'
        //   }
        // ],
        // properties: {
        //   add: {
        //     type: 'void',
        //     title: '添加条目',
        //     'x-component': 'ArrayRemove'
        //   }
        // }

        // items: {
        //   type: 'object',
        //   properties: {
        //     grid: {
        //       type: 'void',
        //       'x-component': 'Row',
        //       'x-component-props': {
        //         gutter: 20
        //       },

        //       properties: {
        //         contentCol: {
        //           type: 'void',
        //           'x-component': 'Col',
        //           'x-component-props': {
        //             span: 22
        //           },
        //           properties: {
        //             grid: {
        //               type: 'void',
        //               'x-component': 'Row',
        //               'x-component-props': {
        //                 gutter: 20
        //               },
        //               properties: {
        //                 aggFunctionCol: {
        //                   type: 'void',
        //                   'x-component': 'Col',
        //                   'x-component-props': {
        //                     span: 10
        //                   },
        //                   properties: {
        //                     aggFunction: {
        //                       type: 'string',
        //                       title: '聚合函数',
        //                       required: true,
        //                       enum: [
        //                         {
        //                           label: 'AVG',
        //                           value: 'AVG'
        //                         },
        //                         {
        //                           label: 'SUM',
        //                           value: 'SUM'
        //                         },
        //                         {
        //                           label: 'MAX',
        //                           value: 'MAX'
        //                         },
        //                         {
        //                           label: 'MIN',
        //                           value: 'MIN'
        //                         },
        //                         {
        //                           label: 'COUNT',
        //                           value: 'COUNT'
        //                         }
        //                       ],
        //                       'x-decorator': 'FormItem',
        //                       'x-component': 'Select'
        //                     }
        //                   }
        //                 },
        //                 aggExpressionCol: {
        //                   type: 'void',
        //                   'x-component': 'Col',
        //                   'x-component-props': {
        //                     span: 14
        //                   },
        //                   properties: {
        //                     aggExpression: {
        //                       type: 'string',
        //                       title: '作用目标',
        //                       'x-decorator': 'FormItem',
        //                       'x-component': 'Input',
        //                       'x-reactions': {
        //                         dependencies: ['..aggFunctionCol.aggFunction'],
        //                         fulfill: {
        //                           state: {
        //                             disabled: '{{$deps[0] === "COUNT"}}'
        //                           }
        //                         }
        //                       }
        //                     }
        //                   }
        //                 }
        //               }
        //             },

        //             name: {
        //               type: 'string',
        //               title: '子处理名称',
        //               required: true,
        //               'x-decorator': 'FormItem',
        //               'x-component': 'Input'
        //             },
        //             filterPredicate: {
        //               type: 'string',
        //               title: '过滤器',
        //               'x-decorator': 'FormItem',
        //               'x-component': 'Input'
        //             },
        //             groupByExpression: {
        //               title: '分组字段',
        //               type: 'string',
        //               enum: [
        //                 {
        //                   label: 'JavaScript',
        //                   value: 'js_processor'
        //                 },
        //                 {
        //                   label: 'Java',
        //                   value: 'java_processor'
        //                 }
        //               ],
        //               'x-decorator': 'FormItem',
        //               'x-component': 'Select'
        //             }
        //           }
        //         },
        //         removeCol: {
        //           type: 'void',
        //           'x-component': 'Col',
        //           'x-component-props': {
        //             span: 2
        //           },
        //           properties: {
        //             moveUp: {
        //               type: 'void',
        //               'x-component': 'ArrayRemove'
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        // },
        // properties: {
        //   addition: {
        //     type: 'void',
        //     title: '添加条目',
        //     'x-component': 'ArrayAddition'
        //   }
        // }
      }
    }
  }
}
