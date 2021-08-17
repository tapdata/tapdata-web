<template>
  <section class="instance-wrapper main-container" v-loading="loading" v-if="$route.name === 'Instance'">
    <div class="main">
      <div class="instance-operation">
        <div class="instance-operation-left">
          <ul>
            <li>
              <el-select v-model="searchParams.status" @input="search()">
                <el-option :label="$t('agent_status_all')" value=""></el-option>
                <el-option
                  v-for="(item, index) in statusItems"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </li>
            <li class="ml-3">
              <el-input
                width="200"
                v-model="searchParams.keyword"
                :placeholder="$t('agent_search')"
                @input="search(800)"
              >
                <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
              </el-input>
            </li>
            <li class="ml-3">
              <el-button plain class="btn-refresh" @click="fetch()">
                <VIcon>refresh</VIcon>
              </el-button>
            </li>
          </ul>
        </div>
        <div class="instance-operation-right">
          <el-button type="primary" @click="createAgent" :loading="createAgentLoading">
            <VIcon style="margin-right: 5px">plus</VIcon>
            <span>{{ $t('agent_button_create') }}</span>
          </el-button>
          <template v-if="isShowTestBtn">
            <el-button type="primary" @click="toOldPurchase">
              <span>{{ $t('agent_button_order1') }}</span>
            </el-button>
            <el-button type="primary" @click="toPurchase">
              <span>{{ $t('agent_button_order2') }}</span>
            </el-button>
          </template>
        </div>
      </div>
      <el-table class="instance-table table-border mt-3" height="100%" :data="list" @sort-change="sortChange">
        <el-table-column min-width="200px" :label="$t('agent_name')">
          <template slot-scope="scope">
            <div class="flex">
              <div>
                <el-link
                  class="agent-link"
                  :type="scope.row.agentType === 'Cloud' ? '' : 'primary'"
                  @click="handleDetails(scope.row)"
                  >{{ scope.row.id }}</el-link
                >
                <ClipButton :value="scope.row.id"></ClipButton>
                <inline-input
                  style="display: block"
                  :value="scope.row.name"
                  @save="updateName($event, scope.row.id)"
                ></inline-input>
              </div>
              <div class="flex align-items-center">
                <span v-if="scope.row.agentType === 'Cloud'" class="agent-cloud ml-3 px-2">{{
                  $t('agent_test_use')
                }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agent_status')" width="120">
          <template slot-scope="scope">
            <status-tag type="text" :status="scope.row.status"></status-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agent_task_number')" width="120">
          <template slot-scope="scope">
            <el-tooltip effect="dark" placement="top" :disabled="!scope.row.metric || !scope.row.metric.runningTaskNum">
              <div slot="content">
                <template v-for="(item, index) in scope.row.metric.dataFlows">
                  <div v-if="index < 3" :key="item.id">{{ $t('task_name') }}：{{ item.name }}</div>
                </template>
                <el-link
                  v-if="scope.row.metric.runningTaskNum > 3"
                  class="block text-center"
                  type="primary"
                  @click="toDataFlow(scope.row.tmInfo.agentId)"
                  >{{ $t('gl_see_more') }}</el-link
                >
              </div>
              <el-link type="primary" @click="toDataFlow(scope.row.tmInfo.agentId)">{{
                scope.row.metric ? scope.row.metric.runningTaskNum : 0
              }}</el-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agent_version')" width="200">
          <template slot-scope="scope">
            <div class="flex align-items-center">
              <span v-if="showVersionFlag(scope.row)">{{ scope.row.spec && scope.row.spec.version }}</span>
              <template v-if="showUpgradeIcon(scope.row)">
                <el-tooltip class="ml-1" effect="dark" placement="top">
                  <div slot="content">{{ getTooltipContent(scope.row) }}</div>
                  <div>
                    <div class="upgrading-box" v-if="upgradingFlag(scope.row)">
                      <VIcon class="v-icon" size="20">upgradeLoadingColor</VIcon>
                      <el-progress
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
                      ></el-progress>
                    </div>
                    <VIcon
                      v-else-if="upgradeFailedFlag(scope.row)"
                      size="20"
                      class="cursor-pointer block"
                      @click="showUpgradeErrorDialogFnc(scope.row)"
                      >upgradeErrorColor</VIcon
                    >
                    <VIcon
                      v-else-if="!upgradeFlag(scope.row)"
                      size="20"
                      class="cursor-pointer block"
                      @click="showUpgradeDialogFnc(scope.row)"
                      >upgradeColor</VIcon
                    >
                  </div>
                </el-tooltip>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createAt" sortable="custom" :label="$t('agent_create_time')" width="150">
          <template slot-scope="scope">
            <span>{{ $moment(scope.row.createAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('agent_operate')" width="120" fixed="right">
          <template slot-scope="scope">
            <el-link
              type="primary"
              class="mr-2"
              :disabled="scope.row.agentType === 'Cloud' || !!scope.row.deployDisable"
              @click="toDeploy(scope.row)"
              >{{ $t('agent_button_deploy') }}</el-link
            >
            <el-link
              type="primary"
              class="mr-2"
              :disabled="scope.row.agentType === 'Cloud' || scope.row.status !== 'Running'"
              @click="handleStop(scope.row)"
              >{{ $t('agent_button_stop') }}</el-link
            >
            <el-link
              type="danger"
              class="mr-2"
              @click="handleDel(scope.row)"
              :loading="delLoading"
              :disabled="delBtnDisabled(scope.row)"
              >{{ $t('agent_button_delete') }}</el-link
            >
          </template>
        </el-table-column>
        <div class="instance-table__empty" slot="empty">
          <VIcon>folderOpened</VIcon>
          <span class="ml-1" v-if="!searchParams.keyword && !searchParams.status">{{ $t('gl_no_data') }}</span>
          <span v-else>
            {{ $t('gl_no_match_result') }}，<el-link type="primary" @click="reset">{{ $t('gl_back_to_list') }}</el-link>
          </span>
        </div>
      </el-table>
      <el-pagination
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
      </el-pagination>
      <el-dialog :visible.sync="upgradeDialog" width="450px" top="30vh" center>
        <div class="dialog-content">{{ $t('agent_dialog_upgrade_title') }}</div>
        <div class="dialog-btn flex justify-content-evenly mt-6">
          <div class="text-center" v-if="showAutoUpgrade">
            <el-button type="primary" :disabled="disabledAutoUpgradeBtn" @click="autoUpgradeFnc">{{
              $t('agent_button_auto_upgrade')
            }}</el-button>
            <div v-if="agentStatus !== 'running'" class="mt-1 fs-8">({{ $t('agent_tip_auto_upgrade') }})</div>
          </div>
          <div>
            <el-button type="primary" @click="manualUpgradeFnc">{{ $t('agent_button_manual_upgrade') }}</el-button>
          </div>
        </div>
      </el-dialog>
      <!--   升级失败   -->
      <el-dialog :visible.sync="upgradeErrorDialog" width="450px" top="30vh" center>
        <div class="dialog-content text-center">{{ $t('agent_dialog_upgrade_fail') }}</div>
        <div class="dialog-btn flex justify-content-evenly mt-6">
          <div class="text-center">
            <el-button type="primary" @click="cancelUpgradeFnc">{{ $t('gl_button_cancel') }}</el-button>
          </div>
          <div>
            <el-button type="primary" @click="manualUpgradeFnc">{{ $t('agent_button_manual_upgrade') }}</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import ClipButton from '../../components/ClipButton'
import { INSTANCE_STATUS_MAP } from '../../const'
import VIcon from '../../components/VIcon'

let timer = null

export default {
  components: {
    InlineInput,
    StatusTag,
    ClipButton,
    VIcon
  },
  data() {
    return {
      isShowTestBtn: window.__config__.ENV === 'dev',
      loading: true,
      createAgentLoading: false,
      delLoading: false,
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
      selectedRow: {},
      agentStatus: 'stop',
      version: '',
      upgradeList: [] // 升级列表
    }
  },
  computed: {
    statusItems() {
      let result = []
      let filter = ['Creating', 'Running', 'Stopped']
      let { statusMap } = this

      filter.forEach(el => {
        result.push({
          label: this.$t('agent_status_' + statusMap[el]?.key),
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
    }
  },
  watch: {
    '$route.query'(query) {
      this.searchParams.status = query.status || ''
      this.fetch(1)
    }
  },
  created() {
    this.init()
    timer = setInterval(() => {
      let list = this.list || []
      let flag = false
      list.forEach(item => {
        if (['Stopping'].includes(item.status) || (this.showUpgradeIcon(item) && this.upgradingFlag(item))) {
          flag = true
        }
      })
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
    init() {
      let query = this.$route.query
      this.searchParams = Object.assign(this.searchParams, query)
      this.fetch()
      // 是否触发创建agent
      if (query?.create) {
        this.createAgent()
        // 清除创建标记
        this.$router.replace({
          name: 'Instance'
        })
      }
    },
    async getVersion(id) {
      return this.$axios.get('api/tcm/config/version/latest/' + id)
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'Instance',
          query: this.searchParams
        })
      }, debounce)
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
            return item
          })
          // 版本号
          let getVersion = await this.getVersion(this.list[0]?.id)
          this.version = getVersion?.version

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
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createAt'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
    },
    toOldPurchase() {
      this.$confirm(this.$t('agent_link_to_old_purchase_msg'), this.$t('agent_link_to_old_purchase_title'), {
        type: 'warning'
      }).then(res => {
        if (!res) {
          return
        }
        let downloadUrl = window.App.$router.resolve({
          name: 'Purchase'
        })
        window.open(downloadUrl.href, '_blank')
      })
    },
    toPurchase() {
      this.$confirm(this.$t('agent_link_to_purchase_msg'), this.$t('agent_link_to_purchase_title'), {
        type: 'warning'
      }).then(res => {
        if (!res) {
          return
        }
        let downloadUrl = window.App.$router.resolve({
          name: 'FastDownload'
        })

        window.open(downloadUrl.href, '_blank')
      })
    },
    toDeploy(row) {
      let downloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: row?.id
        }
      })

      window.open(downloadUrl.href, '_blank')
    },
    // 停止
    handleStop(row) {
      let flag = false
      if (row.metric?.runningTaskNum) {
        flag = true
      }
      let message = flag ? this.$t('agent_button_stop_tip_running') : this.$t('agent_button_stop_tip_no_running')
      this.$confirm(message, this.$t('agent_button_stop_tip'), {
        type: 'warning'
      }).then(res => {
        if (res) {
          this.$axios
            .patch('api/tcm/agent/stop/' + row.id)
            .then(() => {
              this.$message.success(this.$t('agent_button_stop_msg_success'))
              this.fetch()
            })
            .catch(() => {
              this.$message.error(this.$t('agent_button_stop_msg_fail'))
              this.loading = false
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
      let title = this.$t('agent_button_delete_confirm_title')
      let message = null
      if (noDelFlag) {
        title = this.$t('gl_button_delete_fail')
        message = this.$t('agent_button_delete_confirm_msg')
      }
      this.$confirm(message, title, {
        type: 'warning',
        customClass: 'delete-agent'
      }).then(res => {
        if (res) {
          if (noDelFlag) {
            return
          }
          if (row.agentType === 'Cloud') {
            this.delLoading = true
            this.$axios
              .post('api/tcm/orders/cancel', {
                instanceId: row.id
              })
              .then(() => {
                this.$message.success(this.$t('agent_button_delete_success'))
                this.fetch()
              })
              .catch(() => {
                this.$message.error(this.$t('agent_button_delete_fail'))
              })
              .finally(() => {
                this.delLoading = false
              })
          } else {
            this.$axios
              .patch('api/tcm/agent/delete/' + row.id)
              .then(() => {
                this.$message.success(this.$t('agent_button_delete_success'))
                this.fetch()
              })
              .catch(() => {
                this.$message.error(this.$t('agent_button_delete_fail'))
              })
              .finally(() => {
                this.delLoading = false
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
          this.$message.success(this.$t('gl_button_update_success'))
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
        name: 'Task',
        query: {
          agentId: id,
          status: 'running'
        }
      })
    },
    showUpgradeDialogFnc(row) {
      this.upgradeDialog = true
      this.selectedRow = row
    },
    showUpgradeErrorDialogFnc(row) {
      this.upgradeErrorDialog = true
      this.selectedRow = row
    },
    autoUpgradeFnc() {
      this.closeDialog() // 关闭升级方式选择窗口
      if (this.selectedRow?.metric?.runningTaskNum) {
        this.$alert(this.$t('agent_auto_upgrade_tip_running_task'))
        return
      }
      this.$axios.get(`api/tcm/productRelease/${this.version}`).then(downloadUrl => {
        this.$axios
          .post('tm/api/clusterStates/updataAgent', {
            downloadUrl,
            process_id: this.selectedRow?.tmInfo?.agentId,
            version: this.version
          })
          .then(() => {
            this.$message.success(this.$t('agent_auto_upgrade_tip_start'))
            this.fetch()
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
    // 取消
    cancelUpgradeFnc() {
      this.closeDialog() // 关闭升级方式选择窗口
    },
    getTooltipContent(row) {
      let result
      switch (row.tmInfo.updateStatus) {
        case 'preparing':
        case 'downloading':
        case 'upgrading':
          result =
            this.$t('agent_auto_upgrade_tip_upgrading') +
            (this.upgradingProgres(row) === undefined
              ? ''
              : `，${this.$t('agent_auto_upgrade_tip_progress')}：${this.upgradingProgres(row)}%`)
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
      // this.clearTimer()  //点详情报错 暂时注释
      this.$router.push({
        name: 'InstanceDetails',
        query: {
          id: data.id
        }
      })
    },
    // 创建Agent
    createAgent() {
      this.createAgentLoading = true
      this.$axios
        .post('api/tcm/orders', {
          agentType: 'Local'
        })
        .then(data => {
          this.fetch()
          this.deployConfirm(data.agentId)
        })
        .catch(() => {
          this.$router.replace('/500')
        })
        .finally(() => {
          this.createAgentLoading = false
        })
    },
    deployConfirm(id) {
      this.$confirm(this.$t('agent_button_create_msg_success_desc'), this.$t('agent_button_create_msg_success'), {
        type: 'success',
        confirmButtonText: this.$t('agent_button_deploy_now'),
        cancelButtonText: this.$t('agent_button_deploy_later')
      }).then(res => {
        if (res) {
          this.toDeploy({
            id: id
          })
        }
      })
    },
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
    getStatusIcon(row) {
      return this.statusMap[row.status] || {}
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
    padding: 20px;
    background: #fff;
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
  }
  .instance-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
    .agent-cloud {
      color: #10c038;
      border-color: #10c038;
      background-color: #dbefd1;
    }
  }
  .instance-table__empty {
    color: map-get($fontColor, light);
  }
}
.upgrading-box {
  width: 20px;
  height: 20px;
  position: relative;
  ::v-deep {
    .v-icon {
      position: absolute;
      left: 0;
      top: 0;
      font-size: 20px;
      -moz-animation: rotate 10s infinite linear;
      -webkit-animation: rotate 10s infinite linear;
      animation: rotate 10s infinite linear;
      border-radius: 50%;
    }

    .el-progress {
      position: relative;
      z-index: 1;
    }
  }
}
@-moz-keyframes rotate {
  0% {
    -moz-transform: rotate(0deg);
  }
  100% {
    -moz-transform: rotate(360deg);
  }
}
@-webkit-keyframes rotate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.upgrading-progress {
  ::v-deep {
    .el-progress-circle {
      width: 20px !important;
      height: 20px !important;
    }
    .el-progress__text {
      font-size: 12px !important;
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
