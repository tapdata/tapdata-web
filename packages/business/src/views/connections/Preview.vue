<template>
  <Drawer :visible.sync="visible">
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <div class="img-box">
            <img :src="getConnectionIcon()" />
          </div>
        </div>
        <div class="ml-4 overflow-hidden">
          <div class="fs-6 mb-2 ellipsis">{{ connection.name }}</div>
          <div><status-tag type="text" target="connection" :status="connection.status"></status-tag></div>
        </div>
      </div>
      <div v-if="!hideOperation" class="button-line container-item border-item pt-4 pb-5">
        <div slot="operation" class="flex">
          <el-button type="primary" size="mini" class="flex-fill min-w-0" @click="reload()">
            {{ $t('packages_business_connection_preview_load_schema') }}
          </el-button>
          <el-button class="flex-fill min-w-0" size="mini" @click="edit()">
            {{ $t('packages_business_connection_preview_edit') }}
          </el-button>
          <el-button class="flex-fill min-w-0" size="mini" @click="$emit('test', connection)">
            {{ $t('packages_business_connection_preview_test') }}
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
        <div class="pt-2">
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
              v-else-if="connection[temp.key] && (temp.key === 'shareCdcEnable' || temp.key === 'redoLogParserEnable')"
              class="box-line__value ellipsis"
            >
              <span>{{
                connection[temp.key] ? $t('packages_business_text_open') : $t('packages_business_text_close')
              }}</span>
            </div>
            <!-- MQ文字转换 end -->
            <div v-else class="box-line__value ellipsis">{{ connection[temp.key] || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <Test ref="test" :formData="connection" @receive="receiveTestData"></Test>
  </Drawer>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { connectionsApi } from '@tap/api'
import { VIcon, Drawer } from '@tap/component'

import { StatusTag } from '../../components'
import Test from '../connections/Test.vue'
import { getConnectionIcon } from './util'

export default {
  name: 'DetailsDrawer',
  components: { VIcon, Drawer, StatusTag, Test },
  inject: ['checkAgent'],
  props: {
    hideOperation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
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
        0: this.$t('packages_business_connection_preview_no_sure'),
        '-1': this.$t('packages_business_connection_preview_master_partition'),
        1: this.$t('packages_business_connection_preview_master_partition'),
        all: this.$t('packages_business_connection_preview_isr_partition')
      },
      list: [],
      mqType: {
        0: 'ActiveMQ',
        1: 'RabbitMQ',
        2: 'RocketMQ'
      },
      configModel: {
        default: [
          {
            icon: 'time',
            items: [
              {
                label: this.$t('packages_business_connection_preview_load_schema'),
                key: 'last_updated'
              }
            ]
          },
          {
            icon: 'database',
            items: [
              {
                label: this.$t('packages_business_connection_form_database_address'),
                key: 'database_host'
              }
            ]
          },
          {
            icon: 'port',
            items: [
              {
                label: this.$t('packages_business_connection_form_port'),
                key: 'database_port'
              }
            ]
          },
          {
            icon: 'name',
            items: [
              {
                label: this.$t('packages_business_connection_form_database_name'),
                key: 'database_name'
              }
            ]
          },
          {
            icon: 'database-user-name',
            items: [
              {
                label: this.$t('packages_business_connection_form_database_username'),
                key: 'database_username'
              }
            ]
          },
          {
            icon: 'connect_schema',
            items: [
              {
                label: this.$t('packages_business_dataForm_form_databaseOwner'),
                key: 'database_owner'
              }
            ]
          },
          {
            icon: 'additional-string',
            items: [
              {
                label: this.$t('packages_business_connection_form_additional_string'),
                key: 'additionalString'
              }
            ]
          },
          {
            icon: 'origin-time',
            items: [
              {
                label: this.$t('packages_business_connection_form_timezone'),
                key: 'database_datetype_without_timezone'
              }
            ]
          }
          // {
          //   icon: 'connect_shared_mining',
          //   items: [
          //     {
          //       label: this.$t('packages_business_connection_form_shared_mining'),
          //       key: 'shareCdcEnable'
          //     }
          //   ]
          // },
          // {
          //   icon: 'connect_journal',
          //   items: [
          //     {
          //       label: this.$t('packages_business_connection_form_oracle_redoLog_parser'),
          //       key: 'redoLogParserEnable'
          //     }
          //   ]
          // }
        ]
      }
    }
  },
  beforeDestroy() {
    this.clearTimer()
  },
  watch: {
    visible(val) {
      if (!val) {
        this.clearTimer() //清除定时器
      }
    }
  },
  methods: {
    clearTimer() {
      // 清除定时器
      clearTimeout(this.timer)
      this.timer = null
    },
    handleClose() {
      this.clearTimer()
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
    transformData(row) {
      row.database_host = row.config.host
      row.database_port = row.config.port
      row.database_name = row.config.database
      row.database_owner = row.config.schema
      row.database_username = row.config.user || row.config.username
      row.additionalString = row.config.extParams || row.config.additionalString
      row.database_datetype_without_timezone = row.config.timezone
      row.sourceFrom = this.getSourceFrom(row)
      if (row.config.uri && row.config.isUri !== false) {
        const regResult =
          /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/gm.exec(
            row.config.uri
          )
        if (regResult && regResult.groups) {
          const hostArr = regResult.groups.host.split(':')
          row.database_host = hostArr[0]
          row.database_port = hostArr[1]
          row.database_name = regResult.groups.database
          row.database_username = regResult.groups.username
          row.additionalString = regResult.groups.query
        }
      }
      return row
    },
    open(row) {
      this.visible = true
      this.showProgress = false
      this.connection = this.transformData(row)
      //组装数据
      this.connection['last_updated'] = dayjs(row.last_updated).format('YYYY-MM-DD HH:mm:ss')
      this.loadList(row.database_type)
    },
    edit() {
      const { connection = {} } = this
      const { id, pdkHash } = connection
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionsEdit',
        params: {
          id
        },
        query
      })
    },
    async beforeTest() {
      this.checkAgent(() => {
        //先将管理端状态改为testing
        connectionsApi
          .updateById(this.connection.id, {
            status: 'testing'
          })
          .then(() => {
            // let testData = JSON.parse(JSON.stringify(this.connection))
            this.$refs.test.start(true)
          })
      })
    },
    async reload(cb) {
      this.checkAgent(() => {
        let config = {
          title: this.$t('packages_business_connection_reloadTittle'),
          Message: this.$t('packages_business_connection_reloadMsg'),
          confirmButtonText: this.$t('packages_business_message_confirm'),
          cancelButtonText: this.$t('packages_business_message_cancel'),
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
            this.testSchema(cb)
            this.$emit('reload-schema')
          }
        })
      })
    },
    //请求测试
    testSchema(cb) {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading'
      }
      this.loadFieldsStatus = 'loading'
      connectionsApi.updateById(this.connection.id, parms).then(data => {
        cb?.()
        if (!this?.$refs?.test) {
          return
        }
        this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
        this.$refs.test.start(true, false, true)
        this.getProgress()
      })
    },
    getProgress() {
      this.clearTimer()
      connectionsApi
        .getNoSchema(this.connection.id)
        .then(data => {
          this.connection = this.transformData(data)
          //组装数据
          this.connection['last_updated'] = dayjs(data.last_updated).format('YYYY-MM-DD HH:mm:ss')
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
              this.$message.success(i18n.t('packages_business_connections_preview_schem'))
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            this.timer = setTimeout(() => {
              this.visible && this.getProgress()
            }, 2000)
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
    loadList() {
      this.list = [
        ...this.configModel['default'],
        ...(this.isDaas
          ? []
          : [
              {
                icon: 'link',
                items: [
                  {
                    label: i18n.t('packages_business_connections_preview_lianjiechajianlai'),
                    key: 'sourceFrom'
                  }
                ]
              }
            ])
      ]
    },
    getConnectionIcon() {
      const { connection } = this
      if (!connection) {
        return
      }
      return getConnectionIcon(connection?.pdkHash)
    },

    sync(list) {
      if (!this.visible) return
      const result = list.find(item => item.id === this.connection.id)
      if (!result) return
      this.connection = this.transformData(result)
    },

    getSourceFrom(row = {}) {
      const { definitionScope, beta = false } = row
      const MAP = {
        publicfalse: i18n.t('packages_business_components_connectiontypeselectorsort_renzhengshujuyuan'),
        publictrue: i18n.t('packages_business_components_connectiontypeselectorsort_betashu'),
        customer: i18n.t('packages_business_components_connectiontypeselectorsort_wodeshujuyuan')
      }
      return MAP[definitionScope + beta] || MAP['customer']
    },

    setConnectionData(row) {
      this.connection = this.transformData(row)
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
