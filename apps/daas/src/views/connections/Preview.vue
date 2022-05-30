<template>
  <Drawer :visible.sync="visible">
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <div class="img-box">
            <img :src="getConnectionIcon()" />
          </div>
        </div>
        <div class="ml-4">
          <div class="fs-6 mb-2 ellipsis">{{ connection.name }}</div>
          <div><status-tag type="text" target="connection" :status="connection.status"></status-tag></div>
        </div>
      </div>
      <div v-if="!hideOperation" class="button-line container-item border-item pt-4 pb-5">
        <div slot="operation" class="flex">
          <el-button type="primary" size="mini" class="flex-1" @click="reload()">
            {{ $t('connection_preview_load_schema') }}
          </el-button>
          <el-button style="min-width: 50px" size="mini" @click="edit()">
            {{ $t('connection_preview_edit') }}
          </el-button>
          <el-button class="flex-1" size="mini" @click="beforeTest()">
            {{ $t('connection_preview_test') }}
          </el-button>
        </div>
        <el-progress
          v-if="showProgress"
          class="details-progress mt-2"
          color="#2c65ff"
          :percentage="progress"
        ></el-progress>
      </div>
      <div v-for="(item, index) in list" :key="index + ''" class="container-item flex">
        <div class="pt-3">
          <VIcon>{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div v-for="(temp, k) in item.items" :key="index + '' + k" class="box-line">
            <div class="box-line__label">{{ temp.label }}:</div>
            <el-tooltip
              v-if="
                connection[temp.key] &&
                !['mqType', 'mqQueueSet', 'mqTopicSet', 'shareCdcEnable', 'redoLogParserEnable'].includes(temp.key) &&
                connection[temp.key].toString()
              "
              effect="dark"
              :content="connection[temp.key].toString()"
              placement="right-end"
            >
              <div class="box-line__value ellipsis">{{ connection[temp.key] || '-' }}</div>
            </el-tooltip>
            <!-- MQ文字转换 start -->
            <div v-else-if="connection[temp.key] && temp.key === 'mqType'" class="box-line__value ellipsis">
              <span>{{ mqType[connection[temp.key]] || '-' }}</span>
            </div>
            <div
              v-else-if="connection[temp.key] && (temp.key === 'mqQueueSet' || temp.key === 'mqTopicSet')"
              class="box-line__value ellipsis"
            >
              <span>{{ connection[temp.key].length > 0 ? connection[temp.key] : '-' }}</span>
            </div>
            <!-- 共享挖掘文字转换 /裸日志文字转换  start -->
            <div
              v-else-if="
                connection[temp.key] &&
                (temp.key === 'shareCdcEnable' ||
                  (temp.key === 'redoLogParserEnable' && ['oracle', 'db2'].includes(connection.database_type)))
              "
              class="box-line__value ellipsis"
            >
              <span>{{ connection[temp.key] ? $t('text_open') : $t('text_close') }}</span>
            </div>
            <!-- MQ文字转换 end -->
            <div v-else class="box-line__value ellipsis">{{ connection[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <ConnectionTest ref="test" @receive="receiveTestData"></ConnectionTest>
  </Drawer>
</template>

<script>
import VIcon from '@/components/VIcon'
import StatusTag from '@/components/StatusTag'
import Drawer from '@/components/Drawer'
import { CONFIG_MODEL, getConnectionIcon } from './util'
import dayjs from 'dayjs'

export default {
  name: 'DetailsDrawer',
  components: { VIcon, StatusTag, Drawer },
  props: {
    hideOperation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      drawer: false,
      visible: false,
      timer: null,
      direction: 'rtl',
      loading: false,
      showProgress: false,
      progress: 0,
      connection: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false
        }
      },
      kafkaACK: {
        0: this.$t('connection_preview_no_sure'),
        '-1': this.$t('connection_preview_master_partition'),
        1: this.$t('connection_preview_master_partition'),
        all: this.$t('connection_preview_isr_partition')
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
  watch: {
    visible(val) {
      if (!val) {
        this.clearInterval() //清除定时器
      }
    }
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
      return require(`web-core/assets/icons/node/${type.toLowerCase()}.svg`)
    },
    open(row) {
      this.visible = true
      this.showProgress = false
      if (row.pdkType === 'pdk') {
        for (let key in row.config) {
          row['database_' + key] = row.config[key]
        }
      }
      this.connection = row
      //组装数据
      this.connection['last_updated'] = dayjs(row.last_updated).format('YYYY-MM-DD HH:mm:ss')
      this.loadList(row.database_type)
    },
    edit() {
      const { connection = {} } = this
      const { id, database_type, pdkType, pdkHash } = connection
      let query = {
        databaseType: database_type
      }
      if (pdkType) {
        query.pdkType = pdkType
        query.pdkHash = pdkHash
      }
      this.$router.push({
        name: 'connectionsEdit',
        params: {
          id,
          databaseType: database_type
        },
        query
      })
    },
    async beforeTest() {
      this.$root.checkAgent(() => {
        //先将管理端状态改为testing
        this.$api('connections')
          .updateById(this.connection.id, {
            status: 'testing'
          })
          .then(() => {
            let testData = JSON.parse(JSON.stringify(this.connection))
            if (['gridfs', 'mongodb'].includes(testData.database_type)) {
              delete testData.database_uri
              testData.justTest = true
            }
            if (testData.database_type !== 'redis') {
              delete testData['database_password']
            }
            this.$refs.test.start(testData)
          })
      })
    },
    async reload() {
      this.$root.checkAgent(() => {
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
            this.testSchema()
            this.$emit('reload-schema')
          }
        })
      })
    },
    //请求测试
    testSchema() {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading'
      }
      this.loadFieldsStatus = 'loading'
      this.$api('connections')
        .updateById(this.connection.id, parms)
        .then(result => {
          let data = result.data
          if (!this?.$refs?.test) {
            return
          }
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          this.$refs.test.start(data, false, true)
          this.getProgress()
        })
    },
    getProgress() {
      this.clearInterval()
      this.$api('connections')
        .getNoSchema(this.connection.id)
        .then(res => {
          let data = res.data
          this.connection = res.data
          //组装数据
          this.connection['last_updated'] = dayjs(data.last_updated).format('YYYY-MM-DD HH:mm:ss')
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
              this.$message.success('schema加载完成')
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            this.timer = setInterval(() => {
              this.getProgress()
            }, 800)
          }
        })
        .catch(() => {
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    },
    receiveTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    loadList(type) {
      let whiteList = ['kafka', 'mq']
      this.list = whiteList.includes(type) ? CONFIG_MODEL[type] : CONFIG_MODEL['default']
    },
    getConnectionIcon() {
      const { connection } = this
      if (!connection) {
        return
      }
      return getConnectionIcon(connection)
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
    border-bottom: 1px solid map-get($borderColor, light);
  }
  &.button-line {
    margin-bottom: -1px;
  }
}
.el-button + .el-button {
  margin-left: 10px;
}
.box-line {
  padding: 8px 0;
  border-top: 1px solid map-get($borderColor, light);
}
.box-line__label {
  color: map-get($fontColor, light);
}
.box-line__value {
  max-width: 200px;
  margin-top: 8px;
  color: map-get($fontColor, dark);
}
.img-box {
  width: 24px;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
<style lang="scss">
.details-container {
  .details-progress {
    .el-progress-bar {
      width: 97%;
    }
  }
}
</style>
