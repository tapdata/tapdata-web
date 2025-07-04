<script setup lang="ts">
import { ErrorMessage } from '../../components/error-message'

const props = defineProps<{
  status: string
  errorMessage?: string
}>()

const statusMap = {
  FAILED: {
    text: '失败',
    type: 'danger',
  },
  GENERATED: {
    text: '已生成',
    type: 'success',
  },
  GENERATING: {
    text: '生成中',
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
    disable-transitions
    @click="handleClick"
  >
    <el-icon v-if="status === 'GENERATING'" class="is-loading">
      <i-lucide:loader />
    </el-icon>

    <el-icon v-if="status === 'FAILED' && errorMessage" size="14">
      <i-mingcute:question-line />
    </el-icon>

    {{ statusMap[status].text }}
  </el-tag>
</template>
