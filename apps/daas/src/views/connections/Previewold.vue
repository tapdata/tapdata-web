<template>
  <el-drawer
    class="connection-drawer top-drawer"
    ref="drawer"
    :visible.sync="visible"
    :title="$t('dataForm.title')"
    size="40%"
    :withHeader="false"
    :before-close="handleClose"
  >
    <div class="connection-drawer-wrap" v-loading="previewLoading">
      <div class="bar">
        <button type="button" class="el-button back-btn-icon-box el-button--default" @click="handleClose">
          <span>
            <VIcon class="back-btn-icon">arrow-right-circle</VIcon>
          </span>
        </button>
        <span class="back-btn-text">{{ $t('connection.info') }}</span>
      </div>
      <header class="header">
        <div class="tab">
          <div class="img-box" v-if="type">
            <img :src="$util.getConnectionTypeDialogImg(type)" />
          </div>
          <div class="img-box" v-else></div>
          <div class="content">
            <div>{{ name }}</div>
            <div class="status">
              <span class="error" v-if="['invalid'].includes(status)">
                <VIcon>error</VIcon>
                <span>
                  {{ $t('connection.status.invalid') }}
                </span>
              </span>
              <span class="success" v-if="['ready'].includes(status)">
                <i class="el-icon-success"></i>
                <span>
                  {{ $t('connection.status.ready') }}
                </span>
              </span>
              <span class="warning" v-if="['testing'].includes(status)">
                <i class="el-icon-warning"></i>
                <span>
                  {{ $t('connection.status.testing') }}
                </span>
              </span>
              <span class="schema-load"
                >{{ $t('connection.preview.reloadName') }} :
                {{ data.last_updated ? $moment(data.last_updated).format('YYYY-MM-DD HH:mm:ss') : '' }}</span
              >
            </div>
          </div>
        </div>
        <div class="panelBtn">
          <ul>
            <li class="item">
              <ElButton
                size="mini"
                type="primary"
                v-readonlybtn="'datasource_edition'"
                @click="reload()"
                :disabled="
                  $disabledByPermission('datasource_edition_all_data', userId) || !['ready'].includes(this.status)
                "
              >
                <!-- <i class="iconfont icon-kujitongbucopy"></i> -->
                {{ $t('connection.preview.reloadName') }}
              </ElButton>
            </li>
            <li class="item">
              <ElButton
                size="mini"
                v-readonlybtn="'datasource_edition'"
                :disabled="$disabledByPermission('datasource_edition_all_data', userId)"
                @click="edit(id, type)"
              >
                <!-- <i class="iconfont icon-edit"></i> -->
                {{ $t('connection.preview.edit') }}
              </ElButton>
            </li>

            <li class="item">
              <ElButton
                size="mini"
                v-readonlybtn="'datasource_edition'"
                :disabled="$disabledByPermission('datasource_edition_all_data', userId)"
                @click="beforeTest(id)"
              >
                <!-- <i class="iconfont icon-lianjie1"></i> -->
                {{ $t('connection.preview.test') }}
              </ElButton>
            </li>
          </ul>
        </div>
        <el-progress
          type="line"
          class="test-progress"
          :text-inside="true"
          :stroke-width="26"
          :percentage="progress"
          v-if="showProgress"
        ></el-progress>
      </header>
      <ul class="info-list">
        <li v-for="item in form" :key="item.label" v-show="item.show">
          <span class="label">{{ item.label }}</span>
          <span
            class="value align-items-center align-middle"
            :class="{ 'align-top': item.label && item.label.length > 15 }"
            >{{ item.value }}</span
          >
        </li>
        <!-- <li v-show="data.database_port && !['file', 'mariadb'].includes(data.database_type)">
					<span class="label">{{ $t('dataForm.form.port') }}</span>
					<span class="value align-items-center align-middle"> {{ data.database_port }}</span>
				</li> -->
        <div
          v-for="(item, index) in data.file_sources"
          :key="index"
          v-show="
            data.database_type === 'file' &&
            data.connection_type === 'source' &&
            data.file_sources &&
            data.file_sources[0].path
          "
        >
          <li>
            <span class="label">{{ $t('dataForm.form.file.fileUrl') + (index + 1) }}</span>
            <span class="value align-items-center align-middle"> {{ item.path }}</span>
          </li>
          <li>
            <span class="label">{{ $t('dataForm.form.file.recursive') }}</span>
            <span class="value align-items-center align-middle"> {{ item.recursive }}</span>
          </li>
        </div>
      </ul>
    </div>
    <Test
      ref="test"
      :dialogTestVisible.sync="dialogTestVisible"
      :formData="data"
      @returnTestData="returnTestData"
    ></Test>
  </el-drawer>
</template>

<script>
import { TYPEMAPCONFIG } from './util'
import formConfig from './config'
import Test from './Test'
import VIcon from '@/components/VIcon'

export default {
  name: 'Preview',
  components: { Test, VIcon },
  props: {
    id: {
      required: true,
      value: String
    },
    databaseType: {
      required: true,
      value: String
    },
    visible: {
      required: true,
      value: String
    }
  },
  data() {
    return {
      form: {},
      data: {},
      name: '',
      type: '',
      status: '',
      progress: 0,
      timer: null,
      showProgress: false,
      dialogTestVisible: false,
      previewLoading: false,
      userId: '',
      kafkaACK: [
        { label: this.$t('dataForm.form.kafka.kafkaAcks0'), value: '0' },
        { label: this.$t('dataForm.form.kafka.kafkaAcks1'), value: '1' },
        { label: this.$t('dataForm.form.kafka.kafkaAcks_1'), value: '-1' },
        { label: this.$t('dataForm.form.kafka.kafkaAcksAll'), value: 'all' }
      ],
      sourceType: {
        rds: 'RDS实例',
        ecs: 'ECS自建库',
        selfDB: '云外自建库',
        dds: 'DDS实例'
      }
    }
  },
  watch: {
    visible: {
      handler() {
        if (this.visible) {
          this.getData(this.id, this.databaseType)
        }
        this.showProgress = false
      }
    }
  },
  beforeDestroy() {
    this.clearInterval()
  },
  destroyed() {
    this.form = {}
    this.clearInterval()
  },
  methods: {
    returnTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    clearInterval() {
      // 清除定时器
      clearInterval(this.timer)
      this.timer = null
    },
    async getData(id, type) {
      this.previewLoading = true
      this.data = {}
      this.name = ''
      this.type = ''
      this.status = ''
      this.userId = ''
      let result = null
      if (['mongodb', 'gridfs'].includes(type)) {
        result = await this.$api('connections').customQuery([id])
      } else {
        // 仅仅是为了排除schema字段，schema.tables 如果表上万数据请求很慢
        // get里的filter.fields无效，所以这里用的是findOne
        result = await this.$api('connections').findOne({
          filter: JSON.stringify({
            where: {
              id
            },
            noSchema: 1
          })
        })
      }
      this.previewLoading = false
      if (result && result.data) {
        let data = result.data
        this.data = result.data
        this.name = data.name
        this.type = data.search_databaseType ? data.search_databaseType : data.database_type
        this.status = data.status
        this.userId = data.user_id || data.userId
        this.loadFieldsStatus = data.loadFieldsStatus
        if (['ready'].includes(this.status) && data.loadFieldsStatus !== 'finished' && data.tableCount) {
          this.progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
          this.showProgress = true
          this.reloadApi()
        }
        let type = this.type
        type = TYPEMAPCONFIG[type] || type //特殊数据源名称转换

        let func = formConfig[type]
        if (func) {
          let config = func(this)
          let items = config.items.map(it => {
            let node = {
              label: it.label,
              value: data[it.field] || '-',
              field: it.field,
              show: true
            }
            if (node.field === 'database_datetype_without_timezone') {
              if (node.value === '-') {
                node.value = 'Database Timezone'
              } else {
                let timezoneNumber = Number(node.value?.split(':')?.[0])
                if (timezoneNumber < 0) {
                  node.value = 'UTC ' + timezoneNumber
                } else {
                  node.value = 'UTC +' + timezoneNumber
                }
              }
            }
            return node
          })
          items = items || []
          items = items.filter(item => item.label) //清掉undefined

          // kafka显示
          if (data.database_type === 'kafka') {
            items.forEach(el => {
              if (el.field === 'kafkaAcks') {
                this.kafkaACK.forEach(elChild => {
                  if (elChild.value === el.value) {
                    el.value = elChild.label
                  }
                })
              }

              if (['krb5Keytab', 'krb5Conf', 'krb5Principal', 'krb5ServiceName'].includes(el.field)) {
                items.forEach(ka => {
                  if (ka.field === 'krb5' && ka.value === '-') {
                    el.value = '-'
                  }
                })
              }
            })
          }

          // MQ类型
          if (data.database_type === 'mq') {
            items.forEach(el => {
              if (el.field === 'mqType') {
                switch (el.value) {
                  case '0':
                    el.value = 'ActiveMQ'
                    break
                  case '1':
                    el.value = 'RabbitMQ'
                    break
                  default:
                    el.value = 'RocketMQ'
                }
              }
            })
          }

          // 文件预览显示
          if (data.database_type === 'file') {
            items.forEach(el => {
              if (data.connection_type === 'target') {
                if (data.file_source_protocol === 'localFile') {
                  if (
                    ![
                      'file_source_protocol',
                      'fileDefaultCharset',
                      'connection_type',
                      'vc_mode',
                      'file_upload_chunk_size',
                      'file_upload_mode',
                      'overwriteSetting',
                      'extendSourcePath',
                      'outputPath'
                    ].includes(el.field)
                  ) {
                    el.show = false
                  }
                } else if (data.file_source_protocol === 'ftp') {
                  if (
                    ![
                      'file_source_protocol',
                      'fileDefaultCharset',
                      'connection_type',
                      'vc_mode',
                      'database_host',
                      'database_port',
                      'database_username',
                      'plain_password',
                      'ftp_passive',
                      'connection_timeout_seconds',
                      'data_timeout_seconds',
                      'file_upload_chunk_size',
                      'file_upload_mode',
                      'overwriteSetting',
                      'extendSourcePath',
                      'outputPath'
                    ].includes(el.field)
                  ) {
                    el.show = false
                  }
                } else {
                  if (
                    ![
                      'file_source_protocol',
                      'fileDefaultCharset',
                      'connection_type',
                      'vc_mode',
                      'database_host',
                      'database_port',
                      'database_username',
                      'plain_password',
                      'file_upload_chunk_size',
                      'file_upload_mode',
                      'overwriteSetting',
                      'extendSourcePath',
                      'outputPath'
                    ].includes(el.field)
                  ) {
                    el.show = false
                  }
                }
              } else {
                if (data.file_source_protocol === 'localFile') {
                  if (
                    !['file_source_protocol', 'fileDefaultCharset', 'connection_type', 'vc_mode'].includes(el.field)
                  ) {
                    el.show = false
                  }
                } else if (data.file_source_protocol === 'ftp') {
                  if (
                    ![
                      'file_source_protocol',
                      'fileDefaultCharset',
                      'connection_type',
                      'vc_mode',
                      'database_host',
                      'database_port',
                      'database_username',
                      'plain_password',
                      'ftp_passive',
                      'connection_timeout_seconds',
                      'data_timeout_seconds'
                    ].includes(el.field)
                  ) {
                    el.show = false
                  }
                } else {
                  if (
                    ![
                      'file_source_protocol',
                      'fileDefaultCharset',
                      'connection_type',
                      'vc_mode',
                      'database_host',
                      'database_port',
                      'database_username',
                      'plain_password'
                    ].includes(el.field)
                  ) {
                    el.show = false
                  }
                }
              }
            })
          }
          if (data.database_type === 'kafka') {
            items.forEach(el => {
              if (['krb5KeytabName', 'krb5ConfName'].includes(el.field)) {
                el.show = false
              }
            })
          }
          if (data.database_type === 'redis') {
            items.forEach(el => {
              if (['isCheckValid'].includes(el.field)) {
                el.show = false
              }
            })
          }
          this.form = items
        }
      }
    },
    handleClose() {
      this.form = {}
      this.clearInterval()
      this.$emit('previewVisible', false)
    },
    async beforeTest() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      } else {
        //先将管理端状态改为testing
        this.$api('connections')
          .updateById(this.data.id, {
            status: 'testing'
          })
          .then(() => {
            this.dialogTestVisible = true
            this.$refs.test.start()
          })
      }
    },
    edit(id, type) {
      if (
        [
          'mysql',
          'oracle',
          'mongodb',
          'sqlserver',
          'postgres',
          'elasticsearch',
          'redis',
          'db2',
          'file',
          'kafka',
          'mariadb',
          'mysql pxc',
          // 'jira',
          'dameng',
          'hive',
          'gbase-8s',
          'sybase ase',
          'gaussdb200',
          'dummy db',
          'rest api',
          'custom_connection',
          'gridfs',
          'mq',
          'tcp_udp',
          'hbase',
          'kudu',
          'greenplum',
          'tidb',
          'hana',
          'clickhouse',
          'kundb',
          'adb_postgres',
          'adb_mysql',
          'hazelcast_cloud_cluster'
        ].includes(type)
      ) {
        this.$router.push({
          name: 'connectionsEdit',
          params: {
            id: id
          },
          query: {
            databaseType: type
          }
        })
      } else {
        top.location.href = '/#/connection/' + id
        localStorage.setItem('connectionDatabaseType', type)
      }
    },
    async reload() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      } else {
        let config = {
          title: this.$t('connection.reloadTittle'),
          Message: this.$t('connection.reloadMsg'),
          confirmButtonText: this.$t('message.confirm'),
          cancelButtonText: this.$t('message.cancel'),
          name: this.data.name,
          id: this.data.id
        }
        this.confirm(
          () => {
            this.showProgress = true
            this.progress = 0
            this.reloadApi('first')
          },
          () => {},
          config
        )
      }
    },
    confirm(callback, catchCallback, config) {
      this.$confirm(config.Message + config.name + '?', config.title, {
        confirmButtonText: config.confirmButtonText,
        cancelButtonText: config.cancelButtonText,
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          callback()
        } else {
          catchCallback()
        }
      })
    },
    reloadApi(type) {
      this.clearInterval()
      let parms
      if (type === 'first') {
        parms = {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        }
        this.loadFieldsStatus = 'loading'
      }
      this.$api('connections')
        .updateById(this.data.id, parms)
        .then(result => {
          if (result.data) {
            let data = result.data
            this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
            if (type === 'first') {
              this.$refs.test.start(true)
            }
            if (data.loadFieldsStatus === 'finished') {
              this.progress = 100
              setTimeout(() => {
                this.showProgress = false
                this.progress = 0 //加载完成
              }, 800)
            } else {
              let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
              this.progress = progress ? progress : 0
              this.timer = setInterval(() => {
                this.reloadApi()
              }, 800)
            }
          }
        })
        .catch(() => {
          this.$message.error(this.$t('connection.reloadFail'))
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    },
    //test
    handleTestVisible() {
      this.dialogTestVisible = false
    },
    //检测agent 是否可用
    async checkTestConnectionAvailable() {
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        this.$message.error(this.$t('dataForm.form.agentMsg'))
      }
    }
  }
}
</script>

<style scoped lang="scss">
.connection-drawer {
  .connection-drawer-wrap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
  .header {
    display: flex;
    flex-direction: column;
    margin: 20px 0;
  }
  .test-progress {
    width: 94.5%;
    margin: 0 10px 10px 30px;
  }
  .tab {
    display: flex;
    justify-content: flex-start;
    padding-bottom: 10px;
    padding-top: 10px;
    .img-box {
      display: flex;
      width: 60px;
      height: 60px;
      justify-content: center;
      align-items: center;
      background: #fff;
      //border: 1px solid #dedee4;
      border-radius: 3px;
      margin-left: 30px;
      margin-right: 20px;
      img {
        width: 100%;
      }
    }
    .content {
      margin-left: 10px;
      font-weight: 500;
      margin-top: 4px;
      width: 100%;
    }
    .status {
      font-size: 12px;
      padding-bottom: 2px;
      margin-top: 4px;
      border-top-width: 2px;
      .error {
        color: #f56c6c;
      }
      .success {
        color: #67c23a;
      }
      .warning {
        color: #e6a23c;
      }
    }

    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      padding: 4px 7px;
      background: #f5f5f5;
      i.iconfont {
        font-size: 12px;
      }
    }
  }
  .panelBtn {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    ul {
      width: 100%;
      padding: 10px 0;
      border-top: 1px solid #f2f2f2;
      border-bottom: 1px solid #f2f2f2;
    }
    .item {
      margin-right: 10px;
      float: left;
    }
    .iconfont {
      display: inline-block;
      font-size: 12px;
      transform: rotate(00deg);
    }
  }
  .panelBtn:hover {
    color: #409eff;
  }
  .label {
    color: #999;
    font-size: 12px;
    display: inline-block;
    width: 110px;
    margin-right: 15px;
    text-align: left;
  }
  .value {
    width: 62%;
    color: #666;
    font-size: 12px;
    display: inline-block;
    word-break: break-all;
  }
  .schema-load {
    color: #999;
    display: inline-block;
    margin-left: 20px;
    font-size: 12px;
    font-weight: normal;
  }
  .info-list {
    flex: 1;
    overflow-y: auto;
    max-height: 690px;
    margin: 0 auto;
    padding-left: 56px;
    width: 100%;
    box-sizing: border-box;
    li {
      margin-bottom: 20px;
    }
  }
  .bar {
    display: block;
    width: 100%;
    height: 30px;
    background: #f5f5f5;
    border-bottom: 1px solid #dedee4;
  }
  .back-btn-icon-box {
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    line-height: 1;
    font-weight: normal;
    font-size: 14px;
    color: red;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    outline: 0;
    border: 0;
    border-radius: 0;
    box-sizing: border-box;
    background: #409eff;
    transition: 0.1s;
    -webkit-appearance: none;
    -webkit-box-sizing: border-box;
    -webkit-transition: 0.1s;
  }
  .back-btn-icon-box:hover {
    background: #6dc5e8;
  }
  .back-btn-icon {
    color: #fff;
  }
  .back-btn-text {
    padding-left: 10px;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
.connection-drawer {
  .top-drawer {
    .el-drawer {
      box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
    }
    .el-drawer.rtl {
      top: 48px;
    }
  }
  .no-top-drawer {
    .el-drawer {
      box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
    }
  }
  .test-progress {
    .el-progress-bar__outer {
      border-radius: 0;
    }
    .el-progress-bar__inner {
      border-radius: 0;
    }
    margin-bottom: 10px;
  }
  .el-drawer__body {
    overflow: hidden;
  }
}
</style>
