<template>
  <section class="instance-wrapper g-panel-container" v-loading="loading" v-if="$route.name === 'Instance'">
    <div class="main">
      <div class="instance-operation">
        <div class="instance-operation-left">
          <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="fetch"></FilterBar>
        </div>
        <div class="instance-operation-right">
          <ElButton
            type="primary"
            @click="createAgent"
            :loading="createAgentLoading"
            :disabled="$disabledReadonlyUserBtn()"
          >
            <span>{{ $t('public_agent_button_create') }}</span>
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
        <ElTableColumn width="110px" :label="$t('dfs_instance_instance_guige')">
          <template slot-scope="scope">
            <span>{{ scope.row.specLabel }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn width="120px" :label="$t('dfs_instance_instance_dingyuefangshi')">
          <template slot-scope="scope">
            <span :class="{ 'color-success': scope.row.chargeProvider === 'FreeTier' }">{{
              scope.row.subscriptionMethodLabel
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn width="130" :label="$t('dfs_instance_instance_daoqishijian')">
          <template slot-scope="scope">
            <div>
              <ElTooltip
                :disabled="!getExpiredTimeLevel(scope.row)"
                placement="top"
                :visible-arrow="false"
                effect="light"
              >
                <div>
                  <span>{{ scope.row.expiredTimeLabel }}</span>
                  <VIcon v-if="getExpiredTimeLevel(scope.row) === 'expired'" class="ml-2 color-info">error</VIcon>
                  <VIcon v-else-if="getExpiredTimeLevel(scope.row) === 'expiringSoon'" class="ml-2 color-warning"
                    >warning</VIcon
                  >
                </div>
                <template #content>
                  <div v-if="getExpiredTimeLevel(scope.row) === 'expired'" class="font-color-dark">
                    <p>{{ $t('dfs_instance_expired_time_tip1') }}</p>
                    <p>{{ $t('dfs_instance_expired_time_tip2') }}</p>
                    <p>{{ $t('dfs_instance_expired_time_tip3') }}</p>
                  </div>
                  <span v-else-if="scope.row.paidType === 'recurring'">{{
                    $t('dfs_instance_instance_xiacifufeishi')
                  }}</span>
                  <span v-else>{{ $t('dfs_user_center_jijiangguoqi') }}</span>
                </template>
              </ElTooltip>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('agent_status')" width="140">
          <template slot-scope="scope">
            <StatusTag type="tag" :status="scope.row.status" default-status="Stopped"></StatusTag>
            <ElTooltip v-if="scope.row.status == 'Stopped'" placement="top">
              <VIcon size="14" class="ml-2 color-primary">question-circle</VIcon>
              <template #content>
                <div style="max-width: 380px">
                  {{ $t('dfs_instance_stopped_help_tip_prefix') }}
                  <a
                    target="_blank"
                    href="https://docs.tapdata.io/cloud/faq/agent-installation#agent-%E6%98%BE%E7%A4%BA%E7%A6%BB%E7%BA%BF%E5%A6%82%E4%BD%95%E9%87%8D%E5%90%AF"
                    class="color-primary"
                    >{{ $t('dfs_online_help_docs') }}</a
                  >
                  {{ $t('dfs_instance_stopped_help_tip_suffix') }}
                </div>
              </template>
            </ElTooltip>
          </template>
        </ElTableColumn>
        <ElTableColumn width="180px" :label="$t('agent_heartbeat')">
          <template slot-scope="scope">
            <span>{{ handlePingTime(scope.row) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('agent_task_number')" width="160">
          <template slot-scope="scope">
            <div>
              <div class="flex align-center">
                {{ $t('task_manage_migrate') }}：
                <ElLink
                  type="primary"
                  :disabled="(scope.row.metric ? scope.row.metric.runningTask.migrate || 0 : 0) < 1"
                  @click="toDataFlow(scope.row.tmInfo.agentId)"
                  >{{ scope.row.metric ? scope.row.metric.runningTask.migrate || 0 : 0 }}</ElLink
                >
              </div>
              <div class="flex align-center">
                {{ $t('task_manage_etl') }}：
                <ElLink
                  type="primary"
                  :disabled="(scope.row.metric ? scope.row.metric.runningTask.sync || 0 : 0) < 1"
                  @click="toDataFlow(scope.row.tmInfo.agentId, 'dataflowList')"
                  >{{ scope.row.metric ? scope.row.metric.runningTask.sync || 0 : 0 }}</ElLink
                >
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('public_version')" width="200">
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
        <ElTableColumn prop="createAt" sortable="custom" :label="$t('public_create_time')" width="180">
          <template slot-scope="scope">
            <span>{{ formatTime(scope.row.createAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="$t('public_operation')" width="176">
          <template slot-scope="scope">
            <ElButton
              type="text"
              :disabled="deployBtnDisabled(scope.row) || $disabledReadonlyUserBtn()"
              @click="toDeploy(scope.row)"
              >{{ $t('public_agent_button_deploy') }}</ElButton
            >
            <ElDivider direction="vertical"></ElDivider>
            <ElButton
              size="mini"
              type="text"
              :disabled="stopBtnDisabled(scope.row) || $disabledReadonlyUserBtn()"
              :loading="scope.row.btnLoading.stop"
              @click="handleStop(scope.row)"
              >{{ $t('public_button_stop') }}</ElButton
            >
            <ElDivider direction="vertical"></ElDivider>
            <ElButton
              size="mini"
              type="text"
              :loading="scope.row.btnLoading.delete"
              :disabled="delBtnDisabled(scope.row) || $disabledReadonlyUserBtn()"
              @click="handleDel(scope.row)"
              >{{ $t('public_button_delete') }}</ElButton
            >
          </template>
        </ElTableColumn>
        <div v-if="!isSearching" class="instance-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('agent_list_empty_desc1') }}</span>
            <span class="color-primary cursor-pointer fs-7 ml-1" @click="createAgent">{{
              $t('public_agent_button_create')
            }}</span>
            <span>{{ $t('agent_list_empty_desc2') }}</span>
          </div>
        </div>
        <div v-else class="instance-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('public_data_no_find_result') }}</span>
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
              $t('public_agent_button_auto_upgrade')
            }}</ElButton>
          </div>
          <div class="text-end w-50">
            <ElButton type="primary" @click="manualUpgradeFnc">{{ $t('public_agent_button_manual_upgrade') }}</ElButton>
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
              $t('public_button_retry')
            }}</ElButton>
          </div>
          <div>
            <ElButton type="primary" @click="manualUpgradeFnc">{{ $t('public_agent_button_manual_upgrade') }}</ElButton>
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
            :disabled="deployBtnDisabled(selectedRow) || $disabledReadonlyUserBtn()"
            type="primary"
            class="flex-fill min-w-0"
            @click="toDeploy(selectedRow)"
          >
            <VIcon size="12">deploy</VIcon>
            <span class="ml-1">{{ $t('public_agent_button_deploy') }}</span>
          </VButton>
          <VButton
            :loading="selectedRow.btnLoading.stop"
            :disabled="stopBtnDisabled(selectedRow) || $disabledReadonlyUserBtn()"
            type="primary"
            class="flex-fill min-w-0"
            @click="handleStop(selectedRow)"
          >
            <VIcon size="12">stop</VIcon>
            <span class="ml-1">{{ $t('public_button_stop') }}</span>
          </VButton>
          <VButton
            :loading="selectedRow.btnLoading.delete"
            :disabled="delBtnDisabled(selectedRow) || $disabledReadonlyUserBtn()"
            class="flex-fill min-w-0"
            @click="handleDel(selectedRow)"
          >
            <VIcon size="12">delete</VIcon>
            <span class="ml-1">{{ $t('public_button_delete') }}</span>
          </VButton>
        </div>
      </Details>
      <!--   创建订阅   -->
      <CreateDialog v-model="createDialog" @finish="fetch"></CreateDialog>
      <!--   选择授权码   -->
      <SelectListDialog
        v-model="selectListDialog"
        :type="selectListType"
        @create="createDialog = true"
        @new-agent="handleNewAgent"
      ></SelectListDialog>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import i18n from '@/i18n'
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import { INSTANCE_STATUS_MAP } from '../../const'
import Details from './Details'
import timeFunction from '@/mixins/timeFunction'
import { buried } from '@/plugins/buried'
import { VIcon, FilterBar } from '@tap/component'
import { dayjs } from '@tap/business'
import Time from '@tap/shared/src/time'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { getSpec, getPaymentMethod } from './utils'

const CreateDialog = () => import(/* webpackChunkName: "CreateInstanceDialog" */ './Create')
const SelectListDialog = () => import(/* webpackChunkName: "SelectListInstanceDialog" */ './SelectList')

let timer = null

export default {
  components: {
    InlineInput,
    StatusTag,
    VIcon,
    Details,
    FilterBar,
    CreateDialog,
    SelectListDialog
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
      createDialog: false,
      selectListDialog: false,
      selectListType: 'code'
    }
  },
  computed: {
    statusItems() {
      let result = []
      let filter = ['Creating', 'Running', 'Stopped']
      filter.forEach(el => {
        result.push({
          label: CONNECTION_STATUS_MAP[el.toLowerCase()],
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
    $route(route, oldRoute) {
      if (route.name === 'Instance') {
        let oldQuery = { ...oldRoute.query, detailId: undefined }
        let query = { ...route.query, detailId: undefined }
        let queryStr = JSON.stringify(query)
        if (JSON.stringify(oldQuery) === queryStr) return
        this.searchParams.status = query.status || ''
        this.fetch(queryStr === '{}' ? undefined : 1)
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
    relativeTime(time) {
      return time ? dayjs(time).fromNow() : '-'
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
            const { paidSubscribeDto = {}, license = {}, chargeProvider } = item.orderInfo || {}
            const { periodStart, periodEnd } = paidSubscribeDto
            item.chargeProvider = chargeProvider
            item.specLabel = getSpec(item.spec) || '-'
            item.subscriptionMethodLabel = getPaymentMethod(paidSubscribeDto, chargeProvider) || '-'
            item.periodLabel =
              dayjs(periodStart).format('YYYY-MM-DD HH:mm:ss') + ' - ' + dayjs(periodEnd).format('YYYY-MM-DD HH:mm:ss')

            item.expiredTime =
              chargeProvider === 'Aliyun' ? license.expiredTime : chargeProvider === 'Stripe' ? periodEnd : ''
            item.expiredTimeLabel = item.expiredTime ? dayjs(item.expiredTime).format('YYYY-MM-DD') : '-'
            item.paidType =
              chargeProvider === 'Aliyun' ? license.type : chargeProvider === 'Stripe' ? paidSubscribeDto.type : ''
            item.deployDisable = item.tmInfo.pingTime || false
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
    handlePingTime(row) {
      let pingTime = row?.tmInfo?.pingTime
      return pingTime ? dayjs(pingTime).format('YYYY-MM-DD HH:mm:ss') : '-'
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
        query: {
          ...this.$route.query,
          detailId: undefined
        }
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
        confirmButtonText: this.$t('public_button_confirm'),
        cancelButtonText: this.$t('public_button_cancel')
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
        title = this.$t('public_message_delete_fail')
        message = this.$t('agent_button_delete_confirm_msg')
      }
      this.$confirm(message, title, {
        type: 'warning',
        confirmButtonText: this.$t('public_button_confirm'),
        cancelButtonText: this.$t('public_button_cancel'),
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
    toDataFlow(id, name = 'migrateList') {
      this.$router.push({
        name,
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
      //由于云版升级引擎导致原来任务执行的中断-前端 #132709
      // if (this.selectedRow?.metric?.runningTaskNum) {
      //   this.$alert(this.$t('agent_auto_upgrade_tip_running_task'))
      //   return
      // }
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
      //由于云版升级引擎导致原来任务执行的中断-前端 #132709
      // if (row.metric?.runningTaskNum) {
      //   this.$alert(this.$t('agent_auto_upgrade_tip_running_task'))
      // }

      let routeUrl = this.$router.resolve({
        name: 'UpgradeVersion',
        query: {
          agentId: row.id
        }
      })
      window.open(routeUrl.href, '_blank')
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
    async createAgent() {
      this.createAgentLoading = true
      const userInfo = window.__USER_INFO__ || {}
      // 免费实例
      if (await this.handleFreeAgent()) return (this.createAgentLoading = false)
      // 开启授权码
      if (userInfo.enableLicense) {
        this.$axios
          .get('api/tcm/aliyun/market/license/available')
          .then(data => {
            if (data.length) {
              this.handleSelectListDialog('code')
            } else {
              this.handleCreateAuthorizationCode()
            }
          })
          .finally(() => {
            this.createAgentLoading = false
          })
        return
      }
      this.$axios
        .get('api/tcm/paid/plan/queryAvailableSubscribe')
        .then(data => {
          if (data.length) {
            this.handleSelectListDialog('order')
            return
          }
          this.createDialog = true
        })
        .finally(() => {
          this.createAgentLoading = false
        })
        .catch(() => {
          this.createDialog = true
        })
    },
    // 禁用部署
    deployBtnDisabled(row) {
      return row.agentType === 'Cloud' || !!row.deployDisable
    },
    // 禁用停止
    stopBtnDisabled(row) {
      return (
        row.agentType === 'Cloud' ||
        row.status !== 'Running' ||
        row.metric.runningTaskNum > 0 ||
        row.tapdataAgentStatus === 'stop' //tapdataAgent 失活了
      )
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
      let isOvertime = (Time.now() - (tmInfo?.updatePingTime ?? 0)) / 1000 / 60 > 5
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
    handleSelectListDialog(type = 'code') {
      this.selectListType = type
      this.selectListDialog = true
    },
    async handleNewAgent(params = {}) {
      try {
        const data = await this.$axios.post('api/tcm/orders', {
          agentType: 'Local',
          ...params
        })
        buried('agentCreate')
        this.fetch()
        this.toDeploy({
          id: data.agentId
        })
        this.createAgentLoading = false
        return true
      } catch (e) {
        this.createAgentLoading = false
        return false
      }
    },
    handleCreateAuthorizationCode() {
      const href =
        'https://market.aliyun.com/products/56024006/cmgj00061912.html?spm=5176.730005.result.4.519c3524QzKxHM&innerSource=search_tapdata#sku=yuncode5591200001'
      this.$confirm(
        i18n.t('dfs_instance_instance_pclas', { val1: href }),
        i18n.t('dfs_instance_instance_shouquanmafuwu'),
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: i18n.t('dfs_aliyun_market_checklicnese_jihuoshouquanma'),
          type: 'warning'
        }
      ).then(resFlag => {
        if (resFlag) {
          this.$router.push({
            name: 'aliyunMarketLicense'
          })
        }
      })
    },
    getExpiredTimeLevel(row = {}) {
      const { expiredTime } = row
      if (!expiredTime) return ''
      const t = new Date(expiredTime).getTime()
      if (Time.now() > t) return 'expired'
      if (Time.now() > t - 7 * 24 * 3600) return 'expiringSoon'
      return ''
    },
    async handleFreeAgent() {
      const count = await this.$axios.get('api/tcm/agent/count')
      if (count) return false
      const flag = await this.handleNewAgent({
        chargeProvider: 'FreeTier'
      })
      return flag
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
      margin: 0 8px;
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
    .input {
      width: 180px;
    }
    .el-input--mini .el-input__inner {
      padding: 0;
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
