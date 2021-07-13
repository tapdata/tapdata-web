import normalizeWheel from 'normalize-wheel'

export default {
  data() {
    return {
      moveLastPosition: [0, 0]
    }
  },

  methods: {
    getMousePosition(e) {
      const x =
        e.pageX !== undefined
          ? e.pageX
          : e.touches && e.touches[0] && e.touches[0].pageX
          ? e.touches[0].pageX
          : 0
      const y =
        e.pageY !== undefined
          ? e.pageY
          : e.touches && e.touches[0] && e.touches[0].pageY
          ? e.touches[0].pageY
          : 0

      return {
        x,
        y
      }
    },

    moveDataflow(e) {
      const offsetPosition =
        this.$store.getters['dataflow/getNodeViewOffsetPosition']

      const position = this.getMousePosition(e)

      const nodeViewOffsetPositionX =
        offsetPosition[0] + (position.x - this.moveLastPosition[0])
      const nodeViewOffsetPositionY =
        offsetPosition[1] + (position.y - this.moveLastPosition[1])
      this.$store.commit('dataflow/setNodeViewOffsetPosition', {
        newOffset: [nodeViewOffsetPositionX, nodeViewOffsetPositionY]
      })

      // Update the last position
      this.moveLastPosition[0] = position.x
      this.moveLastPosition[1] = position.y
    },

    mouseDownMoveDataflow(e) {
      if (this.isCtrlKeyPressed(e) === false) {
        // We only care about it when the ctrl key is pressed at the same time.
        // So we exit when it is not pressed.
        return
      }

      if (this.isActionActive('dragActive')) {
        // If a node does currently get dragged we do not activate the selection
        return
      }

      this.$store.commit('dataflow/setNodeViewMoveInProgress', true)

      const position = this.getMousePosition(e)

      this.moveLastPosition[0] = position.x
      this.moveLastPosition[1] = position.y

      this.$el.addEventListener('mousemove', this.mouseMoveNodeDataflow)
    },

    mouseUpMoveDataflow() {
      if (this.$store.getters['dataflow/isNodeViewMoveInProgress'] === false) {
        // If it is not active return direcly.
        // Else normal node dragging will not work.
        return
      }

      this.$el.removeEventListener('mousemove', this.mouseMoveNodeDataflow)

      this.$store.commit('setNodeViewMoveInProgress', false)

      // Nothing else to do. Simply leave the node view at the current offset
    },
    mouseMoveNodeDataflow(e) {
      if (e.target && !e.target.id.includes('node-view')) {
        return
      }

      if (this.isActionActive('dragActive')) {
        return
      }

      if (e.buttons === 0) {
        // Mouse button is not pressed anymore so stop selection mode
        // Happens normally when mouse leave the view pressed and then
        // comes back unpressed.
        // @ts-ignore
        this.mouseUp(e)
        return
      }

      this.moveDataflow(e)
    },

    wheelMoveDataflow(e) {
      const normalized = normalizeWheel(e)
      const offsetPosition =
        this.$store.getters['dataflow/getNodeViewOffsetPosition']
      const nodeViewOffsetPositionX =
        offsetPosition[0] - (e.shiftKey ? normalized.pixelY : normalized.pixelX)
      const nodeViewOffsetPositionY =
        offsetPosition[1] - (e.shiftKey ? normalized.pixelX : normalized.pixelY)
      this.$store.commit('dataflow/setNodeViewOffsetPosition', {
        newOffset: [nodeViewOffsetPositionX, nodeViewOffsetPositionY]
      })
    }
  }
}
