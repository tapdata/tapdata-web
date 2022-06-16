import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  setup() {},
  render() {
    return (
      <div id="app">
        <router-view />
      </div>
    )
  }
})
