import { defineComponent } from 'vue-demi'
import CodeEditor from 'web-core/components/base/VCodeEditor'

export const CodeEditorWidget = defineComponent({
  props: ['tree', 'onChange'],
  setup: props => {
    return () => (
      <CodeEditor
        value={''}
        onInput={value => {
          props.onChange?.(transformToTreeNode(JSON.parse(value)))
        }}
        language="javascript"
      />
    )
  }
})
