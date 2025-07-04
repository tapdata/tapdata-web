<script>
import { taskApi } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import TaskStatus from '../../components/TaskStatus.vue'
import { makeStatusAndDisabled, TASK_TYPE_MAP } from '../../shared'

let timeout = null
export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    TaskStatus,
  },
  inject: ['buried'],
  data() {
    return {
      searchParams: {
        keyword: '',
      },
      filterItems: [
        {
          placeholder: this.$t('public_task_name'),
          key: 'keyword',
          type: 'input',
        },
      ],
      order: 'createTime DESC',
      list: null,
      taskBuried: {
        start: 'heartbeatStart',
      },
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },

    colWidth() {
      const { locale } = this.$i18n
      return locale === 'en'
        ? {
            taskType: 140,
            status: 145,
            operation: 340,
          }
        : {
            taskType: 80,
            status: 110,
            operation: 280,
          }
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      const { current, size } = page
      const where = {
        syncType: 'connHeartbeat',
      }
      const { keyword } = this.searchParams
      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      if (keyword && keyword.trim()) {
        where.name = { like: escapeRegExp(keyword), options: 'i' }
      }
      return taskApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = data?.items || []
          return {
            total: data?.total || 0,
            data: list.map((item) => {
              item.createTime = dayjs(item.createTime).format(
                'YYYY-MM-DD HH:mm:ss',
              )
              item.taskType = TASK_TYPE_MAP[item.type] || ''
              makeStatusAndDisabled(item)
              if (item.status === 'edit') {
                item.btnDisabled.start = false
              }
              return item
            }),
          }
        })
    },

    start(ids) {
      this.buried(this.taskBuried.start)
      const filter = {
        where: {
          id: ids[0],
        },
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi
          .batchStart(ids)
          .then((data) => {
            this.buried(this.taskBuried.start, '', { result: true })
            this.$message.success(
              data?.message || this.$t('public_message_operation_success'),
            )
            this.table.fetch()
          })
          .catch(() => {
            this.buried(this.taskBuried.start, '', { result: false })
          })
      })
    },

    forceStop(ids, row) {
      const msgObj = this.getConfirmMessage('force_stop', row)
      this.$confirm(this.$t('public_message_title_prompt'), msgObj.msg, {
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    stop(ids) {
      this.$confirm(
        this.$t('packages_business_important_reminder'),
        this.$t('packages_business_stop_confirm_message'),
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    handleDetails(task = {}) {
      this.openRoute({
        name: 'HeartbeatMonitor',
        params: {
          id: task.id,
        },
      })
    },

    getConfirmMessage(operateStr, task) {
      const title = `${operateStr}_confirm_title`,
        message = `${operateStr}_confirm_message`
      const strArr = this.$t(`dataFlow_${message}`).split('xxx')
      const msg = `
        <p>
          ${strArr[0]}
          <span class="color-primary">${task.name}</span>
          ${strArr[1]}
        </p>`
      return {
        msg,
        title: this.$t(`dataFlow_${title}`),
      }
    },

    handleReset(row) {
      const id = row.id
      const msgObj = this.getConfirmMessage('initialize', row)
      this.$confirm(msgObj.title, msgObj.msg, {
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchRenew([id]).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    del(ids, item = {}, canNotList) {
      this.$confirm(
        this.$t('packages_ldp_src_tablepreview_querenshanchu'),
        this.$t('packages_business_shared_mining_list_shanchurenwus', {
          val1: item.name,
        }),
        {
          dangerouslyUseHTMLString: true,
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchDelete(ids).then((data) => {
          this.table.fetch()
          this.responseDelHandler(
            data,
            this.$t('public_message_delete_ok'),
            canNotList,
          )
        })
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remote-method="getData"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        />
      </template>
      <el-table-column
        min-width="250"
        :label="$t('public_name')"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('public_task_type')"
        :min-width="colWidth.taskType"
        prop="taskType"
      />
      <el-table-column
        min-width="110"
        prop="status"
        :label="$t('packages_business_shared_list_status')"
      >
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        min-width="160"
        :label="$t('public_create_time')"
        sortable
      />
      <el-table-column
        width="240"
        fixed="right"
        :label="$t('public_operation')"
      >
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              text
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id])"
            >
              {{ $t('public_button_start') }}
            </ElButton>
            <template v-else>
              <ElButton
                v-if="row.status === 'stopping'"
                v-readonlybtn="'SYNC_job_operation'"
                text
                type="primary"
                :disabled="row.btnDisabled.forceStop"
                @click="forceStop([row.id], row)"
              >
                {{ $t('public_button_force_stop') }}
              </ElButton>
              <ElButton
                v-else
                v-readonlybtn="'SYNC_job_operation'"
                text
                type="primary"
                :disabled="row.btnDisabled.stop"
                @click="stop([row.id])"
              >
                {{ $t('public_button_stop') }}
              </ElButton>
            </template>
            <ElDivider
              v-readonlybtn="'SYNC_job_operation'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.lastStartDate"
              @click="handleDetails(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.reset"
              @click="handleReset(row)"
            >
              {{ $t('public_button_reset') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.delete"
              @click="del([row.id], row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </TablePage>
  </PageContainer>
</template>
