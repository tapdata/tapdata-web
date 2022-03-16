import { NodeType } from './extends/NodeType'

export class Common extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
    }
  }

  attr = {}
}
