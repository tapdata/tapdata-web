<template>
  <section class="applications-wrap h-100">
    <!-- api客户端 -->
    <TablePage
      ref="table"
      row-key="id"
      class="applications-list"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="search" class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <!--<div slot="operation">
        <ElButton
          v-readonlybtn="'API_creation'"
          class="btn btn-create"
          size="mini"
          type="primary"
          @click="openCreateDialog"
        >
          <span>{{ $t('application_create') }}</span>
        </ElButton>
      </div>-->
      <el-table-column :label="$t('application_header_id')" :show-overflow-tooltip="true" prop="id" width="220">
        <!-- <template slot-scope="scope"> -->
      </el-table-column>
      <el-table-column
        :label="$t('application_header_client_name')"
        prop="clientName"
        sortable="clientName"
        width="120"
      >
      </el-table-column>
      <el-table-column
        :label="$t('application_header_grant_type')"
        prop="grantTypes"
        sortable="grantTypes"
        min-width="160"
      >
        <template slot-scope="scope">
          <div class="classfy">
            <span v-for="item in scope.row.grantTypes" :key="item" class="table-span text-break">{{ item }}</span>
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
      ></el-table-column>
      <el-table-column
        :label="$t('application_header_redirect_uri')"
        :show-overflow-tooltip="true"
        prop="redirectUris"
        sortable="redirectUris"
        min-width="140"
      >
      </el-table-column>
      <el-table-column :label="$t('application_header_scopes')" prop="scopes" min-width="160" max-width="300">
        <template slot-scope="scope">
          <span v-for="item in scope.row.scopes" :key="item" class="table-span">{{ item }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" min-width="120" fixed="right">
        <template slot-scope="scope">
          <ElButton v-readonlybtn="'API_clients_amangement'" size="mini" type="text" @click="edit(scope.row)">
            {{ $t('modules_edit') }}
          </ElButton>
          <ElButton
            v-readonlybtn="'API_clients_amangement'"
            v-if="scope.row.clientName !== 'Data Explorer'"
            size="mini"
            type="text"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</ElButton
          >
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建客户端 -->
    <ElDialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('application_create')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <ElForm ref="form" :model="createForm" class="applications-form" label-width="100px">
        <ElFormItem :label="$t('application_header_client_name')" required prop="clientName">
          <ElInput v-model="createForm.clientName" size="mini"></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('application_header_grant_type')" required prop="grantTypes">
          <ElSelect v-model="createForm.grantTypes" multiple size="mini">
            <ElOption label="Implicit" value="implicit"></ElOption>
            <ElOption label="Client Credentials" value="client_credentials"></ElOption>
            <ElOption label="Refresh Token" value="refresh_token"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('application_header_client_secret')" required prop="clientSecret">
          <ElCol :span="22">
            <ElInput v-model="createForm.clientSecret" size="mini"></ElInput>
          </ElCol>
          <ElCol :span="2" style="text-align: right">
            <ElButton type="text" size="mini" @click="generatorSecret">{{ $t('application_generator') }}</ElButton>
          </ElCol>
        </ElFormItem>
        <ElFormItem :label="$t('application_header_scopes')" required prop="scopes">
          <ElSelect v-model="createForm.scopes" multiple size="mini">
            <ElOption v-for="item in roles" :label="item.name" :value="item.name" :key="item.id"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('application_header_redirect_uri')" required prop="redirectUris">
          <ElInput
            v-model="createForm.redirectUris"
            type="textarea"
            size="mini"
            :maxlength="200"
            :showWordLimit="true"
          ></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('application_show_menu')" required prop="showMenu">
          <ElSelect v-model="createForm.showMenu" size="mini">
            <ElOption :label="$t('application_true')" :value="true"></ElOption>
            <ElOption :label="$t('application_false')" :value="false"></ElOption>
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="createDialogVisible = false" size="small">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="createApplication()" size="small">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>

<script>
import { roleApi, applicationApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage } from '@tap/business'

import { toRegExp } from '../../utils/util'

export default {
  name: 'Applications',
  components: {
    TablePage,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        keyword: ''
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
        redirectUris: '',
        showMenu: true
      }
    }
  },
  created() {
    this.getFilterItems()
    this.getRoles()
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 重置查询条件
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: ''
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
        clientName: '',
        grantTypes: ['implicit', 'client_credentials'],
        clientSecret: '',
        scopes: [],
        redirectUris: '',
        showMenu: true
      }
    },
    // 编辑
    edit(item) {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = item
    },
    // 移除
    remove(item) {
      const h = this.$createElement
      let message = h('p', [this.$t('message_deleteOrNot') + ' ' + item.name])
      this.$confirm(message, this.$t('message_prompt'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        applicationApi.delete(item.id).then(() => {
          this.$message.success(this.$t('message_delete_ok'))
          this.table.fetch()
        })
        // .catch(() => {
        //   this.$message.info(this.$t('message_delete_fail'))
        // })
      })
    },
    // 保存
    createApplication() {
      const method = this.createForm.id ? 'patch' : 'post'
      const params = this.createForm
      params.name = this.createForm.clientName
      params.tokenType = 'jwt'
      params.clientType = 'public'
      params.responseTypes = ['token']

      this.$refs.form.validate(valid => {
        if (valid) {
          applicationApi[method](params).then(() => {
            this.table.fetch()
            this.createDialogVisible = false
            this.$message.success(this.$t('message_save_ok'))
          })
        }
      })
    },
    // 获取密钥
    generatorSecret() {
      let S4 = function () {
        return (((1 + Math.random()) * 0x40000) | 0).toString(16).substring(1)
      }
      let NewGuid = function () {
        return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
      }
      this.createForm.clientSecret = NewGuid()
      // return NewGuid()
    },
    // 获取数据
    getData({ page }) {
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ clientName: filterObj }]
      }

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return applicationApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total || 0,
            data: data?.items || []
          }
        })
    },
    // 获取角色
    getRoles() {
      roleApi.get({}).then(data => {
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
          type: 'input'
        }
      ]
    }
  }
}
</script>
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
        font-size: $fontBaseTitle;
      }
    }
  }
}
</style>
