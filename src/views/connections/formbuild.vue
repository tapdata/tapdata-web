<template>
  <div class="databaseFrom">
    <header class="header">
      {{ $route.params.id ? $t('connection.editDataSource') : $t('connection.createNewDataSource') }}
    </header>
    <div class="databaseFrom-body">
      <main class="databaseFrom-main">
        <header v-if="$route.params.id" class="edit-header-box">
          <div class="edit-header">
            <div class="img-box">
              <img :src="getImgByType(databaseType)" />
            </div>
            <div class="content">{{ model.name }}</div>
            <div class="addBtn color-primary" @click="dialogEditNameVisible = true">
              {{ $t('connection.rename') }}
            </div>
          </div>
        </header>
        <header class="edit-header-box" v-else>
          <div class="edit-header">
            <div class="img-box">
              <img :src="getImgByType(databaseType)" />
            </div>
            <div class="content-box">
              <div class="content">
                {{ typeMap[databaseType] }}
                <div class="addBtn color-primary" @click="dialogDatabaseTypeVisible = true">
                  {{ $t('connection.change') }}
                </div>
              </div>
              <div class="tip" v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')">
                {{ $t('dataForm.form.guide') }}
                <a class="color-primary" target="_blank" href="https://docs.tapdata.net/data-source">{{
                  $t('dataForm.form.guideDoc')
                  }}</a>
              </div>
              <div class="tip" v-if="$window.getSettingByKey('DFS_TCM_PLATFORM')">
                请按输入以下配置项以创建连接，点击下方连接测试按钮进行连接检测，支持版本、配置说明与限制说明等事项请查阅帮助文档
              </div>
            </div>
          </div>
        </header>
        <div class="form-wrap">
          <div class="form">
            <ConnectionFormSelector ref="connectionForm"></ConnectionFormSelector>
            <el-button type="primary" size="mini" class="test" @click="startTest()">{{ $t('connection.testConnection') }}</el-button>
          </div>
        </div>
        <footer slot="footer" class="footer">
          <div class="footer-btn">
            <el-button size="mini">{{ $t('dataForm.cancel') }}</el-button>
            <el-button size="mini" type="primary" @click="submit">
              {{ $t('dataForm.submit') }}
            </el-button>
          </div>
        </footer>
      </main>
      <ConnectionTest ref="connectionTest" :receive="receiveData"></ConnectionTest>
    </div>
  </div>
</template>

<script>
const TYPEMAP = {
  mysql: 'MySQL',
  oracle: 'Oracle',
  mongodb: 'MongoDB',
  elasticsearch: 'Elasticsearch',
  redis: 'Redis',
  postgres: 'PostgreSQL',
  sqlserver: 'SQL Server',
  'gbase-8s': 'GBase 8s',
  'sybase ase': 'Sybase ASE',
  gaussdb200: 'GaussDB200',
  db2: 'IBM Db2',
  mem_cache: 'Memory Cache',
  file: 'File(s)',
  custom_connection: 'Custom connection',
  'rest api': 'REST API',
  'dummy db': 'Dummy DB',
  gridfs: 'GridFS',
  kafka: 'Kafka',
  mariadb: 'MariaDB',
  'mysql pxc': 'MySQL PXC',
  jira: 'jira',
  dameng: 'DM DB',
  hive: 'Hive',
  tcp_udp: 'TCP/IP'
}
export default {
  name: 'formBuilder',
  data() {
    return {
      typeMap: TYPEMAP,
      databaseType: '',
      id: ''
    }
  },
  created() {
    this.databaseType = this.$route.query.databaseType || this.$store.state.createConnection.databaseType
    this.id = this.$route.params.id || ''
  },
  methods: {
    getImgByType(type) {
      if (!type) {
        type = 'default'
      }
      return require(`../../assets/images/databaseType/${type.toLowerCase()}.png`)
    },
    async startTest() {
      let data = this.getFormData()
      if (!data.form || !data.status) return //表单验证通过后测试连接
      let form = JSON.stringify(data?.form?.values)
      let result = await this.$api('Workers').getAvailableAgent()
      if (!result.data.result || result.data.result.length === 0) {
        if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
          this.$message.error(this.$t('dataForm.form.agentConnectionMsg'))
        } else {
          this.$message.error(this.$t('dataForm.form.agentMsg'))
        }
      } else {
        this.$refs.connectionTest.start(form, true)
      }
    },
    receiveData(data) {
      if (!data.status || data.status === null) return
      let status = data.status
      if (status === 'ready') {
        this.$message.success('连接测试有效')
      } else {
        this.$message.error('连接测试无效')
      }
      this.fetch()
    },
    getFormData() {
      let data = {}
      data.form = this.$refs.connectionForm.getFormData()
      data.form.submit()
      data.status = this.$refs.connectionForm.getFormCheckStatus()
      return data || undefined
    },
    submit() {
      let data = this.getFormData()
      if (!data.form) return
      let form = data.form || ''
      if (data.status) {
        let formData = JSON.parse(JSON.stringify(form.values))
        let params = Object.assign(
          {},
          {
            // user_id: this.$cookie.get('user_id'),
            status: 'testing',
            schema: {},
            retry: 0,
            nextRetry: null,
            response_body: {},
            project: '',
            submit: true,
          },
          formData
        )
        //初始化
        params['database_type'] = this.databaseType
        params['id'] = this.id
        delete params.status //编辑的情况下不传status
        if (!this.id) {
          params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
        }
        if (['mongodb', 'gridfs'].includes(params.database_type)) {
          params['sslCert'] = this.model.sslKey
          delete params.sslKeyFile
          delete params.sslCAFile
        }
        if (params.database_type === 'mongodb') {
          params.fill = params.isUrl ? 'uri' : ''
          delete params.isUrl
        }
        if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
          params['platformInfo'] = Object.assign(params['platformInfo'], this.handlePlatformInfo(params))
          if (params.sourceType === 'selfDB') {
            delete params.DRS_region
            delete params.DRS_zone
            delete params.platformInfo.DRS_region
            delete params.platformInfo.DRS_zone
          }
        }
        this.$api('connections')[this.id ? 'patchId' : 'post'](params)
          .then(() => {
            this.$message.success(this.$t('message.saveOK'))
            if (this.$route.query.step) {
              this.$router.push({
                name: 'connections',
                query: {
                  step: this.$route.query.step
                }
              })
            } else {
              this.$router.push({
                name: 'connections'
              })
            }
          })
          .catch(err => {
            if (err && err.response) {
              if (err.response.msg.indexOf('duplication for names') > -1) {
                this.$message.error(this.$t('dataForm.error.connectionNameExist'))
              } else if (err.response.msg.indexOf('duplicate source') > -1) {
                // this.connectionObj.name = err.response.data.name;
                // this.connectionObj.id = err.response.data.id;
                // this.repeatDialogVisible = true;
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
        console.log(data)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.databaseFrom {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .databaseFrom-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    .databaseFrom-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      .form-wrap {
        display: flex;
        overflow-y: auto;
        flex: 1;
      }
      .form {
        padding: 0 20px;
        width: 640px;
        margin: 0 auto;
        padding-right: 200px;
      }
      .edit-header-box {
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
      }
      .edit-header {
        display: flex;
        justify-content: flex-start;
        width: 578px;
        margin: 30px auto;
      }
      .title {
        display: flex;
        justify-content: flex-start;
        width: 568px;
        margin: 40px auto 20px auto;
      }
      .img-box {
        display: flex;
        width: 52px;
        height: 52px;
        justify-content: center;
        align-items: center;
        background: #fff;
        border-radius: 3px;
        margin-right: 10px;
        img {
          width: 100%;
        }
      }
      .content {
        display: flex;
        align-items: center;
        margin-left: 15px;
        font-size: 22px;
        max-width: 445px;
        white-space: nowrap;
        word-break: break-word;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .addBtn {
        cursor: pointer;
        font-size: 12px;
        margin-top: 22px;
        margin-left: 10px;
      }
      .content-box {
        .addBtn {
          cursor: pointer;
          font-size: 12px;
          margin-top: 0;
          margin-left: 10px;
        }

        .tip {
          margin-left: 15px;
          font-size: 12px;
          color: #999;
          margin-top: 5px;
          line-height: 18px;
          width: 430px;
        }
      }
      .test {
        margin-left: 200px;
        margin-bottom: 20px;
        margin-top: 16px;
      }
    }
    .status {
      font-size: 12px;
      margin-top: 2px;
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
  }
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
  .footer {
    margin: 10px auto;
    width: 100%;
    height: 62px;
    background-color: #fff;
    border-left: none;
    line-height: 62px;
    border-top: 1px solid #dedee4;
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin: 0 auto;
      padding-top: 18px;
      width: 450px;
    }
    button {
      margin-left: 10px;
      padding: 0 15px;
      height: 32px;
      line-height: 32px;
      border-radius: 2px;
    }
  }
}
</style>
