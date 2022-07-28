<template>
  <div class="connection-container">
    <TableList
      :remoteMethod="remoteMethod"
      :columns="columns"
      :remote-data="ids"
      :has-pagination="false"
      ref="tableList"
    >
      <template slot="name" slot-scope="scope">
        <div class="flex flex-row align-items-center p-2">
          <img class="mr-2" style="width: 24px; height: 24px" :src="getDatabaseImg(scope.row)" />
          <ElLink
            type="primary"
            style="display: block; line-height: 20px"
            @click="preview(scope.row.id, scope.row.database_type)"
          >
            {{ scope.row.name }}
          </ElLink>
          <div class="flex align-items-center">
            <img
              v-if="scope.row.agentType === 'Cloud'"
              src="../../../../public/images/only_test.png"
              alt=""
              class="ml-3"
              style="height: 18px"
            />
          </div>
        </div>
      </template>
      <template slot="status" slot-scope="scope">
        <StatusTag type="text" target="connection" :status="scope.row.status"></StatusTag>
      </template>
      <template slot="schemaHeader">
        <div>
          {{ $t('connection_list_column_schema_status') }}
          <ElTooltip placement="top" :content="$t('connection_list_column_schema_status_tips')">
            <VIcon class="color-primary" size="14">info</VIcon>
          </ElTooltip>
        </div>
      </template>
      <template slot="schema" slot-scope="scope">
        <SchemaProgress :data="scope.row"></SchemaProgress>
      </template>
      <template slot="operation" slot-scope="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="testConnection(scope.row)">{{
            $t('task_info_connection_test')
          }}</ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton size="mini" type="text" @click="reload(scope.row)">{{
            $t('connection_preview_load_schema')
          }}</ElButton>
        </div>
      </template>
    </TableList>
    <!-- 连接测试 -->
    <ConnectionTest ref="test"></ConnectionTest>
    <Preview ref="preview" @close="fetch()" @reload-schema="fetch()" hide-operation></Preview>
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import { SchemaProgress, StatusTag } from '@tap/business'
import { VIcon } from '@tap/component'
import Preview from '@/views/connection/Preview'
import { deepCopy } from '@/util'

export default {
  name: 'Connection',
  components: { TableList, StatusTag, VIcon, SchemaProgress, Preview },
  props: {
    ids: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      timer: null,
      fetchTimer: null,
      columns: [
        {
          label: this.$t('connection_list_name'),
          slotName: 'name'
        },
        {
          label: this.$t('connection_list_status'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: this.$t('connection_list_type'),
          prop: 'connectType'
        },
        {
          label: this.$t('connection_list_schema_load_progress'),
          prop: 'schema',
          headerSlot: 'schemaHeader',
          slotName: 'schema'
        },
        {
          label: this.$t('connection_list_change_time'),
          prop: 'last_updated',
          dataType: 'time'
        },
        {
          label: this.$t('list_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      connectTypeMap: {
        source: this.$t('connection_list_source'),
        target: this.$t('connection_list_target'),
        source_and_target: this.$t('connection_list_source_and_target')
      }
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.clearInterval()
  },
  methods: {
    init() {
      this.clearInterval()
      this.fetchTimer = setInterval(() => {
        this.fetch()
      }, 3000)
    },
    remoteMethod({ page }) {
      const { ids } = this
      let { current, size } = page
      let filter = {
        where: {
          id: {
            inq: ids
          }
        },
        limit: size,
        skip: size * (current - 1)
      }
      return this.$axios
        .get(`tm/api/Connections?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .then(({ items }) => {
          let data = items.map(item => {
            item.connectType = this.connectTypeMap[item.connection_type]
            return deepCopy(item)
          })
          return {
            total: data.length,
            data: data
          }
        })
    },
    getTableData() {
      return this.$refs.tableList?.getData()
    },
    fetch() {
      this.$refs.tableList?.fetch(null, null, true)
    },
    clearInterval() {
      // 清除定时器
      clearInterval(this.timer)
      clearInterval(this.fetchTimer)
      this.timer = null
      this.fetchTimer = null
    },
    testConnection(item) {
      this.$checkAgentStatus(async () => {
        let loading = this.$loading()
        this.test(item)
        loading.close()
      })
    },
    async test(data, isShowDialog = true) {
      if (['gridfs', 'mongodb'].includes(data.database_type)) {
        delete data.database_uri
        data.justTest = true
      }
      if (data.database_type !== 'redis') {
        delete data['database_password']
      }
      await this.$axios.patch(`tm/api/Connections/${data.id}`, {
        status: 'testing'
      })
      this.$refs.test.start(data, isShowDialog)
      this.fetch()
    },
    async reload(row) {
      this.$checkAgentStatus(() => {
        let config = {
          title: this.$t('connection_reloadTittle'),
          Message: this.$t('connection_reloadMsg'),
          confirmButtonText: this.$t('button_confirm'),
          cancelButtonText: this.$t('button_cancel'),
          name: row.name,
          id: row.id
        }
        this.$confirm(config.Message + config.name + '?', config.title, {
          // confirmButtonText: config.confirmButtonText,
          // cancelButtonText: config.cancelButtonText,
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (resFlag) {
            this.showProgress = true
            this.progress = 0
            this.reloadApi(row, 'first')
          }
        })
      })
    },
    reloadApi(row, type) {
      this.reloadLoading = true
      // this.clearInterval()
      let parms
      if (type === 'first') {
        parms = {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        }
        this.loadFieldsStatus = 'loading'
      }
      this.$axios
        .patch('tm/api/Connections/' + row.id, parms)
        .then(data => {
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (type === 'first') {
            this.$refs.test.start(row, false, true)
          }
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
            }, 800)
            this.reloadLoading = false
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            this.getSchemaProgress(row)
            this.fetch()
          }
        })
        .catch(() => {
          this.showProgress = false
          this.progress = 0 //加载完成
          this.reloadLoading = false
        })
    },
    getSchemaProgress(row) {
      // this.clearInterval()
      this.$axios
        .get('tm/api/Connections/' + row.id)
        .then(data => {
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
            }, 800)
            this.reloadLoading = false
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            this.timer = setTimeout(() => {
              this.getSchemaProgress(row)
            }, 800)
          }
        })
        .catch(() => {
          this.$message.error(this.$t('connection_reloadFail'))
          this.showProgress = false
          this.progress = 0 //加载完成
          this.reloadLoading = false
        })
    },
    preview(id, type) {
      this.$refs.preview.open(id, type)
    },
    getDatabaseImg(row) {
      return require('web-core/assets/icons/node/' + row.database_type.toLowerCase() + '.svg')
    }
  }
}
</script>
