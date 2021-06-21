export class NodeType {
  attr = {}
  constructor(node) {
    this.icon = node.icon
    this.name = node.name
    this.tip = node.name

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    return {}
  }

  execute() {
    // 节点功能实现
  }

  /**
   * 验证此允许连接到目标
   */
  allowTarget() {
    return true
  }

  /**
   * 验证接受源连接
   */
  allowSource() {
    return true
  }
}
