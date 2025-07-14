<script>
import {
  createApiClient,
  deleteApiClient,
  fetchApiClients,
  roleApi,
  updateApiClient,
} from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import { cloneDeep, escapeRegExp } from 'lodash-es'
import { h } from 'vue'

export default {
  name: 'Applications',
  components: {
    PageContainer,
    TablePage,
    FilterBar,
  },
  data() {
    return {
      searchParams: {
        keyword: '',
      },
      filterItems: [],
      order: 'clientName DESC',
      createDialogVisible: false,
      roles: [],
      createForm: {
        clientName: '',
        grantTypes: [],
        clientSecret: '',
        scopes: [],
        redirectUris: [],
        redirectUrisStr: '',
        showMenu: true,
      },
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  created() {
    this.getFilterItems()
    this.getRoles()
  },
  methods: {
    // 重置查询条件
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
        }
      }
      this.table.fetch(1)
    },
    // 创建
    openCreateDialog() {
      this.createDialogVisible = true
      this.createForm = {
        clientName: '',
        grantTypes: ['implicit', 'client_credentials'],
        clientSecret: '',
        scopes: [],
        redirectUris: [],
        redirectUrisStr: '',
        showMenu: true,
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.form.clearValidate()
        }, 50)
      })
    },
    // 编辑
    edit(item) {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      Object.assign(this.createForm, item)
    },
    // 移除
    remove(item) {
      const message = h('p', [
        `${this.$t('public_message_delete_confirm')} ${item.name}`,
      ])
      this.$confirm(this.$t('public_message_title_prompt'), message).then(
        (resFlag) => {
          if (!resFlag) {
            return
          }
          deleteApiClient(item.id).then(() => {
            this.$message.success(this.$t('public_message_delete_ok'))
            this.table.fetch()
          })
        },
      )
    },
    // 保存
    createApplication() {
      const method = this.createForm.id ? updateApiClient : createApiClient
      const params = cloneDeep(this.createForm)
      params.name = this.createForm.clientName
      params.tokenType = 'jwt'
      params.clientType = 'public'
      params.responseTypes = ['token']
      params.redirectUris = params.redirectUrisStr?.split(',') || []
      delete params.redirectUrisStr

      this.$refs.form.validate((valid) => {
        if (valid) {
          method(params).then(() => {
            this.table.fetch()
            this.createDialogVisible = false
            this.$message.success(this.$t('public_message_save_ok'))
          })
        }
      })
    },
    // 获取密钥
    generatorSecret() {
      const S4 = function () {
        return (((1 + Math.random()) * 0x40000) | 0).toString(16).slice(1)
      }
      const NewGuid = function () {
        return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
      }
      this.createForm.clientSecret = NewGuid()
      // return NewGuid()
    },
    // 获取数据
    getData({ page }) {
      const { current, size } = page
      const { keyword } = this.searchParams
      const where = {}
      if (keyword && keyword.trim()) {
        const filterObj = { like: escapeRegExp(keyword), options: 'i' }
        where.or = [{ clientName: filterObj }]
      }

      const filter = {
        order: this.order,
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
    },
    // 获取角色
    getRoles() {
      const filter = {
        limit: 500,
        skip: 0,
      }
      roleApi.get({ filter: JSON.stringify(filter) }).then((data) => {
        this.roles = data?.items || []
      })
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: this.$t('modules_name_placeholder'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-readonlybtn="'API_creation'"
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
      <template #search>
        <div class="search-bar">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </div>
      </template>

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
      :title="$t('application_create')"
      :close-on-click-modal="false"
    >
      <ElForm
        ref="form"
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
