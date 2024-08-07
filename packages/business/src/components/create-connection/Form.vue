<template>
  <div class="connection-from" v-loading="loadingFrom">
    <div class="connection-from-body">
      <main class="connection-from-main min-w-0">
        <div class="connection-from-title">
          {{
            params.id
              ? this.$t('packages_business_connection_form_edit_connection')
              : this.$t('public_connection_button_create')
          }}
        </div>
        <div class="connection-from-label" v-if="params.id">
          <label class="label">{{ $t('public_connection_name') }}: </label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <div class="content ml-2">{{ model.name }}</div>
            <div class="addBtn cursor-pointer color-primary ml-2" @click="dialogEditNameVisible = true">
              {{ $t('packages_business_connection_form_rename') }}
            </div>
          </div>
        </div>
        <div class="connection-from-label" v-else>
          <label class="label">{{ $t('packages_business_connection_form_data_source_type') }}:</label>
          <div class="content-box">
            <div class="img-box ml-2">
              <img :src="getConnectionIcon()" alt="" />
            </div>
            <span class="ml-2">{{ pdkOptions.name }}</span>
          </div>
        </div>
        <div class="form-wrap">
          <div class="form pr-3">
            <SchemaToForm
              ref="schemaToForm"
              :schema="schemaData"
              :scope="schemaScope"
              :colon="true"
              label-width="160"
            ></SchemaToForm>
            <span class="status">
              <span class="error" v-if="['invalid'].includes(status)">
                <VIcon>error</VIcon>
                <span>
                  {{ $t('public_status_invalid') }}
                </span>
              </span>
              <span class="success" v-if="['ready'].includes(status)">
                <i class="el-icon-success"></i>
                <span>
                  {{ $t('public_status_ready') }}
                </span>
              </span>
              <span class="warning" v-if="['testing'].includes(status)">
                <i class="el-icon-warning"></i>
                <span>
                  {{ $t('public_status_testing') }}
                </span>
              </span>
            </span>
          </div>
        </div>
        <footer slot="footer" class="footer">
          <div class="footer-btn text-start py-4">
            <!--            <el-button @click="goBack()">{{ $t('public_button_back') }}</el-button>-->
            <el-button class="test" @click="startTest()">{{ $t('public_connection_button_test') }}</el-button>
            <el-button type="primary" :loading="submitBtnLoading" @click="submit()">
              {{ $t('public_button_save') }}
            </el-button>
            <el-button type="primary" :loading="saveAndMoreLoading" @click="saveAndMore">{{
              $t('packages_business_save_and_more')
            }}</el-button>
          </div>
        </footer>
      </main>
      <GitBook
        v-resize.left="{
          minWidth: 350
        }"
        :value="doc"
        class="git-book"
      ></GitBook>
    </div>
    <Test ref="test" :visible.sync="dialogTestVisible" :formData="model" @returnTestData="returnTestData"></Test>
    <el-dialog
      :title="$t('packages_business_connection_rename')"
      :close-on-click-modal="false"
      :visible.sync="dialogEditNameVisible"
      width="30%"
    >
      <el-form :model="renameData" :rules="renameRules" ref="renameForm" @submit.native.prevent>
        <el-form-item prop="rename">
          <el-input v-model="renameData.rename" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <span style="color: #ccc; margin-top: 5px; font-size: 12px; display: inline-block">{{
          $t('packages_business_connections_databaseform_zhongyingkaitouge')
        }}</span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelRename" size="mini">{{ $t('public_button_cancel') }}</el-button>
        <el-button @click="submitEdit()" size="mini" type="primary" :loading="editBtnLoading">{{
          $t('public_button_confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { isEmpty } from 'lodash'
import { action } from '@formily/reactive'

import i18n from '@tap/i18n'
import {
  clusterApi,
  connectionsApi,
  databaseTypesApi,
  logcollectorApi,
  pdkApi,
  settingsApi,
  externalStorageApi,
  proxyApi
} from '@tap/api'
import { VIcon, GitBook } from '@tap/component'
import { SchemaToForm } from '@tap/form'
import { checkConnectionName, openUrl, submitForm } from '@tap/shared'
import Test from '@tap/business/src/views/connections/Test'
import { getConnectionIcon } from '@tap/business/src/views/connections/util'
import resize from '@tap/component/src/directives/resize'
import { cloneDeep } from 'lodash'

export default {
  name: 'DatabaseForm',
  components: { Test, VIcon, SchemaToForm, GitBook },
  inject: ['checkAgent', 'buried'],
  directives: {
    resize
  },
  props: {
    params: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    let validateRename = (rule, value, callback) => {
      if (!this.renameData.rename || !this.renameData.rename.trim()) {
        callback(new Error(this.$t('public_connection_name') + this.$t('public_form_not_empty')))
      } else if (!checkConnectionName(this.renameData.rename)) {
        callback(new Error(i18n.t('packages_business_connections_databaseform_mingchengguizezhong')))
      } else {
        callback()
      }
    }
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      rules: [],
      id: '',
      commandCallbackFunctionId: '',
      visible: false,
      showSystemConfig: false,
      model: {
        config: null
      },
      status: '',
      loadingFrom: true,
      dialogTestVisible: false,
      dialogEditNameVisible: false,
      submitBtnLoading: false,
      saveAndMoreLoading: false,
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
      schemaScope: null,
      pdkFormModel: {},
      doc: '',
      pathUrl: ''
    }
  },
  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    }
  },
  async created() {
    this.id = this.params.id || ''
    this.getPdkDoc()
    await this.getPdkForm()
    this.$router.push({
      query: {
        ...this.$route.query,
        type: undefined,
        pdkHash: undefined,
        connectionConfig: undefined
      }
    })
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.pathUrl = from?.fullPath
    })
  },
  methods: {
    //保存全局挖掘设置
    saveSetting(digSettingForm) {
      logcollectorApi.patchSystemConfig(digSettingForm)
    },
    goBack() {
      let msg = this.params.id
        ? i18n.t('packages_business_connections_databaseform_cicaozuohuidiu')
        : i18n.t('packages_business_connections_databaseform_cicaozuohuidiu')
      // let title = this.params.id ? '是否放弃修改内容？' : '是否放弃创建该连接？'

      this.$confirm(msg, '', {
        confirmButtonText: this.$t('packages_business_connection_form_give_up'),
        cancelButtonText: this.$t('public_button_cancel'),
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$emit('back')
      })
    },
    submit(addNext = false) {
      this.buried('connectionSubmit')
      this.pdkFormModel = this.$refs.schemaToForm?.getForm?.()
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        this.saveAndMoreLoading = true
        // 保存数据源
        let id = this.params?.id
        let { pdkOptions } = this
        let formValues = this.$refs.schemaToForm?.getFormValues?.()
        let { __TAPDATA } = formValues
        formValues.__connectionType = __TAPDATA.connection_type
        delete formValues['__TAPDATA']
        let params = {
          ...__TAPDATA,
          database_type: pdkOptions.type,
          pdkHash: pdkOptions.pdkHash,
          status: 'testing',
          schema: {},
          retry: 0,
          nextRetry: null,
          response_body: {},
          project: '',
          submit: true,
          pdkType: 'pdk',
          config: formValues
        }
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
        let promise = null
        if (id) {
          params.id = id
          promise = connectionsApi.updateById(id, params)
        } else {
          const { commandCallbackFunctionId } = this
          params['status'] = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
          promise = connectionsApi.create(params, { id: commandCallbackFunctionId })
        }
        promise
          .then(data => {
            this.buried('connectionSubmit', '', {
              result: true
            })
            this.$message.success(this.$t('public_message_save_ok'))
            this.$emit(addNext ? 'saveAndMore' : 'success', data)
          })
          .catch(() => {
            this.buried('connectionSubmit', '', {
              result: false
            })
          })
          .finally(() => {
            this.submitBtnLoading = false
            this.saveAndMoreLoading = false
          })
      })
    },
    saveAndMore() {
      this.submit(true)
    },
    //开始测试
    async startTest() {
      this.buried('connectionTest')
      this.checkAgent(() => {
        this.schemaFormInstance.validate().then(
          () => {
            this.startTestPdk()
          },
          () => {
            this.$el.querySelector('.formily-element-form-item-error').scrollIntoView()
          }
        )
      }).catch(() => {
        this.buried('connectionTestAgentFail')
      })
    },
    startTestPdk() {
      let formValues = this.$refs.schemaToForm?.getFormValues?.()
      let { __TAPDATA } = formValues
      formValues.__connectionType = __TAPDATA.connection_type
      delete formValues['__TAPDATA']
      Object.assign(this.model, {
        ...__TAPDATA,
        database_type: this.pdkOptions.type,
        pdkHash: this.pdkOptions.pdkHash,
        id: this.params.id,
        status: 'testing',
        schema: {},
        retry: 0,
        nextRetry: null,
        response_body: {},
        project: '',
        submit: true,
        pdkType: 'pdk',
        config: formValues
      })
      this.dialogTestVisible = true

      if (this.params.id) {
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
      this.buried('connectionTest', '', {
        result: data.status === 'ready'
      })
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
          connectionsApi
            .patchId(params)
            .then(() => {
              this.editBtnLoading = false
              this.model.name = this.renameData.rename
              let { name } = this.model
              this.schemaFormInstance.setValues({
                __TAPDATA: {
                  name
                }
              })
              this.$refs['renameForm'].clearValidate()
              this.$message.success(this.$t('public_message_save_ok'))
              this.dialogEditNameVisible = false
            })
            .catch(() => {
              this.$refs['renameForm'].clearValidate()
              this.editBtnLoading = false
            })
        }
      })
    },
    async getPdkForm() {
      const pdkHash = this.params?.pdkHash
      const data = await databaseTypesApi.pdkHash(pdkHash)
      let id = this.id || this.params.id
      this.pdkOptions = data || {}
      if (this.pdkOptions.capabilities?.some(t => t.id === 'command_callback_function')) {
        this.commandCallbackFunctionId = await proxyApi.getId()
      }
      let connectionTypeJson = {
        type: 'string',
        title: this.$t('public_connection_type'),
        required: true,
        default: this.pdkOptions.connectionType || 'source_and_target',
        enum: [
          {
            label: this.$t('public_connection_type_source_and_target'),
            value: 'source_and_target',
            tip: this.$t('packages_business_connection_form_source_and_target_tip')
          },
          {
            label: this.$t('public_connection_type_source'),
            value: 'source',
            tip: this.$t('packages_business_connection_form_source_tip')
          }
        ],
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          feedbackLayout: 'none'
        },
        'x-component': 'Radio.Group',
        'x-component-props': {
          optionType: 'button'
        }
      }
      if (this.pdkOptions.connectionType === 'source') {
        connectionTypeJson.enum = [
          {
            label: this.$t('public_connection_type_source'),
            value: 'source',
            tip: this.$t('packages_business_connection_form_source_tip')
          }
        ]
      } else if (this.pdkOptions.connectionType === 'target') {
        connectionTypeJson.enum = [
          {
            label: this.$t('public_connection_type_target'),
            value: 'target',
            tip: this.$t('packages_business_connection_form_target_tip')
          }
        ]
      }
      let END = {
        type: 'void',
        'x-index': 1000000,
        properties: {
          __TAPDATA: {
            type: 'object',
            'x-index': 1000000,
            properties: {}
          }
        }
      }
      const settings = await settingsApi.get()
      // 是否支持共享挖掘
      if (this.isDaas && this.pdkOptions.capabilities?.some(t => t.id === 'stream_read_function')) {
        END.properties.__TAPDATA.properties.shareCdcEnable = {
          type: 'boolean',
          default: false,
          title: this.$t('packages_business_connection_form_shared_mining'),
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            tooltip: this.$t('packages_business_connection_form_shared_mining_tip')
          },
          'x-component': 'Switch',
          'x-component-props': {
            placeholder: this.$t('packages_business_connection_form_shared_mining_tip')
          }
        }
        // 共享挖掘设置
        let config = {
          shareCDCExternalStorageId: {
            title: this.$t('packages_business_external_storage'), //外存配置
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-reactions': [
              {
                dependencies: ['__TAPDATA.shareCdcEnable'],
                fulfill: {
                  state: {
                    display: '{{$deps[0] ? "visible" : "hidden"}}'
                  }
                }
              },
              '{{useAsyncDataSource(loadExternalStorage)}}',
              {
                fulfill: {
                  state: {
                    value: '{{$self.value || $self.dataSource?.find(item => item.isDefault)?.value }}'
                  }
                }
              }
            ]
          }
        }
        END.properties.__TAPDATA.properties = Object.assign({}, END.properties.__TAPDATA.properties, config)
      }

      // 是否支持包含表
      if (this.pdkOptions.capabilities?.some(t => t.id === 'get_table_names_function')) {
        let config = {
          //对象配置
          loadAllTables: {
            type: 'boolean',
            default: true,
            title: i18n.t('packages_business_connections_databaseform_baohanbiao'),
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            enum: [
              {
                label: i18n.t('public_select_option_all'),
                value: true
              },
              {
                label: i18n.t('packages_business_connections_databaseform_zidingyi'),
                value: false
              }
            ]
          },
          table_filter: {
            type: 'string',
            title: ' ',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              placeholder: this.$t('packages_business_connection_form_database_owner_tip')
            },
            'x-decorator-props': {
              colon: false
            },
            'x-reactions': {
              dependencies: ['__TAPDATA.loadAllTables'],
              fulfill: {
                state: {
                  display: '{{$deps[0] ? "hidden" : "visible"}}'
                }
              }
            }
          },
          openTableExcludeFilter: {
            title: i18n.t('packages_business_connections_databaseform_paichubiao'),
            type: 'boolean',
            default: false,
            'x-decorator-props': {
              feedbackLayout: 'none'
            },
            'x-decorator': 'FormItem',
            'x-component': 'Switch'
          },
          openTableExcludeFilterTips: {
            type: 'void',
            title: ' ',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              colon: false
            },
            'x-component': 'Text',
            'x-component-props': {
              icon: 'info',
              content: i18n.t('packages_business_connections_databaseform_keyicongbaohan')
            }
          },
          tableExcludeFilter: {
            type: 'string',
            title: ' ',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              placeholder: this.$t('packages_business_connection_form_database_owner_tip')
            },
            'x-decorator-props': {
              colon: false,
              style: {
                'margin-top': '-22px'
              }
            },
            'x-reactions': {
              dependencies: ['__TAPDATA.openTableExcludeFilter'],
              fulfill: {
                state: {
                  display: '{{ $deps[0] ? "visible" : "hidden"}}'
                }
              }
            }
          }
        }
        END.properties.__TAPDATA.properties = Object.assign({}, END.properties.__TAPDATA.properties, config)
      }
      END.properties.__TAPDATA.properties.accessNodeType = {
        type: 'string',
        title: this.$t('packages_business_connection_form_access_node'),
        default: 'AUTOMATIC_PLATFORM_ALLOCATION',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          tooltip: this.$t('packages_business_connection_form_access_node_tip')
        },
        'x-component': 'Select',
        enum: [
          { label: this.$t('packages_business_connection_form_automatic'), value: 'AUTOMATIC_PLATFORM_ALLOCATION' },
          { label: this.$t('packages_business_connection_form_manual'), value: 'MANUALLY_SPECIFIED_BY_THE_USER' }
        ],
        'x-reactions': [
          {
            target: '__TAPDATA.accessNodeProcessId',
            fulfill: { state: { visible: "{{$self.value==='MANUALLY_SPECIFIED_BY_THE_USER'}}" } }
          },
          {
            target: '__TAPDATA.accessNodeProcessId',
            effects: ['onFieldInputValueChange'],
            fulfill: {
              state: {
                value: '{{$target.value || $target.dataSource[0].value}}'
              }
            }
          }
        ]
      }
      END.properties.__TAPDATA.properties.accessNodeProcessId = {
        type: 'string',
        title: ' ',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          colon: false
        },
        'x-component': 'Select',
        'x-reactions': [
          '{{useAsyncDataSource(loadAccessNode)}}',
          // 根据下拉数据判断是否存在已选的agent
          {
            fulfill: {
              run: `if ($self.dataSource?.length && $self.value) {
                const current = $self.dataSource.find(item => item.value === $self.value)
                if (!current) {
                  $self.setSelfErrors('${this.$t('packages_business_agent_select_not_found')}')
                }
              }`
            }
          }
        ],
        // 校验下拉数据判断是否存在已选的agent
        'x-validator': `{{(value, rule, ctx)=> {
            if (value && ctx.field.dataSource?.length) {
              const current = ctx.field.dataSource.find(item => item.value === value)
              if (!current) {
                return '${this.$t('packages_business_agent_select_not_found')}'
              }
            }
          }}}`
      }

      END.properties.__TAPDATA.properties.schemaUpdateHour = {
        type: 'string',
        title: i18n.t('packages_business_connections_databaseform_moxingjiazaipin'),
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          tooltip: i18n.t('packages_business_connections_databaseform_shujuyuanzhongmo')
        },
        default: '02:00',
        enum: [
          'false',
          '00:00',
          '01:00',
          '02:00',
          '03:00',
          '04:00',
          '05:00',
          '06:00',
          '07:00',
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
          '19:00',
          '20:00',
          '21:00',
          '22:00',
          '23:00'
        ]
      }
      let result = {
        type: 'object',
        'x-component-props': {
          width: 500
        },
        properties: {
          START: {
            type: 'void',
            'x-index': 0,
            properties: {
              __TAPDATA: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    title: this.$t('public_connection_name'),
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input'
                  },
                  connection_type: connectionTypeJson,
                  connection_form_source_and_target_tip: {
                    type: 'void',
                    title: ' ',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false
                    },
                    'x-component': 'Text',
                    'x-component-props': {
                      icon: 'info',
                      content: this.$t('packages_business_connection_form_source_and_target_tip')
                    },
                    'x-reactions': {
                      dependencies: ['__TAPDATA.connection_type'],
                      fulfill: {
                        schema: {
                          'x-decorator-props.style.display': '{{$deps[0]==="source_and_target" ? null:"none"}}'
                        }
                      }
                    }
                  },
                  connection_form_source_tip: {
                    type: 'void',
                    title: ' ',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false
                    },
                    'x-component': 'Text',
                    'x-component-props': {
                      icon: 'info',
                      content: this.$t('packages_business_connection_form_source_tip')
                    },
                    'x-reactions': {
                      dependencies: ['__TAPDATA.connection_type'],
                      fulfill: {
                        schema: { 'x-decorator-props.style.display': '{{$deps[0]==="source" ? null:"none"}}' }
                      }
                    }
                  },
                  connection_form_target_tip: {
                    type: 'void',
                    title: ' ',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false
                    },
                    'x-component': 'Text',
                    'x-component-props': {
                      icon: 'info',
                      content: this.$t('packages_business_connection_form_target_tip')
                    },
                    'x-reactions': {
                      dependencies: ['__TAPDATA.connection_type'],
                      fulfill: {
                        schema: { 'x-decorator-props.style.display': '{{$deps[0]==="target" ? null:"none"}}' }
                      }
                    }
                  }
                }
              }
            }
          },
          ...(data?.properties?.connection?.properties || {}),
          END: END
        }
      }
      if (id) {
        this.getPdkData(id)
        delete result.properties.START.properties.__TAPDATA.properties.name
      }
      //this.showSystemConfig = true
      this.setConnectionConfig()
      this.schemaScope = {
        isEdit: !!id,
        useAsyncDataSource: (service, fieldName = 'dataSource', ...serviceParams) => {
          return field => {
            field.loading = true
            service({ field }, ...serviceParams).then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },
        useAsyncDataSourceByConfig: (config, ...serviceParams) => {
          // withoutField: 不往service方法传field参数
          const { service, fieldName = 'dataSource', withoutField = false } = config
          return field => {
            field.loading = true
            let fetch = withoutField ? service(...serviceParams) : service(field, ...serviceParams)
            fetch.then(
              action.bound(data => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              })
            )
          }
        },
        loadAccessNode: async () => {
          const data = await clusterApi.findAccessNodeInfo()

          return (
            data?.map(item => {
              return {
                value: item.processId,
                label: `${item.hostName}（${
                  item.status === 'running' ? i18n.t('public_status_running') : i18n.t('public_agent_status_offline')
                }）`,
                disabled: item.status !== 'running'
              }
            }) || []
          )
        },
        loadCommandList: async (filter, val) => {
          try {
            const { $values, command, where = {}, page, size } = filter
            const { pdkHash, id } = this.pdkOptions
            const { __TAPDATA, ...formValues } = $values
            const search = where.label?.like
            const getValues = Object.assign({}, this.model?.config || {}, formValues)
            let params = {
              pdkHash,
              connectionId: id || this.commandCallbackFunctionId,
              connectionConfig: isEmpty(formValues) ? this.model?.config || {} : getValues,
              command,
              type: 'connection',
              action: search ? 'search' : 'list',
              argMap: {
                key: search,
                page,
                size: size || 1000
              }
            }
            if (!params.pdkHash || !params.connectionId) {
              return { items: [], total: 0 }
            }
            let result = await proxyApi.command(params)
            if (!result.items) {
              return { items: [], total: 0 }
            }
            return result
          } catch (e) {
            console.log('catch', e) // eslint-disable-line
            return { items: [], total: 0 }
          }
        },
        getToken: async (field, params, $form) => {
          const filter = {
            subscribeId: `source#${this.model?.id || this.commandCallbackFunctionId}`,
            service: 'engine',
            expireSeconds: 100000000
          }
          proxyApi.subscribe(filter).then(data => {
            const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
            const p = location.origin + location.pathname
            let str = `${p}${isDaas ? '' : 'tm/'}api/proxy/callback/${data.token}`
            if (/^\/\w+/.test(data.token)) {
              str = `${p.replace(/\/$/, '')}${data.token}`
            }
            $form.setValuesIn(field.name, str)
          })
        },
        getCommandAndSetValue: async ($form, others) => {
          const getState = $form.getState()
          const { pdkHash } = this.pdkOptions
          const { __TAPDATA, ...formValues } = getState?.values || {}
          const { command } = others
          const getValues = Object.assign({}, this.model?.config || {}, formValues)
          let params = {
            pdkHash,
            connectionId: this.model?.id || this.commandCallbackFunctionId,
            connectionConfig: isEmpty(formValues) ? this.model?.config || {} : getValues,
            command,
            type: 'connection'
          }
          proxyApi.command(params).then(data => {
            const setValue = data.setValue
            if (setValue) {
              for (let key in setValue) {
                $form.setValuesIn(key, setValue[key]?.data)
              }
            }
          })
        },
        async loadExternalStorage() {
          try {
            const { items = [] } = await externalStorageApi.list()
            return items.map(item => {
              return {
                label: item.name,
                value: item.id,
                isDefault: item.defaultStorage
              }
            })
          } catch (e) {
            return []
          }
        },
        toMonitor: async () => {
          const routeUrl = this.$router.resolve({
            name: 'HeartbeatMonitor',
            params: {
              id: this.heartbeatTaskId
            }
          })
          openUrl(routeUrl.href)
        },
        handleHeartbeatEnable: (value, $form) => {
          if (!value) return
          this.getHeartbeatTaskId($form)
        },
        goToAuthorized: async params => {
          const routeQuery = cloneDeep(this.$route.query)
          const routeParams = this.$route.params
          delete routeQuery['connectionConfig']
          let routeUrl = this.$router.resolve({
            name: 'dataConsole',
            query: {
              type: 'add-connection',
              pdkHash: this.params.pdkHash
            },
            params: routeParams
          })

          const { __TAPDATA, ...__TAPDATA_CONFIG } = this.$refs.schemaToForm?.getFormValues?.() || {}
          params.oauthUrl = params?.oauthUrl.replace(/@\{(\w+)\}@/gi, function (val, sub) {
            return __TAPDATA_CONFIG[sub]
          })
          const data = Object.assign({}, params, {
            url: location.origin + location.pathname + routeUrl.href,
            connectionConfig: {
              __TAPDATA,
              __TAPDATA_CONFIG
            }
          })
          submitForm(params?.target, data)
        }
      }
      this.schemaData = result
      this.loadingFrom = false
    },
    getPdkData(id) {
      connectionsApi.getNoSchema(id).then(data => {
        this.model = data
        let {
          name,
          connection_type,
          table_filter,
          loadAllTables,
          shareCdcEnable,
          accessNodeType,
          accessNodeProcessId,
          openTableExcludeFilter,
          tableExcludeFilter,
          schemaUpdateHour
        } = this.model
        this.schemaFormInstance.setValues({
          __TAPDATA: {
            name,
            connection_type,
            table_filter,
            loadAllTables,
            shareCdcEnable,
            accessNodeType,
            accessNodeProcessId,
            openTableExcludeFilter,
            tableExcludeFilter,
            schemaUpdateHour
          },
          ...this.model?.config
        })
        this.renameData.rename = this.model.name
      })
    },
    getConnectionIcon() {
      const { pdkHash } = this.params || {}
      return getConnectionIcon(pdkHash)
    },
    getPdkDoc() {
      const { pdkHash } = this.params || {}
      pdkApi.doc(pdkHash).then(res => {
        this.doc = res?.data
      })
    },
    async setConnectionConfig() {
      const { connectionConfig } = this.$route.query || {}
      if (connectionConfig) {
        // delete this.$route.query.connectionConfig
        // delete this.$route.query.type
        // delete this.$route.query.pdkHash
        console.log({ ...this.$route }, this.$route.query) // eslint-disable-line
        const params = {
          pdkHash: this.params.pdkHash,
          connectionConfig: JSON.parse(connectionConfig),
          command: 'OAuth',
          type: 'connection'
        }
        const res = await proxyApi.command(params)
        const { __TAPDATA, __TAPDATA_CONFIG = {}, ...trace } = res || JSON.parse(connectionConfig) || {}
        Object.assign(
          this.model,
          __TAPDATA,
          {
            config: __TAPDATA_CONFIG
          },
          trace
        )
        this.schemaFormInstance.setValues({
          __TAPDATA,
          ...__TAPDATA_CONFIG,
          ...trace
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.connection-from {
  display: flex;
  flex-direction: column;
  height: 100%;
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
      border-top: 1px solid #e1e3e9;
      .connection-from-title {
        padding-top: 20px;
        margin-bottom: 24px;
        font-size: $fontSubtitle;
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
          font-size: $fontBaseTitle;
          color: map-get($fontColor, light);
        }
        .content-box {
          display: flex;
          max-width: 680px;
          line-height: 22px;
          font-size: $fontBaseTitle;
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
          //.scheme-to-form {
          //  width: 480px;
          //}
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
    //height: 62px;
    background-color: map-get($bgColor, white);
    border-left: none;
    //line-height: 62px;
    border-top: 1px solid #e1e3e9;
    .footer-btn {
      //display: flex;
      //align-items: center;
      //justify-content: flex-end;
      //margin: 0 auto;
      //padding-top: 18px;
    }
  }
}

.git-book {
  width: 400px;
  border-top: 1px solid #e1e3e9;
}
</style>
