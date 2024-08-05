import { connect, mapProps } from '@formily/vue'

import type { Switch as ElSwitchProps } from 'element-ui'
import { Switch as ElSwitch, Popconfirm } from 'element-ui'
import { defineComponent, ref } from '@vue/composition-api'
import './style.scss'

export const Switch = connect(
  defineComponent({
    props: {
      value: [Boolean, String, Number],
      confirm: {
        type: Object
      }
    },
    setup(props, { emit, attrs, listeners }) {
      const onConfirm = () => {
        emit('change', !Boolean(props.value))
      }

      return () => {
        return props.confirm && !Boolean(props.value) ? (
          <Popconfirm
            popperClass="pop-confirm"
            props={{ ...props.confirm }}
            onConfirm={onConfirm}
            scopedSlots={{
              reference: () => (
                <ElSwitch
                  value={props.value}
                  attrs={{ ...attrs }}
                  on={{
                    ...listeners,
                    input: () => {},
                    change: val => {
                      if (!val) {
                        emit('change', val)
                      }
                    }
                  }}
                />
              )
            }}
          ></Popconfirm>
        ) : (
          <ElSwitch
            value={props.value}
            attrs={{ ...attrs }}
            on={{
              ...listeners
            }}
          />
        )
      }
    }
  }),
  mapProps({ readOnly: 'readonly' })
)

export default Switch
