<template>
  <section class="license-wrapper">
    <TablePage ref="table" row-key="id" title="License管理" :remoteMethod="getData">
      <div slot="operation">
        <ElButton class="btn" size="mini">申请License</ElButton>
        <ElButton class="btn" type="primary" size="mini">更新License</ElButton>
      </div>
      <ElTableColumn prop="name" label="节点名" min-width="150"></ElTableColumn>
      <ElTableColumn prop="sid" label="节点sid" min-width="150"></ElTableColumn>
      <ElTableColumn label="License状态" min-width="150">
        <template #default="{ row }">
          <span :class="'color-' + statusMap[row.status].color">{{ statusMap[row.status].text }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="expireTimeFmt" label="License到期时间" min-width="150"></ElTableColumn>
      <ElTableColumn prop="updateTimeFmt" label="License更新时间" min-width="150"></ElTableColumn>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'

export default {
  components: { TablePage },
  data() {
    return {
      statusMap: {
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
          color: 'disable'
        }
      }
    }
  },
  methods: {
    getData({ page }) {
      let { current, size } = page
      let filter = {
        // order: 'createTime DESC',
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
            item.expireTimeFmt = this.$moment(item.expireTime).format('YYYY-MM-DD HH:mm:ss')
            item.updateTimeFmt = this.$moment(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
            return item
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.license-wrapper {
  height: 100%;
}
</style>
