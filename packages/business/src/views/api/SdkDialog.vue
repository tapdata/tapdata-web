<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed, reactive, ref, useTemplateRef } from 'vue'
import type { Sdk } from '@tap/api'
import type { FormInstance, FormRules } from 'element-plus'

const { t } = useI18n()

// 组件事件
interface Emits {
  (e: 'success', data: any): void
}

const visible = defineModel<boolean>('modelValue', { required: true })

const emit = defineEmits<Emits>()

// 表单引用
const formRef = useTemplateRef<FormInstance>('formRef')

// 加载状态
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  packageName: '',
  version: '',
  clientId: '',
  apiList: [],
})

// 可选的 API 列表
const apiOptions = ref([
  { label: 'Api 1', value: 'api1' },
  { label: 'Api 2', value: 'api2' },
  { label: 'Api 3', value: 'api3' },
  { label: 'Api 4', value: 'api4' },
])

// 表单验证规则
const rules: FormRules = {
  name: [
    {
      required: true,
      message: t('public_input_placeholder_sdk_name'),
      trigger: 'blur',
    },
  ],
  version: [
    {
      required: true,
      message: t('public_input_placeholder_version'),
      trigger: 'blur',
    },
  ],
  apiList: [
    { required: true, message: t('public_select_api'), trigger: 'change' },
  ],
}

// 处理关闭对话框
const handleClose = () => {
  visible.value = false
}

// 处理取消
const handleCancel = () => {
  handleClose()
}

// 处理创建 SDK
const handleCreate = async () => {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  submitting.value = true

  try {
    // TODO: 调用创建 SDK 的 API
    // const result = await createSdk(form)

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    ElMessage.success(t('public_message_create_success'))
    emit('success', form)
    handleClose()
    resetForm()
  } catch (error) {
    console.error('Create SDK failed:', error)
    ElMessage.error(t('public_message_create_failed'))
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.name = ''
  form.version = ''
  form.apiList = []
  formRef.value?.resetFields()
}

// 对话框关闭后的回调
const onClosed = () => {
  resetForm()
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('public_create_sdk')"
    width="500px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    @closed="onClosed"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="sdk-form"
    >
      <!-- SDK 名称 -->
      <ElFormItem :label="$t('public_sdk_name')" prop="name">
        <ElInput
          v-model="form.name"
          :placeholder="$t('public_input_placeholder_sdk_name')"
          clearable
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <!-- 版本号 -->
      <ElFormItem :label="$t('public_version')" prop="version">
        <ElInput
          v-model="form.version"
          :placeholder="$t('public_input_placeholder_version')"
          clearable
          maxlength="20"
        />
      </ElFormItem>

      <!-- 选择 API -->
      <ElFormItem :label="$t('public_select_api')" prop="apiList">
        <ElSelect
          v-model="form.apiList"
          multiple
          filterable
          :placeholder="$t('public_select_api_placeholder')"
          class="w-full"
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
        >
          <ElOption
            v-for="option in apiOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">
        {{ $t('public_button_cancel') }}
      </ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleCreate">
        {{ $t('public_button_create') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.sdk-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
