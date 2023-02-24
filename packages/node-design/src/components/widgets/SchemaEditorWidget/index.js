import { transformToSchema, transformToTreeNode } from '../../../core'
import { defineComponent } from 'vue-demi'
import { VCodeEditor } from '@tap/component'

export const SchemaEditorWidget = defineComponent({
  props: ['tree', 'onChange', 'options'],
  setup: props => {
    const options = {
      showPrintMargin: false,
      ...props.options
    }
    return () => (
      <VCodeEditor
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
