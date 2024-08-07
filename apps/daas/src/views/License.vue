<template>
  <section class="license-wrapper h-100">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <div slot="operation">
        <ElButton :loading="copyLoading" class="btn" size="mini" @click="copySid">{{
          $t('public_button_copy')
        }}</ElButton>
        <ElButton class="btn" type="primary" size="mini" @click="openDialog">{{ $t('public_event_update') }}</ElButton>
      </div>
      <ElTableColumn type="selection" width="45"></ElTableColumn>
      <ElTableColumn prop="hostname" :label="$t('license_node_name')" min-width="150"></ElTableColumn>
      <ElTableColumn prop="sid" :label="$t('license_node_sid')" min-width="150"></ElTableColumn>
      <ElTableColumn :label="$t('license_status')" min-width="150">
        <template #default="{ row }">
          <span :class="'color-' + row.status.color">{{ row.status.text }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="expirationDateFmt" :label="$t('license_expire_date')" min-width="160"></ElTableColumn>
      <ElTableColumn prop="lastUpdatedFmt" :label="$t('license_update_time')" min-width="160"></ElTableColumn>
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
</template>

<script>
import { TablePage } from '@tap/business'
import dayjs from 'dayjs'
import { licensesApi } from '@tap/api'
import Time from '@tap/shared/src/time'

export default {
  components: { TablePage },
  data() {
    return {
      copyLoading: false,
      dialogVisible: false,
      dialogLoading: false,
      license: ''
    }
  },
  methods: {
    getData({ page }) {
      let { current, size } = page
      let filter = {
        order: 'createTime DESC',
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
    openDialog() {
      if (this.$refs.table?.multipleSelection?.length) {
        this.license = ''
        this.dialogVisible = true
      } else {
        this.$message.warning(this.$t('license_select_node'))
      }
    },
    updateLicense() {
      this.dialogLoading = true
      let ids = this.$refs?.table?.multipleSelection?.map(item => item.sid)
      if (ids?.length) {
        licensesApi
          .updateLicense({
            sid: ids,
            license: this.license
          })
          .then(() => {
            this.$message.success(this.$t('license_renew_success'))
            this.$table.fetch()
          })
          .finally(() => {
            this.dialogLoading = false
          })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.license-wrapper {
  height: 100%;
}
</style>
