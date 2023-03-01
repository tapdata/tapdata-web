<script>
import { defineComponent } from 'vue'
import { VIcon } from '@tap/component'

export default defineComponent({
  name: 'AlarmStatistics',

  props: {
    alarmNum: {
      type: Object,
      default: () => ({
        alert: 0,
        error: 0
      })
    }
  },

  setup(props, { emit }) {
    return () => {
      return (
        <div class="alarm-statistics">
          <transition name="el-fade-in-linear">
            <div
              v-show={props.alarmNum.alert}
              class="alarm-statistic-item align-center cursor-pointer px-4 mb-4"
              onClick={() => {
                {
                  emit('showBottomPanel')
                }
              }}
            >
              <VIcon size="18" class="mr-2 color-warning">
                warning
              </VIcon>
              <span>告警：{props.alarmNum.alert}</span>
            </div>
          </transition>
          <transition name="el-fade-in-linear">
            <div
              v-show={props.alarmNum.error}
              class="alarm-statistic-item align-center cursor-pointer px-4"
              onClick={() => {
                {
                  emit('showBottomPanel')
                }
              }}
            >
              <VIcon size="18" class="mr-2 color-danger">
                error
              </VIcon>
              <span>错误：{props.alarmNum.error}</span>
            </div>
          </transition>
        </div>
      )
    }
  }
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
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1), 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
  }
}
</style>
