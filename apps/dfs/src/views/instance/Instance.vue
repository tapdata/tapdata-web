<template>
  <section class="instance-wrapper g-panel-container" v-loading="loading" v-if="$route.name === 'Instance'">
    <div class="main">
      <div class="instance-operation">
        <div class="instance-operation-left">
          <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="fetch"></FilterBar>
        </div>
        <div class="instance-operation-right">
          <ElButton type="primary" @click="createAgent" :loading="createAgentLoading">
            <span>{{ $t('agent_button_create') }}</span>
          </ElButton>
        </div>
      </div>
      <ElTable
        class="instance-table table-border mt-4"
        height="100%"
        :data="list"
        @sort-change="sortChange"
        @row-click="rowClick"
      >
        <ElTableColumn min-width="200px" :label="$t('agent_name')">
          <template slot-scope="scope">
            <div class="flex">
              <div>
                <InlineInput
                  :class="['inline-input', 'color-primary', { 'cursor-pointer': scope.row.agentType !== 'Cloud' }]"
                  :value="scope.row.name"
                  :icon-config="{ class: 'color-primary', size: '12' }"
                  type="icon"
                  @click-text="handleDetails(scope.row)"
                  @save="updateName($event, scope.row.id)"
                ></InlineInput>
              </div>
              <div class="flex align-items-center">
                <img
                  v-if="scope.row.agentType === 'Cloud'"
                  src="../../../public/images/only_test.png"
                  alt=""
                  class="ml-3"
                  style="height: 18px"
                />
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('agent_status')" width="120">
          <template slot-scope="scope">
            <StatusTag type="text" :status="scope.row.status" default-status="Stopped"></StatusTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('agent_task_number')" width="120">
          <template slot-scope="scope">
            <ElTooltip effect="dark" placement="top" :disabled="!scope.row.metric || !scope.row.metric.runningTaskNum">
              <div slot="content">
                <template v-for="(item, index) in scope.row.metric.dataFlows">
                  <div v-if="index < 3" :key="item.id">
                    {{ $t('task_name') }}{{ $t('field_mapping_field_mapping_dialog_') }}{{ item.name }}
                  </div>
                </template>
                <ElLink
                  v-if="scope.row.metric.runningTaskNum > 3"
                  class="block text-center"
                  type="primary"
                  @click="toDataFlow(scope.row.tmInfo.agentId)"
                  >{{ $t('data_see_more') }}</ElLink
                >
              </div>
              <ElLink type="primary" class="ml-7" @click="toDataFlow(scope.row.tmInfo.agentId)">{{
                scope.row.metric ? scope.row.metric.runningTaskNum : 0
              }}</ElLink>
            </ElTooltip>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('agent_version')" width="200">
          <template slot-scope="scope">
            <div class="flex align-items-center">
              <span v-if="showVersionFlag(scope.row)">{{ scope.row.spec && scope.row.spec.version }}</span>
              <template v-if="showUpgradeIcon(scope.row)">
                <ElTooltip
                  v-if="upgradingFlag(scope.row)"
                  class="ml-1"
                  effect="dark"
                  placement="top"
                  :content="getTooltipContent(scope.row, 'upgrading')"
                  key="upgrading"
                >
                  <div class="upgrading-box">
                    <VIcon class="v-icon animation-rotate" size="14" color="rgb(61, 156, 64)">loading-circle</VIcon>
                    <ElProgress
                      v-if="upgradingProgres(scope.row) !== undefined"
                      class="upgrading-progress"
                      type="circle"
                      color="rgb(61, 156, 64)"
                      :percentage="upgradingProgres(scope.row)"
                      :show-text="false"
                      :format="
                        value => {
                          return value
                        }
                      "
                    ></ElProgress>
                  </div>
                </ElTooltip>
                <ElTooltip
                  v-else-if="upgradeFailedFlag(scope.row)"
                  class="ml-1"
                  effect="dark"
                  placement="top"
                  :content="getTooltipContent(scope.row, 'fail')"
                  key="fail"
                >
                  <VIcon size="20" class="cursor-pointer block" @click="showUpgradeErrorDialogFnc(scope.row)"
                    >upgrade-error-color</VIcon
                  >
                </ElTooltip>
                <ElTooltip
                  v-else-if="!upgradeFlag(scope.row)"
                  class="ml-1"
                  effect="dark"
                  placement="top"
                  :content="getTooltipContent(scope.row)"
                  key="done"
                >
                  <VIcon size="20" class="cursor-pointer block" @click="showUpgradeDialogFnc(scope.row)"
                    >upgrade-color</VIcon
                  >
                </ElTooltip>
              </template>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createAt" sortable="custom" :label="$t('agent_create_time')" width="150">
          <template slot-scope="scope">
            <span>{{ formatTime(scope.row.createAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('list_operation')" width="300">
          <template slot-scope="scope">
            <ElButton size="mini" type="text" :disabled="deployBtnDisabled(scope.row)" @click="toDeploy(scope.row)">{{
              $t('agent_button_deploy')
            }}</ElButton>
            <ElDivider direction="vertical"></ElDivider>
            <ElButton
              size="mini"
              type="text"
              :disabled="stopBtnDisabled(scope.row)"
              :loading="scope.row.btnLoading.stop"
              @click="handleStop(scope.row)"
              >{{ $t('button_stop') }}</ElButton
            >
            <ElDivider direction="vertical"></ElDivider>
            <ElButton
              size="mini"
              type="text"
              :loading="scope.row.btnLoading.delete"
              :disabled="delBtnDisabled(scope.row)"
              @click="handleDel(scope.row)"
              >{{ $t('button_delete') }}</ElButton
            >
            <ElButton
              size="mini"
              type="text"
              :disabled="scope.row.status !== 'Running'"
              :loading="loadingUpload"
              @click="handleUpload(scope.row.id)"
              >{{ $t('dfs_instance_instance_rizhishangchuan') }}
              <span v-if="scope.row.uploadRatio">{{ scope.row.uploadRatio }}</span>
            </ElButton>
            <ElButton size="mini" type="text" @click="open(scope.row)">{{
              $t('dfs_instance_instance_rizhi')
            }}</ElButton>
          </template>
        </ElTableColumn>
        <div v-if="!isSearching" class="instance-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('agent_list_empty_desc1') }}</span>
            <span class="color-primary cursor-pointer fs-7 ml-1" @click="createAgent">{{
              $t('agent_button_create')
            }}</span>
            <span>{{ $t('agent_list_empty_desc2') }}</span>
          </div>
        </div>
        <div v-else class="instance-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('data_no_find_result') }}</span>
            <span class="color-primary cursor-pointer fs-7 ml-1" @click="reset">{{ $t('link_back_to_list') }}</span>
          </div>
        </div>
      </ElTable>
      <ElPagination
        background
        class="mt-3"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="page.size"
        :total="page.total"
        @size-change="fetch(1)"
        @current-change="fetch"
      >
      </ElPagination>
      <ElDialog :visible.sync="upgradeDialog" width="562px" top="20vh" :title="$t('dfs_instance_instance_agent')">
        <div>
          <div class="flex upgrade-mb24">
            <div class="imgBox flex justify-content-center align-items-center">
              <img :src="getImg('vector')" alt="" />
            </div>
            <div class="ml-6">
              <div class="upgrade-version">
                {{ $t('dfs_instance_instance_banbenhao') }}{{ currentVersionInfo.version }}
              </div>
              <div class="upgrade-version mt-1">
                {{ $t('dfs_instance_instance_anzhuangbao') }}{{ currentVersionInfo.packageSize }}
              </div>
              <div class="upgrade-version mt-1">
                {{ $t('dfs_instance_instance_yujianzhuangshi') }}{{ currentVersionInfo.estimatedUpgradeTime }}
              </div>
            </div>
          </div>
          <div class="upgrade-desc upgrade-mb16" v-if="currentVersionInfo.changeList">
            {{ $t('dfs_instance_instance_xinzenggongneng') }}
          </div>
          <ul class="upgrade-mb24" v-if="currentVersionInfo.changeList">
            <li
              style="white-space: pre-wrap"
              class="upgrade-mb8 upgrade-text"
              v-html="currentVersionInfo.changeList"
            ></li>
          </ul>
          <div class="upgrade-desc upgrade-mb8">{{ $t('dfs_instance_instance_bencigengxinbao') }}</div>
          <div class="upgrade-text upgrade-mb16">
            {{ $t('dfs_instance_instance_ruxuliaojiegeng')
            }}<el-link type="primary" target="_blank" :href="currentVersionInfo.releaseNoteUri"> Release Notes</el-link>
          </div>
        </div>
        <div class="dialog-btn flex justify-content-end mt-6">
          <div class="w-50" v-if="showAutoUpgrade">
            <ElButton type="primary" :disabled="disabledAutoUpgradeBtn" @click="autoUpgradeFnc">{{
              $t('agent_button_auto_upgrade')
            }}</ElButton>
          </div>
          <div class="text-end w-50">
            <ElButton type="primary" @click="manualUpgradeFnc">{{ $t('agent_button_manual_upgrade') }}</ElButton>
          </div>
        </div>
        <div v-if="disabledAutoUpgradeBtn" class="mt-1 fs-8 text-break">({{ $t('agent_tip_auto_upgrade') }})</div>
      </ElDialog>
      <!--   升级失败   -->
      <ElDialog :visible.sync="upgradeErrorDialog" width="450px" top="30vh" center>
        <div class="dialog-content text-center">{{ $t('agent_dialog_upgrade_fail') }}</div>
        <div class="dialog-btn flex justify-content-evenly mt-6">
          <div class="text-center">
            <ElButton type="primary" :disabled="disabledAutoUpgradeBtn" @click="autoUpgradeFnc">{{
              $t('button_retry')
            }}</ElButton>
          </div>
          <div>
            <ElButton type="primary" @click="manualUpgradeFnc">{{ $t('agent_button_manual_upgrade') }}</ElButton>
          </div>
        </div>
      </ElDialog>
      <!--  详情    -->
      <Details v-model="showDetails" :detail-id="detailId" @closed="detailsClosedFnc" @load-data="loadDetailsData">
        <div slot="title">
          <InlineInput
            :value="selectedRow.name"
            :icon-config="{ class: 'color-primary' }"
            :input-style="{ width: '140px' }"
            type="icon"
            word-break
            @save="updateName($event, selectedRow.id)"
          ></InlineInput>
        </div>
        <div slot="operation" class="flex">
          <VButton
            :loading="selectedRow.btnLoading.deploy"
            :disabled="deployBtnDisabled(selectedRow)"
            type="primary"
            class="flex-fill"
            @click="toDeploy(selectedRow)"
          >
            <VIcon size="12">deploy</VIcon>
            <span class="ml-1">{{ $t('agent_button_deploy') }}</span>
          </VButton>
          <VButton
            :loading="selectedRow.btnLoading.stop"
            :disabled="stopBtnDisabled(selectedRow)"
            type="primary"
            class="flex-fill"
            @click="handleStop(selectedRow)"
          >
            <VIcon size="12">stop</VIcon>
            <span class="ml-1">{{ $t('button_stop') }}</span>
          </VButton>
          <VButton
            :loading="selectedRow.btnLoading.delete"
            :disabled="delBtnDisabled(selectedRow)"
            class="flex-fill"
            @click="handleDel(selectedRow)"
          >
            <VIcon size="12">delete</VIcon>
            <span class="ml-1">{{ $t('button_delete') }}</span>
          </VButton>
        </div>
      </Details>
      <!-- 日志上传   -->
      <ElDialog
        :visible.sync="downloadDialog"
        :before-close="handleClose"
        :title="$t('dfs_instance_instance_bendirizhixia')"
        width="1250px"
        custom-class="download-dialog"
      >
        <el-button
          class="mb-4 float-end"
          type="primary"
          :loading="loadingUpload"
          @click="handleUpload(currentAgentId)"
          >{{ $t('dfs_instance_instance_rizhishangchuan') }}</el-button
        >
        <VTable
          :data="downloadList"
          :columns="downloadListCol"
          v-loading="loadingLogTable"
          ref="tableName"
          :has-pagination="false"
        >
          <template slot="status" slot-scope="scope">
            <span>{{ statusMaps[scope.row.status].text }} </span>
            <span v-if="scope.row.uploadAgentLog && scope.row.uploadAgentLog.uploadRatio !== 100"
              >{{ scope.row.uploadAgentLog.uploadRatio }} %
            </span>
          </template>
          <template slot="fileSize" slot-scope="scope">
            <span>{{ handleUnit(scope.row.fileSize) }}</span>
          </template>
          <template slot="operation" slot-scope="scope">
            <ElButton size="mini" type="text" :disabled="scope.row.status === 0" @click="handleDownload(scope.row)">{{
              $t('dfs_instance_instance_xiazai')
            }}</ElButton>
            <ElButton
              size="mini"
              type="text"
              :disabled="scope.row.status === 0"
              @click="handleDeleteUploadLog(scope.row)"
              >{{ $t('button_delete') }}</ElButton
            >
          </template>
        </VTable>
        <span slot="footer" class="dialog-footer">
          <el-pagination
            @current-change="getDownloadList"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="downloadTotal"
          >
          </el-pagination>
        </span>
      </ElDialog>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import i18n from '@/i18n'
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import { INSTANCE_STATUS_MAP, AGENT_STATUS_MAP_EN } from '../../const'
import Details from './Details'
import timeFunction from '@/mixins/timeFunction'
import { buried } from '@/plugins/buried'
import { VIcon, FilterBar, VTable } from '@tap/component'
import { handleUnit } from '@/util'
// import OSS from 'ali-oss'

let timer = null

export default {
  components: {
    InlineInput,
    StatusTag,
    VIcon,
    Details,
    FilterBar,
    VTable
  },
  mixins: [timeFunction],
  data() {
    return {
      loading: true,
      createAgentLoading: false,
      searchParams: {
        status: '',
        keyword: ''
      },
      list: [],
      page: {
        current: 0,
        size: 10,
        total: 0
      },
      order: 'createAt desc',
      statusMap: INSTANCE_STATUS_MAP,
      upgradeDialog: false,
      upgradeErrorDialog: false,
      selectedRow: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false
        }
      },
      agentStatus: 'stop',
      version: '',
      upgradeList: [], // 升级列表
      currentVersionInfo: '',
      showDetails: false,
      detailId: null,
      filterItems: [],
      //日志下载
      downloadDialog: false,
      downloadListCol: [
        {
          label: i18n.t('dfs_instance_instance_wenjianming'),
          prop: 'id'
        },
        {
          label: i18n.t('dfs_instance_instance_wenjiandaxiao'),
          slotName: 'fileSize'
        },
        {
          label: i18n.t('dfs_instance_instance_shangchuanshijian'),
          prop: 'createAt',
          dataType: 'time'
        },
        {
          label: i18n.t('dfs_instance_instance_wenjianzhuangtai'),
          slotName: 'status'
        },

        {
          label: i18n.t('dfs_instance_instance_wenjianxiazai'),
          slotName: 'operation'
        }
      ],
      downloadList: [],
      currentAgentId: '',
      currentStatus: '',
      downloadTotal: 0,
      currentPage: 1,
      pageSize: 10,
      statusMaps: AGENT_STATUS_MAP_EN,
      timer: null,
      loadingLogTable: false,
      loadingUpload: false
    }
  },
  computed: {
    statusItems() {
      let result = []
      let filter = ['Creating', 'Running', 'Stopped']
      filter.forEach(el => {
        result.push({
          label: this.$t('agent_status_' + el.toLowerCase()),
          value: el
        })
      })
      return result
    },
    disabledAutoUpgradeBtn() {
      return this.selectedRow?.status !== 'Running'
    },
    showAutoUpgrade() {
      let flag = true
      let result = ['v1.0.1-6', 'v1.0.2']
      if (result.includes(this.selectedRow?.spec?.version)) {
        flag = false
      }
      return flag
    },
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    }
  },
  watch: {
    $route(route) {
      if (route.name === 'Instance') {
        this.searchParams.status = route.query.status || ''
        let pageNum = JSON.stringify(route.query) === '{}' ? undefined : 1
        this.fetch(pageNum)
      }
    }
  },
  created() {
    this.init()
    timer = setInterval(() => {
      // let list = this.list || []
      let flag = true
      // list.forEach(item => {
      //   if (['Stopping'].includes(item.status) || (this.showUpgradeIcon(item) && this.upgradingFlag(item))) {
      //     flag = true
      //   }
      // })
      if (flag && this.$route.name === 'Instance') {
        this.fetch(null, true)
      }
    }, 10000)
  },
  beforeDestroy() {
    clearInterval(timer)
    timer = null
  },
  methods: {
    handleUnit(limit) {
      return handleUnit(limit)
    },
    init() {
      let query = this.$route.query
      let { detailId, ...searchParams } = Object.assign(this.searchParams, query)
      this.searchParams = searchParams
      this.getFilterItems()
      this.fetch()
      // 是否触发创建agent
      if (query?.create) {
        this.createAgent()
        // 清除创建标记
        this.$router.replace({
          name: 'Instance'
        })
      } else if (detailId) {
        this.$nextTick(() => {
          this.showDetails = true
          this.detailId = detailId
        })
      }
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: i18n.t('agent_status'),
          key: 'status',
          type: 'select-inner',
          items: this.statusItems
        },
        {
          placeholder: i18n.t('instance_Instance_anIDShiLi'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    async getVersion(id) {
      return this.$axios.get('api/tcm/config/version/latest/' + id)
    },
    search() {
      this.$router.replace({
        name: 'Instance',
        query: this.searchParams
      })
    },
    fetch(pageNum, hideLoading) {
      if (!hideLoading) {
        this.loading = true
      }
      let current = pageNum || this.page.current
      let { keyword, status } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        where.$or = [{ name: { $regex: keyword, $options: 'i' } }, { clusterId: { $regex: keyword, $options: 'i' } }]
      }
      if (status) {
        where.status = {
          $in: status.split(',')
        }
      }
      let filter = {
        where,
        size: this.page.size,
        page: current,
        sort: [this.order]
      }

      // 升级状态
      // let getUpgradeList = await this.getUpgradeList()
      this.$axios
        .get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(async data => {
          let list = data.items || []
          this.list = list.map(item => {
            // item.status = item.status === 'Running' ? 'Running' : item.status === 'Stopping' ? 'Stopping' : 'Offline'
            item.deployDisable = item.tmInfo.pingTime || false
            // item.updateStatus = ''
            if (!item.tmInfo) {
              item.tmInfo = {}
            }
            item.btnLoading = {
              deploy: false,
              stop: false,
              delete: false
            }
            return item
          })

          // 版本号
          if (this.list?.[0]?.id) {
            let getVersion = await this.getVersion(this.list[0]?.id)
            //升级弹窗使用
            let { packageSize, changeList, estimatedUpgradeTime, version, releaseNoteUri } = getVersion
            this.currentVersionInfo = {
              packageSize: (packageSize ? (packageSize / (1024 * 1024)).toFixed(1) + ' MB' : '-') || '-',
              changeList: changeList || '',
              estimatedUpgradeTime:
                (estimatedUpgradeTime
                  ? (Math.floor(estimatedUpgradeTime / 60) % 60) + i18n.t('dfs_instance_instance_fenzhong')
                  : '-') || '-',
              releaseNoteUri: releaseNoteUri,
              version: version
            }
            this.version = getVersion?.version
          }

          this.page.total = data.total
          if (!list.length && data.total > 0) {
            setTimeout(() => {
              this.fetch(this.page.current - 1)
            }, 0)
          }
        })
        .finally(() => {
          if (!hideLoading) {
            this.loading = false
          }
        })
    },
    getImg(name) {
      return require(`../../../public/images/agent/${name}.png`)
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createAt'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
    },
    rowClick(row) {
      this.selectedRow = row
    },
    loadDetailsData(data) {
      if (this.selectedRow?.id) {
        return
      }
      this.selectedRow = data
    },
    detailsClosedFnc() {
      this.showDetails = false
      this.$router.replace({
        name: 'Instance',
        query: this.searchParams
      })
    },
    toDeploy(row) {
      if (this.deployBtnDisabled(row)) {
        return
      }
      buried('agentDeploy')
      let downloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: row?.id
        }
      })

      window.open(downloadUrl.href, '_blank')
    },
    // 停止
    handleStop(row, from) {
      if (this.stopBtnDisabled(row)) {
        return
      }
      let flag = false
      if (from === 'details' && this.selectedRow?.id === row.id) {
        row = this.selectedRow
      }
      if (row.metric?.runningTaskNum) {
        flag = true
      }
      let message = flag ? this.$t('agent_button_stop_tip_running') : this.$t('agent_button_stop_tip_no_running')
      this.$confirm(message, this.$t('agent_button_stop_tip'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(res => {
        if (res) {
          if (row.btnLoading) {
            row.btnLoading.stop = true
          }
          this.$axios
            .patch('api/tcm/agent/stop/' + row.id)
            .then(() => {
              this.$message.success(this.$t('agent_button_stop_msg_success'))
              this.fetch()
            })
            .catch(() => {
              this.$message.error(this.$t('agent_button_stop_msg_fail'))
            })
            .finally(() => {
              if (row.btnLoading) {
                row.btnLoading.stop = false
              }
            })
        }
      })
    },
    // 删除
    handleDel(row) {
      if (this.delBtnDisabled(row)) {
        return
      }
      let runningTaskNum = row?.metric?.runningTaskNum ?? 0 // 运行中的任务数
      let noDelFlag = runningTaskNum > 0 // 不能删除
      let title = null
      let message = this.$t('agent_button_delete_confirm_title')
      if (noDelFlag) {
        title = this.$t('operate_delete_fail')
        message = this.$t('agent_button_delete_confirm_msg')
      }
      this.$confirm(message, title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel'),
        customClass: 'delete-agent'
      }).then(res => {
        if (res) {
          if (noDelFlag) {
            return
          }
          if (row.btnLoading) {
            row.btnLoading.delete = true
          }
          if (row.agentType === 'Cloud') {
            this.$axios
              .post('api/tcm/orders/cancel', {
                instanceId: row.id
              })
              .then(() => {
                this.$message.success(this.$t('agent_button_delete_success'))
                this.detailsClosedFnc()
                this.fetch()
              })
              .catch(() => {
                this.$message.error(this.$t('agent_button_delete_fail'))
              })
              .finally(() => {
                if (row.btnLoading) {
                  row.btnLoading.delete = false
                }
              })
          } else {
            this.$axios
              .patch('api/tcm/agent/delete/' + row.id)
              .then(() => {
                this.$message.success(this.$t('agent_button_delete_success'))
                this.detailsClosedFnc()
                this.fetch()
              })
              .catch(() => {
                this.$message.error(this.$t('agent_button_delete_fail'))
              })
              .finally(() => {
                if (row.btnLoading) {
                  row.btnLoading.delete = false
                }
              })
          }
        }
      })
    },

    updateName(val, id) {
      this.loading = true
      this.$axios
        .post('api/tcm/agent', {
          id,
          name: val
        })
        .then(() => {
          this.$message.success(this.$t('operate_update_success'))
          this.fetch()
        })
        .catch(() => {
          this.loading = false
        })
    },
    reset() {
      this.searchParams = {
        status: '',
        keyword: ''
      }
      this.fetch(1)
    },
    toDataFlow(id) {
      this.$router.push({
        name: 'migrateList',
        query: {
          agentId: id,
          status: 'running'
        }
      })
    },
    showUpgradeDialogFnc(row) {
      this.rowClick(row)
      // windons不支持自动升级
      if (this.isWindons(row)) {
        this.manualUpgradeFnc()
        return
      }
      this.upgradeDialog = true
    },
    showUpgradeErrorDialogFnc() {
      this.upgradeErrorDialog = true
    },
    autoUpgradeFnc() {
      this.closeDialog() // 关闭升级方式选择窗口
      if (this.selectedRow?.metric?.runningTaskNum) {
        this.$alert(this.$t('agent_auto_upgrade_tip_running_task'))
        return
      }
      let row = this.selectedRow
      this.$axios.get('api/tcm/config/version/latest/' + row.id).then(({ token }) => {
        this.$axios.get(`api/tcm/productRelease/${this.version}`).then(downloadUrl => {
          this.$axios
            .post('tm/api/clusterStates/updataAgent', {
              downloadUrl,
              process_id: this.selectedRow?.tmInfo?.agentId,
              version: this.version,
              token: token
            })
            .then(() => {
              this.$message.success(this.$t('agent_auto_upgrade_tip_start'))
              this.fetch()
            })
        })
      })
    },
    manualUpgradeFnc() {
      let row = this.selectedRow
      this.closeDialog() // 关闭升级方式选择窗口
      if (row.metric?.runningTaskNum) {
        this.$alert(this.$t('agent_auto_upgrade_tip_running_task'))
      } else {
        let routeUrl = this.$router.resolve({
          name: 'UpgradeVersion',
          query: {
            agentId: row.id
          }
        })
        window.open(routeUrl.href, '_blank')
      }
    },
    closeDialog() {
      this.upgradeDialog = false
      this.upgradeErrorDialog = false
    },
    getTooltipContent(row, type) {
      let result
      switch (type) {
        case 'preparing':
        case 'downloading':
        case 'upgrading':
          result =
            this.$t('agent_auto_upgrade_tip_upgrading') +
            (this.upgradingProgres(row) === undefined
              ? ''
              : i18n.t('instance_Instance_tHIST', {
                  val1: this.$t('agent_auto_upgrade_tip_progress'),
                  val2: this.upgradingProgres(row)
                }))
          break
        case 'fail':
        case 'error':
          result = this.$t('agent_auto_upgrade_tip_fail')
          break
        default:
          result = this.$t('agent_auto_upgrade_tip_have_new')
          break
      }
      return result
    },
    // agent详情
    handleDetails(data) {
      if (data.agentType === 'Cloud') {
        return
      }
      // this.selectedRow = data
      this.showDetails = true
      this.detailId = data.id
      let query = this.$route.query
      this.$router
        .replace({
          name: 'Instance',
          query: Object.assign({}, query, {
            detailId: this.selectedRow.id
          })
        })
        .catch(() => {})
    },
    // 创建Agent
    createAgent() {
      this.createAgentLoading = true
      this.$axios
        .post('api/tcm/orders', {
          agentType: 'Local'
        })
        .then(data => {
          buried('agentCreate')
          this.fetch()
          this.toDeploy({
            id: data.agentId
          })
          //创建agnet成功后直接跳转到部署页面
          // this.deployConfirm(data.agentId)
        })
        .catch(() => {
          this.$router.replace('/500')
        })
        .finally(() => {
          this.createAgentLoading = false
        })
    },
    // deployConfirm(id) {
    //   this.$confirm(this.$t('agent_button_create_msg_success_desc'), this.$t('agent_button_create_msg_success'), {
    //     type: 'success',
    //     confirmButtonText: this.$t('agent_button_deploy_now'),
    //     cancelButtonText: this.$t('agent_button_deploy_later')
    //   }).then(res => {
    //     if (res) {
    //       this.toDeploy({
    //         id: id
    //       })
    //     }
    //   })
    // },
    // 禁用部署
    deployBtnDisabled(row) {
      return row.agentType === 'Cloud' || !!row.deployDisable
    },
    // 禁用停止
    stopBtnDisabled(row) {
      return row.agentType === 'Cloud' || row.status !== 'Running' || row.metric.runningTaskNum > 0
    },
    // 禁用删除
    delBtnDisabled(row) {
      let flag = false
      if (row.agentType === 'Cloud') {
        if (['Creating'].includes(row.status)) {
          flag = true
        }
      } else {
        flag = !['Creating', 'Stopped'].includes(row.status)
      }
      return flag
    },
    showVersionFlag(row) {
      let { status, tmInfo } = row
      return !(status === 'Creating' && !tmInfo?.pingTime)
    },
    showUpgradeIcon(row) {
      let { version } = this
      if (row.agentType === 'Cloud') {
        return false
      }
      return !!(version && row?.tmInfo?.pingTime && row?.spec?.version !== version)
    },
    upgradeFlag(row) {
      let { tmInfo } = row
      let isOvertime = (new Date().getTime() - (tmInfo?.updatePingTime ?? 0)) / 1000 / 60 > 5
      // 刚完成5分钟内
      return tmInfo.updateStatus === 'done' && !isOvertime
    },
    upgradingFlag(row) {
      let { tmInfo } = row
      return ['preparing', 'downloading', 'upgrading'].includes(tmInfo.updateStatus)
    },
    upgradingProgres(row) {
      let { tmInfo } = row
      if ([undefined, null, ''].includes(tmInfo?.progres)) {
        return
      }
      return Number(tmInfo?.progres || 0)
    },
    upgradeFailedFlag(row) {
      let { tmInfo } = row
      return (
        tmInfo.updateVersion && tmInfo.updateVersion === this.version && ['fail', 'error'].includes(tmInfo.updateStatus)
      )
    },
    isWindons(row) {
      return row?.metric?.systemInfo?.os?.includes('win')
    },
    //日志上传
    handleUpload(id) {
      this.loadingUpload = true
      this.$axios
        .post('api/tcm/uploadLog', { agentId: id })
        .then(data => {
          this.loadingUpload = false
          this.$message.success(data)
        })
        .finally(() => {
          this.loadingUpload = false
        })
    },
    //打开日志列表
    open(row) {
      this.downloadDialog = true
      this.loadingLogTable = true
      this.currentAgentId = row.id
      this.currentStatus = row.status
      this.getDownloadList()
    },
    handleClose() {
      this.downloadDialog = false
      this.loadingLogTable = false
      clearTimeout(this.timer)
    },
    //日志列表
    getDownloadList() {
      let filter = {
        where: {
          agentId: this.currentAgentId,
          isDeleted: false
        },
        page: this.currentPage,
        size: this.pageSize,
        sort: ['createAt desc']
      }
      this.$axios
        .get('api/tcm/queryUploadLog?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(res => {
          this.loadingLogTable = false
          this.downloadList = res?.items || []
          this.downloadTotal = res?.total
          this.timer = setTimeout(() => {
            this.getDownloadList()
          }, 10000)
        })
        .finally(() => {
          this.loadingLogTable = false
        })
    },
    //删除
    handleDeleteUploadLog(row) {
      this.$axios.post('api/tcm/deleteUploadLog', { agentId: this.currentAgentId, id: row.id }).then(() => {
        this.$message.success(i18n.t('dfs_instance_instance_shanchuchenggong'))
      })
    },
    //日志下载
    handleDownload(row) {
      this.$axios.get('api/tcm/downloadLog?id=' + row.id).then(data => {
        let { accessKeyId, accessKeySecret, securityToken, region, uploadAddr, bucket } = data
        //ssl 凭证
        const OSS = require('ali-oss')
        const client = new OSS({
          accessKeyId: accessKeyId,
          accessKeySecret: accessKeySecret,
          region: region,
          bucket: bucket,
          stsToken: securityToken
        })
        window.location.href = client.signatureUrl(uploadAddr)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.instance-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .upgrade-img {
    width: 20px;
    height: 20px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .instance-operation {
    display: flex;
    justify-content: space-between;
    .instance-operation-left {
      li {
        float: left;
      }
    }
    .el-form {
      .el-input {
        display: block;
        height: 32px;
        ::v-deep .el-input__inner {
          display: block;
        }
      }
      .el-select {
        display: block;
        height: 32px;
      }
    }
  }
  .instance-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
    color: rgba(0, 0, 0, 0.65);
    .el-divider--vertical {
      margin: 0 16px;
    }
  }
  .instance-table__empty {
    color: map-get($fontColor, light);
  }
  .upgrade-text {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, dark);
  }
  .upgrade-version {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, dark);
  }
  .upgrade-desc {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: map-get($color, light);
  }
  .imgBox {
    width: 65px;
    height: 65px;
    background: rgba(201, 205, 212, 0.1);
    border-radius: 4px;
  }
  .upgrade-mb8 {
    margin-bottom: 8px;
  }
  .upgrade-mb16 {
    margin-bottom: 16px;
  }
  .upgrade-mb24 {
    margin-bottom: 24px;
  }
}
.upgrading-box {
  width: 20px;
  height: 20px;
  position: relative;
  ::v-deep {
    .v-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1;
      margin-top: -7px;
      margin-left: -7px;
    }
  }
}
.upgrading-progress {
  ::v-deep {
    .el-progress-circle {
      width: 20px !important;
      height: 20px !important;
    }
  }
}
.inline-input {
  ::v-deep {
    .el-input--mini .el-input__inner {
      height: 20px;
      line-height: 20px;
    }
    .icon-button {
      width: 20px;
      height: 20px;
    }
  }
}
::v-deep {
  .el-dropdown-menu__item.dropdown-item--disabled {
    color: map-get($color, disable);
    cursor: default;
    &:hover {
      background: unset;
      color: map-get($color, disable);
    }
  }
  .tooltip--notenter {
    pointer-events: none;
  }
  .download-dialog {
    .el-dialog__body {
      height: 475px;
      padding: 0 20px 40px 20px;
    }
  }
}
</style>
<style lang="scss">
.el-message-box {
  &.delete-agent {
    .el-message-box__title {
      font-weight: normal;
      font-size: 13px;
      color: #555;
    }
  }
}
</style>
