<template>
  <div class="connection-container">
    <VTable
      :remoteMethod="remoteMethod"
      :columns="columns"
      :remote-data="ids"
      height="100%"
      :has-pagination="false"
      ref="VTable"
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
          {{ $t('packages_business_connection_status_' + scope.row.status) }}
        </span>
      </template>
      <template slot="schemaHeader">
        <div>
          {{ $t('public_connection_schema_status') }}
          <ElTooltip placement="top" :content="$t('public_connection_schema_status_tip')">
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
            $t('packages_business_task_info_connection_test')
          }}</ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton size="mini" type="text" @click="reload(scope.row)">{{
            $t('public_connection_button_load_schema')
          }}</ElButton>
        </div>
      </template>
    </VTable>
    <!-- 连接测试 -->
    <ConnectionTest ref="test"></ConnectionTest>
  </div>
</template>

<script>
import { connectionsApi } from '@tap/api'
import { VIcon, VTable } from '@tap/component'
import { deepCopy } from '@tap/shared'

import ConnectionTest from '../../../connections/Test.vue'
import { SchemaProgress } from '../../../../components'
import { getConnectionIcon } from '../../../connections/util'

export default {
  name: 'Connection',
  components: { VTable, VIcon, SchemaProgress, ConnectionTest },
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
          label: this.$t('packages_business_connection_list_name'),
          slotName: 'name'
        },
        {
          label: this.$t('packages_business_connection_list_status'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: this.$t('public_connection_type'),
          prop: 'connectType'
        },
        {
          label: this.$t('packages_business_connection_list_schema_load_progress'),
          prop: 'schema',
          headerSlot: 'schemaHeader',
          slotName: 'schema'
        },
        {
          label: this.$t('public_change_time'),
          prop: 'last_updated',
          dataType: 'time'
        },
        {
          label: this.$t('public_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      connectTypeMap: {
        source: this.$t('public_connection_type_source'),
        target: this.$t('public_connection_type_target'),
        source_and_target: this.$t('public_connection_type_source_and_target')
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
        .then(data => {
          let list = (data?.items || []).map(item => {
            item.connectType = this.connectTypeMap[item.connection_type]
            return deepCopy(item)
          })
          return {
            total: data?.total || 0,
            data: list
          }
        })
    },
    getTableData() {
      return this.$refs.VTable?.getData()
    },
    fetch() {
      this.$refs.VTable?.fetch(null, null, true)
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
        await connectionsApi.updateById(data.id, {
          status: 'testing'
        })
        this.$refs.test.start(data, isShowDialog)
        this.fetch()
      } catch (error) {
        // if (error?.isException) {
        //   this.$message.error(error?.response?.msg || this.$t('packages_business_connection_list_test_failed'))
        // }
      }
    },
    async reload(row) {
      this.checkAgent(() => {
        let config = {
          title: this.$t('packages_business_connection_reloadTittle'),
          Message: this.$t('packages_business_connection_reloadMsg'),
          confirmButtonText: this.$t('public_button_confirm'),
          cancelButtonText: this.$t('public_button_close'),
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
      connectionsApi.updateById(row.id, parms).then(data => {
        if (!this?.$refs?.test) {
          return
        }
        this.loadFieldsStatus = data?.loadFieldsStatus //同步reload状态
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
