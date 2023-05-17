<template>
  <div class="flex flex-column">
    <span v-if="showTitle" class="fw-bold mb-4">{{ $t('packages_business_shared_mining_table_wajuebiaoxinxi') }}</span>
    <div class="flex justify-content-between mb-4">
      <ElRadioGroup v-model="currentTab" size="mini" @change="handleChangeTab">
        <ElRadioButton v-for="item in tabItems" :label="item.value" :key="item.value">{{ item.label }}</ElRadioButton>
      </ElRadioGroup>
      <div>
        <ElInput
          class="search-input"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('public_input_placeholder')"
          size="small"
          clearable
          @input="handleSearch"
        ></ElInput>
        <ElButton
          v-if="currentTab === 'running'"
          :disabled="!multipleSelection.length"
          type="primary"
          size="mini"
          class="ml-4"
          @click="handleStop"
          >停止挖掘</ElButton
        >
        <ElButton
          v-else
          :disabled="!multipleSelection.length"
          type="primary"
          size="mini"
          class="ml-4"
          @click="handleRecover"
          >恢复挖掘</ElButton
        >
      </div>
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
      @selection-change="handleSelectionChange"
    >
      <div slot="empty">{{ $t('public_data_no_data') }}</div>
    </VTable>

    <ElDialog
      :visible.sync="visible"
      title="停止挖掘提醒"
      width="600px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <div class="flex mt-n6 pl-4">
        <VIcon size="18" class="color-warning">warning</VIcon>
        <span class="ml-3 mr-12"
          >您要停止挖掘的表正在被以下任务使用，停止挖掘后将会影响以下任务的正常同步，请确认是否要继续停止。</span
        >
      </div>
      <VTable :columns="taskColumns" :data="taskData"></VTable>
    </ElDialog>
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
      currentTab: '',
      tabItems: [
        {
          label: '正在挖掘',
          value: 'running'
        },
        {
          label: '已停止挖掘',
          value: 'stopped'
        }
      ],
      columns: [
        {
          type: 'selection'
        },
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
      ],
      multipleSelection: [],
      visible: false,
      taskColumns: [
        {
          label: '任务名称',
          prop: 'taskName'
        },
        {
          label: '任务状态',
          prop: 'taskStatus'
        }
      ],
      taskData: []
    }
  },
  watch: {
    params(oldval, newval) {
      if (newval?.nodeId !== oldval?.nodeId) {
        this.remoteMethod() //node节点改变更新table数据
      }
    }
  },

  created() {
    this.currentTab = this.tabItems[0].value
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
      console.log('remoteMethod', filter)
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
    }, 300),

    handleChangeTab() {
      this.fetch()
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    handleStop() {
      console.log('handleStop', this.multipleSelection.map(item => item.id))
      this.visible = true
    },

    handleRecover() {}
  }
}
</script>

<style scoped>
.search-input {
  width: 300px;
}
</style>
