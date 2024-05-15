import { defineComponent } from 'vue-demi'
import { Highlight } from '@tap/component'
import 'highlight.js/styles/atom-one-light.css'
import './style.scss'

export const HighlightCode = defineComponent({
  props: {
    code: String,
    theme: {
      type: String,
      default: 'atom-one-light'
    },
    language: {
      type: String,
      default: 'javascript'
    }
  },
  setup(props) {
    return () => {
      return <Highlight class={`theme-${props.theme}`} language={props.language} code={props.code}></Highlight>
    }
  }
})

export default HighlightCode
