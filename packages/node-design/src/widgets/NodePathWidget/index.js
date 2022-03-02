import { Breadcrumb } from 'element-ui'
import { useCurrentNode, useSelection, usePrefix, useHover } from '../../hooks'
import { IconWidget } from '../IconWidget'
import { NodeTitleWidget } from '../NodeTitleWidget'
import { observer } from '@formily/reactive-vue'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const NodePathWidget = observer(
  defineComponent({
    setup: props => {
      const selected = useCurrentNode(props.workspaceId)
      const selection = useSelection(props.workspaceId)
      const hover = useHover(props.workspaceId)
      const prefix = usePrefix('node-path')
      if (!selected) return null
      const maxItems = props.maxItems ?? 3
      const nodes = selected
        .getParents()
        .slice(0, maxItems - 1)
        .reverse()
        .concat(selected)
      return () => (
        <Breadcrumb class={prefix}>
          {nodes.map((node, key) => {
            return (
              <Breadcrumb.Item key={key}>
                {key === 0 && <IconWidget infer="Position" style={{ marginRight: 3 }} />}
                <a
                  href=""
                  onMouseEnter={() => {
                    hover.setHover(node)
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    selection.select(node)
                  }}
                >
                  <NodeTitleWidget node={node} />
                </a>
              </Breadcrumb.Item>
            )
          })}
        </Breadcrumb>
      )
    }
  })
)
