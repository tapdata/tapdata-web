import i18n from '@tap/i18n'
export class NodeType {
  constructor() {}
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
   * 验证能否作为该节点的目标
   */
  allowTarget() {
    return true
  }

  /**
   * 验证能否作为该节点的源
   */
  allowSource() {
    return true
  }

  selector(node) {
    if (!this.type)
      throw new Error(i18n.t('packages_dag_extends_nodetype_queshaobiyaode'))
    return node.type === this.type
  }
}
