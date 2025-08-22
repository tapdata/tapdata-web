<script setup lang="ts">
import { createEncryption, updateEncryption, type Encryption } from '@tap/api'
import { useI18n } from '@tap/i18n'
import { reactive, ref, useTemplateRef } from 'vue'
import TestContent from './TestContent.vue'
import type { FormInstance } from 'element-plus'

const emit = defineEmits<{
  success: [Encryption]
}>()

const props = defineProps<{
  rule?: Encryption
}>()

const { t } = useI18n()

const visible = defineModel<boolean>()
const title = ref('')
const testCollapse = ref()
const form = ref<Encryption>({
  name: '',
  regex: '',
  outputChar: '',
  description: '',
})
const formRef = useTemplateRef<FormInstance>('formRef')
const testContentRef =
  useTemplateRef<InstanceType<typeof TestContent>>('testContentRef')
const loading = ref(false)

const validateRegex = (
  rule: any,
  value: string,
  callback: (error?: string) => void,
) => {
  if (!value) {
    callback(t('public_regex_required'))
  }
  try {
    new RegExp(value)
  } catch {
    callback(t('public_regex_invalid'))
  }
  callback()
}

const rules = reactive({
  name: [{ required: true, message: t('public_rule_name_required') }],
  regex: [
    {
      required: true,
      validator: validateRegex,
      trigger: 'blur',
    },
  ],
  outputChar: [{ required: true, message: t('public_replace_char_required') }],
})

const handleOpen = () => {
  if (props.rule) {
    form.value = {
      id: props.rule.id,
      name: props.rule.name,
      regex: props.rule.regex,
      outputChar: props.rule.outputChar,
      description: props.rule.description,
    }
    title.value = t('public_edit_rule')
  } else {
    title.value = t('public_create_rule')
    form.value = {
      name: '',
      regex: '',
      outputChar: '',
      description: '',
    }
  }
  formRef.value?.resetFields()
}

const handleClosed = () => {
  testCollapse.value = []
  testContentRef.value?.reset()
}

const handleSave = async () => {
  loading.value = true

  const valid = await formRef.value?.validate()

  if (!valid) {
    loading.value = false
    return
  }

  const method = props.rule ? updateEncryption : createEncryption

  const data = await method(form.value).finally(() => {
    loading.value = false
  })

  emit('success', data as Encryption)

  visible.value = false
  ElMessage.success(t('public_message_save_ok'))
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      label-position="top"
      :rules="rules"
      scroll-to-error
    >
      <el-form-item :label="$t('public_rule_name')" prop="name">
        <el-input
          v-model="form.name"
          :placeholder="$t('public_rule_name_placeholder')"
        />
      </el-form-item>
      <el-form-item :label="$t('public_regex')" prop="regex">
        <el-input
          v-model="form.regex"
          type="textarea"
          autosize
          :placeholder="$t('public_regex_placeholder')"
        />
      </el-form-item>
      <el-form-item :label="$t('public_replace_char')" prop="outputChar">
        <el-input
          v-model="form.outputChar"
          :placeholder="$t('public_replace_char_placeholder')"
        />
      </el-form-item>
      <el-form-item :label="$t('public_description')" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :autosize="{ minRows: 2 }"
          :placeholder="$t('public_description_placeholder')"
        />
      </el-form-item>
    </el-form>

    <el-collapse v-model="testCollapse" style="--collapse-padding-primary: 0">
      <el-collapse-item name="1">
        <template #title>
          <div class="flex gap-2 align-center">
            <el-icon size="16">
              <i-mingcute:play-line />
            </el-icon>
            {{ $t('public_rule_test') }}
          </div>
        </template>
        <TestContent ref="testContentRef" :rule="form" />
      </el-collapse-item>
    </el-collapse>

    <template #footer>
      <el-button @click="visible = false">{{
        $t('public_button_cancel')
      }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleSave">{{
        $t('public_button_save')
      }}</el-button>
    </template>
  </el-dialog>
</template>
