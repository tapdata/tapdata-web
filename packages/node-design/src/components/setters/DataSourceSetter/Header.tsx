import { observer } from '@formily/reactive-vue'
import { defineComponent, type VNode } from 'vue'
import { usePrefix } from '../../../hooks'
import './styles.scss'

export interface IHeaderProps {
  extra: VNode | null
  title: VNode | string
}

export const Header = observer(
  defineComponent({
    inheritAttrs: false,
    props: ['title', 'extra'],
    setup(props) {
      const prefixRef = usePrefix('data-source-setter')
      return () => {
        const prefix = prefixRef.value
        return (
          <div class={String(`${prefix}-layout-item-header`)}>
            <div class={String(`${prefix}-layout-item-title`)}>
              {props.title}
            </div>
            {props.extra}
          </div>
        )
      }
    },
  }),
)
