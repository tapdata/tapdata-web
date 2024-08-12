import { connect, mapProps } from '@formily/vue'

import { ElSwitch, ElPopconfirm } from 'element-plus'
export type SwitchProps = typeof ElSwitch
import { defineComponent } from 'vue'
import './style.scss'

export const Switch = connect(
  defineComponent({
    props: {
      value: [Boolean, String, Number],
      confirm: {
        type: Object,
      },
    },
    setup(props, { emit, attrs, listeners }) {
      const onConfirm = () => {
        emit('change', !props.value)
      }

      return () => {
        return props.confirm && !props.value ? (
          <ElPopconfirm
            popper-class="xxxx"
            popper-style={{ maxWidth: '300px' }}
            popperClass="pop-confirm"
            {...props.confirm}
            onConfirm={onConfirm}
          >
            {{
              reference: () => (
                <ElSwitch
                  modelValue={props.value}
                  {...attrs}
                  on={{
                    ...listeners,
                    input: () => {},
                    change: (val) => {
                      if (!val) {
                        emit('change', val)
                      }
                    },
                  }}
                />
              ),
            }}
          </ElPopconfirm>
        ) : (
          <ElSwitch modelValue={props.value} {...attrs} />
        )
      }
    },
  }),
  mapProps({ readOnly: 'readonly' }),
)

export default Switch
