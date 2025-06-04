import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import StarterKit from '@tiptap/starter-kit'

// 自定义 Document 节点，指定根节点为 <div>
export const EmailDocument = Document.extend({
  content: 'block+', // 允许块级内容（如 <p>、<ul>）
  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (dom) => {
          // 仅解析带有特定 class 的 div
          if (dom.classList.contains('email-root')) {
            return {
              class: 'email-root',
              style:
                'padding: 24px; background-color: #ffffff; border-radius: 8px; min-height: 200px;',
            }
          }
          return false
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    // 渲染根 <div> 带固定 class 和 style
    return [
      'div',
      {
        class: 'email-root',
        style:
          'padding: 24px; background-color: #ffffff; border-radius: 8px; min-height: 200px;',
        ...HTMLAttributes,
      },
      0,
    ]
  },
})
