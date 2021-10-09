<template>
  <section class="applications-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="applications-list"
      :title="$t('app.menu.' + $route.name)"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('api_asnalysis_name')"
              @input="table.fetch(1, 800)"
            >
              <el-select style="width: 120px" slot="prepend" v-model="searchParams.isFuzzy" @input="table.fetch(1)">
                <el-option :label="$t('query_fuzzy')" :value="true"></el-option>
                <el-option :label="$t('query_precise')" :value="false"></el-option>
              </el-select>
            </el-input>
          </li>
          <template v-if="searchParams.keyword">
            <li>
              <el-button size="mini" type="text" @click="reset()">{{ $t('button_query') }}</el-button>
            </li>
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{ $t('button_reset') }}</el-button>
            </li>
          </template>
        </ul>
      </div>
      <div slot="operation">
        <el-button v-readonlybtn="'API_creation'" class="btn btn-create" size="mini" @click="openCreateDialog">
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('application_create') }}</span>
        </el-button>
      </div>
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
        :show-overflow-tooltip="true"
        prop="grantTypes"
        sortable="grantTypes"
        min-width="160"
        max-width="300"
      >
        <template slot-scope="scope">
          <span v-for="item in scope.row.grantTypes" :key="item" class="table-span">{{ item }}</span>
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
        prop="redirectURIs"
        sortable="redirectURIs"
        min-width="140"
      >
      </el-table-column>
      <el-table-column :label="$t('application_header_scopes')" prop="scopes" min-width="160" max-width="300">
        <template slot-scope="scope">
          <span v-for="item in scope.row.scopes" :key="item" class="table-span">{{ item }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operator')" min-width="120">
        <template slot-scope="scope">
          <el-button v-readonlybtn="'API_clients_amangement'" size="mini" type="text" @click="edit(scope.row)">
            {{ $t('modules_edit') }}
          </el-button>
          <el-button
            v-readonlybtn="'API_clients_amangement'"
            v-if="scope.row.clientName !== 'Data Explorer'"
            size="mini"
            type="text"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建客户端 -->
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('metadata.createNewModel')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <el-form ref="form" :model="createForm" class="applications-form" label-width="100px">
        <el-form-item :label="$t('application_header_client_name')" required>
          <el-input v-model="createForm.clientName" size="mini"></el-input>
        </el-form-item>
        <el-form-item :label="$t('application_header_grant_type')" required>
          <el-select v-model="createForm.grantTypes" multiple size="mini">
            <el-option label="Implicit" value="implicit"></el-option>
            <el-option label="Client Credentials" value="client_credentials"></el-option>
            <el-option label="Refresh Token" value="refresh_token"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('application_header_client_secret')" required>
          <el-col :span="20">
            <el-input v-model="createForm.clientSecret" size="mini"></el-input>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <el-button type="primary" size="mini" @click="generatorSecret">{{ $t('application_generator') }}</el-button>
          </el-col>
        </el-form-item>
        <el-form-item :label="$t('application_header_scopes')" required>
          <el-select v-model="createForm.scopes" multiple size="mini">
            <el-option v-for="item in roles" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('application_header_redirect_uri')" required>
          <el-input v-model="createForm.redirectURIs" size="mini" :maxlength="200" :showWordLimit="true"></el-input>
        </el-form-item>
        <el-form-item :label="$t('application_show_menu')" required>
          <el-select v-model="createForm.showMenu" size="mini">
            <el-option :label="$t('application_true')" :value="true"></el-option>
            <el-option :label="$t('application_false')" :value="false"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" @click="createApplication()" size="small">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'

export default {
  name: 'Applications',
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true
      },
      order: 'clientName DESC',
      createDialogVisible: false,
      roles: [],
      createForm: {
        clientName: '',
        grantTypes: [],
        clientSecret: '',
        scopes: [],
        redirectURIs: '',
        showMenu: true
      }
    }
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
    let cache = this.table.getCache()
    cache.isFuzzy = cache.isFuzzy === true
    this.searchParams = cache

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
          keyword: '',
          isFuzzy: true
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
        redirectURIs: '',
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
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#409EFF' } }, item.name)
      ])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$api('Application')
          .delete(item.id, item.name)
          .then(() => {
            this.$message.success(this.$t('message_delete_ok'))
            this.table.fetch()
          })
          .catch(() => {
            this.$message.info(this.$t('message_delete_fail'))
          })
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
          this.$api('Application')
            [method](params)
            .then(res => {
              if (res) {
                this.table.fetch()
                this.createDialogVisible = false
                this.$message.success(this.$t('message_save_ok'))
              }
            })
            .catch(() => {
              this.$message.error(this.$t('message_save_fail'))
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
      let { isFuzzy, keyword } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword
        where.or = [{ clientName: filterObj }]
      }

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('Application').count({ where: JSON.stringify(where) }),
        this.$api('Application').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        this.table.setCache({
          isFuzzy,
          keyword
        })
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    // 获取角色
    getRoles() {
      this.$api('role')
        .get({})
        .then(res => {
          if (res) {
            this.roles = res.data
          }
        })
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
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
  .applications-form {
    .el-form-item {
      margin-bottom: 18px;
      .el-form-item__label,
      .el-form-item__content {
        line-height: 28px;
      }
      .el-form-item__label {
        font-size: 12px;
      }
    }
  }
}
</style>
