import { requestIdle } from '@tap/shared'
import { observer } from '@formily/reactive-vue'
import { PCSimulator } from '../simulators'
import { defineComponent } from 'vue'

export const Simulator = observer(
  defineComponent({
    setup: (props, { slots }) => {
      return () => <PCSimulator props={props}>{slots.default?.()}</PCSimulator>
    },
  }),
  {
    scheduler: requestIdle,
  },
)
