import * as Vue from 'vue'

/**
 * This mixin provides `attrs$` and `listeners$` to work around
 * vue bug https://github.com/vuejs/vue/issues/10115
 */

function makeWatcher(property) {
  return function (val, oldVal) {
    for (const attr in oldVal) {
      if (!Object.prototype.hasOwnProperty.call(val, attr)) {
        delete this.$data[property]
      }
    }
    for (const attr in val) {
      this.$data[property][attr] = val[attr]
    }
  }
}

export default Vue.extend({
  data: () => ({
    attrs$: {},
    listeners$: {},
  }),

  created() {
    this.$watch('$attrs', makeWatcher('attrs$'), { immediate: true })
    this.$watch('$listeners', makeWatcher('listeners$'), { immediate: true })
  },
})
