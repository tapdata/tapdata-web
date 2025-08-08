import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { defineComponent } from 'vue'
import { transformToSchema, transformToTreeNode } from '../../../core'

export const SchemaEditorWidget = defineComponent({
  props: ['tree', 'onChange', 'options'],
  setup: (props) => {
    const options = {
      showPrintMargin: false,
      ...props.options,
    }
    return () => (
      <VCodeEditor
        value={JSON.stringify(transformToSchema(props.tree), null, 2)}
        onInput={(value) => {
          props.onChange?.(transformToTreeNode(JSON.parse(value)))
        }}
        lang="json"
        options={options}
      />
    )
  },
})
