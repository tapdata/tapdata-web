import { Extension, type Editor } from '@tiptap/core'
import TextStyle from '@tiptap/extension-text-style'
import FontSizeDropdown from '../components/FontSizeDropdown.vue'

export const FONT_SIZES = ['12', '14', '16', '18', '20', '22', '26', '34', '48']

export const DEFAULT_FONT_SIZE = 'default'

const SIZE_PATTERN = /([\d.]+)px/i

export function convertToPX(styleValue: string): string {
  const matches = styleValue.match(SIZE_PATTERN)
  if (!matches) return ''
  const value = matches[1]
  if (!value) return ''
  return value
}

export type FontSizeOptions = {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (fontSize: string) => ReturnType
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
      fontSizes: FONT_SIZES,
      button({ editor }: { editor: Editor }) {
        return {
          component: FontSizeDropdown,
          componentProps: {
            editor,
          },
        }
      },
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => convertToPX(element.style.fontSize) || '',
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}px`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run()
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: DEFAULT_FONT_SIZE })
            .removeEmptyTextStyle()
            .run()
        },
    }
  },

  addExtensions() {
    return [TextStyle]
  },
})

export { FontSize }
