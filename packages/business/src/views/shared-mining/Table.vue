<template>
  <div class="flex flex-column">
    <span v-if="showTitle" class="fw-bold mb-4">{{ $t('packages_business_shared_mining_table_wajuebiaoxinxi') }}</span>
    <div class="mb-3 flex">
      <span class="flex-shrink-0">{{ $t('packages_business_shared_mining_table_yihebingdelian') }}</span>
      <ElSelect v-model="selectedConnectionId" size="mini" class="ml-4" @change="() => fetch">
        <ElOption v-for="item in connectionsList" :label="item.name" :value="item.id" :key="item.id"></ElOption>
      </ElSelect>
    </div>
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
          :loading="recoverLoading"
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
      v-if="selectedConnectionId"
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
      hide-on-single-page
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
      <VTable :columns="taskColumns" :data="taskData" :has-pagination="false">
        <template #status="{ row }">
          <TaskStatus :task="row" />
        </template>
      </VTable>
      <div class="text-end mt-10">
        <ElButton @click="visible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton :loading="submitLoading" type="primary" @click="handleSubmitStop">{{
          $t('public_button_confirm')
        }}</ElButton>
      </div>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { debounce } from 'lodash'

import { VTable } from '@tap/component'
import { logcollectorApi, taskApi } from '@tap/api'
import { TaskStatus } from '../../components'

let timeout = null

export default {
  name: 'Table',

  components: { VTable, TaskStatus },

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
          prop: 'name',
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
          prop: 'todayCount'
        },
        {
          label: i18n.t('packages_business_shared_mining_table_jiaruwajueshi'),
          prop: 'joinTime',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: i18n.t('packages_business_shared_mining_table_shoutiaorizhishi'),
          prop: 'firstLogTime',
          dataType: 'time',
          default: '-',
          width: 160
        },
        {
          label: i18n.t('packages_business_shared_mining_table_zuixinrizhishi'),
          prop: 'lastLogTime',
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
          prop: 'name'
        },
        {
          label: i18n.t('public_task_status'),
          prop: 'status',
          slotName: 'status'
        }
      ],
      taskData: [],
      submitLoading: false,
      recoverLoading: false,
      selectedConnectionId: '',
      connectionsList: [],
      listTotal: 0
    }
  },
  watch: {
    params(oldval, newval) {
      if (newval?.nodeId !== oldval?.nodeId) {
        this.fetch() //node节点改变更新table数据
      }
    }
  },

  async created() {
    this.currentTab = this.tabItems[0].value
    this.connectionsList = await logcollectorApi.getConnectionIdsByTaskId(this.taskId)
    this.selectedConnectionId = this.connectionsList[0]?.id

    //定时轮询
    timeout = setInterval(() => {
      this.fetch(null, 0, true)
    }, 5000)
  },

  destroyed() {
    this.clearTimer()
  },

  methods: {
    remoteMethod({ page }) {
      const { taskId, keyword } = this
      const { current, size } = page || { current: 1, size: 20 }
      const filter = {
        taskId,
        connectionId: this.selectedConnectionId,
        keyword,
        page: current,
        size: size
      }
      return logcollectorApi[this.currentTab === 'running' ? 'tableInfos' : 'excludeTableInfos'](filter).then(data => {
        this.listTotal = data.total || 0
        return {
          total: this.listTotal,
          data: data.items || []
        }
      })
    },

    fetch() {
      this.$refs.table?.fetch?.(...arguments)
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
      if (this.connectionsList.length <= 1 && this.listTotal <= 1)
        return this.$message.error(i18n.t('packages_business_shared_mining_table_shengyuyigelian'))
      const { taskId } = this
      let tableNameMap = {}
      this.multipleSelection.forEach(t => {
        if (!tableNameMap[t.connectionId]) {
          tableNameMap[t.connectionId] = []
        }
        tableNameMap[t.connectionId].push(t.name)
      })
      const filter = {
        taskId,
        type: 'task_by_collector_table',
        tableNameMap
      }
      taskApi
        .taskConsoleRelations(filter)
        .then(data => {
          this.taskData = data
        })
        .finally(() => {
          this.visible = true
        })
    },

    handleSubmitStop() {
      this.submitLoading = true
      logcollectorApi
        .exclusionTables(
          this.taskId,
          this.multipleSelection.map(t => {
            return {
              connectionId: t.connectionId,
              tableNames: [t.name]
            }
          })
        )
        .then(() => {
          this.visible = false
          this.$message.success(this.$t('public_message_operation_success'))
          this.fetch()
        })
        .finally(() => {
          this.submitLoading = false
        })
    },

    handleRecover() {
      this.recoverLoading = true
      logcollectorApi
        .addTables(
          this.taskId,
          this.multipleSelection.map(t => {
            return {
              connectionId: t.connectionId,
              tableNames: [t.name]
            }
          })
        )
        .then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
          this.fetch()
        })
        .finally(() => {
          this.recoverLoading = false
        })
    },

    clearTimer() {
      clearInterval(timeout)
    }
  }
}
</script>

<style scoped>
.search-input {
  width: 300px;
}
</style>
