import { SelectProps as _SelectProps } from 'element-plus/es/components/select/src/select.mjs'

import { buildProps, definePropType, iconPropType } from 'element-plus/es/utils/index.mjs'

export const SelectProps = {
  ..._SelectProps,
  ...buildProps({
    method: {
      type: Function,
      required: true,
    },
    createValidate: Function, // 当allowCreate打开时，验证创建项
    onSetSelected: Function, // 主要是在schema场景下做交互使用
    params: Object,
    itemType: {
      type: String,
      default: 'object',
    },
    itemLabel: {
      type: String,
      default: 'label',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    itemQuery: String,
    currentLabel: [String, Array],
    debounceWait: {
      type: Number,
      default: 200,
    },
    inputQueryWait: {
      type: Number,
      default: 100,
    },
    pageSize: {
      type: Number,
      default: 20,
    },
  }),
}
