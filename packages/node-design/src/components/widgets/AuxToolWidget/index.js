import { useViewport, useCursor, useDragon, useDesigner, usePrefix, useOperation, useEffect } from '../../../hooks'
import { Insertion } from './Insertion'
import { Selection } from './Selection'
import { FreeSelection } from './FreeSelection'
import { Cover } from './Cover'
import { DashedBox } from './DashedBox'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const AuxToolWidget = defineComponent({
  setup: (props, { refs }) => {
    const engine = useDesigner()
    const viewport = useViewport()
    const prefix = usePrefix('auxtool')

    engine.value.subscribeWith('viewport:scroll', () => {
      if (viewport.value.isIframe && refs.root) {
        refs.root.style.transform = `perspective(1px) translate3d(${-viewport.scrollX}px,${-viewport.scrollY}px,0)`
      }
    })

    return () => {
      if (!viewport.value) return null
      return (
        <div ref="root" class={prefix}>
          <Insertion />
          <DashedBox />
          <Selection />
          <Cover />
          <FreeSelection />
        </div>
      )
    }
  }
})
