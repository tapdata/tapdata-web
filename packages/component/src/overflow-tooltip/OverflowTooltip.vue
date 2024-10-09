<script>
export default {
  name: 'OverflowTooltip',
  props: {
    text: String
  },

  data() {
    return {
      overflow: false
    }
  },

  render() {
    const { text, $slots } = this
    const elm = $slots.default?.[0]?.elm
    const defaultText = elm?.innerText || text

    return this.overflow ? (
      <el-tooltip
        content={defaultText}
        {...{
          props: this.$attrs
        }}
      >
        <div ref="container" class="overflow-tip">
          <span ref="text" class="overflow-tip-text">
            {$slots.default ? $slots.default : text}
          </span>
        </div>
      </el-tooltip>
    ) : (
      <div ref="container" class="overflow-tip">
        <span ref="text" class="overflow-tip-text">
          {$slots.default ? $slots.default : text}
        </span>
      </div>
    )
  },

  mounted() {
    const observer = () => {
      this.check()
    }

    this.resizeObserver = new ResizeObserver(observer)
    this.resizeObserver.observe(this.$el)
  },

  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.$el)
      this.resizeObserver = null
    }
  },

  methods: {
    check() {
      const containerWidth = this.$refs.container?.getBoundingClientRect().width
      const textWidth = this.$refs.text?.getBoundingClientRect().width
      this.overflow = textWidth > containerWidth
    }
  }
}
</script>

<style>
.overflow-tip {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
