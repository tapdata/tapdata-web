<template>
  <div class="connection-from" v-loading="loadingFrom" :class="{ 'bg-white': isDaas }">
    <div class="connection-from-body gap-4">
      <main class="connection-from-main bg-white rounded-lg overflow-hidden">
        <div class="connection-from-title p-4">
          <div class="flex align-center">
            <span class="flex-1">{{
              $route.params.id
                ? this.$t('packages_business_connection_form_edit_connection')
                : this.$t('public_connection_button_create')
            }}</span>
            <div class="flex align-center overflow-hidden gap-2">
              <DatabaseIcon class="flex-shrink-0" :item="$route.query" :size="20"></DatabaseIcon>
              <template v-if="!$route.params.id">
                <span class="ml-auto font-color-light fw-normal fs-7 ellipsis">{{ pdkOptions.name }}</span>
                <el-button v-if="!$route.params.id" type="text" @click="dialogDatabaseTypeVisible = true">
                  {{ $t('packages_business_connection_form_change') }}
                </el-button>
              </template>
              <template v-else>
                <span class="ml-auto font-color-light fw-normal fs-7 ellipsis">{{ model.name }}</span>
                <el-button type="text" @click="dialogEditNameVisible = true">
                  {{ $t('packages_business_connection_form_rename') }}
                </el-button>
              </template>
            </div>
          </div>

          <ElAlert
            v-if="!isDaas && showAgentIpAlert"
            class="alert-primary text-primary mt-2"
            type="info"
            show-icon
            :closable="false"
          >
            <span slot="title" class="inline-block lh-sm align-middle">
              {{ $t('packages_business_agent_ip_tips_prefix')
              }}<a :href="docUrl" target="_blank" class="text-decoration-underline text-primary">{{
                $t('packages_business_agent_ip_tips_suffix')
              }}</a>
            </span>
          </ElAlert>
        </div>

        <div class="form-wrap">
          <div class="form px-4">
            <SchemaToForm
              class="pdk-schema-form"
              ref="schemaToForm"
              :schema="schemaData"
              :scope="schemaScope"
              layout="vertical"
              labelWidth="100%"
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
        <footer slot="footer" class="footer text-center border-top py-4">
          <el-button @click="goBack()">{{ $t('public_button_back') }}</el-button>
          <el-button class="test" @click="startTest()">{{ $t('public_connection_button_test') }}</el-button>
          <el-button v-if="['custom'].includes(pdkOptions.pdkId)" class="test" @click="handleDebug"
            >{{ $t('packages_business_connections_databaseform_jiaobentiaoshi') }}
          </el-button>
          <el-button type="primary" :loading="submitBtnLoading" @click="submit">
            {{ $t('public_button_save') }}
          </el-button>
        </footer>
      </main>
      <div class="flex-1 overflow-x-hidden bg-white rounded-lg">
        <ConnectorDoc :pdk-hash="$route.query.pdkHash" :pdk-id="$route.query.pdkId"></ConnectorDoc>
      </div>
    </div>
    <Test ref="test" :visible.sync="dialogTestVisible" :formData="model" @returnTestData="returnTestData"></Test>
    <SceneDialog
      :visible.sync="dialogDatabaseTypeVisible"
      selector-type="source_and_target"
      @selected="handleDatabaseType"
    ></SceneDialog>
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
    <ConnectionDebug :visible.sync="showDebug" :schema="schemaData" :pdkOptions="pdkOptions" :get-form="getForm" />
    <JsDebug
      :visible.sync="showJsDebug"
      :schema="jsDebugSchemaData"
      :pdkOptions="pdkOptions"
      :get-form="getForm"
      :connection-id="connectionId"
    />
    <UsedTaskDialog v-model="connectionLogCollectorTaskDialog" :data="connectionLogCollectorTaskData"></UsedTaskDialog>
  </div>
</template>

<script>
import { action } from '@formily/reactive'
import { cloneDeep, isEmpty } from 'lodash'

import i18n from '@tap/i18n'
import { clusterApi, connectionsApi, databaseTypesApi, externalStorageApi, proxyApi } from '@tap/api'
import { VIcon } from '@tap/component'
import { SchemaToForm } from '@tap/form'
import { checkConnectionName, submitForm, uuid } from '@tap/shared'
import resize from '@tap/component/src/directives/resize'

import Test from './Test'
import { getConnectionIcon } from './util'
import { ConnectionDebug } from './ConnectionDebug'
import { JsDebug } from './JsDebug'
import SceneDialog from '../../components/create-connection/SceneDialog.vue'
import UsedTaskDialog from './UsedTaskDialog'
import { DatabaseIcon } from '../../components'
import ConnectorDoc from '../../components/ConnectorDoc'

export default {
  name: 'DatabaseForm',
  components: {
    ConnectorDoc,
    DatabaseIcon,
    SceneDialog,
    Test,
    VIcon,
    SchemaToForm,
    ConnectionDebug,
    UsedTaskDialog,
    JsDebug
  },
  inject: ['checkAgent', 'buried'],
  directives: {
    resize
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
      jsDebugSchemaData: null,
      jsDebugParamsMethod: null,
      jsDebugDataMethod: null,
      schemaScope: null,
      pdkFormModel: {},
      doc: '',
      pathUrl: '',
      showDebug: false,
      showJsDebug: false,
      heartbeatTaskId: '',
      connectionLogCollectorTaskDialog: false,
      // 当前连接是否有共享缓存任务使用
      connectionLogCollectorTaskData: {
        items: [],
        total: 0
      },
      showAgentIpAlert: false
    }
  },
  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    },
    connectionId() {
      return this.model?.id || this.commandCallbackFunctionId
    },
    docUrl() {
      return `https://docs.tapdata.${
        !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en' ? 'io' : 'net'
      }/cloud/prerequisites/allow-access-network`
    }
  },
  async created() {
    this.id = this.$route.params.id || ''
    this.getPdkForm()

    if (!this.isDaas) {
      const { items: agentData } = await this.$axios.get(
        'api/tcm/agent?filter=' +
          encodeURIComponent(
            JSON.stringify({
              where: {
                agentType: 'Cloud',
                status: 'Running'
              }
            })
          )
      )

      if (agentData.length) {
        this.showAgentIpAlert = true
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.pathUrl = from?.fullPath
    })
  },
  mounted() {
    const { fromPath } = this.$route.query
    if (fromPath) {
      this.pathUrl = fromPath
    }
  },
  methods: {
    goBack() {
      let msg = this.$route.params.id
        ? i18n.t('packages_business_connections_databaseform_cicaozuohuidiu')
        : i18n.t('packages_business_connections_databaseform_cicaozuohuidiu')
      // let title = this.$route.params.id ? '是否放弃修改内容？' : '是否放弃创建该连接？'

      this.$confirm(msg, '', {
        confirmButtonText: this.$t('packages_business_connection_form_give_up'),
        cancelButtonText: this.$t('public_button_cancel'),
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.gotoBackPath()
      })
    },
    gotoBackPath() {
      if (this.pathUrl) {
        this.$router.push(
          this.pathUrl === '/'
            ? {
                name: 'connections'
              }
            : this.pathUrl
        )
      } else {
        this.$router.back()
      }
    },
    submit() {
      this.buried('connectionSubmit')
      this.pdkFormModel = this.$refs.schemaToForm?.getForm?.()
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        // 保存数据源
        let id = this.$route.params?.id
        let { pdkOptions } = this
        let formValues = this.$refs.schemaToForm?.getFormValues?.()
        let { __TAPDATA } = formValues
        formValues.__connectionType = __TAPDATA.connection_type
        delete formValues['__TAPDATA']
        let params = Object.assign(
          {
            ...__TAPDATA,
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
          .then(() => {
            this.buried('connectionSubmit', '', {
              result: true
            })
            this.$message.success(this.$t('public_message_save_ok'))
            this.gotoBackPath()
          })
          .catch(() => {
            this.buried('connectionSubmit', '', {
              result: false
            })
          })
          .finally(() => {
            this.submitBtnLoading = false
          })
      })
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
      Object.assign(this.model, __TAPDATA)
      delete formValues['__TAPDATA']
      this.model.config = formValues
      this.model.pdkType = 'pdk'
      this.model.pdkHash = this.$route.query?.pdkHash
      this.model.database_type = this.pdkOptions.pdkId
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
    handleDatabaseType(item) {
      this.dialogDatabaseTypeVisible = false
      const { pdkHash, pdkId } = item
      this.$router.push({
        name: 'connectionCreate',
        query: {
          pdkHash,
          pdkId
        }
      })
      location.reload()
    },
    async getPdkForm() {
      const pdkHash = this.$route.query?.pdkHash
      const data = await databaseTypesApi.pdkHash(pdkHash)
      let id = this.id || this.$route.params.id
      this.pdkOptions = data || {}

      if (this.pdkOptions.capabilities?.some(t => t.id === 'command_callback_function')) {
        this.commandCallbackFunctionId = await proxyApi.getId()
      }

      const { connectionType } = this.pdkOptions
      let typeEnum = ['source', 'target'].includes(connectionType)
        ? [
            {
              label: this.$t(`public_connection_type_${connectionType}`),
              value: connectionType,
              tip: this.$t(`packages_business_connection_form_${connectionType}_tip`)
            }
          ]
        : [
            {
              label: this.$t('public_connection_type_source_and_target'),
              value: 'source_and_target',
              tip: this.$t('packages_business_connection_form_source_and_target_tip')
            },
            {
              label: this.$t('public_connection_type_source'),
              value: 'source',
              tip: this.$t('packages_business_connection_form_source_tip')
            },
            {
              label: this.$t('public_connection_type_target'),
              value: 'target',
              tip: this.$t('packages_business_connection_form_target_tip')
            }
          ]

      const endProperties = {}

      // 是否支持共享挖掘
      if (this.isDaas && this.pdkOptions.capabilities?.some(t => t.id === 'stream_read_function')) {
        Object.assign(endProperties, {
          shareCdcEnable: {
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
          },
          shareCDCExternalStorageId: {
            title: this.$t('packages_business_external_storage'), //外存配置
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              onChange: `{{ val => shareCDCExternalStorageIdOnChange(val, $form) }}`,
              disabled: `{{ getShareCDCExternalStorageIdDisabled() }}`
            },
            'x-reactions': [
              {
                dependencies: ['__TAPDATA.shareCdcEnable'],
                fulfill: {
                  state: {
                    display: '{{$deps[0] ? "visible" : "hidden"}}'
                  }
                }
              },
              '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true}, $values.id ? $self.value : null)}}',
              {
                dependencies: ['__TAPDATA.shareCdcEnable'],
                fulfill: {
                  state: {
                    value: `{{ $deps[0] ? $self.value || $self.dataSource?.find(item => item.isDefault)?.value : '' }}`
                  }
                }
              }
            ]
          },
          shareCDCExternalStorageIdTips: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              colon: false,
              className: 'mt-n6'
            },
            'x-component': 'Space',
            'x-reactions': [
              {
                fulfill: {
                  state: {
                    display: `{{ getShareCDCExternalStorageIdDisabled() ? "visible" : "hidden" }}`
                  }
                }
              }
            ],
            properties: {
              tips: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Text',
                'x-component-props': {
                  content: i18n.t('packages_business_connections_databaseform_dangqianlianjiede'),
                  class: 'color-danger'
                }
              },
              Link: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Button',
                'x-component-props': {
                  type: 'text',
                  class: 'text-decoration-underline',
                  onClick: '{{handleLogCollectorTaskDialog}}'
                },
                'x-content': i18n.t('packages_business_connections_databaseform_chakanwajueren')
              }
            }
          }
        })
      }

      // 是否支持包含表
      if (this.pdkOptions.capabilities?.some(t => t.id === 'get_table_names_function')) {
        Object.assign(endProperties, {
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
        })
      }

      Object.assign(endProperties, {
        accessNodeType: {
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
                  value:
                    '{{$target.value || ($target.dataSource && $target.dataSource[0] ? $target.dataSource[0].value : null)}}'
                }
              }
            }
          ]
        },
        accessNodeProcessId: {
          type: 'string',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            colon: false
          },
          'x-component': 'Select',
          'x-component-props': {
            onChange: `{{ () => $self.setSelfErrors('') }}`
          },
          'x-reactions': [
            '{{useAsyncDataSource(loadAccessNode, "dataSource", {value: $self.value})}}',
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
            if (!value) {
              return '${this.$t('packages_business_agent_select_placeholder')}'
            } else if (value && ctx.field.dataSource?.length) {
              const current = ctx.field.dataSource.find(item => item.value === value)
              if (!current) {
                $self.setSelfErrors('')
                return '${this.$t('packages_business_agent_select_not_found')}'
              }
            }
          }}}`
        },
        schemaUpdateHour: {
          type: 'string',
          title: i18n.t('packages_business_connections_databaseform_moxingjiazaipin'),
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-decorator-props': {
            tooltip: i18n.t('packages_business_connections_databaseform_shujuyuanzhongmo')
          },
          default: '02:00',
          enum: [
            {
              label: i18n.t('packages_business_connections_databaseform_bujiazai'),
              value: 'false'
            },
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
        },
        heartbeatObject: {
          type: 'void',
          'x-component': 'Space',
          title: i18n.t('packages_business_connections_databaseform_kaiqixintiaobiao'),
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            tooltip: i18n.t('packages_business_connections_databaseform_dakaixintiaobiao')
          },
          properties: {
            heartbeatEnable: {
              type: 'boolean',
              default: false,
              'x-component': 'Switch'
            }
          },
          'x-reactions': {
            dependencies: ['__TAPDATA.connection_type'],
            fulfill: {
              state: {
                display: '{{$deps[0] === "source_and_target" ? "visible":"hidden"}}'
              }
            }
          }
        }
      })
      const connectionProperties = data?.properties?.connection?.properties || {}
      const { OPTIONAL_FIELDS } = connectionProperties
      delete connectionProperties.OPTIONAL_FIELDS

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
                  connection_type: {
                    type: 'string',
                    title: this.$t('public_connection_type'),
                    required: true,
                    default: this.pdkOptions.connectionType || 'source_and_target',
                    enum: typeEnum,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      feedbackLayout: 'none'
                    },
                    'x-component': 'Radio.Group',
                    'x-component-props': {
                      optionType: 'button'
                    }
                  },
                  connection_form_source_and_target_tip: {
                    type: 'void',
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
          ...connectionProperties,
          END: {
            type: 'void',
            'x-index': 1000000,
            'x-component': 'FormCollapse',
            'x-component-props': {
              // class: 'border-bottom-0',
              activeKey: []
            },
            properties: {
              advance: {
                type: 'void',
                'x-component': 'FormCollapse.Item',
                'x-component-props': {
                  title: i18n.t('public_advanced_settings')
                },
                properties: {
                  OPTIONAL_FIELDS,
                  __TAPDATA: {
                    type: 'object',
                    // 'x-index': 1000000,
                    properties: endProperties
                  }
                }
              },
              ssl: this.pdkOptions.tags.includes('ssl')
                ? {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('public_ssl_settings')
                    },
                    properties: {
                      useSSL: {
                        // 使用 SSL
                        title: i18n.t('packages_business_use_ssl'),
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'item-control-horizontal',
                          layout: 'horizontal'
                        },
                        'x-component': 'Switch'
                      },
                      sslCa: {
                        // CA 文件
                        title: i18n.t('packages_business_certificate_authority'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'TextFileReader',
                        'x-component-props': {
                          base64: true
                        },
                        fileNameField: 'sslCAFile'
                      },
                      sslCert: {
                        // 客户端证书文件
                        title: i18n.t('packages_business_client_certificate'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'TextFileReader',
                        'x-component-props': {
                          base64: true
                        },
                        fileNameField: 'sslCertFile'
                      },
                      sslKey: {
                        // 客户端密钥文件
                        title: i18n.t('packages_business_client_key'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'TextFileReader',
                        'x-component-props': {
                          base64: true
                        },
                        fileNameField: 'sslKeyFile'
                      },
                      sslKeyPassword: {
                        // 客户端密钥密码
                        title: i18n.t('packages_business_client_key_password'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Password'
                      }
                    }
                  }
                : undefined,
              ssh: this.pdkOptions.tags.includes('ssh')
                ? {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('public_ssh_settings')
                    },
                    properties: {
                      __TAPDATA: {
                        type: 'object',
                        properties: {
                          useSSH: {
                            // 使用 SSH 隧道
                            title: i18n.t('packages_business_use_ssh'),
                            type: 'boolean',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'item-control-horizontal',
                              layout: 'horizontal'
                            },
                            'x-component': 'Switch'
                          },
                          sshHost: {
                            // 主机名
                            title: i18n.t('packages_business_ssh_host'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Input'
                          },
                          sshPort: {
                            // 端口
                            title: i18n.t('packages_business_ssh_port'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber'
                          },
                          sshUsername: {
                            // 用户名
                            title: i18n.t('packages_business_ssh_username'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Input'
                          },
                          sshPassword: {
                            // 密码
                            title: i18n.t('packages_business_ssh_password'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Password'
                          }
                        }
                      }
                    }
                  }
                : undefined
            }
          }
        }
      }

      if (id) {
        await this.getPdkData(id)
        // 开启了共享挖掘
        const { shareCdcEnable, shareCDCExternalStorageId } = this.model
        if (shareCdcEnable && shareCDCExternalStorageId) {
          this.connectionLogCollectorTaskData = await connectionsApi.usingDigginTaskByConnectionId(id)
        }
        delete result.properties.START.properties.__TAPDATA.properties.name
      }

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
        loadAccessNode: async (fieldName, others = {}) => {
          const data = await clusterApi.findAccessNodeInfo()

          return (
            data
              ?.filter(t => t.status === 'running' || t.processId === others.value)
              ?.map(item => {
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
            let subscribeIds = []
            if (__TAPDATA.accessNodeProcessId) {
              subscribeIds = [`processId_${__TAPDATA.accessNodeProcessId}`]
            }
            let params = {
              pdkHash,
              connectionId: id || this.commandCallbackFunctionId,
              connectionConfig: isEmpty(formValues) ? this.model?.config || {} : getValues,
              subscribeIds,
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
        getCommandAndSetValue: async ($form, others = {}) => {
          const getState = $form.getState()
          const { pdkHash } = this.pdkOptions
          const { __TAPDATA, ...formValues } = getState?.values || {}
          const getValues = Object.assign({}, this.model?.config || {}, formValues)
          let subscribeIds = []
          if (__TAPDATA.accessNodeProcessId) {
            subscribeIds = [`processId_${__TAPDATA.accessNodeProcessId}`]
          }
          let params = {
            pdkHash,
            connectionId: this.model?.id || this.commandCallbackFunctionId,
            connectionConfig: isEmpty(formValues) ? this.model?.config || {} : getValues,
            ...others,
            subscribeIds,
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
        async loadExternalStorage(id) {
          try {
            let filter = {
              where: {},
              limit: 1000,
              skip: 0
            }
            if (id) {
              const ext = await externalStorageApi.get(id)
              filter.where.type = ext?.type
            }
            const { items = [] } = await externalStorageApi.list({
              filter: JSON.stringify(filter)
            })
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
        goToAuthorized: async params => {
          // fromPath 记录进入编辑连接的来源路由，认证回来后设置返回的路由
          const routeQuery = { ...this.$route.query, fromPath: this.pathUrl }
          const routeParams = this.$route.params
          delete routeQuery['connectionConfig']
          let routeUrl = this.$router.resolve({
            name: routeParams?.id ? 'connectionsEdit' : 'connectionCreate',
            query: routeQuery,
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
        },
        shareCDCExternalStorageIdOnChange: (val, $form) => {
          $form.setFieldState('__TAPDATA.shareCDCExternalStorageIdTips', state => {
            state.display =
              this.connectionLogCollectorTaskData.total && val !== this.model.shareCDCExternalStorageId
                ? 'visible'
                : 'hidden'
          })
        },
        getShareCDCExternalStorageIdDisabled: () => {
          return !!this.connectionLogCollectorTaskData.total
        },
        handleLogCollectorTaskDialog: async () => {
          this.connectionLogCollectorTaskDialog = true
        },
        handleJsDebug: (path = []) => {
          const properties = this.schemaData?.properties || {}
          let fieldObj = {}
          path.forEach(p => {
            const { key, data } = this.getOptionByPath(properties, p)
            fieldObj[key] = data
          })
          this.jsDebugSchemaData = fieldObj
          this.showJsDebug = true
        },
        handleGetGenerateRefreshToken: ($index, $record, items, others) => {
          if (items.filter((t, i) => i !== $index).some(t => t.supplierKey === $record.supplierKey)) {
            return this.$message.error(this.$t('packages_form_message_exists_name'))
          }
          const params = Object.assign(
            {
              supplierKey: $record.supplierKey,
              randomId: $record.randomId,
              subscribeId: `source#${this.model?.id || this.commandCallbackFunctionId}`,
              service: 'engine'
            },
            others
          )
          proxyApi.generateRefreshToken(params).then((data = {}) => {
            const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
            const p = location.origin + location.pathname
            let str = `${p}${isDaas ? '' : 'tm/'}${data.path}/${data.token}`
            if (/^\/\w+/.test(data.token)) {
              str = `${p.replace(/\/$/, '')}${data.token}`
            }
            $record.refreshURL = str
          })
        },
        getUid: () => {
          return uuid()
        },
        getHost: async () => {
          const data = await proxyApi.host()
          return data?.host
        }
      }
      this.schemaData = result
      this.loadingFrom = false
    },
    async getPdkData(id) {
      await connectionsApi.getNoSchema(id).then(async data => {
        // 检查外存是否存在，不存在则设置默认外存
        const ext = await externalStorageApi.get(data.shareCDCExternalStorageId)
        if (!ext) {
          data.shareCDCExternalStorageId = ''
          let filter = {
            where: {
              defaultStorage: true
            }
          }

          const { items = [] } = await externalStorageApi.list({
            filter: JSON.stringify(filter)
          })
          data.shareCDCExternalStorageId = items[0]?.id
        }
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
          schemaUpdateHour,
          shareCDCExternalStorageId,
          heartbeatEnable
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
            shareCDCExternalStorageId,
            schemaUpdateHour,
            heartbeatEnable
          },
          ...this.model?.config,
          id: this.model?.id
        })
        this.renameData.rename = this.model.name
      })
    },
    getConnectionIcon() {
      const { pdkHash } = this.$route.query || {}
      return getConnectionIcon(pdkHash)
    },

    getForm() {
      return this.schemaFormInstance
    },

    handleDebug() {
      this.showDebug = true
    },

    async setConnectionConfig() {
      const { connectionConfig, pdkHash } = this.$route.query || {}
      if (connectionConfig) {
        let subscribeIds = []
        const connectionConfigObj = JSON.parse(connectionConfig)
        const accessNodeProcessId = connectionConfigObj['__TAPDATA']?.accessNodeProcessId
        if (accessNodeProcessId) {
          subscribeIds = [`processId_${accessNodeProcessId}`]
        }
        const params = {
          pdkHash,
          connectionConfig: connectionConfigObj,
          command: 'OAuth',
          type: 'connection',
          subscribeIds
        }
        const res = await proxyApi.command(params)
        const { __TAPDATA, __TAPDATA_CONFIG = {}, ...trace } = res || connectionConfigObj || {}
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
    },

    getOptionByPath(obj = {}, path) {
      const arr = path.split('.')
      const key = arr.shift()
      const data = obj[key] || {}
      if (arr.length) {
        return this.getOptionByPath(data.properties, arr.join('.'))
      }
      delete data.title
      return {
        key,
        data
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

  .alert-primary {
    background: #e8f3ff;
  }

  .connection-from-body {
    display: flex;
    flex: 1;
    //padding-left: 24px;
    //border-radius: 4px;
    overflow: hidden;
    //background-color: map-get($bgColor, white);
    .connection-from-main {
      display: flex;
      flex: 1;
      flex-direction: column;

      .connection-from-title {
        font-size: $fontSubtitle;
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
          text-transform: capitalize;
        }

        .content-box {
          display: flex;
          max-width: 680px;
          line-height: 22px;
          font-size: $fontBaseTitle;
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
    /*width: 100%;
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
		}*/
  }
}

.pdk-schema-form {
  ::v-deep {
    .formily-element-form-item-feedback-layout-loose {
      margin-bottom: 20px;
    }

    .formily-element-form-item-layout-vertical {
      > .formily-element-form-item-label {
        margin-bottom: 8px;

        .formily-element-form-item-label-content {
          min-height: unset;
          height: unset;
        }

        .formily-element-form-item-label-tooltip {
          margin-left: 4px;
          height: unset;
        }

        * {
          line-height: 22px;
        }
      }
    }

    .formily-element-form-collapse {
      &.border-bottom-0 {
        .el-collapse-item__header {
          border-bottom: none;
        }
      }

      .el-collapse-item__content {
        padding-bottom: 0;
      }
    }
  }
}
</style>
