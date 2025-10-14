import 'highlight.js/styles/atom-one-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import http from 'highlight.js/lib/languages/http'
import xml from 'highlight.js/lib/languages/xml'
import { escape } from 'lodash-es'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('python', python)
hljs.registerLanguage('http', http)
hljs.registerLanguage('xml', xml)

function hasValueOrEmptyAttribute(value) {
  return Boolean(value || value === '')
}

export default {
  props: ['language', 'code', 'autodetect'],
  data: function () {
    return {
      detectedLanguage: '',
      unknownLanguage: false,
    }
  },
  computed: {
    className() {
      if (this.unknownLanguage) return ''

      return 'hljs ' + this.detectedLanguage
    },
    highlighted() {
      // no idea what language to use, return raw code
      if (!this.autoDetect && !hljs.getLanguage(this.language)) {
        console.warn(`The language "${this.language}" you specified could not be found.`) // eslint-disable-line
        this.unknownLanguage = true
        return escape(this.code)
      }

      let result = {}
      if (this.autoDetect) {
        result = hljs.highlightAuto(this.code)
        this.detectedLanguage = result.language
      } else {
        result = hljs.highlight(this.code, {
          language: this.language,
          ignoreIllegals: this.ignoreIllegals,
        })
        this.detectedLanguage = this.language
      }
      return result.value
    },
    autoDetect() {
      return !this.language || hasValueOrEmptyAttribute(this.autodetect)
    },
    ignoreIllegals() {
      return true
    },
  },
  // this avoids needing to use a whole Vue compilation pipeline just
  // to build Highlight.js
  render() {
    return (
      <pre>
        <code class={this.className} v-html={this.highlighted}></code>
        {this.$slots.default?.()}
      </pre>
    )

    // return createElement('pre', {}, [
    //   createElement('code', {
    //     class: this.className,
    //     domProps: { innerHTML: this.highlighted }
    //   }),
    //   this.$slots.default
    // ])
  },
  // template: `<pre><code :class="className" v-html="highlighted"></code></pre>`
}
