<script>
import { appApi, logcollectorApi, taskApi } from '@tap/api'

import { FilterBar } from '@tap/component'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import { TablePage } from '../../components'

import PageContainer from '../../components/PageContainer.vue'
import Delete from './Delete'
import Details from './Details'
import Editor from './Editor'

let timeout = null
export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    Editor,
    Details,
    Delete,
  },
  inject: ['buried'],
  data() {
    return {
      searchParams: {
        name: '',
      },
      filterItems: [
        {
          placeholder: i18n.t(
            'packages_business_application_list_qingshuruyingyong',
          ),
          key: 'name',
          type: 'input',
        },
      ],
      order: 'createTime DESC',
      list: null,
      settingDialogVisible: false,
      editDialogVisible: false,
      loadingConfig: false,
      digSettingForm: {
        persistenceMode: 'Mem', // 存储模式
        persistenceMongodb_uri_db: '', // mongodb uri
        persistenceMongodb_collection: '', // mongodb tablename
        persistenceRocksdb_path: '', // rocksdb路径
        share_cdc_ttl_day: 3,
      },
      enumsItems: ['Mem', 'MongoDB', 'RocksDB'],
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      showEditSettingBtn: false, //禁用
      rules: {
        persistenceMongodb_uri_db: [
          {
            required: true,
            message: this.$t(
              'packages_business_shared_cdc_setting_select_mongodb_tip',
            ),
            trigger: 'blur',
          },
        ],
        persistenceMongodb_collection: [
          {
            required: true,
            message: this.$t(
              'packages_business_shared_cdc_setting_select_table_tip',
            ),
            trigger: 'blur',
          },
        ],
      },
      taskBuried: {
        start: 'sharedMiningStart',
      },
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },

    systemTimeZone() {
      const timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = `+${-timeZone}`
      }
      return systemTimeZone
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
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      const { current, size } = page
      const { name, connectionName } = this.searchParams
      const where = {
        item_type: 'app',
      }
      name &&
        (where.value = {
          options: 'i',
          like: escapeRegExp(name),
        })
      connectionName && (where.connectionName = connectionName)
      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return appApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = data?.items || []
          return {
            total: data?.total || 0,
            data: list.map((item) => {
              if (item.value === 'Default') {
                item.desc = i18n.t(
                  'packages_business_api_application_list_xitongmorenchuang',
                )
              }
              item.createTime = item.createTime
                ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              return item
            }),
          }
        })
    },

    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },

    handleSetting() {
      //是否可以全局设置
      this.loadingConfig = true
      logcollectorApi
        .check()
        .then((data) => {
          this.showEditSettingBtn = data?.data //true是可用，false是禁用 数据结构本身多了一层
          this.settingDialogVisible = true
          logcollectorApi
            .getSystemConfig()
            .then((data) => {
              if (data) {
                this.digSettingForm = data
              }
            })
            .finally(() => {
              this.loadingConfig = false
            })
        })
        .catch(() => {
          this.loadingConfig = false
        })
    },
    //保存全局挖掘设置
    saveSetting() {
      this.$refs.digSettingForm.validate((valid) => {
        if (valid) {
          if (this.digSettingForm?.persistenceMode === 'Mem') {
            this.digSettingForm.persistenceMongodb_uri_db = ''
            this.digSettingForm.persistenceMongodb_collection = ''
            this.digSettingForm.persistenceRocksdb_path = ''
          } else if (this.digSettingForm?.persistenceMode === 'MongoDB') {
            this.digSettingForm.persistenceRocksdb_path = ''
          } else if (this.digSettingForm?.persistenceMode === 'RocksDB') {
            this.digSettingForm.persistenceMongodb_uri_db = ''
            this.digSettingForm.persistenceMongodb_collection = ''
          }
          logcollectorApi.patchSystemConfig(this.digSettingForm).then(() => {
            this.settingDialogVisible = false
            this.$message.success(this.$t('public_message_save_ok'))
          })
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
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false,
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
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    handleEditor(task = {}) {
      this.$refs.editor.open(task.id)
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
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

    handleDetails(row = {}) {
      this.$refs.details.loadData(row, {
        where: {
          'listtags.id': row.id,
        },
      })
    },

    handleDelete(row = {}) {
      this.$refs.delete?.init(row)
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-readonlybtn="'new_model_creation'"
        type="primary"
        class="btn btn-create"
        @click="handleEditor"
      >
        <span>{{
          $t('packages_business_application_list_chuangjianyingyong')
        }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remote-method="getData"
      @sort-change="handleSortTable"
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
        :label="$t('packages_business_application_list_yingyongmingcheng')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <ElLink
            v-readonlybtn="'SYNC_job_edition'"
            type="primary"
            @click="handleDetails(row)"
          >
            {{ row.value }}
          </ElLink>
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        :label="$t('packages_business_application_list_zongApIshu')"
        prop="apiCount"
      />
      <el-table-column
        min-width="160"
        :label="$t('packages_business_application_list_yifabuAp')"
        prop="publishedApiCount"
      />
      <el-table-column
        prop="createTime"
        min-width="160"
        :label="$t('public_create_time')"
        sortable
      />
      <el-table-column
        width="220"
        fixed="right"
        :label="$t('public_operation')"
      >
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              :disabled="row.readOnly"
              type="primary"
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
              @click="handleDetails(row)"
            >
              {{ $t('public_button_details') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              :disabled="row.readOnly"
              type="primary"
              @click="handleDelete(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <Editor ref="editor" @success="table.fetch(1)" />
    <Details ref="details" />
    <Delete ref="delete" width="380px" @success="table.fetch(1)" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.share-list-wrap {
  height: 100%;
  .share-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      &.btn-create {
        margin-left: 5px;
      }
    }
  }
  :deep(.el-dialog__body) {
    padding: 10px 20px;
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-size: 12px;
        }
        .el-select,
        .el-date-editor {
          width: 100%;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.hide-current__dateTime {
  .el-picker-panel__footer {
    .el-button--text {
      display: none;
    }
  }
}
</style>
