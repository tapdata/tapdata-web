<script setup lang="ts">
import {
  API_SERVER_BASE_URL,
  createApiServer,
  deleteApiServer,
  fetchApiServers,
  updateApiServer,
} from '@tap/api/src/core/api-server'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { useHas } from '@tap/business/src/composables'
import i18n from '@tap/i18n'
import Cookie from '@tap/shared/src/cookie'
import { ElMessage, ElMessageBox } from 'element-plus'
import { escapeRegExp } from 'lodash-es'
import { h, nextTick, reactive, ref } from 'vue'

const spacer = h(ElDivider, { direction: 'vertical', class: 'mx-1' })

const { t } = i18n.global
const $has = useHas()

interface CreateForm {
  id?: string
  processId: string
  clientName: string
  clientURI: string
}

const table = ref()
const formRef = ref()
const searchParams = ref({
  keyword: '',
})
const order = ref('clientName DESC')
const createDialogVisible = ref(false)
const createForm = reactive<CreateForm>({
  processId: '',
  clientName: '',
  clientURI: '',
})

const createFormRules = {
  processId: [
    {
      required: true,
      message: `${t('api_server_process_id')} ${t('public_form_not_empty')}`,
      trigger: 'blur',
    },
  ],
  clientName: [
    {
      required: true,
      message: `${t('api_server_client_name')} ${t('public_form_not_empty')}`,
      trigger: 'blur',
    },
  ],
  clientURI: [
    {
      required: true,
      message: `${t('api_server_client_uri')} ${t('public_form_not_empty')}`,
      trigger: 'blur',
    },
  ],
}

// 自动生成唯一标识
const generatorSecret = () => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x40000) | 0).toString(16).slice(1)
  }
  const NewGuid = () => {
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
  }
  return NewGuid()
}

// 创建
const openCreateDialog = () => {
  createDialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
  Object.assign(createForm, {
    id: undefined as string | undefined,
    processId: generatorSecret(),
    clientName: '',
    clientURI: '',
  })
}

// 编辑
const edit = (item: Record<string, any>) => {
  createDialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
  Object.assign(createForm, item)
}

// 移除
const remove = (item: Record<string, any>) => {
  const message = h('p', [
    `${t('public_message_delete_confirm')} ${item.clientName}`,
  ])
  ElMessageBox.confirm(message).then(() => {
    deleteApiServer(item.id).then(() => {
      ElMessage.success(t('public_message_delete_ok'))
      table.value?.fetch()
    })
  })
}

// 下载api配置文件
const downloadConfig = (item: Record<string, any>) => {
  const token = Cookie.get('access_token')
  window.open(
    `${API_SERVER_BASE_URL}/download/${item.id}?access_token=${token}`,
    '_blank',
  )
}

// 保存
const createServer = () => {
  const params = createForm
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      const apiCall = createForm.id
        ? updateApiServer(createForm.id, params)
        : createApiServer(params)

      apiCall.then(() => {
        table.value?.fetch()
        createDialogVisible.value = false
        ElMessage.success(t('public_message_save_ok'))
      })
    }
  })
}

// 获取数据
const getData = ({ page }: { page: { current: number; size: number } }) => {
  const { current, size } = page
  const { keyword } = searchParams.value
  const where: Record<string, any> = {}
  if (keyword && keyword.trim()) {
    const filterObj = { like: escapeRegExp(keyword), options: 'i' }
    where.or = [{ clientName: filterObj }]
  }

  const filter = {
    order: order.value,
    limit: size,
    skip: (current - 1) * size,
    where,
  }
  return fetchApiServers(filter).then((data) => {
    return {
      total: data?.total || 0,
      data: data?.items || [],
    }
  })
}

// 表格排序
const handleSortTable = ({
  order: sortOrder,
  prop,
}: {
  order: string
  prop: string
}) => {
  order.value = `${sortOrder ? prop : 'clientName'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  table.value?.fetch(1)
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        v-if="$has('v2_api-servers_creation')"
        type="primary"
        class="btn btn-create"
        @click="openCreateDialog"
      >
        <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
        <span>{{ $t('api_server_create') }}</span>
      </el-button>
    </template>

    <!-- api服务器 -->
    <TablePage
      ref="table"
      row-key="id"
      class="apiserver-list"
      :remote-method="getData"
      @sort-change="handleSortTable"
    >
      <el-table-column
        :label="$t('api_server_user')"
        :show-overflow-tooltip="true"
        prop="user.email"
        sortable="user.email"
        width="120"
      >
        <template #default="scope">
          {{ scope.row.user ? scope.row.user.email : '' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('api_server_process_id')"
        :show-overflow-tooltip="true"
        prop="processId"
        sortable="processId"
      />
      <el-table-column
        :label="$t('api_server_client_name')"
        :show-overflow-tooltip="true"
        prop="clientName"
        sortable="clientName"
      />
      <el-table-column
        :label="$t('api_server_client_uri')"
        :show-overflow-tooltip="true"
        prop="clientURI"
        sortable="clientURI"
      />
      <el-table-column
        :label="$t('public_operation')"
        width="200"
        fixed="right"
      >
        <template #default="{ row }">
          <el-space :spacer="spacer" :size="0" class="lh-1">
            <el-button
              v-if="row.permissionActions?.includes('Edit')"
              text
              type="primary"
              @click="edit(row)"
            >
              {{ $t('public_button_edit') }}
            </el-button>
            <el-button
              v-if="row.permissionActions?.includes('Delete')"
              text
              type="primary"
              @click="remove(row)"
              >{{ $t('public_button_delete') }}</el-button
            >
            <el-tooltip
              v-if="$has('v2_api-servers_download')"
              class="item"
              effect="dark"
              :content="$t('api_server_download_API_Server_config')"
              placement="top"
            >
              <el-button text type="primary" @click="downloadConfig(row)">{{
                $t('public_button_download')
              }}</el-button>
            </el-tooltip>
          </el-space>
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建客户端 -->
    <el-dialog
      v-model="createDialogVisible"
      width="600px"
      class="create-dialog"
      :title="
        createForm.id ? $t('api_server_edit') : $t('api_server_create_server')
      "
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="createForm"
        label-position="top"
        label-width="180px"
        :rules="createFormRules"
      >
        <el-form-item
          :label="$t('api_server_process_id')"
          prop="processId"
          required
        >
          <el-input v-model="createForm.processId" />
        </el-form-item>
        <el-form-item
          :label="$t('api_server_client_name')"
          prop="clientName"
          required
        >
          <el-input
            v-model="createForm.clientName"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          :label="$t('api_server_client_uri')"
          prop="clientURI"
          required
        >
          <el-input
            v-model="createForm.clientURI"
            maxlength="200"
            show-word-limit
            :placeholder="`${$t('api_server_client_uri')}(http://127.0.0.1:3080)`"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button type="primary" @click="createServer()">{{
            $t('public_button_confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.apiserver-wrap {
  height: 100%;
  .apiserver-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
  }
}
</style>

<style lang="scss">
.apiserver-wrap {
  .table-span {
    margin: 0 2px;
    padding: 2px;
    border: 1px solid #ccc;
  }
}
</style>
