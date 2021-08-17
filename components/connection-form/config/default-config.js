export default function () {
  return {
    name: {
      type: 'string',
      title: '连接名称',
      required: true,
      'x-decorator': 'ElFormItem',
      'x-component': 'Input'
    }
  }
}
