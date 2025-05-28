import { InputRule, Mark, mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'

export const SystemVariable = Node.create({
  name: 'systemVariable',

  // 定义为内联节点，可以被选中
  group: 'inline',
  inline: true,
  atom: true, // 原子节点，作为一个整体被选中
  selectable: true, // 允许选中

  // 定义属性
  addAttributes() {
    return {
      variableName: {
        default: null,
        parseHTML: (element) => element.dataset.variable,
        renderHTML: (attributes) => {
          console.log('attributes', attributes)
          if (!attributes.variableName) {
            return {}
          }
          return {
            'data-variable': attributes.variableName,
            variableName: attributes.variableName,
          }
        },
      },
    }
  },

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: 'span[data-system-variable]',
      },
    ]
  },

  // 渲染 HTML
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-system-variable': 'true',
        'data-variable': HTMLAttributes.variableName,
        class: 'system-variable',
        contenteditable: 'false',
      }),
      `{${HTMLAttributes.variableName}}`,
    ]
  },

  // 添加命令
  addCommands() {
    return {
      insertSystemVariable:
        (variableName) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { variableName },
          })
        },
      updateSystemVariable:
        (variableName) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { variableName })
        },
    }
  },

  // 添加输入规则，更安全的自动转换方式
  addInputRules() {
    return [
      new InputRule({
        find: /\{([a-z_]\w*)\}$/i,
        handler: ({ state, range, match }) => {
          const variableName = match[1]
          const { tr } = state
          const start = range.from
          const end = range.to

          tr.replaceWith(start, end, this.type.create({ variableName }))
        },
      }),
    ]
  },

  // 添加键盘快捷键
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-v': () => {
        // 快捷键插入变量，可以弹出选择框
        return this.editor.commands.insertSystemVariable('variableName')
      },
      Delete: ({ editor }) => {
        const { selection } = editor.state
        const { from, to } = selection

        // 检查是否选中了系统变量节点
        if (selection instanceof TextSelection && from === to - 1) {
          const node = editor.state.doc.nodeAt(from)
          if (node && node.type.name === this.name) {
            return editor.commands.deleteRange({ from, to })
          }
        }
        return false
      },
      Backspace: ({ editor }) => {
        const { selection } = editor.state
        const { from, to } = selection

        // 检查是否在系统变量节点后面
        if (selection instanceof TextSelection && from === to && from > 0) {
          const nodeBefore = editor.state.doc.nodeAt(from - 1)
          if (nodeBefore && nodeBefore.type.name === this.name) {
            return editor.commands.deleteRange({ from: from - 1, to: from })
          }
        }
        return false
      },
    }
  },

  // 添加插件，用于自动转换文本为变量节点
  addProseMirrorPlugins() {
    console.log(
      'addProseMirrorPlugins',
      new PluginKey('systemVariableAutoReplace'),
    )
    return [
      new Plugin({
        key: new PluginKey('systemVariableAutoReplace'),
        appendTransaction(transactions, oldState, newState) {
          const docChanged = transactions.some(
            (transaction) => transaction.docChanged,
          )
          if (!docChanged) return null

          const tr = newState.tr
          const matches = []

          // 先收集所有匹配项，不立即修改文档
          newState.doc.descendants((node, pos) => {
            if (!node.isText) return

            const regex = /\{([a-z_]\w*)\}/gi
            let match

            while ((match = regex.exec(node.text)) !== null) {
              const start = pos + match.index
              const end = start + match[0].length
              const variableName = match[1]

              // 检查这个范围内是否已经有系统变量节点
              let hasVariableNode = false
              try {
                newState.doc.nodesBetween(start, end, (node) => {
                  if (node.type.name === 'systemVariable') {
                    hasVariableNode = true
                    return false // 停止遍历
                  }
                })
              } catch {
                // 忽略范围错误，跳过这个匹配
                continue
              }

              if (!hasVariableNode) {
                matches.push({
                  start,
                  end,
                  variableName,
                  text: match[0],
                })
              }
            }
          })

          // 从后往前替换，避免位置偏移问题
          matches.sort((a, b) => b.start - a.start)

          for (const match of matches) {
            try {
              // 再次验证位置是否有效
              if (match.start >= 0 && match.end <= newState.doc.content.size) {
                const variableNode =
                  newState.schema.nodes.systemVariable.create({
                    variableName: match.variableName,
                  })
                tr.replaceWith(match.start, match.end, variableNode)
              }
            } catch (error) {
              // 忽略单个替换的错误，继续处理其他匹配
              console.warn('Failed to replace variable:', match, error)
            }
          }

          return matches.length > 0 ? tr : null
        },
      }),
    ]
  },
})
