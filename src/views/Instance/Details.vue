<template>
  <section class="agent-details-wrap" v-loading="loading">
    <template v-if="agent">
      <div class="panel header">
        <InlineInput class="agent-name" :value="agent.name" @save="updateName($event, $route.params.id)"></InlineInput>
        <div class="agent-status" style="margin-top: 10px">
          <StatusTag :status="agent.status"></StatusTag>
          <span class="lignt" style="margin-left: 5px">同步任务数：</span>
          <span>{{ agent.metric ? agent.metric.runningTaskNum : 0 }}</span>
          <!-- <ElLink class="ml-2" type="primary" @click="toDataflow">查看任务</ElLink> -->
        </div>
      </div>
      <div class="panel mt-5">
        <!-- <div class="title">
          <i class="el-icon-notebook-2"></i>
          <span style="margin-left: 1px">实例信息</span>
        </div> -->
        <ul class="info">
          <li class="info-item">
            <div class="label">Agent ID：</div>
            <div class="value">{{ agent.id }}</div>
          </li>
          <li class="info-item">
            <div class="label">Agent 版本：</div>
            <div class="value">
              {{ agent.spec.version }}
            </div>
          </li>
          <li class="info-item">
            <div class="label">Agent 创建时间：</div>
            <div class="value">{{ agent.createAt }}</div>
          </li>
          <li class="info-item">
            <div class="label">宿主机IP：</div>
            <div class="value">
              {{ agent.ips }}
            </div>
          </li>
          <li class="info-item">
            <div class="label">宿主机CPU数量：</div>
            <div class="value">
              {{ agent.cpus }}
            </div>
          </li>
          <li class="info-item">
            <div class="label">宿主机内存大小：</div>
            <div class="value">
              {{ agent.totalmem }}
            </div>
          </li>
          <li class="info-item">
            <div class="label">安装目录：</div>
            <div class="value">
              {{ agent.installationDirectory }}
            </div>
          </li>
        </ul>
      </div>
      <ChangeInstance :region="agent.region" :zone="agent.zone" :dialogVisible.sync="dialogVisible"></ChangeInstance>
    </template>
  </section>
</template>

<script>
import { SPEC_MAP, CHARGE_MAP } from '../../const'
// import { formatAgent } from '../../util'
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import ChangeInstance from '../../components/ChangeInstance'
export default {
  components: {
    InlineInput,
    StatusTag,
    ChangeInstance
  },
  data() {
    return {
      isInternet: window.__USER_INFO__.isInternet,
      agent: null,
      specMap: SPEC_MAP,
      chargeMap: CHARGE_MAP,
      loading: false,
      dialogVisible: false
    }
  },
  computed: {
    isMonth() {
      return this.agent.orderInfo.periodType === 'month'
    },
    comSpecType() {
      return this.specMap[this.agent?.spec?.specType]
    }
  },
  created() {
    this.fetch()
  },
  methods: {
    fetch() {
      this.loading = true
      this.$axios
        .get('api/tcm/agent/' + this.$route.query.id)
        .then(data => {
          // this.agent = formatAgent(data)
          this.agent = data
          this.agentInfo.createAt = data.createAt ? this.$moment(data.createAt).format('YYYY-MM-DD HH:mm:ss') : ''
          if (this.agent?.metric?.systemInfo) {
            this.agent.cpus = this.agent.metric.systemInfo.cpus || ''
            this.agent.installationDirectory = this.agent.metric.systemInfo.installationDirectory || ''
            this.agent.ips = this.agent.metric.systemInfo.ips || ''

            let num = Number(this.agent.metric.systemInfo.totalmem) || 0
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
            this.agent.totalmem = size
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    updateName(val, id) {
      this.$axios
        .post('api/tcm/agent', {
          id,
          name: val
        })
        .then(() => {
          this.$message.success('修改成功')
          this.fetch()
        })
    },
    toModify() {
      let item = this.agent
      if (item.modifyTips) {
        return this.$alert(item.modifyTips, {
          type: 'warning',
          customClass: 'el-message-box--alert'
        })
      }
      location.href = process.env.VUE_APP_BASE_URL + '/#/modify/' + item.id
    },
    //打开切换版本
    handleOpen() {
      this.dialogVisible = true
    }
    // toDataflow() {
    // 	this.$router.push({
    // 		name: 'Task'
    // 	});
    // }
  }
}
</script>

<style lang="scss" scoped>
.agent-details-wrap {
  height: 100%;
  padding: 10px 20px;
  .panel {
    position: relative;
    background: #fff;
    border-radius: 2px;
    padding: 20px;
    .title {
      font-size: 14px;
    }
    .changeAgent {
      float: right;
      margin-right: 10px;
    }
    .info {
      display: flex;
      flex-wrap: wrap;
      .info-item {
        margin: 30px 0;
        display: flex;
        width: 30%;
        .label {
          width: 100px;
          text-align: right;
          color: map-get($fontColor, slight);
        }
        .value {
          margin-left: 20px;
        }
      }
    }
  }
  .header {
    // border-left: 3px solid map-get($color, primary);
    .lignt {
      color: map-get($fontColor, slight);
    }
    .agent-name {
      display: block;
      font-size: 20px;
      font-weight: 650;
    }
    .agent-status {
      display: flex;
      align-items: center;
    }
  }
  .btn-create,
  .btn-change {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}
</style>
