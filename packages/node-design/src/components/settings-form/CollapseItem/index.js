import { useField } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { IconWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import './styles.scss'
import { defineComponent, ref } from 'vue-demi'

export const CollapseItem = observer(
  defineComponent({
    props: ['defaultExpand'],
    setup(props, { slots }) {
      const prefix = usePrefix('collapse-item')
      const field = useField()
      const expand = ref(props.defaultExpand ?? true)
      return () => {
        return (
          <div class={[prefix, { expand: expand.value }]}>
            <div
              class={prefix + '-header'}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                expand.value = !expand.value
              }}
            >
              <div class={prefix + '-header-expand'}>
                <IconWidget infer="Expand" size={10} />
              </div>
              <div class={prefix + '-header-content'}>{field.value.title}</div>
            </div>
            <div class={prefix + '-content'}>{slots.default?.()}</div>
          </div>
        )
      }
    },
  })
)
