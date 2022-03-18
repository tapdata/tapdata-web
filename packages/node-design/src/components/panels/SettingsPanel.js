import { observer } from '@formily/reactive-vue'
import { TextWidget, IconWidget } from '../widgets'
import { usePrefix, useWorkbench } from '../../hooks'
import { defineComponent, ref, watch } from 'vue-demi'

export const SettingsPanel = observer(
  defineComponent({
    props: ['title', 'extra'],
    setup: (props, { slots }) => {
      const prefix = usePrefix('settings-panel')
      const workbenchRef = useWorkbench()
      const innerVisible = ref(true)
      const pinning = ref(false)
      const visible = ref(true)
      const workbenchType = ref(workbenchRef.value.type)

      watch([visible, workbenchType], () => {
        if (visible || workbenchType.value === 'DESIGNABLE') {
          if (!innerVisible.value) {
            // requestIdle(() => {
            //   requestAnimationFrame(() => {
            innerVisible.value = true
            // })
            // })
          }
        }
      })

      if (workbenchRef.value.type !== 'DESIGNABLE') {
        if (innerVisible.value) innerVisible.value = false
        return null
      }
      if (!visible) {
        if (innerVisible.value) innerVisible.value = false
        return (
          <div
            class={prefix + '-opener'}
            onClick={() => {
              visible.value = true
            }}
          >
            <IconWidget infer="Setting" size={20} />
          </div>
        )
      }
      return () => (
        <div class={[prefix, { pinning: pinning.value }]}>
          <div class={prefix + '-header'}>
            <div class={prefix + '-header-title'}>
              <TextWidget>{props.title}</TextWidget>
            </div>
            <div class={prefix + '-header-actions'}>
              <div class={prefix + '-header-extra'}>{props.extra}</div>
              {!pinning && (
                <IconWidget
                  infer="PushPinOutlined"
                  class={prefix + '-header-pin'}
                  onClick={() => {
                    pinning.value = !pinning.value
                  }}
                />
              )}
              {pinning.value && (
                <IconWidget
                  infer="PushPinFilled"
                  class={prefix + '-pin-filled'}
                  onClick={() => {
                    pinning.value = !pinning.value
                  }}
                />
              )}
              <IconWidget
                infer="Close"
                class={prefix + '-header-close'}
                onClick={() => {
                  visible.value = false
                }}
              />
            </div>
          </div>
          <div class={prefix + '-body'}>{innerVisible && slots.default?.()}</div>
        </div>
      )
    }
  })
)
