<template>
  <div class="connection-from" v-loading="loadingFrom">
    <div class="connection-from-body">
      <main class="connection-from-main">
        <div v-if="databaseType === 'hazelcast_cloud_cluster'" class="connection-from-title">
          {{ $route.params.id ? $t('connection_form_hazecast_edit') : $t('connection_form_hazecast_create') }}
        </div>
        <div v-else class="connection-from-title">{{ $route.params.id ? '编辑连接' : '创建连接' }}</div>
        <div class="connection-from-label" v-if="$route.params.id">
          <label v-if="databaseType === 'hazelcast_cloud_cluster'" class="haze_label"
            >{{ $t('connection_form_hazecast_data_source') }}:
          </label>
          <label v-else class="label">数据源: </label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="$util.getConnectionTypeImg(databaseType)" />
            </div>
            <span class="ml-2">{{ model.name }}</span>
            <el-button
              v-if="databaseType === 'hazelcast_cloud_cluster'"
              class="ml-2"
              type="text"
              @click="dialogEditNameVisible = true"
            >
              {{ $t('connection_form_hazecast_rename') }}
            </el-button>
            <el-button v-else class="ml-2" type="text" @click="dialogEditNameVisible = true"> 改名 </el-button>
          </div>
        </div>
        <div class="connection-from-label" v-else>
          <label v-if="databaseType === 'hazelcast_cloud_cluster'" class="haze_label"
            >{{ $t('connection_form_hazecast_data_source_type') }} :</label
          >
          <label v-else class="label">数据源类型:</label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="$util.getConnectionTypeImg(databaseType)" />
            </div>
            <span class="ml-2">{{ typeMap[databaseType] }}</span>
            <el-button
              v-if="databaseType === 'hazelcast_cloud_cluster'"
              class="ml-2"
              type="text"
              @click="$root.$emit('select-connection-type')"
            >
              {{ $t('connection_form_hazecast_change') }}
            </el-button>
            <el-button v-else class="ml-2" type="text" @click="$root.$emit('select-connection-type')">
              {{ $t('connection.change') }}
            </el-button>
          </div>
        </div>
        <div class="form-wrap">
          <div class="form">
            <form-builder ref="form" class="form-builder grey" v-model="model" :config="config">
              <div class="url-tip" slot="urlTip" v-if="model.isUrl" v-html="$t('dataForm.form.uriTips.content')"></div>
            </form-builder>
            <el-button v-if="databaseType === 'hazelcast_cloud_cluster'" type="text" size="mini" @click="startTest()">{{
              $t('connection_form_hazecast_connection_test')
            }}</el-button>
            <el-button v-else type="text" size="mini" @click="startTest()">{{
              $t('connection.testConnection')
            }}</el-button>
            <span v-if="databaseType === 'hazelcast_cloud_cluster'">
              <StatusTag type="text" class="ml-4" target="connection_en" :status="status"></StatusTag>
            </span>
            <span v-else>
              <StatusTag type="text" class="ml-4" target="connection" :status="status"></StatusTag>
            </span>
            <footer class="mt-2 pb-4">
              <el-button
                v-if="databaseType === 'hazelcast_cloud_cluster'"
                size="mini"
                class="connection-from-btn"
                @click="goBack()"
                >{{ $t('connection_form_hazecast_cancel') }}</el-button
              >
              <el-button
                v-if="databaseType === 'hazelcast_cloud_cluster'"
                size="mini"
                class="connection-from-btn"
                type="primary"
                :loading="submitBtnLoading"
                @click="submit"
              >
                {{ $t('connection_form_hazecast_save') }}
              </el-button>
              <el-button
                v-if="databaseType !== 'hazelcast_cloud_cluster'"
                size="mini"
                class="connection-from-btn"
                @click="goBack()"
                >{{ $t('dataForm.cancel') }}</el-button
              >
              <el-button
                v-if="databaseType !== 'hazelcast_cloud_cluster'"
                size="mini"
                class="connection-from-btn"
                type="primary"
                :loading="submitBtnLoading"
                @click="submit"
              >
                {{ $t('dataForm.submit') }}
              </el-button>
            </footer>
          </div>
        </div>
      </main>
      <GitBook :database-type="$route.query && $route.query.databaseType" ref="gitBook"></GitBook>
    </div>
    <ConnectionTest ref="test" @receive="receiveTestData"></ConnectionTest>
    <el-dialog
      :title="$t('connection.rename')"
      :close-on-click-modal="false"
      :visible.sync="dialogEditNameVisible"
      width="30%"
    >
      <el-form :model="renameData" :rules="renameRules" ref="renameForm" @submit.native.prevent>
        <el-form-item prop="rename">
          <el-input v-model="renameData.rename" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <span
          v-if="databaseType === 'hazelcast_cloud_cluster'"
          style="color: #ccc; margin-top: 5px; font-size: 12px; display: inline-block"
          >{{ $t('connection_form_hazecast_name_rules') }}</span
        >
        <span v-else style="color: #ccc; margin-top: 5px; font-size: 12px; display: inline-block"
          >中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格</span
        >
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button v-if="databaseType === 'hazelcast_cloud_cluster'" @click="handleCancelRename" size="mini">{{
          $t('connection_form_hazecast_cancel')
        }}</el-button>
        <el-button
          v-if="databaseType === 'hazelcast_cloud_cluster'"
          @click="submitEdit()"
          size="mini"
          type="primary"
          :loading="editBtnLoading"
          >{{ $t('connection_form_hazecast_save') }}</el-button
        >
        <el-button v-if="databaseType !== 'hazelcast_cloud_cluster'" @click="handleCancelRename" size="mini">{{
          $t('dataForm.cancel')
        }}</el-button>
        <el-button
          v-if="databaseType !== 'hazelcast_cloud_cluster'"
          @click="submitEdit()"
          size="mini"
          type="primary"
          :loading="editBtnLoading"
          >{{ $t('message.confirm') }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { DEFAULT_MODEL } from './const'
import formConfig from './config'
import GitBook from './GitBook'
import StatusTag from '../../components/StatusTag'
import { SUPPORT_DB } from '../../const'
let defaultConfig = []
export default {
  components: { GitBook, StatusTag },
  data() {
    let validateRename = (rule, value, callback) => {
      if (!this.renameData.rename || !this.renameData.rename.trim()) {
        callback(new Error(this.$t('dataForm.form.connectionName') + this.$t('formBuilder.noneText')))
      } else if (!/^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-]|[\u4e00-\u9fa5])*$/.test(this.renameData.rename)) {
        if (this.databaseType === 'hazelcast_cloud_cluster') {
          callback(new Error(this.$t('connection_form_hazecast_name_rules')))
        } else callback(new Error('名称规则：中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格'))
      } else {
        callback()
      }
    }
    return {
      rules: [],
      visible: false,
      createStrategyDisabled: false,
      timezones: [],
      dataTypes: [],
      whiteList: SUPPORT_DB,
      model: {},
      config: {
        items: []
      },
      checkItems: null,
      databaseType: '',
      typeMap: this.$const.TYPEMAP,
      timer: null,
      status: '',
      loadingFrom: true,
      dialogEditNameVisible: false,
      submitBtnLoading: false,
      editBtnLoading: false,
      connectionTypeOption: '',
      isUrlOption: '',
      renameData: {
        rename: ''
      },
      kafka: {
        id: '',
        name: '',
        database_type: '',
        connection_type: '',
        kafkaBootstrapServers: '',
        kafkaPatternTopics: '',
        kafkaIgnoreInvalidRecord: false,
        kafkaAcks: '',
        kafkaCompressionType: '',
        kafkaIgnorePushError: false
      },
      width: 200,
      instanceModelZone: '',
      instanceMock: [],
      dataSourceZone: '',
      dataSourceMock: [],
      ecsPageSize: 10,
      ecsPage: 1,
      ecsList: [],
      renameRules: {
        rename: [{ validator: validateRename, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.init()
  },
  watch: {
    $route() {
      this.init()
      this.$refs.gitBook.getHtmlMD(this.$route.query.databaseType)
    },
    // 文件选中类型默认端口号
    'model.file_source_protocol'(val) {
      if (val === 'smb') {
        this.model.database_port = '445'
      } else if (val === 'ftp') {
        this.model.database_port = '21'
      }
    }
  },
  methods: {
    init() {
      this.databaseType = this.$route.query.databaseType || this.$store?.state?.createConnection?.databaseType
      this.model = Object.assign({}, DEFAULT_MODEL['default'])
      let type = this.databaseType
      if (type === 'rest api') {
        this.model = Object.assign({}, DEFAULT_MODEL['restApi'])
      } else if (type === 'gridfs') {
        this.model = Object.assign({}, DEFAULT_MODEL['default'], DEFAULT_MODEL['gridfs'])
      } else if (type === 'tcp_udp') {
        this.model = Object.assign({}, DEFAULT_MODEL['tcp'])
      } else if (DEFAULT_MODEL[type]) {
        this.model = Object.assign({}, DEFAULT_MODEL[type])
      }
      if (!this.model.platformInfo) {
        this.model.platformInfo = { agentType: 'private' }
      } else if (!this.model.platformInfo.agentType) {
        this.model.platformInfo.agentType = 'private'
      }
      this.getDT(this.databaseType)
      this.initTimezones()
      let self = this
      defaultConfig = [
        {
          type: 'input',
          field: 'name',
          label:
            self.databaseType === 'hazelcast_cloud_cluster'
              ? self.$t('connection_form_hazecast_connection_name')
              : '连接名称',
          placeholder:
            self.databaseType === 'hazelcast_cloud_cluster'
              ? self.$t('connection_form_hazecast_connection_name_placeholder')
              : '请输入连接名称',
          required: true,
          maxlength: 100,
          width: '504px',
          showWordLimit: true,
          show: true,
          customClass: 'large-item',
          rules: [
            {
              required: true,
              trigger: 'blur',
              validator: (rule, value, callback) => {
                if (!value || !value.trim()) {
                  if (this.databaseType === 'hazelcast_cloud_cluster') {
                    callback(new Error(this.$t('connection_form_hazecast_no_name')))
                  } else callback(new Error('连接名称不能为空'))
                } else if (!/^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-]|[\u4e00-\u9fa5])*$/.test(value)) {
                  if (this.databaseType === 'hazelcast_cloud_cluster') {
                    callback(new Error(this.$t('connection_form_hazecast_name_rules')))
                  } else {
                    callback(new Error('名称规则：中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格'))
                  }
                } else if (
                  value &&
                  value.trim() &&
                  /^([\u4e00-\u9fa5]|[A-Za-z])([a-zA-Z0-9_\s-]|[\u4e00-\u9fa5])*$/.test(value)
                ) {
                  let filter = {
                    where: {
                      name: this.model.name
                    },
                    fields: {
                      name: 1
                    },
                    limit: 1
                  }
                  if (this.$route.params.id) {
                    filter.where['id'] = { neq: this.$route.params.id || '' }
                  }
                  this.$axios
                    .get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
                    .then(data => {
                      if (data && data.length !== 0) {
                        if (this.databaseType === 'hazelcast_cloud_cluster') {
                          callback(new Error(this.$t('connection_form_hazecast_name_exists')))
                        } else {
                          callback(new Error('名称已存在'))
                        }
                      } else callback()
                    })
                } else {
                  callback()
                }
              }
            }
          ]
        }
      ]
    },
    async initData(data) {
      let editData = null
      let id = this.$route.params.id
      if (id) {
        if (this.model.database_type === 'mongodb') {
          editData = await this.$axios.get(`tm/api/Connections/${id}/customQuery`)
        } else {
          editData = await this.$axios.get(`tm/api/Connections/${id}?noSchema=1`)
        }
        if (
          editData.database_type === 'mq' &&
          (typeof editData.mqQueueSet === 'object' || typeof editData.mqTopicSet === 'object')
        ) {
          let mqQueueSet = editData.mqQueueSet.length ? editData.mqQueueSet.join(',') : ''
          let mqTopicSet = editData.mqTopicSet.length ? editData.mqTopicSet.join(',') : ''
          editData.mqQueueSet = mqQueueSet
          editData.mqTopicSet = mqTopicSet
        }
        this.model = Object.assign(this.model, editData)

        this.renameData.rename = this.model.name
        this.model.isUrl = false
      } else {
        this.model = Object.assign(this.model, data, { name: this.model.name })
        this.model.isUrl = true
      }
    },
    initTimezones() {
      let timezones = [{ label: '(Database Timezone)', value: '' }]
      for (let i = -11; i < 15; i++) {
        let timezone = ''
        if (i >= -9 && i <= 9) {
          timezone = '0' + Math.abs(i)
        } else {
          timezone = Math.abs(i)
        }
        timezone += ':00'
        let UTCName
        if (i < 0) {
          timezone = '-' + timezone
          UTCName = 'UTC ' + i
        } else {
          timezone = '+' + timezone
          UTCName = 'UTC +' + i
        }

        timezones.push({ label: UTCName, value: timezone })
      }
      this.timezones = timezones
    },
    // 获取数据库类型列表
    async getDT(type) {
      let data = await this.$axios.get('tm/api/DatabaseTypes')
      if (data) {
        this.dataTypes = data.map(dt => {
          return { label: dt.name, value: dt.type }
        })
        this.model.database_type = type
        this.getFormConfig()
      }
    },
    // 按照数据库类型获取表单配置规则
    getFormConfig() {
      let type = this.model.database_type
      type =
        {
          'gbase-8s': 'gbase8s',
          'sybase ase': 'sybasease',
          'dummy db': 'dummydb',
          'mysql pxc': 'mysqlpxc',
          'rest api': 'restapi'
        }[type] || type //特殊数据源名称转换
      type = 'dfs_' + type

      let func = formConfig[type]
      if (func) {
        let config = func(this)
        let items = defaultConfig.concat(config.items)
        let item = items.find(it => it.field === 'database_datetype_without_timezone')
        if (item) {
          item.options = this.timezones
        }
        let databaseName = items.find(it => it.field === 'database_name')
        if (databaseName) {
          databaseName.allowSpace = false
        }
        let itemIsUrl = items.find(it => it.field === 'isUrl')
        let sslKey = items.find(it => it.field === 'sslKeyFile')
        let sslCA = items.find(it => it.field === 'sslCAFile')
        let id = this.$route.params.id
        if (this.model.database_type === 'mongodb' && id && itemIsUrl) {
          itemIsUrl.options[0].disabled = true //编辑模式下mongodb不支持URL模式
        }
        // } else if (this.model.database_type === 'mongodb' && !id && itemIsUrl) {
        //   itemIsUrl.options[1].disabled = true
        // }
        ////编辑模式下mongodb 不校验证书
        if (this.model.database_type === 'mongodb' && id && sslKey) {
          sslKey.rules = []
        }
        if (this.model.database_type === 'mongodb' && id && sslCA) {
          sslCA.rules = []
        }
        let plain_password = items.find(it => it.field === 'plain_password')
        if (this.model.database_type === 'hazelcast_cloud_cluster' && id && plain_password) {
          plain_password.required = false
        }
        if (id) {
          //编辑模式下 不展示
          defaultConfig[0].show = false
          defaultConfig[0].required = false
        }
        this.config.form = Object.assign({}, config.form, { size: 'small' })
        this.config.items = items
        this.initData(
          Object.assign(this.model, config.defaultModel, {
            database_type: this.model.database_type
          })
        ) //切换类型会后初始化数据
        this.checkItems = config.checkItems //根据model变化更新表单项显示或隐藏
        this.checkItems && this.checkItems()
      }
      this.loadingFrom = false
    },
    goBack() {
      let tip,
        title = ''
      if (this.databaseType === 'hazelcast_cloud_cluster') {
        tip = this.$route.params.id
          ? this.$t('connection_form_hazecast_confirm_edit')
          : this.$t('connection_form_hazecast_confirm_create')
        title = this.$route.params.id
          ? this.$t('connection_form_hazecast_confirm_edit_content')
          : this.$t('connection_form_hazecast_confirm_create_content')
      } else {
        tip = this.$route.params.id ? '此操作会丢失当前修改编辑内容' : '此操作会丢失当前正在创建的连接'
        title = this.$route.params.id ? '是否放弃修改内容？' : '是否放弃创建该连接？'
      }
      this.$confirm(tip, title, {
        confirmButtonText:
          this.databaseType === 'hazelcast_cloud_cluster' ? this.$t('connection_form_hazecast_give_up') : '放弃',
        cancelButtonText:
          this.databaseType === 'hazelcast_cloud_cluster' ? this.$t('connection_form_hazecast_cancel') : '取消',
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.$router.push({
            name: 'Connection'
          })
        }
      })
    },
    handleName(ops) {
      if (!ops.sourceData || ops.sourceData.length === 0) {
        return
      }
      let data = ops.sourceData.filter(item => item[ops.target] === ops.field)
      if (data.length === 0) return
      return data[0][ops.name]
    },
    submit() {
      this.submitBtnLoading = true
      let flag = true
      this.model.search_databaseType = ''
      let data = Object.assign({}, this.model)
      if (data.database_type === 'mq') {
        if (typeof data.mqQueueSet === 'string' || typeof data.mqTopicSet === 'string') {
          data.mqQueueSet = data.mqQueueSet ? data.mqQueueSet.split(',') : []
          data.mqTopicSet = data.mqTopicSet ? data.mqTopicSet.split(',') : []
        }

        if (data.mqType === '0') {
          delete data.database_host
          delete data.database_port
        } else {
          delete data.brokerURL
        }
      }
      this.$refs.form.validate(valid => {
        if (valid && flag) {
          let params = Object.assign(
            {},
            {
              status: 'testing',
              retry: 0,
              nextRetry: null,
              response_body: {},
              project: '',
              submit: true,
              platformInfo: {
                agentType: 'private'
              }
            },
            data
          )
          params['sslCert'] = this.model.sslKey
          delete params.status //编辑的情况下不传status
          if (!params.id) {
            delete params.id
            params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
          }
          if (params.database_type === 'mongodb') {
            params.fill = params.isUrl ? 'uri' : ''
            //delete params.isUrl
          }
          let promise = null
          if (this.model.id) {
            let id = params._id || params.id
            delete params._id
            delete params.id
            promise = this.$axios.patch(`tm/api/Connections/${id}`, params)
          } else {
            promise = this.$axios.post('tm/api/Connections', params)
          }
          promise
            .then(() => {
              this.$message.success(this.$t('message.saveOK'))
              if (this.$route.query.step) {
                this.$router.push({
                  name: 'Connection',
                  query: {
                    step: this.$route.query.step
                  }
                })
              } else {
                this.$router.push({
                  name: 'Connection'
                })
              }
            })
            .catch(err => {
              if (err && err.response) {
                if (err.response.msg.indexOf('duplication for names') > -1) {
                  this.$message.error(this.$t('dataForm.error.connectionNameExist'))
                } else if (err.response.msg.indexOf('duplicate source') > -1) {
                  this.$message.error(this.$t('dataForm.error.duplicateSource'))
                } else {
                  this.$message.error(err.response.msg)
                }
              } else {
                this.$message.error(this.$t('message.saveFail'))
              }
            })
            .finally(() => {
              this.submitBtnLoading = false
            })
        } else {
          this.submitBtnLoading = false
        }
      })
    },
    //开始测试
    async startTest() {
      this.$checkAgentStatus(() => {
        this.$refs.form.validate(valid => {
          if (valid) {
            let data = Object.assign({}, this.model)
            if (this.$route.params.id) {
              //编辑需要特殊标识 updateSchema = false editTest = true
              this.$refs.test.start(data, true, false, true)
            } else {
              delete data.id
              if (!data.isUrl && data.database_type === 'mongodb') {
                data.database_password = data.plain_password || ''
              }
              this.$refs.test.start(data)
            }
          }
        })
      })
    },
    receiveTestData(data) {
      this.status = data.status || ''
    },
    //取消
    handleCancelRename() {
      this.renameData.rename = this.model.name
      this.$refs['renameForm'].clearValidate()
      this.dialogEditNameVisible = false
    },
    //保存名字
    submitEdit() {
      this.$refs['renameForm'].validate(valid => {
        if (valid) {
          this.editBtnLoading = true
          if (this.renameData.rename === '') {
            this.editBtnLoading = false
            this.renameData.rename = this.model.name
            this.$refs['renameForm'].clearValidate()
            return
          }
          let params = {
            name: this.renameData.rename,
            submit: true
          }
          this.$axios
            .patch(`tm/api/Connections/${this.model.id}`, params)
            .then(() => {
              this.editBtnLoading = false
              this.model.name = this.renameData.rename
              this.$refs['renameForm'].clearValidate()
              this.$message.success(this.$t('message.saveOK'))
              this.dialogEditNameVisible = false
            })
            .catch(err => {
              this.renameData.rename = this.model.name
              this.$refs['renameForm'].clearValidate()
              this.editBtnLoading = false
              if (err && err.response) {
                if (err.response.msg.indexOf('duplication for names') > -1) {
                  this.$message.error(this.$t('dataForm.error.connectionNameExist'))
                } else {
                  this.$message.error(err.response.msg)
                }
              } else {
                this.$message.error(this.$t('dataForm.saveFail'))
              }
            })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.connection-from {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .header {
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    background-color: rgba(250, 250, 250, 100);
    color: rgba(51, 51, 51, 100);
    font-size: 18px;
    text-align: left;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(222, 222, 228, 100);
    border-left: none;
    position: relative;
  }
}
.connection-from-body {
  padding-left: 24px;
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #fff;
}
.connection-from-title {
  padding-top: 20px;
  margin-bottom: 24px;
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 28px;
}
.connection-from-label {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  .label:before {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }
  .label {
    width: 100px;
  }
  .haze_label {
    width: 150px;
  }
  .content-box {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #000000;
    line-height: 22px;
    display: flex;
    align-items: center;
    max-width: 680px;
    white-space: nowrap;
    word-break: break-word;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .img-box {
    display: flex;
    width: 25px;
    height: 25px;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-radius: 3px;
    img {
      width: 100%;
    }
  }
}
.connection-from-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  .form-wrap {
    display: flex;
    overflow-y: auto;
    flex: 1;
  }
}
.connection-from-btn {
  width: 80px;
}
.form-builder {
  ::v-deep {
    .e-form-builder-item {
      width: 396px;
      &.large-item {
        width: 680px;
      }
      &.small-item {
        width: 240px;
      }
      &.mongodb-item {
        width: 680px;
      }
      &.mongodb-tip-item .el-form-item__content {
        width: 680px;
      }
      .url-tip {
        font-size: 12px;
        color: map-get($fontColor, slight);
        b {
          font-size: 12px;
          font-weight: 400;
          color: map-get($fontColor, slight);
        }
      }
    }
  }
}
</style>
