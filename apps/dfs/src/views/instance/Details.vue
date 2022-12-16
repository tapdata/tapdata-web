<template>
  <ElDrawer
    :modal="false"
    :visible.sync="drawer"
    :direction="direction"
    :show-close="false"
    :with-header="false"
    size="304px"
    style="top: 70px"
    @opened="openedFnc"
    @closed="closedFnc"
  >
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <VIcon size="24" class="font-color-sub">computer</VIcon>
        </div>
        <div class="ml-4">
          <div class="fs-6 mb-2 ellipsis"><slot name="title"></slot></div>
          <div><StatusTag type="text" :status="agent.status"></StatusTag></div>
        </div>
      </div>
      <div class="button-line container-item border-item pt-4 pb-5">
        <slot name="operation"></slot>
      </div>
      <div v-for="(item, index) in list" :key="index + ''" class="container-item flex">
        <div class="pt-3">
          <VIcon class="font-color-sub">{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div v-for="(temp, k) in item.items" :key="index + '' + k" class="box-line">
            <div class="box-line__label">{{ temp.label + $t('field_mapping_field_mapping_dialog_') }}</div>
            <div class="box-line__value">{{ agent[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <ElButton
          size="mini"
          type="primary"
          :disabled="agent.status !== 'Running' || (uploadAgentLog && uploadAgentLog.status === 0) || disabledUploadBtn"
          :loading="loadingDetailUpload"
          @click="handleUpload(agent.id, true)"
        >
          <span v-if="uploadAgentLog && uploadAgentLog.uploadRatio !== 100 && uploadAgentLog.status === 0">
            {{ $t('dfs_instance_instance_rizhishangchuan') }}
            <span> ({{ uploadAgentLog.uploadRatio }}）%</span>
          </span>
          <span v-else>
            {{ btnDetailsTxt }}
          </span>
        </ElButton>
        <ElButton size="mini" @click="open(agent.id, agent.status)">{{
          $t('dfs_instance_instance_bendirizhixia')
        }}</ElButton>
      </div>
    </div>
    <!-- 日志上传   -->
    <ElDialog
      :visible.sync="downloadDialog"
      :show-close="false"
      width="1250px"
      custom-class="download-dialog"
      append-to-body
    >
      <div slot="default" class="flex justify-content-between">
        <div>{{ $t('dfs_instance_instance_bendirizhixia') }}</div>
        <div>
          <el-button
            class="mb-4 mr-4"
            type="primary"
            :loading="loadingUpload"
            :disabled="agent.status !== 'Running' || disabledUploadDialog"
            @click="handleUpload(currentAgentId)"
            >{{ btnTxt }}</el-button
          >
          <VIcon @click="handleClose">close</VIcon>
        </div>
      </div>

      <VTable
        :data="downloadList"
        :columns="downloadListCol"
        v-loading="loadingLogTable"
        ref="tableName"
        :has-pagination="false"
      >
        <template slot="status" slot-scope="scope">
          <span class="status-block" :class="['status-' + scope.row.status]"
            >{{ statusMaps[scope.row.status].text }}
            <span v-if="scope.row.uploadRatio && scope.row.uploadRatio !== 100">（{{ scope.row.uploadRatio }}%） </span>
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
  </ElDrawer>
</template>

<script>
import { VIcon, VTable } from '@tap/component'
import { StatusTag } from '@tap/business'
import timeFunction from '@/mixins/timeFunction'
import { AGENT_STATUS_MAP_EN } from '../../const'
import i18n from '@/i18n'
import { handleUnit } from '@/util'

export default {
  name: 'Details',
  components: { VIcon, StatusTag, VTable },
  mixins: [timeFunction],
  props: {
    value: Boolean,
    detailId: [String, Number]
  },
  data() {
    const $t = this.$t.bind(this)
    return {
      drawer: false,
      direction: 'rtl',
      loading: false,
      agent: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false
        }
      },
      list: [
        {
          icon: 'sync-task',
          items: [
            {
              label: $t('agent_detail_synchronization_task_number'),
              key: 'runningTaskNum'
            }
          ]
        },
        {
          icon: 'list',
          items: [
            {
              label: $t('agent_id'),
              key: 'id'
            },
            {
              label: $t('agent_version'),
              key: 'version'
            },
            {
              label: $t('agent_key') + $t('agent_create_time'),
              key: 'createAt'
            }
          ]
        },
        {
          icon: 'host',
          items: [
            {
              label: $t('agent_detail_host_name'),
              key: 'hostname'
            },
            {
              label: $t('agent_detail_host_ip'),
              key: 'ips'
            },
            {
              label: $t('agent_detail_host_cpu_number'),
              key: 'cpus'
            },
            {
              label: $t('agent_detail_host_cpu_memory'),
              key: 'totalmem'
            }
          ]
        },
        {
          icon: 'install',
          items: [
            {
              label: $t('agent_detail_installation_manual'),
              key: 'installationDirectory'
            },
            {
              label: $t('agent_detail_run_manual'),
              key: 'logDir'
            }
          ]
        }
      ],
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
      uploadTimer: null,
      loadingLogTable: false,
      loadingUpload: false,
      loadingDetailUpload: false,
      btnTxt: i18n.t('dfs_instance_instance_rizhishangchuan'),
      btnDetailsTxt: i18n.t('dfs_instance_instance_rizhishangchuan'),
      disabledUploadBtn: false, //控制agent 上传频率 同时只能一个在上传
      disabledUploadDialog: false, //控制agent 上传频率 同时只能一个在上传 在弹窗
      uploadAgentLog: ''
    }
  },
  watch: {
    value(v) {
      this.drawer = v
      if (v) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      this.loading = true
      this.$axios
        .get('api/tcm/agent/' + this.detailId)
        .then(data => {
          if (data) {
            // 是否显示版本号：待部署不显示
            if (!this.showVersionFlag(data) && data.spec) {
              data.spec.version = ''
            }
            Object.assign(data, data?.metric || {}, data?.spec || {}, data?.tmInfo || {})
            data.hostname = data?.tmInfo?.hostname
            data.createAt = this.formatTime(data.createAt)
            if (data?.metric?.systemInfo) {
              let arr = ['cpus', 'installationDirectory', 'ips', 'logDir']
              arr.forEach(el => {
                data[el] = data.metric?.systemInfo?.[el] || ''
              })
              let num = Number(data.metric.systemInfo.totalmem) || 0
              let size = ''
              if (num < 0.1 * 1024) {
                //小于0.1KB，则转化成B
                size = num.toFixed(2) + 'B'
              } else if (num < 0.1 * 1024 * 1024) {
                //小于0.1MB，则转化成KB
                size = (num / 1024).toFixed(2) + 'KB'
              } else if (num < 0.1 * 1024 * 1024 * 1024) {
                //小于0.1GB，则转化成MB
                size = (num / (1024 * 1024)).toFixed(2) + 'MB'
              } else {
                //其他转化成GB
                size = (num / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
              }
              data.totalmem = size
            }
            this.agent = Object.assign(this.agent, data)
            this.$emit('load-data', this.agent)
            this.uploadAgentLog = data?.uploadAgentLog || ''
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    showVersionFlag(row) {
      let { status, tmInfo } = row
      return !(status === 'Creating' && !tmInfo?.pingTime)
    },
    openedFnc() {
      this.$emit('input', this.drawer).$emit('opened')
    },
    closedFnc() {
      this.$emit('input', this.drawer).$emit('closed')
      clearTimeout(this.timer)
      clearTimeout(this.uploadTimer)
      this.uploadTimer = null
      this.timer = null
    },
    //日志上传
    handleUpload(id, polling) {
      if (polling) {
        this.btnDetailsTxt = i18n.t('dfs_instance_details_shangchuanzhong')
        this.loadingDetailUpload = true
      } else {
        this.loadingUpload = true
        this.btnTxt = i18n.t('dfs_instance_details_shangchuanzhong')
      }
      this.$axios
        .post('api/tcm/uploadLog', { agentId: id })
        .then(() => {
          if (polling) {
            this.loadingDetailUpload = false
            clearTimeout(this.uploadTimer)
            this.getUploadStatus()
          } else {
            this.btnTxt = i18n.t('dfs_instance_instance_rizhishangchuan')
            this.loadingUpload = false
            //主動刷新列表
            clearTimeout(this.timer)
            this.getDownloadList()
          }
        })
        .catch(() => {
          if (polling) {
            clearTimeout(this.uploadTimer)
            this.getUploadStatus()
          }
        })
        .finally(() => {
          this.loadingUpload = false
          this.loadingDetailUpload = false
        })
    },
    //轮询当前上传进度
    getUploadStatus() {
      this.$axios.get('api/tcm/agent/' + this.detailId).then(data => {
        if (data) {
          this.uploadAgentLog = data?.uploadAgentLog
          this.disabledUploadBtn = data?.uploadAgentLog?.status === 0 || false
          this.loadingDetailUpload = false
          this.btnDetailsTxt = i18n.t('dfs_instance_instance_rizhishangchuan')
        }
        if (data?.uploadAgentLog?.status === 0) {
          this.uploadTimer = setTimeout(() => {
            this.getUploadStatus()
          }, 300)
        }
      })
    },
    handleUnit(limit) {
      return handleUnit(limit)
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
          this.downloadTotal = res?.total || 0
          //当前列表中是否有上传中的
          let uploading = this.downloadList?.length > 0 ? this.downloadList.filter(it => it.status === 0) : []
          this.disabledUploadDialog = uploading?.length > 0
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
        //主動刷新列表
        clearTimeout(this.timer)
        this.getDownloadList()
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
.details-container {
  padding: 16px 12px 16px 20px;
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
  margin-left: 16px;
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
::v-deep {
  .download-dialog {
    .el-dialog__body {
      padding: 0 20px 40px 20px;
      height: 470px;
    }
    .el-pager li.active {
      color: map-get($color, primary);
    }
  }
}
</style>
