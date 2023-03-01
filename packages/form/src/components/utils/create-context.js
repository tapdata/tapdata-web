import { defineComponent, provide, inject, readonly, ref, toRef } from 'vue'

export const createContext = defaultValue => {
  const injectKey = Symbol()

  return {
    Provider: defineComponent({
      name: 'ContextProvider',
      props: {
        value: {
          type: null,
          default() {
            return defaultValue ?? null
          }
        }
      },
      setup(props, { slots }) {
        const value = toRef(props, 'value')
        provide(injectKey, readonly(value))

        return () => slots?.default?.()
      }
    }),

    Consumer: defineComponent({
      name: 'ContextConsumer',
      setup(_props, { slots }) {
        const value = inject(injectKey)

        return () => slots?.default?.(value)
      }
    }),
    injectKey
  }
}

export const useContext = context => {
  const key = context.injectKey

  return inject(key, ref(null))
}
