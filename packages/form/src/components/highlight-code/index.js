import { defineComponent } from 'vue-demi'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import Highlight from 'web-core/components/Highlight'
import 'highlight.js/styles/atom-one-light.css'
hljs.registerLanguage('javascript', javascript)

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
