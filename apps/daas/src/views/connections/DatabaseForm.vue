<template>
  <div class="connection-from" v-loading="loadingFrom">
    <div class="connection-from-body">
      <main class="connection-from-main">
        <div class="connection-from-title">
          {{
            $route.params.id ? this.$t('connection_form_edit_connection') : this.$t('connection_form_creat_connection')
          }}
        </div>
        <div class="connection-from-label" v-if="$route.params.id">
          <label class="label">{{ $t('connection_form_connection_name') }}: </label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <div class="content ml-2">{{ model.name }}</div>
            <div class="addBtn cursor-pointer color-primary ml-2" @click="dialogEditNameVisible = true">
              {{ $t('connection_form_rename') }}
            </div>
          </div>
        </div>
        <div class="connection-from-label" v-else>
          <label class="label">{{ $t('connection_form_data_source_type') }}:</label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <span class="ml-2">{{ pdkOptions.name }}</span>
            <el-button class="ml-2" type="text" @click="dialogDatabaseTypeVisible = true">
              {{ $t('connection_form_change') }}
            </el-button>
          </div>
        </div>
        <div class="form-wrap">
          <div class="form">
            <SchemaToForm ref="schemaToForm" :schema="schemaData" :colon="true" label-width="160"></SchemaToForm>
            <span class="status">
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
            </span>
          </div>
        </div>
        <footer slot="footer" class="footer">
          <div class="footer-btn">
            <el-button size="mini" @click="goBack()">{{ $t('button_back') }}</el-button>
            <el-button size="mini" class="test" @click="startTest()">{{ $t('connection_list_test_button') }}</el-button>
            <el-button size="mini" type="primary" :loading="submitBtnLoading" @click="submit">
              {{ $t('button_save') }}
            </el-button>
          </div>
        </footer>
      </main>
      <GitBook :value="doc"></GitBook>
    </div>
    <Test
      ref="test"
      :dialogTestVisible.sync="dialogTestVisible"
      :formData="model"
      @returnTestData="returnTestData"
    ></Test>
    <DatabaseTypeDialog
      :dialogVisible.sync="dialogDatabaseTypeVisible"
      @databaseType="handleDatabaseType"
    ></DatabaseTypeDialog>
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
        <span style="color: #ccc; margin-top: 5px; font-size: 12px; display: inline-block"
          >中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格</span
        >
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelRename" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button @click="submitEdit()" size="mini" type="primary" :loading="editBtnLoading">{{
          $t('button_confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import factory from '@/api/factory'
import Test from './Test'
import { getConnectionIcon } from './util'
import DatabaseTypeDialog from './DatabaseTypeDialog'
import VIcon from '@/components/VIcon'
import SchemaToForm from '@tap/dag/src/components/SchemaToForm'
import { checkConnectionName } from '@/utils/util'
import GitBook from '@/components/GitBook'

const connectionsModel = factory('connections')

export default {
  name: 'DatabaseForm',
  components: { Test, DatabaseTypeDialog, VIcon, SchemaToForm, GitBook },
  data() {
    let validateRename = (rule, value, callback) => {
      if (!this.renameData.rename || !this.renameData.rename.trim()) {
        callback(new Error(this.$t('dataForm.form.connectionName') + this.$t('formBuilder.noneText')))
      } else if (!checkConnectionName(this.renameData.rename)) {
        callback(new Error('名称规则：中英开头，1～100个字符，可包含中英文、数字、中划线、下划线、空格'))
      } else {
        callback()
      }
    }
    return {
      rules: [],
      id: '',
      visible: false,
      showSystemConfig: false,
      model: {
        config: null
      },
      status: '',
      loadingFrom: true,
      dialogTestVisible: false,
      dialogDatabaseTypeVisible: false,
      dialogEditNameVisible: false,
      submitBtnLoading: false,
      editBtnLoading: false,
      renameData: {
        rename: ''
      },
      width: 440,
      height: 300,
      renameRules: {
        rename: [{ validator: validateRename, trigger: 'blur' }]
      },
      pdkOptions: {},
      schemaData: null,
      pdkFormModel: {},
      doc: ''
    }
  },
  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    }
  },
  created() {
    this.id = this.$route.params.id || ''
    this.getPdkForm()
    this.getPdkDoc()
    this.check()
  },
  methods: {
    // 共享挖掘设置
    check() {
      Promise.all([this.$api('logcollector').check(), this.$api('logcollector').getSystemConfig()]).then(
        ([check, res]) => {
          let verify = check?.data
          let digSettingForm = res?.data
          if (verify && !digSettingForm?.persistenceMongodb_uri_db) {
            this.showSystemConfig = true
            let config = {
              persistenceMongodb_uri_db: {
                type: 'string',
                title: this.$t('share_form_setting_connection_name'),
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-reactions': {
                  dependencies: ['.shareCdcEnable'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              persistenceMongodb_collection: {
                type: 'string',
                title: this.$t('share_form_setting_table_name'),
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-reactions': {
                  dependencies: ['.shareCdcEnable'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              share_cdc_ttl_day: {
                type: 'string',
                title: this.$t('share_form_setting_log_time'),
                'x-decorator': 'FormItem',
                enum: [
                  {
                    label: 1 + this.$t('share_form_edit_day'),
                    value: 1
                  },
                  {
                    label: 2 + this.$t('share_form_edit_day'),
                    value: 2
                  },
                  {
                    label: 3 + this.$t('share_form_edit_day'),
                    value: 3
                  },
                  {
                    label: 4 + this.$t('share_form_edit_day'),
                    value: 4
                  },
                  {
                    label: 5 + this.$t('share_form_edit_day'),
                    value: 5
                  },
                  {
                    label: 6 + this.$t('share_form_edit_day'),
                    value: 6
                  },
                  {
                    label: 7 + this.$t('share_form_edit_day'),
                    value: 7
                  }
                ],
                'x-component': 'Select',
                'x-reactions': {
                  dependencies: ['.shareCdcEnable'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] ? "visible" : "hidden"}}'
                    }
                  }
                }
              }
            }
            this.schemaData.properties.__TAPDATA_END.properties = Object.assign(
              {},
              this.schemaData.properties.__TAPDATA_END.properties,
              config
            )
            console.log(this.schemaData.properties.__TAPDATA_END.properties)
          }
        }
      )
    },
    //保存全局挖掘设置
    saveSetting(digSettingForm) {
      this.$api('logcollector')
        .patchSystemConfig(digSettingForm)
        .then(res => {
          if (res) {
            this.settingDialogVisible = false
            this.$message.success('保存全局设置成功')
          }
        })
    },
    goBack() {
      let msg = this.$route.params.id ? '此操作会丢失当前修改编辑内容' : '此操作会丢失当前正在创建的连接'
      // let title = this.$route.params.id ? '是否放弃修改内容？' : '是否放弃创建该连接？'

      this.$confirm(msg, '', {
        confirmButtonText: this.$t('connection_form_give_up'),
        cancelButtonText: this.$t('button_cancel'),
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.push({
          name: 'connections'
        })
      })
    },
    submit() {
      this.pdkFormModel = this.$refs.schemaToForm?.getForm?.()
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        // 保存数据源
        let id = this.$route.params?.id
        let { pdkOptions } = this
        let formValues = this.$refs.schemaToForm?.getFormValues?.()
        let { __TAPDATA_START, __TAPDATA_END } = formValues
        delete formValues['__TAPDATA_START']
        delete formValues['__TAPDATA_END']
        let params = Object.assign(
          {
            ...__TAPDATA_START,
            ...__TAPDATA_END,
            database_type: pdkOptions.type,
            pdkHash: pdkOptions.pdkHash
          },
          {
            status: 'testing',
            schema: {},
            retry: 0,
            nextRetry: null,
            response_body: {},
            project: '',
            submit: true,
            pdkType: 'pdk'
          },
          {
            config: formValues
          }
        )
        if (this.showSystemConfig) {
          //打开挖掘配置
          let digSettingForm = {
            persistenceMode: 'MongoDB',
            persistenceMongodb_uri_db: params.persistenceMongodb_uri_db,
            persistenceMongodb_collection: params.persistenceMongodb_collection,
            share_cdc_ttl_day: params.share_cdc_ttl_day
          }
          this.saveSetting(digSettingForm)
        }
        if (id) {
          params.id = id
        }
        if (!params.id) {
          params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
        }
        connectionsModel[params.id ? 'patchId' : 'post'](params)
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
            this.$message.error(err?.data?.message || this.$t('message.saveFail'))
          })
          .finally(() => {
            this.submitBtnLoading = false
          })
      })
    },
    //开始测试
    async startTest() {
      this.$root.checkAgent(() => {
        this.schemaFormInstance.validate().then(() => {
          this.startTestPdk()
        })
      })
    },
    startTestPdk() {
      let formValues = this.$refs.schemaToForm?.getFormValues?.()
      let { __TAPDATA_START, __TAPDATA_END } = formValues
      Object.assign(this.model, __TAPDATA_START, __TAPDATA_END)
      delete formValues['__TAPDATA_START']
      delete formValues['__TAPDATA_END']
      this.model.config = formValues
      this.model.pdkType = 'pdk'
      this.model.pdkHash = this.$route.query?.pdkHash
      this.dialogTestVisible = true
      if (this.$route.params.id) {
        //编辑需要特殊标识 updateSchema = false editTest = true
        this.$refs.test.start(false, true)
      } else {
        delete this.model.id
        this.$refs.test.start(false)
      }
    },
    returnTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
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
            id: this.model.id,
            submit: true
          }
          this.$api('connections')
            .patchId(params)
            .then(() => {
              this.editBtnLoading = false
              this.model.name = this.renameData.rename
              this.$refs['renameForm'].clearValidate()
              this.$message.success(this.$t('message_save_ok'))
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
    },
    handleDatabaseType(item) {
      this.dialogDatabaseTypeVisible = false
      const { pdkHash } = item
      let query = { pdkHash }
      this.$router.push({
        name: 'connectionsCreate',
        query
      })
      location.reload()
    },
    getPdkForm() {
      const pdkHash = this.$route.query?.pdkHash
      this.$api('DatabaseTypes')
        .pdkHash(pdkHash)
        .then(({ data }) => {
          let id = this.id || this.$route.params.id
          this.pdkOptions = data
          let result = {
            type: 'object',
            'x-component-props': {
              width: 500
            },
            properties: {
              __TAPDATA_START: {
                type: 'object',
                'x-index': 0,
                properties: {
                  name: {
                    type: 'string',
                    title: this.$t('connection_form_connection_name'),
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input'
                  },
                  connection_type: {
                    type: 'string',
                    title: this.$t('connection_form_connection_type'),
                    required: true,
                    default: 'source_and_target',
                    enum: [
                      {
                        label: this.$t('connection_form_source_and_target'),
                        value: 'source_and_target',
                        tip: this.$t('connection_form_source_and_target_tip')
                      },
                      {
                        label: this.$t('connection_form_source'),
                        value: 'source',
                        tip: this.$t('connection_form_source_tip')
                      },
                      {
                        label: this.$t('connection_form_target'),
                        value: 'target',
                        tip: this.$t('connection_form_target_tip')
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-component': 'Radio.Group',
                    'x-component-props': {
                      optionType: 'button'
                    }
                  }
                }
              },
              ...(data?.properties?.connection?.properties || {}),
              __TAPDATA_END: {
                type: 'object',
                'x-index': 1000000,
                properties: {
                  table_filter: {
                    type: 'string',
                    title: this.$t('connection_form_table_filter'),
                    'x-decorator': 'FormItem',
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                      placeholder: this.$t('connection_form_database_owner_tip')
                    }
                  },
                  shareCdcEnable: {
                    type: 'boolean',
                    default: false,
                    title: this.$t('connection_form_shared_mining'),
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      placeholder: this.$t('connection_form_shared_mining_tip')
                    }
                  }
                }
              }
            }
          }
          if (id) {
            this.getPdkData(id)
            delete result.properties.__TAPDATA_START.properties.name
          }
          //this.showSystemConfig = true
          this.schemaData = result
          this.loadingFrom = false
        })
    },
    getPdkData(id) {
      this.$api('connections')
        .getNoSchema(id)
        .then(res => {
          this.model = res.data
          let { name, connection_type, table_filter, shareCdcEnable } = this.model
          this.schemaFormInstance.setValues({
            __TAPDATA_START: {
              name,
              connection_type
            },
            __TAPDATA_END: {
              table_filter,
              shareCdcEnable
            },
            ...this.model?.config
          })
          this.renameData.rename = this.model.name
        })
    },
    getConnectionIcon() {
      const { pdkHash } = this.$route.query || {}
      return getConnectionIcon(pdkHash)
    },
    getPdkDoc() {
      const { pdkHash } = this.$route.query || {}
      this.$api('Pdk')
        .doc(pdkHash)
        .then(res => {
          this.doc = res.data
        })
    }
  }
}
</script>

<style scoped lang="scss">
.connection-from {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 20px 20px;
  overflow: hidden;
  background-color: #eff1f4;
  .connection-from-body {
    display: flex;
    flex: 1;
    padding-left: 24px;
    border-radius: 4px;
    overflow: hidden;
    background-color: map-get($bgColor, white);
    .connection-from-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      .connection-from-title {
        padding-top: 20px;
        margin-bottom: 24px;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: map-get($fontColor, dark);
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
          width: 160px;
          font-size: 12px;
          color: map-get($fontColor, light);
        }
        .content-box {
          display: flex;
          max-width: 680px;
          line-height: 22px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: map-get($fontColor, dark);
          align-items: center;
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
          background: map-get($bgColor, white);
          border-radius: 3px;
          img {
            width: 100%;
          }
        }
      }
      .form-wrap {
        display: flex;
        flex: 1;
        overflow: hidden;
        .form {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          .scheme-to-form {
            width: 480px;
          }
          .form-builder {
            width: 396px;
            ::v-deep {
              .e-form-builder-item {
                &.large-item {
                  width: 610px;
                  .el-form-item__content {
                    padding-right: 20px;
                  }
                }
                &.small-item {
                  width: 320px;
                }
                &.mongodb-item {
                  width: 680px;
                }
                &.mongodb-tip-item .el-form-item__content {
                  width: 680px;
                }
                .url-tip {
                  font-size: 12px;
                  color: map-get($fontColor, light);
                  b {
                    font-size: 12px;
                    font-weight: 400;
                    color: map-get($fontColor, light);
                  }
                }
                .fb-radio-group {
                  .el-radio--mini.is-bordered {
                    padding-top: 0;
                  }
                }
                .el-input .el-input__inner,
                .el-textarea__inner {
                  background-color: rgba(239, 241, 244, 0.2);
                }
                .el-textarea__inner {
                  min-height: 70px !important;
                }
              }
              .el-input-group__append button.el-button {
                background-color: inherit;
                border-color: azure;
              }
            }
          }
        }

        ::v-deep {
          .formily-element-form-item {
            font-size: 12px;
            .el-input-number {
              width: 180px;
            }
            .el-input-number--small {
              width: 130px;
            }
          }
        }
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
  .footer {
    width: 100%;
    height: 62px;
    background-color: map-get($bgColor, white);
    border-left: none;
    line-height: 62px;
    border-top: 1px solid #dedee4;
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0 auto;
      padding-top: 18px;
    }
  }
}
</style>
