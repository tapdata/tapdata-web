import { NodeType } from './extends/NodeType'

export class CustomProcessor extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
    }
  }

  attr = {}

  group = 'processor'

  getExtraAttr() {
    return {
      customNodeId: this.attr.customNodeId
    }
  }
}
