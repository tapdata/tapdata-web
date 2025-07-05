<script setup lang="ts">
import {
  createSdk,
  fetchApiClients,
  fetchApiModules,
  fetchApisByClient,
  fetchApiServers,
  fetchApiServerToken,
  useRequest,
  type CreateSdkParams,
} from '@tap/api'
import { useI18n } from '@tap/i18n'
import { computed, reactive, ref, useTemplateRef } from 'vue'
import type {
  FilterNodeMethodFunction,
  FormInstance,
  FormRules,
  InputInstance,
  TreeInstance,
} from 'element-plus'

const { t } = useI18n()

// 组件事件
interface Emits {
  (e: 'success', data: any): void
}

const visible = defineModel<boolean>('modelValue', { required: false })
const isNewVersion = ref(false)
const lastVersion = ref('')

const emit = defineEmits<Emits>()

const formRef = useTemplateRef<FormInstance>('formRef')
const searchApi = ref('')
const versionInputRef = useTemplateRef<InputInstance>('versionInputRef')
const treeRef = useTemplateRef<TreeInstance>('treeRef')

const submitting = ref(false)

const form = reactive<Partial<CreateSdkParams>>({
  packageName: '',
  artifactId: '',
  version: '',
  clientId: '',
  moduleIds: [],
})

const rules: FormRules = {
  artifactId: [
    {
      required: true,
      message: t('public_placeholder_sdk_name'),
      trigger: 'blur',
    },
  ],
  packageName: [
    {
      required: true,
      message: t('public_placeholder_package_name'),
      trigger: 'blur',
    },
  ],
  version: [
    {
      required: true,
      message: t('public_placeholder_version'),
      trigger: 'blur',
    },
  ],
  // apiList: [{ required: true, message: t('public_select_api') }],
}

const nextVersion = computed(() => {
  if (!lastVersion.value) {
    return '1.0.0'
  }

  return getNextVersion(lastVersion.value)
})

const {
  data: apiClients,
  loading: apiClientsLoading,
  run: runFetchApiClients,
} = useRequest(
  async () => {
    const res = await fetchApiClients({
      limit: 1000,
    })

    if (res.items.length === 0) {
      return []
    }

    const selectedClientId = form.clientId || res.items[0].id
    handleSelectApiClient(selectedClientId)

    return res.items
  },
  {
    manual: true,
    initialData: [],
  },
)

const mapApi = (item: any) => {
  const pathJoin: string[] = []
  item.apiVersion && pathJoin.push(item.apiVersion)
  item.prefix && pathJoin.push(item.prefix)
  item.basePath && pathJoin.push(item.basePath)
  item.baseUrl = `/${pathJoin.join('/')}`
  item.label = item.name

  return item
}

const {
  data: apiModules,
  loading: apiModulesLoading,
  runAsync: runFetchApiModules,
} = useRequest(
  async () => {
    const apis = await fetchApisByClient(form.clientId)

    const group = apis.reduce(
      (tree, item) => {
        // 获取第一个应用标签
        const firstTag = item.listtags?.[0]

        if (!firstTag) {
          // 如果没有应用标签，放到"未分组"中
          const ungroupedKey = 'ungrouped'
          if (!tree[ungroupedKey]) {
            tree[ungroupedKey] = {
              id: ungroupedKey,
              label: 'Ungrouped',
              value: ungroupedKey,
              children: [],
            }
          }
          tree[ungroupedKey].children.push(mapApi(item))
        } else {
          // 按应用分组
          const appKey = firstTag.id

          if (!tree[appKey]) {
            tree[appKey] = {
              id: firstTag.id,
              label: firstTag.value,
              value: firstTag.id,
              children: [],
            }
          } else {
            tree[appKey].label = tree[appKey].label || firstTag.value
          }

          tree[appKey].children.push(mapApi(item))
        }

        return tree
      },
      {} as Record<string, any>,
    )

    const children: { id: string; children: any[] }[] = Object.values(group)

    return [
      {
        id: 'ROOT',
        label: t('public_all'),
        children,
      },
    ]
  },
  {
    manual: true,
    initialData: [],
  },
)

const filterNode: FilterNodeMethodFunction = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
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

  if (!form.clientId) {
    ElMessage.error(t('public_message_select_client'))
    return
  }

  if (!form.moduleIds?.length) {
    ElMessage.error(t('public_message_select_api'))
    return
  }

  submitting.value = true

  const {
    items: [apiServer],
  } = await fetchApiServers({
    limit: 1,
  })

  if (!apiServer?.clientURI) {
    ElMessage.error(t('packages_business_connections_test_xiazaishibai'))
    return
  }

  try {
    // TODO: 调用创建 SDK 的 API
    await createSdk({
      ...form,
      // oas: `http://localhost:3080/openapi.json`,
      oas: `${apiServer.clientURI.replaceAll(/\/+$/g, '')}/openapi.json`,
      requestAddress: location.origin,
    })

    ElMessage.success(t('创建成功'))
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
  formRef.value?.clearValidate()

  form.artifactId = ''
  form.packageName = ''
  form.moduleIds = []
  form.clientId = ''
  form.version = ''
}

const onOpen = () => {
  runFetchApiClients()
}

// 对话框关闭后的回调
const onClosed = () => {
  resetForm()
}

const handleSelectApiClient = (clientId: string) => {
  const moduleIds = form.moduleIds || []
  form.clientId = clientId
  form.moduleIds = []

  runFetchApiModules().then(() => {
    if (moduleIds.length > 0) {
      treeRef.value?.setCheckedKeys(moduleIds)
    }
  })
}

const handleSearchApi = (value: string) => {
  treeRef.value?.filter(value)
}

const getNodeCount = (node: any) => {
  if (node.key !== 'ROOT') {
    return node.childNodes.filter((child: any) => child.visible).length
  }

  return node.childNodes.reduce((count: number, child: any) => {
    return count + (child.isLeaf ? 1 : getNodeCount(child))
  }, 0)
}
const handleCheckApi = () => {
  form.moduleIds = treeRef.value?.getCheckedKeys(true) as string[]
}

const getNextVersion = (version: string) => {
  // 处理空版本号
  if (!version) return '1.0.0'

  // 使用正则表达式匹配最后一个数字并递增
  // 这个正则会匹配版本号中的最后一个数字序列
  return version.replace(/(\d+)(?=\D*$)/, (match, num) => {
    return (Number.parseInt(num, 10) + 1).toString()
  })
}

const handleEnterVersion = () => {
  form.version = nextVersion.value
  versionInputRef.value?.focus()
}

const open = (row: any) => {
  if (!row) {
    visible.value = true
    isNewVersion.value = false
    return
  }

  visible.value = true
  isNewVersion.value = true
  lastVersion.value = row.lastGeneratedVersion
  form.artifactId = row.artifactId
  form.packageName = row.packageName
  form.moduleIds = row.moduleIds
  form.clientId = row.clientId
}

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="
      isNewVersion
        ? `${$t('public_new_release')} - ${form.artifactId} (${form.packageName})`
        : $t('public_create_sdk')
    "
    width="800px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    @open="onOpen"
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
      <ElFormItem
        v-if="!isNewVersion"
        :label="$t('public_sdk_name')"
        prop="artifactId"
      >
        <ElInput
          v-model="form.artifactId"
          :placeholder="$t('public_placeholder_sdk_name')"
          clearable
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem
        v-if="!isNewVersion"
        :label="$t('public_package_name')"
        prop="packageName"
      >
        <ElInput
          v-model="form.packageName"
          :placeholder="$t('public_placeholder_package_name')"
          clearable
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <!-- 版本号 -->
      <ElFormItem :label="$t('public_version_name')" prop="version">
        <ElInput
          ref="versionInputRef"
          v-model="form.version"
          :placeholder="`${$t('public_example')}: 1.0.0`"
          maxlength="20"
        >
          <template v-if="isNewVersion" #suffix>
            <el-button text type="primary" @click="handleEnterVersion">
              {{ $t('public_quick_fill') }}: {{ nextVersion }}
            </el-button>
          </template>
        </ElInput>
        <div
          v-if="isNewVersion && lastVersion"
          class="text-caption text-disabled lh-base mt-1"
        >
          {{ $t('public_last_version') }}: {{ lastVersion }}
        </div>
      </ElFormItem>

      <!-- 选择 API -->
      <ElFormItem prop="apiList">
        <template #label>
          <div class="flex align-center gap-2">
            <span>{{ $t('public_select_api') }}</span>
            <el-tag v-show="form.moduleIds?.length" type="info" class="is-code">
              已选:
              {{ form.moduleIds?.length }}
              APIs
            </el-tag>
          </div>
        </template>
        <div
          class="flex bg-light rounded-xl overflow-hidden w-100 lh-base"
          style="max-height: 400px"
        >
          <div style="width: 200px" class="flex-shrink-0">
            <div class="text-caption p-2 pl-4">{{ $t('public_client') }}</div>
            <div class="p-2 pt-0">
              <div class="flex flex-column gap-1">
                <div
                  v-for="client in apiClients"
                  :key="client.id"
                  class="flex align-center gap-2 h-8 list-item-hover px-2 rounded-lg cursor-pointer"
                  :class="{ 'is-active': form.clientId === client.id }"
                  @click="handleSelectApiClient(client.clientId)"
                >
                  <span class="flex-1 ellipsis">{{ client.clientName }}</span>
                  <el-icon
                    v-if="form.clientId === client.id"
                    class="ml-auto"
                    size="16"
                    ><i-mingcute:check-line
                  /></el-icon>
                </div>
              </div>
            </div>
          </div>
          <div class="p-2 flex-1 min-w-0 flex flex-column">
            <div
              class="bg-white rounded-xl min-h-0 flex flex-column"
              style="border: 1px solid #f2f4f7"
            >
              <div class="p-2">
                <el-input
                  v-model="searchApi"
                  class="is-borderless"
                  clearable
                  :placeholder="$t('public_search_api')"
                  :style="{
                    '--el-input-bg-color': 'var(--el-fill-color-light)',
                  }"
                  @input="handleSearchApi"
                >
                  <template #prefix>
                    <el-icon><i-mingcute:search-line /></el-icon>
                  </template>
                </el-input>
              </div>
              <div
                v-loading="apiModulesLoading"
                class="p-2 pt-0 min-h-0 overflow-y-auto"
              >
                <el-tree
                  ref="treeRef"
                  node-key="id"
                  :indent="8"
                  :data="apiModules"
                  default-expand-all
                  :filter-node-method="filterNode"
                  show-checkbox
                  style="--el-tree-node-content-height: 32px"
                  @check="handleCheckApi"
                >
                  <template #default="{ node, data }">
                    <div class="flex align-center gap-1">
                      <el-icon v-if="!node.isLeaf" size="16"
                        ><i-fluent:folder-link-16-regular
                      /></el-icon>
                      <span>{{ data.label }}</span>
                      <span v-if="!node.isLeaf" class="text-disabled fs-8">
                        ({{ getNodeCount(node) }})
                      </span>
                      <span v-else class="text-disabled fs-8 ml-2">
                        {{ data.baseUrl }}
                      </span>
                    </div>
                  </template>
                </el-tree>
              </div>
            </div>
          </div>
        </div>
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
