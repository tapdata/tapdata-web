<script setup lang="ts">
import { dayjs } from '@tap/business/src/shared/dayjs'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: string
  customTime?: [Date, Date] | null
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:customTime', value: [Date, Date] | null): void
  (e: 'change'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '1h',
  customTime: null,
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const customTimeRange = ref<[Date, Date] | null>(props.customTime)

const timeRangeOptions = computed(() => [
  { label: t('api_monitor_time_range_5m'), value: '5m' },
  { label: t('api_monitor_time_range_15m'), value: '15m' },
  { label: t('api_monitor_time_range_1h'), value: '1h' },
  { label: t('api_monitor_time_range_6h'), value: '6h' },
  { label: t('api_monitor_time_range_12h'), value: '12h' },
  { label: t('api_monitor_time_range_24h'), value: '24h' },
  { label: t('api_monitor_time_range_7d'), value: '7d' },
  { label: t('api_monitor_time_range_14d'), value: '14d' },
  { label: t('api_monitor_time_range_30d'), value: '30d' },
  { label: t('api_monitor_time_range_custom'), value: 'custom' },
])

const datePickerShortcuts = computed(() => [
  {
    text: t('api_monitor_time_range_1h'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000)
      return [start, end]
    },
  },
  {
    text: t('api_monitor_time_range_6h'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 6)
      return [start, end]
    },
  },
  {
    text: t('api_monitor_time_range_24h'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    },
  },
  {
    text: t('api_monitor_time_range_7d'),
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
])

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const handleChange = (value: string) => {
  if (value !== 'custom') {
    customTimeRange.value = null
    emit('update:customTime', null)
  }
  emit('update:modelValue', value)
  if (value !== 'custom') {
    emit('change')
  }
}

const handleCustomTimeChange = (value: [Date, Date] | null) => {
  if (value) {
    const [start, end] = value
    const diffDays = dayjs(end).diff(dayjs(start), 'day')

    if (diffDays > 30) {
      ElMessage.warning(t('api_monitor_time_range_max_30_days'))
      customTimeRange.value = null
      emit('update:customTime', null)
      emit('update:modelValue', '1h')
      return
    }

    emit('update:customTime', value)
    emit('change')
  }
}

// 监听外部 customTime 变化
watch(
  () => props.customTime,
  (newVal) => {
    customTimeRange.value = newVal
  },
)
</script>

<template>
  <div class="time-range-selector flex align-center gap-3">
    <el-select
      :model-value="modelValue"
      :placeholder="t('api_monitor_time_range_placeholder')"
      style="width: 160px"
      @update:model-value="handleChange"
    >
      <el-option
        v-for="option in timeRangeOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>

    <!-- 自定义时间范围选择器（内联显示） -->
    <el-date-picker
      v-if="modelValue === 'custom'"
      v-model="customTimeRange"
      type="datetimerange"
      :range-separator="t('api_monitor_time_range_to')"
      :start-placeholder="t('api_monitor_time_range_start')"
      :end-placeholder="t('api_monitor_time_range_end')"
      :disabled-date="disabledDate"
      :shortcuts="datePickerShortcuts"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="x"
      style="width: 400px"
      @change="handleCustomTimeChange"
    />
  </div>
</template>

<style scoped lang="scss">
.time-range-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
