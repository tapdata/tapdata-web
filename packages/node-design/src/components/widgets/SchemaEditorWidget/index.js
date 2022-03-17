import { transformToSchema, transformToTreeNode } from '../../../core'
import { defineComponent } from 'vue-demi'
import CodeEditor from 'web-core/components/base/VCodeEditor'

export const SchemaEditorWidget = defineComponent({
  props: ['tree', 'onChange', 'options'],
  setup: props => {
    const options = {
      showPrintMargin: false,
      ...props.options
    }
    return () => (
      <CodeEditor
        value={JSON.stringify(transformToSchema(props.tree), null, 2)}
        onInput={value => {
          props.onChange?.(transformToTreeNode(JSON.parse(value)))
        }}
        lang="json"
        options={options}
      />
    )
  }
})
