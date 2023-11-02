<script lang="jsx">
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

  watch: {
    text: {
      deep: true,
      immediate: true,

      handler() {
        this.$nextTick(() => {
          const containerWidth = this.$refs.container?.getBoundingClientRect().width
          const textWidth = this.$refs.text?.getBoundingClientRect().width
          this.overflow = textWidth > containerWidth
        })
      }
    }
  },

  render() {
    const { text, $slots, $attrs } = this
    const elm = ($slots.default && $slots.default())?.[0]?.elm
    const defaultText = elm?.innerText || text
    return this.overflow ? (
      <el-tooltip
        content={defaultText}
        {...{
          props: this.$attrs
        }}
      >
        <div ref="container" class={['overflow-tip', $attrs.class]}>
          <span ref="text" class="overflow-tip-text">
            {$slots.default && $slots.default() ? $slots.default && $slots.default() : text}
          </span>
        </div>
      </el-tooltip>
    ) : (
      <div ref="container" class="overflow-tip">
        <span ref="text" class="overflow-tip-text">
          {$slots.default && $slots.default() ? $slots.default && $slots.default() : text}
        </span>
      </div>
    )
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
