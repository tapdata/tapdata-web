import { useTree, usePrefix } from '../../../hooks'
import { observer } from '@formily/reactive-vue'
import { IconWidget } from '../IconWidget'
import './styles.scss'
import { defineComponent } from 'vue'

export const EmptyWidget = observer(
  defineComponent({
    props: {
      dragTipsDirection: { type: String, default: 'left' },
    },
    setup: (props, { slots }) => {
      const treeRef = useTree()
      const prefix = usePrefix('empty')

      return () => {
        const tree = treeRef.value
        console.log('tree', tree)
        const renderEmpty = () => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div class="animations">
                <IconWidget
                  infer={props.dragTipsDirection === 'left' ? 'DragLeftSourceAnimation' : 'DragRightSourceAnimation'}
                  size={240}
                />
                <IconWidget infer="BatchDragAnimation" size={240} />
              </div>
              {/*<div class="hotkeys-list">
                <div>
                  Selection <IconWidget infer="Command" /> + Click / <IconWidget infer="Shift" /> + Click /{' '}
                  <IconWidget infer="Command" /> + A
                </div>
                <div>
                  Copy <IconWidget infer="Command" /> + C / Paste <IconWidget infer="Command" /> + V
                </div>
                <div>
                  Delete <IconWidget infer="Delete" />
                </div>
              </div>*/}
            </div>
          )
        }
        if (!tree?.children?.length) {
          console.log('slots.default()', slots.default(), !slots.default())
          return <div class={prefix}>{slots.default()[0]?.children || renderEmpty()}</div>
        }
        return null
      }
    },
  }),
)
