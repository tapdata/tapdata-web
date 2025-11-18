<script lang="tsx">
import { useI18n } from '@tap/i18n'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    type: {
      required: true,
      type: String,
    },
  },
  setup(props) {
    return () => {
      const { t } = useI18n()

      const renderTag = () => {
        return (
          <el-tag
            disable-transitions
            class={`zoom-xs type-${props.type} px-1`}
            effect="plain"
            size="small"
          >
            {t(`packages_business_connection_type_${props.type}`)}
          </el-tag>
        )
      }

      return renderTag()
    }
  },
})
</script>

<style lang="scss" scoped>
.el-tag {
  // transform: scale(0.8333);

  &.type-source_and_target {
    color: transparent;
    background-image: linear-gradient(to right, #6236ff, #008eff);
    -webkit-background-clip: text;
    background-clip: text;
  }

  &.type-source {
    color: #6236ff;
    border-color: rgba(98, 54, 255, 0.2);
  }

  &.type-target {
    color: #008eff;
    border-color: rgba(0, 155, 255, 0.2);
  }
}
</style>
