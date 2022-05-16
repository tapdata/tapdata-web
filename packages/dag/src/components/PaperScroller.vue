<template>
  <div
    class="paper-scroller hide-scrollbar"
    :class="scrollerClasses"
    tabindex="0"
    @mousedown="mouseDown"
    @wheel="wheelScroll"
    @scroll="handleScroll"
  >
    <div ref="scrollerBg" class="paper-scroller-background" :style="scrollerBgStyle">
      <div ref="paper" class="paper" :style="paperStyle">
        <!--safari 低版本 增加-->
        <!--<div class="paper-content-wrap" :style="contentWrapStyle" style="position: relative">-->
        <div class="paper-content-wrap" :style="contentWrapStyle">
          <slot></slot>
          <div class="nav-line" v-for="(l, i) in navLines" :key="`l-${i}`" :style="l"></div>
        </div>
      </div>
      <div v-show="showSelectBox" class="select-box" :style="selectBoxStyle"></div>
    </div>
    <MiniView
      v-if="showMiniView"
      :paper-size="paperSize"
      :paper-reverse-size="paperReverseSize"
      :paper-offset="paperOffset"
      :paper-scale="paperScale"
      :work-view="visibleArea"
      :scroll-position="scrollPosition"
      @drag-move="handleViewMove"
    ></MiniView>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { on, off } from '@tap/shared'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { getDataflowCorners } from '../helpers'
import movePaper from '../mixins/movePaper'
import MiniView from '../components/MiniView'
import { NODE_HEIGHT, NODE_WIDTH } from '../constants'
import Mousetrap from 'mousetrap'

export default {
  name: 'PaperScroller',
  components: { MiniView },
  mixins: [deviceSupportHelpers, movePaper],
  props: { navLines: Array },

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
      // spaceKeyPressed: false,
      // 累积的缩放系数
      cumulativeZoomFactor: 1,
      // 缩放系数
      zoomFactor: 1.1,
      scrollPosition: {
        x: 0,
        y: 0
      },
      showMiniView: false
    }
  },

  computed: {
    ...mapGetters('dataflow', ['getCtor', 'isActionActive', 'stateIsReadonly']),
    ...mapState('dataflow', ['spaceKeyPressed']),

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

      if (this.$store.getters['dataflow/isMultiSelect']) classes.push('is-multi-select')

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
    paperSize() {
      return {
        width: Math.max(this.options.width, this.paperForwardSize.w) + this.paperReverseSize.w,
        height: Math.max(this.options.height, this.paperForwardSize.h) + this.paperReverseSize.h
      }
    },
    paperStyle() {
      return {
        left: this.paperOffset.left + 'px',
        top: this.paperOffset.top + 'px',
        width: this.paperSize.width + 'px',
        height: this.paperSize.height + 'px',
        transform: `scale(${this.paperScale})`
        // transform: `scale(${this.paperScale}) translate(${this.paperReverseSize.w}px, ${this.paperReverseSize.h}px)`
      }
    },
    contentWrapStyle() {
      return {
        transform: `translate(${this.paperReverseSize.w}px, ${this.paperReverseSize.h}px)`
      }
    }
  },

  watch: {
    stateIsReadonly() {
      // 编辑和查看切换时，视图尺寸变化，主要是侧边栏显示隐藏的切换
      const rect = this.$el.getBoundingClientRect()
      this.visibleArea.width = rect.width
      this.visibleArea.left = rect.left
      this.visibleArea.x = rect.x
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
    ...mapMutations('dataflow', ['addNode', 'setActiveType', 'setPaperSpaceKeyPressed', 'removeActiveAction']),

    /**
     * 获取节点拖放后的坐标
     * @param position
     * @param size
     * @returns {*[]}
     */
    getDropPositionWithinPaper(position, size) {
      const rect = this.$refs.paper.getBoundingClientRect()
      const scale = this.paperScale
      let [x, y] = position

      x -= rect.x + this.paperReverseSize.w * scale + (size.width * scale) / 2
      y -= rect.y + this.paperReverseSize.h * scale + (size.height * scale) / 2
      x /= scale
      y /= scale

      return [x, y]
    },

    getPositionWithinPaper(position, size) {
      const rect = this.$refs.paper.getBoundingClientRect()
      const scale = this.paperScale
      let [x, y] = position

      x -= rect.x + this.paperReverseSize.w * scale + (size.width * scale) / 2
      y -= rect.y + this.paperReverseSize.h * scale + (size.height * scale) / 2
      x /= scale
      y /= scale

      return [x, y]
    },

    bindEvent() {
      on(document, 'keydown', this.keyDown)
      on(document, 'keyup', this.keyUp)

      // 放大
      Mousetrap.bind('mod+=', e => {
        e.preventDefault()
        this.zoomIn()
      })
      // 缩小
      Mousetrap.bind('mod+-', e => {
        e.preventDefault()
        this.zoomOut()
      })
      // 画布实际大小
      Mousetrap.bind('mod+0', e => {
        e.preventDefault()
        this.zoomTo(1)
      })
      // 画布适应内容区
      Mousetrap.bind('mod+1', e => {
        e.preventDefault()
        this.centerContent()
      })
    },

    offEvent() {
      off(document, 'keydown', this.onKeydown)
    },

    initVisibleArea() {
      const rect = this.$el.getBoundingClientRect()
      this.visibleArea = {
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      }
      this.visibleArea.width = this.$el.clientWidth
      this.visibleArea.height = this.$el.clientHeight
    },

    // 画布居中
    center() {
      const paper = this.$refs.paper
      const scrollLeft = this.paperOffset.left - (this.visibleArea.width - paper.offsetWidth) / 2
      const scrollTop = this.paperOffset.top - (this.visibleArea.height - paper.offsetHeight) / 2
      this.$el.scrollLeft = scrollLeft
      this.$el.scrollTop = scrollTop
    },

    // 画布内容居中
    centerContent(ifZoomToFit) {
      const allNodes = this.$store.getters['dataflow/allNodes']
      if (!allNodes.length) return
      let { minX, minY, maxX, maxY } = getDataflowCorners(allNodes)
      // 包含节点尺寸
      maxX += NODE_WIDTH
      maxY += NODE_HEIGHT
      let contentW = maxX - minX
      let contentH = maxY - minY
      let scale = Math.min(this.visibleArea.width / contentW, this.visibleArea.height / contentH)

      if (!ifZoomToFit) {
        scale = Math.min(1, scale)
      }

      contentW *= scale
      contentH *= scale
      this.changeScale(scale)

      const scrollLeft =
        this.paperOffset.left + (minX + this.paperReverseSize.w) * scale - (this.visibleArea.width - contentW) / 2
      const scrollTop =
        this.paperOffset.top + (minY + this.paperReverseSize.h) * scale - (this.visibleArea.height - contentH) / 2

      this.doChangePageScroll(scrollLeft, scrollTop)
    },

    /**
     * 画布居中节点
     * @param node
     * @param ifZoomToFit
     */
    centerNode(node, ifZoomToFit) {
      const [left, top] = node.attrs.position
      let scale = Math.min(this.visibleArea.width / NODE_WIDTH, this.visibleArea.height / NODE_HEIGHT)

      if (!ifZoomToFit) {
        scale = Math.min(1, scale)
      }

      this.changeScale(scale)

      const scrollLeft =
        this.paperOffset.left + (left + this.paperReverseSize.w) * scale - (this.visibleArea.width - NODE_WIDTH) / 2
      const scrollTop =
        this.paperOffset.top + (top + this.paperReverseSize.h) * scale - (this.visibleArea.height - NODE_HEIGHT) / 2

      this.doChangePageScroll(scrollLeft, scrollTop, true)
    },

    // 自动延伸画布，类似于无限画布
    autoResizePaper() {
      const { width, height } = this.options
      const allNodes = this.$store.getters['dataflow/allNodes']
      if (!allNodes.length) return
      let { minX, minY, maxX, maxY } = getDataflowCorners(allNodes)

      // 包含节点尺寸
      maxX += NODE_WIDTH
      maxY += NODE_HEIGHT

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

      console.log('autoResizePaper', { minX, minY, maxX, maxY }, this.paperReverseSize) // eslint-disable-line
    },

    toggleMiniView() {
      this.showMiniView = !this.showMiniView
    },

    keyDown(e) {
      if (typeof e.which !== 'number') {
        e.which = e.keyCode
      }

      if (e.which === 32) {
        // this.spaceKeyPressed = true
        this.setPaperSpaceKeyPressed(true)
        if (e.target === this.$el) e.preventDefault()
      }
    },

    keyUp(e) {
      if (typeof e.which !== 'number') {
        e.which = e.keyCode
      }

      if (e.which === 32) {
        // this.spaceKeyPressed = false
        this.setPaperSpaceKeyPressed(false)
      }
    },

    mouseDown(e) {
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

      on(document, 'mousemove', this.mouseMoveSelect, {
        capture: false,
        passive: false
      })
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

      // console.log('mouseMoveSelect', pos) // eslint-disable-line

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
      this.removeActiveAction('dragActive')
    },

    mouseUpMouseSelect() {
      if (!this.selectActive) {
        return
      }

      off(document, 'mousemove', this.mouseMoveSelect)

      let boxAttr // 转换后的拖选框坐标，可直接和节点坐标做比较

      // 显示拖选框时，执行判断逻辑
      if (this.showSelectBox) {
        const scale = this.paperScale
        let { x, y, w, h, bottom, right } = this.selectBoxAttr

        x = (x - this.paperOffset.left) / scale - this.paperReverseSize.w
        y = (y - this.paperOffset.top) / scale - this.paperReverseSize.h
        right = x + w / scale
        bottom = y + h / scale
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
      if (this.isCtrlKeyPressed(e) || e.ctrlKey) {
        e.preventDefault()
        if (e.deltaY > 0) {
          this.zoomOut(e)
        } else {
          this.zoomIn(e)
        }
      }
    },

    handleScroll({ target }) {
      this.scrollPosition.x = target.scrollLeft
      this.scrollPosition.y = target.scrollTop
    },

    /**
     * 缩小
     */
    zoomOut(e) {
      if (this.paperScale * this.cumulativeZoomFactor <= 0.15) {
        this.cumulativeZoomFactor *= (this.paperScale - 0.05) / this.paperScale
      } else {
        this.cumulativeZoomFactor /= this.zoomFactor
        this.cumulativeZoomFactor = Math.round(this.paperScale * this.cumulativeZoomFactor * 20) / 20 / this.paperScale
        const scale = this.paperScale * this.cumulativeZoomFactor
        this.wheelToScaleArtboard(scale, e && { x: e.pageX, y: e.pageY })
        this.changeScale(scale)
      }
    },
    /**
     * 放大
     */
    zoomIn(e) {
      if (this.paperScale * this.cumulativeZoomFactor <= 0.15) {
        this.cumulativeZoomFactor *= (this.paperScale + 0.05) / this.paperScale
      } else {
        this.cumulativeZoomFactor *= this.zoomFactor
        this.cumulativeZoomFactor = Math.round(this.paperScale * this.cumulativeZoomFactor * 20) / 20 / this.paperScale
      }
      this.cumulativeZoomFactor =
        Math.max(0.05, Math.min(this.paperScale * this.cumulativeZoomFactor, 160)) / this.paperScale
      const scale = this.paperScale * this.cumulativeZoomFactor
      this.wheelToScaleArtboard(scale, e && { x: e.pageX, y: e.pageY })
      this.changeScale(scale)
    },

    zoomTo(scale) {
      this.wheelToScaleArtboard(scale)
      this.changeScale(scale)
    },

    /**
     * 改变缩放
     * @param scale
     */
    changeScale(scale) {
      this.paperScale = scale
      this.$emit('change-scale', scale)
      this.cumulativeZoomFactor = 1
    },

    /**
     * 获取相对于画布的坐标
     * @param e
     * @returns {{x: number, y: number}}
     */
    getMouseToPage(e) {
      const scale = this.paperScale
      const paper = this.$refs.paper.getBoundingClientRect()
      return {
        x: (e.x - paper.left) / scale - this.paperReverseSize.w,
        y: (e.y - paper.top) / scale - this.paperReverseSize.h
      }
    },

    getMouseToPageOriginal(e) {
      const scale = this.paperScale
      const paper = this.$refs.paper.getBoundingClientRect()
      return {
        x: (e.x - paper.left) / scale,
        y: (e.y - paper.top) / scale
      }
    },

    /**
     * 滚轮缩放画布
     * @param scale
     * @param scalePoint
     */
    wheelToScaleArtboard(scale, scalePoint) {
      scalePoint = scalePoint || this.getScaleAbsolutePoint()
      const scaleOrigin = this.getMouseToPageOriginal(scalePoint)
      const area = this.visibleArea
      const offset = this.paperOffset
      const left = scalePoint.x - area.left // 光标与可视区左边的距离
      const top = scalePoint.y - area.top // 光标与可视区上边的距离
      // 缩放后的坐标
      const _x = scaleOrigin.x * scale
      const _y = scaleOrigin.y * scale
      const _left = Math.round(left - _x)
      const _top = Math.round(top - _y)

      this.doChangePageScroll(offset.left - _left, offset.top - _top)
    },

    /**
     * 设置页面滚动
     * @param left
     * @param top
     * @param animate 平滑滚动
     */
    doChangePageScroll(left, top, animate) {
      this.$nextTick(() => {
        const options = { left, top }
        animate && (options.behavior = 'smooth')
        this.$el.scrollTo(options)
      })
    },

    /**
     * 获取固定的缩放坐标，可视区域的中心
     * @returns {{x: *, y: *}}
     */
    getScaleAbsolutePoint() {
      const area = this.visibleArea
      return { x: Math.round(area.width / 2) + area.left, y: Math.round(area.height / 2) + area.top }
    },

    /**
     * 小地图移动，滚动画布
     * @param x
     * @param y
     */
    handleViewMove({ x, y }) {
      const scale = this.paperScale
      const { left, top } = this.paperOffset
      this.doChangePageScroll(left + x * scale, top + y * scale)
    },

    getPaperCenterPos() {
      const pos = this.getScaleAbsolutePoint()
      return this.getMouseToPage(pos)
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
      //background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJ2LTc2IiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZGVmcyBpZD0idi03NSI+PHBhdHRlcm4gaWQ9InBhdHRlcm5fMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cmVjdCBpZD0idi03NyIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0FBQUFBQSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgaWQ9InYtNzkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl8wKSIvPjwvc3ZnPg==);
      //background-color: #f6f6f6;
      transform-origin: 0 0;
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
  background: rgba(44, 101, 255, 0.07);
  border: 1px solid #2c65ff;
  border-radius: 2px;
}

.nav-line {
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
  left: 0;
  border-top: 1px dashed #ff5b37;
  border-left: 1px dashed #ff5b37;
}
</style>
