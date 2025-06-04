import TiptapItalic from '@tiptap/extension-italic'
import CommandButton from '../components/CommandButton.vue'
import type { Editor } from '@tiptap/core'

const Italic = TiptapItalic.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      button({ editor }: { editor: Editor; t: (...args: any[]) => string }) {
        return {
          component: CommandButton,
          componentProps: {
            command: () => {
              editor.commands.toggleItalic()
            },
            isActive: editor.isActive('italic'),
            icon: 'italic',
            tooltip: '斜体',
          },
        }
      },
    }
  },
})

export { Italic }
