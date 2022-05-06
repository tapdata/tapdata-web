<template>
  <section class="clusterManagement-container section-wrap">
    <div class="section-wrap-box">
      <div class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="getDataApi()"> </FilterBar>
      </div>
      <div class="main">
        <!-- <ul class="search-bar">
          <li>
            <el-input
              clearable
              size="mini"
              v-model="sourch"
              :debounce="800"
              :placeholder="$t('cluster.placeholderServer')"
              @input="getDataApi"
            >
            </el-input>
          </li>
          <li>
            <el-button type="text" class="restBtn" size="mini" @click="rest()">
              {{ $t('button.reset') }}
            </el-button>
          </li>
        </ul> -->
        <div class="content" v-if="waterfallData.length">
          <el-row :gutter="20" class="waterfall">
            <el-col class="list" :md="12" :sm="24" v-for="(element, i) in waterfallData" :key="i">
              <div
                :class="['grid-content', 'list-box', { 'mt-4': index > 0 }]"
                v-for="(item, index) in element"
                :key="item.ip"
              >
                <div class="list-box-header">
                  <div class="list-box-header-left">
                    <img class="mr-4" src="../../assets/images/serve.svg" />
                    <i class="circular mr-2 mt-2" :class="item.status !== 'running' ? 'bgred' : 'bggreen'"></i>
                    <div class="list-box-header-main">
                      <h2 class="name fs-7">
                        {{ item.agentName ? item.agentName : item.systemInfo.hostname }}
                      </h2>
                      <div class="uuid fs-8 my-1">{{ item.systemInfo.uuid }}</div>
                      <span class="ip">{{ item.custIP ? item.custIP : item.systemInfo.ip }}</span>
                    </div>
                  </div>
                  <div class="operation-bar" v-readonlybtn="'Cluster_operation'">
                    <ElButton
                      size="mini"
                      type="danger"
                      v-if="item.canUpdate"
                      @click="updateFn(item, item.management.status, 'management', 'update')"
                      >{{ $t(' cluster_update') }}
                    </ElButton>
                    <VIcon class="mr-2 link-primary" v-readonlybtn="'Cluster_operation'" @click="addServeFn(item)"
                      >bg-add</VIcon
                    >
                    <VIcon class="link-primary" @click="editAgent(item)">cluster-setting</VIcon>
                    <!-- <i
                      class="iconfont icon-icon_tianjia"
                      v-readonlybtn="'Cluster_operation'"
                      @click="addServeFn(item)"
                    ></i> -->
                    <!-- <i class="iconfont icon-icon_shezhi" @click="editAgent(item)"></i> -->
                    <i v-show="item.status !== 'running'" class="iconfont icon-shanchu" @click="delConfirm(item)"></i>
                  </div>
                </div>
                <div class="list-box-main" v-if="item.metricValues">
                  <div class="usageRate">
                    <div class="fs-5 pb-1 fw-bolder">{{ item.metricValues.CpuUsage }}</div>
                    {{ $t('cluster_cpu_usage') }}
                  </div>
                  <div class="line"></div>
                  <div class="usageRate">
                    <div class="fs-5 pb-1 fw-bolder">{{ item.metricValues.HeapMemoryUsage }}</div>
                    {{ $t('cluster_heap_memory_usage') }}
                  </div>
                </div>
                <!-- 监控数据 -->
                <div class="list-box-footer">
                  <el-row :gutter="20" class="list-box-footer-header">
                    <el-col :md="9" :lg="10">
                      <span class="txt fw-sub">{{ $t('cluster_name') }}</span>
                    </el-col>
                    <el-col :span="6">
                      <span class="txt fw-sub">{{ $t('cluster_status') }}</span>
                    </el-col>
                    <el-col :md="9" :lg="7">
                      <div class="btn txt fw-sub">
                        {{ $t('column_operation') }}
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" class="data-list">
                    <el-col :md="9" :lg="10">
                      <span class="txt fw-normal">{{ $t('cluster_manage_sys') }}</span>
                    </el-col>
                    <el-col :span="6">
                      <span :class="[item.management.status, 'status']">{{
                        $t('cluster_' + item.management.status)
                      }}</span>
                    </el-col>
                    <el-col :md="9" :lg="8">
                      <div class="btn" v-readonlybtn="'Cluster_operation'">
                        <ElButton
                          type="text"
                          :disabled="item.management.status == 'stopped' ? false : true"
                          @click="startFn(item, item.management.status, 'management', 'start')"
                          >{{ $t('button_start') }}
                        </ElButton>
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton
                          size="mini"
                          type="text"
                          :disabled="item.management.status == 'running' ? false : true"
                          @click="closeFn(item, item.management.status, 'management', 'stop')"
                          >{{ $t('button_close') }}
                        </ElButton>
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton
                          type="text"
                          :disabled="item.management.status == 'running' ? false : true"
                          @click="restartFn(item, item.management.status, 'management', 'restart')"
                          >{{ $t('button_restart') }}
                        </ElButton>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" class="data-list">
                    <el-col :md="9" :lg="10">
                      <span class="txt fw-normal">{{ $t('cluster_sync_gover') }}</span>
                    </el-col>
                    <el-col :span="6">
                      <span :class="[item.engine.status, 'status']">{{ $t('cluster_' + item.engine.status) }}</span>
                    </el-col>
                    <el-col :md="9" :lg="8">
                      <div class="btn" v-readonlybtn="'Cluster_operation'">
                        <ElButton
                          size="mini"
                          type="text"
                          :disabled="item.engine.status == 'stopped' ? false : true"
                          @click="startFn(item, item.engine.status, 'engine')"
                          >{{ $t('button_start') }}</ElButton
                        >
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton
                          size="mini"
                          type="text"
                          :disabled="item.engine.status == 'running' ? false : true"
                          @click="closeFn(item, item.engine.status, 'engine')"
                          >{{ $t('button_close') }}</ElButton
                        >
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton
                          type="text"
                          :disabled="item.engine.status == 'running' ? false : true"
                          @click="restartFn(item, item.engine.status, 'engine')"
                          >{{ $t('button_restart') }}</ElButton
                        >
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" class="data-list">
                    <el-col :md="9" :lg="10">
                      <span class="txt fw-normal">API server</span>
                    </el-col>
                    <el-col :span="6">
                      <span :class="[item.apiServer.status, 'status']">{{
                        $t('cluster_' + item.apiServer.status)
                      }}</span>
                    </el-col>
                    <el-col :md="9" :lg="8">
                      <div class="btn" v-readonlybtn="'Cluster_operation'">
                        <ElButton
                          size="mini"
                          type="text"
                          :disabled="item.apiServer.status == 'stopped' ? false : true"
                          @click="startFn(item, item.apiServer.status, 'apiServer')"
                          >{{ $t('button_start') }}</ElButton
                        >
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton
                          size="mini"
                          type="text"
                          :disabled="item.apiServer.status == 'running' ? false : true"
                          @click="closeFn(item, item.apiServer.status, 'apiServer')"
                          >{{ $t('button_close') }}</ElButton
                        >
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton
                          type="text"
                          :disabled="item.apiServer.status == 'running' ? false : true"
                          @click="restartFn(item, item.apiServer.status, 'apiServer')"
                          >{{ $t('button_restart') }}</ElButton
                        >
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" class="data-list" v-for="child in item.customMonitorStatus" :key="child.id">
                    <el-col :md="9" :lg="10" :offset="1">
                      <span class="txt">{{ child.name }}</span>
                    </el-col>
                    <el-col :span="6">
                      <span :class="child.status">{{ child.status }}</span>
                    </el-col>
                    <el-col :md="9" :lg="8" :offset="5" v-readonlybtn="'Cluster_operation'">
                      <div class="btn">
                        <ElButton type="text" @click="delServe(child, item.status)">{{ $t('button_delete') }}</ElButton>
                        <ElDivider direction="vertical"></ElDivider>
                        <ElButton type="text" @click="editServe(child, item.status, item)">{{
                          $t('button_edit')
                        }}</ElButton>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-else class="no-text">
          <i class="iconfont icon iconkongyemian_zanwuwendang" style="font-size: 174px"></i>
        </div>
      </div>
    </div>

    <el-dialog
      :title="$t('cluster_add_server_mon')"
      custom-class="serverDialog"
      :visible.sync="dialogForm"
      :append-to-body="true"
      :lock-scroll="false"
      :close-on-click-modal="false"
      width="600px"
      @close="closeDialogForm()"
    >
      <AddServe :data="currentData" :editItem="editItem" ref="childRules"></AddServe>
      <div slot="footer" class="dialog-footer">
        <ElButton size="small" @click="closeDialogForm()">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="small" type="primary" @click="submitForm('ruleForm')">{{ $t('button_confirm') }}</ElButton>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('cluster.agentSetting')"
      custom-class="serverDialog"
      :visible.sync="editAgentDialog"
      :lock-scroll="false"
      :close-on-click-modal="false"
      width="600px"
      @close="editAgentDialog = false"
    >
      <el-form ref="editAgentForm" label-width="100px" class="edit-agent-form">
        <el-form-item :label="$t('cluster_server_name')">
          <div class="name-box">
            <el-input
              style="width: 85%"
              v-model="agentName"
              size="mini"
              show-word-limit
              :placeholder="$t('cluster_placeholder_mon_server')"
            ></el-input>
            <ElButton type="text" class="rest-btn" @click="editNameRest">{{ $t('button_reduction') }}</ElButton>
          </div>
        </el-form-item>
        <el-form-item :label="$t('cluster_ip_display')" prop="command">
          <el-select v-model="custIP" :placeholder="$t('cluster_ip_display')" size="mini" style="width: 85%">
            <el-option v-for="item in ips" :key="item" :label="item" :value="item"> </el-option>
          </el-select>
          <div class="ip-tip pt-2">{{ $t('cluster_ip_tip') }}</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <ElButton size="small" @click="editAgentDialog = false">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="small" type="primary" @click="submitEditAgent('editAgentForm')">{{
          $t('button_confirm')
        }}</ElButton>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import FilterBar from '@/components/filter-bar'
import AddServe from './AddServe'
import factory from '../../api/factory'
const cluster = factory('cluster')
// const clusterVersion = factory('clusterVersion');
// const settings = factory('Setting');
// const dataFlows = factory('DataFlows');
export default {
  components: {
    AddServe,
    FilterBar
  },
  data() {
    return {
      waterfallData: [],
      currentData: null,
      dialogForm: false,
      activeIndex: '1',
      serveStatus: '',
      isStop: false,
      engineState: '',
      managementState: '',
      apiServerState: '',
      editItem: {},
      timer: null,
      downLoadAgetntdialog: false,
      editAgentDialog: false,
      deleteDialogVisible: false,
      downLoadNum: 0,
      version: null,
      ips: [],
      custIP: '',
      custId: '',
      agentName: '',
      currentNde: {},
      delData: '',
      processIdData: [],
      searchParams: {
        keyword: ''
      },
      filterItems: [
        {
          placeholder: this.$t('modules_name_placeholder'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  },
  created() {
    this.getDataApi()
  },
  methods: {
    // 获取最大cpu、内存使用率
    getUsageRate(processId) {
      let where = {
        process_id: {
          inq: processId
        }
      }
      this.$api('Workers')
        .get({ filter: JSON.stringify({ where: where }) })
        .then(res => {
          let data = res.data?.items
          if (data?.length) {
            let metricValuesData = []
            data.forEach(item => {
              if (item.metricValues) {
                metricValuesData.push(item)
              }
            })
            this.processIdData = metricValuesData
          }
        })
    },
    // 提交
    async submitForm() {
      let getFrom = this.$refs.childRules.ruleForm
      let status = this.$refs.childRules.data.status
      let flag = this.$refs['childRules'].validateForm()
      if (status === 'running') {
        if (flag) {
          let data = {
            uuid: this.currentData.uuid,
            name: getFrom.name,
            command: getFrom.command,
            arguments: getFrom.arguments ? getFrom.arguments : ''
          }
          if (getFrom.id === '') {
            await cluster
              .addMonitor(data)
              .then(() => {
                this.dialogForm = false
                this.getDataApi()
                this.$message.success(this.$t('message_save_ok'))
              })
              .catch(() => {
                this.$message.error(this.$t('message_save_fail'))
              })
              .finally(() => {
                this.dialogForm = false
              })
          } else {
            data.id = getFrom.id
            await cluster
              .editMonitor(data)
              .then(() => {
                this.dialogForm = false
                this.getDataApi()
                this.$message.success(this.$t('message_save_ok'))
              })
              .catch(() => {
                this.$message.error(this.$t('message_save_fail'))
              })
              .finally(() => {
                this.dialogForm = false
              })
          }
        }
      } else {
        this.$message.error(this.$t('cluster_startup_after_add'))
      }
    },
    editServe(item, status, data) {
      this.currentData = data
      this.editItem = item
      this.dialogForm = true
    },
    // 删除
    delServe(data, status) {
      let params = {
        uuid: data.uuid,
        id: data.id
      }

      if (status === 'running') {
        this.$confirm(this.$t('cluster_deleteor_not') + '?', {
          type: 'warning'
        }).then(resFlag => {
          if (!resFlag) {
            return
          }
          cluster
            .removeMonitor(params)
            .then(() => {
              this.getDataApi()
              this.$message.success(this.$t('message_save_ok'))
            })
            .catch(() => {
              this.$message.error(this.$t('message_save_fail'))
            })
        })
      } else {
        this.$message.error(this.$t('cluster_startup_after_delete'))
      }
    },
    addServeFn(item) {
      this.currentData = item
      this.editItem = {}
      this.dialogForm = true
    },
    // 启动
    startFn(item, status, server) {
      if (status === 'stopped') {
        let data = {
          uuid: item.uuid,
          server: server,
          operation: 'start'
        }
        this.$confirm(this.$t('cluster_confirm_text') + name + this.$t('cluster_restart_server') + '?', {
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (!resFlag) {
            return
          }
          this.operationFn(data)
        })
      }
    },
    // 关闭
    closeFn(item, status, server) {
      let name
      if (server === 'apiServer') {
        name = 'API SEVER'
      } else if (server === 'engine') {
        name = this.$t('cluster_sync_gover')
      } else {
        name = this.$t('cluster_manage_sys')
      }
      if (status === 'running') {
        let data = {
          uuid: item.uuid,
          server: server,
          operation: 'stop'
        }
        this.$confirm(this.$t('cluster_confirm_text') + name + this.$t('cluster_start_server') + '?', {
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (!resFlag) {
            return
          }
          this.operationFn(data)
        })
      }
    },
    restartFn(item, status, server) {
      let name
      if (server === 'apiServer') {
        name = 'API SEVER'
      } else if (server === 'engine') {
        name = this.$t('cluster_sync_gover')
      } else {
        name = this.$t('cluster_manage_sys')
      }
      if (status === 'running') {
        let data = {
          uuid: item.uuid,
          server: server,
          operation: 'restart'
        }
        this.$confirm(this.$t('cluster_confirm_text') + name + this.$t('cluster_restart_server') + '?', {
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (!resFlag) {
            return
          }
          this.operationFn(data)
        })
      }
    },
    updateFn(item) {
      let data = {
        uuid: item.uuid,
        server: 'agent',
        operation: 'update:' + this.toVersion
      }
      this.operationFn(data)
      this.canUpdate = false
    },
    async getVersion(datas) {
      // for (let i = 0; i < datas.length; i++)
      // 	if (datas[i].status != 'down')
      // 		await clusterVersion
      // 			.get({ filter: JSON.stringify({ where: { 'version.uuid': datas[i].uuid } }) })
      // 			.then(res => {
      // 				if (res.data && res.data.length) {
      // 					datas[i].curVersion = res.data[0].version.backend;
      // 				}
      // 			});
      // let where = {},
      // 	allCdc = false;
      // if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS')
      // 	where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
      // where['stats.stagesMetrics.status'] = { neq: 'cdc' };
      // where.status = { eq: 'running' };
      // await dataFlows.count({ where: where }).then(res => {
      // 	if (res.data) {
      // 		if (res.data.count == 0) allCdc = true;
      // 	}
      // });
      for (let i = 0; i < datas.length; i++) datas[i].canUpdate = false //allCdc && datas[i].curVersion == this.toVersion && datas[i].status != 'down';
      let [...waterfallData] = datas
      let [...newWaterfallData] = [[], []]
      waterfallData.forEach((item, index) => {
        this.processIdData.forEach(processId => {
          if (item.systemInfo.process_id === processId.process_id) {
            processId.metricValues.CpuUsage = (processId.metricValues.CpuUsage * 100).toFixed(2) + '%'
            processId.metricValues.HeapMemoryUsage = (processId.metricValues.HeapMemoryUsage * 100).toFixed(2) + '%'
            this.$set(item, 'metricValues', processId.metricValues)
          }
        })
        if (index % 2) {
          newWaterfallData[1].push(item)
        } else {
          newWaterfallData[0].push(item)
        }
      })
      this.waterfallData = newWaterfallData
    },
    // 重启---关闭---启动     --版本--更新
    async operationFn(data) {
      await cluster.updateStatus(data).then(res => {
        if (res.status === 200) {
          this.getDataApi()
        }
      })
    },

    // 获取数据
    async getDataApi() {
      let params = { index: 1 }
      if (this.searchParams.keyword) {
        params['filter'] = {
          where: {
            or: [
              {
                agentName: {
                  $exists: false
                },
                'systemInfo.hostname': {
                  like: this.searchParams.keyword
                }
              },
              {
                agentName: '',
                'systemInfo.hostname': {
                  like: this.searchParams.keyword
                }
              },
              {
                agentName: {
                  like: this.searchParams.keyword
                }
              }
            ]
          }
        }
      }
      cluster.get(params).then(res => {
        let items = res.data?.items || []
        if (items) {
          let processId = []
          if (items?.length > 0) {
            items.forEach(item => {
              if (item.systemInfo.process_id) {
                processId.push(item.systemInfo.process_id)
              }
            })
          }

          // 获取最大内存、cpu使用率
          this.getUsageRate(processId)
          //自动升级
          this.getVersion(items)
        }
      })
    },
    // 关闭弹窗并且清空验证
    closeDialogForm() {
      this.dialogForm = false
      this.$refs.childRules.closeDialogForm()
    },
    //删除agent
    delConfirm(item) {
      // this.deleteDialogVisible = true
      // this.delData = data
      // this.delData.agentName = this.delData.agentName || this.delData.systemInfo.hostname
      let agentName = item.agentName || item.systemInfo.hostname
      const h = this.$createElement
      let message = h('p', [this.$t('cluster_del_delete_or_not') + ' ' + agentName])
      this.$confirm(message, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$api('modules')
          .delete(item.id, item.name)
          .then(() => {
            this.$message.success(this.$t('message_delete_ok'))
            this.table.fetch()
          })
          .catch(() => {
            this.$message.info(this.$t('message_delete_fail'))
          })
      })
    },
    removeNode(id) {
      this.$api('cluster')
        .delete(id)
        .then(() => {
          this.deleteDialogVisible = false
          this.$message.success(this.$t('message_delete_ok'))
        })
        .catch(() => {
          this.$message.error(this.$t('message_delete_fail'))
        })
    },
    //编辑
    editAgent(item) {
      this.editAgentDialog = true
      this.custId = item.id
      this.custIP = item.systemInfo.ip
      this.ips = item.systemInfo.ips || []
      this.agentName = item.agentName || item.systemInfo.hostname
      this.currentNde = item.systemInfo
    },
    //提交编辑
    submitEditAgent() {
      if (this.agentName === '') {
        this.agentName = this.currentNde.hostname
        this.$message.error(this.$t('cluster_server_name') + this.$t('cluster_none_text'))
        return
      }
      let data = {
        custIP: this.custIP,
        agentName: this.agentName
      }
      this.$api('cluster')
        .editAgent(this.custId, data)
        .then(() => {
          this.editAgentDialog = false
          this.$message.success(this.$t('message_delete_ok'))
        })
        .catch(() => {
          this.$message.error(this.$t('message_delete_fail'))
        })
    },
    editNameRest() {
      this.agentName = this.currentNde.hostname
    },
    //运行日志
    goDailyRecord() {
      this.$router.push({
        name: 'dailyRecord'
      })
    }
  },
  destroyed() {
    clearInterval(this.timer)
    this.timer = null
  }
}
</script>
<style lang="scss" scoped>
.clusterManagement-container {
  .header {
    padding: 15px 20px;
    background: map-get($bgColor, white);
    overflow: hidden;
    border-bottom: 1px solid #dedee4;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    .title {
      font-size: 16px;
      color: map-get($fontColor, dark);
      font-weight: 600;
    }
    .log_btn {
      font-size: 14px;
      color: map-get($color, primary);
      cursor: pointer;
      float: right;
    }
  }
  .main {
    flex: 1;
    display: flex;
    height: 100%;
    padding-top: 10px;
    overflow: hidden;
    flex-direction: column;
    .search-bar {
      display: flex;
      padding-left: 10px;
      li + li {
        margin-left: 10px;
      }
    }
    .content {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      .waterfall {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }
      .list {
        padding: 5px 0 10px 0;
        padding-left: 0;
        overflow: hidden;
        box-sizing: border-box;
        .list-box {
          background-color: map-get($bgColor, white);
          border-radius: 3px;
          border: 1px solid map-get($bgColor, main);
          .list-box-header {
            overflow: hidden;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 12px 16px;
            .list-box-header-left {
              display: flex;
              flex-direction: row;
              img {
                width: 43px;
                height: 43px;
              }
              .circular {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
              }
              .list-box-header-main {
                .name {
                  margin: 0;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  color: map-get($fontColor, dark);
                }
                .uuid {
                  color: map-get($fontColor, slight);
                }
                .ip {
                  display: inline-block;
                  padding: 2px 10px;
                  color: map-get($color, primary);
                  border-radius: 2px;
                  background-color: #ebf3fd;
                }
              }
            }
            .iconfont {
              // color: #999;
              cursor: pointer;
              margin-left: 10px;
            }

            .addBtn {
              span {
                font-size: 12px;
              }
            }
          }

          .list-box-main {
            display: flex;
            justify-content: center;
            padding: 16px 0;
            text-align: center;
            border-top: 1px solid #f2f2f2;
            .usageRate {
              width: 50%;
              text-align: center;
              font-size: 12px;
              font-weight: 400;
              color: map-get($fontColor, slight);
              div {
                color: map-get($fontColor, dark);
              }
            }
            .line {
              width: 1px;
              height: 50px;
              background-color: #f2f2f2;
            }
          }

          .list-box-footer {
            display: flex;
            flex-direction: column;
            padding: 10px 16px;
            justify-content: center;
            .list-box-footer-header {
              width: 100%;
              height: 35px;
              margin: 0 !important;
              line-height: 35px;
              font-size: 12px;
              background-color: #fafafa;
              .txt {
                font-size: 12px;
                color: map-get($fontColor, light);
              }
            }
            .data-list {
              width: 100%;
              margin: 0 !important;
              margin-bottom: 5px;
              line-height: 35px;
              border-bottom: 1px solid #f2f2f2;
              &:last-child {
                border-bottom: 0;
              }
              .txt {
                display: inline-block;
                width: 120px;
                font-size: 12px;
                color: map-get($fontColor, dark);
                text-overflow: ellipsis;
                white-space: nowrap;
                i {
                  padding-right: 5px;
                }
              }
              .status {
                padding: 3px 10px;
                font-weight: 500;
                border-radius: 2px;
              }

              .btn {
                display: inline;
                ::v-deep {
                  .el-button {
                    span {
                      font-weight: 400;
                    }
                  }
                }
              }
              .popover-tip {
                display: inline-block;
                color: #f00;
                transform: rotate(180deg);
                cursor: pointer;
              }
            }
            .running {
              color: #178061;
              background-color: #c4f3cb;
            }
            .stopped {
              color: #d44d4d;
              background-color: #ffecec;
            }
          }
        }

        .info {
          .usageRate {
            padding-left: 12px;
            font-size: 12px;
            color: map-get($fontColor, light);
          }

          .uuid {
            padding: 5px 0;
            font-size: 12px;
            color: map-get($fontColor, light);
          }

          span {
            font-size: 14px;
            color: map-get($fontColor, normal);
          }
        }
      }
      .screen {
        padding-right: 15px;
      }
      .red {
        color: #ee5353;
      }
      .bgred {
        background-color: #ee5353 !important;
      }
      .green {
        color: map-get($color, primary);
      }
      .bggreen {
        background-color: #71c179 !important;
      }
    }
  }
  .no-text {
    display: flex;
    height: calc(100% - 60px);
    align-items: center;
    justify-content: center;
    color: map-get($color, primary);
    font-size: 16px;
    background-color: map-get($bgColor, white);
  }
  .edit-agent-form {
    .rest-btn {
      display: inline-block;
      margin-left: 10px;
      cursor: pointer;
    }
    .ip-tip {
      color: rgba(0, 0, 0, 0.46);
      font-size: 12px;
      line-height: 15px;
    }
  }
}
</style>
<style lang="scss">
.clusterManagement-container {
  .edit-agent-form {
    .el-form-item {
      margin-bottom: 15px;
    }
  }
}
.serverDialog {
  .el-form {
    .el-form-item__label,
    .el-form-item__content {
      line-height: 28px;
      .el-form-item__error {
        padding-top: 1px;
        line-height: 12px;
      }
    }
  }
}
</style>
