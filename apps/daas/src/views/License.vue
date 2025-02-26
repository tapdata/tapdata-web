<template>
  <PageContainer>
    <template #actions>
      <ElButton :loading="copyLoading" class="btn" size="mini" @click="copySid">{{
        $t('public_button_copy')
      }}</ElButton>
      <ElButton class="btn" type="primary" size="mini" @click="updateNode()">{{ $t('public_event_update') }}</ElButton>
    </template>
    <section class="license-wrapper h-100 overflow-hidden pb-6 pr-6">
      <TablePage
        ref="table"
        row-key="id"
        :default-sort="{ prop: 'lastUpdatedFmt', order: 'descending' }"
        :remoteMethod="getData"
        @sort-change="handleSortTable"
      >
        <ElTableColumn type="selection" width="45"></ElTableColumn>
        <ElTableColumn prop="hostname" :label="$t('license_node_name')" min-width="150"></ElTableColumn>
        <ElTableColumn prop="sid" :label="$t('license_node_sid')" min-width="150"></ElTableColumn>
        <ElTableColumn :label="$t('license_status')" min-width="150">
          <template #default="{ row }">
            <span :class="'color-' + row.status.color">{{ row.status.text }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('daas_licenseType')" min-width="150">
          <template #default="{ row }">
            <span>{{ TYPE_MAP[row.licenseType] }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn v-if="showLicenseType" :label="$t('daas_datasourcePipelineLimit')" min-width="160">
          <template #default="{ row }">
            <div v-if="row.licenseType === 'PIPELINE'" class="flex gap-2 align-center">
              <el-progress class="flex-1" :percentage="row.pipelinePercentage" :show-text="false"></el-progress>
              <span>{{ row.datasourcePipelineInUse }} / {{ row.datasourcePipelineLimit }}</span>
              <el-button @click="openPipelineDetails" size="mini" type="text">{{
                $t('public_button_details')
              }}</el-button>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="expirationDateFmt" :label="$t('license_expire_date')" min-width="160"></ElTableColumn>
        <ElTableColumn
          prop="lastUpdatedFmt"
          sortable
          :label="$t('license_update_time')"
          min-width="160"
        ></ElTableColumn>
        <ElTableColumn :label="$t('public_operation')" width="88">
          <template #default="{ row }">
            <ElLink link type="primary" @click="updateNode(row)">{{ $t('public_event_update') }}</ElLink>
          </template>
        </ElTableColumn>
      </TablePage>
      <ElDialog append-to-body :title="$t('license_renew_dialog')" :visible.sync="dialogVisible">
        <ElInput v-model.trim="license" type="textarea"></ElInput>
        <div slot="footer">
          <ElButton type="primary" size="mini" :disabled="!license" :loading="dialogLoading" @click="updateLicense">{{
            $t('public_event_update')
          }}</ElButton>
        </div>
      </ElDialog>
    </section>

    <ElDialog
      append-to-body
      :title="$t('daas_datasourcePipeUsageDetails')"
      :visible.sync="detailsDialog.show"
      width="600px"
    >
      <div class="flex flex-column gap-4" v-loading="detailsDialog.loading">
        <div class="bg-white border rounded-xl p-2" v-for="(item, i) in detailsDialog.data" :key="i">
          <div class="bg-subtle rounded-xl p-2 flex justify-center align-center gap-2">
            <template v-for="(info, i) in item.instanceInfos">
              <div v-if="i > 0" :key="i" class="connector-line bg-primary position-relative px-4" style="height: 2px">
                <el-tag class="text-center" style="min-width: 80px; transform: translateY(-50%)">{{
                  $t('public_task_count', { val: item.taskIds.length })
                }}</el-tag>
                <span
                  class="connector-line-dot rounded-circle position-absolute bg-primary"
                  style="width: 6px; height: 6px; left: -2px; top: -2px"
                ></span>

                <span
                  class="connector-line-dot rounded-circle position-absolute bg-primary"
                  style="width: 6px; height: 6px; right: -2px; top: -2px"
                ></span>
              </div>
              <div class="connector-wrap bg-white rounded-lg p-2 shadow-sm flex align-center gap-2 flex-1 min-w-0">
                <DatabaseIcon class="flex-shrink-0" :size="24" :item="info"></DatabaseIcon>
                <div class="lh-sm min-w-0">
                  <div class="font-color-dark">{{ info.pdkName }}</div>
                  <div class="font-color-light ellipsis fs-7" :title="info.tag">{{ info.tag || '--' }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <VEmpty v-if="!detailsDialog.data.length"></VEmpty>
      </div>
    </ElDialog>
  </PageContainer>
</template>

<script>
import { DatabaseIcon, TablePage, TaskStatus } from '@tap/business'
import dayjs from 'dayjs'
import { licensesApi } from '@tap/api'
import Time from '@tap/shared/src/time'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { VEmpty } from '@tap/component'
import { ElLink } from 'element-ui/types/link'

export default {
  components: { VEmpty, DatabaseIcon, PageContainer, TablePage, TaskStatus },
  data() {
    const TYPE_MAP = {
      OP: this.$t('daas_licenseType_op'),
      PIPELINE: this.$t('daas_licenseType_pipeline'),
      LITE: this.$t('daas_licenseType_lite'),
      SERVICE: this.$t('daas_licenseType_service')
    }

    return {
      TYPE_MAP,
      copyLoading: false,
      dialogVisible: false,
      dialogLoading: false,
      license: '',
      showLicenseType: process.env.VUE_APP_LICENSE_TYPE === 'PIPELINE',
      detailsDialog: {
        show: false,
        loading: false,
        data: []
      },

      order: 'last_updated DESC'
    }
  },
  methods: {
    getData({ page }) {
      let { current, size } = page
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return licensesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          return {
            total: data?.total || 0,
            data: list.map(item => {
              let expirationDate = dayjs(item.expirationDate)
              let duration = expirationDate.valueOf() - Time.now()
              let status = 'normal'
              if (duration < 0) {
                status = 'expired'
              } else if (duration < 30 * 24 * 60 * 60 * 1000) {
                status = 'expiring'
              }
              if (!item.license) {
                status = 'probation'
              }
              item.status = {
                normal: {
                  text: this.$t('license_normal'),
                  color: 'success'
                },
                expiring: {
                  text: this.$t('license_expiring'),
                  color: 'warning'
                },
                expired: {
                  text: this.$t('license_expired'),
                  color: 'info'
                },
                probation: {
                  text: this.$t('license_try_out'),
                  color: 'info'
                }
              }[status]
              item.expirationDateFmt = item.expirationDate ? expirationDate.format('YYYY-MM-DD HH:mm:ss') : ''
              item.lastUpdatedFmt = item.last_updated ? dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss') : ''

              if (item.licenseType === 'PIPELINE' && item.datasourcePipelineLimit > 0) {
                item.pipelinePercentage = Math.floor(
                  (item.datasourcePipelineInUse / item.datasourcePipelineLimit) * 100
                )
              }

              return item
            })
          }
        })
    },
    copySid() {
      let table = this.$refs.table
      let ids = table.multipleSelection?.map(item => item.sid)
      if (ids?.length) {
        this.copyLoading = true
        licensesApi
          .getSid(ids)
          .then(data => {
            let sid = data?.sid
            if (sid) {
              this.$copyText(sid).then(() => {
                this.$message.success(this.$t('license_copied_clipboard'))
              })
            }
          })
          .finally(() => {
            this.copyLoading = false
          })
      } else {
        this.$message.warning(this.$t('license_select_node'))
      }
    },
    updateNode(row) {
      this.updateSids = row ? [row.sid] : this.$refs.table?.multipleSelection?.map(item => item.sid)
      if (this.updateSids?.length) {
        this.license = ''
        this.dialogVisible = true
      } else {
        this.$message.warning(this.$t('license_select_node'))
      }
    },
    updateLicense() {
      this.dialogLoading = true
      if (this.updateSids?.length) {
        licensesApi
          .updateLicense({
            sid: this.updateSids,
            license: this.license
          })
          .then(() => {
            this.$message.success(this.$t('license_renew_success'))
            this.$table.fetch()
            this.dialogVisible = false

            setTimeout(() => {
              window.location.reload()
            }, 2000)
          })
          .finally(() => {
            this.dialogLoading = false
          })
      }
    },
    async openPipelineDetails() {
      this.detailsDialog.show = true
      this.detailsDialog.loading = true
      const data = await licensesApi.getPipelineDetails()
      this.detailsDialog.loading = false
      this.detailsDialog.data = data
    },
    handleSortTable({ order, prop }) {
      if (prop === 'lastUpdatedFmt') {
        prop = 'last_updated'
      }
      this.order = order ? `${prop} ${order === 'ascending' ? 'ASC' : 'DESC'}` : ''
      this.table.fetch(1)
    }
  }
}
</script>

<style scoped lang="scss">
.license-wrapper {
  height: 100%;
  ::v-deep {
    .table-page-topbar {
      padding: 0 !important;
    }
  }
}
</style>
