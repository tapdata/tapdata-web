<script>
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { off, on } from '@tap/shared'
import Time from '@tap/shared/src/time'
import { useResizeObserver } from '@vueuse/core'
import Mousetrap from 'mousetrap'
import { mapGetters, mapMutations, mapState } from 'vuex'
import MiniView from '../components/MiniView'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH } from '../constants'
import { getDataflowCorners } from '../helpers'

import movePaper from '../mixins/movePaper'

export default {
  name: 'PaperScroller',
  components: { MiniView },
  mixins: [deviceSupportHelpers, movePaper],
  props: { navLines: Array, scrollDisabled: Boolean },
  data() {
    return {
      showSelectBox: false,
      selectBoxAttr: null,
      paperScale: 1,
      scalePosition: [],
      options: {
        width: 800,
        height: 800,
      },
      // 记录画布的初始状态
      visibleArea: {
        width: 0,
        height: 0,
      },
      // 跟visibleArea的区别就是，会跟随resize改变
      windowArea: {
        width: 0,
        height: 0,
      },
      translate: {
        x: 0,
        y: 0,
      },
      // Paper反向尺寸
      paperReverseSize: {
        w: 0,
        h: 0,
      },
      // Paper正向尺寸
      paperForwardSize: {
        w: 0,
        h: 0,
      },
      // 按下空格键
      // spaceKeyPressed: false,
      // 累积的缩放系数
      cumulativeZoomFactor: 1,
      // 缩放系数
      zoomFactor: 1.1,
      scrollPosition: {
        x: 0,
        y: 0,
      },
      showMiniView: false,
    }
  },
  computed: {
    ...mapGetters('dataflow', ['getCtor', 'isActionActive', 'stateIsReadonly']),
    ...mapState('dataflow', ['spaceKeyPressed', 'shiftKeyPressed']),

    selectBoxStyle() {
      const attr = this.selectBoxAttr
      return attr
        ? {
            left: `${attr.x}px`,
            top: `${attr.y}px`,
            width: `${attr.w}px`,
            height: `${attr.h}px`,
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

      if (this.$store.getters['dataflow/isMultiSelect'])
        classes.push('is-multi-select')

      return classes
    },

    scrollerBgStyle() {
      const paper = this.paperStyle
      const scale = this.paperScale
      const girdSize = scale * 10
      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="v-4" width="100%" height="100%"><defs id="v-3"><pattern id="pattern_0" patternUnits="userSpaceOnUse" x="0" y="0" width="${girdSize}" height="${girdSize}"><rect id="v-5" width="${scale}" height="${scale}" fill="rgb(170 170 170 / 80%)"/></pattern></defs><rect id="v-7" width="100%" height="100%" fill="url(#pattern_0)"/></svg>`
      return {
        width: `${
          Number.parseInt(paper.left) * 2 + Number.parseInt(paper.width) * scale
        }px`,
        height: `${
          Number.parseInt(paper.top) * 2 + Number.parseInt(paper.height) * scale
        }px`,
        backgroundImage: `url("data:image/svg+xml;base64,${window.btoa(svgStr)}")`,
      }
    },
    paperOffset() {
      return {
        left: this.visibleArea.width - 50,
        top: this.visibleArea.height - 50,
      }
    },
    paperSize() {
      return {
        width:
          Math.max(this.options.width, this.paperForwardSize.w) +
          this.paperReverseSize.w,
        height:
          Math.max(this.options.height, this.paperForwardSize.h) +
          this.paperReverseSize.h,
      }
    },
    paperStyle() {
      return {
        left: `${this.paperOffset.left}px`,
        top: `${this.paperOffset.top}px`,
        width: `${this.paperSize.width}px`,
        height: `${this.paperSize.height}px`,
        transform: `scale(${this.paperScale})`,
        // transform: `scale(${this.paperScale}) translate(${this.paperReverseSize.w}px, ${this.paperReverseSize.h}px)`
      }
    },
    contentWrapStyle() {
      const style = {
        transform: `translate(${this.paperReverseSize.w}px, ${this.paperReverseSize.h}px)`,
      }
      if (
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent)
      ) {
        style.position = 'relative'
      }
      return style
    },
  },
  created() {
    this.bindEvent()
  },
  async mounted() {
    // 监听画布的尺寸变化
    this.stopResizeObserver = useResizeObserver(
      this.$el,
      this.observerHandler,
    ).stop
    await this.$nextTick()
    this.initVisibleArea(true)
    await this.$nextTick()
    this.center()
  },
  beforeUnmount() {
    this.offEvent()
    this.stopResizeObserver?.()

    // Remove window event listeners
    off(window, 'mousemove', this.mouseMove)
    off(window, 'mouseup', this.mouseUp)

    // Unbind Mousetrap events
    Mousetrap.unbind(['mod+=', 'mod+-', 'mod+0', 'shift+1'])
  },
  methods: {
    ...mapMutations('dataflow', [
      'addNode',
      'setActiveType',
      'setPaperSpaceKeyPressed',
      'removeActiveAction',
      'toggleShiftKeyPressed',
    ]),

    observerHandler() {
      this.initVisibleArea()
    },

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
      Mousetrap.bind('mod+=', (e) => {
        e.preventDefault()
        this.zoomIn()
      })
      // 缩小
      Mousetrap.bind('mod+-', (e) => {
        e.preventDefault()
        this.zoomOut()
      })
      // 画布实际大小
      Mousetrap.bind('mod+0', (e) => {
        e.preventDefault()
        this.zoomTo(1)
      })
      // 画布适应内容区
      Mousetrap.bind('shift+1', (e) => {
        e.preventDefault()
        this.centerContent()
      })
    },

    offEvent() {
      off(document, 'keydown', this.keyDown)
      off(document, 'keyup', this.keyUp)
    },

    initVisibleArea(isFirst) {
      const rect = this.$el.getBoundingClientRect()
      const area = {
        width: this.$el.clientWidth,
        height: this.$el.clientHeight,
        x: rect.x,
        y: rect.y,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      }
      if (isFirst) {
        this.visibleArea = {
          ...area,
        }
      }
      // 窗口保持最新的区域数据
      this.windowArea = area
    },

    // 画布居中
    center() {
      const paper = this.$refs.paper
      const scrollLeft =
        this.paperOffset.left - (this.visibleArea.width - paper.offsetWidth) / 2
      const scrollTop =
        this.paperOffset.top -
        (this.visibleArea.height - paper.offsetHeight) / 2
      this.$el.scrollLeft = scrollLeft
      this.$el.scrollTop = scrollTop
    },

    // 画布内容居中
    centerContent(
      ifZoomToFit,
      paddingX = 0,
      allNodes = this.$store.getters['dataflow/allNodes'],
      nodeIdPrefix = NODE_PREFIX,
    ) {
      // const allNodes = this.$store.getters['dataflow/allNodes']
      if (!allNodes.length) return
      let { minX, minY, maxX, maxY } = getDataflowCorners(
        allNodes,
        this.paperScale,
        nodeIdPrefix,
      )

      minX -= paddingX

      let contentW = maxX - minX + paddingX
      let contentH = maxY - minY
      let scale = Math.min(
        this.windowArea.width / contentW,
        this.windowArea.height / contentH,
      )

      if (!ifZoomToFit) {
        scale = Math.min(1, scale)
      }

      scale = Math.max(0.25, scale)

      contentW *= scale
      contentH *= scale
      this.changeScale(scale)

      const scrollLeft =
        this.paperOffset.left +
        (minX + this.paperReverseSize.w) * scale -
        (this.windowArea.width - contentW) / 2
      const scrollTop =
        this.paperOffset.top +
        (minY + this.paperReverseSize.h) * scale -
        (this.windowArea.height - contentH) / 2

      this.doChangePageScroll(scrollLeft, scrollTop)
    },

    /**
     * 画布居中节点
     * @param node
     * @param ifZoomToFit
     */
    centerNode(node, ifZoomToFit) {
      const [left, top] = node.attrs.position
      let scale = Math.min(
        this.windowArea.width / NODE_WIDTH,
        this.windowArea.height / NODE_HEIGHT,
      )

      if (!ifZoomToFit) {
        scale = Math.min(1, scale)
      }

      this.changeScale(scale)

      const scrollLeft =
        this.paperOffset.left +
        (left + this.paperReverseSize.w) * scale -
        (this.windowArea.width - NODE_WIDTH) / 2
      const scrollTop =
        this.paperOffset.top +
        (top + this.paperReverseSize.h) * scale -
        (this.windowArea.height - NODE_HEIGHT) / 2

      this.doChangePageScroll(scrollLeft, scrollTop, true)
    },

    // 自动延伸画布，类似于无限画布
    autoResizePaper(
      allNodes = this.$store.getters['dataflow/allNodes'],
      nodeIdPrefix = NODE_PREFIX,
    ) {
      const { width, height } = this.options
      if (!allNodes.length) return
      const { minX, minY, maxX, maxY } = getDataflowCorners(
        allNodes,
        this.paperScale,
        nodeIdPrefix,
      )
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
    },

    toggleMiniView() {
      this.showMiniView = !this.showMiniView
    },

    keyDown(e) {
      if (typeof e.which !== 'number') {
        e.which = e.keyCode
      }
      if (e.shiftKey) {
        this.toggleShiftKeyPressed(true)
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
      if (!e.shiftKey) {
        this.toggleShiftKeyPressed(false)
      }
      if (e.which === 32) {
        // this.spaceKeyPressed = false
        this.setPaperSpaceKeyPressed(false)
      }
    },

    initState(e) {
      this.state = {
        onMouseDownAt: Time.now(),
        startEvent: e,
        position: this.getMousePosition(e),
        inScrollerPosition: this.getMousePositionWithinScroller(e),
      }
    },

    checkDistanceChange(e) {
      const distance = Math.hypot(
        e.pageX - this.state.startEvent.pageX,
        e.pageY - this.state.startEvent.pageY,
      )
      const timeDelta = Time.now() - this.state.onMouseDownAt
      if (timeDelta > 10 && e !== this.state.startEvent && distance > 4) {
        return true
      }
      return false
    },

    matchesSelector(el, selector, ctx) {
      ctx = ctx || el.parentNode
      const possibles = ctx.querySelectorAll(selector)
      for (const possible of possibles) {
        if (possible === el) {
          return true
        }
      }
      return false
    },

    inputFilter(e, el, selector = 'input,textarea,select,button,option') {
      return this.matchesSelector(e.srcElement || e.target, selector, el)
    },

    mouseDown(e) {
      if (this.scrollDisabled || this.inputFilter(e, this.$el)) return

      this.initState(e)
      on(window, 'mousemove', this.mouseMove)
      on(window, 'mouseup', this.mouseUp)

      // 鼠标拖选
      this.mouseDownMouseSelect(e)
      // 鼠标移动画布
      // this.mouseDownMovePaper(e)
    },

    mouseMove(e) {
      if (this.isActionActive('dragActive')) return

      !this.selectActive && !this.shiftKeyPressed && this.mouseMovePaper(e)
      this.selectActive && this.mouseMoveSelect(e)
    },

    mouseDownMouseSelect(e) {
      if (!e.shiftKey && !this.shiftKeyPressed) return

      if (this.isActionActive('dragActive')) return

      this.mouseClickPosition = this.getMousePositionWithinScroller(e)
      this.selectActive = true

      // this.showSelectBox(e)

      /*on(document, 'mousemove', this.mouseMoveSelect, {
      capture: false,
      passive: false
    })*/
    },

    mouseMoveSelect(e) {
      if (!this.selectActive) return
      e.preventDefault() // 防止拖动时文字被选中

      if (e.buttons === 0) {
        // 没有按键或者是没有初始化
        this.mouseUpMouseSelect(e)
        return
      }

      this.showSelectBox = true
      let w, h, x, y
      const pos = this.getMousePositionWithinScroller(e)

      x = Math.min(this.mouseClickPosition.x, pos.x)
      y = Math.min(this.mouseClickPosition.y, pos.y)
      w = Math.abs(this.mouseClickPosition.x - pos.x)
      h = Math.abs(this.mouseClickPosition.y - pos.y)

      this.selectBoxAttr = { x, y, w, h, right: x + w, bottom: y + h }
    },

    mouseUp(event) {
      off(window, 'mousemove', this.mouseMove)
      off(window, 'mouseup', this.mouseUp)
      const ifMoved = this.checkDistanceChange(event)
      if (
        !ifMoved &&
        [this.$refs.paper, this.$refs.scrollerBg, this.$el].includes(
          event.target,
        )
      ) {
        this.$emit('click-blank')
      }
      this.mouseUpMouseSelect(ifMoved)
      this.removeActiveAction('dragActive')
      this.toggleShiftKeyPressed(false)
    },

    mouseUpMouseSelect(ifMoved) {
      let boxAttr // 转换后的拖选框坐标，可直接和节点坐标做比较
      // 显示拖选框时，执行判断逻辑
      if (ifMoved && this.showSelectBox) {
        const scale = this.paperScale
        let { x, y, w, h, bottom, right } = this.selectBoxAttr

        x = (x - this.paperOffset.left) / scale - this.paperReverseSize.w
        y = (y - this.paperOffset.top) / scale - this.paperReverseSize.h
        right = x + w / scale
        bottom = y + h / scale
        boxAttr = { x, y, right, bottom }
      }

      this.$emit('mouse-select', ifMoved, this.showSelectBox, boxAttr)
      this.hideSelectBox()
    },

    hideSelectBox() {
      this.selectActive = false
      this.showSelectBox = false
      this.selectBoxAttr = null
    },

    getMousePositionWithinScroller(e) {
      const { x, y } = this.$refs.scrollerBg.getBoundingClientRect()
      return {
        x: e.pageX - x,
        y: e.pageY - y,
      }
    },

    wheelScroll(e) {
      if (this.scrollDisabled) {
        e.preventDefault()
        return false
      }

      if (this.isCtrlKeyPressed(e) || e.ctrlKey) {
        e.preventDefault()
        if (e.deltaY > 0) {
          this.zoomOut(e)
        } else {
          this.zoomIn(e)
        }
      }
    },

    handleScroll(e) {
      if (this.scrollDisabled) {
        e.preventDefault()
        return false
      }

      const { target } = e
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
        // 缩放力度太小时容易导致scale没有变化，注释下方代码
        // this.cumulativeZoomFactor = Math.round(this.paperScale * this.cumulativeZoomFactor * 20) / 20 / this.paperScale
      }
      const scale = Math.max(0.05, this.paperScale * this.cumulativeZoomFactor)
      this.wheelToScaleArtboard(scale, e && { x: e.pageX, y: e.pageY })
      this.changeScale(scale)
    },
    /**
     * 放大
     */
    zoomIn(e) {
      if (this.paperScale * this.cumulativeZoomFactor <= 0.15) {
        this.cumulativeZoomFactor *= (this.paperScale + 0.05) / this.paperScale
      } else {
        this.cumulativeZoomFactor *= this.zoomFactor
        // 缩放力度太小时容易导致scale没有变化，注释下方代码
        // this.cumulativeZoomFactor = Math.round(this.paperScale * this.cumulativeZoomFactor * 20) / 20 / this.paperScale
      }
      this.cumulativeZoomFactor =
        Math.max(
          0.05,
          Math.min(this.paperScale * this.cumulativeZoomFactor, 160),
        ) / this.paperScale
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
        y: (e.y - paper.top) / scale - this.paperReverseSize.h,
      }
    },

    getMouseToPageOriginal(e) {
      const scale = this.paperScale
      const paper = this.$refs.paper.getBoundingClientRect()
      return {
        x: (e.x - paper.left) / scale,
        y: (e.y - paper.top) / scale,
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
      const area = this.windowArea
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
        requestAnimationFrame(() => {
          this.$el.scrollTo(options)
        })
      })
    },

    /**
     * 获取固定的缩放坐标，可视区域的中心
     * @returns {{x: *, y: *}}
     */
    getScaleAbsolutePoint() {
      const area = this.windowArea
      return {
        x: Math.round(area.width / 2) + area.left,
        y: Math.round(area.height / 2) + area.top,
      }
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
    },

    getPaperScale() {
      return this.paperScale
    },
  },
  emits: ['mouse-select', 'change-scale', 'click-blank'],
}
</script>

<template>
  <div
    class="paper-scroller hide-scrollbar"
    :class="{ grabbable: !shiftKeyPressed && !scrollDisabled }"
    tabindex="0"
    @mousedown="mouseDown"
    @wheel="wheelScroll"
    @scroll="handleScroll"
  >
    <div
      ref="scrollerBg"
      class="paper-scroller-background"
      :style="scrollerBgStyle"
    >
      <div ref="paper" class="paper" :style="paperStyle">
        <!--safari 低版本 增加-->
        <!--<div class="paper-content-wrap" :style="contentWrapStyle" style="position: relative">-->
        <div class="paper-content-wrap" :style="contentWrapStyle">
          <slot />
          <div
            v-for="(l, i) in navLines"
            :key="`l-${i}`"
            class="nav-line"
            :style="l"
          />
        </div>
      </div>
      <div v-show="showSelectBox" class="select-box" :style="selectBoxStyle" />
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
    />
  </div>
</template>

<style lang="scss" scoped>
.paper-scroller {
  width: 100%;
  height: 100%;
  overflow: scroll;
  outline: none;
  .paper-scroller-background {
    position: relative;
    background-color: rgba(245, 248, 254, 1);
    .paper {
      position: absolute;
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
