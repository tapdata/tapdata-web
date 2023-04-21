<template>
  <Drawer
    v-loading="loading"
    class="app-details flex flex-column"
    :visible.sync="visible"
    width="800px"
    v-bind="$attrs"
    @visible="handleVisible"
  >
    <div class="mb-4">{{ details.value }}</div>
    <ElInput :value="details.desc" type="textarea" disabled class="mb-6"></ElInput>

    <DataServerList
      :show-filter="false"
      :columns="listColumns"
      :params="listParams"
      ref="table"
      class="flex-fill"
      @drawer-visible="handleDataServerListVisible"
    ></DataServerList>
  </Drawer>
</template>

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
        desc: ''
      },
      listColumns: [
        {
          label: this.$t('packages_business_data_server_list_fuwumingcheng'),
          prop: 'name',
          slotName: 'name',
          'min-width': 180,
          'show-overflow-tooltip': true
        },
        {
          label: this.$t('packages_business_data_server_list_fuwuzhuangtai'),
          'min-width': 100,
          prop: 'statusFmt',
          slotName: 'statusFmt'
        },
        {
          label: this.$t('public_operation'),
          width: 200,
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      listParams: {}
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
    }
  }
}
</script>

<style lang="scss" scoped>
.app-details {
  padding: 16px;
  z-index: 2000;
}
</style>
