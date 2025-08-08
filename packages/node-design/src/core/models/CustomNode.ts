//节点模型
import { define, observable } from '@formily/reactive'
import { patchCustomNode, createCustomNode } from '@tap/api'
import { transformToSchema } from '../transformer'

export class CustomNode {
  id

  name

  desc

  formSchema

  template

  engine

  props

  static defaultScript =
    'function process(record, form){\n' + '\n' + '\t// Enter you code at here\n' + '\treturn record;\n' + '}'

  constructor(engine, props = {}) {
    this.engine = engine
    this.props = props
    this.id = props.id
    this.name = props.name
    this.desc = props.desc
    this.template = CustomNode.defaultScript
    this.makeObservable()
  }

  makeObservable() {
    define(this, {
      name: observable.ref,
      template: observable.ref,
    })
  }

  from(node) {
    if (!node) return

    this.id = node.id
    this.name = node.name
    this.formSchema = node.formSchema
    this.template = node.template || CustomNode.defaultScript
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      desc: this.desc,
      formSchema: this.formSchema,
      template: this.template,
    }
  }

  async save(tree) {
    this.formSchema = transformToSchema(tree)
    const apiCall = this.id ? patchCustomNode : createCustomNode
    return await apiCall(this.serialize())
  }
}
