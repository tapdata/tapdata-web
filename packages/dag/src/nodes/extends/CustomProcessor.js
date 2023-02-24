import { NodeType } from './NodeType'

export class CustomProcessor extends NodeType {
  constructor(props) {
    super()
    this.props = props
  }

  type = 'custom_processor'

  group = 'processor'

  get formSchema() {
    return this.props.formSchema
  }

  selector(node) {
    return (
      node.type === this.type && node.customNodeId === this.props.customNodeId
    )
  }
}
