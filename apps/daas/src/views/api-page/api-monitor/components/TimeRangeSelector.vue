<script setup lang="ts">
import { dayjs } from '@tap/business/src/shared/dayjs'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'

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

const customTimeRange = ref<[Date, Date] | null>(props.customTime)

const timeRangeOptions = [
  { label: '最近5分钟', value: '5m' },
  { label: '最近15分钟', value: '15m' },
  { label: '最近1小时', value: '1h' },
  { label: '最近6小时', value: '6h' },
  { label: '最近12小时', value: '12h' },
  { label: '最近24小时', value: '24h' },
  { label: '最近7天', value: '7d' },
  { label: '最近14天', value: '14d' },
  { label: '最近30天', value: '30d' },
  { label: '自定义时间', value: 'custom' },
]

const datePickerShortcuts = [
  {
    text: '最近1小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000)
      return [start, end]
    },
  },
  {
    text: '最近6小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 6)
      return [start, end]
    },
  },
  {
    text: '最近24小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    },
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
]

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
      ElMessage.warning('自定义时间范围不能超过30天')
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
      placeholder="选择时间范围"
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
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      :disabled-date="disabledDate"
      :shortcuts="datePickerShortcuts"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
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
