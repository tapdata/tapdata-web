export const Input = {
  type: 'object',
  properties: {
    clearable: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
    maxLength: {
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
    },
    placeholder: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    size: {
      type: 'string',
      enum: ['large', 'small', 'middle', null],
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        defaultValue: 'middle',
      },
    },
  },
}

Input.TextArea = {
  type: 'object',
  properties: {
    maxLength: {
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
    },
    placeholder: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    autosize: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
    showWordLimit: {
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
  },
}
