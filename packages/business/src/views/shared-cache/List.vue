<script>
import { externalStorageApi, sharedCacheApi, taskApi } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import TaskStatus from '../../components/TaskStatus.vue'
import Upload from '../../components/UploadDialog.vue'
import { makeStatusAndDisabled } from '../../shared'
import Details from './Details.vue'
import Editor from './Editor.vue'

export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    TaskStatus,
    Editor,
    Details,
    Upload,
  },
  inject: ['buried'],
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      searchParams: {
        name: '',
        connectionName: '',
      },
      filterItems: [
        {
          placeholder: this.$t(
            'packages_business_shared_cache_placeholder_task_name',
          ),
          key: 'name',
          type: 'input',
        },
        {
          placeholder: this.$t(
            'packages_business_shared_cache_placeholder_connection_name',
          ),
          key: 'connectionName',
          type: 'input',
        },
      ],
      order: 'cacheTimeAt DESC',
      taskBuried: {
        start: 'sharedMiningStart',
      },
      multipleSelection: [],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
  },
  mounted() {
    //定时轮询
    this.timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.searchParams = Object.assign(this.searchParams, {
      name: this.$route.query?.keyword || '',
    })
  },
  beforeUnmount() {
    clearInterval(this.timeout)
  },
  methods: {
    getData({ page }) {
      const { current, size } = page
      const { name, connectionName } = this.searchParams
      const where = {}
      name && (where.name = { like: escapeRegExp(name), options: 'i' })
      connectionName &&
        (where.connectionName = {
          like: escapeRegExp(connectionName),
          options: 'i',
        })

      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return sharedCacheApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = data?.items || []
          return {
            total: data?.total,
            data: list.map((item) => {
              item.createTimeFmt = item.createTime
                ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'

              makeStatusAndDisabled(item)
              return item
            }),
          }
        })
    },
    create() {
      this.handleEditor({
        id: '',
      })
    },
    checkDetails(row) {
      this.$refs.details.getData(row.id)
    },
    del(row = {}) {
      this.$confirm(
        this.$t('public_message_title_prompt'),
        this.$t('public_message_delete_confirm'),
      ).then((flag) => {
        if (flag) {
          sharedCacheApi.delete(row.id).then(() => {
            this.$message.success(this.$t('public_message_delete_ok'))
            this.table.fetch()
          })
        }
      })
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'cacheTimeAt'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    async start(ids, row) {
      const externalStorage = await externalStorageApi.get(
        row.externalStorageId,
      )
      if (!externalStorage?.id) {
        this.$message.error(
          i18n.t('packages_business_shared_cache_list_qingxianxiugaiwai'),
        )
        return
      }
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

    handleEditor(row = {}) {
      this.$refs.editor.open(row.id)
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
        name: 'SharedCacheMonitor',
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

    handleExport() {
      const ids = this.multipleSelection.map((t) => t.id)
      taskApi.export(ids)
    },

    handleImport() {
      this.$refs.upload.show()
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        v-show="multipleSelection.length > 0 && isDaas"
        v-readonlybtn="'SYNC_job_export'"
        class="btn message-button-cancel"
        @click="handleExport"
      >
        <span> {{ $t('public_button_export') }}</span>
      </el-button>
      <el-button
        v-if="isDaas"
        v-readonlybtn="'SYNC_job_import'"
        class="btn"
        @click="handleImport"
      >
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </el-button>
      <ElButton class="btn btn-create" type="primary" @click="create">
        <span> {{ $t('packages_business_shared_cache_button_create') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      row-key="id"
      :remote-method="getData"
      @sort-change="handleSortTable"
      @selection-change="handleSelectionChange"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        />
      </template>
      <el-table-column
        reserve-selection
        type="selection"
        width="32"
        align="center"
        :selectable="(row) => !row.hasChildren"
      />
      <ElTableColumn
        show-overflow-tooltip
        prop="name"
        :label="$t('packages_business_shared_cache_name')"
      >
        <template #default="{ row }">
          <ElLink
            style="display: inline"
            type="primary"
            @click.stop="checkDetails(row)"
            >{{ row.name }}</ElLink
          >
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="connectionName"
        width="260"
        :label="$t('packages_business_shared_cache_column_connection')"
      />
      <ElTableColumn
        show-overflow-tooltip
        prop="tableName"
        width="240"
        :label="$t('packages_business_shared_cache_column_table')"
      />
      <ElTableColumn
        :label="$t('packages_business_shared_cache_status')"
        width="120"
      >
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="createTime"
        :label="$t('public_create_time')"
        width="160"
        sortable="createTime"
      >
        <template #default="scope">
          {{ scope.row.createTimeFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="cacheTimeAt"
        width="160"
        :label="$t('packages_business_shared_cache_time')"
      >
        <template #default="scope">
          {{ scope.row.cacheTimeAtFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="290" :label="$t('public_operation')" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              text
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id], row)"
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
              :disabled="row.btnDisabled.edit"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
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
              @click="del(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </TablePage>
    <Editor ref="editor" @success="table.fetch(1)" />
    <Details ref="details" width="380px" />
    <!-- 导入 -->
    <Upload
      v-if="isDaas"
      ref="upload"
      type="dataflow"
      :show-tag="false"
      @success="table.fetch()"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.shared-cache-list-wrap {
  overflow: hidden;
}
.icon-status {
  display: block;
  width: 60px;
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.icon-status--success {
    color: #178061;
    background: #c4f3cb;
  }
  &.icon-status--warning {
    color: #d5760e;
    background: #ffe9cf;
  }
  &.icon-status--danger {
    color: var(--color-danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid var(--border-light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid var(--border-light);
    .label {
      font-size: var(--font-base-title);
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: var(--font-base-title);
      color: var(--text-dark);
    }
  }
}
.shared-cache--keys {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #edeeee;
  .title {
    padding: 0 16px;
    height: 38px;
    line-height: 38px;
    background: var(--bg-normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: var(--color-white);
  }
}
</style>
