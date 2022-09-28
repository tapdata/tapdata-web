<template>
  <section class="connection-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      :classify="
        isDaas
          ? {
              authority: 'datasource_catalog_management',
              types: ['database']
            }
          : null
      "
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton
          v-if="isDaas"
          v-show="multipleSelection.length > 0"
          v-readonlybtn="'datasource_category_application'"
          size="mini"
          class="btn"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('packages_business_dataFlow_taskBulkTag') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'datasource_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="checkTestConnectionAvailable"
        >
          <span> {{ $t('packages_business_connection_createNewDataSource') }}</span>
        </ElButton>
      </div>
      <ElTableColumn v-if="isDaas" type="selection" width="45" :reserve-selection="true"></ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="name"
        min-width="180"
        :label="$t('packages_business_connection_column_name')"
      >
        <template slot-scope="scope">
          <span class="connection-name">
            <img class="connection-img mr-2" :src="getConnectionIcon(scope.row.pdkHash)" alt="" />
            <ElLink
              class="ellipsis"
              type="primary"
              style="display: block; line-height: 20px"
              @click.stop="preview(scope.row)"
            >
              {{ scope.row.name }}
            </ElLink>
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn show-overflow-tooltip :label="$t('packages_business_connection_connectionInfo')" min-width="200">
        <template slot-scope="scope">
          {{ scope.row.connectionUrl }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" :label="$t('packages_business_connection_dataBaseStatus')" min-width="80">
        <template #default="{ row }">
          <div>
            <span :class="['status-connection-' + row.status, 'status-block']">
              {{ $t('packages_business_connection_status_' + row.status) }}
            </span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="connection_type" min-width="120" :label="$t('packages_business_connection_connectionType')">
        <template slot-scope="scope">
          {{ $t('packages_business_connection_type_' + scope.row.connection_type) }}
        </template>
      </ElTableColumn>
      <ElTableColumn min-width="140">
        <div slot="header" class="flex align-center">
          <span>{{ $t('packages_business_connection_list_column_schema_status') }}</span>
          <ElTooltip
            class="ml-2"
            placement="top"
            :content="$t('packages_business_connection_list_column_schema_status_tips')"
          >
            <VIcon class="color-primary" size="14">info</VIcon>
          </ElTooltip>
        </div>
        <template slot-scope="scope">
          <SchemaProgress :data="scope.row"></SchemaProgress>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="last_updated"
        sortable="last_updated"
        min-width="150"
        :label="$t('packages_business_connection_lastUpdateTime')"
      >
        <template slot-scope="scope">
          {{ scope.row.lastUpdateTime }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="220" :label="$t('packages_business_connection_operate')">
        <template slot-scope="scope">
          <ElButton type="text" @click="testConnection(scope.row)"
            >{{ $t('packages_business_connection_list_test_button') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            v-readonlybtn="'datasource_edition'"
            type="text"
            :disabled="$disabledByPermission('datasource_edition_all_data', scope.row.user_id)"
            @click="edit(scope.row.id, scope.row)"
            >{{ $t('packages_business_button_edit') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'datasource_edition'"></ElDivider>
          <ElButton
            v-readonlybtn="'datasource_creation'"
            type="text"
            :loading="scope.row.copyLoading"
            @click="copy(scope.row)"
            >{{ $t('packages_business_button_copy') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'datasource_creation'"></ElDivider>
          <ElButton
            v-readonlybtn="'datasource_delete'"
            type="text"
            :disabled="$disabledByPermission('datasource_delete_all_data', scope.row.user_id)"
            @click="remove(scope.row)"
            >{{ $t('packages_business_button_delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <Preview ref="preview" @test="testConnection"></Preview>
    <DatabaseTypeDialog
      :dialogVisible="dialogDatabaseTypeVisible"
      @dialogVisible="handleDialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
    <Test ref="test" :visible.sync="dialogTestVisible" :formData="testData" @returnTestData="returnTestData"></Test>
    <ElDialog :title="$t('packages_business_connections_list_tishi')" width="40%" :visible.sync="connectionTaskDialog">
      <span>{{ $t('packages_business_connections_list_gailianjieyibei') }}</span>
      <div class="color-primary mt-2">
        {{ $t('packages_business_connections_list_renwuzongshu') }}{{ connectionTaskListTotal }}
      </div>
      <ul class="mt-4">
        <li v-for="item in connectionTaskList" :key="item.id" @click="goTaskList(item)">
          <el-tooltip :content="item.name" placement="right-start">
            <el-link type="primary">{{ item.name }}</el-link>
          </el-tooltip>
        </li>
        <li v-if="connectionTaskListTotal > 10">...</li>
      </ul>
    </ElDialog>
  </section>
</template>
<script>
import dayjs from 'dayjs'

import { connectionsApi, databaseTypesApi } from '@tap/api'
import { VIcon, FilterBar } from '@tap/component'
import Cookie from '@tap/shared/src/cookie'

import { TablePage, SchemaProgress } from '../../components'
import DatabaseTypeDialog from './DatabaseTypeDialog'
import Preview from './Preview'
import Test from './Test'
import { defaultModel, verify, getConnectionIcon } from './util'

let timeout = null

export default {
  components: { TablePage, DatabaseTypeDialog, Preview, Test, VIcon, SchemaProgress, FilterBar },
  inject: ['checkAgent', 'buried'],
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',

      filterItems: [],
      user_id: Cookie.get('user_id'),
      dialogDatabaseTypeVisible: false,
      multipleSelection: [],
      tableData: [],
      databaseType: '',
      id: '',
      description: '',
      order: 'last_updated DESC',
      databaseModelOptions: [
        {
          label: this.$t('packages_business_select_option_all'),
          value: ''
        },
        {
          label: this.$t('packages_business_connection_list_source'),
          value: 'source'
        },
        {
          label: this.$t('packages_business_connection_list_target'),
          value: 'target'
        },
        {
          label: this.$t('packages_business_connection_list_source_and_target'),
          value: 'source_and_target'
        }
      ],
      databaseStatusOptions: [
        {
          label: this.$t('packages_business_select_option_all'),
          value: ''
        },
        {
          label: this.$t('packages_business_connection_list_efficient'),
          value: 'ready'
        },
        {
          label: this.$t('packages_business_connection_list_invalidation'),
          value: 'invalid'
        },
        {
          label: this.$t('packages_business_connection_list_testing'),
          value: 'testing'
        }
      ],
      databaseTypeOptions: [],
      searchParams: {
        databaseType: '',
        keyword: '',
        databaseModel: '',
        status: '',
        panelFlag: true,
        sourceType: ''
      },
      testData: null,
      dialogTestVisible: false, // 连接测试框
      connectionTaskList: [],
      connectionTaskListTotal: 0,
      connectionTaskDialog: false
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  created() {
    let helpUrl = 'https://docs.tapdata.net'
    let guideDoc =
      ` <a style="color: #48B6E2" href="${helpUrl}/data-source">` +
      this.$t('packages_business_connection_list_help_doc') +
      '</a>'

    this.description = this.$t('packages_business_connection_list_desc') + guideDoc
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
    this.getFilterItems()
  },
  mounted() {
    const { step, action, keyword } = this.$route.query || {}
    if (step) {
      this.handleGuide()
    }
    if (action === 'create') {
      this.checkTestConnectionAvailable()
    }
    if (keyword) {
      this.searchParams.keyword = keyword
    }
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    // 存在测试中，重新加载数据
    reloadDataOnTesting(data) {
      let flag = false
      data.forEach(el => {
        if (el.status === 'testing') {
          flag = true
        }
      })
      flag &&
        setTimeout(() => {
          this.table.fetch(null, 0, true, value => {
            this.reloadDataOnTesting(value)
          })
        }, 3000)
    },
    //兼容新手引导
    handleGuide() {
      let item = {
        visible: true,
        step: this.$route.query.step ? Number(this.$route.query.step) + 1 : 0
      }
      window.parent && window.parent.noviceGuideChange && window.parent.noviceGuideChange(item)
      this.$router.push({
        name: 'connections'
      })
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },

    getData({ page, tags }) {
      let { current, size } = page
      let { keyword, databaseType, databaseModel, status, sourceType } = this.searchParams
      let where = {}
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        where.name = { like: verify(keyword), options: 'i' }
      }
      databaseType && (where.database_type = databaseType)
      databaseModel && (where.connection_type = databaseModel)
      sourceType && (where.sourceType = sourceType)
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      status && (where.status = status)
      let filter = {
        order: this.order,
        limit: size,
        noSchema: 1,
        //fields: fields, //传noSchema 过滤schema
        skip: (current - 1) * size,
        where
      }
      return connectionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = (data?.items || []).map(item => {
            if (item.connectionString) {
              item.connectionUrl = item.connectionString
            } else {
              if (item.config?.uri) {
                const regResult =
                  /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/gm.exec(
                    item.config.uri
                  )
                if (regResult && regResult.groups && regResult.groups.password) {
                  const { username, host, database, query } = regResult.groups
                  item.connectionUrl = `mongodb://${username}:***@${host}/${database}${query ? '/' + query : ''}`
                } else {
                  item.connectionUrl = item.config.uri
                }
              } else if (item.config) {
                const { host, port, database, schema } = item.config
                item.connectionUrl = host
                  ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
                  : ''
              }
            }

            item.lastUpdateTime = item.last_updated = item.last_updated
              ? dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
              : '-'
            return item
          })

          // 同步抽屉数据
          this.$refs.preview.sync(list)
          return {
            total: data?.total,
            data: list
          }
        })
    },
    getImgByType(type) {
      // if (!type || type === 'jira') {
      //   type = 'default'
      // }
      type = 'default'
      return require(`@tap/assets/images/databaseType/${type.toLowerCase()}.png`)
    },
    //列表全选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    preview(row) {
      this.$refs.preview.open(row)
    },
    edit(id, item) {
      const { pdkHash } = item
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionsEdit',
        params: {
          id: id
        },
        query
      })
    },
    copy(data) {
      let headersName = { 'lconname-name': data.name }
      this.$set(data, 'copyLoading', true)
      connectionsApi
        .copy(
          data.id,
          {
            uri: `${data.id}/copy`,
            headers: headersName
          },
          data.name
        )
        .then(() => {
          this.table.fetch()
          this.$message.success(this.$t('packages_business_connection_copyMsg'))
        })
      // .catch(err => {
      //   if (err && err.response) {
      //     if (err.response.msg === 'duplicate source') {
      //       this.$message.error(this.$t('packages_business_connection_copyFailedMsg'))
      //     }
      //   }
      // })
    },
    remove(row) {
      const h = this.$createElement
      let strArr = this.$t('packages_business_connection_deteleDatabaseMsg').split('xxx')
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          row.name
        ),
        strArr[1]
      ])
      this.$confirm(msg, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        //检查该连接是否被已有任务使用
        connectionsApi.checkConnectionTask(row.id).then(data => {
          if (data?.items?.length === 0) {
            connectionsApi.delete(row.id).then(data => {
              let jobs = data?.jobs || []
              let modules = data?.modules || []
              if (jobs.length > 0 || modules.length > 0) {
                this.$message.error(this.$t('packages_business_connection_checkMsg'))
              } else {
                this.$message.success(this.$t('packages_business_message_deleteOK'))
                this.table.fetch()
              }
            })
          } else {
            //展示已使用的任务列表
            this.connectionTaskList = data?.items || []
            this.connectionTaskListTotal = data?.total || 0
            this.connectionTaskDialog = true
          }
        })
      })
    },
    //跳转到任务列表
    goTaskList(item) {
      if (item?.syncType === 'migrate') {
        this.$router.push({
          name: 'migrateList',
          query: {
            keyword: item.name
          }
        })
      } else {
        this.$router.push({
          name: 'dataflow',
          query: {
            keyword: item.name
          }
        })
      }
    },
    //表格数据格式化
    formatterConnectionType(row) {
      switch (row.connection_type) {
        case 'target':
          return 'Target'
        case 'source':
          return 'Source'
        case 'source_and_target':
          return 'Source | Target'
      }
    },
    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.listtags && row.listtags.length > 0) {
          tagList[row.listtags[0].id] = {
            value: row.listtags[0].value
          }
        }
      })
      return tagList
    },
    handleOperationClassify(listtags) {
      let attributes = {
        id: this.multipleSelection.map(r => r.id),
        listtags
      }
      connectionsApi.batchUpdateListtags(attributes).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('packages_business_message_save_ok'))
      })
    },
    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(item) {
      this.handleDialogDatabaseTypeVisible()
      const { pdkHash } = item
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionCreate',
        query
      })
    },

    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      this.buried('connectionCreateDialog')
      this.checkAgent(() => {
        this.dialogDatabaseTypeVisible = true
      })
    },
    async testConnection(item) {
      this.buried('connectionTest')
      this.checkAgent(() => {
        let loading = this.$loading()
        this.testData = Object.assign({}, defaultModel['default'], item)
        connectionsApi
          .updateById(
            item.id,
            Object.assign(
              {},
              {
                status: 'testing'
              }
            )
          )
          .then(() => {
            this.dialogTestVisible = true
            this.$refs.test.start()
            this.table.fetch()
          })
          .catch(() => {
            this.buried('connectionTestFail')
          })
          .finally(() => {
            loading.close()
          })
      }).catch(() => {
        this.buried('connectionTestAgentFail')
      })
    },
    returnTestData(data) {
      if (!data.status || data.status === null) return
      let status = data.status
      if (status === 'ready') {
        this.$message.success(
          this.$t('packages_business_connection_testConnection') + this.$t('packages_business_connection_status_ready'),
          false
        )
      } else {
        this.$message.error(
          this.$t('packages_business_connection_testConnection') +
            this.$t('packages_business_connection_status_invalid'),
          false
        )
      }
      this.buried('connectionTest', '', {
        result: status === 'ready'
      })
      this.table.fetch()
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_connection_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.databaseStatusOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('packages_business_connection_list_type'),
          key: 'databaseModel',
          type: 'select-inner',
          items: this.databaseModelOptions
        },
        {
          label: this.$t('packages_business_connection_list_form_database_type'),
          key: 'databaseType',
          type: 'select-inner',
          menuMinWidth: '250px',
          items: async () => {
            let data = await databaseTypesApi.get()
            data = data || []
            let databaseTypes = []
            databaseTypes.push(...data)
            let databaseTypeOptions = databaseTypes.sort((t1, t2) =>
              t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1
            )
            //默认全部
            let all = {
              name: this.$t('packages_business_select_option_all'),
              type: ''
            }
            databaseTypeOptions.unshift(all)
            return databaseTypeOptions.map(item => {
              return {
                label: item.name,
                value: item.type
              }
            })
          }
        },
        {
          placeholder: this.$t('packages_business_connection_list_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    getConnectionIcon() {
      return getConnectionIcon(...arguments)
    }
  }
}
</script>
<style lang="scss" scoped>
.connection-list-wrap {
  height: 100%;
  overflow: hidden;
  ::v-deep {
    .el-select-dropdown__item {
      span {
        font-size: 12px;
      }
    }
  }

  .connection-name {
    display: flex;
    align-items: center;
  }

  .connection-img {
    width: 18px;
  }

  .btn-text {
    // color: map-get($color, primary);
    font-size: 12px;
    padding-right: 5px;
  }

  .tag {
    padding: 0 3px 2px 3px;
    line-height: 12px;
    font-size: 12px;
    font-weight: 400;
    color: map-get($fontColor, light);
    background: map-get($bgColor, main);
    border: 1px solid #dedee4;
    border-radius: 3px;
    margin-left: 5px;
  }

  .error {
    color: #f56c6c;
  }

  .success {
    color: #67c23a;
  }

  .warning {
    color: #e6a23c;
  }

  .connections-status__icon {
    font-size: 14px;
  }

  .search-bar {
    display: flex;

    .item {
      margin-right: 10px;
    }
  }

  .btn + .btn {
    margin-left: 5px;
  }

  .btn {
    i.iconfont {
      font-size: 12px;
    }

    &.btn-dropdowm {
      margin-left: 5px;
    }

    &.btn-create {
      margin-left: 5px;
    }
  }
}
</style>
