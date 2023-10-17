<template>
  <ElDialog
    :title="$t('public_message_title_prompt')"
    width="40%"
    v-model:visible="visible"
    @close="handleClose"
  >
    <span>{{
      $t('packages_business_connections_list_gailianjieyibei', {
        val1: data.total,
      })
    }}</span>
    <el-table class="mt-4" height="250px" :data="data.items">
      <el-table-column
        min-width="240"
        :label="$t('public_task_name')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <span class="dataflow-name link-primary flex">
            <ElLink
              role="ellipsis"
              type="primary"
              class="justify-content-start ellipsis block"
              :class="['name']"
              @click.stop="goTaskList(row)"
              >{{ row.name }}</ElLink
            >
          </span>
        </template>
      </el-table-column>
    </el-table>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
export default {
  name: 'UsedTaskDialog',
  props: {
    value: Boolean,
    data: {
      type: Object,
      default: () => {
        return {
          items: [],
          total: 0,
        }
      },
    },
  },
  data() {
    return {
      visible: false,
    }
  },
  watch: {
    value(v) {
      this.visible = v
    },
  },
  methods: {
    handleClose() {
      this.visible = false
      $emit(this, 'update:value', this.visible)
    },

    goTaskList(item = {}) {
      const map = {
        migrate: 'migrateList',
        sync: 'dataflowList',
        logCollector: 'sharedMiningList',
        mem_cache: 'sharedCacheList',
      }
      let routeUrl = this.$router.resolve({
        name: map[item.syncType],
        query: { keyword: item.name },
      })
      window.open(routeUrl.href, '_blank')
      // if (item?.syncType === 'migrate') {
      //   this.$router.push({
      //     name: 'migrateList',
      //     query: {
      //       keyword: item.name
      //     }
      //   })
      // } else {
      //   this.$router.push({
      //     name: 'dataflowList',
      //     query: {
      //       keyword: item.name
      //     }
      //   })
      // }
    },
  },
  emits: ['update:value'],
}
</script>
