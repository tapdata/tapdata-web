import TiptapHighlight from '@tiptap/extension-highlight'
import HighlightPopover from '../components/HighlightPopover.vue'
import { COLOR_SET } from './Color'
import type { Editor } from '@tiptap/core'

const Highlight = TiptapHighlight.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      multicolor: true,
      colors: COLOR_SET,
      button({ editor }: { editor: Editor }) {
        return {
          component: HighlightPopover,
          componentProps: {
            editor,
          },
        }
      },
    }
  },
})

export { Highlight }
