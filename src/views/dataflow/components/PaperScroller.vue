<template>
  <div class="paper-scroller" :class="scrollerClasses" tabindex="0" @mousedown="mouseDown" @wheel="wheelScroll">
    <div ref="scrollerBg" class="paper-scroller-background" :style="scrollerBgStyle">
      <div ref="paper" class="paper" :style="paperStyle">
        <div class="paper-content-wrap" :style="contentWrapStyle">
          <slot></slot>
        </div>
      </div>
      <div v-show="showSelectBox" class="select-box" :style="selectBoxStyle"></div>
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/util'
import { mapGetters, mapMutations } from 'vuex'
import { getDataflowCorners } from '@/views/dataflow/helpers'
import { on, off } from '@/utils/dom'
import deviceSupportHelpers from '@/mixins/deviceSupportHelpers'
import movePaper from '../mixins/movePaper'

export default {
  name: 'PaperScroller',

  mixins: [deviceSupportHelpers, movePaper],

  props: ['eventBus'],

  data() {
    return {
      showSelectBox: false,
      selectBoxAttr: null,
      paperScale: 1,
      scalePosition: [],
      options: {
        width: 800,
        height: 800
      },
      visibleArea: {
        width: 0,
        height: 0
      },
      translate: {
        x: 0,
        y: 0
      },
      // Paper反向尺寸
      paperReverseSize: {
        w: 0,
        h: 0
      },
      // Paper正向尺寸
      paperForwardSize: {
        w: 0,
        h: 0
      },
      // 按下空格键
      spaceKeyPressed: false,
      // 累积的缩放系数
      cumulativeZoomFactor: 1,
      // 缩放系数
      zoomFactor: 1.2
    }
  },

  computed: {
    ...mapGetters('dataflow', ['getCtor', 'isActionActive']),

    selectBoxStyle() {
      let attr = this.selectBoxAttr
      return attr
        ? {
            left: attr.x + 'px',
            top: attr.y + 'px',
            width: attr.w + 'px',
            height: attr.h + 'px'
          }
        : null
    },

    scrollerClasses() {
      const classes = []

      if (this.spaceKeyPressed === true) {
        if (this.$store.getters['dataflow/isPaperMoveInProgress']) {
          classes.push('move-in-process')
        } else {
          classes.push('move-active')
        }
      }

      return classes
    },

    scrollerBgStyle() {
      const paper = this.paperStyle
      const scale = this.paperScale

      return {
        width: parseInt(paper.left) * 2 + parseInt(paper.width) * scale + 'px',
        height: parseInt(paper.top) * 2 + parseInt(paper.height) * scale + 'px'
      }
    },
    paperOffset() {
      return {
        left: this.visibleArea.width - 50,
        top: this.visibleArea.height - 50
      }
    },
    paperStyle() {
      return {
        left: this.paperOffset.left + 'px',
        top: this.paperOffset.top + 'px',
        width: Math.max(this.options.width, this.paperForwardSize.w) + this.paperReverseSize.w + 'px',
        height: Math.max(this.options.height, this.paperForwardSize.h) + this.paperReverseSize.h + 'px',
        transform: `scale(${this.paperScale})`
        // transformOrigin: `${this.scalePosition[0]}px ${this.scalePosition[1]}px`
      }
    },
    contentWrapStyle() {
      return {
        transform: `translate(${this.paperReverseSize.w}px, ${this.paperReverseSize.h}px)`
      }
    }
  },

  created() {
    this.bindEvent()
  },

  async mounted() {
    this.initVisibleArea()
    await this.$nextTick()
    this.center()
  },

  destroyed() {
    this.offEvent()
  },

  methods: {
    ...mapMutations('dataflow', ['addNode', 'setActiveType']),

    bindEvent() {
      // 节点放置在画布内
      this.eventBus.$on('drop-node', (item, position, size) => {
        const bound = this.$refs.paper.getBoundingClientRect()
        const scale = this.paperScale
        let [x, y] = position

        x -= bound.x + this.paperReverseSize.w * scale + (size.width * (scale - 1)) / 2
        y -= bound.y + this.paperReverseSize.h * scale + (size.height * (scale - 1)) / 2

        x /= scale
        y /= scale

        const Ctor = this.getCtor(item.constructor)
        const ins = new Ctor(item)
        const node = {
          id: uuid(),
          name: item.name,
          type: item.type,
          position: [x, y],
          ...ins.getExtraAttr() // 附加属性
        }

        // 设置属性__Ctor不可枚举
        Object.defineProperty(node, '__Ctor', {
          value: ins,
          enumerable: false
        })

        this.addNode(node)
        // 自动改变页面大小
        this.autoResizePaper()
      })

      this.eventBus.$on('auto-resize-paper', this.autoResizePaper)

      on(document, 'keydown', this.keyDown)
      on(document, 'keyup', this.keyUp)
    },

    offEvent() {
      this.eventBus.$off('drop-node')
      off(document, 'keydown', this.onKeydown)
    },

    initVisibleArea() {
      this.visibleArea = {
        width: this.$el.clientWidth,
        height: this.$el.clientHeight
      }
    },

    center() {
      const paper = this.$refs.paper
      const scrollLeft = this.paperOffset.left - (this.visibleArea.width - paper.offsetWidth) / 2
      const scrollTop = this.paperOffset.top - (this.visibleArea.height - paper.offsetHeight) / 2
      this.$el.scrollLeft = scrollLeft
      this.$el.scrollTop = scrollTop
    },

    // 自动延伸画布，类似于无限画布
    autoResizePaper() {
      const { width, height } = this.options
      const { minX, minY, maxX, maxY } = getDataflowCorners(this.$store.getters['dataflow/allNodes'])

      let w = 0
      let h = 0
      let forwardW = 0
      let forwardH = 0

      if (minX < 0) {
        w = Math.ceil((minX * -1) / width) * width
      }
      if (minY < 0) {
        h = Math.ceil((minY * -1) / height) * height
      }

      const scale = this.paperScale
      // 画布发生了偏移，需要滚动对齐
      if (w !== this.paperReverseSize.w) {
        this.$el.scrollLeft += (w - this.paperReverseSize.w) * scale
      }
      this.paperReverseSize.w = w

      // 需要滚动
      if (h !== this.paperReverseSize.h) {
        this.$el.scrollTop += (h - this.paperReverseSize.h) * scale
      }
      this.paperReverseSize.h = h

      if (maxX > 0) {
        forwardW = Math.ceil(maxX / width) * width
      }

      if (maxY > 0) {
        forwardH = Math.ceil(maxY / height) * height
      }

      this.paperForwardSize.w = forwardW
      this.paperForwardSize.h = forwardH

      console.log('autoResizePaper', { minX, minY, maxX, maxY }, this.paperReverseSize)
    },

    keyDown(e) {
      if (typeof e.which !== 'number') {
        e.which = e.keyCode
      }

      if (e.which === 32) {
        this.spaceKeyPressed = true
        if (e.target === this.$el) e.preventDefault()
      }
    },

    keyUp(e) {
      if (typeof e.which !== 'number') {
        e.which = e.keyCode
      }

      if (e.which === 32) {
        this.spaceKeyPressed = false
      }
    },

    mouseDown(e) {
      console.log('mouseDown', e.button)
      on(window, 'mouseup', this.mouseUp)

      // 鼠标拖选
      this.mouseDownMouseSelect(e)
      // 鼠标移动画布
      this.mouseDownMovePaper(e)
    },

    mouseDownMouseSelect(e) {
      if (this.spaceKeyPressed) return

      if (this.isActionActive('dragActive')) return

      this.mouseClickPosition = this.getMousePositionWithinScroller(e)
      this.selectActive = true

      // this.showSelectBox(e)

      on(document, 'mousemove', this.mouseMoveSelect)
    },

    mouseMoveSelect(e) {
      e.preventDefault() // 防止拖动时文字被选中

      if (e.buttons === 0) {
        // 没有按键或者是没有初始化
        this.mouseUpMouseSelect(e)
        return
      }

      this.showSelectBox = true
      let w, h, x, y
      const pos = this.getMousePositionWithinScroller(e)

      console.log('mouseMoveSelect', pos)

      x = Math.min(this.mouseClickPosition.x, pos.x)
      y = Math.min(this.mouseClickPosition.y, pos.y)
      w = Math.abs(this.mouseClickPosition.x - pos.x)
      h = Math.abs(this.mouseClickPosition.y - pos.y)

      this.selectBoxAttr = { x, y, w, h, right: x + w, bottom: y + h }
    },

    mouseUp() {
      off(window, 'mouseup', this.mouseUp)

      this.mouseUpMouseSelect()
      this.mouseUpMovePaper()
    },

    mouseUpMouseSelect() {
      if (!this.selectActive) {
        return
      }

      off(document, 'mousemove', this.mouseMoveSelect)

      let boxAttr // 转换后的拖选框坐标，可直接和节点坐标做比较

      // 显示拖选框时，执行判断逻辑
      if (this.showSelectBox) {
        let { x, y, bottom, right } = this.selectBoxAttr
        // 计算页面偏移与扩展尺寸的总和
        const paperLeft = this.paperOffset.left + this.paperReverseSize.w
        const paperTop = this.paperOffset.top + this.paperReverseSize.h
        const scale = this.paperScale
        // 减去总和可与节点坐标直接比较
        x -= paperLeft
        right -= paperLeft
        y -= paperTop
        bottom -= paperTop

        x /= scale
        y /= scale
        right /= scale
        bottom /= scale
        boxAttr = { x, y, right, bottom }
      }

      this.$emit('mouse-select', this.showSelectBox, boxAttr)
      this.hideSelectBox()
    },

    hideSelectBox() {
      this.selectActive = false
      this.showSelectBox = false
      this.selectBoxAttr = null
    },

    getMousePositionWithinScroller(e) {
      let { x, y } = this.$refs.scrollerBg.getBoundingClientRect()
      return {
        x: e.pageX - x,
        y: e.pageY - y
      }
    },

    wheelScroll(e) {
      /*e.preventDefault()
      const bound = this.$refs.paper.getBoundingClientRect()
      console.log('wheelScroll', e.pageX - bound.x, e.pageY - bound.y)
      return*/

      if (this.isCtrlKeyPressed(e) || e.ctrlKey) {
        if (e.deltaY > 0) {
          this.zoomOut(e)
        } else {
          this.zoomIn(e)
        }

        e.preventDefault()
      }
    },

    /**
     * 缩小
     */
    zoomOut(e) {
      console.log('缩小')
      if (this.paperScale * this.cumulativeZoomFactor <= 0.15) {
        this.cumulativeZoomFactor *= (this.paperScale - 0.05) / this.paperScale
      } else {
        // Uses to 5% zoom steps for better grid rendering in webkit
        // and to avoid rounding errors for zoom steps
        this.cumulativeZoomFactor /= this.zoomFactor
        this.cumulativeZoomFactor = Math.round(this.paperScale * this.cumulativeZoomFactor * 20) / 20 / this.paperScale
        this.setZoomLevel(e)
      }
    },
    /**
     * 放大
     */
    zoomIn(e) {
      console.log('放大')
      if (this.paperScale * this.cumulativeZoomFactor <= 0.15) {
        this.cumulativeZoomFactor *= (this.paperScale + 0.05) / this.paperScale
      } else {
        this.cumulativeZoomFactor *= this.zoomFactor
        this.cumulativeZoomFactor = Math.round(this.paperScale * this.cumulativeZoomFactor * 20) / 20 / this.paperScale
      }
      this.cumulativeZoomFactor =
        Math.max(0.05, Math.min(this.paperScale * this.cumulativeZoomFactor, 160)) / this.paperScale
      this.setZoomLevel(e)
    },

    setZoomLevel(e) {
      /*const bound = this.$refs.paper.getBoundingClientRect()
      let prevScale = this.paperScale
      this.paperScale = this.cumulativeZoomFactor
      const cx = (e.pageX - bound.x) / prevScale
      const cy = (e.pageY - bound.y) / prevScale
      this.scalePosition = [cx, cy]
      prevScale = this.paperScale
      console.log('scalePosition', this.scalePosition, e.pageX, e.pageY, bound)*/

      console.log('pageXY', e.pageX, e.pageY, e.clientX, e.clientY)

      const px = e.pageX
      const py = e.pageY

      let prevScale = this.paperScale

      let pointX = this.$el.scrollLeft
      let pointY = this.$el.scrollTop

      let xs = (px - pointX) / prevScale
      let ys = (py - pointY) / prevScale

      this.paperScale = this.cumulativeZoomFactor

      pointX = px - xs * this.paperScale
      pointY = py - ys * this.paperScale

      // this.$el.scrollLeft = pointX
      // this.$el.scrollTop = pointY

      this.$el.scrollLeft = pointX
      this.$el.scrollTop = pointY

      console.log('scroll', pointX, pointY)

      /*var xs = (e.clientX - pointX) / scale,
        ys = (e.clientY - pointY) / scale,
        delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
      (delta > 0) ? (scale *= 1.2) : (scale /= 1.2);
      pointX = e.clientX - xs * scale;
      pointY = e.clientY - ys * scale;*/
      // this.cumulativeZoomFactor = 1
      this.$emit('change-scale', this.paperScale)
    }
  }
}
</script>

<style scoped lang="scss">
.paper-scroller {
  width: 100%;
  height: 100%;
  overflow: scroll;
  outline: none;
  .paper-scroller-background {
    position: relative;
    .paper {
      position: absolute;
      background: linear-gradient(45deg, black, transparent);
      transform-origin: left top;
    }
  }
}

.move-active {
  cursor: grab;
  touch-action: none;
}

.move-in-process {
  cursor: grabbing;
  touch-action: none;
}

.select-box {
  position: absolute;
  background: rgba(23, 159, 251, 0.1);
  border: 1px solid #179ffb;
}
</style>
