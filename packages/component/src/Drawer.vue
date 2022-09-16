<template>
  <div ref="drawer" class="drawer-wrapper" :style="{ width: width }" v-show="visible">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Drawer',
  props: {
    visible: Boolean,
    width: {
      type: String,
      default: () => {
        return '304px'
      }
    }
  },
  watch: {
    visible() {
      this.resize()
    }
  },
  mounted() {
    let mainContainer = document.body.getElementsByClassName('layout-main')[0]
    if (mainContainer) {
      mainContainer.appendChild(this.$el)
    } else {
      document.body.appendChild(this.$el)
    }
    this.resize()
    document.getElementById('app').addEventListener('mouseup', this.blur)
  },
  destroyed() {
    this?.$el?.parentNode?.removeChild(this.$el)
    document.getElementById('app').removeEventListener('mouseup', this.blur)
  },
  methods: {
    resize() {
      let top = document.body.getElementsByClassName('layout-header')?.[0]?.clientHeight || 0
      let height = document.body.clientHeight - top
      this.height = height + 'px'
    },
    blur(e) {
      if (this.visible) {
        let drawer = this.$refs.drawer
        if (drawer) {
          if (!drawer.contains(e.target)) {
            this.$emit('update:visible', false)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.drawer-wrapper {
  position: absolute;
  right: 0px;
  bottom: 0px;
  z-index: 2001;
  height: 100%;
  background-color: map-get($bgColor, white);
  box-shadow: 0 8px 10px -5px rgb(0 0 0 / 20%), 0 16px 24px 2px rgb(0 0 0 / 14%), 0 6px 30px 5px rgb(0 0 0 / 12%);
  overflow: auto;
  box-sizing: border-box;
}
</style>
