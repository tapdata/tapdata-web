export const Select = {
  type: 'object',
  properties: {
    multiple: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch'
    },
    allowCreate: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch'
    },
    clearable: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch'
    },
    // autoClearSearchValue: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch',
    //   'x-component-props': {
    //     defaultChecked: true
    //   }
    // },
    // dropdownMatchSelectWidth: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch',
    //   'x-component-props': {
    //     defaultChecked: true
    //   }
    // },
    // autoFocus: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch'
    // },
    // bordered: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch',
    //   'x-component-props': {
    //     defaultChecked: true
    //   }
    // },
    // defaultActiveFirstOption: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch',
    //   'x-component-props': {
    //     defaultChecked: true
    //   }
    // },
    // defaultOpen: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch'
    // },
    // labelInValue: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch'
    // },
    // showArrow: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch'
    // },
    // showSearch: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch'
    // },
    // virtual: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Switch',
    //   'x-component-props': {
    //     defaultValue: true
    //   }
    // },
    // filterOption: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'ValueInput',
    //   'x-component-props': {
    //     include: ['BOOLEAN', 'EXPRESSION']
    //   }
    // },
    // filterSort: {
    //   type: 'boolean',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'ValueInput',
    //   'x-component-props': {
    //     include: ['EXPRESSION']
    //   }
    // },
    // listHeight: {
    //   type: 'number',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'InputNumber',
    //   'x-component-props': {
    //     defaultValue: 256
    //   }
    // },
    // maxTagCount: {
    //   type: 'number',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'InputNumber'
    // },
    // maxTagPlaceholder: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Input'
    // },
    // maxTagTextLength: {
    //   type: 'number',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'InputNumber'
    // },
    // notFoundContent: {
    //   type: 'string',
    //   'x-decorator': 'FormItem',
    //   'x-component': 'Input',
    //   'x-component-props': {
    //     defaultValue: 'Not Found'
    //   }
    // },
    placeholder: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input'
    },

    size: {
      type: 'string',
      enum: ['large', 'small', 'middle', null],
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        defaultValue: 'middle'
      }
    }
  }
}
