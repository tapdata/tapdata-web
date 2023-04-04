<template>
  <div class="flex flex-column">
    <div class="flex justify-content-between mb-4">
      <span v-if="showTitle" class="fw-bold">{{ $t('packages_business_shared_mining_table_wajuebiaoxinxi') }}</span>
      <ElInput
        class="search-input"
        v-model="keyword"
        prefix-icon="el-icon-search"
        :placeholder="$t('public_input_placeholder')"
        size="mini"
        clearable
        @input="handleSearch"
      ></ElInput>
    </div>
    <VTable
      :columns="columns"
      :remoteMethod="remoteMethod"
      :page-options="{
        layout: 'total, ->, prev, pager, next, sizes, jumper'
      }"
      ref="table"
      height="100%"
      :style="{
        height: height
      }"
    >
      <div slot="empty">{{ $t('public_data_no_data') }}</div>
    </VTable>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { debounce } from 'lodash'

import { VTable } from '@tap/component'
import { shareCdcTableMetricsApi } from '@tap/api'

export default {
  name: 'Table',

  components: { VTable },

  props: {
    taskId: {
      required: true,
      type: String
    },
    params: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: '100%'
    }
  },

  data() {
    return {
      keyword: '',
      columns: [
        {
          label: i18n.t('packages_business_shared_mining_table_biaoming'),
          prop: 'tableName',
          minWidth: 120
        },
        {
          label: i18n.t('public_connection_name'),
          prop: 'connectionName',
          default: '-',
          minWidth: 200
        },
        {
          label: i18n.t('packages_business_shared_mining_table_leijiwajue'),
          prop: 'allCount'
        },
        {
          label: i18n.t('packages_business_shared_mining_table_jinriwajue'),
          prop: 'count'
        },
        {
          label: i18n.t('packages_business_shared_mining_table_jiaruwajueshi'),
          prop: 'startCdcTime',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: i18n.t('packages_business_shared_mining_table_shoutiaorizhishi'),
          prop: 'firstEventTime',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: i18n.t('packages_business_shared_mining_table_zuixinrizhishi'),
          prop: 'currentEventTime',
          dataType: 'time',
          default: '-',
          width: 160
        }
      ]
    }
  },
  watch: {
    params(oldval, newval) {
      if (newval?.nodeId !== oldval?.nodeId) {
        this.remoteMethod() //node节点改变更新table数据
      }
    }
  },

  methods: {
    remoteMethod({ page }) {
      const { taskId, keyword } = this
      const { current, size } = page || { current: 1, size: 20 }
      const filter = Object.assign({}, this.params, {
        taskId,
        keyword,
        page: current,
        size: size
      })
      return shareCdcTableMetricsApi.listTask(filter).then(data => {
        return {
          total: data.total,
          data: data.items || []
        }
      })
    },

    fetch() {
      this.$refs.table?.fetch?.(1)
    },

    handleSearch: debounce(function () {
      this.fetch()
    }, 300)
  }
}
</script>

<style scoped>
.search-input {
  width: 300px;
}
</style>
