import { transformComponent } from '@formily/element-plus/lib/__builtins__/shared'
import { connect, mapProps } from '@formily/vue'
import { set } from 'ace-builds-internal/config'
import { ElPopconfirm, ElSwitch } from 'element-plus'
import { defineComponent, reactive } from 'vue'
import './style.scss'
export type SwitchProps = typeof ElSwitch

const TransformElSwitch = transformComponent<SwitchProps>(ElSwitch, {
  change: 'update:modelValue',
})

export const Switch = connect(
  defineComponent({
    props: {
      value: [Boolean, String, Number],
      confirm: {
        type: Object,
      },
    },
    emits: ['change', 'update:value'],
    setup(props, { emit, attrs }) {
      const onConfirm = () => {
        state.resolve?.(true)
      }

      const onCancel = () => {
        state.reject?.()
      }

      const state = reactive({
        resolve: null,
        reject: null,
      })

      const beforeChange = () => {
        return new Promise((resolve, reject) => {
          if (props.value) {
            setTimeout(() => {
              resolve(true)
            }, 10)
          } else {
            state.resolve = resolve
            state.reject = reject
          }
        })
      }

      return () => {
        return props.confirm ? (
          <ElPopconfirm
            disabled={props.value}
            popper-style={{ maxWidth: '300px' }}
            popper-class="pop-confirm"
            {...props.confirm}
            onConfirm={onConfirm}
            onCancel={onCancel}
          >
            {{
              reference: () => (
                <TransformElSwitch
                  modelValue={props.value}
                  {...attrs}
                  before-change={beforeChange}
                  onInput={() => {}}
                  onChange={(val) => {
                    emit('change', val)
                    emit('update:value', val)
                  }}
                />
              ),
            }}
          </ElPopconfirm>
        ) : (
          <TransformElSwitch
            modelValue={props.value}
            {...attrs}
            onChange={(val) => {
              emit('update:value', val)
            }}
          />
        )
      }
    },
  }),
  mapProps({
    value: 'modelValue',
    readOnly: 'readonly',
  }),
)

export default Switch
