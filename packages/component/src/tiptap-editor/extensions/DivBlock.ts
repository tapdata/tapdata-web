import { Node } from '@tiptap/core'

export const DivBlock = Node.create({
  name: 'divBlock',
  group: 'block',
  content: 'block*',
  atom: false,
  defining: true,
  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false
          return {
            style: node.getAttribute('style') || '',
            class: node.getAttribute('class') || '',
          }
        },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
  addAttributes() {
    return {
      style: {
        default: null,
      },
      class: {
        default: null,
      },
    }
  },
})
