<template>
  <section class="apiserver-wrap section-wrap">
    <!-- api服务器 -->
    <TablePage ref="table" row-key="id" class="apiserver-list" :remoteMethod="getData" @sort-change="handleSortTable">
      <div slot="search" class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <div slot="operation">
        <el-button
          v-readonlybtn="'API_creation'"
          type="primary"
          class="btn btn-create"
          size="mini"
          @click="openCreateDialog"
        >
          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
          <span>{{ $t('api_server_create') }}</span>
        </el-button>
      </div>
      <el-table-column
        :label="$t('api_server_user')"
        :show-overflow-tooltip="true"
        prop="user.email"
        sortable="user.email"
        width="120"
      >
        <template slot-scope="scope">
          {{ scope.row.user ? scope.row.user.email : '' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('api_server_process_id')"
        :show-overflow-tooltip="true"
        prop="processId"
        sortable="processId"
      >
      </el-table-column>
      <el-table-column
        :label="$t('api_server_client_name')"
        :show-overflow-tooltip="true"
        prop="clientName"
        sortable="clientName"
      ></el-table-column>
      <el-table-column
        :label="$t('api_server_client_uri')"
        :show-overflow-tooltip="true"
        prop="clientURI"
        sortable="clientURI"
      >
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="170" fixed="right">
        <template slot-scope="scope">
          <el-button v-readonlybtn="'API_clients_amangement'" size="mini" type="text" @click="edit(scope.row)">
            {{ $t('modules_edit') }}
          </el-button>
          <el-button v-readonlybtn="'API_clients_amangement'" size="mini" type="text" @click="remove(scope.row)">{{
            $t('button_delete')
          }}</el-button>
          <el-tooltip class="item" effect="dark" :content="$t('api_server_download_API_Server_config')" placement="top">
            <el-button
              v-readonlybtn="'API_clients_amangement'"
              size="mini"
              type="text"
              @click="downloadConfig(scope.row)"
              >{{ $t('api_server_download') }}</el-button
            >
          </el-tooltip>
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建客户端 -->
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="createForm.id ? $t('button_edit') : $t('api_server_create_server')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <FormBuilder ref="form" v-model="createForm" :config="createFormConfig"></FormBuilder>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" @click="createServer()" size="small">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import FilterBar from '@/components/filter-bar'
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
import Cookie from '@tap/shared/src/cookie'
import { apiServerApi } from '@tap/api'

export default {
  name: 'ApiServer',
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
      createForm: {
        processId: '',
        clientName: '',
        clientURI: ''
      },
      createFormConfig: {
        form: {
          labelPosition: 'left',
          labelWidth: '140px'
        },
        items: [
          {
            type: 'input',
            label: this.$t('api_server_process_id'),
            field: 'processId',
            show: true,
            required: true
          },
          {
            type: 'input',
            label: this.$t('api_server_client_name'),
            field: 'clientName',
            show: true,
            required: true,
            maxlength: 100,
            showWordLimit: true
          },
          {
            type: 'input',
            label: this.$t('api_server_client_uri'),
            field: 'clientURI',
            placeholder: this.$t('api_server_client_uri') + '(http://127.0.0.1:3080)',
            show: true,
            required: true,
            maxlength: 200,
            showWordLimit: true
          }
        ]
      }
    }
  },
  created() {
    this.getFilterItems()
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
        processId: this.generatorSecret(),
        clientName: '',
        clientURI: ''
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
      let message = h('p', [this.$t('message.deleteOrNot') + ' ' + item.clientName])
      this.$confirm(message, '', {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        apiServerApi.delete(item.id).then(() => {
          this.$message.success(this.$t('message_delete_ok'))
          this.table.fetch()
        })
        // .catch(() => {
        //   this.$message.info(this.$t('message_delete_fail'))
        // })
      })
    },

    // 下载api配置文件
    downloadConfig(item) {
      let token = Cookie.get('token')
      window.open(apiServerApi.url + '/download/' + item.id + '?access_token=' + token, '_blank')
    },

    // 保存
    createServer() {
      const method = this.createForm.id ? 'patch' : 'post'
      const params = this.createForm
      this.$refs.form.validate(valid => {
        if (valid) {
          apiServerApi[method](params).then(() => {
            this.table.fetch()
            this.createDialogVisible = false
            this.$message.success(this.$t('message_save_ok'))
          })
          // .catch(() => {
          //   this.$message.error(this.$t('message_save_fail'))
          // })
        }
      })
    },

    // 自动生成唯一标识
    generatorSecret() {
      let S4 = function () {
        return (((1 + Math.random()) * 0x40000) | 0).toString(16).substring(1)
      }
      let NewGuid = function () {
        return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()
      }
      return NewGuid()
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
      return apiServerApi
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

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'clientName'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: this.$t('api_server_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>
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
