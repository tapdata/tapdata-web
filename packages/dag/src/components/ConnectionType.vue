<script lang="jsx">
import { defineComponent } from 'vue'
import i18n from '@tap/i18n'

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
            <el-tag class="type-source px-1" effect="plain" size="small">
              {i18n.t('packages_business_connection_type_source')}
            </el-tag>
          )}
          {type.includes('target') && (
            <el-tag class="type-target px-1" effect="plain" size="small">
              {i18n.t('packages_business_connection_type_target')}
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
