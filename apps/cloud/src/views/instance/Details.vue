<script>
import { measurementApi, proxyApi } from '@tap/api'
import { VIcon, VTable } from '@tap/component'
import { calcUnit, downloadJson } from '@tap/shared'
import Time from '@tap/shared/src/time'
import StatusTag from '@/components/StatusTag'
import i18n from '@/i18n'
import timeFunction from '@/mixins/timeFunction'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'
import { AGENT_STATUS_MAP_EN } from '../../const'

export default {
  name: 'AgentDetails',
  components: { VIcon, StatusTag, VTable },
  mixins: [timeFunction],
  props: {
    value: Boolean,
    detailId: [String, Number],
  },
  emits: ['load-data', 'update:value', 'opened', 'closed', , 'update:value'],
  data() {
    const $t = this.$t.bind(this)
    return {
      drawer: false,
      loading: false,
      agent: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false,
        },
      },
      list: [
        {
          icon: 'sync-task',
          items: [
            {
              label: $t('agent_detail_synchronization_task_number'),
              key: 'runningTaskNum',
            },
          ],
        },
        {
          icon: 'list',
          items: [
            {
              label: $t('agent_id'),
              key: 'id',
            },
            {
              label: $t('public_version'),
              key: 'version',
            },
            {
              label: $t('public_create_time'),
              key: 'createAt',
            },
          ],
        },
        {
          icon: 'host',
          items: [
            {
              label: $t('agent_detail_host_name'),
              key: 'hostname',
            },
            {
              label: $t('agent_detail_host_ip'),
              key: 'ips',
            },
            {
              label: $t('agent_detail_host_cpu_number'),
              key: 'cpus',
            },
            {
              label: $t('agent_detail_host_cpu_memory'),
              key: 'totalmem',
            },
            {
              label: $t('agent_detail_cpu_utilization'),
              key: 'cpuUsage',
            },
            {
              label: $t('agent_detail_mem_utilization'),
              key: 'memoryRate',
            },
            {
              label: $t('agent_detail_gc_rate'),
              key: 'gcRate',
            },
          ],
        },
        {
          icon: 'install',
          items: [
            {
              label: $t('agent_detail_installation_manual'),
              key: 'installationDirectory',
            },
            {
              label: $t('agent_detail_run_manual'),
              key: 'logDir',
            },
          ],
        },
      ],
      //日志下载
      downloadDialog: false,
      downloadListCol: [
        {
          label: i18n.t('dfs_instance_instance_wenjianming'),
          prop: 'id',
        },
        {
          label: i18n.t('dfs_instance_instance_wenjiandaxiao'),
          slotName: 'fileSize',
        },
        {
          label: i18n.t('dfs_instance_instance_shangchuanshijian'),
          prop: 'createAt',
          dataType: 'time',
        },
        {
          label: i18n.t('dfs_instance_instance_wenjianzhuangtai'),
          slotName: 'status',
        },

        {
          label: i18n.t('dfs_instance_instance_wenjianxiazai'),
          slotName: 'operation',
        },
      ],
      downloadList: [],
      currentAgentId: '',
      currentStatus: '',
      downloadTotal: 0,
      currentPage: 1,
      pageSize: 10,
      statusMaps: AGENT_STATUS_MAP_EN,
      timer: null,
      uploadTimer: null,
      loadingLogTable: false,
      loadingUpload: false,
      btnTxt: i18n.t('dfs_instance_instance_upload_btn'),
      disabledUploadDialog: false, //控制agent 上传频率 同时只能一个在上传 在弹窗
      tapdataAgentStatus: '',
      showUpload: 1,
      uploadAgentLog: '',
      uploadDays: 3,
      days: [
        {
          label: $t('dfs_instance_instance_upload_days', {
            val: 1,
          }),
          value: 1,
        },
        {
          label: $t('dfs_instance_instance_upload_days', {
            val: 3,
          }),
          value: 3,
        },
        {
          label: $t('dfs_instance_instance_upload_days', {
            val: 7,
          }),
          value: 7,
        },
        {
          label: $t('dfs_instance_instance_upload_days', {
            val: 15,
          }),
          value: 15,
        },
      ],
    }
  },
  watch: {
    value(v) {
      this.drawer = v
      if (v) {
        this.init()
      }
    },
  },
  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      this.loading = true
      this.$axios
        .get(`api/tcm/agent/${this.detailId}`)
        .then(async (data) => {
          if (data) {
            const measurement = await this.loadMeasurementData(
              data.tmInfo.agentId,
            )
            // 是否显示版本号：待部署不显示
            if (!this.showVersionFlag(data) && data.spec) {
              data.spec.version = ''
            }
            //低于V3.1.3版本不显示日志上传下载功能
            this.showUpload = this.handleVersion(data.spec.version)
            //检查tapdata agent 状态
            this.tapdataAgentStatus = data?.tapdataAgentStatus
            data = Object.assign(
              {},
              data?.metric || {},
              data?.spec || {},
              data?.tmInfo || {},
              data,
            )
            data.hostname = data?.tmInfo?.hostname
            data.createAt = this.formatTime(data.createAt)
            if (data?.metric?.systemInfo) {
              const arr = ['cpus', 'installationDirectory', 'ips', 'logDir']
              arr.forEach((el) => {
                data[el] = data.metric?.systemInfo?.[el] || ''
              })
              const num = Number(data.metric.systemInfo.totalmem) || 0
              let size = ''
              if (num < 0.1 * 1024) {
                //小于0.1KB，则转化成B
                size = `${num.toFixed(2)}B`
              } else if (num < 0.1 * 1024 * 1024) {
                //小于0.1MB，则转化成KB
                size = `${(num / 1024).toFixed(2)}KB`
              } else if (num < 0.1 * 1024 * 1024 * 1024) {
                //小于0.1GB，则转化成MB
                size = `${(num / (1024 * 1024)).toFixed(2)}MB`
              } else {
                //其他转化成GB
                size = `${(num / (1024 * 1024 * 1024)).toFixed(2)}GB`
              }
              data.totalmem = size
            }
            this.agent = Object.assign(this.agent, data, measurement)
            this.$emit('load-data', this.agent)
            this.uploadAgentLog = data?.uploadAgentLog || ''
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    //下载
    downServeFn(agent) {
      const id = agent?.tmInfo?.agentId
      proxyApi.supervisor(id).then((data) => {
        downloadJson(JSON.stringify(data), 'supervisor')
      })
    },
    //下载
    downConnectorsFn(agent) {
      const id = agent?.tmInfo?.agentId
      proxyApi.connectors(id).then((data) => {
        downloadJson(JSON.stringify(data), 'connectors')
      })
    },

    async loadMeasurementData(engineId) {
      const data = await measurementApi.queryV2({
        startAt: Time.now(),
        endAt: Time.now(),
        samples: {
          data: {
            tags: {
              type: 'engine',
              engineId,
            },
            fields: ['memoryRate', 'cpuUsage', 'gcRate'],
            type: 'instant',
          },
        },
      })
      const defaultVal = '-'
      if (!data?.samples?.data?.[0])
        return {
          cpuUsage: defaultVal,
          memoryRate: defaultVal,
          gcRate: defaultVal,
        }
      const { cpuUsage, gcRate, memoryRate } = data.samples.data[0]
      return {
        cpuUsage:
          typeof cpuUsage === 'number'
            ? `${(cpuUsage * 100).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`
            : defaultVal,
        memoryRate:
          typeof memoryRate === 'number'
            ? `${(memoryRate * 100).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`
            : defaultVal,
        gcRate:
          typeof gcRate === 'number'
            ? `${(gcRate * 100).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`
            : defaultVal,
      }
    },

    showVersionFlag(row) {
      const { status, tmInfo } = row
      return !(status === 'Creating' && !tmInfo?.pingTime)
    },
    openedFnc() {
      $emit($emit(this, 'update:value', this.drawer), 'opened')
    },
    closedFnc() {
      $emit($emit(this, 'update:value', this.drawer), 'closed')
      clearTimeout(this.timer)
      clearTimeout(this.uploadTimer)
      this.uploadTimer = null
      this.timer = null
    },
    //日志上传
    handleUpload(id) {
      this.loadingUpload = true
      this.btnTxt = i18n.t('dfs_instance_details_shangchuanzhong')
      this.$axios
        .post('api/tcm/uploadLog', { agentId: id, uploadDays: this.uploadDays })
        .then(() => {
          //主動刷新列表
          clearTimeout(this.timer)
          this.getDownloadList()
        })
        .finally(() => {
          this.loadingUpload = false
        })
    },
    calcUnit() {
      return calcUnit(...arguments)
    },
    //打开日志列表
    open(id, status) {
      this.downloadDialog = true
      this.loadingLogTable = true
      this.currentAgentId = id
      this.currentStatus = status
      this.getDownloadList()
    },
    handleClose() {
      this.downloadDialog = false
      this.loadingLogTable = false
      clearTimeout(this.timer)
      clearTimeout(this.uploadTimer)
      this.timer = null
      this.uploadTimer = null
    },
    //日志列表
    getDownloadList(page) {
      if (page) {
        this.loadingLogTable = true
      }
      const filter = {
        where: {
          agentId: this.currentAgentId,
          isDeleted: false,
        },
        page: this.currentPage,
        size: this.pageSize,
        sort: ['createAt desc'],
      }
      this.$axios
        .get(
          `api/tcm/queryUploadLog?filter=${encodeURIComponent(
            JSON.stringify(filter),
          )}`,
        )
        .then((res) => {
          this.loadingLogTable = false
          this.downloadList = res?.items || []
          this.downloadTotal = res?.total || 0
          //当前列表中是否有上传中的
          const uploading =
            this.downloadList?.length > 0
              ? this.downloadList.filter((it) => it.status === 0)
              : []
          this.disabledUploadDialog = uploading?.length > 0
          if (!this.disabledUploadDialog) {
            this.loadingUpload = false
            this.btnTxt = i18n.t('dfs_instance_instance_rizhishangchuan')
          }
          this.timer = setTimeout(() => {
            this.getDownloadList()
          }, 10000)
        })
        .finally(() => {
          this.loadingLogTable = false
          this.loadingUpload = false
        })
    },
    //删除
    handleDeleteUploadLog(row) {
      this.$axios
        .post('api/tcm/deleteUploadLog', {
          agentId: this.currentAgentId,
          id: row.id,
        })
        .then(() => {
          this.$message.success(i18n.t('public_message_delete_ok'))
          //主動刷新列表
          clearTimeout(this.timer)
          this.getDownloadList()
        })
    },
    //日志下载
    handleDownload(row) {
      this.$axios.get(`api/tcm/downloadLog?id=${row.id}`).then((data) => {
        const {
          accessKeyId,
          accessKeySecret,
          securityToken,
          region,
          uploadAddr,
          bucket,
        } = data
        //ssl 凭证
        const OSS = require('ali-oss')
        const client = new OSS({
          accessKeyId,
          accessKeySecret,
          region,
          bucket,
          stsToken: securityToken,
        })
        window.location.href = client.signatureUrl(uploadAddr)
      })
    },
    //比较两个版本号
    handleVersion(version) {
      const v1 = '3.1.3'.split('.')
      //去掉V
      let v2 = version.slice(1)
      //将- 替换成 .
      v2 = v2.replace('-', '.')
      v2 = v2.split('.')
      const len = Math.max(v1.length, v2.length)
      // 调整两个版本号位数相同
      while (v1.length < len) {
        v1.push('0')
      }
      while (v2.length < len) {
        v2.push('0')
      }

      // 循环判断每位数的大小
      for (let i = 0; i < len; i++) {
        const num1 = Number.parseInt(v1[i])
        const num2 = Number.parseInt(v2[i])

        if (num1 > num2) {
          return false
        } else if (num1 < num2) {
          return true
        }
      }
      return true
    },
  },
}
</script>

<template>
  <ElDrawer
    v-model="drawer"
    :show-close="false"
    :with-header="false"
    modal-class="bg-transparent"
    size="304px"
    close-on-click-modal
    @opened="openedFnc"
    @closed="closedFnc"
  >
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <VIcon size="24" class="font-color-sub">computer</VIcon>
        </div>
        <div class="ml-4">
          <div class="fs-6 mb-2 ellipsis"><slot name="title" /></div>
          <div>
            <StatusTag text :status="agent.status" default-status="Stopped" />
          </div>
        </div>
      </div>
      <div class="button-line container-item border-item pt-4 pb-5">
        <slot name="operation" />
      </div>
      <div
        v-for="(item, index) in list"
        :key="`${index}`"
        class="container-item flex"
      >
        <div class="pt-3">
          <VIcon class="font-color-sub">{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div
            v-for="(temp, k) in item.items"
            :key="`${index}${k}`"
            class="box-line"
          >
            <div class="box-line__label">
              {{ temp.label + $t('field_mapping_field_mapping_dialog_') }}
            </div>
            <div class="box-line__value">{{ agent[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-3">
        <ElButton
          type="primary"
          :disabled="!showUpload || agent.agentType === 'Cloud'"
          @click="open(agent.id, agent.status)"
          >{{ $t('dfs_instance_instance_rizhishangchuan') }}</ElButton
        >
        <ElButton @click="downServeFn(agent)">{{
          $t('dfs_instance_details_xianchengziyuanxia')
        }}</ElButton>
        <ElButton @click="downConnectorsFn(agent)">{{
          $t('dfs_instance_details_shujuyuanziyuan')
        }}</ElButton>
      </div>
    </div>
    <!-- 日志上传   -->
    <ElDialog
      v-model="downloadDialog"
      :show-close="false"
      width="1250px"
      class="download-dialog"
      append-to-body
    >
      <div class="flex justify-content-between">
        <div>{{ $t('dfs_instance_instance_bendirizhixia') }}</div>
        <div>
          <label class="mr-4">{{
            $t('dfs_instance_instance_upload_days_label')
          }}</label>
          <el-select v-model="uploadDays" class="mr-4">
            <el-option
              v-for="item in days"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button
            class="mb-4 mr-4"
            type="primary"
            :loading="loadingUpload"
            :disabled="
              agent.status !== 'Running' ||
              disabledUploadDialog ||
              tapdataAgentStatus === 'stopped'
            "
            @click="handleUpload(currentAgentId)"
            >{{ btnTxt }}</el-button
          >
          <VIcon @click="handleClose">close</VIcon>
        </div>
      </div>

      <VTable
        ref="tableName"
        v-loading="loadingLogTable"
        :data="downloadList"
        :columns="downloadListCol"
        :has-pagination="false"
      >
        <template #status="scope">
          <span class="status-block" :class="[`status-${scope.row.status}`]"
            >{{ statusMaps[scope.row.status].text }}
            <span v-if="scope.row.uploadRatio && scope.row.uploadRatio !== 100"
              >（{{ scope.row.uploadRatio }}%）
            </span>
          </span>
        </template>
        <template #fileSize="scope">
          <span>{{ calcUnit(scope.row.fileSize, 'b') }}</span>
        </template>
        <template #operation="scope">
          <ElButton
            text
            :disabled="[0, 2, 3].includes(scope.row.status)"
            @click="handleDownload(scope.row)"
            >{{ $t('public_button_download') }}</ElButton
          >
          <ElButton
            text
            :disabled="scope.row.status === 0"
            class="ml-3"
            @click="handleDeleteUploadLog(scope.row)"
            >{{ $t('public_button_delete') }}</ElButton
          >
        </template>
      </VTable>
      <template #footer>
        <span class="dialog-footer">
          <el-pagination
            v-model:current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="downloadTotal"
            @current-change="getDownloadList"
          />
        </span>
      </template>
    </ElDialog>
  </ElDrawer>
</template>

<style lang="scss" scoped>
.details-container {
  overflow-y: auto;
}
.container-item {
  &.border-item {
    border-bottom: 1px solid #f2f2f2;
  }
  &.button-line {
    margin-bottom: -1px;
  }
}
.el-button + .el-button {
  margin-left: 0;
}
.box-line {
  padding: 8px 0;
  border-top: 1px solid #f2f2f2;
  //&:first-child {
  //  border-top: 0;
  //}
}
.box-line__label {
  color: rgba(0, 0, 0, 0.6);
}
.box-line__value {
  margin-top: 8px;
  color: #000;
}
.status-block {
  display: inline-block;
  min-width: 60px;
  padding: 3px 10px;
  text-align: center;
  font-weight: 500;
  border-radius: 4px;
  box-sizing: border-box;
}
.status-1 {
  color: #178061;
  background-color: #c4f3cb;
}
.status-2 {
  color: #d44d4d;
  background-color: #ffecec;
}
.status-3 {
  color: #d44d4d;
  background-color: #ffecec;
}
:deep(.download-dialog) {
  .el-dialog__body {
    padding: 0 20px 40px 20px;
    height: 470px;
  }
  .el-pager li.active {
    color: var(--color-primary);
  }
}
</style>
