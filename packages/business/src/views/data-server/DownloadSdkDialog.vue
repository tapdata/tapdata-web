<script setup lang="ts">
import { apiServerApi, applicationApi } from '@tap/api'
import { useI18n } from '@tap/i18n'
import { downloadBlob } from '@tap/shared'
import axios from 'axios'
import { reactive, ref, useTemplateRef } from 'vue'
import type { FormInstance } from 'element-plus'

const { t } = useI18n()

const visible = defineModel<boolean>()
const formRef = useTemplateRef<FormInstance>('formRef')

const loading = ref(false)
const form = reactive({
  version: '1.0.0',
  clientId: '',
})
const clientOptions = ref<{ label: string; value: string }[]>([])

const rules = {
  clientId: [{ required: true, message: t('public_please_select_client') }],
  version: [{ required: true, message: t('public_please_input_version') }],
}

const fetchClientOptions = async () => {
  const { items } = await applicationApi.get({
    filter: JSON.stringify({
      order: 'createdAt',
      limit: 1000,
      skip: 0,
    }),
  })

  form.clientId = items?.[0]?.clientId

  clientOptions.value = items.map((item) => ({
    label: item.clientName,
    value: item.clientId,
  }))
}

const onOpen = () => {
  fetchClientOptions()
}

const onClosed = () => {
  formRef.value?.resetFields()
}

const handleDownload = async () => {
  loading.value = true

  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    loading.value = false
    return
  }

  const {
    items: [apiServer],
  } = await apiServerApi.get()

  if (!apiServer?.clientURI) {
    ElMessage.error(t('packages_business_connections_test_xiazaishibai'))
    return
  }

  const blogData = await axios
    .post(
      '/api/openapi/generator/generate',
      {
        oas: `${apiServer.clientURI.replaceAll(/\/+$/g, '')}/openapi.json`,
        lan: 'java',
        packageName: 'io.tapdata.sdk',
        artifactId: 'tapdata-sdk',
        groupId: 'io.tapdata',
        version: form.version,
        clientId: form.clientId,
        requestAddress: location.origin,
      },
      {
        responseType: 'blob',
      },
    )
    .finally(() => {
      loading.value = false
    })

  if (blogData.data.type === 'application/json') {
    ElMessage.error(t('packages_business_connections_test_xiazaishibai'))
    return
  }

  downloadBlob(blogData)

  ElMessage.success(t('public_message_download_ok'))

  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="$t('public_download_sdk')"
    width="500px"
    @open="onOpen"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" label-position="top" :rules="rules">
      <el-form-item :label="$t('role_module_meun_API_clients')" prop="clientId">
        <el-select-v2 v-model="form.clientId" :options="clientOptions" />
      </el-form-item>
      <el-form-item :label="$t('public_version')" prop="version">
        <el-input v-model="form.version" class="w-full" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">
        {{ $t('public_button_cancel') }}
      </el-button>
      <el-button :loading="loading" type="primary" @click="handleDownload">
        {{ $t('public_start_download') }}
      </el-button>
    </template>
  </el-dialog>
</template>
