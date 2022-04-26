import { on, off } from '@tap/shared'

export default {
  data() {
    return {
      moveLastPosition: [0, 0]
    }
  },

  methods: {
    getMousePosition(e) {
      const x =
        e.pageX !== undefined ? e.pageX : e.touches && e.touches[0] && e.touches[0].pageX ? e.touches[0].pageX : 0
      const y =
        e.pageY !== undefined ? e.pageY : e.touches && e.touches[0] && e.touches[0].pageY ? e.touches[0].pageY : 0

      return {
        x,
        y
      }
    },

    movePaper(e) {
      const position = this.getMousePosition(e)
      const { $el } = this

      $el.scrollLeft -= position.x - this.moveLastPosition[0]
      $el.scrollTop -= position.y - this.moveLastPosition[1]

      this.moveLastPosition[0] = position.x
      this.moveLastPosition[1] = position.y
    },

    mouseDownMovePaper(e) {
      console.log('spaceKeyPressed', this.spaceKeyPressed) // eslint-disable-line
      if (!this.spaceKeyPressed) return

      if (this.isActionActive('dragActive')) return

      this.$store.commit('dataflow/setPaperMoveInProgress', true)

      const position = this.getMousePosition(e)

      this.moveLastPosition[0] = position.x
      this.moveLastPosition[1] = position.y

      on(document, 'mousemove', this.mouseMovePaper, {
        capture: false,
        passive: false
      })
    },

    mouseUpMovePaper() {
      if (this.$store.getters['dataflow/isPaperMoveInProgress'] === false) return

      off(document, 'mousemove', this.mouseMovePaper)

      this.$store.commit('dataflow/setPaperMoveInProgress', false)
    },

    mouseMovePaper(e) {
      e.preventDefault()

      if (this.isActionActive('dragActive')) return

      if (e.buttons === 0) {
        this.mouseUp(e)
        return
      }

      this.movePaper(e)
    }
  }
}
