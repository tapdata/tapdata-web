<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { ErrorMessage } from '../../components/error-message'

const { t } = useI18n()

const props = defineProps<{
  status: string
  errorMessage?: string
}>()

const statusMap = {
  FAILED: {
    text: t('public_status_failed'),
    type: 'danger',
  },
  GENERATED: {
    text: t('public_generated'),
    type: 'success',
  },
  GENERATING: {
    text: t('public_generating'),
    type: '',
  },
}

const handleClick = (event) => {
  if (props.status === 'FAILED' && props.errorMessage) {
    event.stopPropagation()
    ErrorMessage(props.errorMessage)
  }
}
</script>

<template>
  <el-tag
    :type="statusMap[status].type"
    :class="{
      'cursor-pointer': status === 'FAILED' && errorMessage,
    }"
    disable-transitions
    @click="handleClick"
  >
    <span class="flex align-center gap-1">
      <el-icon v-if="status === 'GENERATING'" class="is-loading">
        <i-lucide:loader />
      </el-icon>

      <el-icon v-if="status === 'FAILED' && errorMessage" size="14">
        <i-mingcute:question-line />
      </el-icon>

      {{ statusMap[status].text }}
    </span>
  </el-tag>
</template>
