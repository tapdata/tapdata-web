import { observer } from '@formily/reactive-vue'
import { defineComponent, toRefs } from 'vue'
import './styles.scss'

export const Container = observer(
  defineComponent({
    setup: (props, { slots }) => {
      return () => <DroppableWidget>{slots.default?.()}</DroppableWidget>
    },
  }),
)

export const withContainer = (Target) => {
  return defineComponent((props) => {
    const propsRef = toRefs(props)
    return () => (
      <DroppableWidget>
        <Target {...propsRef} />
      </DroppableWidget>
    )
  })
}
