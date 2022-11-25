<template>
  <div>
    <VTable :remoteMethod="remoteMethod" :remote-data="ids" :columns="columns" :hide-on-single-page="true">
      <template slot="desc" slot-scope="scope">
        <span>{{ mapData[scope.row.operation] }}</span>
      </template>
    </VTable>
  </div>
</template>

<script>
import { userLogsApi } from '@tap/api'
import { VTable } from '@tap/component'

export default {
  name: 'History',
  components: { VTable },
  props: {
    ids: {
      type: Array,
      default: () => []
    },
    operations: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      mapData: {
        start: this.$t('packages_business_task_start_task'),
        stop: this.$t('packages_business_task_stop_task'),
        forceStop: this.$t('packages_business_task_info_forced_stop_task')
      },
      columns: [
        {
          label: this.$t('packages_business_task_name'),
          prop: 'parameter1'
        },
        {
          label: this.$t('packages_business_task_info_running_time'),
          prop: 'createTime',
          dataType: 'time'
        },
        {
          label: this.$t('packages_business_task_info_operator'),
          prop: 'username'
        },
        {
          label: this.$t('packages_business_task_info_operator_content'),
          prop: 'desc',
          slotName: 'desc'
        }
      ]
    }
  },
  methods: {
    remoteMethod({ page }) {
      let { current, size } = page
      const { ids, operations } = this
      let where = {
        sourceId: {
          inq: ids
        },
        modular: 'migration',
        operation: {
          inq: operations
        }
      }
      let filter = {
        where: where,
        limit: size,
        skip: size * (current - 1)
      }
      return userLogsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total || 0,
            data: data?.items || []
          }
        })
    }
  }
}
</script>

<style scoped></style>
