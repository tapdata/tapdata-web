<script lang="jsx">
import { defineComponent } from 'vue'
import { VIcon } from '@tap/component'
import i18n from '@tap/i18n'

export default defineComponent({
  name: 'AlarmStatistics',

  props: {
    alarmNum: {
      type: Object,
      default: () => ({
        alert: 0,
        error: 0,
      }),
    },
  },

  setup(props, { emit }) {
    return () => {
      return (
        <div class="alarm-statistics">
          <Transition name="el-fade-in-linear">
            <div
              v-show={props.alarmNum.alert}
              class="alarm-statistic-item align-center cursor-pointer px-4 mb-4 rounded-lg shadow-sm"
              onClick={() => {
                {
                  emit('showBottomPanel')
                }
              }}
            >
              <VIcon size="18" class="mr-2 color-warning">
                warning
              </VIcon>
              <span>
                {i18n.t('public_warn')}：{props.alarmNum.alert}
              </span>
            </div>
          </Transition>
          <Transition name="el-fade-in-linear">
            <div
              v-show={props.alarmNum.error}
              class="alarm-statistic-item align-center cursor-pointer px-4 rounded-lg shadow-sm"
              onClick={() => {
                {
                  emit('showBottomPanel')
                }
              }}
            >
              <VIcon size="18" class="mr-2 color-danger">
                error
              </VIcon>
              <span>
                {i18n.t('public_error')}：{props.alarmNum.error}
              </span>
            </div>
          </Transition>
        </div>
      )
    }
  },
})
</script>

<style lang="scss" scoped>
.alarm-statistics {
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: 2;

  .alarm-statistic-item {
    display: flex;
    width: 175px;
    height: 40px;
    font-size: 14px;
    border-radius: 4px;
    background: #fff;
    box-shadow:
      0px 4px 10px 0px rgba(0, 0, 0, 0.1),
      0px 4px 10px 0px rgba(0, 0, 0, 0.1);
  }
}
</style>
