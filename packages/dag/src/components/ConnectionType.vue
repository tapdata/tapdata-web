<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    type: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    return () => {
      const { type } = props

      return (
        <div class="connection-type-tag-wrap d-flex flex-nowrap flex-shrink-0 align-center gap-1">
          {type.includes('source') && (
            <el-tag class="type-source" effect="plain" size="mini">
              源头
            </el-tag>
          )}
          {type.includes('target') && (
            <el-tag class="type-target" effect="plain" size="mini">
              目标
            </el-tag>
          )}
        </div>
      )
    }
  },
})
</script>

<style lang="scss" scoped>
.connection-type-tag-wrap {
  .el-tag {
    transform: scale(0.8333);

    &.type-source {
      color: #6236ff;
      border-color: rgba(98, 54, 255, 0.2);
    }

    &.type-target {
      color: #008eff;
      border-color: rgba(0, 155, 255, 0.2);
    }
  }
}
</style>
