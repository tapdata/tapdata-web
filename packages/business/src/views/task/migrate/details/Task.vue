<template>
  <div class="connection-container">
    <VTable
      :remoteMethod="remoteMethod"
      :columns="columns"
      :remote-data="id"
      height="100%"
      :has-pagination="false"
      ref="VTable"
    >
      <template v-slot:operation="scope">
        <div class="operate-columns">
          <ElButton size="mini" type="text" @click="handleDetail(scope.row)">{{
            $t('packages_business_button_details')
          }}</ElButton>
        </div>
      </template>
    </VTable>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { logcollectorApi } from '@tap/api'
import { VTable } from '@tap/component'

export default {
  name: 'Task',
  components: { VTable },
  props: {
    id: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      list: [],
      fetchTimer: null,
      columns: [
        {
          label: this.$t('packages_business_task_monitor_mining_task_name'),
          prop: 'name',
          slotName: 'name'
        },
        {
          label: this.$t('packages_business_task_monitor_mining_task_point_time'),
          prop: 'pointTime'
        },
        {
          label: this.$t('packages_business_task_monitor_mining_task_status'),
          prop: 'status'
        },
        {
          label: this.$t('packages_business_column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ]
    }
  },
  methods: {
    remoteMethod({ page }) {
      const { id } = this
      let { current, size } = page
      let filter = {
        where: {
          connections: [id]
        },
        limit: size,
        skip: size * (current - 1)
      }
      return logcollectorApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          let pointTime = new Date()

          return {
            total: data?.total,
            data: list.map(item => {
              item['pointTime'] = pointTime
              if (item.syncTimePoint === 'current') {
                item.pointTime = dayjs(pointTime).format('YYYY-MM-DD HH:mm:ss')
              } else {
                item.pointTime = item.syncTimeZone
              }
              item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },
    getTableData() {
      return this.$refs.VTable?.getData()
    },
    fetch() {
      this.$refs.VTable?.fetch(null, null, true)
    },
    handleDetail() {}
  }
}
</script>
