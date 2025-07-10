<script lang="jsx">
export default {
  name: 'OverflowTooltip',
  // inheritAttrs: false,
  props: {
    text: String,
  },

  data() {
    return {
      overflow: false,
    }
  },

  mounted() {
    const observer = () => {
      this.check()
    }

    this.resizeObserver = new ResizeObserver(observer)
    this.resizeObserver.observe(this.$el)
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      console.log('this.$el', this.$el)
      this.resizeObserver.unobserve(this.$el)
      this.resizeObserver = null
    }
  },

  methods: {
    check() {
      const containerWidth = this.$refs.container?.getBoundingClientRect().width
      const textWidth = this.$refs.text?.getBoundingClientRect().width
      this.overflow = textWidth > containerWidth
    },
  },

  render() {
    const { text, $slots, $attrs } = this
    const elm = ($slots.default && $slots.default())?.[0]?.elm
    const defaultText = elm?.textContent || text

    const tooltipProps = {
      ...this.$attrs,
      class: undefined,
      style: undefined,
    }

    return (
      <div ref="container">
        {this.overflow ? (
          <el-tooltip content={defaultText} {...tooltipProps}>
            <div class={['overflow-tip']}>
              <span ref="text" class="overflow-tip-text">
                {$slots.default && $slots.default()
                  ? $slots.default && $slots.default()
                  : text}
              </span>
            </div>
          </el-tooltip>
        ) : (
          <div class="overflow-tip">
            <span ref="text" class="overflow-tip-text">
              {$slots.default && $slots.default()
                ? $slots.default && $slots.default()
                : text}
            </span>
          </div>
        )}
      </div>
    )
  },
}
</script>

<style>
.overflow-tip {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
