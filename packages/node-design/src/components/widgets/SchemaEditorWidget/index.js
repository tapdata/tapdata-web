import { transformToSchema, transformToTreeNode } from '../../../core'
import { defineComponent } from 'vue-demi'
import CodeEditor from 'web-core/components/base/VCodeEditor'

export const SchemaEditorWidget = defineComponent({
  props: ['tree', 'onChange'],
  setup: props => {
    console.log('SchemaEditorWidget.props', props.tree)
    return () => (
      <CodeEditor
        value={JSON.stringify(transformToSchema(props.tree), null, 2)}
        onChange={value => {
          props.onChange?.(transformToTreeNode(JSON.parse(value)))
        }}
        language="json"
      />
    )
  }
})
