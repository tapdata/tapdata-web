<template>
  <section class="share-list-wrap h-100">
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton
          v-readonlybtn="'new_model_creation'"
          type="primary"
          class="btn btn-create"
          size="mini"
          @click="handleEditor"
        >
          <span>{{ $t('packages_business_application_list_chuangjianyingyong') }}</span>
        </ElButton>
      </div>
      <el-table-column
        min-width="250"
        :label="$t('packages_business_application_list_yingyongmingcheng')"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="handleDetails(row)">
            {{ row.value }}
          </ElLink>
        </template>
      </el-table-column>
      <el-table-column min-width="160" :label="$t('packages_business_application_list_zongApIshu')" prop="apiCount">
      </el-table-column>
      <el-table-column
        min-width="160"
        :label="$t('packages_business_application_list_yifabuAp')"
        prop="publishedApiCount"
      >
      </el-table-column>
      <el-table-column prop="createTime" min-width="160" :label="$t('public_create_time')" sortable> </el-table-column>
      <el-table-column width="220" fixed="right" :label="$t('public_operation')">
        <template #default="{ row }">
          <div class="table-operations">
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              :disabled="row.readOnly"
              type="primary"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="handleDetails(row)">
              {{ $t('public_button_details') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              :disabled="row.readOnly"
              type="primary"
              @click="handleDelete(row)"
            >
              {{ $t('public_button_delete') }}
            </ElLink>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <Editor ref="editor" @success="table.fetch(1)"></Editor>
    <Details ref="details" width="380px"></Details>
    <Delete ref="delete" width="380px" @success="table.fetch(1)"></Delete>
  </section>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash'
import { logcollectorApi, taskApi, appApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage } from '@tap/business'

import Editor from './Editor'
import Details from './Details'
import Delete from './Delete'

let timeout = null
export default {
  inject: ['buried'],
  components: {
    TablePage,
    FilterBar,
    Editor,
    Details,
    Delete
  },
  data() {
    return {
      searchParams: {
        name: ''
      },
      filterItems: [
        {
          placeholder: i18n.t('packages_business_application_list_qingshuruyingyong'),
          key: 'name',
          type: 'input'
        }
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
        share_cdc_ttl_day: 3
      },
      enumsItems: ['Mem', 'MongoDB', 'RocksDB'],
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      showEditSettingBtn: false, //禁用
      rules: {
        persistenceMongodb_uri_db: [
          {
            required: true,
            message: this.$t('packages_business_shared_cdc_setting_select_mongodb_tip'),
            trigger: 'blur'
          }
        ],
        persistenceMongodb_collection: [
          { required: true, message: this.$t('packages_business_shared_cdc_setting_select_table_tip'), trigger: 'blur' }
        ]
      },
      taskBuried: {
        start: 'sharedMiningStart'
      }
    }
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
  },
  computed: {
    table() {
      return this.$refs.table
    },

    systemTimeZone() {
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      return systemTimeZone
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { current, size } = page
      let { name, connectionName } = this.searchParams
      let where = {
        item_type: 'app'
      }
      name &&
        (where.value = {
          options: 'i',
          like: escapeRegExp(name)
        })
      connectionName && (where.connectionName = connectionName)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return appApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          return {
            total: data?.total || 0,
            data: list.map(item => {
              if (item.value === 'Default') {
                item.desc = i18n.t('packages_business_api_application_list_xitongmorenchuang')
              }
              item.createTime = item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              return item
            })
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
        .then(data => {
          this.showEditSettingBtn = data?.data //true是可用，false是禁用 数据结构本身多了一层
          this.settingDialogVisible = true
          logcollectorApi
            .getSystemConfig()
            .then(data => {
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
      this.$refs.digSettingForm.validate(valid => {
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
      let filter = {
        where: {
          id: ids[0]
        }
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi
          .batchStart(ids)
          .then(data => {
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
        dangerouslyUseHTMLString: true
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then(data => {
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
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
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
        title: this.$t('dataFlow_' + title)
      }
    },

    handleDetails(row = {}) {
      this.$refs.details.loadData(row, {
        where: {
          'listtags.id': row.id
        }
      })
    },

    handleDelete(row = {}) {
      this.$refs.delete?.init(row)
    }
  }
}
</script>

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
  ::v-deep {
    .el-dialog__body {
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
