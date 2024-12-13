<template>
  <ElDialog
    :visible="visible"
    @update:visible="updateVisible"
    width="60%"
    append-to-body
    :title="$t('public_log_download')"
    @open="loadData"
  >
    <el-table
      :data="downloadList"
      :columns="downloadListCol"
      v-loading="loading"
      ref="tableName"
      :has-pagination="false"
      :max-height="520"
    >
      <el-table-column :label="$t('public_file_name')" prop="filename" />
      <el-table-column :label="$t('public_file_size')" width="120">
        <template #default="{ row }">
          <span>{{ calcUnit(row.size, 'b') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_update_time')" prop="lastModified" width="170" />
      <el-table-column :label="$t('public_create_time')" prop="creationTime" width="170" />
      <el-table-column :label="$t('public_operation')" width="100">
        <template #default="{ row }">
          <ElButton size="mini" type="text" :disabled="[0, 2, 3].includes(row.status)" @click="handleDownload(row)">{{
            $t('public_button_download')
          }}</ElButton>
        </template>
      </el-table-column>
    </el-table>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import { proxyApi } from '@tap/api'
import Cookie from '@tap/shared/src/cookie'
import { dayjs } from '@tap/business'

export default {
  name: 'Download',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dataflow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      loading: false,
      downloadList: [],
      downloadListCol: [
        {
          label: i18n.t('public_file_name'),
          prop: 'filename'
        },
        {
          label: i18n.t('public_file_size'),
          slotName: 'fileSize'
        },
        {
          width: 100,
          label: i18n.t('public_operation'),
          slotName: 'operation'
        }
      ]
    }
  },
  methods: {
    calcUnit,
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    handleDownload(row) {
      let url = `/api/proxy/download?filename=${row.filename}&agentId=${this.dataflow.agentId}`

      if (this.isDaas) {
        const accessToken = Cookie.get('access_token')
        url += `&access_token=${accessToken}`
      } else if (process.env.VUE_APP_ACCESS_TOKEN) {
        url += `&__token=${process.env.VUE_APP_ACCESS_TOKEN}`
      }

      window.open(url)
    },
    async loadData() {
      this.loading = true

      const list = await proxyApi
        .call({
          className: 'LogFileService',
          method: 'describeLogFiles',
          args: [this.dataflow.id], // 任务ID
          subscribeIds: [`processId_${this.dataflow.agentId}`] // 指定 FE
        })
        .finally(() => {
          this.loading = false
        })

      this.downloadList = list.map(item => {
        item.lastModified = dayjs(item.lastModified).format('YYYY-MM-DD HH:mm:ss')
        item.creationTime = dayjs(item.creationTime).format('YYYY-MM-DD HH:mm:ss')
        return item
      })
    }
  }
}
</script>
