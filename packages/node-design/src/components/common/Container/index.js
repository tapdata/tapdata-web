import { observer } from '@formily/reactive-vue'
import { DroppableWidget } from '../../widgets'
import './styles.scss'
import { defineComponent, toRefs } from 'vue-demi'

export const Container = observer(
  defineComponent({
    setup: (props, { slots }) => {
      return () => <DroppableWidget>{slots.default?.()}</DroppableWidget>
    },
  })
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
