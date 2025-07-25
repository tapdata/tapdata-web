<script>
import { logcollectorApi, taskApi } from '@tap/api'
import { VTable } from '@tap/component/src/base/v-table'
import i18n from '@tap/i18n'
import { openUrl } from '@tap/shared'
import { debounce } from 'lodash-es'
import TaskStatus from '../../components/TaskStatus.vue'

export default {
  name: 'Table',

  components: { VTable, TaskStatus },

  props: {
    taskId: {
      required: true,
      type: String,
    },
    params: {
      type: Object,
      default: () => {
        return {}
      },
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    height: {
      type: String,
      default: '100%',
    },
  },

  data() {
    return {
      keyword: '',
      currentTab: '',
      tabItems: [
        {
          label: i18n.t('packages_business_shared_mining_table_zhengzaiwajue'),
          value: 'running',
        },
        {
          label: i18n.t('packages_business_shared_mining_table_yitingzhiwajue'),
          value: 'stopped',
        },
      ],
      columns: [
        {
          type: 'selection',
          reserveSelection: true,
        },
        {
          label: i18n.t('packages_business_shared_mining_table_biaoming'),
          slotName: 'name',
          minWidth: 140,
        },
        {
          label: i18n.t('public_connection_name'),
          prop: 'connectionName',
          default: '-',
          minWidth: 200,
        },
        {
          label: i18n.t('packages_business_shared_mining_table_leijiwajue'),
          prop: 'allCount',
          minWidth: 150,
        },
        {
          label: i18n.t('packages_business_shared_mining_table_jinriwajue'),
          prop: 'todayCount',
          sortable: true,
          minWidth: 160,
        },
        {
          label: i18n.t('packages_business_shared_mining_table_jiaruwajueshi'),
          prop: 'joinTime',
          dataType: 'time',
          default: '-',
          width: 160,
        },
        {
          label: i18n.t(
            'packages_business_shared_mining_table_shoutiaorizhishi',
          ),
          prop: 'firstLogTime',
          dataType: 'time',
          default: '-',
          width: 160,
        },
        {
          label: i18n.t('packages_business_shared_mining_table_zuixinrizhishi'),
          prop: 'lastLogTime',
          dataType: 'time',
          default: '-',
          width: 160,
        },
      ],
      multipleSelection: [],
      visible: false,
      taskColumns: [
        {
          label: i18n.t('public_task_name'),
          prop: 'name',
          slotName: 'name',
        },
        {
          label: i18n.t('public_task_status'),
          prop: 'status',
          slotName: 'status',
        },
      ],
      taskData: [],
      submitLoading: false,
      recoverLoading: false,
      selectedConnectionId: '',
      connectionsList: [],
      listTotal: 0,
      order: '',
    }
  },
  watch: {
    params(oldval, newval) {
      if (newval?.nodeId !== oldval?.nodeId) {
        this.fetch() //node节点改变更新table数据
      }
    },
  },

  async created() {
    this.currentTab = this.tabItems[0].value
    this.connectionsList = await logcollectorApi.getConnectionIdsByTaskId(
      this.taskId,
    )
    // this.selectedConnectionId = this.connectionsList[0]?.id

    //定时轮询
    this.timeout = setInterval(() => {
      this.fetch(null, 0, true)
    }, 5000)
  },

  beforeUnmount() {
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
        size,
        order: this.order,
      }
      return logcollectorApi[
        this.currentTab === 'running' ? 'tableInfos' : 'excludeTableInfos'
      ](filter).then((data) => {
        const total = data.total || 0
        if (!keyword) {
          this.listTotal = total
        }
        return {
          total,
          data: (data.items || []).map((item) => {
            item.id = `${item.connectionId}_${item.name}`
            return item
          }),
        }
      })
    },

    fetch(...args) {
      this.$refs.table?.fetch?.(...args)
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
      const flag =
        (this.selectedConnectionId &&
          this.connectionsList.length <= 1 &&
          (this.listTotal <= 1 ||
            this.multipleSelection.length === this.listTotal)) ||
        (!this.selectedConnectionId &&
          this.multipleSelection.length === this.listTotal)
      if (flag)
        return this.$message.error(
          i18n.t('packages_business_shared_mining_table_shengyuyigelian'),
        )
      const { taskId } = this
      const tableNameMap = {}
      this.multipleSelection.forEach((t) => {
        if (!tableNameMap[t.connectionId]) {
          tableNameMap[t.connectionId] = []
        }
        tableNameMap[t.connectionId].push(t.name)
      })
      const filter = {
        taskId,
        type: 'task_by_collector_table',
        tableNameMap,
      }
      taskApi
        .taskConsoleRelations(filter)
        .then((data) => {
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
          this.multipleSelection.map((t) => {
            return {
              connectionId: t.connectionId,
              tableNames: [t.name],
            }
          }),
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
          this.multipleSelection.map((t) => {
            return {
              connectionId: t.connectionId,
              tableNames: [t.name],
            }
          }),
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
      clearInterval(this.timeout)
    },

    handleName({ syncType, name }) {
      const MAP = {
        migrate: 'migrateList',
        sync: 'dataflowList',
        logCollector: 'sharedMiningList',
        mem_cache: 'sharedCacheList',
      }
      const routeUrl = this.$router.resolve({
        name: MAP[syncType],
        query: {
          keyword: name,
        },
      })
      openUrl(routeUrl.href)
    },

    handleSortTable({ order, prop }) {
      this.order = order
        ? `${prop} ${order === 'ascending' ? 'ASC' : 'DESC'}`
        : ''
      this.fetch(1)
    },
  },
}
</script>

<template>
  <div class="flex flex-column">
    <span v-if="showTitle" class="fw-bold mb-4">{{
      $t('packages_business_shared_mining_table_wajuebiaoxinxi')
    }}</span>
    <div class="mb-3 flex">
      <span class="flex-shrink-0">{{
        $t('packages_business_shared_mining_table_yihebingdelian')
      }}</span>
      <ElSelect
        v-model="selectedConnectionId"
        class="ml-4"
        clearable
        @change="() => fetch()"
      >
        <ElOption
          v-for="item in connectionsList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </ElSelect>
    </div>
    <div class="flex justify-content-between mb-4 flex-wrap gap-4">
      <ElRadioGroup v-model="currentTab" @change="handleChangeTab">
        <ElRadioButton
          v-for="item in tabItems"
          :key="item.value"
          :label="item.value"
          >{{ item.label }}</ElRadioButton
        >
      </ElRadioGroup>
      <div>
        <ElInput
          v-model="keyword"
          class="search-input"
          :placeholder="$t('public_input_placeholder')"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <ElIcon>
              <ElIconSearch />
            </ElIcon>
          </template>
        </ElInput>
        <ElButton
          v-if="currentTab === 'running'"
          :disabled="!multipleSelection.length"
          type="primary"
          class="ml-4"
          @click="handleStop"
          >{{ $t('public_button_stop_mining') }}
        </ElButton>
        <ElButton
          v-else
          :loading="recoverLoading"
          :disabled="!multipleSelection.length"
          type="primary"
          class="ml-4"
          @click="handleRecover"
          >{{ $t('public_button_stop_recover') }}
        </ElButton>
      </div>
    </div>
    <VTable
      ref="table"
      :columns="columns"
      row-key="id"
      :remote-method="remoteMethod"
      :page-options="{
        layout: 'total, prev, pager, next, jumper',
      }"
      height="100%"
      :style="{
        height,
      }"
      hide-on-single-page
      @selection-change="handleSelectionChange"
      @sort-change="handleSortTable"
    >
      <template #name="{ row }">
        <ElTooltip
          v-if="row.externalStorageTableName"
          popper-class="user-select-all"
          transition=""
          placement="top"
          :content="row.externalStorageTableName"
        >
          <span style="border-bottom: 1px dashed">{{ row.name }}</span>
        </ElTooltip>
        <span v-else>{{ row.name }}</span>
      </template>
      <template #empty>
        <div>{{ $t('public_data_no_data') }}</div>
      </template>
    </VTable>

    <ElDialog
      v-model="visible"
      :title="$t('packages_business_shared_mining_table_tingzhiwajueti')"
      width="600px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <div class="flex mt-n6 pl-4">
        <VIcon size="18" class="color-warning">warning</VIcon>
        <span class="ml-3 mr-12">{{
          $t('packages_business_shared_mining_table_ninyaotingzhiwa')
        }}</span>
      </div>
      <VTable :columns="taskColumns" :data="taskData" :has-pagination="false">
        <template #name="{ row }">
          <ElLink type="primary" @click="handleName(row)">{{
            row.name
          }}</ElLink>
        </template>
        <template #status="{ row }">
          <TaskStatus :task="row" />
        </template>
      </VTable>
      <div class="text-end mt-10">
        <ElButton @click="visible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          :loading="submitLoading"
          type="primary"
          @click="handleSubmitStop"
          >{{ $t('public_button_confirm') }}
        </ElButton>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.search-input {
  width: 300px;
}
</style>
