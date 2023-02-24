<template>
  <div class="miniview shadow flex justify-center align-center" :style="style">
    <div class="miniview-paper-wrap" :style="wrapStyle">
      <div
        ref="paperView"
        class="miniview-paper"
        :style="paperStyle"
        @mousedown="mouseDown($event, true)"
      >
        <div
          v-for="(c, i) in coms"
          :style="c"
          :key="i"
          class="component-placeholder"
        ></div>
      </div>
      <div
        ref="currentView"
        class="current-view"
        :style="currentViewStyle"
        @mousedown="mouseDown"
      ></div>
    </div>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
export default {
  name: 'MiniView',
  props: {
    paperSize: Object,
    paperReverseSize: Object,
    paperOffset: Object,
    paperScale: Number,
    workView: Object,
    scrollPosition: Object,
    width: {
      type: Number,
      default: 150,
    },
    height: {
      type: Number,
      default: 150,
    },
    padding: {
      type: Number,
      default: 10,
    },
  },
  computed: {
    style() {
      return {
        width: this.width + 'px',
        height: this.height + 'px',
        padding: this.padding + 'px',
      }
    },
    scale() {
      const maxW = this.width - this.padding * 2 - 2
      const maxH = this.height - this.padding * 2 - 2
      const paperW = this.paperSize.width
      const paperH = this.paperSize.height
      return Math.min(maxW / paperW, maxH / paperH)
    },
    wrapStyle() {
      return {
        width: this.paperSize.width * this.scale + 'px',
        height: this.paperSize.height * this.scale + 'px',
      }
    },
    paperStyle() {
      return {
        width: this.paperSize.width + 'px',
        height: this.paperSize.height + 'px',
        transform: `scale(${this.scale})`,
      }
    },
    coms() {
      const { w, h } = this.paperReverseSize
      const nodes = this.$store.getters['dataflow/allNodes']
      return nodes.map((n) => ({
        left: n.attrs.position[0] + w + 'px',
        top: n.attrs.position[1] + h + 'px',
      }))
    },
    viewPosition() {
      const { scale, paperScale } = this
      const { x, y } = this.scrollPosition,
        { width: ww, height: wh } = this.workView,
        { left: paperLeft, top: paperTop } = this.paperOffset,
        m = 1 / paperScale,
        rect = {
          width: Math.round(ww * m * scale),
          height: Math.round(wh * m * scale),
          left: 0,
          top: 0,
        }
      rect.left = ((x - paperLeft) / paperScale) * scale
      rect.top = ((y - paperTop) / paperScale) * scale
      return rect
    },
    currentViewStyle() {
      const obj = this.viewPosition
      return {
        left: obj.left + 'px',
        top: obj.top + 'px',
        width: obj.width + 'px',
        height: obj.height + 'px',
      }
    },
  },
  methods: {
    /**
     * 鼠标拖拽事件委托
     * @param moveCallback
     * @param moveStopCallback
     */
    dragDelegate(moveCallback, moveStopCallback) {
      let point, a
      const s = { x: 0, y: 0 },
        r = { dx: 0, dy: 0 }
      let flag = false,
        c = Object.assign({}, s)
      const onMove = (event) => {
          if (event.buttons === 0) return
          point || (point = { pageX: event.pageX, pageY: event.pageY })
          a || (a = point)
          s.x = event.pageX - point.pageX
          s.y = event.pageY - point.pageY
          r.dx = event.pageX - a.pageX
          r.dy = event.pageY - a.pageY
          a = { pageX: event.pageX, pageY: event.pageY }
          flag || ((Math.abs(s.x) >= 5 || Math.abs(s.y) >= 5) && (flag = true))
          const isNotSame = c.x !== s.x || c.y !== s.y
          flag &&
            isNotSame &&
            ((c = Object.assign({}, s)), moveCallback(event, s, r, point))
        },
        h = (e) => {
          point = undefined
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', h)
          moveStopCallback?.(e, s, flag)
        }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', h)
    },

    mouseDown(e, inPaper) {
      if (e.buttons === 0) return
      e.stopPropagation()
      e.preventDefault()

      let { left, top, width, height } = this.viewPosition
      if (inPaper) {
        const point = this.getMousePositionWithinPaperView(e)
        left = point.x - width / 2
        top = point.y - height / 2
        $emit(this, 'drag-move', {
          x: left / this.scale,
          y: top / this.scale,
        })
      }

      this.dragDelegate((e, { x, y }) => {
        x = (left + x) / this.scale
        y = (top + y) / this.scale
        $emit(this, 'drag-move', {
          x,
          y,
        })
      })
    },

    getMousePositionWithinPaperView(e) {
      let { x, y } = this.$refs.paperView.getBoundingClientRect()
      return {
        x: e.pageX - x,
        y: e.pageY - y,
      }
    },
  },
  emits: ['drag-move'],
}
</script>

<style lang="scss" scoped>
.miniview {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid #d1d1d1;
  right: 25px;
  bottom: 25px;
  background-color: #fff;
  border-radius: 3px;
  overflow: hidden;
  z-index: 100;
  &-paper-wrap {
    position: relative;
    border: 1px solid #d1d1d1;
  }

  &-paper {
    position: relative;
    transform-origin: 0 0;
    cursor: pointer;

    .component-placeholder {
      position: absolute;
      width: 160px;
      height: 36px;
      background-color: map-get($color, primary);
    }
  }

  .current-view {
    position: absolute;
    border: 1px solid map-get($color, primary);
    cursor: move;
  }
}
</style>
