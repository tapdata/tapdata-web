<template>
  <PageContainer>
    <template #actions>
      <el-button
        v-show="multipleSelection.length > 0 && isDaas"
        :disabled="$disabledReadonlyUserBtn()"
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
        :disabled="$disabledReadonlyUserBtn()"
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
      :remoteMethod="getData"
      @sort-change="handleSortTable"
      @selection-change="handleSelectionChange"
    >
      <template v-slot:search>
        <FilterBar v-model:value="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <el-table-column
        reserve-selection
        type="selection"
        width="45"
        align="center"
        :selectable="(row) => !row.hasChildren"
      >
      </el-table-column>
      <ElTableColumn show-overflow-tooltip prop="name" :label="$t('packages_business_shared_cache_name')">
        <template #default="{ row }">
          <ElLink style="display: inline" type="primary" @click.stop="checkDetails(row)">{{ row.name }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="connectionName"
        width="260"
        :label="$t('packages_business_shared_cache_column_connection')"
      ></ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="tableName"
        width="240"
        :label="$t('packages_business_shared_cache_column_table')"
      ></ElTableColumn>
      <ElTableColumn :label="$t('packages_business_shared_cache_status')" width="120">
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createTime" :label="$t('public_create_time')" width="160" sortable="createTime">
        <template v-slot="scope">
          {{ scope.row.createTimeFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="cacheTimeAt" width="160" :label="$t('packages_business_shared_cache_time')">
        <template v-slot="scope">
          {{ scope.row.cacheTimeAtFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn width="290" :label="$t('public_operation')" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              text
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id], row)"
            >
              {{ $t('public_button_start') }}
            </ElButton>
            <template v-else>
              <ElButton
                text
                v-if="row.status === 'stopping'"
                v-readonlybtn="'SYNC_job_operation'"
                type="primary"
                :disabled="row.btnDisabled.forceStop"
                @click="forceStop([row.id], row)"
              >
                {{ $t('public_button_force_stop') }}
              </ElButton>
              <ElButton
                text
                v-else
                v-readonlybtn="'SYNC_job_operation'"
                type="primary"
                :disabled="row.btnDisabled.stop"
                @click="stop([row.id])"
              >
                {{ $t('public_button_stop') }}
              </ElButton>
            </template>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_operation'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.edit || $disabledReadonlyUserBtn()"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElButton>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.lastStartDate"
              @click="handleDetails(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElButton>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.reset || $disabledReadonlyUserBtn()"
              @click="handleReset(row)"
            >
              {{ $t('public_button_reset') }}
            </ElButton>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.delete || $disabledReadonlyUserBtn()"
              @click="del(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </TablePage>
    <Editor ref="editor" @success="table.fetch(1)"></Editor>
    <Details ref="details" width="380px"></Details>
    <!-- 导入 -->
    <Upload v-if="isDaas" type="dataflow" :show-tag="false" ref="upload" @success="table.fetch()"></Upload>
  </PageContainer>
</template>

<script>
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash'

import i18n from '@tap/i18n'
import { externalStorageApi, sharedCacheApi, taskApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage, TaskStatus } from '../../components'
import { makeStatusAndDisabled } from '../../shared'

import Editor from './Editor'
import Details from './Details'
import Upload from '../../components/UploadDialog'
import PageContainer from '../../components/PageContainer.vue'

let timeout = null
export default {
  inject: ['buried'],
  components: { PageContainer, TablePage, FilterBar, TaskStatus, Editor, Details, Upload },
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      searchParams: {
        name: '',
        connectionName: '',
      },
      filterItems: [
        {
          placeholder: this.$t('packages_business_shared_cache_placeholder_task_name'),
          key: 'name',
          type: 'input',
        },
        {
          placeholder: this.$t('packages_business_shared_cache_placeholder_connection_name'),
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
    '$route.query'() {
      this.table.fetch(1)
    },
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.searchParams = Object.assign(this.searchParams, {
      name: this.$route.query?.keyword || '',
    })
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    getData({ page }) {
      let { current, size } = page
      let { name, connectionName } = this.searchParams
      let where = {}
      name && (where.name = { like: escapeRegExp(name), options: 'i' })
      connectionName &&
        (where.connectionName = {
          like: escapeRegExp(connectionName),
          options: 'i',
        })

      let filter = {
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
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map((item) => {
              item.createTimeFmt = item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'

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
      this.$confirm(this.$t('public_message_delete_confirm'), this.$t('public_message_title_prompt'), {
        type: 'warning',
      }).then((flag) => {
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
      const externalStorage = await externalStorageApi.get(row.externalStorageId)
      if (!externalStorage?.id) {
        this.$message.error(i18n.t('packages_business_shared_cache_list_qingxianxiugaiwai'))
        return
      }
      this.buried(this.taskBuried.start)
      let filter = {
        where: {
          id: ids[0],
        },
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi
          .batchStart(ids)
          .then((data) => {
            this.buried(this.taskBuried.start, '', { result: true })
            this.$message.success(data?.message || this.$t('public_message_operation_success'))
            this.table.fetch()
          })
          .catch(() => {
            this.buried(this.taskBuried.start, '', { result: false })
          })
      })
    },

    forceStop(ids, row) {
      let msgObj = this.getConfirmMessage('force_stop', row)
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false,
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then((data) => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
          this.table.fetch()
        })
      })
    },

    stop(ids) {
      this.$confirm(
        this.$t('packages_business_stop_confirm_message'),
        this.$t('packages_business_important_reminder'),
        {
          type: 'warning',
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then((data) => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
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
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      let strArr = this.$t('dataFlow_' + message).split('xxx')
      let msg = `
        <p>
          ${strArr[0]}
          <span class="color-primary">${task.name}</span>
          ${strArr[1]}
        </p>`
      return {
        msg,
        title: this.$t('dataFlow_' + title),
      }
    },

    handleReset(row) {
      const id = row.id
      let msgObj = this.getConfirmMessage('initialize', row)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchRenew([id]).then((data) => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
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
    color: map-get($color, danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
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
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: $fontBaseTitle;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: $fontBaseTitle;
      color: map-get($fontColor, dark);
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
    background: map-get($bgColor, normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: map-get($bgColor, white);
  }
}
</style>
