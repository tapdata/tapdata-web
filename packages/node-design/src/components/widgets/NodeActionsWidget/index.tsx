import { ElSpace as Space, ElLink, ElDivider as Divider } from 'element-plus'
import { observer } from '@formily/reactive-vue'
import { usePrefix, useTreeNode, useSelected } from '../../../hooks'
import { IconWidget } from '../IconWidget'
import { TextWidget } from '../TextWidget'
import './styles.scss'
import { defineComponent } from 'vue'

export const NodeActionsWidget = observer(
  defineComponent({
    props: ['activeShown'],
    setup: (props, { slots }) => {
      const node = useTreeNode()
      const prefix = usePrefix('node-actions')
      const selected = useSelected()
      if (selected.indexOf(node.id) === -1 && props.activeShown) return null
      return () => (
        <div class={prefix}>
          <div class={prefix + '-content'}>
            <Space split={<Divider type="vertical" />}>{slots.default?.()}</Space>
          </div>
        </div>
      )
    },
  }),
)

NodeActionsWidget.Action = defineComponent({
  setup: ({ icon, title, ...props }) => {
    const prefix = usePrefix('node-actions-item')
    return () => (
      <ElLink {...props} class={prefix} data-click-stop-propagation="true">
        <span class={prefix + '-text'}>
          <IconWidget infer={icon} />
          <TextWidget>{title}</TextWidget>
        </span>
      </ElLink>
    )
  },
})
