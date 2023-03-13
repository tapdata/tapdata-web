<template>
  <div class="flex flex-column">
    <div class="flex justify-content-between mb-4">
      <span v-if="showTitle" class="fw-bold">挖掘表信息</span>
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
    >
    </VTable>
  </div>
</template>

<script>
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
    }
  },

  data() {
    return {
      keyword: '',
      columns: [
        {
          label: '表名',
          prop: 'tableName'
        },
        {
          label: '连接名称',
          prop: 'connectionName',
          default: '-'
        },
        {
          label: '加入挖掘时间',
          prop: 'startCdcTime',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: '首条日志时间',
          prop: 'time2',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: '最新日志时间',
          prop: 'currentEventTime',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: '累计挖掘',
          prop: 'allCount'
        },
        {
          label: '今日挖掘',
          prop: 'count'
        }
      ]
    }
  },

  methods: {
    remoteMethod() {
      const { taskId, keyword } = this
      console.log('remoteMethod', taskId)
      const filter = Object.assign({}, this.params, {
        taskId,
        keyword
      })
      return shareCdcTableMetricsApi.get(filter).then(data => {
        return {
          total: data.total,
          data: data.items || []
        }
      })
    },

    fetch() {
      this.$refs.table?.fetch?.()
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
