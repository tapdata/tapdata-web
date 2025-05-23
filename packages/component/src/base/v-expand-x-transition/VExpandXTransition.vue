<script lang="jsx">
import { defineComponent } from 'vue'

function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function ExpandTransitionGenerator(expandedParentClass = '', x = false) {
  const sizeProperty = x ? 'width' : 'height'
  const offsetProperty = `offset${upperFirst(sizeProperty)}`

  return {
    onBeforeEnter(el) {
      el._parent = el.parentNode
      el._initialStyle = {
        transition: el.style.transition,
        overflow: el.style.overflow,
        [sizeProperty]: el.style[sizeProperty],
      }
      console.log('beforeEnter', el._initialStyle) // eslint-disable-line
    },

    onEnter(el) {
      const initialStyle = el._initialStyle

      el.style.setProperty('transition', 'none', 'important')
      el.style.overflow = 'hidden'
      const offset = `${el[offsetProperty]}px`

      el.style[sizeProperty] = '0'

      void el.offsetHeight // force reflow

      el.style.transition = initialStyle.transition

      if (expandedParentClass && el._parent) {
        el._parent.classList.add(expandedParentClass)
      }

      requestAnimationFrame(() => {
        el.style[sizeProperty] = offset
      })
    },

    onAfterEnter: resetStyles,
    onEnterCancelled: resetStyles,

    onLeave(el) {
      el._initialStyle = {
        transition: '',
        overflow: el.style.overflow,
        [sizeProperty]: el.style[sizeProperty],
      }

      el.style.overflow = 'hidden'
      el.style[sizeProperty] = `${el[offsetProperty]}px`
      void el.offsetHeight // force reflow
      requestAnimationFrame(() => (el.style[sizeProperty] = '0'))
    },

    onAfterLeave,
    onLeaveCancelled: onAfterLeave,
  }

  function onAfterLeave(el) {
    if (expandedParentClass && el._parent) {
      el._parent.classList.remove(expandedParentClass)
    }
    resetStyles(el)
  }

  function resetStyles(el) {
    const size = el._initialStyle?.[sizeProperty]
    el.style.overflow = el._initialStyle?.overflow
    if (size != null) el.style[sizeProperty] = size
    delete el._initialStyle
  }
}

export default defineComponent((props, { slots }) => {
  return () => (
    <Transition
      name="expand-x-transition"
      {...ExpandTransitionGenerator('', true)}
    >
      {slots.default()}
    </Transition>
  )
})
</script>

<style lang="scss">
.expand-x-transition {
  &-enter-active,
  &-leave-active {
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1) !important;
  }

  &-move {
    transition: transform 0.6s;
  }
}
</style>
