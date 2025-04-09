<script>
import { $emit, $off, $on, $once } from '../utils/gogocodeTransfer'
export default {
  name: 'Drawer',
  props: {
    visible: Boolean,
    width: {
      type: String,
      default: () => {
        return '304px'
      },
    },
  },
  emits: ['update:visible', 'visible'],
  watch: {
    visible() {
      this.resize()
    },
  },
  mounted() {
    const mainContainer = document.body.querySelectorAll('.layout-main')[0]
    if (mainContainer) {
      mainContainer.append(this.$el)
    } else {
      document.body.append(this.$el)
    }
    this.resize()
    document.querySelector('#app').addEventListener('mouseup', this.blur)
  },
  unmounted() {
    this?.$el?.parentNode?.removeChild(this.$el)
    document.querySelector('#app').removeEventListener('mouseup', this.blur)
  },
  methods: {
    resize() {
      const top =
        document.body.querySelectorAll('.layout-header')?.[0]?.clientHeight || 0
      const height = document.body.clientHeight - top
      this.height = `${height}px`
    },
    blur(e) {
      if (this.visible) {
        const drawer = this.$refs.drawer
        if (drawer && !drawer.contains(e.target)) {
          $emit(this, 'update:visible', false)
          $emit(this, 'visible', false)
        }
      }
    },
  },
}
</script>

<template>
  <div v-show="visible" ref="drawer" class="drawer-wrapper" :style="{ width }">
    <slot />
  </div>
</template>

<style lang="scss">
.drawer-wrapper {
  position: absolute;
  right: 0px;
  bottom: 0px;
  z-index: 2001;
  height: 100%;
  background-color: map.get($bgColor, white);
  box-shadow:
    0 8px 10px -5px rgb(0 0 0 / 20%),
    0 16px 24px 2px rgb(0 0 0 / 14%),
    0 6px 30px 5px rgb(0 0 0 / 12%);
  overflow: auto;
  box-sizing: border-box;
}
</style>
