<template>
  <section class="instance-wrapper g-panel-container" v-loading="loading" v-if="$route.name === 'Instance'">
    <el-tabs class="flex flex-column overflow-hidden flex-1" v-model="activeName" @tab-click="changeTabs">
      <el-tab-pane class="order-flex overflow-hidden h-100" :label="$t('dfs_instance_instance_agent2')" name="first">
        <div class="main">
          <div class="instance-operation">
            <div class="instance-operation-left">
              <FilterBar v-model:value="searchParams" :items="filterItems" @search="search" @fetch="fetch"></FilterBar>
            </div>
            <div class="instance-operation-right">
              <ElButton type="primary" @click="handleCreateAgent" :disabled="$disabledReadonlyUserBtn()">
                <span>{{ $t('public_agent_button_create') }}</span>
              </ElButton>
            </div>
          </div>
          <ul class="agent-ul flex flex-wrap mt-4">
            <li
              class="agent-item flex flex-column align-items-start"
              v-for="item in list"
              :key="item.id"
              :id="`agent-${item.id}`"
            >
              <div class="flex justify-content-around w-100 border-bottom py-4 px-4 text-center" v-if="agentData(item)">
                <div>
                  <el-progress
                    :width="68"
                    type="circle"
                    :percentage="agentData(item).cpuUsage"
                    :color="customColors"
                  ></el-progress>
                  <div class="font-color-light text-center">CPU</div>
                </div>
                <div>
                  <el-progress
                    :width="68"
                    type="circle"
                    :percentage="agentData(item).memoryRate"
                    :color="customColors"
                  ></el-progress>
                  <div class="font-color-light text-center">MEM</div>
                </div>
                <div>
                  <el-progress
                    :width="68"
                    type="circle"
                    :percentage="agentData(item).gcRate"
                    :color="customColors"
                  ></el-progress>
                  <div class="font-color-light text-center">GC</div>
                </div>
                <div>
                  <div class="position-relative">
                    <el-progress
                      :width="68"
                      type="circle"
                      :percentage="item.pingTimePercent"
                      :color="customColors"
                      :show-text="false"
                    ></el-progress>
                    <div class="absolute-fill flex align-center justify-content-center fs-8 font-color-light">
                      <div style="width: 68px">{{ item.pingTimes }}</div>
                    </div>
                  </div>

                  <div class="font-color-light">
                    {{ $t('dfs_instance_instance_xintiaobinlu') }}
                  </div>
                </div>
              </div>
              <div class="flex justify-content-between w-100 pt-4 px-4">
                <div>
                  <span v-if="item.publicAgent">{{ item.name }}</span>
                  <InlineInput
                    v-else
                    :class="['inline-input', 'color-primary', { 'cursor-pointer': item.agentType !== 'Cloud' }]"
                    :value="item.name"
                    :icon-config="{ class: 'color-primary', size: '12' }"
                    type="icon"
                    @click-text="handleDetails(item)"
                    @save="updateName($event, item.id)"
                  ></InlineInput>
                </div>
                <div>
                  <StatusTag
                    v-if="item.agentType === 'Cloud' && item.status === 'Creating'"
                    type="tag"
                    status="Deploying"
                    default-status="Stopped"
                  ></StatusTag>
                  <StatusTag
                    v-else
                    type="tag"
                    :status="item.engineStatus === 'starting' ? 'Starting' : item.status"
                    default-status="Stopped"
                  ></StatusTag>
                  <ElTooltip v-if="item.status == 'Stopped'" placement="top">
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
                </div>
              </div>
              <div class="agent-item__content flex flex-wrap px-4">
                <div class="flex mb-2 w-50" v-for="(col, i) in agentConfig" :key="i">
                  <span class="font-color-light mr-2">{{ col.label }}: </span>
                  <!--数据复制-->
                  <span v-if="col.value === 'runningTaskMigrate'" class="font-color-dark">
                    <ElLink
                      type="primary"
                      :disabled="!item.tmInfo.agentId || !item[col.value]"
                      @click="toDataFlow(item.tmInfo.agentId)"
                      >{{ item[col.value] }}</ElLink
                    >
                  </span>
                  <span v-else-if="col.value === 'runningTaskSync'" class="font-color-dark">
                    <ElLink
                      type="primary"
                      :disabled="!item.tmInfo.agentId || !item[col.value]"
                      @click="toDataFlow(item.tmInfo.agentId, 'dataflowList')"
                      >{{ item[col.value] }}</ElLink
                    >
                  </span>
                  <!--到期时间-->
                  <span v-else-if="col.value === 'expiredTimeLabel'" class="font-color-dark flex align-center">
                    <ElTooltip :disabled="!getExpiredTimeLevel(item)" placement="top" :visible-arrow="false">
                      <div class="flex align-center">
                        <span>{{ item.expiredTimeLabel.split(' ')[0] }}</span>
                        <VIcon v-if="getExpiredTimeLevel(item) === 'expired'" size="16" class="ml-1 color-danger"
                          >warning</VIcon
                        >
                        <VIcon
                          v-else-if="getExpiredTimeLevel(item) === 'expiringSoon'"
                          size="16"
                          class="ml-1 color-warning"
                          >warning-circle</VIcon
                        >
                      </div>
                      <template #content>
                        <div v-if="getExpiredTimeLevel(item) === 'expired'">
                          <p>{{ $t('dfs_instance_expired_time_tip1') }}</p>
                          <div v-if="item.agentType === 'Cloud'">
                            <p>
                              {{ $t('dfs_instance_expired_time_full_tip2') }}
                            </p>
                            <p>
                              {{ $t('dfs_instance_expired_time_full_tip3') }}
                            </p>
                          </div>
                          <div v-else>
                            <p>{{ $t('dfs_instance_expired_time_tip2') }}</p>
                            <p>{{ $t('dfs_instance_expired_time_tip3') }}</p>
                            <p>{{ $t('dfs_instance_expired_time_tip4') }}</p>
                          </div>
                        </div>
                        <span v-else-if="item.paidType === 'recurring'">{{
                          $t('dfs_instance_instance_xiacifufeishi')
                        }}</span>
                        <span v-else>{{ $t('dfs_user_center_jijiangguoqi') }}</span>
                      </template>
                    </ElTooltip>
                  </span>
                  <!--订阅方式-->
                  <span
                    v-else-if="col.value === 'subscriptionMethodLabel'"
                    :class="{
                      'color-success': item.chargeProvider === 'FreeTier'
                    }"
                    >{{ item[col.value] }}</span
                  >
                  <span v-else class="font-color-dark">{{ item[col.value] }}</span>
                </div>
              </div>
              <div class="w-100 flex justify-content-end mt-2 py-4 px-4">
                <ElButton
                  size="mini"
                  v-if="item.agentType !== 'Cloud' && !deployBtnDisabled(item)"
                  type="primary"
                  @click="toDeploy(item)"
                  >{{ $t('public_agent_button_deploy') }}
                </ElButton>
                <ElButton
                  name="start"
                  size="mini"
                  type="primary"
                  plain
                  v-if="item.agentType === 'Local' && !['Running'].includes(item.status) && !startBtnDisabled(item)"
                  :loading="item.btnLoading.delete"
                  @click="handleStart(item)"
                  >{{ $t('public_button_start') }}
                </ElButton>
                <!--全托管没有部署停止按钮，离线状态不能停止-->
                <ElButton
                  v-if="
                    item.agentType !== 'Cloud' &&
                    !['Stopped', 'Stopping'].includes(item.status) &&
                    !stopBtnDisabled(item)
                  "
                  size="mini"
                  type="danger"
                  plain
                  :loading="item.btnLoading.stop"
                  @click="handleStop(item)"
                  >{{ $t('public_button_stop') }}
                </ElButton>
                <ElButton
                  name="restart"
                  size="mini"
                  type="warning"
                  plain
                  v-if="item.agentType === 'Cloud' && !item.publicAgent && !renewBtnDisabled(item)"
                  :loading="item.btnLoading.delete"
                  @click="handleRenew(item)"
                  >{{ $t('public_button_restart') }}
                </ElButton>
                <ElButton
                  name="restart"
                  size="mini"
                  type="warning"
                  plain
                  v-if="item.agentType === 'Local' && !restartBtnDisabled(item)"
                  :loading="item.btnLoading.delete"
                  @click="handleRestart(item)"
                  >{{ $t('public_button_restart') }}
                </ElButton>
                <!--需要考虑老实例/免费实例 无订单信息的-->
                <!--68-2 免费实例可以删除-->
                <ElButton
                  v-if="
                    (item.publicAgent || (item.orderInfo && item.orderInfo.subscriptionId)) && !disableUnsubscribe(item)
                  "
                  size="mini"
                  :loading="item.btnLoading.delete"
                  @click="openUnsubscribe(item)"
                >
                  <span class="ml-1">{{ $t('public_button_unsubscribe') }}</span></ElButton
                >
                <ElButton
                  size="mini"
                  v-else-if="!(item.orderInfo && item.orderInfo.subscriptionId) && !delBtnDisabled(item)"
                  :loading="item.btnLoading.delete"
                  @click="handleUnsubscribe(item)"
                  >{{ $t('public_button_unsubscribe') }}
                </ElButton>
                <ElButton
                  v-if="(item.orderInfo || item.orderInfo.chargeProvider === 'Stripe') && !disableRenew(item)"
                  class="mr-2"
                  size="mini"
                  type="primary"
                  @click="openRenew(item)"
                  >{{ $t('public_button_renew') }}
                </ElButton>

                <!--{{$t('dfs_instance_instance_shengji')}}按钮-->
                <template v-if="showUpgradeIcon(item)">
                  <ElTooltip
                    v-if="upgradingFlag(item)"
                    class="ml-1"
                    effect="dark"
                    placement="top"
                    :content="getTooltipContent(item, 'upgrading')"
                  >
                    <ElButton size="mini" disabled>
                      <span class="inline-flex align-items-center">
                        <span>{{ $t('public_status_altering') }}</span>
                        <ElProgress
                          class="upgrading-progress mx-1"
                          type="circle"
                          color="#3b47e5"
                          stroke-width="20"
                          :percentage="upgradingProgres(item) || 0"
                          :show-text="false"
                          :format="
                            value => {
                              return value
                            }
                          "
                        ></ElProgress>
                        <span class="color-primary">{{ (upgradingProgres(item) || 0) + '%' }}</span>
                      </span>
                    </ElButton>
                  </ElTooltip>
                  <ElTooltip
                    v-else-if="upgradeFailedFlag(item)"
                    class="ml-1"
                    effect="dark"
                    placement="top"
                    :content="getTooltipContent(item, 'fail')"
                  >
                    <el-button
                      size="mini"
                      type="primary"
                      plain
                      class="cursor-pointer block inline-flex align-items-center"
                      @click="showUpgradeErrorDialogFnc(item)"
                    >
                      <span>{{ $t('dfs_instance_instance_shengji') }}</span>
                      <VIcon size="14" class="color-warning ml-2">warning</VIcon>
                    </el-button>
                  </ElTooltip>
                  <ElTooltip
                    v-else-if="!upgradeFlag(item)"
                    class="ml-1"
                    effect="dark"
                    placement="top"
                    :content="getTooltipContent(item)"
                  >
                    <el-button
                      size="mini"
                      type="primary"
                      plain
                      class="cursor-pointer block"
                      @click="showUpgradeDialogFnc(item)"
                      >{{ $t('dfs_instance_instance_shengji') }}
                    </el-button>
                  </ElTooltip>
                </template>
              </div>
            </li>
          </ul>
          <ElDialog v-model:visible="upgradeDialog" width="562px" top="20vh" :title="$t('dfs_instance_instance_agent')">
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
              <div class="upgrade-desc upgrade-mb8">
                {{ $t('dfs_instance_instance_bencigengxinbao') }}
              </div>
            </div>
            <div class="dialog-btn flex justify-content-end mt-6">
              <div class="w-50" v-if="showAutoUpgrade && selectedRow.agentType !== 'Cloud'">
                <ElButton type="primary" :disabled="disabledAutoUpgradeBtn" @click="autoUpgradeFnc"
                  >{{ $t('public_agent_button_auto_upgrade') }}
                </ElButton>
              </div>
              <div class="text-end w-50" v-if="selectedRow.agentType === 'Cloud'">
                <ElButton type="primary" @click="fullManagementUpgradeFnc"
                  >{{ $t('public_agent_button_auto_upgrade') }}
                </ElButton>
              </div>
              <div class="text-end w-50" v-else>
                <ElButton type="primary" @click="manualUpgradeFnc"
                  >{{ $t('public_agent_button_manual_upgrade') }}
                </ElButton>
              </div>
            </div>
            <div v-if="disabledAutoUpgradeBtn" class="mt-1 fs-8 text-break">({{ $t('agent_tip_auto_upgrade') }})</div>
          </ElDialog>
          <!--   {{$t('dfs_instance_instance_shengji')}}失败   -->
          <ElDialog v-model:visible="upgradeErrorDialog" width="450px" top="30vh" center>
            <div class="dialog-content text-center">
              {{ $t('agent_dialog_upgrade_fail') }}
            </div>
            <div class="dialog-btn flex justify-content-evenly mt-6">
              <div class="text-center">
                <ElButton type="primary" :disabled="disabledAutoUpgradeBtn" @click="autoUpgradeFnc"
                  >{{ $t('public_button_retry') }}
                </ElButton>
              </div>
              <div>
                <ElButton type="primary" @click="manualUpgradeFnc"
                  >{{ $t('public_agent_button_manual_upgrade') }}
                </ElButton>
              </div>
            </div>
          </ElDialog>
          <!--  详情    -->
          <Details
            v-model:value="showDetails"
            :detail-id="detailId"
            @closed="detailsClosedFnc"
            @load-data="loadDetailsData"
          >
            <template v-slot:title>
              <div>
                <InlineInput
                  :value="selectedRow.name"
                  :icon-config="{ class: 'color-primary' }"
                  :input-style="{ width: '140px' }"
                  type="icon"
                  word-break
                  @save="updateName($event, selectedRow.id)"
                ></InlineInput>
              </div>
            </template>
            <template v-slot:operation>
              <div class="flex">
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
                  type="danger"
                  plain
                  class="flex-fill min-w-0"
                  @click="handleStop(selectedRow)"
                >
                  <VIcon size="12">stop</VIcon>
                  <span class="ml-1">{{ $t('public_button_stop') }}</span>
                </VButton>
              </div>
            </template>
          </Details>

          <!--转账支付弹窗信息--->
          <transferDialog :price="price" v-model:visible="showTransferDialogVisible"></transferDialog>
          <!-- 新的创建实例 -->
          <SubscriptionModelDialog v-model:visible="subscriptionModelVisible"></SubscriptionModelDialog>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-if="!isDomesticStation"
        class="order-flex flex-column overflow-hidden h-100"
        :label="$t('dfs_instance_instance_cunchuziyuan')"
        name="second"
      >
        <section class="flex flex-column overflow-hidden flex-1">
          <ul class="mdb-ul flex flex-wrap mt-4" v-if="mdbData.length > 0">
            <li class="mdb-item flex" v-for="item in mdbData" :key="item.id">
              <div class="flex justify-content-around align-items-center border-right w-40 py-4 px-4">
                <el-progress
                  :width="68"
                  type="circle"
                  :percentage="item.percentage"
                  :color="customColors"
                ></el-progress>
                <div class="ml-4">
                  <div>
                    {{ $t('dfs_order_list_total_space') }} ：<span>{{ item.storageLabel || '-' }}</span>
                  </div>
                  <div>
                    {{ $t('dfs_order_list_used_space') }} ：<span>{{ item.dataSizeLabel || '-' }}</span>
                  </div>
                  <div>
                    {{ $t('dfs_order_list_remaining_space') }} ：<span>{{ item.dataSizeLast || '-' }}</span>
                  </div>
                </div>
              </div>
              <div class="agent-item__content border-left flex flex-wrap py-4 px-4">
                <div class="flex align-items-center mb-2 w-50" v-for="(col, i) in specColumns" :key="i">
                  <span class="font-color-light mr-2">{{ col.label }}:</span>
                  <!--状态-->
                  <span v-if="col.prop === 'status'" class="font-color-dark">
                    <StatusTag type="tag" :status="item.status" default-status="Stopped" target="mdb"></StatusTag>
                  </span>
                  <ElLink
                    v-else-if="col.prop === 'visitInfo'"
                    type="primary"
                    class="text-decoration-underline"
                    @click="handleVisitInfo(item)"
                    >{{ $t('public_button_obtain') }}
                  </ElLink>
                  <span v-else>{{ item[col.prop] }}</span>
                </div>
              </div>
              <div class="w-25 flex justify-content-end align-items-start mt-2 py-4 px-4">
                <ElButton
                  v-if="item.scope === 'Private' && item.deploymentType !== 'Local'"
                  type="text"
                  @click="handleCreateIps(item)"
                  >{{ $t('dfs_instance_instance_tianjiabaimingdan') }}
                </ElButton>
                <ElButton class="mr-2" type="text" :disabled="disableRenew(item)" @click="openRenew(item)"
                  >{{ $t('public_button_renew') }}
                </ElButton>
                <!--68-2 免费实例可以删除-->
                <ElButton v-if="item.scope === 'Share'" size="mini" type="text" @click="openMdbUnsubscribe(item)">
                  <span class="ml-1">{{ $t('public_button_unsubscribe') }}</span></ElButton
                >
              </div>
            </li>
          </ul>
          <ul v-else></ul>
        </section>
        <!-- 新建白名单 -->
        <el-dialog v-model="showCreateIps" :title="$t('dfs_instance_instance_tianjiabaimingdan')">
          <el-form>
            <el-form-item :label="$t('dfs_instance_instance_ipdizhi')">
              <el-input :required="true" v-model="ipAddress" placeholder="183.34.1.4,183.34.1.5"></el-input>
            </el-form-item>
          </el-form>
          <template v-slot:footer>
            <span>
              <el-button @click="showCreateIps = false">{{ $t('public_button_cancel') }}</el-button>
              <el-button @click="addIps" type="primary">{{
                $t('field_mapping_field_mapping_dialog_tianJia')
              }}</el-button>
            </span>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
    <!--退订-->
    <Unsubscribe ref="UnsubscribeDetailDialog" @closeVisible="closeVisible"></Unsubscribe>
    <!--续订-->
    <Renew ref="RenewDetailDialog" @closeVisible="specRemoteMethod"></Renew>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import CryptoJS from 'crypto-js'
import i18n from '@/i18n'
import { VIcon, FilterBar } from '@tap/component'
import { CURRENCY_SYMBOL_MAP, dayjs } from '@tap/business'
import timeFunction from '@/mixins/timeFunction'
import Time from '@tap/shared/src/time'
import SubscriptionModelDialog from '@/views/agent-download/SubscriptionModelDialog'
import transferDialog from '@/views/agent-download/transferDialog'

import { onCopy } from '@tap/shared/src/util'
import StatusTag from '../../components/StatusTag'
import InlineInput from '../../components/InlineInput'
import Unsubscribe from '../../components/Unsubscribe.vue'
import { INSTANCE_STATUS_MAP } from '../../const'
import Details from './Details'
import { getSpec, getPaymentMethod, AGENT_TYPE_MAP } from './utils'
import Renew from '../../components/Renew.vue'
import { secondDifference } from '../../util'
import { mapGetters } from 'vuex'

let timer = null

export default {
  components: {
    Renew,
    InlineInput,
    StatusTag,
    VIcon,
    Details,
    FilterBar,
    transferDialog,
    SubscriptionModelDialog,
    Unsubscribe
  },
  inject: ['buried'],
  mixins: [timeFunction],
  data() {
    return {
      loading: true,
      activeName: 'first',
      createAgentLoading: false,
      searchParams: {
        status: '',
        keyword: ''
      },
      list: [],
      customColors: [
        { color: '#23C343', percentage: 25 },
        { color: '#2C65FF', percentage: 50 },
        { color: '#F3961A', percentage: 80 },
        { color: '#F53F3F', percentage: 100 }
      ],
      agentConfig: [
        {
          label: this.$t('dfs_instance_instance_guige'),
          value: 'specLabel'
        },
        {
          label: this.$t('dfs_instance_instance_subscribe_time'),
          value: 'periodStartTime'
        },
        {
          label: this.$t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          value: 'agentTypeLabel'
        },
        {
          label: this.$t('dfs_instance_instance_daoqishijian'),
          value: 'expiredTimeLabel'
        },
        {
          label: this.$t('dfs_instance_instance_dingyuefangshi'),
          value: 'subscriptionMethodLabel'
        },
        {
          label: this.$t('agent_heartbeat'),
          value: 'pingTimeLabel'
        },
        {
          label: this.$t('task_manage_etl'),
          value: 'runningTaskSync'
        },
        {
          label: 'IP',
          value: 'ips'
        },
        {
          label: this.$t('task_manage_migrate'),
          value: 'runningTaskMigrate'
        },
        {
          label: this.$t('public_version'),
          value: 'versionLabel'
        }
      ],
      page: {
        current: 0,
        size: 1000,
        total: 0
      },
      order: 'createAt desc',
      statusMap: INSTANCE_STATUS_MAP,
      agentTypeMap: AGENT_TYPE_MAP,
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
      selectListType: 'code',
      subscriptionModelVisible: false,
      showUnsubscribeDetailVisible: false,
      //转账支付
      showTransferDialogVisible: false,
      price: '0',
      loadingCancelSubmit: false,
      paidDetailList: [],
      form: {
        refundReason: '',
        refundDescribe: '',
        refundChannel: i18n.t('dfs_instance_instance_yuanlutuihui')
      },
      currentRow: '',
      refundAmount: '',
      columns: [
        {
          label: this.$t('dfs_instance_instance_guige'),
          prop: 'spec'
        },
        {
          label: this.$t('start_time'),
          prop: 'periodStart'
        },
        {
          label: this.$t('end_time'),
          prop: 'periodEnd'
        },
        {
          label: i18n.t('dfs_instance_instance_shifujine'),
          prop: 'actualAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_yixiaohaojine'),
          prop: 'spentAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_tuidingjine'),
          prop: 'refundAmount'
        }
      ],
      rules: {
        refundDescribe: [
          {
            required: true,
            message: i18n.t('dfs_instance_instance_qingshurutuiding'),
            trigger: 'blur'
          }
        ]
      },
      paidRenewDetail: [],
      unsubscribeHelpDocumentation: '',
      supportResPools: [], //可用资源列表
      scopeMap: {
        Private: i18n.t('dfs_instance_instance_duxiangshili'),
        Share: i18n.t('dfs_instance_instance_gongxiangshili')
      },
      mdbData: [],
      //存储资源
      percentage: 0,
      specColumns: [
        {
          label: i18n.t('dfs_instance_instance_yunchangshang'),
          prop: 'providerName'
        },
        {
          label: i18n.t('dfs_instance_instance_access_information'),
          prop: 'visitInfo'
        },
        {
          label: i18n.t('dfs_instance_instance_cunchuleixing'),
          prop: 'scopeLabel'
        },
        {
          label: i18n.t('dfs_instance_instance_fuwushang'),
          prop: 'serviceProvider'
        },
        {
          label: i18n.t('dfs_instance_instance_bushufangshi'),
          prop: 'deploymentTypeLabel'
        },
        {
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_diqu'),
          prop: 'regionName'
        },
        {
          label: i18n.t('dfs_instance_instance_baimingdanIp'),
          prop: 'whiteList'
        },
        {
          label: i18n.t('dfs_instance_createagent_cunchuguige'),
          prop: 'specLabel'
        },
        {
          label: i18n.t('dfs_instance_instance_daoqishijian'),
          prop: 'expiredTimeLabel'
        },
        {
          label: i18n.t('agent_status'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: i18n.t('dfs_instance_createagent_cunchukongjian'),
          prop: 'storageLabel'
        }
      ],
      //创建白名单
      showCreateIps: false,
      ipAddress: '',
      currentMdbId: ''
    }
  },
  computed: {
    ...mapGetters(['isDomesticStation']),

    statusItems() {
      let result = []
      let filter = ['Creating', 'Running', 'Stopped']
      filter.forEach(el => {
        result.push({
          label: this.statusMap[el]?.text,
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
    },
    table() {
      return this.$refs.table
    },
    tableCode() {
      return this.$refs.tableCode
    }
  },
  watch: {
    $route(route, oldRoute) {
      if (route.name === 'Instance') {
        let oldQuery = { ...oldRoute.query, detailId: undefined }
        let query = { ...route.query, detailId: undefined }
        let params = { ...route.params }

        this.checkActive(query)

        if (params?.showTransferDialogVisible) {
          this.showTransferDialogVisible = params?.showTransferDialogVisible
          this.price = params?.price
          return
        }

        let queryStr = JSON.stringify(query)
        if (JSON.stringify(oldQuery) === queryStr) return
        this.searchParams.status = query.status || ''
        this.fetch(queryStr === '{}' ? undefined : 1)
      }
    }
  },
  created() {
    this.init()
    this.unsubscribeHelpDocumentation =
      window.__config__?.unsubscribeHelpDocumentation ||
      'https://deploy-preview-75--tapdata.netlify.app/cloud/billing/refund/#%E9%80%80%E6%AC%BE%E8%AF%B4%E6%98%8E'
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
    this.getLatestVersion()

    this.checkActive(this.$route.query)
  },
  beforeUnmount() {
    clearInterval(timer)
    timer = null
  },
  methods: {
    //关闭退订弹窗
    closeVisible() {
      this.fetch()
      this?.tableCode?.fetch()
    },
    init() {
      let query = this.$route.query
      let { detailId, ...searchParams } = Object.assign(this.searchParams, query)
      this.searchParams = searchParams
      this.getFilterItems()
      this.fetch()
      // 是否触发创建agent
      if (query?.create) {
        this.handleCreateAgent()
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
    changeTabs() {
      if (this.activeName === 'second') {
        this.specRemoteMethod()
      }
    },
    //存储资源
    specRemoteMethod() {
      this.$axios.get('api/tcm/mdb').then(data => {
        const items = data.items || []
        this.mdbData = items
          .filter(t => !(t.deploymentType == 'Local' && t.scope === 'Private'))
          .map(item => {
            const { subscribeDto = {} } = item.orderInfo
            const { endAt } = subscribeDto || {}

            item.expiredTimeLabel = endAt ? dayjs(endAt).format('YY-MM-DD  HH:mm:ss') : '-'
            item.scopeLabel = this.scopeMap[item.scope]
            item.specLabel = getSpec(item.spec) || '-'
            item.providerName = item.providerName || '-'
            item.regionName = item.regionName || '-'
            item.serviceProvider = item.serviceProvider || '-'
            item.deploymentTypeLabel = this.agentTypeMap[item.deploymentType]

            // 获取访问的账号密码，以及完整的uri
            const { connectionString } = item
            item.visitInfo = item.dbUsers?.find(t => t.roles.some(r => r.role === 'readAnyDatabase'))
            if (item.visitInfo) {
              const { username, password } = item.visitInfo
              const AES_KEY = '5fa25b06ee34581d'
              const AES_PAD = '5fa25b06ee34581d'
              const AES_PASSWORD = CryptoJS.AES.decrypt(
                {
                  ciphertext: CryptoJS.enc.Base64.parse(password)
                },
                CryptoJS.enc.Latin1.parse(AES_KEY),
                {
                  iv: CryptoJS.enc.Latin1.parse(AES_PAD)
                }
              ).toString(CryptoJS.enc.Utf8)
              const splitStr = '://'
              const splitIndex = connectionString.indexOf(splitStr) + splitStr.length
              if (splitIndex > -1) {
                item.visitInfo.showUri =
                  connectionString.slice(0, splitIndex) + `***:***@` + connectionString.slice(splitIndex)
                item.visitInfo.copyUri =
                  connectionString.slice(0, splitIndex) +
                  `${username}:${AES_PASSWORD}@` +
                  connectionString.slice(splitIndex)
              }
            }

            const { storageSize, storageUnit = 'GB' } = item.spec || {}
            let num = Number(item?.dataSize) || 0
            // 字节转G
            if (storageSize) {
              item.storageLabel = `${storageSize} ${storageUnit}`
              let size = Math.min(storageSize, num / (storageUnit === 'MB' ? 1048576 : 1073741824)).toFixed(2)
              item.percentage = Math.round((size / storageSize).toFixed(1) * 100)
              item.dataSizeLast = `${(storageSize - size).toFixed(2)} ${storageUnit}`
              item.dataSizeLabel = `${size} ${storageUnit}`
            }
            return item
          })
      })
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
    getLatestVersion() {
      this.$axios.get('api/tcm/config/version/latest').then(data => {
        this.version = data.version
        this.supportResPools = data.supportResPools
      })
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

      this.$store.commit('setInstanceLoading', true)
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
        size: 100,
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
            item.deployDisable = item?.tmInfo?.pingTime || false
            const { subscribeDto = {}, license = {}, chargeProvider } = item.orderInfo || {}
            const { startAt, endAt, periodUnit, subscribeType, paymentMethod } = subscribeDto
            item.chargeProvider = chargeProvider
            item.specLabel = getSpec(item.spec) || '-'
            if (chargeProvider === 'FreeTier') {
              item.subscriptionMethodLabel = i18n.t('dfs_instance_instance_mianfei')
            } else if (item.publicAgent) {
              item.subscriptionMethodLabel = i18n.t('dfs_instance_instance_gongyongshili')
            } else if (['Stripe', 'Balance'].includes(chargeProvider)) {
              item.subscriptionMethodLabel =
                getPaymentMethod(
                  { periodUnit: periodUnit, type: subscribeType },
                  paymentMethod || 'Stripe',
                  chargeProvider
                ) || '-'
            } else {
              item.subscriptionMethodLabel = '-'
            }
            item.periodLabel =
              dayjs(startAt).format('YY-MM-DD HH:mm:ss') + ' - ' + dayjs(endAt).format('YY-MM-DD HH:mm:ss')
            //订阅时间
            item.periodStartTime = dayjs(startAt).format('YY-MM-DD HH:mm:ss')
            item.content = `${item.subscriptionMethodLabel} ${item.specLabel} ${i18n.t('public_agent')}`
            //过期时间
            if (item.publicAgent) {
              item.expiredTimeLabel = item.expiredTime ? dayjs(item.expiredTime).format('YY-MM-DD HH:mm:ss') : '-'
            } else if (chargeProvider === 'Aliyun') {
              item.expiredTime = license.expiredTime
              let time = new Date(item.expiredTime.replace('Z', '+08:00')).toLocaleString()
              item.expiredTimeLabel = item.expiredTime ? dayjs(time).format('YY-MM-DD HH:mm:ss') : '-'
            } else if (chargeProvider === 'Stripe') {
              item.expiredTime = endAt
              item.expiredTimeLabel = item.expiredTime ? dayjs(item.expiredTime).format('YY-MM-DD  HH:mm:ss') : '-'
            } else {
              item.expiredTime = ''
              item.expiredTimeLabel = '-'
            }
            //心跳时间
            item.pingTimeLabel = this.handlePingTime(item)
            //数据开发任务个数
            item.runningTaskMigrate = item?.metric?.runningTask?.migrate || 0
            //数据复制任务个数
            item.runningTaskSync = item?.metric?.runningTask?.sync || 0
            //版本
            item.versionLabel = item?.spec?.version || 0
            //托管方式
            item.agentTypeLabel = this.agentTypeMap[item.agentType]
            item.second = secondDifference(item?.tmInfo?.pingTime, 'second')
            //心跳頻率 = 當前时间- 心跳时间 单位秒
            let max = 10 * 60
            let pingTimes = item?.tmInfo?.pingTime
            if (pingTimes) {
              let second = secondDifference(item?.tmInfo?.pingTime, 'second')
              item.pingTimePercent = Math.min(100, Math.round((second / max).toFixed(2) * 100))
              const date1 = dayjs(pingTimes)
              const date2 = dayjs(Time.now())
              const diff = date2.diff(date1, 'second')
              item.pingTimes = diff < 60 ? diff + 's' : date1.from(date2, true)
            } else {
              item.pingTimePercent = 0
              item.pingTimes = '-'
            }

            item.paidType =
              chargeProvider === 'Aliyun' ? license.type : chargeProvider === 'Stripe' ? subscribeDto.type : ''
            item.deployDisable = item?.tmInfo?.pingTime || false
            if (!item.tmInfo) {
              item.tmInfo = {}
            }
            item.btnLoading = {
              deploy: false,
              stop: false,
              delete: false
            }
            item.ips = item.metric?.systemInfo?.ips?.[0]
            return item
          })
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
          this.$store.commit('setInstanceLoading', false)
        })
    },
    //自定义百分比文案
    formatPingTimePercantage(second) {
      return i18n.t('dfs_instance_instance_perce_minute', { val1: second })
    },
    ////指標計算
    agentData(row) {
      if (!row?.cpuUsage) {
        return { cpuUsage: 0, memoryRate: 0, gcRate: 0 }
      }
      //指標計算
      const { cpuUsage = 0, gcRate = 0, memoryRate = 0 } = row?.cpuUsage
      let cpu =
        typeof cpuUsage === 'number'
          ? (cpuUsage * 100).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : 0
      let memory =
        typeof memoryRate === 'number'
          ? (memoryRate * 100).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : 0
      let gc =
        typeof gcRate === 'number'
          ? (gcRate * 100).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : 0
      return {
        cpuUsage: cpu === '0.00' ? 0 : Number(cpu),
        memoryRate: memory === '0.00' ? 0 : Number(memory),
        gcRate: gc === '0.00' ? 0 : Number(gc)
      }
    },
    handlePingTime(row) {
      let pingTime = row?.tmInfo?.pingTime
      return pingTime ? dayjs(pingTime).format('YY-MM-DD HH:mm:ss') : '-'
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
      this.buried('agentDeploy')
      this.$router.push({
        name: 'installAgent',
        params: {
          id: row?.id
        }
      })
    },
    // 停止
    handleStop(row, from) {
      if (this.stopBtnDisabled(row)) {
        return
      }
      if (row.tapdataAgentStatus === 'stopped') {
        this.$message.warning(this.$t('dfs_instance_tapdata_agent_status_tip'))
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
          agentId: id
        }
      })
    },
    showUpgradeDialogFnc(row) {
      this.rowClick(row)
      // windons 全托管不支持自动升级
      if (this.isWindons(row)) {
        this.manualUpgradeFnc()
        return
      }
      // 版本号
      this.$axios.get('api/tcm/config/version/latest/' + row.id).then(getVersion => {
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
        this.upgradeDialog = true
      })
    },
    showUpgradeErrorDialogFnc(row) {
      this.rowClick(row)
      this.upgradeErrorDialog = true
    },
    //自动升级
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
              token: token,
              op: 'upgrade'
            })
            .then(() => {
              this.$message.success(this.$t('agent_auto_upgrade_tip_start'))
              this.fetch()
            })
        })
      })
    },
    //全托管升级
    fullManagementUpgradeFnc() {
      let params = {
        agentId: this.selectedRow.id,
        version: this.version //最新版本号
      }
      this.$axios.post('api/tcm/orders/change', params).then(() => {
        this.$message.success(this.$t('agent_auto_upgrade_tip_start'))
        this.closeDialog()
        this.fetch()
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
    handleCreateIps(row) {
      //新增白名单
      this.currentMdbId = row.id
      this.ipAddress = row.whiteList || ''
      this.showCreateIps = true
    },
    handleCreateAgent() {
      //this.subscriptionModelVisible = true
      this.$router.push({
        name: 'createAgent'
      })
      this.buried('newAgentStripeDialog')
    },
    addIps() {
      let ips = this.ipAddress.split(',')
      const ipRegex = /^((?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?:\/\d{1,3})?)$/

      if (ips.length > 0 && this.ipAddress && this.ipAddress !== '') {
        for (let i = 0; i < ips.length; i++) {
          if (!ipRegex.test(ips[i])) {
            this.$message.error(i18n.t('dfs_instance_instance_buhefaIp'))
            return
          }
        }
      }
      let params = {
        mdbId: this.currentMdbId,
        whiteList: this.ipAddress
      }
      this.$axios
        .post('api/tcm/mdb/update/whitelist', params)
        .then(() => {
          this.showCreateIps = false
          this.specRemoteMethod()
        })
        .finally(() => {
          this.showCreateIps = false
        })
    },

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
        flag =
          !['Creating', 'Running', 'Stopped', 'Error', 'Freezing', 'Freeze'].includes(row.status) ||
          row.metric.runningTaskNum > 0
      } else {
        flag = !['Creating', 'Stopped'].includes(row.status)
      }
      return flag
    },
    //退订实例禁用
    disableUnsubscribe(row) {
      if (row.agentType === 'Cloud') {
        return !['Running', 'Stopped', 'Error'].includes(row.status)
      } else {
        return !['Running', 'Creating', 'Stopped', 'Error'].includes(row.status)
      }
    },
    //续订实例禁用
    disableRenew(row) {
      let { orderInfo = {} } = row
      let { subscribeDto = {} } = orderInfo
      let { subscribeType, totalAmount, status } = subscribeDto
      return !['active'].includes(status) || totalAmount === 0 || subscribeType === 'recurring' || row?.publicAgent
    },
    //退订存储禁用
    disableMdbUnsubscribe(row) {
      if (row?.resource?.scope === 'Private') {
        return !['Activated'].includes(row.status)
      } else {
        return !['Assigned'].includes(row.status)
      }
    },
    // 重启
    renewBtnDisabled(row) {
      return !['Running', 'Error'].includes(row.status)
    },
    //禁用半托管重启 -启动 agent离线，预期重启不能点击
    restartBtnDisabled(row) {
      return ['Creating', 'Stopping', 'Stopped'].includes(row.status) || ['starting'].includes(row.engineStatus) //tapdataAgent 失活了
    },
    //agent运行中，预期 启动 不能点击
    startBtnDisabled(row) {
      return (
        ['Creating', 'Stopping', 'Running'].includes(row.status) || ['starting'].includes(row.engineStatus) //tapdataAgent 失活了
      )
    },
    showVersionFlag(row) {
      let { status, tmInfo } = row
      return !(status === 'Creating' && !tmInfo?.pingTime)
    },
    showUpgradeIcon(row) {
      let { version } = this
      if (row?.publicAgent) return false
      if (row.agentType === 'Cloud') {
        //全托管升级必须在支持升级可用资源区
        let available =
          this.supportResPools.filter(it => it.provider === row.provider && it.region === row.region) || []
        return !!(version && row.status === 'Running' && row?.spec?.version !== version && available?.length > 0)
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

    async handleNewAgent(params = {}) {
      try {
        const data = await this.$axios.post('api/tcm/orders', params)
        this.buried('agentCreate')
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
        agentType: 'Local',
        chargeProvider: 'FreeTier'
      })
      return flag
    },
    //全托管-重启
    handleRenew(row) {
      this.$axios.post('api/tcm/agent/restart?agentId=' + row.id).then(() => {
        this.$message.success(this.$t('public_message_operation_success'))
      })
    },
    // 半托管重启
    handleRestart(row) {
      if (row.tapdataAgentStatus === 'stopped') {
        this.$message.warning(this.$t('dfs_instance_tapdata_agent_status_tip'))
        return
      }
      this.$axios
        .post('tm/api/clusterStates/updataAgent', {
          process_id: row?.tmInfo?.agentId,
          op: 'restart'
        })
        .then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
          this.fetch()
        })
    },
    // 半托管启动
    handleStart(row) {
      if (row.tapdataAgentStatus === 'stopped') {
        this.$message.warning(this.$t('dfs_instance_tapdata_agent_status_tip'))
        return
      }
      this.$axios
        .post('tm/api/clusterStates/updataAgent', {
          process_id: row?.tmInfo?.agentId,
          op: 'start'
        })
        .then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
          this.fetch()
        })
    },
    //退订详情
    openUnsubscribe(row) {
      let { orderInfo = {} } = row
      let { subscriptionId = {}, subscribeDto = {} } = orderInfo
      let sub = {
        id: subscriptionId,
        paidType: subscribeDto?.paymentMethod,
        type: 'Engine',
        subscribeItems: subscribeDto?.subscribeItems
      }
      this.$refs?.UnsubscribeDetailDialog?.getUnsubscribePrice(sub, 'Engine')
    },
    //退订存储详情
    openMdbUnsubscribe(row) {
      let { orderInfo = {} } = row
      let { subscriptionId = {}, subscribeDto = {} } = orderInfo
      let sub = {
        id: subscriptionId,
        paidType: subscribeDto?.paymentMethod,
        type: 'MongoDB',
        subscribeItems: subscribeDto?.subscribeItems
      }
      this.$refs?.UnsubscribeDetailDialog?.getUnsubscribePrice(sub, 'MongoDB')
    },
    formatPrice(currency, price) {
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    //续订
    openRenew(row) {
      let { orderInfo = {} } = row
      let { subscriptionId = {}, subscribeDto = {} } = orderInfo
      let sub = {
        id: subscriptionId,
        paidType: subscribeDto?.paymentMethod,
        endAt: subscribeDto?.endAt,
        subscribeItems: subscribeDto?.subscribeItems,
        currency: subscribeDto?.currency,
        periodUnit: subscribeDto?.periodUnit
      }
      this.$refs?.RenewDetailDialog?.openRenew(sub)
    },
    //退订
    handleUnsubscribe(row = {}) {
      this.$confirm(
        i18n.t('dfs_user_center_ninjiangtuidingr', { val1: row.content }),
        i18n.t('dfs_user_center_tuidingfuwu'),
        {
          type: 'warning'
        }
      ).then(res => {
        if (!res) return
        const { paidType } = row
        this.buried('unsubscribeAgentStripe', '', {
          type: paidType
        })
        this.$axios
          .post('api/tcm/orders/cancel', { instanceId: row.id })
          .then(() => {
            this.fetch()
            this.buried('unsubscribeAgentStripe', '', {
              result: true,
              type: paidType
            })
            this.$message.success(this.$t('public_message_operation_success'))
          })
          .catch(() => {
            this.buried('unsubscribeAgentStripe', '', {
              result: false,
              type: paidType
            })
          })
      })
    },
    //删除公共引擎
    handleDelete(row) {
      this.$confirm(
        i18n.t('dfs_user_center_ninjiangtuidingr', { val1: row.content }),
        i18n.t('dfs_user_center_tuidingfuwu'),
        {
          type: 'warning'
        }
      ).then(res => {
        if (!res) return
        this.$axios.post('tm/api/Workers/share/delete').then(() => {
          this.fetch()
          this.$message.success(this.$t('public_message_operation_success'))
        })
      })
    },
    //删除存储
    handleDeleteMdb(row) {
      this.$confirm(i18n.t('agent_button_delete_mdb_confirm_title'), i18n.t('button_delete'), {
        type: 'warning'
      }).then(res => {
        if (!res) return
        let url = 'api/tcm/mdb/share/' + row.id
        if (row.scope === 'Private') {
          url = 'api/tcm/mdb/private/' + row.id
        }
        this.$axios.delete(url).then(() => {
          this.tableCode?.fetch()
          this.$message.success(this.$t('public_message_operation_success'))
        })
      })
    },
    checkActive(query) {
      if (query.active === 'storage') {
        this.activeName = 'second'
        this.$nextTick(() => {
          this.specRemoteMethod()
        })
      }
    },
    handleVisitInfo(row = {}) {
      const { showUri, copyUri } = row.visitInfo || {}
      this.$confirm(showUri || this.$t('public_data_no_data'), i18n.t('dfs_instance_instance_access_information'), {
        type: 'warning',
        confirmButtonText: i18n.t('public_button_copy'),
        showCancelButton: false
      }).then(res => {
        if (!res) return
        onCopy(copyUri || this.$t('public_data_no_data'))
        this.$message.success(this.$t('public_message_copied'))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-flex {
  display: flex;
}

// agent列表
.agent-ul {
  gap: 16px;
  //height: 100%;
  overflow: auto;
}

.agent-item {
  width: 48%;
  border-radius: 8px;
  border: 1px solid var(--unnamed, #e5e6eb);
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06);
}

.mdb-ul {
  gap: 16px;
  overflow: auto;
}

.mdb-item {
  width: 99%;
  min-height: 205px;
  border-radius: 8px;
  border: 1px solid var(--unnamed, #e5e6eb);
  background: #fff;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06);
}

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

        :deep(.el-input__inner) {
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

  :deep(.v-icon) {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    margin-top: -7px;
    margin-left: -7px;
  }
}

.upgrading-progress {
  :deep(.el-progress-circle) {
    width: 16px !important;
    height: 16px !important;
  }
}

.inline-input {
  :deep(.input) {
    flex: 1;
    min-width: 0;
    width: auto;
  }

  :deep(.el-input--mini .el-input__inner) {
    padding: 0 4px;
  }

  :deep(.icon-button) {
    width: 20px;
    height: 20px;
  }
}

:deep(.el-dropdown-menu__item.dropdown-item--disabled) {
  color: map-get($color, disable);
  cursor: default;

  &:hover {
    background: unset;
    color: map-get($color, disable);
  }
}

:deep(.tooltip--notenter) {
  pointer-events: none;
}

:deep(.download-dialog) {
  .el-dialog__body {
    height: 475px;
    padding: 0 20px 40px 20px;
  }
}

:deep(.el-tabs__content) {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.subscription-ul {
  background: #e9e9eb;
  border: 1px solid #e9e9eb;
  border-radius: 4px;
  padding: 8px 12px;
}
</style>

<style lang="scss">
:not(body):has(> .agent-item .driver-active-element) {
  overflow: hidden !important;
}

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
