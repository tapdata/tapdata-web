<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-readonlybtn="'datasource_creation'"
        class="btn btn-create"
        type="primary"
        size="mini"
        @click="handleCreate('pipeline')"
      >
        <span>{{ $t('packages_business_verification_list_renwuyizhixing') }}</span>
      </ElButton>
      <ElButton
        v-readonlybtn="'datasource_creation'"
        class="btn btn-create"
        type="primary"
        size="mini"
        @click="handleCreate('random')"
      >
        <span>{{ $t('packages_business_verification_list_renyibiaoshuju') }}</span>
      </ElButton>
    </template>

    <section class="data-verify-wrap bg-white section-wrap">
      <TablePage
        ref="table"
        row-key="id"
        :remoteMethod="getData"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortTable"
      >
        <template #search>
          <div class="search-bar">
            <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"></FilterBar>
          </div>
        </template>

        <template #multipleSelectionActions>
          <ElButton @click="handlePermissionsSettings">{{
            $t('packages_business_permissionse_settings_create_quanxianshezhi')
          }}</ElButton>
          <ElButton v-readonlybtn="'SYNC_category_application'" size="mini" class="btn" @click="handleExport">
            <i class="iconfont icon-daoru back-btn-icon"></i>
            <span> {{ $t('public_button_export') }}</span>
          </ElButton>
        </template>

        <el-table-column reserve-selection type="selection" width="38" align="center"></el-table-column>
        <el-table-column :label="$t('packages_business_verification_task_name')" min-width="250" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="ellipsis">{{ scope.row.name }}</div>
            <div class="font-color-slight">
              <span
                >{{ getInspectName(scope.row) }} (
                {{
                  scope.row.mode === 'manual'
                    ? $t('packages_business_verification_singleVerify')
                    : $t('packages_business_verification_repeatingVerify')
                }}
                )
              </span>
              <span v-if="!scope.row.enabled" class="font-color-slight">&nbsp;Disabled</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="sourceTotal"
          min-width="140"
          align="center"
          :label="$t('packages_business_verification_history_source_total_rows')"
        >
          <template slot-scope="scope">
            {{ scope.row.inspectMethod === 'hash' ? '-' : scope.row.sourceTotal || 0 }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('packages_business_verification_result_title')" min-width="180">
          <template slot-scope="scope">
            <div class="flex align-center">
              <template v-if="scope.row.InspectResult && ['waiting', 'done'].includes(scope.row.status)">
                <div v-if="scope.row.result !== 'passed'" class="data-verify__status error">
                  <i class="data-verify__icon el-icon-error"></i>
                  <span v-if="scope.row.inspectMethod === 'row_count' || scope.row.inspectMethod === 'hash'">
                    {{ $t('packages_business_verification_inconsistent') }}
                  </span>
                  <span v-if="scope.row.inspectMethod === 'field'">
                    {{ $t('packages_business_verification_contConsistent') }} {{ scope.row.difference_number }}
                  </span>
                  <span v-if="scope.row.inspectMethod === 'jointField'">
                    {{ $t('packages_business_verification_contConsistent') }} {{ scope.row.difference_number }}
                  </span>
                  <span v-if="scope.row.inspectMethod === 'cdcCount'">
                    {{ $t('packages_business_verification_contConsistent') }} {{ scope.row.difference_number }}
                  </span>
                </div>
                <div v-else class="data-verify__status success">
                  <i class="data-verify__icon el-icon-success"></i>
                  <span>{{ $t('packages_business_verification_consistent') }}</span>
                </div>
              </template>
              <div v-else-if="scope.row.status === 'error'" class="data-verify__status">
                <i class="data-verify__icon el-icon-error"></i>
                <span>{{ $t('public_status_error') }}</span>
                <ElLink v-if="scope.row.errorMsg" type="primary" class="ml-2" @click="handleError(scope.row)"
                  >{{ $t('public_button_check') }}
                </ElLink>
              </div>
              <div v-else-if="scope.row.status === 'waiting'" class="data-verify__status">-</div>
              <div v-else-if="scope.row.status !== 'done'" class="data-verify__status">
                <img style="width: 26px; vertical-align: middle" :src="loadingImg" />
                <span>{{ statusMap[scope.row.status] }}</span>
              </div>
              <div v-else>-</div>
              <!--            <VIcon v-if="scope.row.InspectResult && scope.row.InspectResult.parentId" class="ml-2" size="16"-->
              <!--              >ercijiaoyan</VIcon-->
              <!--            >-->
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('packages_business_verification_verifyStatus')" min-width="110" prop="status">
          <template slot-scope="scope">
            <span>{{ statusMap[scope.row.status] }}</span>
            <span v-if="scope.row.InspectResult && scope.row.status === 'running'">
              {{ `(${scope.row.InspectResult.progress ? Math.floor(scope.row.InspectResult.progress * 100) : 0}%)` }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_business_verification_verifyTime')"
          prop="lastStartTime"
          sortable="lastStartTime"
          min-width="170"
        ></el-table-column>
        <el-table-column :label="$t('public_operation')" width="260">
          <template v-if="isDaas" #header>
            <div class="flex align-center">
              <span>{{ $t('public_operation_available') }}</span>
              <ElTooltip
                class="ml-2"
                placement="top"
                :content="$t('packages_business_connections_list_wuquanxiandecao')"
              >
                <VIcon class="color-primary" size="14">info</VIcon>
              </ElTooltip>
            </div>
          </template>

          <template #default="{ row }">
            <ElLink type="primary" :disabled="!row.InspectResult" @click="toTableInfo(row.id)"
              >{{ $t('packages_business_verification_result_title') }}
            </ElLink>

            <template v-if="havePermission(row.permissionActions, 'Stop') && row.status === 'running'">
              <ElDivider direction="vertical" v-readonlybtn="'verify_job_edition'"></ElDivider>
              <ElLink
                v-readonlybtn="'verify_job_edition'"
                type="primary"
                :disabled="$disabledByPermission('verify_job_edition_all_data', row.user_id)"
                @click="stop(row.id)"
                >{{ $t('public_button_stop') }}
              </ElLink>
            </template>

            <template v-if="havePermission(row.permissionActions, 'Start') && row.status !== 'running'">
              <ElDivider direction="vertical"></ElDivider>
              <ElLink
                v-readonlybtn="'verify_job_edition'"
                type="primary"
                :disabled="
                  $disabledByPermission('verify_job_edition_all_data', row.user_id) ||
                  ['running', 'scheduling', 'stopping'].includes(row.status)
                "
                @click="startTask(row.id)"
                >{{ $t('packages_business_verification_executeVerifyTip') }}
              </ElLink>
            </template>

            <ElDivider direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'verify_job_edition'"
              type="primary"
              :disabled="!row.InspectResult"
              @click="history(row.id)"
              >{{ $t('packages_business_verification_historyTip') }}
            </ElLink>

            <template v-if="havePermission(row.permissionActions, 'Edit')">
              <ElDivider direction="vertical" v-readonlybtn="'verify_job_edition'"></ElDivider>
              <ElLink
                v-readonlybtn="'verify_job_edition'"
                type="primary"
                :disabled="
                  $disabledByPermission('verify_job_edition_all_data', row.user_id) ||
                  ['running', 'scheduling'].includes(row.status)
                "
                @click="goEdit(row.id, row.flowId)"
                >{{ $t('packages_business_verification_configurationTip') }}
              </ElLink>
            </template>

            <template v-if="havePermission(row.permissionActions, 'Delete')">
              <ElDivider direction="vertical"></ElDivider>
              <ElLink
                v-readonlybtn="'verify_job_edition'"
                type="primary"
                :disabled="$disabledByPermission('verify_job_delete_all_data', row.user_id)"
                @click="remove(row.id, row)"
                >{{ $t('public_button_delete') }}
              </ElLink>
            </template>
          </template>
        </el-table-column>
      </TablePage>
      <PermissionseSettingsCreate ref="permissionseSettingsCreate"></PermissionseSettingsCreate>
    </section>
  </PageContainer>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash'
import { FilterBar } from '@tap/component'
import { VIcon } from '@tap/component'
import { TablePage } from '@tap/business'
import { inspectApi, metadataInstancesApi } from '@tap/api'
import { statusMap, inspectMethod, typeList as verifyTypeList } from './const'
import PageContainer from '../../components/PageContainer.vue'
import PermissionseSettingsCreate from '../../components/permissionse-settings/Create'
import { ErrorMessage } from '../../components/error-message'

let timeout = null
export default {
  components: {
    PermissionseSettingsCreate,
    PageContainer,
    TablePage,
    VIcon,
    FilterBar
  },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      searchParams: {
        keyword: '',
        inspectMethod: '',
        mode: '',
        enabled: '',
        result: ''
      },
      filterItems: [],
      loadingImg: require('@tap/assets/icons/loading.svg'),
      order: 'last_updated DESC',
      inspectMethod,
      statusMap,
      validList: [
        { label: this.$t('public_select_option_all'), value: '' },
        { label: this.$t('packages_business_verification_check_same'), value: 'passed' },
        { label: this.$t('packages_business_verification_count_difference'), value: 'row_count' },
        { label: this.$t('packages_business_verification_content_difference'), value: 'valueDiff' },
        { label: 'Error', value: 'error' }
      ],
      verifyTypeList,
      multipleSelection: [],
      moreAuthority: this.$has('verify_job_delete_all_data')
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    }
  },
  created() {
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.getFilterItems()
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    inspectMethodChange(val) {
      if (val !== 'row_count' && this.searchParams.result === 'row_count') {
        this.searchParams.result = ''
      }
      this.table.fetch(1)
    },
    // 批量导出
    handleExport() {
      let ids = this.multipleSelection.map(item => item.id)
      let where = {
        _id: {
          in: ids
        }
      }
      metadataInstancesApi.download(where, 'Inspect')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getData({ page }) {
      let { current, size } = page
      let { keyword, inspectMethod, mode, enabled, result } = this.searchParams
      let where = {}
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        let filterObj = { like: escapeRegExp(keyword), options: 'i' }
        where['$or'] = [{ name: filterObj }, { dataFlowName: filterObj }]
      }
      if (enabled) {
        where.enabled = enabled == 1
      }
      if (result) {
        if (result === 'error') {
          where.status = 'error'
        } else if (result === 'passed') {
          where.status = { neq: 'error' }
          where.result = 'passed'
        } else if (result === 'row_count') {
          where.status = { neq: 'error' }
          where.result = 'failed'
          inspectMethod = this.searchParams.inspectMethod = 'row_count'
        } else {
          where.status = { neq: 'error' }
          where.result = 'failed'
          if (inspectMethod === 'row_count') {
            inspectMethod = this.searchParams.inspectMethod = ''
          }
          where.inspectMethod = { neq: 'row_count' }
        }
      }
      inspectMethod && (where.inspectMethod = inspectMethod)
      mode && (where.mode = mode)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return inspectApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map(item => {
              let result = item.InspectResult
              let sourceTotal = '-'
              let targetTotal = '-'
              if (result) {
                sourceTotal = result.source_total
                targetTotal = result.target_total
              }
              item.lastStartTime = item.lastStartTime ? dayjs(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              item.sourceTotal = sourceTotal
              item.targetTotal = targetTotal
              if (item.inspectMethod === 'hash') {
                item.sourceTotal = '-'
                item.targetTotal = '-'
              }
              return item
            })
          }
        })
    },
    handleCommand(command, node) {
      let ids = ''
      if (node) {
        ids = node.id
      }
      this[command](ids, node)
    },
    toTableInfo(id) {
      this.$router.push({
        name: 'dataVerifyDetails',
        params: {
          id
        }
      })
    },
    history(id) {
      this.$router.push({
        name: 'dataVerifyHistory',
        params: {
          id
        }
      })
    },
    startTask(id) {
      inspectApi
        .update(
          {
            id: id
          },
          { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: '' }
        )
        .then(() => {
          this.$message.success(this.$t('packages_business_verification_startVerify'))
          this.table.fetch()
        })
    },
    remove(id, row) {
      let name = row.name
      this.$confirm(
        `${this.$t('packages_business_verification_deleteMessage')} ${name}?`,
        this.$t('packages_business_dataFlow_importantReminder'),
        {
          confirmButtonText: this.$t('public_button_delete'),
          cancelButtonText: this.$t('public_button_cancel'),
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        inspectApi.delete(id).then(() => {
          this.$message.success(this.$t('public_message_delete_ok'))
          this.table.fetch()
        })
      })
    },
    goEdit(id, flowId) {
      const query = {
        taskMode: flowId ? 'pipeline' : 'random'
      }
      if (flowId) {
        query['flowId'] = flowId
      }
      this.$router.push({
        name: 'dataVerificationEdit',
        params: {
          id: id
        },
        query
      })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_verification_type'),
          key: 'inspectMethod',
          type: 'select-inner',
          items: this.verifyTypeList,
          selectedWidth: '200px'
        },
        {
          label: this.$t('packages_business_verification_check_frequency'),
          key: 'mode',
          type: 'select-inner',
          items: [
            { label: this.$t('public_select_option_all'), value: '' },
            { label: this.$t('packages_business_verification_single'), value: 'MANUALLY_SPECIFIED_BY_THE_USER' },
            { label: this.$t('packages_business_verification_repeating'), value: 'cron' }
          ]
        },
        {
          label: this.$t('packages_business_verification_is_enabled'),
          key: 'enabled',
          type: 'select-inner',
          items: [
            { label: this.$t('public_select_option_all'), value: '' },
            { label: this.$t('packages_business_verification_job_enable'), value: 1 },
            { label: this.$t('packages_business_verification_job_disable'), value: 2 }
          ]
        },
        {
          label: this.$t('packages_business_verification_result_title'),
          key: 'result',
          type: 'select-inner',
          items: this.validList
        },
        {
          placeholder: this.$t('packages_business_verification_task_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    handleError(row = {}) {
      ErrorMessage(row.errorMsg)
    },
    getInspectName(row = {}) {
      if (row.tasks?.some(t => !!t.source.columns || !!t.target.columns)) {
        return i18n.t('packages_business_verification_list_biaobufenziduan')
      }
      return this.inspectMethod[row.inspectMethod]
    },
    stop(id = '') {
      inspectApi
        .update(
          {
            id: id
          },
          { status: 'stopping' }
        )
        .then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
          this.table.fetch()
        })
    },
    handleCreate(type) {
      this.$router.push({ name: 'dataVerificationCreate', query: { taskMode: type } })
    },
    havePermission(data = [], type = '') {
      if (!this.isDaas) return true
      return data.includes(type)
    },
    handlePermissionsSettings() {
      this.$refs.permissionseSettingsCreate.open(this.multipleSelection, 'Inspect')
    }
  }
}
</script>

<style lang="scss" scoped>
.data-verify-wrap {
  height: 100%;
  padding: 0 24px 24px 24px;

  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }

  .search-bar {
    display: flex;

    .item {
      margin-right: 10px;
    }
  }

  .btn + .btn {
    margin-left: 10px;
  }

  .btn {
    i.iconfont {
      font-size: 12px;
    }

    &.btn-dropdowm {
      margin-left: 5px;
    }
  }

  .data-verify__status {
    display: flex;
    align-items: center;
  }

  .data-verify__icon {
    margin-left: -5px;
    width: 26px;
    text-align: center;
    font-size: 14px;
  }
}

::v-deep {
  .verify-list-error-msg {
    .el-message-box__message {
      max-height: 450px;
      overflow-y: auto;
      word-break: break-word;
    }
  }
}
</style>
<style lang="scss">
.data-verify-wrap {
  .el-table--border td {
    border-right: 0;
  }

  // .el-table--border th {
  //   border-right: 1px solid #dcdfe6;
  // }
}
</style>
