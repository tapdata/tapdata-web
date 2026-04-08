<script setup lang="ts">
import {
  createApiClient,
  deleteApiClient,
  fetchApiClients,
  updateApiClient,
} from '@tap/api/src/core/api-client'
import { fetchRoles } from '@tap/api/src/core/roles'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { useHas } from '@tap/business/src/composables'
import i18n from '@tap/i18n'
import { cloneDeep, escapeRegExp } from 'lodash-es'
import { h, nextTick, reactive, ref } from 'vue'

const { t } = i18n.global

interface CreateForm {
  id?: string
  clientName: string
  clientId: string
  grantTypes: string[]
  clientSecret: string
  scopes: string[]
  redirectUris: string[]
  redirectUrisStr: string
  showMenu: boolean
  [key: string]: any
}

const table = ref()
const formRef = ref()
const searchParams = ref({
  keyword: '',
})
const order = ref('clientName DESC')
const createDialogVisible = ref(false)
const roles = ref<any[]>([])
const createForm = reactive<CreateForm>({
  clientName: '',
  clientId: '',
  grantTypes: [],
  clientSecret: '',
  scopes: [],
  redirectUris: [],
  redirectUrisStr: '',
  showMenu: true,
})
const $has = useHas()

// 获取角色
const getRoles = () => {
  const filter = {
    limit: 500,
    skip: 0,
  }
  fetchRoles(filter).then((data) => {
    roles.value = data?.items || []
  })
}

getRoles()

// 创建
const openCreateDialog = () => {
  createDialogVisible.value = true
  Object.assign(createForm, {
    id: undefined as string | undefined,
    clientName: '',
    clientId: '',
    grantTypes: ['implicit', 'client_credentials'],
    clientSecret: '',
    scopes: [],
    redirectUris: [],
    redirectUrisStr: '',
    showMenu: true,
  })
  nextTick(() => {
    setTimeout(() => {
      formRef.value?.clearValidate()
    }, 50)
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
  const message = h('p', [`${t('public_message_delete_confirm')} ${item.name}`])
  ElMessageBox.confirm(message, t('public_message_title_prompt')).then(() => {
    deleteApiClient(item.id).then(() => {
      ElMessage.success(t('public_message_delete_ok'))
      table.value?.fetch()
    })
  })
}

// 保存
const createApplication = () => {
  const method = createForm.id ? updateApiClient : createApiClient
  const params: Record<string, any> = cloneDeep(createForm)
  params.name = createForm.clientName
  params.tokenType = 'jwt'
  params.clientType = 'public'
  params.responseTypes = ['token']
  params.redirectUris = params.redirectUrisStr?.split(',') || []
  delete params.redirectUrisStr

  // 如果clientId为空，则不传递该字段
  if (!params.clientId || params.clientId.trim() === '') {
    delete params.clientId
  }

  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      method(params).then(() => {
        table.value?.fetch()
        createDialogVisible.value = false
        ElMessage.success(t('public_message_save_ok'))
      })
    }
  })
}

// 获取密钥
const generatorSecret = () => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x40000) | 0).toString(16).slice(1)
  }
  const NewGuid = () => {
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
  }
  createForm.clientSecret = NewGuid()
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
  return fetchApiClients(filter).then((data) => {
    return {
      total: data?.total || 0,
      data:
        data?.items.map((item) => {
          item.redirectUrisStr = item.redirectUris
            ? item.redirectUris.join(',')
            : ''
          return item
        }) || [],
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
  order.value = `${sortOrder ? prop : 'last_updated'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  table.value?.fetch(1)
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-if="$has('v2_api-client_creation')"
        class="btn btn-create"
        type="primary"
        @click="openCreateDialog"
      >
        <span>{{ $t('application_create') }}</span>
      </ElButton>
    </template>
    <!-- api客户端 -->
    <TablePage
      ref="table"
      row-key="id"
      class="applications-list"
      :remote-method="getData"
      @sort-change="handleSortTable"
    >
      <el-table-column
        :label="$t('application_header_id')"
        :show-overflow-tooltip="true"
        prop="clientId"
        width="230"
      >
        <!-- <template slot-scope="scope"> -->
      </el-table-column>
      <el-table-column
        :label="$t('application_header_client_name')"
        prop="clientName"
        sortable="clientName"
        width="130"
      />
      <el-table-column
        :label="$t('application_header_grant_type')"
        prop="grantTypes"
        sortable="grantTypes"
        min-width="160"
      >
        <template #default="scope">
          <div class="classfy">
            <span
              v-for="item in scope.row.grantTypes"
              :key="item"
              class="table-span text-break"
              >{{ item }}</span
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('application_header_client_secret')"
        :show-overflow-tooltip="true"
        prop="clientSecret"
        sortable="clientSecret"
        min-width="160"
        max-width="300"
      />
      <el-table-column
        :label="$t('application_header_redirect_uri')"
        :show-overflow-tooltip="true"
        prop="redirectUrisStr"
        min-width="140"
      />
      <el-table-column prop="scopeNames" min-width="160" max-width="300">
        <template #header>
          <div class="flex align-center gap-1">
            <VIcon size="16"> ShieldKeyhole </VIcon>
            <span>{{ $t('application_header_scopes') }}</span>
          </div>
        </template>
        <template #default="scope">
          <div class="flex flex-wrap gap-1">
            <el-tag
              v-for="item in scope.row.scopeNames"
              :key="item"
              type="info"
              size="small"
              class="table-span"
              >{{ item }}</el-tag
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('public_operation')"
        min-width="120"
        fixed="right"
      >
        <template #default="scope">
          <ElButton
            v-readonlybtn="'API_clients_amangement'"
            text
            type="primary"
            @click="edit(scope.row)"
          >
            {{ $t('public_button_edit') }}
          </ElButton>
          <template v-if="scope.row.id !== '5c0e750b7a5cd42464a5099d'">
            <ElDivider class="mx-1" direction="vertical" />
            <ElButton
              v-readonlybtn="'API_clients_amangement'"
              text
              type="primary"
              @click="remove(scope.row)"
              >{{ $t('public_button_delete') }}</ElButton
            >
          </template>
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建客户端 -->
    <ElDialog
      v-model="createDialogVisible"
      width="600px"
      class="create-dialog"
      :title="createForm.id ? $t('application_edit') : $t('application_create')"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="formRef"
        :model="createForm"
        class="applications-form"
        label-width="100px"
        label-position="top"
      >
        <ElFormItem
          :label="$t('application_header_client_name')"
          required
          prop="clientName"
        >
          <ElInput v-model="createForm.clientName" />
        </ElFormItem>
        <ElFormItem :label="$t('application_header_id')" prop="clientId">
          <ElInput
            v-model="createForm.clientId"
            :placeholder="$t('application_client_id_placeholder')"
          />
        </ElFormItem>
        <ElFormItem
          :label="$t('application_header_grant_type')"
          required
          prop="grantTypes"
        >
          <ElSelect v-model="createForm.grantTypes" multiple>
            <ElOption label="Implicit" value="implicit" />
            <ElOption label="Client Credentials" value="client_credentials" />
            <ElOption label="Refresh Token" value="refresh_token" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          :label="$t('application_header_client_secret')"
          required
          prop="clientSecret"
        >
          <template #label>
            <span class="align-middle mr-1">{{
              $t('application_header_client_secret')
            }}</span>
            <el-button tag="a" text type="primary" @click="generatorSecret">{{
              $t('application_generator')
            }}</el-button>
          </template>
          <ElInput v-model="createForm.clientSecret" />
        </ElFormItem>
        <ElFormItem
          :label="$t('application_header_scopes')"
          required
          prop="scopes"
        >
          <ElSelect v-model="createForm.scopes" multiple>
            <ElOption
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          :label="$t('application_header_redirect_uri')"
          required
          prop="redirectUrisStr"
        >
          <ElInput
            v-model="createForm.redirectUrisStr"
            type="textarea"
            :maxlength="200"
            :show-word-limit="true"
          />
        </ElFormItem>
        <ElFormItem
          :label="$t('application_show_menu')"
          required
          prop="showMenu"
        >
          <ElSelect v-model="createForm.showMenu">
            <ElOption :label="$t('application_true')" :value="true" />
            <ElOption :label="$t('application_false')" :value="false" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="createDialogVisible = false">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="createApplication()">{{
            $t('public_button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.applications-wrap {
  height: 100%;
  .applications-list {
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
.applications-wrap {
  .table-span {
    margin: 0 2px;
    padding: 2px 5px;
    background: #eee;
    border-radius: 3px;
  }
  .el-table .cell .classfy {
    white-space: break-spaces;
    .table-span {
      white-space: pre;
    }
  }
  .applications-form {
    .el-form-item {
      // margin-bottom: 18px;
      .el-form-item__label,
      .el-form-item__content {
        line-height: 28px;
        .el-select {
          width: 100%;
          .el-select__tags {
            max-width: 100% !important;
          }
        }
      }
      .el-form-item__label {
        font-size: var(--font-base-title);
      }
    }
  }
}
</style>
