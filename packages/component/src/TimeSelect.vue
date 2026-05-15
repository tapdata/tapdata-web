<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { IconButton } from './icon-button'

interface OptionItem {
  label: string
  value: string
  type?: string
  isTime?: boolean
}

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    value?: string
    title?: string
    options?: OptionItem[]
    rangeSeparator?: string
    interval?: number
    range?: (number | null)[]
  }>(),
  {
    interval: 60 * 1000,
    range: () => [Time.now() - 5 * 60 * 1000, Time.now()],
  },
)

const emit = defineEmits<{
  (e: 'change', value: string, isTime: boolean, source: OptionItem): void
  (e: 'setMinAndMaxTime'): void
  (e: 'update:value', value: string): void
}>()

const datetime = useTemplateRef<any>('datetime')

const period = ref('')
const time = ref<number[]>([])
const items = ref<OptionItem[]>([])
const isTime = ref(false)

const optionsAndValue = computed(() => ({
  value: props.value,
  options: props.options || [
    {
      label: t('packages_dag_components_timeselect_zuijinfenzhong'),
      value: '5m',
    },
    {
      label: t('packages_dag_components_timeselect_zuixinxiaoshi'),
      value: '1h',
    },
    { label: t('public_time_last_day'), value: '1d' },
    {
      label: t('packages_dag_components_timeselect_renwuzuijinyi'),
      value: 'lastStart',
    },
    {
      label: t('packages_dag_components_timeselect_renwuquanzhouqi'),
      value: 'full',
    },
    { label: t('public_time_custom_time'), type: 'custom', value: 'custom' },
  ],
}))

watch(
  optionsAndValue,
  () => {
    items.value = JSON.parse(JSON.stringify(optionsAndValue.value.options))
    if (props.value) {
      setPeriod(props.value)
    }
  },
  { deep: true },
)

onMounted(() => {
  items.value = JSON.parse(JSON.stringify(optionsAndValue.value.options))
  setPeriod(props.value || items.value[0]?.value)
})

function isInRange(cell: { dayjs: dayjs.Dayjs; [key: string]: any }) {
  const [start, end] = props.range
  if (!end) return false

  const d = cell.dayjs.startOf('day')
  const endDay = dayjs(end).startOf('day')

  if (start == null) {
    return d.isBefore(endDay) || d.isSame(endDay)
  }

  const startDay = dayjs(start).startOf('day')
  return (
    (d.isAfter(startDay) || d.isSame(startDay)) &&
    (d.isBefore(endDay) || d.isSame(endDay))
  )
}

function changeFnc(value: string) {
  const findOne = items.value.find((item) => item.value === value)
  if (findOne?.type === 'custom') {
    nextTick(() => openPicker())
    return
  }
  isTime.value = !!findOne?.isTime
  emit('change', findOne!.value, isTime.value, findOne!)
}

function openPicker() {
  if (isTime.value && period.value && period.value !== 'custom') {
    time.value = period.value.split(',').map((v) => Number(v))
  }
  datetime.value?.handleOpen()
}

function changeTime(result?: number[] | null) {
  const val = result || []
  const label =
    val[0] || val[1]
      ? `${val[0] ? dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss') : '-'} ${t('packages_dag_components_timeselect_zhi')} ${val[1] ? dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss') : '-'}`
      : ''
  const valJoin = val?.map((v) => new Date(v).getTime()).join()
  if (!valJoin) return

  const findOne = items.value.find((item) => item.value === valJoin)
  if (!findOne) {
    items.value = items.value.filter((item) => !item.isTime)
    items.value.push({ label, value: valJoin, isTime: true })
    isTime.value = true
  }
  period.value = valJoin
  emit(
    'change',
    valJoin,
    true,
    Object.assign(
      {},
      items.value.find((item) => item.type === 'custom'),
      { value: val },
    ),
  )
}

function blur() {
  if (!time.value?.length) {
    changeTime(props.range as number[])
  }
  time.value = []
}

function setPeriod(value?: string) {
  if (!value) return
  const findOne = items.value.find((item) => item.value === value)
  if (!findOne) {
    changeTime(value.split(',').map((v) => Number(v)))
    return
  }
  period.value = value
  return findOne
}

function getPeriod(value?: string) {
  return items.value.find((item) => item.value === (value || period.value))
}

defineExpose({ setPeriod, getPeriod, openPicker })
</script>

<template>
  <div class="time-select__picker flex align-center">
    <div class="w-100 picker__item inline-flex align-items-center">
      <div class="time-select__title">
        {{ title || $t('public_time_period') }}
      </div>
      <ElSelect
        v-model="period"
        popper-class="time-select__popper"
        class="ml-2 dark flex-1"
        style="min-width: 180px"
        @change="changeFnc"
      >
        <ElOption
          v-for="(item, index) in items"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </div>
    <IconButton class="color-primary" @click.stop="openPicker"
      >timer</IconButton
    >
    <ElDatePicker
      v-if="range[0]"
      ref="datetime"
      v-model="time"
      type="datetimerange"
      :range-separator="t('packages_dag_components_timeselect_zhi')"
      :start-placeholder="t('packages_dag_components_timeselect_kaishiriqi')"
      :end-placeholder="t('packages_dag_components_timeselect_jieshuriqi')"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="x"
      class="el-date-picker position-absolute overflow-hidden p-0 m-0"
      @change="changeTime"
      @blur="blur"
    >
      <template #default="cell">
        <div class="el-date-table-cell" :class="{ current: cell.isCurrent }">
          <span class="el-date-table-cell__text text">{{ cell.text }}</span>
          <span v-if="isInRange(cell)" class="in-range-dot" />
        </div>
      </template>
    </ElDatePicker>
  </div>
</template>

<style lang="scss" scoped>
.time-select__picker {
  position: relative;

  :deep(.time-select__popper) {
    width: 270px;
    min-width: 270px !important;
    transform: translateX(-40px);
  }

  :deep(.el-select) {
    &.dark {
      .el-input__inner {
        border: none;
        background-color: inherit;
      }

      .el-icon-arrow-up:before {
        content: '\e78f';
      }
    }
  }

  :deep(.el-date-picker) {
    height: 0;
    border: 0;
    bottom: 0;
    left: 0;
  }
}

.time-select__title {
  white-space: nowrap;
  line-height: 1.5;
}

.datetime {
  position: absolute;
}

.picker__item {
  padding-right: 8px;
  border-radius: 4px;
}

.el-date-table-cell {
  height: 30px;
  padding: 3px 0;
  box-sizing: border-box;

  .in-range-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--el-color-primary);
    border-radius: 50%;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
