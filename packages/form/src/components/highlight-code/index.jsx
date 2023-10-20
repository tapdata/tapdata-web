import { defineComponent } from 'vue'
import { Highlight } from '@tap/component'
import 'highlight.js/styles/atom-one-light.css'

export const HighlightCode = defineComponent({
  props: {
    code: String,
    language: {
      type: String,
      default: 'javascript'
    }
  },
  setup(props) {
    return () => {
      return <Highlight language={props.language} code={props.code}></Highlight>
    }
  }
})

export default HighlightCode
