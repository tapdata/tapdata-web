import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { defineComponent } from 'vue'

export const CodeEditorWidget = defineComponent({
  props: ['customNode', 'tree', 'onChange', 'options'],
  setup: (props) => {
    return () => {
      const options = {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false,
        ...props.options,
      }
      return (
        <VCodeEditor
          value={props.customNode.template}
          lang="javascript"
          options={options}
          onInput={(val) => (props.customNode.template = val)}
        />
      )
    }
  },
})
