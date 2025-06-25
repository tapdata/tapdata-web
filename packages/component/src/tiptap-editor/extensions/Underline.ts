import TiptapUnderline from '@tiptap/extension-underline'
import CommandButton from '../components/CommandButton.vue'
import type { Editor } from '@tiptap/core'

const Underline = TiptapUnderline.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      button({ editor }: { editor: Editor }) {
        return {
          component: CommandButton,
          componentProps: {
            command: () => {
              editor.commands.toggleUnderline()
            },
            isActive: editor.isActive('underline'),
            icon: 'underline',
            tooltip: '下划线',
          },
        }
      },
    }
  },
})

export { Underline }
