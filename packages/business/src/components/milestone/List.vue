<script>
import { proxyApi } from '@tap/api'
import { VIcon, VTable } from '@tap/component'

import i18n from '@tap/i18n'
import { calcTimeUnit, copyToClipboard } from '@tap/shared'
import Time from '@tap/shared/src/time'

import dayjs from 'dayjs'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'

import { ErrorMessage } from '../error-message'
import NodeList from '../nodes/List'

export default {
  name: 'List',
  components: { VIcon, NodeList, VTable },
  props: {
    dataflow: {
      type: Object,
      default: () => {
        return {}
      },
    },
    nodeId: String,
  },
  emits: ['update:nodeId'],
  data() {
    const activeNodeId = this.nodeId
    const activeNode = activeNodeId
      ? this.$store.getters['dataflow/nodeById'](activeNodeId)
      : {}
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

    return {
      isDaas,
      activeNodeId,
      activeNode,
      columns: [
        {
          label: i18n.t('packages_business_milestone_list_guanjianbuzhou'),
          prop: 'label',
        },
        {
          label: i18n.t('packages_business_connection_list_status'),
          slotName: 'statusLabel',
        },
        {
          label: i18n.t('packages_business_task_info_start_time'),
          dataType: 'time',
          prop: 'begin',
        },
        {
          label: i18n.t('packages_business_verification_LastTime'),
          dataType: 'time',
          prop: 'end',
        },
        {
          label: i18n.t('packages_business_milestone_list_haoshi'),
          prop: 'diff',
        },
      ],
      codeDialog: {
        visible: false,
        expandErrorMessage: false,
        data: {
          errorStack: '',
          errorCode: '',
          fullErrorCode: '',
          describe: '',
          solution: '',
          dynamicDescribe: '',
          seeAlso: [],
          module: '',
          message: '',
        },
      },
      hideSeeAlso:
        import.meta.env.VUE_APP_PAGE_TITLE === 'IKAS' ||
        import.meta.env.VUE_APP_HIDE_LOG_SEE_ALSO,
    }
  },
  computed: {
    nodeMilestones() {
      const { activeNodeId } = this
      if (!activeNodeId) return {}
      return this.dataflow.attrs?.nodeMilestones?.[activeNodeId] || {}
    },

    wholeItems() {
      const milestone = this.dataflow.attrs?.milestone || {}
      const agentName = this.dataflow.agentName
      const shareCache = this.dataflow.shareCache

      let result = [
        {
          key: 'TASK',
          label: i18n.t('packages_business_milestone_list_renwudiaodu'),
        },
        {
          key: 'DEDUCTION',
          label: i18n.t(
            'packages_business_milestone_list_load_table_structure',
          ),
        },
        {
          key: 'DATA_NODE_INIT',
          label: i18n.t('packages_business_milestone_list_shujujiedianchu'),
        },
        {
          key: 'TABLE_INIT',
          label: i18n.t('packages_business_milestone_list_biaojiegouqianyi'),
        },
        {
          key: 'SNAPSHOT',
          label: i18n.t('packages_business_milestone_list_quanliangshujuqian'),
        },
        {
          key: 'CDC',
          label: i18n.t('packages_business_milestone_list_jinruzengliangshu'),
        },
      ]

      const dataflowType = this.dataflow.type
      let iconRunning = 'loading-circle'
      let iconRunningColor = 'color-success'
      if (this.dataflow.status != 'running') {
        iconRunning = 'time'
        iconRunningColor = 'color-primary'
      }
      if (['logCollector'].includes(this.dataflow.syncType)) {
        delete result[2]
        delete result[3]
      }

      // 全量不显示增量信息
      result = result.filter(
        (t) =>
          dataflowType === 'initial_sync+cdc' ||
          (dataflowType === 'cdc' && t.key !== 'SNAPSHOT') ||
          (dataflowType === 'initial_sync' && t.key !== 'CDC'),
      )
      //缓存任务没有表结构复制这一步骤
      if (shareCache) {
        result = result.filter((it) => it.key !== 'TABLE_INIT')
      }

      const finishOpt = {
        status: 'FINISH',
        desc: i18n.t('public_status_complete'),
        icon: 'success',
        color: 'color-success',
      }
      const runningOpt = {
        status: 'RUNNING',
        desc: i18n.t('packages_business_milestone_list_status_progressing'),
        icon: iconRunning,
        progress: 0,
        color: 'color-primary',
      }
      const cdcRunningOpt = {
        status: 'RUNNING',
        desc: i18n.t('packages_business_milestone_list_status_cdc_progressing'),
        icon: iconRunning,
        progress: 0,
        color: 'color-primary',
      }
      const cdcFinishOpt = {
        status: 'FINISH',
        desc: i18n.t('packages_business_milestone_list_status_cdc_finish'),
        icon: iconRunning,
        progress: 0,
        color: iconRunningColor,
      }
      const waitingOpt = {
        status: 'WAITING',
        desc: i18n.t('public_status_waiting'),
        icon: 'time',
        color: 'color-primary',
      }
      const retryOpt = {
        status: 'RUNNING',
        icon: iconRunning,
        color: 'color-warning',
      }
      const stopOpt = {
        status: 'STOP',
        icon: 'warning',
        color: 'color-warning',
      }
      const errorOpt = {
        status: 'ERROR',
        // desc: i18n.t('public_status_error'),
        icon: 'error',
        color: 'color-danger',
      }
      result.forEach((el) => {
        let item = milestone[el.key]
        if (item == undefined) {
          item = {
            begin: 0,
            end: 0,
            totals: '-',
            progress: '-',
          }
        }
        const time =
          item.begin && item.end
            ? calcTimeUnit(item.end - item.begin, 2, {
                autoHideMs: true,
              })
            : '-'
        const begin = dayjs(item.begin).format('HH:mm:ss')
        const end = item.end ? dayjs(item.end).format('HH:mm:ss') : ''

        switch (item?.status) {
          case 'FINISH':
            Object.assign(el, finishOpt)
            switch (el.key) {
              case 'TASK':
                Object.assign(el, {
                  dataDesc: `, ${i18n.t('public_milestone_time_scheduling', {
                    val: agentName,
                  })}, ${end}`,
                })
                break
              case 'DEDUCTION':
                Object.assign(el, {
                  dataDesc: `, ${i18n.t('public_milestone_time_consuming')} ${time}, ${begin} ~ ${end}`,
                })
                break
              case 'DATA_NODE_INIT':
                Object.assign(el, {
                  dataDesc: `, ${i18n.t('public_milestone_connection_succeeded')},  ${i18n.t(
                    'public_milestone_time_consuming',
                  )} ${time}, ${begin} ~ ${end}`,
                })
                break
              case 'TABLE_INIT':
                Object.assign(el, {
                  dataDesc: `, ${i18n.t('public_milestone_time_table_structure', { val: item.totals })}, ${i18n.t(
                    'public_milestone_time_consuming',
                  )} ${time}, ${begin} ~ ${end}`,
                })
                break
              case 'SNAPSHOT':
                Object.assign(el, {
                  dataDesc: `, ${i18n.t('public_milestone_time_consuming')} ${time}, ${begin} ~ ${end}`,
                })
                break
              case 'CDC':
                Object.assign(el, cdcFinishOpt)
                Object.assign(el, {
                  dataDesc: `, ${i18n.t('public_milestone_time_cdc_consuming')} ${time}, ${begin}`,
                })
                break
            }
            break
          case 'ERROR':
            Object.assign(el, errorOpt)
            break
          case 'RUNNING':
            switch (el.key) {
              case 'CDC':
                Object.assign(el, cdcRunningOpt, {
                  progress: (item.progress / item.totals) * 100,
                })
                break
              default:
                Object.assign(el, runningOpt, {
                  progress: (item.progress / item.totals) * 100,
                })
            }
            break
          default:
            Object.assign(el, waitingOpt)
            break
        }

        if (item.retrying) {
          // 正在重试
          Object.assign(el, retryOpt)

          el.desc = `${i18n.t('public_retrying')}${
            !item.retryTimes || !item.totalOfRetries
              ? ''
              : ` ${item.retryTimes}/${item.totalOfRetries}`
          }${
            item.nextRetryTs
              ? `, ${i18n.t('public_next_retry_time')} ${dayjs(item.nextRetryTs).format('YYYY-MM-DD HH:mm:ss')}`
              : ''
          }`
          el.dataDesc = ''
        }

        if (item.status === 'ERROR') {
          el.errorMessage = item.errorMessage
          el.errorCode = item.errorCode
          el.stackMessage = item.stackMessage
          el.dynamicDescriptionParameters = item.dynamicDescriptionParameters
          el.status = 'ERROR'
        }
      })
      const len = result.length
      const finishedLen = result.filter((t) => t.status === 'FINISH').length
      let currentLen = finishedLen + 1
      if (currentLen > len) {
        currentLen = currentLen - 1
      }

      const per = (finishedLen / len) * 100

      result.reverse()

      result.unshift({
        label: i18n.t('packages_business_milestone_list_zhengtijindu'),
        icon: 'device',
        percentage: per,
        desc: i18n.t('packages_business_milestone_list_finish', {
          val1: finishedLen,
          val2: len,
          val3: `${result[currentLen - 1].label} ${result[currentLen - 1].desc}`,
        }),
      })

      return result
    },

    nodeData() {
      const { nodeMilestones } = this
      const dataflowType = this.dataflow.type
      const NODE_MAP = {
        source: [
          {
            key: 'NODE',
            label: i18n.t(
              'packages_business_milestone_list_lianjiebingyanzheng',
            ),
          },
          {
            key: 'SNAPSHOT_READ',
            label: i18n.t('packages_business_milestone_list_duququanliangshu'),
          },
          {
            key: 'OPEN_CDC_READ',
            label: i18n.t('packages_business_milestone_list_kaiqizengliang'),
          },
          {
            key: 'CDC_READ',
            label: i18n.t('packages_business_milestone_list_duquzengliangshu'),
          },
        ],
        target: [
          {
            key: 'NODE',
            label: i18n.t(
              'packages_business_milestone_list_lianjiebingyanzheng',
            ),
          },
          {
            key: 'TABLE_INIT',
            label: i18n.t(
              'packages_business_milestone_list_chuangjianmubiaobiao',
            ),
          },
        ],
        processor: [
          {
            key: 'NODE',
            label: i18n.t('packages_business_milestone_list_shujuchuli'),
          },
        ],
      }

      if (['logCollector'].includes(this.dataflow.syncType)) {
        delete NODE_MAP.target[1]
      }

      if (dataflowType === 'cdc') {
        NODE_MAP.target.push({
          key: 'CDC_WRITE',
          label: i18n.t('packages_business_milestone_list_zengliangshujuxie'),
        })
      } else if (dataflowType === 'initial_sync') {
        NODE_MAP.target.push({
          key: 'SNAPSHOT_WRITE',
          label: i18n.t('packages_business_milestone_list_quanliangshujuxie'),
        })
      } else {
        NODE_MAP.target.push({
          key: 'SNAPSHOT_WRITE',
          label: i18n.t('packages_business_milestone_list_quanliangshujuxie'),
        })
        NODE_MAP.target.push({
          key: 'CDC_WRITE',
          label: i18n.t('packages_business_milestone_list_zengliangshujuxie'),
        })
      }
      const STATUS_MAP = {
        FINISH: {
          label: i18n.t('public_status_finished'),
          color: 'color-success',
        },
        RUNNING: {
          label: i18n.t('packages_business_milestone_list_status_progressing'),
          color: 'color-primary',
        },
        WAITING: {
          label: i18n.t('public_status_waiting'),
          color: 'color-info',
        },
        STOP: {
          label: i18n.t('public_status_stop'),
          color: 'color-warning',
        },
        ERROR: {
          label: i18n.t('packages_business_milestone_list_chucuo'),
          color: 'color-danger',
        },
      }

      return NODE_MAP[this.activeNode.nodeType]
        .filter(
          (t) =>
            dataflowType === 'initial_sync+cdc' ||
            (dataflowType === 'cdc' && !['SNAPSHOT_READ'].includes(t.key)) ||
            (dataflowType === 'initial_sync' &&
              !['OPEN_CDC_READ', 'CDC_READ'].includes(t.key)),
        )
        .map((el) => {
          const data = nodeMilestones[el.key]
          const t = Object.assign({}, el, data)
          const { status = 'WAITING' } = t
          t.statusColor = STATUS_MAP[status]?.color
          t.statusLabel = STATUS_MAP[status]?.label || '-'
          t.diff =
            t.begin && t.end
              ? calcTimeUnit(t.end - t.begin, 2, {
                  autoHideMs: true,
                })
              : '-'
          return t
        })
    },

    errorNodeIds() {
      const nodeMilestones = this.dataflow.attrs?.nodeMilestones || {}
      const result = []
      for (const nodeId in nodeMilestones) {
        const node = nodeMilestones[nodeId]
        let flag = false
        for (const key in node) {
          flag = node[key].status === 'ERROR'
        }
        flag && result.push(nodeId)
      }
      return result
    },
  },
  watch: {
    nodeId(v) {
      this.activeNodeId = v
      this.activeNode = v ? this.$store.getters['dataflow/nodeById'](v) : {}
    },
  },
  methods: {
    handleChange(val, node) {
      this.activeNode = val ? node : {}
      $emit(this, 'update:nodeId', val)
    },

    handleError(row = {}) {
      ErrorMessage(row.errorMessage)
    },

    handleCode(item = {}) {
      const errorCode = item.errorCode || '11001'
      const params = {
        className: 'ErrorCodeService',
        method: 'getErrorCodeWithDynamic',
        args: [
          errorCode,
          i18n.locale === 'en' ? 'en' : 'cn',
          item.dynamicDescriptionParameters,
        ],
      }

      this.codeDialog.data.errorStack = item.stackMessage
      this.codeDialog.data.errorCode = errorCode
      this.codeDialog.data.fullErrorCode = item.fullErrorCode
      this.codeDialog.data.message = item.message
      this.codeDialog.data.module = ''

      proxyApi
        .call(params)
        .then((data) => {
          Object.assign(this.codeDialog.data, data)

          this.codeDialog.data.describe = data.describe || item.errorMessage

          this.codeDialog.visible = true
        })
        .catch(() => {
          this.codeDialog.visible = true
        })
    },

    getDueTimeAndProgress(data = {}) {
      const {
        tableTotal,
        snapshotTableTotal,
        snapshotRowTotal,
        snapshotInsertRowTotal,
        snapshotStartAt,
      } = data
      const progress =
        snapshotTableTotal && tableTotal
          ? Math.round((snapshotTableTotal / tableTotal) * 100)
          : 0
      const usedTime = Time.now() - snapshotStartAt
      let time
      if (!snapshotInsertRowTotal || !snapshotRowTotal || !snapshotStartAt) {
        time = 0
      } else {
        time = snapshotRowTotal / (snapshotInsertRowTotal / usedTime) - usedTime
      }

      return {
        progress,
        time,
      }
    },

    handleCustomClass(node) {
      return this.errorNodeIds.includes(node?.id) ? 'error-node' : ''
    },

    handleCopyStack(stack) {
      copyToClipboard(stack)
      this.$message.success(this.$t('public_message_copy_success'))
    },
    handleCreateTicket() {
      const errorCode =
        this.codeDialog.data.fullErrorCode || this.codeDialog.data.errorCode

      window.open(
        this.$router.resolve({
          name: 'TicketSystem',
          query: {
            form: encodeURIComponent(
              JSON.stringify({
                jobId: this.dataflow.id,
                subject: `${errorCode}${this.codeDialog.data.message ? `-${this.codeDialog.data.message}` : ''}`,
                description: `Error Code: ${errorCode}
Module: ${this.codeDialog.data.module}
Describe: ${this.codeDialog.data.describe ? `\n${this.codeDialog.data.describe}` : ''}
Stack Trace: ${this.codeDialog.data.errorStack ? `\n${this.codeDialog.data.errorStack}` : ''}`,
              }),
            ),
          },
        }).href,
      )
    },
  },
}
</script>

<template>
  <div class="flex h-100">
    <NodeList
      v-model:value="activeNodeId"
      :label="$t('packages_business_milestone_list_zhengtijindu')"
      class="node-list border-end mr-4 flex-shrink-0"
      :custom-class="handleCustomClass"
      @change="handleChange"
    >
      <template #right>
        <VIcon class="ml-2 color-warning error-icon">warning</VIcon>
      </template>
    </NodeList>
    <div v-if="activeNodeId" class="flex-fill overflow-auto">
      <VTable
        ref="table"
        row-key="id"
        :columns="columns"
        :data="nodeData"
        hide-on-single-page
        class="pt-4"
      >
        <template #statusLabel="scope">
          <div
            v-if="scope.row.status === 'ERROR'"
            :class="scope.row.statusColor"
            class="inline-flex align-items-center cursor-pointer"
            @click="handleCode(scope.row)"
          >
            <span class="color-danger underline">{{
              $t('public_task_mission_error')
            }}</span>
            <VIcon class="color-danger ml-2">error</VIcon>
          </div>
          <div v-else :class="scope.row.statusColor">
            {{ scope.row.statusLabel }}
          </div>
        </template>
      </VTable>
    </div>
    <div v-else class="milestone-main flex-fill overflow-auto py-4">
      <div
        v-for="(item, index) in wholeItems"
        :key="index"
        class="pro-line flex"
      >
        <div class="position-relative">
          <div
            v-if="index + 1 !== wholeItems.length"
            class="step__line position-absolute"
          />
          <VIcon
            :class="[
              item.color,
              'mt-1 position-relative',
              { 'loading-circle': item.icon === 'loading-circle' },
            ]"
            size="16"
            >{{ item.icon }}</VIcon
          >
        </div>
        <div class="ml-4 step__line_pt flex-fill">
          <span class="font-color-normal fw-bold">{{ item.label }}: </span>
          <span
            v-if="item.status === 'ERROR'"
            class="mt-2 color-danger underline clickable"
            @click="handleCode(item)"
            >{{ $t('packages_business_error_details') }}</span
          >
          <span v-if="item.desc" class="mt-2 color-info">{{ item.desc }}</span>
          <span v-if="item.dataDesc" class="mt-2 color-info">{{
            item.dataDesc
          }}</span>
          <ElProgress
            v-if="typeof item.percentage === 'number'"
            :percentage="item.percentage"
            :stroke-width="10"
            class="milestone-mt-1"
            :show-text="false"
          />
        </div>
      </div>
    </div>

    <ElDialog
      v-model="codeDialog.visible"
      width="80%"
      custom-class="max-w-1000 mt-25 --padding"
      :close-on-click-modal="false"
      append-to-body
      @open="codeDialog.expandErrorMessage = false"
    >
      <template #header>
        <div class="flex align-center gap-2">
          <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
          <span class="fs-6 fw-sub">{{
            codeDialog.data.fullErrorCode ||
            codeDialog.data.errorCode ||
            $t('packages_business_error_details')
          }}</span>
        </div>
      </template>

      <div class="font-color-light">
        <!--错误信息-->
        <template v-if="codeDialog.data.describe">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('packages_business_milestone_list_cuowuxinxi') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="codeDialog.data.describe"
          />
        </template>

        <!--错误原因/描述-->
        <template v-if="codeDialog.data.dynamicDescribe">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('public_task_reasons_for_error') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="codeDialog.data.dynamicDescribe"
          />
        </template>

        <!--解决方案-->
        <template v-if="codeDialog.data.solution">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('packages_business_solution') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="codeDialog.data.solution"
          />
        </template>

        <!--See Also-->
        <template
          v-if="
            !hideSeeAlso &&
            codeDialog.data.seeAlso &&
            codeDialog.data.seeAlso.length
          "
        >
          <div class="fw-sub mb-3 font-color-dark">See Also</div>
          <ol class="pl-6 mb-6">
            <li
              v-for="(item, index) in codeDialog.data.seeAlso"
              :key="index"
              class="list-decimal"
            >
              <ElLink
                type="primary"
                class="text-decoration-underline"
                @click="handleLink(item)"
                >{{ item }}</ElLink
              >
            </li>
          </ol>
        </template>

        <!--错误堆栈-->
        <template v-if="codeDialog.data.errorStack">
          <div class="mb-3 flex justify-content-between align-items-end">
            <span class="fw-sub font-color-dark">{{
              $t('packages_business_logs_nodelog_cuowuduizhan')
            }}</span>
          </div>
          <div
            class="error-stack-pre-wrap position-relative font-color-light rounded-lg"
          >
            <div class="position-absolute end-0 top-0 px-2 pt-1">
              <el-button
                text
                type="primary"
                class="px-1 py-0.5 font-color-dark"
                @click="handleCopyStack(codeDialog.data.errorStack)"
              >
                <VIcon class="mr-1">copy</VIcon>
                <span class="">{{ $t('public_button_copy') }}</span> </el-button
              ><el-button
                text
                type="primary"
                class="px-1 py-0.5 font-color-dark ml-2"
                @click="
                  codeDialog.expandErrorMessage = !codeDialog.expandErrorMessage
                "
              >
                {{
                  codeDialog.expandErrorMessage
                    ? $t('packages_business_verification_details_shouqi')
                    : $t('public_button_expand')
                }}<i
                  class="el-icon-arrow-down is-rotate ml-1"
                  :class="{ 'is-active': codeDialog.expandErrorMessage }"
                />
              </el-button>
            </div>

            <pre
              class="m-0 p-4 pt-0 mt-6 font-color-dark"
              :class="codeDialog.expandErrorMessage ? '' : 'truncate-two-lines'"
              style="max-height: 400px; font-size: 13px; overflow-x: auto"
              >{{ codeDialog.data.errorStack }}</pre
            >
          </div>
        </template>
      </div>

      <template v-if="!isDaas" #footer>
        <ElButton @click="codeDialog.visible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" @click="handleCreateTicket">{{
          $t('dfs_user_contactus_chuangjiangongdan')
        }}</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.pro-line {
  width: 700px;
}
.node-list {
  width: 224px;
  :deep(.error-icon) {
    display: none;
  }

  :deep(.error-node) {
    .error-icon {
      display: inline-flex;
    }
  }
}
.milestone-mt-1 {
  margin-top: 15px;
}
.step__line {
  left: 50%;
  top: 24px;
  bottom: 4px;
  border-left: 1px dashed var(--color-primary);
  transform: translateX(-50%);
}
.step__line_pt {
  padding-bottom: 23px;
}
.loading-circle {
  animation: rotate 3s linear infinite;
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
