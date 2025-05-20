<script>
import { connectionsApi, databaseTypesApi } from '@tap/api'
import { FilterBar, VIcon } from '@tap/component'

import i18n from '@tap/i18n'

import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import { h } from 'vue'
import SceneDialog from '../../components/create-connection/SceneDialog.vue'
import PageContainer from '../../components/PageContainer.vue'
import PermissionseSettingsCreate from '../../components/permissionse-settings/Create'
import SchemaProgress from '../../components/SchemaProgress'
import TablePage from '../../components/TablePage'
import { CONNECTION_STATUS_MAP, CONNECTION_TYPE_MAP } from '../../shared'
import Preview from './Preview'
import Test from './Test'
import UsedTaskDialog from './UsedTaskDialog'
import { defaultModel, getConnectionIcon, verify } from './util'

let timeout = null

export default {
  components: {
    PageContainer,
    SceneDialog,
    TablePage,
    Preview,
    Test,
    VIcon,
    SchemaProgress,
    FilterBar,
    UsedTaskDialog,
    PermissionseSettingsCreate,
  },
  inject: ['checkAgent', 'buried'],
  data() {
    let connectionDialogProps = {}

    if (import.meta.env.VUE_APP_CONNECTION_DIALOG_PROPS) {
      try {
        connectionDialogProps = JSON.parse(
          import.meta.env.VUE_APP_CONNECTION_DIALOG_PROPS,
        )
      } catch (error) {
        console.error(error)
      }
    }

    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      showInstanceInfo: import.meta.env.VUE_APP_LICENSE_TYPE === 'PIPELINE',

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
          label: this.$t('public_select_option_all'),
          value: '',
        },
        {
          label: this.$t('public_connection_type_source'),
          value: 'source',
        },
        {
          label: this.$t('public_connection_type_target'),
          value: 'target',
        },
        {
          label: this.$t('public_connection_type_source_and_target'),
          value: 'source_and_target',
        },
      ],
      databaseStatusOptions: [
        {
          label: this.$t('public_select_option_all'),
          value: '',
        },
        {
          label: this.$t('public_status_ready'),
          value: 'ready',
        },
        {
          label: this.$t('public_status_invalid'),
          value: 'invalid',
        },
        {
          label: this.$t('public_status_testing'),
          value: 'testing',
        },
      ],
      databaseTypeOptions: [],
      searchParams: {
        databaseType: null,
        keyword: '',
        databaseModel: '',
        status: '',
        panelFlag: true,
        sourceType: '',
      },
      testData: null,
      dialogTestVisible: false, // 连接测试框
      connectionTaskData: {
        items: [],
        total: 0,
      },
      connectionTaskDialog: false,

      connectionDialogProps,
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    buttonShowMap() {
      return {
        create: this.$has('v2_datasource_creation'),
        copy: this.$has('v2_datasource_copy'),
      }
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
  },
  created() {
    // let helpUrl = 'https://docs.tapdata.net'
    // let guideDoc =
    //   ` <a style="color: #48B6E2" href="${helpUrl}/data-source">` +
    //   this.$t('packages_business_connection_list_help_doc') +
    //   '</a>'
    //
    // this.description = this.$t('packages_business_connection_list_desc') + guideDoc
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
    this.getFilterItems()

    // console.log('baidu-cookie')
    // Cookie.set('ken_bd_vid', 'kennen')
    // Cookie.set('ken_bd_vid', 'kennen', {
    //   domain: 'cloud.tapdata.net'
    // })
    // Cookie.set('ken_bd_vid', 'kennen', {
    //   domain: 'tapdata.net'
    // })
  },
  mounted() {
    const { action, create } = this.$route.query || {}

    if (create) {
      this.dialogDatabaseTypeVisible = true
    }

    if (action === 'create') {
      this.checkTestConnectionAvailable()
    }

    for (const key in this.searchParams) {
      if (key in this.$route.query) {
        this.searchParams[key] = this.$route.query[key]
      }
    }
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    // 存在测试中，重新加载数据
    reloadDataOnTesting(data) {
      let flag = false
      data.forEach((el) => {
        if (el.status === 'testing') {
          flag = true
        }
      })
      flag &&
        setTimeout(() => {
          this.table.fetch(null, 0, true, (value) => {
            this.reloadDataOnTesting(value)
          })
        }, 3000)
    },
    //兼容新手引导
    handleGuide() {
      const item = {
        visible: true,
        step: this.$route.query.step ? Number(this.$route.query.step) + 1 : 0,
      }
      window.parent &&
        window.parent.noviceGuideChange &&
        window.parent.noviceGuideChange(item)
      this.$router.push({
        name: 'connections',
      })
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },

    getData({ page, tags }) {
      const { current, size } = page
      const { keyword, databaseType, databaseModel, status, sourceType } =
        this.searchParams
      const where = {
        createType: {
          $ne: 'System',
        },
      }
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        where.name = { like: verify(keyword), options: 'i' }
      }
      databaseType && (where.database_type = databaseType)

      if (databaseModel) {
        where.connection_type = {
          $ne: databaseModel === 'source' ? 'target' : 'source',
        }
      }

      sourceType && (where.sourceType = sourceType)
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags,
        }
      }
      status && (where.status = status)
      const filter = {
        order: this.order,
        limit: size,
        noSchema: 1,
        //fields: fields, //传noSchema 过滤schema
        skip: (current - 1) * size,
        where,
      }
      return connectionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          let list = data?.items || []
          // 有选中行，列表刷新后无法更新行数据，比如状态
          if (this.multipleSelection.length && list.length) {
            const tempMap = list.reduce((map, item) => {
              map[item.id] = item
              return map
            }, {})
            this.multipleSelection.forEach((item, i) => {
              const temp = tempMap[item.id]
              if (temp) {
                this.multipleSelection[i] = temp
              }
            })
          }
          list = list.map((item) => {
            if (item.connectionString) {
              item.connectionUrl = item.connectionString
            } else if (item.config?.uri) {
              const regResult =
                /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
                  item.config.uri,
                )
              if (regResult && regResult.groups && regResult.groups.password) {
                const { username, host, database, query } = regResult.groups
                item.connectionUrl = `mongodb://${username}:***@${host}/${database}${query ? `/${query}` : ''}`
              } else {
                item.connectionUrl = item.config.uri
              }
            } else if (item.config) {
              const { host, port, database, schema } = item.config
              item.connectionUrl = host
                ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
                : ''
            }

            item.lastUpdateTime = item.last_updated = item.last_updated
              ? dayjs(item.last_updated).format('YY-MM-DD HH:mm:ss')
              : '-'
            item.loadSchemaTimeLabel = item.loadSchemaTime
              ? dayjs(item.loadSchemaTime).format('YY-MM-DD HH:mm:ss')
              : '-'
            item.disabledLoadSchema = false
            return item
          })

          // 同步抽屉数据
          this.$refs.preview.sync(list)
          return {
            total: data?.total,
            data: list,
          }
        })
    },
    getImgByType(type) {
      // if (!type || type === 'jira') {
      //   type = 'default'
      // }
      type = 'default'
      return require(
        `@tap/assets/images/databaseType/${type.toLowerCase()}.png`,
      )
    },
    //列表全选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    preview(row) {
      this.$refs.preview.open(row)
    },
    edit(id, item) {
      const { pdkHash, definitionPdkId: pdkId } = item

      if (item.agentType === 'Local') {
        this.$confirm(
          i18n.t('packages_business_connections_list_dangqianlianjie') +
            item.name +
            i18n.t('packages_business_connections_list_zhengzaizuoweiF'),
          '',
          {
            type: 'warning',
            showClose: false,
          },
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }

          if (this.connectionDialogProps.dialogMode) {
            this.$refs.dialog.editConnection(item)
            return
          }

          this.$router.push({
            name: 'connectionsEdit',
            params: {
              id,
            },
            query: {
              pdkHash,
              pdkId,
            },
          })
        })
      } else {
        if (this.connectionDialogProps.dialogMode) {
          this.$refs.dialog.editConnection(item)
          return
        }

        this.$router.push({
          name: 'connectionsEdit',
          params: {
            id,
          },
          query: {
            pdkHash,
            pdkId,
          },
        })
      }
    },
    copy(data) {
      const headersName = { 'lconname-name': data.name }
      data.copyLoading = true
      connectionsApi
        .copy(
          data.id,
          {
            uri: `${data.id}/copy`,
            headers: headersName,
          },
          data.name,
        )
        .then(() => {
          this.table.fetch()
          this.$message.success(this.$t('public_message_copy_success'))
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
      let strArr = this.$t(
        'packages_business_connection_deteleDatabaseMsg',
      ).split('xxx')
      if (row.agentType === 'Local') {
        const str = i18n.t(
          'packages_business_connections_list_dangqianlianjiex',
        )
        strArr = str.split('xxx')
      }
      const msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary',
          },
          row.name,
        ),
        strArr[1],
      ])
      this.$confirm(msg, '', {
        type: 'warning',
        showClose: false,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        //检查该连接是否被已有任务使用
        connectionsApi.checkConnectionTask(row.id).then((data = {}) => {
          if (data?.items?.length === 0) {
            connectionsApi.delete(row.id).then((data) => {
              const jobs = data?.jobs || []
              const modules = data?.modules || []
              if (jobs.length > 0 || modules.length > 0) {
                this.$message.error(
                  this.$t('packages_business_connection_checkMsg'),
                )
              } else {
                this.$message.success(this.$t('public_message_delete_ok'))
                this.table.fetch()
              }
            })
          } else {
            //展示已使用的任务列表
            this.connectionTaskData = {
              items: data.items || [],
              total: data.total || 0,
            }
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
            keyword: item.name,
          },
        })
      } else {
        this.$router.push({
          name: 'dataflowList',
          query: {
            keyword: item.name,
          },
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
      const tagList = []
      const tagMap = {}

      this.multipleSelection.forEach((row) => {
        row.listtags.forEach((item) => {
          if (!tagMap[item.id]) {
            tagList.push(item)
            tagMap[item.id] = true
          }
        })
      })

      return tagList
    },
    handleOperationClassify(listtags) {
      const attributes = {
        id: this.multipleSelection.map((r) => r.id),
        listtags,
      }
      connectionsApi.batchUpdateListtags(attributes).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('public_message_save_ok'))
      })
    },
    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(item) {
      this.handleDialogDatabaseTypeVisible()
      const { pdkHash, pdkId } = item
      this.$router.push({
        name: 'connectionCreate',
        query: { pdkHash, pdkId },
      })
    },

    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      if (import.meta.env.DEV) {
        this.dialogDatabaseTypeVisible = true
        return
      }
      this.buried('connectionCreateDialog')
      this.checkAgent(() => {
        this.dialogDatabaseTypeVisible = true
      })
    },
    async testConnection(item) {
      this.buried('connectionTest')
      this.checkAgent(() => {
        const loading = this.$loading()
        this.testData = Object.assign({}, defaultModel.default, item)
        connectionsApi
          .updateById(
            item.id,
            Object.assign(
              {},
              {
                status: 'testing',
              },
            ),
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
      const status = data.status
      if (status === 'ready') {
        this.$message.success(
          this.$t('public_connection_button_test') +
            this.$t('public_status_ready'),
          false,
        )
      } else {
        this.$message.error(
          this.$t('public_connection_button_test') +
            this.$t('public_status_invalid'),
          false,
        )
      }

      this.buried('connectionTest', '', {
        result: status === 'ready',
      })
      this.table.fetch()
    },
    getFilterItems() {
      this.filterItems = [
        {
          slotName: 'connectionType',
          // label: this.$t('public_connection_type'),
          key: 'databaseModel',
          // type: 'select-inner',
          // items: this.databaseModelOptions
        },
        {
          label: this.$t('packages_business_connection_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.databaseStatusOptions,
        },
        {
          label: this.$t(
            'packages_business_connection_list_form_database_type',
          ),
          key: 'databaseType',
          type: 'select-inner',
          width: '250px',
          // dropdownWidth: '250px',
          filterable: true,
          items: async () => {
            let data = await databaseTypesApi.get()
            data = data || []
            const databaseTypes = []
            databaseTypes.push(...data)
            const databaseTypeOptions = databaseTypes.sort((t1, t2) =>
              t1.name > t2.name ? 1 : t1.name === t2.name ? 0 : -1,
            )
            //默认全部
            // let all = {
            //   name: this.$t('public_select_option_all'),
            //   type: ''
            // }
            // databaseTypeOptions.unshift(all)
            return databaseTypeOptions.map((item) => {
              return {
                label: item.name,
                value: item.type,
              }
            })
          },
        },
        {
          placeholder: this.$t('packages_business_connection_list_name'),
          key: 'keyword',
          type: 'input',
          id: 'name-filter-input',
        },
      ]
    },
    getConnectionIcon() {
      return getConnectionIcon(...arguments)
    },
    handleLoadSchema(row) {
      if (!this.$refs.preview) {
        return
      }
      this.$refs.preview.setConnectionData(row)
      row.disabledLoadSchema = true
      this.$refs.preview.reload?.(this.table.fetch(null, 0, true))
      setTimeout(() => {
        row.disabledLoadSchema = false
      }, 3000)
    },
    isFileSource(row) {
      return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(row?.database_type)
    },
    getStatus(status) {
      return CONNECTION_STATUS_MAP[status]?.text || '-'
    },
    getType(type) {
      return CONNECTION_TYPE_MAP[type]?.text || '-'
    },
    havePermission(data = [], type = '') {
      if (!this.isDaas) return true
      return data.includes(type)
    },
    // 显示权限设置
    handlePermissionsSettings() {
      this.$refs.permissionseSettingsCreate.open(this.multipleSelection)
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-if="buttonShowMap.create"
        id="connection-list-create"
        v-readonlybtn="'datasource_creation'"
        class="btn btn-create"
        type="primary"
        :disabled="$disabledReadonlyUserBtn()"
        @click="checkTestConnectionAvailable"
      >
        <span> {{ $t('public_connection_button_create') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      row-key="id"
      :classify="
        isDaas
          ? {
              authority: 'datasource_catalog_management',
              types: ['database'],
              viewPage: 'connections',
              title: $t('public_tags'),
            }
          : null
      "
      :remote-method="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        >
          <template #connectionType>
            <ElRadioGroup
              v-model="searchParams.databaseModel"
              @change="table.fetch(1)"
            >
              <ElRadioButton label="">{{ $t('public_all') }}</ElRadioButton>
              <ElRadioButton label="source">{{
                $t('public_connection_type_source')
              }}</ElRadioButton>
              <ElRadioButton label="target">{{
                $t('public_connection_type_target')
              }}</ElRadioButton>
            </ElRadioGroup>
          </template>
        </FilterBar>
      </template>
      <template v-if="isDaas" #multipleSelectionActions>
        <ElButton @click="handlePermissionsSettings"
          >{{
            $t('packages_business_permissionse_settings_create_quanxianshezhi')
          }}
        </ElButton>
        <ElButton
          v-readonlybtn="'datasource_category_application'"
          class="btn"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <span> {{ $t('public_button_bulk_tag') }}</span>
        </ElButton>
      </template>
      <ElTableColumn
        v-if="isDaas"
        type="selection"
        width="38"
        align="center"
        :reserve-selection="true"
      />
      <ElTableColumn
        show-overflow-tooltip
        prop="name"
        min-width="250"
        :label="$t('public_connection_name')"
      >
        <template #default="{ row }">
          <div class="connection-name flex flex-wrap gap-1">
            <div class="flex align-center gap-1 overflow-hidden">
              <img
                class="connection-img"
                :src="getConnectionIcon(row.pdkHash)"
                alt=""
              />
              <ElLink
                class="ellipsis block lh-base"
                type="primary"
                @click.stop="preview(row)"
              >
                {{ row.name }}
              </ElLink>
            </div>
            <div
              v-if="row.listtags"
              class="justify-content-start ellipsis flex flex-wrap align-center gap-1"
            >
              <span
                v-for="(item, i) in row.listtags"
                :key="i"
                class="tag ellipsis"
                :title="item.value"
              >
                {{ item.value }}
              </span>
            </div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="showInstanceInfo"
        show-overflow-tooltip
        :label="$t('packages_business_instance_info')"
        min-width="160"
      >
        <template #default="{ row }">
          <el-tag>
            {{ row.datasourceInstanceTag || '-' }}
          </el-tag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        :label="$t('public_connection_information')"
        min-width="160"
      >
        <template #default="scope">
          {{ scope.row.connectionUrl }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="status"
        :label="$t('packages_business_connection_dataBaseStatus')"
        min-width="100"
      >
        <template #default="{ row }">
          <div>
            <span :class="[`status-connection-${row.status}`, 'status-block']">
              {{ getStatus(row.status) }}
            </span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        width="125"
        prop="connection_type"
        min-width="135"
        :label="$t('public_connection_type')"
      >
        <template #default="scope">
          {{ getType(scope.row.connection_type) }}
        </template>
      </ElTableColumn>
      <ElTableColumn min-width="125">
        <template #header>
          <div class="flex align-center">
            <span>{{ $t('public_connection_schema_status') }}</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              :content="$t('public_connection_schema_status_tip')"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
        <template #default="scope">
          <div v-if="isFileSource(scope.row)">-</div>
          <SchemaProgress :data="scope.row" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="loadSchemaTime"
        sortable="loadSchemaTime"
        min-width="180"
        :label="$t('public_connection_table_structure_update_time')"
      >
        <template #default="scope">
          {{ scope.row.loadSchemaTimeLabel }}
        </template>
      </ElTableColumn>
      <ElTableColumn fixed="right" width="320" :label="$t('public_operation')">
        <template #header>
          <div v-if="isDaas" class="flex align-center">
            <span>{{ $t('public_operation_available') }}</span>
            <ElTooltip
              class="ml-2"
              placement="top"
              :content="
                $t('packages_business_connections_list_wuquanxiandecao')
              "
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
        <template #default="scope">
          <ElButton
            data-testid="test-connection"
            text
            type="primary"
            @click="testConnection(scope.row)"
            >{{ $t('public_connection_button_test') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElTooltip
            :disabled="!isFileSource(scope.row)"
            :content="$t('packages_business_connections_list_wenjianleixingde')"
            placement="top"
          >
            <span>
              <ElButton
                text
                type="primary"
                data-testid="load-schema"
                :disabled="
                  isFileSource(scope.row) || scope.row.disabledLoadSchema
                "
                @click="handleLoadSchema(scope.row)"
                >{{ $t('public_connection_button_load_schema') }}
              </ElButton>
            </span>
          </ElTooltip>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-if="havePermission(scope.row.permissionActions, 'Edit')"
            v-readonlybtn="'datasource_edition'"
            text
            type="primary"
            data-testid="edit-connection"
            :disabled="
              $disabledByPermission(
                'datasource_edition_all_data',
                scope.row.user_id,
              ) ||
              $disabledReadonlyUserBtn() ||
              scope.row.agentType === 'Cloud'
            "
            @click="edit(scope.row.id, scope.row)"
            >{{ $t('public_button_edit') }}
          </ElButton>
          <ElDivider
            v-if="havePermission(scope.row.permissionActions, 'Edit')"
            v-readonlybtn="'datasource_edition'"
            class="mx-1"
            direction="vertical"
          />
          <ElButton
            v-if="buttonShowMap.copy"
            v-readonlybtn="'datasource_creation'"
            text
            type="primary"
            data-testid="copy-connection"
            :loading="scope.row.copyLoading"
            :disabled="
              $disabledReadonlyUserBtn() || scope.row.agentType === 'Cloud'
            "
            @click="copy(scope.row)"
            >{{ $t('public_button_copy') }}
          </ElButton>
          <ElDivider
            v-if="buttonShowMap.copy"
            v-readonlybtn="'datasource_creation'"
            class="mx-1"
            direction="vertical"
          />
          <ElButton
            v-if="havePermission(scope.row.permissionActions, 'Delete')"
            v-readonlybtn="'datasource_delete'"
            text
            type="primary"
            data-testid="delete-connection"
            :disabled="
              $disabledByPermission(
                'datasource_delete_all_data',
                scope.row.user_id,
              ) ||
              $disabledReadonlyUserBtn() ||
              scope.row.agentType === 'Cloud'
            "
            @click="remove(scope.row)"
            >{{ $t('public_button_delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <Preview ref="preview" @test="testConnection" />
    <SceneDialog
      ref="dialog"
      v-model:visible="dialogDatabaseTypeVisible"
      selector-type="source_and_target"
      v-bind="connectionDialogProps"
      @selected="handleDatabaseType"
      @success="table.fetch(1)"
    />
    <Test
      ref="test"
      v-model:visible="dialogTestVisible"
      :form-data="testData"
      @return-test-data="returnTestData"
    />
    <UsedTaskDialog v-model="connectionTaskDialog" :data="connectionTaskData" />
    <PermissionseSettingsCreate ref="permissionseSettingsCreate" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.paddingLeft0 {
  padding-left: 0 !important;
}

.connection-list-wrap {
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.connection-name {
  display: flex;
  align-items: center;
}

.tag {
  padding: 0 4px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: map.get($color, tag);
  border: 1px solid map.get($bgColor, tag);
  border-radius: 4px;
}

.connection-img {
  width: 18px;
  height: 18px;
}

.btn-text {
  // color: map.get($color, primary);
  font-size: 12px;
  padding-right: 5px;
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
</style>
