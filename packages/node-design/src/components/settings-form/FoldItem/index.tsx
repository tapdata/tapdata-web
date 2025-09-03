import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { FragmentComponent, useField } from '@formily/vue'
import { composeExport, FormItem } from '@tap/form'
import { defineComponent } from 'vue'
import { usePrefix } from '../../../hooks'
import { IconWidget } from '../../widgets'
import './styles.scss'

const ExpandedMap = new Map()

const FoldItemComponent = observer(
  defineComponent({
    props: ['label'],
    setup: (props, { attrs, slots }) => {
      const prefixRef = usePrefix('fold-item')
      const fieldRef = useField()
      const expand = observable.ref(
        ExpandedMap.get(fieldRef.value.address.toString()),
      )

      return () => {
        const prefix = prefixRef.value
        const field = fieldRef.value
        return (
          <div class={prefix}>
            <div
              class={`${prefix}-base`}
              onClick={() => {
                expand.value = !expand.value
                ExpandedMap.set(field.address.toString(), expand.value)
              }}
            >
              <FormItem.BaseItem
                attrs={attrs}
                label={
                  <span
                    class={[
                      `${prefix}-title`,
                      {
                        expand: expand.value,
                      },
                    ]}
                  >
                    {slots.extra && <IconWidget infer="Expand" size={10} />}
                    {props.label}
                  </span>
                }
              >
                <div
                  style={{ width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {slots.base?.()}
                </div>
              </FormItem.BaseItem>
            </div>
            {expand.value && slots.extra && (
              <div class={`${prefix}-extra`}>{slots.extra?.()}</div>
            )}
          </div>
        )
      }
    },
  }),
)

export const FoldItem = composeExport(FoldItemComponent, {
  Base: composeExport(() => <FragmentComponent></FragmentComponent>, {
    displayName: 'FoldItem.Base',
  }),
  Extra: composeExport(() => <FragmentComponent></FragmentComponent>, {
    displayName: 'FoldItem.Extra',
  }),
})
