import TiptapCodeBlock from '@tiptap/extension-code-block'

export const CodeBlock = TiptapCodeBlock.extend({
  content: 'text* | systemVariable*', // 允许文本和系统变量

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', HTMLAttributes, ['code', {}, 0]]
  },
})
