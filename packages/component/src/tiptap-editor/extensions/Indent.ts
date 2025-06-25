import { AllSelection, TextSelection, type Transaction } from '@tiptap/pm/state'
import { Extension } from '@tiptap/vue-3'
import CommandButton from '../components/CommandButton.vue'

import type { Command, Editor } from '@tiptap/vue-3'

export function clamp(val: number, min: number, max: number): number {
  if (val < min) {
    return min
  }
  if (val > max) {
    return max
  }
  return val
}

function updateIndentLevel(
  tr: Transaction,
  delta: number,
  types: string[],
  editor: Editor,
): Transaction {
  const { doc, selection } = tr

  if (!doc || !selection) return tr

  if (
    !(selection instanceof TextSelection) &&
    !(selection instanceof AllSelection)
  ) {
    return tr
  }

  const { from, to } = selection

  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type

    if (types.includes(nodeType.name)) {
      tr = setNodeIndentMarkup(tr, pos, delta)
      return false
    } else if (isList(node.type.name, editor.extensionManager.extensions)) {
      return false
    }
    return true
  })

  return tr
}

function setNodeIndentMarkup(
  tr: Transaction,
  pos: number,
  delta: number,
): Transaction {
  if (!tr.doc) return tr

  const node = tr.doc.nodeAt(pos)
  if (!node) return tr

  const minIndent = IndentProps.min
  const maxIndent = IndentProps.max

  const indent = clamp((node.attrs.indent || 0) + delta, minIndent, maxIndent)

  if (indent === node.attrs.indent) return tr

  const nodeAttrs = {
    ...node.attrs,
    indent,
  }

  return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks)
}

export function createIndentCommand({
  delta,
  types,
}: {
  delta: number
  types: string[]
}): Command {
  return ({ state, dispatch, editor }) => {
    const { selection } = state
    let { tr } = state
    tr = tr.setSelection(selection)
    tr = updateIndentLevel(tr, delta, types, editor)

    if (tr.docChanged) {
      dispatch && dispatch(tr)
      return true
    }

    return false
  }
}

export const IndentProps = {
  max: 7,
  min: 0,

  more: 1,
  less: -1,
}

export interface IndentOptions {
  types: string[]
  minIndent: number
  maxIndent: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Set the indent attribute
       */
      indent: () => ReturnType
      /**
       * Set the outdent attribute
       */
      outdent: () => ReturnType
    }
  }
}

const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      minIndent: IndentProps.min,
      maxIndent: IndentProps.max,
      // button({ editor }: { editor: Editor }) {
      //   return [
      //     {
      //       component: CommandButton,
      //       componentProps: {
      //         command: () => {
      //           editor.commands.indent()
      //         },
      //         icon: 'indent',
      //         tooltip: '缩进',
      //       },
      //     },
      //     {
      //       component: CommandButton,
      //       componentProps: {
      //         command: () => {
      //           editor.commands.outdent()
      //         },
      //         icon: 'outdent',
      //         tooltip: '退格',
      //       },
      //     },
      //   ]
      // },
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const identAttr = element.dataset.indent
              return (identAttr ? Number.parseInt(identAttr, 10) : 0) || 0
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) {
                return {}
              }

              return { ['data-indent']: attributes.indent }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent: () =>
        createIndentCommand({
          delta: IndentProps.more,
          types: this.options.types,
        }),
      outdent: () =>
        createIndentCommand({
          delta: IndentProps.less,
          types: this.options.types,
        }),
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const { from, to } = selection

        if (from === to) {
          // 单行缩进
          const $pos = state.doc.resolve(from)
          const lineStart = from - $pos.parentOffset
          const tr = state.tr.insert(lineStart, state.schema.text('    '))
          dispatch(tr)
        } else {
          // 多行缩进
          const selectedText = state.doc.textBetween(from, to, '\n', '\n')
          const lines = selectedText.split('\n')
          const indentedText = lines.map((line) => `    ${line}`).join('\n')
          const tr = state.tr.replaceWith(
            from,
            to,
            state.schema.text(indentedText),
          )
          dispatch(tr)
        }
        return true
      },

      'Shift-Tab': () => {
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const { from, to } = selection

        if (from === to) {
          // 单行反向缩进
          const $pos = state.doc.resolve(from)
          const lineStart = from - $pos.parentOffset
          const lineEnd = lineStart + $pos.parent.content.size
          const lineText = state.doc.textBetween(lineStart, lineEnd)

          const match = lineText.match(/^( {1,4})/)
          if (match) {
            const tr = state.tr.delete(lineStart, lineStart + match[1].length)
            dispatch(tr)
            return true
          }
        } else {
          // 多行反向缩进
          const selectedText = state.doc.textBetween(from, to, '\n', '\n')
          const lines = selectedText.split('\n')

          let hasIndent = false
          const dedentedLines = lines.map((line) => {
            const match = line.match(/^( {1,4})(.*)$/)
            if (match) {
              hasIndent = true
              return match[2]
            }
            return line
          })

          if (hasIndent) {
            const dedentedText = dedentedLines.join('\n')
            const tr = state.tr.replaceWith(
              from,
              to,
              state.schema.text(dedentedText),
            )
            dispatch(tr)
            return true
          }
        }
        return false
      },
    }
  },
})

export { Indent }
