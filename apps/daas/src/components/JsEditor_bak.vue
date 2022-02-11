<template>
  <div ref="container" class="monaco" :style="{ width: width }"></div>
</template>

<script>
import * as monaco from 'monaco-editor' // 包体很大了 但是demo可以跑起来
// import { EditorEventType } from "../editor/lib/events";
const suggestions = [
  {
    label: 'split_chinese',
    insertText: 'split_chinese(inputString,language);', // 不写的时候不展示。。
    detail:
      'inputString：need split string\n' +
      'language:\nCH_T：traditional Chinese\nCH_S：Chinese Simplified\n HK_T:Hong Kong Traditional\nTW_T:Taiwan Traditional\n'
  },
  {
    label: 'uuid',
    insertText: 'var uuid = uuid();',
    detail: 'generate uuid'
  },
  {
    label: 'HashMap',
    insertText: 'var hashMap = new HashMap();',
    detail: 'create hash object'
  }
]
export default {
  props: {
    code: {
      required: true,
      value: String
    },
    width: {
      required: true,
      value: Number
    }
  },
  mounted() {
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems() {
        return {
          suggestions: suggestions
        }
      },
      triggerCharacters: [' ', '.'] // 写触发提示的字符，可以有多个
    })
    // monaco.languages.typescript.javascriptDefaults.addExtraLib([
    // 	'declare class Facts {',
    // 	'    /**',
    // 	'     * Returns the next fact',
    // 	'     */',
    // 	'    static next():string',
    // 	'}',
    // ].join('\n'), 'ts:filename/facts.d.ts');
    let self = this
    setTimeout(function () {
      self.init()
    }, 50)
  },
  watch: {
    width: {
      handler() {
        this.init()
      }
    }
  },
  methods: {
    init(script) {
      let self = this
      if (script) this.code = script
      self.$refs.container.innerHTML = ''
      var editor = monaco.editor.create(this.$refs.container, {
        value: this.code,
        language: 'javascript',
        minimap: {
          enabled: false
        },
        fontSize: '12px',
        fixedOverflowWidgets: true // 超出编辑器大小的使用fixed属性显示
      })
      editor.onDidChangeModelContent(function () {
        self.$emit('update:code', editor.getValue())
      })
    }
  }
}
</script>
<style scoped>
.monaco {
  width: 95%;
  height: 400px;
  border: 1px solid #dcdfe6;
  text-align: left;
  margin-right: 20px;
  border-radius: 4px;
}
</style>
