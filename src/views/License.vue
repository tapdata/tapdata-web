<template>
  <section class="license-wrapper">
    <TablePage ref="table" row-key="id" title="License管理" :remoteMethod="getData">
      <div slot="operation">
        <ElButton :loading="copyLoading" class="btn" size="mini" @click="copySid">复制节点SID</ElButton>
        <ElButton class="btn" type="primary" size="mini" @click="openDialog">更新License</ElButton>
      </div>
      <ElTableColumn type="selection" width="45"></ElTableColumn>
      <ElTableColumn prop="hostname" label="节点名" min-width="150"></ElTableColumn>
      <ElTableColumn prop="sid" label="节点sid" min-width="150"></ElTableColumn>
      <ElTableColumn label="License状态" min-width="150">
        <template #default="{ row }">
          <span :class="'color-' + row.status.color">{{ row.status.text }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="expirationDateFmt" label="License到期时间" min-width="150"></ElTableColumn>
      <ElTableColumn prop="lastUpdatedFmt" label="License更新时间" min-width="150"></ElTableColumn>
    </TablePage>
    <ElDialog append-to-body title="更新License" :visible.sync="dialogVisible">
      <ElInput v-model.trim="license" type="textarea"></ElInput>
      <div slot="footer">
        <ElButton type="primary" size="mini" :disabled="!license" :loading="dialogLoading" @click="updateLicense"
          >更新</ElButton
        >
      </div>
    </ElDialog>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'

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
      return Promise.all([
        this.$api('license').count(),
        this.$api('license').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        let list = res.data
        return {
          total: countRes.data.count,
          data: list.map(item => {
            let expirationDate = this.$moment(item.expirationDate)
            let duration = expirationDate.valueOf() - Date.now()
            let status = 'normal'
            if (duration < 0) {
              status = 'expired'
            } else if (duration < 30 * 24 * 60 * 60 * 1000) {
              status = 'expiring'
            }
            item.status = {
              normal: {
                text: '正常',
                color: 'success'
              },
              expiring: {
                text: '即将到期',
                color: 'warning'
              },
              expired: {
                text: '已过期',
                color: 'info'
              }
            }[status]
            item.expirationDateFmt = expirationDate.format('YYYY-MM-DD HH:mm:ss')
            item.lastUpdatedFmt = this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
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
        this.$api('Licenses')
          .getSid(ids)
          .then(res => {
            let sid = res?.data?.sid
            if (sid) {
              this.$copyText(sid).then(() => {
                this.$message.success('已复制到剪贴板')
              })
            }
          })
          .finally(() => {
            this.copyLoading = false
          })
      } else {
        this.$message.warning('请先选择节点')
      }
    },
    openDialog() {
      if (this.$refs.table?.multipleSelection?.length) {
        this.license = ''
        this.dialogVisible = true
      } else {
        this.$message.warning('请先选择节点')
      }
    },
    updateLicense() {
      this.dialogLoading = true
      let ids = this.$refs?.table?.multipleSelection?.map(item => item.sid)
      if (ids?.length) {
        this.$api('Licenses')
          .updateLicense({
            sid: ids,
            license: this.license
          })
          .then(() => {
            this.$message.success('更新成功')
            this.$table.fetch()
          })
          .catch(err => {
            let msg = err?.response?.msg || err
            this.$message.error(msg)
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
