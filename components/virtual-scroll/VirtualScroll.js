import _VirtualScroll from './mixins/virtual-scroll'

const comps = {
  list: 'VList',
  table: 'table'
}

export default {
  name: 'VirtualScroll',

  mixins: [_VirtualScroll],

  props: {
    type: {
      type: String,
      default: 'table',
      validator: v => ['list', 'table'].includes(v)
    },

    items: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    // 数据项总数
    virtualScrollLength() {
      return Array.isArray(this.items) ? this.items.length : 0
    },

    // 范围
    virtualScrollScope() {
      if (!this.virtualScrollLength) {
        return []
      }
      const mapFn = (item, i) => ({
        index: this.virtualScrollSliceRange.from + i,
        item
      })
      return this.items.slice(this.virtualScrollSliceRange.from, this.virtualScrollSliceRange.to).map(mapFn)
    }
  },

  watch: {
    virtualScrollLength() {
      this.__resetVirtualScroll()
    }
  },

  beforeMount() {
    this.__resetVirtualScroll()
  },

  mounted() {
    this.__configureScrollTarget()
  },

  beforeDestroy() {
    this.__unconfigureScrollTarget()
  },

  render(h) {
    if (this.$scopedSlots.default === void 0) {
      return
    }

    let child = this.__padVirtualScroll(
      h,
      this.type === 'list' ? 'div' : 'tbody',
      this.virtualScrollScope.map(this.$scopedSlots.default)
    )

    if (this.$scopedSlots.before !== void 0) {
      child = this.$scopedSlots.before().concat(child)
    }

    if (this.$scopedSlots.after !== void 0) {
      child = child.concat(this.$scopedSlots.after())
    }

    return h(
      comps[this.type],
      {
        on: { ...this.$listeners }
      },
      child
    )
  },

  methods: {
    __getVirtualScrollEl() {
      // return this.$el
      return this.$el.parentElement
    },

    __getVirtualScrollTarget() {
      return this.__scrollTarget
    },

    __configureScrollTarget() {
      this.__scrollTarget = this.__getVirtualScrollEl()
      this.__scrollTarget.addEventListener('scroll', this.__onVirtualScrollEvt, { passive: true })
    },

    __unconfigureScrollTarget() {
      if (this.__scrollTarget !== void 0) {
        this.__scrollTarget.removeEventListener('scroll', this.__onVirtualScrollEvt, { passive: true })
        this.__scrollTarget = void 0
      }
    }
  }
}
