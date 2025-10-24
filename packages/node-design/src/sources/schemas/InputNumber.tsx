export const InputNumber = {
  type: 'object',
  properties: {
    decimalSeparator: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    precision: {
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
    },
    max: {
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
    },
    min: {
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'InputNumber',
    },
    step: {
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
    formatter: {
      'x-decorator': 'FormItem',
      'x-component': 'ValueInput',
      'x-component-props': {
        include: ['EXPRESSION'],
      },
    },
    parser: {
      'x-decorator': 'FormItem',
      'x-component': 'ValueInput',
      'x-component-props': {
        include: ['EXPRESSION'],
      },
    },
    stringMode: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    },
    bordered: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
      'x-component-props': {
        defaultChecked: true,
      },
    },
    keyboard: {
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
      'x-component-props': {
        defaultChecked: true,
      },
    },
  },
}
