<template>
  <section class="connection-list-wrap classify-wrap">
    <!-- :title="$t('connection.databaseTittle')"
      :desc="description" -->
    <TablePage
      ref="table"
      row-key="id"
      :classify="{
        authority: 'datasource_catalog_management',
        types: ['database']
      }"
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
          v-show="multipleSelection.length > 0"
          v-readonlybtn="'datasource_category_application'"
          size="mini"
          class="btn"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'datasource_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="checkTestConnectionAvailable"
        >
          <span> {{ $t('connection.createNewDataSource') }}</span>
        </ElButton>
      </div>
      <ElTableColumn type="selection" width="45" :reserve-selection="true"></ElTableColumn>
      <ElTableColumn prop="name" min-width="150" :label="$t('connection.dataBaseName')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div class="connection-name">
            <div class="database-img">
              <img :src="$util.getConnectionTypeDialogImg(scope.row.database_type)" />
            </div>
            <div class="database-text">
              <ElLink type="primary" style="display: block; line-height: 20px" @click.stop="preview(scope.row)">
                {{ scope.row.name }}
              </ElLink>
              <div class="region-info">{{ scope.row.regionInfo }}</div>
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('connection.connectionInfo')" min-width="150">
        <template slot-scope="scope">
          {{ scope.row.connectionUrl }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" :label="$t('connection.dataBaseStatus')" width="100">
        <template #default="{ row }">
          <div>
            <span :class="['status-connection-' + row.status, 'status-block']">
              {{ $t('connection.status.' + row.status) }}
            </span>
            <!--            <span v-if="['invalid'].includes(scope.row.status)" class="error">-->
            <!--              <i class="connections-status__icon el-icon-error"></i>-->
            <!--              <span>-->
            <!--                {{ $t('connection.status.invalid') }}-->
            <!--              </span>-->
            <!--            </span>-->
            <!--            <span v-if="['ready'].includes(scope.row.status)" class="success">-->
            <!--              <i class="connections-status__icon el-icon-success"></i>-->
            <!--              <span>-->
            <!--                {{ $t('connection.status.ready') }}-->
            <!--              </span>-->
            <!--            </span>-->
            <!--            <span v-if="['testing'].includes(scope.row.status)" class="warning">-->
            <!--              <VIcon class="connections-status__icon">loading-circle</VIcon>-->
            <!--              <span>-->
            <!--                {{ $t('connection.status.testing') }}-->
            <!--              </span>-->
            <!--            </span>-->
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="connection_type" width="160" :label="$t('connection.connectionType')">
        <template slot-scope="scope">
          {{ $t('connection.type.' + scope.row.connection_type) }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="160">
        <div slot="header">
          {{ $t('connection_list_column_schema_status') }}
          <ElTooltip placement="top" :content="$t('connection_list_column_schema_status_tips')">
            <VIcon class="color-primary" size="14">info</VIcon>
          </ElTooltip>
        </div>
        <template slot-scope="scope">
          <SchemaProgress :data="scope.row"></SchemaProgress>
        </template>
      </ElTableColumn>
      <ElTableColumn width="160" prop="last_updated" sortable="custom" :label="$t('connection.lastUpdateTime')">
        <template slot-scope="scope">
          {{ scope.row.lastUpdateTime }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="220" fixed="right" :label="$t('connection.operate')">
        <template slot-scope="scope">
          <ElButton type="text" @click="testConnection(scope.row)">{{ $t('connection_list_test_button') }} </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            v-readonlybtn="'datasource_edition'"
            type="text"
            :disabled="$disabledByPermission('datasource_edition_all_data', scope.row.user_id)"
            @click="edit(scope.row.id, scope.row.database_type, scope.row)"
            >{{ $t('button_edit') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'datasource_edition'"></ElDivider>
          <ElButton
            v-readonlybtn="'datasource_creation'"
            type="text"
            :loading="scope.row.copyLoading"
            @click="copy(scope.row)"
            >{{ $t('button_copy') }}
          </ElButton>
          <ElDivider direction="vertical" v-readonlybtn="'datasource_creation'"></ElDivider>
          <ElButton
            v-readonlybtn="'datasource_delete'"
            type="text"
            :disabled="$disabledByPermission('datasource_delete_all_data', scope.row.user_id)"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <Preview ref="preview"></Preview>
    <DatabaseTypeDialog
      :dialogVisible="dialogDatabaseTypeVisible"
      @dialogVisible="handleDialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
    <Test
      ref="test"
      :dialogTestVisible.sync="dialogTestVisible"
      :formData="testData"
      @returnTestData="returnTestData"
    ></Test>
  </section>
</template>
<script>
import SchemaProgress from 'web-core/components/SchemaProgress'
import TablePage from '@/components/TablePage'
import VIcon from '@/components/VIcon'
import DatabaseTypeDialog from './DatabaseTypeDialog'
import Preview from './Preview.vue'
import { defaultModel, verify, desensitization } from './util'
import Test from './Test'
import FilterBar from '@/components/filter-bar'
import { TYPEMAP } from 'web-core/const'

let timeout = null

export default {
  components: { TablePage, DatabaseTypeDialog, Preview, Test, VIcon, SchemaProgress, FilterBar },
  data() {
    return {
      filterItems: [],
      user_id: this.$cookie.get('user_id'),
      dialogDatabaseTypeVisible: false,
      multipleSelection: [],
      tableData: [],
      databaseType: '',
      id: '',
      description: '',
      order: 'last_updated DESC',
      databaseModelOptions: [
        {
          label: this.$t('connection_list_source'),
          value: 'source'
        },
        {
          label: this.$t('connection_list_target'),
          value: 'target'
        },
        {
          label: this.$t('connection_list_source_and_target'),
          value: 'source_and_target'
        }
      ],
      databaseStatusOptions: [
        {
          label: this.$t('connection_list_all_status'),
          value: ''
        },
        {
          label: this.$t('connection_list_efficient'),
          value: 'ready'
        },
        {
          label: this.$t('connection_list_invalidation'),
          value: 'invalid'
        },
        {
          label: this.$t('connection_list_testing'),
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
      allowDataType: window.getSettingByKey('ALLOW_CONNECTION_TYPE'),
      sourceTypeOptions: [
        { label: 'RDS实例', value: 'rds' },
        { label: '云外自建数据库', value: 'selfDB' },
        { label: 'DDS实例', value: 'dds' },
        { label: 'ECS自建库', value: 'ecs' }
      ],
      sourceTypeMapping: {
        rds: 'RDS实例',
        selfDB: '云外自建数据库',
        ecs: 'ECS自建库',
        dds: 'DDS实例'
      },
      testData: null,
      dialogTestVisible: false // 连接测试框
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
      ` <a style="color: #48B6E2" href="${helpUrl}/data-source">` + this.$t('connection_list_help_doc') + '</a>'

    this.description = this.$t('connection_list_desc') + guideDoc
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
    this.getFilterItems()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
    let query = this.$route.query
    if (query.step) {
      this.handleGuide()
    }
    if (query?.action === 'create') {
      this.checkTestConnectionAvailable()
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
      let region = this.$route.query.region
      let { current, size } = page
      let { keyword, databaseType, databaseModel, status, sourceType } = this.searchParams
      let where = {}
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        // let filterObj = { like: verify(keyword), options: 'i' };
        // where.or = [{ name: filterObj }, { database_uri: filterObj }, { database_host: filterObj }];
        where.name = { like: verify(keyword), options: 'i' }
      }
      where.database_type = {
        in: window.getSettingByKey('ALLOW_CONNECTION_TYPE').split(',')
      }
      region && (where['platformInfo.region'] = region)
      databaseType && (where.database_type = databaseType)
      // if (databaseType === 'maria' || databaseType === 'mysqlpxc') {
      // 	where.search_databaseType = databaseType;
      // 	where.database_type = 'mysql';
      // }
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
      return this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let list = res.data?.items || []
          this.table.setCache({
            databaseType,
            keyword,
            databaseModel,
            status,
            panelFlag: true,
            sourceType
          })
          return {
            total: res.data?.total,
            data: list.map(item => {
              let platformInfo = item.platformInfo
              if (platformInfo && platformInfo.regionName) {
                item.regionInfo = platformInfo.regionName + ' ' + platformInfo.zoneName
              }
              if (item.database_type !== 'mongodb') {
                item.connectionUrl = ''
                if (item.database_username) {
                  item.connectionUrl += item.database_username + ':***@'
                }
                item.connectionUrl += item.database_host + ':' + item.database_port
              } else {
                item.connectionUrl = item.database_uri || item.connection_name
              }
              if (item.database_type === 'mq' && item.mqType === '0') {
                item.connectionUrl = item.brokerURL
              }
              // 不存在uri 和 port === 0
              if (!item.database_uri && !item.database_port && item.mqType !== '0') {
                item.connectionUrl = ''
              }
              if (item.database_type === 'kudu') {
                item.connectionUrl = item.database_host
              }
              if (item.database_type === 'kafka') {
                item.connectionUrl = item.kafkaBootstrapServers
              }
              item.connectionSource = this.sourceTypeMapping[item.sourceType]
              item.lastUpdateTime = this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },
    getImgByType(type) {
      // if (!type || type === 'jira') {
      //   type = 'default'
      // }
      type = 'default'
      return require(`@/assets/images/databaseType/${type.toLowerCase()}.png`)
    },
    //列表全选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    preview(row) {
      this.$refs.preview.open(row)
    },
    edit(id, type, item) {
      if (item.search_databaseType) {
        type = item.search_databaseType
      }
      this.$router.push({
        name: 'connectionsEdit',
        params: {
          id: id,
          databaseType: type
        },
        query: {
          databaseType: type
        }
      })
    },
    copy(data) {
      let headersName = { 'lconname-name': data.name }
      this.$set(data, 'copyLoading', true)
      this.$api('connections')
        .copy(
          data.id,
          {
            uri: `${data.id}/copy`,
            headers: headersName
          },
          data.name
        )
        .then(res => {
          if (res && res.data) {
            this.table.fetch()
            this.$message.success(this.$t('connection.copyMsg'))
          }
        })
        .catch(err => {
          if (err && err.response) {
            if (err.response.msg === 'duplicate source') {
              this.$message.error(this.$t('connection.copyFailedMsg'))
            }
          }
        })
      // .finally(() => {
      //   this.$set(data, 'copyLoading', false)
      // })
    },
    remove(data) {
      const h = this.$createElement
      let strArr = this.$t('connection.deteleDatabaseMsg').split('xxx')
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          data.name
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
        this.$api('connections')
          .deleteConnection(data.id, data.name)
          .then(res => {
            let jobs = res.jobs || []
            let modules = res.modules || []
            if (jobs.length > 0 || modules.length > 0) {
              this.$message.error(this.$t('connection.checkMsg'))
            } else {
              this.$message.success(this.$t('message.deleteOK'))
              this.table.fetch()
            }
          })
          .catch(err => {
            let msg = err?.data?.message
            if (msg && (msg.jobs || msg.modules)) {
              this.$message.error(this.$t('connection.cannot_delete_remind'))
              // const h = this.$createElement;
              // this.$message.error(
              // 	h('div', {}, [
              // 		h('div', {}, ['数据源 ', h('span', {}, data.name), ' 被以下资源占用']),
              // 		...msg.jobs.map(j => h('div', {}, [])),
              // 		...msg.modules.map(j => h('div', {}, []))
              // 	])
              // );
            } else if (err?.data?.code === 'Datasource.LinkJobs') {
              this.$message.error(this.$t('connection_list_delete_link_job'))
            } else {
              this.$message.error(msg || this.$t('connection.deleteFail'))
            }
            resFlag.closeLoading()
          })
      })
    },
    // //公用弹窗
    // confirm(callback, catchCallback, config) {
    //   this.$confirm(config.Message + config.name + '?', config.title, {
    //     confirmButtonText: config.confirmButtonText,
    //     cancelButtonText: config.cancelButtonText,
    //     type: 'warning',
    //     closeOnClickModal: false
    //   }).then(resFlag => {
    //     if (resFlag) {
    //       callback()
    //     } else {
    //       catchCallback()
    //     }
    //   })
    // },
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
    formatterListTags(row) {
      let listTags = row.listtags || []
      return listTags.map(tag => tag.value).join(',')
    },
    formatterDatabaseType(row) {
      let url = null
      if (['mongodb', 'gridfs'].includes(row.database_type)) {
        url = desensitization(row.database_uri)
      } else {
        url = row.database_host
      }
      return url
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
      this.$api('connections')
        .batchUpdateListtags(attributes)
        .then(() => {
          this.table.fetch()
          this.$message.success(this.$t('message_save_ok'))
        })
        .catch(() => {
          this.$message.error(this.$t('message_save_fail'))
        })
    },
    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(type) {
      this.handleDialogDatabaseTypeVisible()
      this.$router.push({
        name: 'connectionsCreate',
        query: {
          databaseType: type
        }
      })
    },

    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      this.$root.checkAgent(() => {
        this.dialogDatabaseTypeVisible = true
      })
    },
    async testConnection(item) {
      this.$root.checkAgent(() => {
        let loading = this.$loading()
        this.testData = Object.assign({}, defaultModel['default'], item)
        if (['gridfs', 'mongodb'].includes(item.database_type)) {
          delete this.testData.database_uri
          this.testData.justTest = true
        }
        if (item.database_type !== 'redis') {
          delete this.testData['database_password']
        }
        this.$api('connections')
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
          .finally(() => {
            loading.close()
          })
      })
    },
    returnTestData(data) {
      if (!data.status || data.status === null) return
      let status = data.status
      if (status === 'ready') {
        this.$message.success(this.$t('connection.testConnection') + this.$t('connection.status.ready'), false)
      } else {
        this.$message.error(this.$t('connection.testConnection') + this.$t('connection.status.invalid'), false)
      }
      this.table.fetch()
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('connection_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.databaseStatusOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('connection_list_form_sync_type'),
          key: 'databaseModel',
          type: 'select-inner',
          items: this.databaseModelOptions
        },
        {
          label: this.$t('connection_list_form_database_type'),
          key: 'databaseType',
          type: 'select-inner',
          menuMinWidth: '250px',
          items: async () => {
            let res = await this.$api('connections').getDataTypes()
            let databaseTypes = res?.data || []
            let databaseTypeOptions = databaseTypes.sort((t1, t2) =>
              t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1
            )
            return databaseTypeOptions.map(item => {
              return {
                label: TYPEMAP[item],
                value: item
              }
            })
          }
        },
        {
          placeholder: this.$t('task_list_search_placeholder'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.connection-list-wrap {
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

  .database-img {
    //border: 1px solid #dedee4;
    vertical-align: middle;
    width: 40px;
    height: 40px;
    //background: map-get($bgColor, white);
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    float: left;

    img {
      width: 24px;
    }
  }

  .database-text {
    width: 70%;
    white-space: nowrap;
    word-break: break-word;
    text-overflow: ellipsis;
    float: left;
    margin-left: 4px;

    .name {
      color: map-get($color, primary);
      cursor: pointer;
    }

    .name:hover {
      text-decoration: underline;
    }

    div {
      line-height: 14px;
    }

    .user {
      color: map-get($fontColor, slight);
      white-space: nowrap;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .region-info {
      line-height: 20px;
      color: map-get($fontColor, light);
    }
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
