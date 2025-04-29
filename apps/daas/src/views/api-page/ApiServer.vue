<script>
import { apiServerApi } from '@tap/api'
import { TablePage } from '@tap/business'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { FilterBar } from '@tap/component'
import Cookie from '@tap/shared/src/cookie'
import { escapeRegExp } from 'lodash-es'
import { h } from 'vue'

export default {
  name: 'ApiServer',
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
      createForm: {
        processId: '',
        clientName: '',
        clientURI: '',
      },
      createFormConfig: {
        form: {
          labelPosition: 'top',
          labelWidth: '180px',
        },
        items: [
          {
            type: 'input',
            label: this.$t('api_server_process_id'),
            field: 'processId',
            show: true,
            required: true,
          },
          {
            type: 'input',
            label: this.$t('api_server_client_name'),
            field: 'clientName',
            show: true,
            required: true,
            maxlength: 100,
            showWordLimit: true,
          },
          {
            type: 'input',
            label: this.$t('api_server_client_uri'),
            field: 'clientURI',
            placeholder: `${this.$t('api_server_client_uri')}(http://127.0.0.1:3080)`,
            show: true,
            required: true,
            maxlength: 200,
            showWordLimit: true,
          },
        ],
        rules: {
          processId: [
            {
              required: true,
              message: `${this.$t('api_server_process_id')} ${this.$t(
                'public_form_not_empty',
              )}`,
              trigger: 'blur',
            },
          ],
          clientName: [
            {
              required: true,
              message: `${this.$t('api_server_client_name')} ${this.$t(
                'public_form_not_empty',
              )}`,
              trigger: 'blur',
            },
          ],
          clientURI: [
            {
              required: true,
              message: `${this.$t('api_server_client_uri')} ${this.$t(
                'public_form_not_empty',
              )}`,
              trigger: 'blur',
            },
          ],
        },
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
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        processId: this.generatorSecret(),
        clientName: '',
        clientURI: '',
      }
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
        `${this.$t('public_message_delete_confirm')} ${item.clientName}`,
      ])
      this.$confirm(message, '', {
        type: 'warning',
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        apiServerApi.delete(item.id).then(() => {
          this.$message.success(this.$t('public_message_delete_ok'))
          this.table.fetch()
        })
        // .catch(() => {
        // })
      })
    },

    // 下载api配置文件
    downloadConfig(item) {
      const token = Cookie.get('access_token')
      window.open(
        `${apiServerApi.url}/download/${item.id}?access_token=${token}`,
        '_blank',
      )
    },

    // 保存
    createServer() {
      const method = this.createForm.id ? 'patch' : 'post'
      const params = this.createForm
      this.$refs.form.validate((valid) => {
        if (valid) {
          apiServerApi[method](params).then(() => {
            this.table.fetch()
            this.createDialogVisible = false
            this.$message.success(this.$t('public_message_save_ok'))
          })
          // .catch(() => {
          // })
        }
      })
    },

    // 自动生成唯一标识
    generatorSecret() {
      const S4 = function () {
        return (((1 + Math.random()) * 0x40000) | 0).toString(16).slice(1)
      }
      const NewGuid = function () {
        return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
      }
      return NewGuid()
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
      return apiServerApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          return {
            total: data?.total || 0,
            data: data?.items || [],
          }
        })
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'clientName'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: this.$t('public_name'),
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
      <el-button
        v-readonlybtn="'API_creation'"
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
        <template #default="scope">
          <el-button
            v-readonlybtn="'API_clients_amangement'"
            text
            type="primary"
            @click="edit(scope.row)"
          >
            {{ $t('public_button_edit') }}
          </el-button>
          <ElDivider class="mx-1" direction="vertical" />
          <el-button
            v-readonlybtn="'API_clients_amangement'"
            text
            type="primary"
            @click="remove(scope.row)"
            >{{ $t('public_button_delete') }}</el-button
          >
          <ElDivider class="mx-1" direction="vertical" />
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('api_server_download_API_Server_config')"
            placement="top"
          >
            <el-button
              v-readonlybtn="'API_clients_amangement'"
              text
              type="primary"
              @click="downloadConfig(scope.row)"
              >{{ $t('public_button_download') }}</el-button
            >
          </el-tooltip>
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建客户端 -->
    <el-dialog
      v-model="createDialogVisible"
      width="600px"
      class="create-dialog"
      :title="
        createForm.id
          ? $t('public_button_edit')
          : $t('api_server_create_server')
      "
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="createForm"
        :label-position="createFormConfig.form.labelPosition"
        :label-width="createFormConfig.form.labelWidth"
        :rules="createFormConfig.rules"
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
