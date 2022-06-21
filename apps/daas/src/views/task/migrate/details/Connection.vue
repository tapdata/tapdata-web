<template>
  <div class="connection-container">
    <TableList
      :remoteMethod="remoteMethod"
      :columns="columns"
      :remote-data="ids"
      height="100%"
      :has-pagination="false"
      ref="tableList"
    >
      <template slot="name" slot-scope="scope">
        <div class="flex flex-row align-items-center p-2">
          <img class="mr-2" style="width: 24px; height: 24px" :src="getConnectionIcon(scope.row.pdkHash)" alt="" />
          <ElLink type="primary" style="display: block; line-height: 20px">
            {{ scope.row.name }}
          </ElLink>
        </div>
      </template>
      <template slot="status" slot-scope="scope">
        <span :class="['status-connection-' + scope.row.status, 'status-block']">
          {{ $t('connection.status.' + scope.row.status) }}
        </span>
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
  </div>
</template>

<script>
import TableList from '@/components/TableList'
import SchemaProgress from 'web-core/components/SchemaProgress'
import VIcon from '@/components/VIcon'
import { deepCopy } from '@/utils/util'
import { getConnectionIcon } from '@/views/connections/util'
import { connectionsApi } from '@tap/api'

export default {
  name: 'Connection',
  components: { TableList, VIcon, SchemaProgress },
  inject: ['checkAgent'],
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
          label: this.$t('connection_list_operate'),
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
      }, 5000)
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
      return connectionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let data = res?.items.map(item => {
            item.connectType = this.connectTypeMap[item.connection_type]
            return deepCopy(item)
          })
          return {
            total: res?.total,
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
      this.checkAgent(() => {
        this.test(item)
      })
    },
    async test(data, isShowDialog = true) {
      try {
        await connectionsApi.patch(data.id, {
          status: 'testing'
        })
        this.$refs.test.start(data, isShowDialog)
        this.fetch()
      } catch (error) {
        // if (error?.isException) {
        //   this.$message.error(error?.response?.msg || this.$t('connection_list_test_failed'))
        // }
      }
    },
    async reload(row) {
      this.checkAgent(() => {
        let config = {
          title: this.$t('connection.reloadTittle'),
          Message: this.$t('connection.reloadMsg'),
          confirmButtonText: this.$t('button_confirm'),
          cancelButtonText: this.$t('button_close'),
          name: row.name,
          id: row.id
        }
        this.$confirm(config.Message + config.name + '?', config.title, {
          confirmButtonText: config.confirmButtonText,
          cancelButtonText: config.cancelButtonText,
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (resFlag) {
            this.showProgress = true
            this.progress = 0
            this.testSchema(row)
          }
        })
      })
    },
    //请求测试
    testSchema(row) {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading'
      }
      this.loadFieldsStatus = 'loading'
      this.reloadLoading = true
      connectionsApi.patch(row.id, parms).then(res => {
        if (!this?.$refs?.test) {
          return
        }
        this.loadFieldsStatus = res?.loadFieldsStatus //同步reload状态
        this.$refs.test.start(row, false, true)
      })
    },
    getConnectionIcon() {
      return getConnectionIcon(...arguments)
    }
  }
}
</script>

<style lang="scss" scoped>
.connection-container {
  height: 100%;
}
</style>
