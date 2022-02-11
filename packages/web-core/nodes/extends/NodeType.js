export class NodeType {
  constructor(node) {
    this.icon = node.icon
    this.name = node.name
    this.tip = node.name
  }

  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    return {}
  }

  validate() {
    return true
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
