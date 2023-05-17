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
          >{{ $t('public_button_stop_mining') }}</ElButton
        >
        <ElButton
          v-else
          :disabled="!multipleSelection.length"
          type="primary"
          size="mini"
          class="ml-4"
          @click="handleRecover"
          >{{ $t('public_button_stop_recover') }}</ElButton
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
      :title="$t('packages_business_shared_mining_table_tingzhiwajueti')"
      width="600px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <div class="flex mt-n6 pl-4">
        <VIcon size="18" class="color-warning">warning</VIcon>
        <span class="ml-3 mr-12">{{ $t('packages_business_shared_mining_table_ninyaotingzhiwa') }}</span>
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
          label: i18n.t('packages_business_shared_mining_table_zhengzaiwajue'),
          value: 'running'
        },
        {
          label: i18n.t('packages_business_shared_mining_table_yitingzhiwajue'),
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
          label: i18n.t('public_task_name'),
          prop: 'taskName'
        },
        {
          label: i18n.t('public_task_status'),
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
