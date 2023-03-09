import { NodeType } from './extends/NodeType'

export class hazelcastIMDG extends NodeType {
  constructor() {
    super()
  }

  type = 'hazelcastIMDG'

  minInputs = 0 // 最小输入个数
  maxInputs = 1 // 最小输入个数
  minOutputs = 0 // 最小输出个数
  maxOutputs = 1 // 最大输出个数

  // allowSource = false // 该节点不允许有源

  group = 'data'

  formSchema = {}
}
