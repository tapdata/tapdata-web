<script>
import { Drawer } from '@tap/component'
import DataServerList from '../data-server/List'

export default {
  name: 'Details',

  components: { Drawer, DataServerList },

  data() {
    return {
      loading: false,
      visible: false,
      details: {
        value: '',
        desc: '',
      },
      listColumns: [
        {
          label: this.$t('packages_business_data_server_list_fuwumingcheng'),
          prop: 'name',
          slotName: 'name',
          'min-width': 180,
          'show-overflow-tooltip': true,
        },
        {
          label: this.$t('packages_business_data_server_list_fuwuzhuangtai'),
          'min-width': 100,
          prop: 'statusFmt',
          slotName: 'statusFmt',
        },
        {
          label: this.$t('public_operation'),
          width: 200,
          prop: 'operation',
          slotName: 'operation',
        },
      ],
      listParams: {},
    }
  },

  methods: {
    loadData(data, opt = {}) {
      this.details = data
      this.listParams = opt
      this.$refs.table?.fetch()
      this.visible = true
    },

    handleVisible() {
      this.visible = false
    },

    handleDataServerListVisible(val) {
      if (!val) {
        setTimeout(() => {
          this.loadData(this.details, this.listParams)
        }, 80)
      }
    },
  },
}
</script>

<template>
  <Drawer
    v-bind="$attrs"
    v-model:visible="visible"
    v-loading="loading"
    class="app-details"
    :class="{ 'flex flex-column': visible }"
    width="800px"
    @visible="handleVisible"
  >
    <DataServerList
      ref="table"
      :show-filter="false"
      :columns="listColumns"
      :params="listParams"
      class="flex-fill"
      mode="blank"
      @drawer-visible="handleDataServerListVisible"
    >
      <template #title>
        <div class="min-w-0 overflow-hidden">
          <div class="fs-5 py-4 font-color-dark">
            {{ details.value }}
            <div
              v-if="details.desc"
              class="mt-1 fs-7 font-color-sslight ellipsis"
            >
              {{ details.desc }}
            </div>
          </div>
        </div>
      </template>
    </DataServerList>
  </Drawer>
</template>

<style lang="scss" scoped>
.app-details {
  padding: 16px;
  z-index: 2000;
}
</style>
