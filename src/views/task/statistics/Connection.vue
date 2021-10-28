<template>
  <div class="connection-container">
    <VTable :data="list" :columns="columns" height="100%" :has-pagination="false">
      <template slot="name" slot-scope="scope">
        <div class="flex flex-row align-items-center p-2">
          <img
            class="mr-2"
            style="width: 24px; height: 24px"
            :src="require('web-core/assets/images/connection-type/' + scope.row.database_type.toLowerCase() + '.png')"
          />
          <ElLink type="primary" style="display: block; line-height: 20px">
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
          <ElButton size="mini" type="text" @click="testConnection(scope.row)">测试</ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton size="mini" type="text" @click="reload(scope.row)">加载Schema</ElButton>
        </div>
      </template>
    </VTable>
    <!-- 连接测试 -->
    <ConnectionTest ref="test"></ConnectionTest>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import SchemaProgress from 'web-core/components/SchemaProgress'
import VIcon from '@/components/VIcon'
import { deepCopy } from '@/util'

export default {
  name: 'Connection',
  components: { StatusTag, VIcon, SchemaProgress },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      list: [],
      timer: null,
      columns: [
        {
          label: '连接名',
          slotName: 'name'
        },
        {
          label: '状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '连接类型',
          prop: 'connectType'
        },
        {
          label: 'Schema加载进度',
          prop: 'schema',
          headerSlot: 'schemaHeader',
          slotName: 'schema'
        },
        {
          label: '修改时间',
          prop: 'last_updated',
          dataType: 'time'
        },
        {
          label: '操作',
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      connectTypeMap: {
        source: '源头',
        target: '目标',
        source_and_target: '源头和目标'
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
      this.getData()
    },
    getData() {
      let ids = this.task?.stages.map(item => {
        return item.connectionId
      })
      let filter = {
        where: {
          id: {
            inq: ids
          }
        }
      }
      this.$axios.get(`tm/api/Connections?filter=${encodeURIComponent(JSON.stringify(filter))}`).then(data => {
        this.list = data.items.map(item => {
          item.connectType = this.connectTypeMap[item.connection_type]
          return deepCopy(item)
        })
      })
    },
    fetch() {
      this.$emit('change')
    },
    clearInterval() {
      // 清除定时器
      clearInterval(this.timer)
      this.timer = null
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
      try {
        await this.$axios.patch(`tm/api/Connections/${data.id}`, {
          status: 'testing'
        })
        this.$refs.test.start(data, isShowDialog)
        this.fetch()
      } catch (error) {
        this.$message.error(error?.response?.msg || '测试连接失败')
      }
    },
    async reload(row) {
      this.$checkAgentStatus(() => {
        let config = {
          title: this.$t('connection.reloadTittle'),
          Message: this.$t('connection.reloadMsg'),
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
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
            this.reloadApi(row, 'first')
            this.$emit('reload-schema')
          }
        })
      })
    },
    reloadApi(row, type) {
      this.reloadLoading = true
      this.clearInterval()
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
            this.timer = setInterval(() => {
              this.reloadApi(row)
            }, 800)
          }
        })
        .catch(() => {
          this.$message.error(this.$t('connection.reloadFail'))
          this.showProgress = false
          this.progress = 0 //加载完成
          this.reloadLoading = false
        })
    }
  }
}
</script>

<style scoped></style>
