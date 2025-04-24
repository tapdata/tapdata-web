export default {
  data() {
    return {
      isTouchDevice: 'ontouchstart' in window || navigator.msMaxTouchPoints,
      isMacOs: /(ipad|iphone|ipod|mac)/i.test(navigator.platform),
    }
  },
  computed: {
    controlKeyCode() {
      if (this.isMacOs) {
        return 'Meta'
      }
      return 'Control'
    },
  },
  methods: {
    isCtrlKeyPressed(e) {
      if (this.isTouchDevice === true) {
        return true
      }
      if (this.isMacOs) {
        return e.metaKey
      }
      return e.ctrlKey
    },
  },
}
