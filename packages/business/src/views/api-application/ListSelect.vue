<script setup lang="ts">
import { fetchApps } from '@tap/api'
import AsyncSelect from '@tap/form/src/components/infinite-select/InfiniteSelect.vue'
import { reactive, watch } from 'vue'

interface Props {
  value?: string | number
  label?: string
  params?: Record<string, any>
  format?: (items: any[]) => any[]
}

const props = withDefaults(defineProps<Props>(), {
  params: () => ({}),
})

const emit = defineEmits<{
  (e: 'change', value: string | number | undefined, opt: any): void
  (e: 'update:label', label: string): void
  (e: 'update:value', value: string | number | undefined): void
}>()

const form = reactive({
  label: '',
  value: '' as string | number | undefined,
})

watch(
  () => props.value,
  (v) => {
    form.value = v
    form.label = props.label || ''
  },
  { immediate: true },
)

const handleChange = (opt: any) => {
  const { label } = opt
  form.label = label
  emit('update:value', form.value)
  emit('update:label', form.label)
  emit('change', form.value, opt)
}

const getData = async (filter: any = {}) => {
  const { page, size } = filter
  const params = {
    where: {
      item_type: 'app',
    },
    order: 'createTime DESC',
    limit: size,
    skip: (page - 1) * size,
  }

  const { label } = filter.where || {}
  if (label) {
    Object.assign(params.where, {
      value: label,
    })
  }

  const res = await fetchApps(Object.assign(params, props.params))

  let items = res.items.map((t: any) => {
    return {
      label: t.value,
      value: t.id,
      data: t,
    }
  })

  if (props.format) {
    items = props.format(items)
  }

  return {
    ...res,
    items,
  }
}
</script>

<template>
  <AsyncSelect
    v-bind="$attrs"
    v-model="form.value"
    :method="getData"
    :current-label="form.label"
    filterable
    lazy
    @option-select="handleChange"
  />
</template>
