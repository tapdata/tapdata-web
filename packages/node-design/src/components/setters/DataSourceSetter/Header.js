import { observer } from '@formily/reactive-vue'
import { usePrefix } from '../../../hooks'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const Header = observer(
  defineComponent({
    setup: (props, { slots }) => {
      const prefix = usePrefix('data-source-setter')
      return () => (
        <div class={`${prefix + '-layout-item-header'}`}>
          <div class={`${prefix + '-layout-item-title'}`}>
            {slots.title?.()}
          </div>
          {slots.extra?.()}
        </div>
      )
    },
  })
)
