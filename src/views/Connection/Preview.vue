<template>
  <el-drawer
    :modal="false"
    :visible.sync="visible"
    :direction="direction"
    :show-close="false"
    :with-header="false"
    size="304px"
    style="top: 70px"
    @closed="handleClose"
  >
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <div class="img-box">
            <img :src="getImgByType(connection.database_type)" />
          </div>
        </div>
        <div class="ml-4">
          <div class="fs-6 mb-2 ellipsis">{{ connection.name }}</div>
          <div><status-tag type="text" target="connection" :status="connection.status"></status-tag></div>
        </div>
      </div>
      <div class="button-line container-item border-item pt-4 pb-5">
        <div slot="operation" class="flex">
          <el-button type="primary" class="flex-fill" @click="reload()"> 加载Schema </el-button>
          <el-button class="flex-fill" :disabled="connection.agentType === 'Cloud'" @click="edit()"> 编辑 </el-button>
          <el-button class="flex-fill" @click="beforeTest()"> 连接测试 </el-button>
        </div>
      </div>
      <div v-for="(item, index) in list" :key="index + ''" class="container-item flex">
        <div class="pt-3">
          <VIcon>{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div v-for="(temp, k) in item.items" :key="index + '' + k" class="box-line">
            <div class="box-line__label">{{ temp.label + '：' }}</div>

            <el-tooltip
              v-if="connection[temp.key] && temp.key !== 'mqType'"
              effect="dark"
              :content="connection[temp.key]"
              placement="right-end"
            >
              <div class="box-line__value ellipsis">{{ connection[temp.key] || '-' }}</div>
            </el-tooltip>
            <!-- MQ文字转换 start -->
            <div v-else-if="connection[temp.key] && temp.key === 'mqType'" class="box-line__value ellipsis">
              {{ mqType[connection[temp.key]] || '-' }}
            </div>
            <!-- MQ文字转换 end -->
            <div v-else class="box-line__value ellipsis">{{ connection[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <ConnectionTest ref="test" @receive="receiveTestData"></ConnectionTest>
  </el-drawer>
</template>

<script>
import VIcon from '@/components/VIcon'
import StatusTag from '@/components/StatusTag'
import { CONFIG_MODEL } from './const'

export default {
  name: 'DetailsDrawer',
  components: { VIcon, StatusTag },
  data() {
    return {
      drawer: false,
      visible: false,
      timer: null,
      direction: 'rtl',
      loading: false,
      connection: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false
        }
      },
      kafkaACK: {
        0: '不确认',
        '-1': '仅写入master分区',
        1: '仅写入master分区',
        all: '写入所有ISR分区'
      },
      list: [],
      mqType: {
        0: 'ActiveMQ',
        1: 'RabbitMQ',
        2: 'RocketMQ'
      }
    }
  },
  beforeDestroy() {
    this.clearInterval()
  },
  methods: {
    clearInterval() {
      // 清除定时器
      clearInterval(this.timer)
      this.timer = null
    },
    handleClose() {
      this.clearInterval()
      this.visible = false
      this.showProgress = false
      this.$emit('close')
    },
    getImgByType(type) {
      if (!type) {
        type = 'default'
      }
      return require(`web-core/assets/images/connection-type/${type.toLowerCase()}.png`)
    },
    open(id, type) {
      this.loadData(id, type)
      this.visible = true
      this.showProgress = false
    },
    async loadData(id, type) {
      this.loading = true
      let data = null
      data = await this.$axios.get('tm/api/Connections/' + id)
      this.loading = false
      data['database_password'] = data.agentType === 'Cloud' ? data['database_username'] : '-'
      this.connection = data
      //组装数据
      this.connection['last_updated'] = this.$moment(data.last_updated).format('YYYY-MM-DD HH:mm:ss')
      this.loadList(type)
    },
    edit() {
      if (this.connection.agentType === 'Cloud') {
        return
      }
      this.$router.push({
        name: 'ConnectionEdit',
        params: {
          id: this.connection.id
        },
        query: {
          databaseType: this.connection.database_type
        }
      })
    },
    async beforeTest() {
      this.$checkAgentStatus(() => {
        this.$axios
          .patch('tm/api/Connections/' + this.connection.id, {
            status: 'testing'
          })
          .then(data => {
            this.$refs.test.start(this.connection)
            this.responseHandler(data, '操作成功')
          })
      })
    },
    async reload() {
      this.$checkAgentStatus(() => {
        let config = {
          title: this.$t('connection.reloadTittle'),
          Message: this.$t('connection.reloadMsg'),
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
          name: this.connection.name,
          id: this.connection.id
        }
        this.$confirm(config.Message + config.name + '?', config.title, {
          confirmButtonText: config.confirmButtonText,
          cancelButtonText: config.cancelButtonText,
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (resFlag) {
            this.showProgress = true
            this.progress = 0
            this.reloadApi('first')
            this.$emit('reload-schema')
          }
        })
      })
    },
    reloadApi(type) {
      this.reloadLoading = true
      this.clearInterval()
      let parms
      if (type === 'first') {
        parms = {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        }
        this.loadFieldsStatus = 'loading'
      }
      this.$axios
        .patch('tm/api/Connections/' + this.connection.id, parms)
        .then(data => {
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (type === 'first') {
            this.$refs.test.start(this.connection, false, true)
          }
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
            }, 800)
            this.reloadLoading = false
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            this.timer = setInterval(() => {
              this.reloadApi()
            }, 800)
          }
        })
        .catch(() => {
          this.$message.error(this.$t('connection.reloadFail'))
          this.showProgress = false
          this.progress = 0 //加载完成
          this.reloadLoading = false
        })
    },
    receiveTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    loadList(type) {
      let whiteList = ['kafka', 'mq']
      this.list = whiteList.includes(type) ? CONFIG_MODEL[type] : CONFIG_MODEL['default']
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
}
.box-line__label {
  color: rgba(0, 0, 0, 0.6);
}
.box-line__value {
  max-width: 200px;
  margin-top: 8px;
  color: #000;
}
.img-box {
  width: 24px;
  height: 24px;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
