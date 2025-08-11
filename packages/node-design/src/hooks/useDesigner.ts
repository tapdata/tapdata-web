import { isFn } from '@tap/shared'
import { inject, onBeforeUnmount, ref, type Ref } from 'vue'
import { DesignerEngineSymbol } from '../context'
import type { Engine } from '../core/models'

export interface IEffects {
  (engine: Engine): void
}

export const useDesigner = (effects?: IEffects): Ref<Engine> => {
  const designer = window.__DESIGNABLE_ENGINE__
    ? ref(window.__DESIGNABLE_ENGINE__)
    : inject(DesignerEngineSymbol, ref())

  const unRef: any = isFn(effects) ? effects?.(designer.value) : undefined

  onBeforeUnmount(() => {
    unRef?.()
  })
  return designer
}
