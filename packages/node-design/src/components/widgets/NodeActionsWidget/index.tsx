import { observer } from '@formily/reactive-vue'
import { ElDivider as Divider, ElLink, ElSpace as Space } from 'element-plus'
import { defineComponent } from 'vue'
import { usePrefix, useSelected, useTreeNode } from '../../../hooks'
import { IconWidget } from '../IconWidget'
import { TextWidget } from '../TextWidget'
import './styles.scss'

export const NodeActionsWidget = observer(
  defineComponent({
    props: ['activeShown'],
    setup: (props, { slots }) => {
      const node = useTreeNode()
      const prefix = usePrefix('node-actions')
      const selected = useSelected()
      if (!selected.includes(node.id) && props.activeShown) return null
      return () => (
        <div class={prefix}>
          <div class={`${prefix}-content`}>
            <Space split={<Divider type="vertical" />}>
              {slots.default?.()}
            </Space>
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
        <span class={`${prefix}-text`}>
          <IconWidget infer={icon} />
          <TextWidget>{title}</TextWidget>
        </span>
      </ElLink>
    )
  },
})
