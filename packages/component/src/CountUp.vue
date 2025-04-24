<script setup lang="ts">
import { CountUp } from '@tap/shared/src/countUp'
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
  startVal?: number
  endVal?: number
  duration?: number
  autoplay?: boolean
  decimals?: number
  decimal?: string
  separator?: string
  prefix?: string
  suffix?: string
  useEasing?: boolean
  easingFn?: (t: number, b: number, c: number, d: number) => number
}

const props = withDefaults(defineProps<Props>(), {
  startVal: 0,
  endVal: 2017,
  duration: 3,
  autoplay: true,
  decimals: 0,
  decimal: '.',
  separator: ',',
  prefix: '',
  suffix: '',
  useEasing: true,
  easingFn: null,
})

const emit = defineEmits<{
  (e: 'mountedCallback'): void
  (e: 'onComplete'): void
}>()

const countUpRef = ref<HTMLElement | null>(null)
let countUp: any = null

const options = computed(() => ({
  decimalPlaces: props.decimals,
  decimal: props.decimal,
  separator: props.separator,
  prefix: props.prefix,
  suffix: props.suffix,
  useEasing: props.useEasing,
  easingFn: props.easingFn,
  duration: props.duration, // Now in seconds, no conversion needed
}))

const initCountUp = () => {
  if (countUp !== null) {
    countUp.reset()
  }

  if (countUpRef.value) {
    countUp = new CountUp(countUpRef.value, props.endVal, options.value)

    if (countUp.error) {
      console.error(countUp.error)
      return
    }

    // Set the start value
    countUp.startVal = props.startVal
    countUp.printValue(props.startVal)

    if (props.autoplay) {
      start()
    }
  }
}

const start = () => {
  if (!countUp) return
  countUp.start(() => {
    emit('onComplete')
  })
}

const pause = () => {
  if (!countUp) return
  countUp.pauseResume()
}

const reset = () => {
  if (!countUp) return
  countUp.reset()
}

const update = (newEndVal: number) => {
  if (!countUp) return
  countUp.update(newEndVal)
}

// Initialize on mounted
onMounted(() => {
  initCountUp()
  emit('mountedCallback')
})

// Watch for prop changes
watch(
  [() => props.startVal, () => props.endVal],
  ([newStartVal, newEndVal]) => {
    if (props.autoplay && countUp) {
      countUp.startVal = newStartVal
      update(newEndVal)
    }
  },
)

// Watch for option changes
watch(
  options,
  () => {
    initCountUp()
  },
  { deep: true },
)

// Expose methods to parent component
defineExpose({
  start,
  pause,
  reset,
  update,
})
</script>

<template>
  <span ref="countUpRef">{{ props.startVal }}</span>
</template>
