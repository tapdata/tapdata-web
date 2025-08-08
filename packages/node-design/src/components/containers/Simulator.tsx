import { observer } from '@formily/reactive-vue'
import { defineComponent } from 'vue'
import { PCSimulator } from '../simulators'

export type ISimulatorProps = HTMLDivElement & any

const SimulatorComponent = defineComponent({
  setup(props, { attrs, slots }) {
    return () => {
      return (
        <PCSimulator {...attrs} {...props}>
          {slots.default?.()}
        </PCSimulator>
      )
    }
  },
})

export const Simulator = observer(SimulatorComponent)
