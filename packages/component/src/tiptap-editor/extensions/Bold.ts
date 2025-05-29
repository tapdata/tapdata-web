import TiptapBold from '@tiptap/extension-bold'
import CommandButton from '../components/CommandButton.vue'

import type { Editor } from '@tiptap/core'

const Bold = TiptapBold.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      button({ editor }: { editor: Editor }) {
        return {
          component: CommandButton,
          componentProps: {
            command: () => {
              editor.commands.toggleBold()
            },
            isActive: editor.isActive('bold'),
            icon: 'bold',
            tooltip: '加粗',
          },
        }
      },
    }
  },
})

export { Bold }
