import { mergeAttributes } from '@tiptap/core'
import TiptapParagraph from '@tiptap/extension-paragraph'

export const Paragraph = TiptapParagraph.extend({
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'ace-line' }), 0]
  },
})
