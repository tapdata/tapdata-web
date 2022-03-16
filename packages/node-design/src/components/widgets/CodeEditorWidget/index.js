import { defineComponent } from 'vue-demi'
import CodeEditor from 'web-core/components/base/VCodeEditor'

export const CodeEditorWidget = defineComponent({
  props: ['customNode', 'tree', 'onChange'],
  setup: props => {
    return () => (
      <CodeEditor
        value={props.customNode.template}
        onInput={val => (props.customNode.template = val)}
        language="javascript"
      />
    )
  }
})
