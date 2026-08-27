<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  options: Array<{ id: string; name: string }>
}>()

const visible = defineModel<boolean>('visible')
const { t } = useI18n()
const selected = ref('')

const emit = defineEmits<{
  confirm: [id: string]
  closed: []
}>()

watch(visible, (open) => {
  if (open) selected.value = props.options[0]?.id || ''
})

const canConfirm = computed(() => !!selected.value)

function confirm() {
  if (!selected.value) return
  emit('confirm', selected.value)
  visible.value = false
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="t('packages_business_workflow_context_task')"
    width="480px"
    append-to-body
    @closed="emit('closed')"
  >
    <p class="font-color-light mb-3">
      {{ t('packages_business_workflow_context_task_tip') }}
    </p>
    <ElSelect v-model="selected" class="w-100" filterable>
      <ElOption
        v-for="item in options"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </ElSelect>
    <template #footer>
      <ElButton @click="visible = false">{{
        t('public_button_cancel')
      }}</ElButton>
      <ElButton type="primary" :disabled="!canConfirm" @click="confirm">
        {{ t('public_button_confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
