<script>
import * as Vue from 'vue'
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
    const { text } = this
    return this.overflow ? (
      <el-tooltip
        content={text}
        {...{
          props: this.$attrs
        }}
      >
        <div ref="container" class="overflow-tip">
          <span ref="text" class="overflow-tip-text">
            {text}
          </span>
        </div>
      </el-tooltip>
    ) : (
      <div ref="container" class="overflow-tip">
        <span ref="text" class="overflow-tip-text">
          {text}
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
