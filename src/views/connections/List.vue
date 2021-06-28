<template>
  <!--TODO 代码合并遇到冲突过多，留意此文件出现的问题！！！-->
  <section class="connection-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      :title="$t('connection.databaseTittle')"
      :desc="description"
      :classify="{
        authority: 'datasource_catalog_management',
        types: ['database']
      }"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <ul class="search-bar" slot="search">
        <li class="item">
          <ElSelect v-model="searchParams.status" size="small" @input="table.fetch(1)">
            <ElOption :label="$t('connection.status.all')" value=""></ElOption>
            <ElOption v-for="item in databaseStatusOptions" :key="item.value" :label="item.label" :value="item.value">
            </ElOption>
          </ElSelect>
        </li>
        <li v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')" class="item">
          <el-select
            v-model="searchParams.databaseModel"
            clearable
            size="small"
            @input="table.fetch(1)"
            :placeholder="$t('connection.connectionType')"
          >
            <el-option v-for="item in databaseModelOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </li>
        <li v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')" class="item">
          <el-select
            v-model="searchParams.databaseType"
            clearable
            size="small"
            @input="table.fetch(1)"
            :placeholder="$t('connection.dataBaseType')"
          >
            <el-option v-for="item in databaseTypeOptions" :key="item.type" :label="item.name" :value="item.type">
            </el-option>
          </el-select>
        </li>
        <li class="item">
          <ElInput
            v-model="searchParams.keyword"
            clearable
            class="input-with-select"
            size="small"
            :placeholder="$t('connection.dataBaseSearch')"
            @input="table.fetch(1, 800)"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </ElInput>
        </li>
        <li class="item">
          <ElButton plain class="btn-refresh" size="small" @click="table.fetch()">
            <i class="el-icon-refresh"></i>
          </ElButton>
        </li>
      </ul>
      <div slot="operation">
        <el-button
          v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
          v-readonlybtn="'datasource_category_application'"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'datasource_creation'"
          class="btn btn-create"
          type="primary"
          size="small"
          @click="checkTestConnectionAvailable"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span> {{ $t('connection.createNewDataSource') }}</span>
        </el-button>
      </div>
      <el-table-column
        v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
        type="selection"
        width="45"
        :reserve-selection="true"
      >
      </el-table-column>
      <el-table-column prop="name" :label="$t('connection.dataBaseName')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div class="connection-name">
            <div class="database-img">
              <img :src="getImgByType(scope.row.database_type)" />
            </div>
            <div class="database-text">
              <!-- TODO: 缺少分类tag -->
              <!-- <span class="name" @click="preview(scope.row.id, scope.row.database_type)"
								>{{ scope.row.name }}
								<span class="tag" v-if="scope.row.listtags && scope.row.listtags.length > 0">{{
									formatterListTags(scope.row)
								}}</span></span
							> -->
              <!-- <div class="user" v-if="scope.row.database_uri">
								{{ formatterDatabaseType(scope.row) }}
							</div> -->
              <ElLink
                type="primary"
                style="display: block; line-height: 20px"
                @click="preview(scope.row.id, scope.row.database_type)"
              >
                {{ scope.row.name }}
              </ElLink>
              <div class="region-info">{{ scope.row.regionInfo }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('connection.connectionInfo')">
        <template slot-scope="scope">
          {{ scope.row.connectionUrl }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('connection.dataBaseStatus')" width="100">
        <template slot-scope="scope">
          <div>
            <span class="error" v-if="['invalid'].includes(scope.row.status)">
              <i class="connections-status__icon el-icon-error"></i>
              <span>
                {{ $t('connection.status.invalid') }}
              </span>
            </span>
            <span class="success" v-if="['ready'].includes(scope.row.status)">
              <i class="connections-status__icon el-icon-success"></i>
              <span>
                {{ $t('connection.status.ready') }}
              </span>
            </span>
            <span class="warning" v-if="['testing'].includes(scope.row.status)">
              <i class="connections-status__icon el-icon-loading"></i>
              <span>
                {{ $t('connection.status.testing') }}
              </span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="connection_type" :label="$t('connection.connectionType')" width="160">
        <template slot-scope="scope">
          {{ $t('connection.type.' + scope.row.connection_type) }}
        </template>
      </el-table-column>
      <el-table-column v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs'" width="160">
        <div slot="header">
          {{ $t('connection.connectionSource') }}
          <TableFilter
            v-model="searchParams.sourceType"
            :options="sourceTypeOptions"
            @input="table.fetch(1)"
          ></TableFilter>
        </div>
        <template slot-scope="scope">
          {{ scope.row.connectionSource }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('connection.lastUpdateTime')" width="160" prop="last_updated" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.lastUpdateTime }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('connection.operate')" width="220">
        <template slot-scope="scope">
          <ElLink type="primary" @click="testConnection(scope.row)">{{ $t('connection.testConnection') }} </ElLink>
          <ElLink
            v-readonlybtn="'datasource_edition'"
            style="margin-left: 10px"
            type="primary"
            :disabled="$disabledByPermission('datasource_edition_all_data', scope.row.user_id)"
            @click="edit(scope.row.id, scope.row.database_type, scope.row)"
            >{{ $t('message.edit') }}
          </ElLink>
          <ElLink
            v-readonlybtn="'datasource_creation'"
            style="margin-left: 10px"
            type="primary"
            @click="copy(scope.row)"
            >{{ $t('message.copy') }}
          </ElLink>
          <ElLink
            v-readonlybtn="'datasource_delete'"
            style="margin-left: 10px"
            type="primary"
            :disabled="$disabledByPermission('datasource_delete_all_data', scope.row.user_id)"
            @click="remove(scope.row)"
            >{{ $t('message.delete') }}
          </ElLink>
        </template>
      </el-table-column>
    </TablePage>
    <Preview
      :id="id"
      :visible="previewVisible"
      :databaseType="databaseType"
      v-on:previewVisible="handlePreviewVisible"
    ></Preview>
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
import TablePage from '@/components/TablePage'
import TableFilter from '@/components/TableFilter'

import DatabaseTypeDialog from './DatabaseTypeDialog'
import Preview from './Preview'
import { defaultModel, verify, desensitization } from './util'
import Test from './Test'

let timeout = null

export default {
  components: { TablePage, TableFilter, DatabaseTypeDialog, Preview, Test },
  data() {
    return {
      user_id: this.$cookie.get('user_id'),
      dialogDatabaseTypeVisible: false,
      previewVisible: false,
      multipleSelection: [],
      tableData: [],
      databaseType: '',
      id: '',
      description: '',
      order: 'createTime DESC',
      databaseModelOptions: [
        {
          label: this.$t('connection.type.source'),
          value: 'source'
        },
        {
          label: this.$t('connection.type.target'),
          value: 'target'
        },
        {
          label: this.$t('connection.type.source_and_target'),
          value: 'source_and_target'
        }
      ],
      databaseStatusOptions: [
        {
          label: this.$t('connection.status.ready'),
          value: 'ready'
        },
        {
          label: this.$t('connection.status.invalid'),
          value: 'invalid'
        },
        {
          label: this.$t('connection.status.testing'),
          value: 'testing'
        }
      ],
      databaseTypeOptions: [],
      whiteList: [
        'mysql',
        'oracle',
        'mongodb',
        'sqlserver',
        'postgres',
        'elasticsearch',
        'redis',
        'file',
        'db2',
        'kafka',
        'mariadb',
        'mysql pxc',
        'jira',
        'dameng',
        'hive',
        'gbase-8s',
        'sybase ase',
        'gaussdb200',
        'dummy db',
        'rest api',
        'custom_connection',
        'gridfs',
        'tcp_udp',
        'mq'
      ], //目前白名单,
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
    this.getDatabaseType()
    //header
    let guideDoc =
      ' <a target="_blank" style="color: #409EFF" href="https://docs.tapdata.net/data-source">' +
      this.$t('dataForm.form.guideDoc') +
      '</a>'
    this.description = this.$t('connection.desc') + guideDoc
    //定时轮询
    if (window.getSettingByKey('DFS_TCM_PLATFORM') !== 'dfs') {
      timeout = setInterval(() => {
        this.table.fetch(null, 0, true)
      }, 10000)
    }
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
    if (this.$route.query.step) {
      this.handleGuide()
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
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    async getDatabaseType() {
      let filter = {}
      let databaseTypes = await this.$api('DatabaseTypes').get({
        filter: JSON.stringify(filter)
      })
      databaseTypes.data.forEach(dt => this.databaseTypeOptions.push(dt))
    },
    getData({ page, tags }) {
      let region = this.$route.query.region
      let { current, size } = page
      let { keyword, databaseType, databaseModel, status, sourceType } = this.searchParams
      let where = {}
      let fields = {
        name: true,
        user_id: true,
        connection_type: true,
        database_type: true,
        search_databaseType: true,
        database_host: true,
        database_uri: true,
        database_username: true,
        database_port: true,
        database_name: true,
        sourceType: true,
        status: true,
        id: true,
        listtags: true,
        tableCount: true,
        loadCount: true,
        loadFieldsStatus: true,
        schemaAutoUpdate: true,
        platformInfo: true,
        last_updated: true,
        additionalString: true,
        database_password: true,
        fill: true,
        sslCert: true,
        ssl: true,
        sslCAFile: true,
        sslPass: true,
        sslKeyFile: true,
        sslKey: true,
        sslValidate: false,
        sslCA: true, //MongoDB
        mqType: true,
        brokerURL: true, // mq start
        nameSrvAddr: true,
        mqUserName: true,
        mqPassword: true,
        mqQueueSet: true,
        mqTopicSet: true,
        routeKeyField: true,
        virtualHost: true, // mq end
        tcpUdpType: true, // TCP
        root_name: true
      }
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        // let filterObj = { like: verify(keyword), options: 'i' };
        // where.or = [{ name: filterObj }, { database_uri: filterObj }, { database_host: filterObj }];
        where.name = { like: verify(keyword), options: 'i' }
      }
      where.database_type = {
        in: this.whiteList
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
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('connections').count({ where: where }),
        this.$api('connections').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        let list = res.data
        // dfs添加检测方法：测试中
        if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
          this.reloadDataOnTesting(list)
        }
        return {
          total: countRes.data.count,
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
            if (item.database_type === 'mq') {
              if (item.mqType === '0') {
                item.connectionUrl = item.brokerURL
              } else if (item.mqType === '2') {
                item.connectionUrl = item.nameSrvAddr
              }
            }
            // 不存在uri 和 port === 0
            if (!item.database_uri && !item.database_port) {
              item.connectionUrl = ''
            }
            item.connectionSource = this.sourceTypeMapping[item.sourceType]
            item.lastUpdateTime = this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
            return item
          })
        }
      })
    },
    getImgByType(type) {
      if (!type || type === 'jira') {
        type = 'default'
      }
      return require(`@/assets/images/databaseType/${type.toLowerCase()}.png`)
    },
    //列表全选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    preview(id, type) {
      this.id = id
      this.databaseType = type
      if (this.whiteList.includes(type)) {
        this.previewVisible = true
      } else {
        top.location.href = '/#/connection/' + id
        localStorage.setItem('connectionDatabaseType', type)
      }
    },
    handlePreviewVisible() {
      this.previewVisible = false
    },
    edit(id, type, item) {
      if (this.whiteList.includes(type)) {
        if (item.search_databaseType) {
          type = item.search_databaseType
        }
        this.$router.push({
          name: 'connectionsEdit',
          params: {
            id: id
          },
          query: {
            databaseType: type
          }
        })
      } else {
        top.location.href = '/#/connection/' + id
        localStorage.setItem('connectionDatabaseType', type)
      }
    },
    copy(data) {
      let headersName = { 'lconname-name': data.name }
      // return false;
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
      this.$confirm(msg, this.$t('connection.deteleDatabaseTittle'), {
        type: 'warning'
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
          .catch(({ response }) => {
            let msg = response && response.msg
            if (msg && (msg.jobs || msg.modules)) {
              if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
                this.$message.error(this.$t('connection.dfs_cannot_delete_remind'))
              } else {
                this.$message.error(this.$t('connection.cannot_delete_remind'))
              }
              // const h = this.$createElement;
              // this.$message.error(
              // 	h('div', {}, [
              // 		h('div', {}, ['数据源 ', h('span', {}, data.name), ' 被以下资源占用']),
              // 		...msg.jobs.map(j => h('div', {}, [])),
              // 		...msg.modules.map(j => h('div', {}, []))
              // 	])
              // );
            } else {
              this.$message.error(msg || this.$t('connection.deleteFail'))
            }
          })
      })
    },
    //公用弹窗
    confirm(callback, catchCallback, config) {
      this.$confirm(config.Message + config.name + '?', config.title, {
        confirmButtonText: config.confirmButtonText,
        cancelButtonText: config.cancelButtonText,
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          callback()
        } else {
          catchCallback()
        }
      })
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
        })
    },
    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(type) {
      this.handleDialogDatabaseTypeVisible()
      if (this.whiteList.includes(type)) {
        this.$router.push({
          name: 'connectionsCreate',
          query: {
            databaseType: type
          }
        })
      } else {
        top.location.href = '/#/connection'
        localStorage.setItem('connectionDatabaseType', type)
      }
    },
    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      //drs 检查实例是否可用 dfs 检查agent是否可用
      if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
        this.dialogDatabaseTypeVisible = true
      } else if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
        let result = await this.$api('tcm').getAgentCount()
        if (!result.data || !result.data.agentTotalCount || result.data.agentTotalCount <= 0) {
          this.$message.error('您尚未订购同步实例，请先订购实例')
        } else {
          this.dialogDatabaseTypeVisible = true
        }
      } else {
        let result = await this.$api('Workers').getAvailableAgent()
        if (!result.data.result || result.data.result.length === 0) {
          this.$message.error(this.$t('dataForm.form.agentMsg'))
        } else {
          this.dialogDatabaseTypeVisible = true
        }
      }
    },
    async testConnection(item) {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
          this.$message.error(this.$t('dataForm.form.agentConnectionMsg'))
          return
        } else {
          this.$message.error(this.$t('dataForm.form.agentMsg'))
          return
        }
      }
      let loading = this.$loading()
      this.testData = Object.assign({}, defaultModel['default'], item)
      if (['gridfs', 'mongodb'].includes(item.database_type)) {
        this.testData.database_uri = ''
        this.testData.isUrl = true
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
          if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
            this.dialogTestVisible = true
          }
          this.$refs.test.start()
          this.table.fetch()
        })
        .finally(() => {
          loading.close()
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
    }
  }
}
</script>
<style lang="scss" scoped>
.connection-list-wrap {
  height: 100%;

  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
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
    background: #ffffff;
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    float: left;

    img {
      width: 60%;
    }
  }

  .database-text {
    width: 70%;
    white-space: nowrap;
    word-break: break-word;
    text-overflow: ellipsis;
    float: left;
    margin-left: 10px;

    .name {
      color: #409eff;
      cursor: pointer;
    }

    .name:hover {
      text-decoration: underline;
    }

    div {
      line-height: 14px;
    }

    .user {
      color: #cccccc;
      white-space: nowrap;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .region-info {
      line-height: 20px;
      color: #aaa;
    }
  }

  .btn-text {
    // color: #409EFF;
    font-size: 12px;
    padding-right: 5px;
  }

  .tag {
    padding: 0 3px 2px 3px;
    line-height: 12px;
    font-size: 12px;
    font-weight: 400;
    color: #999999;
    background: #f5f5f5;
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
