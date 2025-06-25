import TiptapColor from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import ColorPopover from '../components/ColorPopover.vue'
import type { Editor } from '@tiptap/core'

function hexColorRegex(): RegExp {
  return /#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})\b/gi
}

export const COLOR_SET: string[][] = [
  [
    'rgb(255, 255, 255)',
    'rgb(242, 243, 245)',
    'rgb(222, 224, 227)',
    'rgb(143, 149, 158)',
    'rgb(55, 60, 67)',
    'rgb(0, 0, 0)',
  ],
  [
    'rgb(51, 112, 255)',
    'rgb(225, 234, 255)',
    'rgb(186, 206, 253)',
    'rgb(78, 131, 253)',
    'rgb(36, 91, 219)',
    'rgb(19, 60, 154)',
  ],
  [
    'rgb(52, 199, 36)',
    'rgb(217, 245, 214)',
    'rgb(183, 237, 177)',
    'rgb(98, 210, 86)',
    'rgb(46, 161, 33)',
    'rgb(24, 96, 16)',
  ],
  [
    'rgb(127, 59, 245)',
    'rgb(236, 226, 254)',
    'rgb(205, 178, 250)',
    'rgb(147, 90, 246)',
    'rgb(100, 37, 208)',
    'rgb(56, 13, 130)',
  ],
  [
    'rgb(255, 198, 10)',
    'rgb(250, 241, 209)',
    'rgb(248, 230, 171)',
    'rgb(250, 211, 85)',
    'rgb(220, 155, 4)',
    'rgb(121, 81, 1)',
  ],
  [
    'rgb(245, 74, 69)',
    'rgb(253, 226, 226)',
    'rgb(251, 191, 188)',
    'rgb(247, 105, 100)',
    'rgb(216, 57, 49)',
    'rgb(129, 37, 32)',
  ],
]

export function isHexColor(color: string): boolean {
  return hexColorRegex().test(color)
}

const Color = TiptapColor.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      colors: COLOR_SET.flat(),
      button({ editor }: { editor: Editor }) {
        return {
          component: ColorPopover,
          componentProps: {
            editor,
          },
        }
      },
    }
  },

  addExtensions() {
    return [TextStyle]
  },
})

export { Color }
