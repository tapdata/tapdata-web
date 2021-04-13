<template>
  <div class="drawer-block" :style="{ width: width }" v-show="drawerVisible">
    <transition
      enter-active-class="animate__animated animate__fadeIn"
      leave-active-class="animate__animated animate__fadeOut"
    >
      <div class="drawer-mask" v-show="opened" @click="hide()"></div>
    </transition>
    <transition
      enter-active-class="animate__animated animate__slideInRight"
      leave-active-class="animate__animated animate__slideOutRight"
    >
      <div class="drawer-container" v-show="opened">
        <header>
          <div class="drawer-title">{{ title }}</div>
        </header>
        <main>
          <slot></slot>
        </main>
        <footer v-if="$slots.footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Drawer',
  props: {
    visible: Boolean,
    title: String
  },
  data() {
    return { drawerVisible: false, opened: false, clientWidth: 0, sliderWidth: 0 }
  },
  computed: {
    width() {
      return this.clientWidth - this.sliderWidth + 2 + 'px'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.resize()
        this.show()
      } else {
        this.hide()
      }
    }
  },
  mounted() {
    let eBodyEl = document.body.getElementsByClassName('e-body')[0]
    if (eBodyEl) {
      this.clientWidth = eBodyEl.clientWidth
      eBodyEl.appendChild(this.$el)
      this.resize()
    } else {
      this.clientWidth = '800px'
    }
  },
  destroyed() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    resize() {
      let eSideBarRight = document.body.getElementsByClassName('e-sidebar-right')[0]
      this.$nextTick(() => {
        this.sliderWidth = eSideBarRight.clientWidth
      })
    },
    show() {
      this.drawerVisible = true
      this.$emit('update:visible', true)
      this.$nextTick(() => {
        this.opened = true
      })
    },
    hide() {
      this.opened = false
      setTimeout(() => {
        //避免在窗口收起时再次点击显示会闪屏的问题
        if (this.opened) {
          return
        }
        this.$emit('update:visible', false)
        this.drawerVisible = false
      }, 500)
    }
  }
}
</script>

<style lang="less" scoped>
.drawer-block {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2003;
  overflow: hidden;
  height: 100%;

  color: rgba(51, 51, 51, 1);
  border-right: 1px solid #d3d3d3;
  .drawer-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.55);
  }
  .drawer-container {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    min-width: 40%;
    float: right;
    background: #fafafa;
    .drawer-title {
      height: 30px;
      line-height: 30px;
      background: rgba(241, 241, 241, 1);
      border: 1px solid rgba(222, 222, 228, 1);
      font-size: 14px;
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      padding: 0 20px;
    }
    main {
      flex: 1;
      padding: 20px;
      overflow: auto;
    }
    footer {
      padding: 10px 20px 20px 20px;
      text-align: center;
      box-sizing: border-box;
    }
  }
}
</style>
