export default {
  mounted(el) {
    let target = el
    if (el.nodeName !== 'INPUT') {
      target = el.querySelector('input')
    }
    if (!target) return

    const onFocus = event => {
      event.target.select()
    }

    target.addEventListener('focus', onFocus, true)

    el._focusSelect = onFocus
    el._focusTarget = target
  },

  unMounted(el) {
    if (!el._focusSelect || !el._focusTarget) return

    el._focusTarget.removeEventListener('focus', el._focusSelect, true)
    delete el._focusTarget
    delete el._focusSelect
  }
}
