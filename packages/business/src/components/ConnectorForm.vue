<script>
import { action } from '@formily/reactive'
import {
  connectionsApi,
  databaseTypesApi,
  externalStorageApi,
  findAccessNodeInfo,
  proxyApi,
} from '@tap/api'
import { SchemaToForm } from '@tap/form'
import i18n from '@tap/i18n'
import { submitForm, uuid } from '@tap/shared'
import { isEmpty } from 'lodash-es'
import Test from '../views/connections/Test.vue'
import ConnectorDoc from './ConnectorDoc.vue'

export default {
  name: 'ConnectorForm',
  components: { Test, ConnectorDoc, SchemaToForm },
  inject: ['checkAgent', 'buried', 'lockedFeature'],
  props: {
    pdkHash: String,
    pdkId: String,
    id: String,
    showIpTips: Boolean,
    connector: Object,
    connectionType: String,
  },
  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    return {
      isDaas,
      // 当前连接是否有共享缓存任务使用
      connectionLogCollectorTaskData: {
        items: [],
        total: 0,
      },
      schema: null,
      pdkOptions: null,
      scope: {
        $isDaas: isDaas,
        isEdit: !!this.id,
        useAsyncDataSource: (
          service,
          fieldName = 'dataSource',
          ...serviceParams
        ) => {
          return (field) => {
            field.loading = true
            service({ field }, ...serviceParams).then(
              action.bound((data) => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              }),
            )
          }
        },
        useAsyncDataSourceByConfig: (config, ...serviceParams) => {
          // withoutField: 不往service方法传field参数
          const {
            service,
            fieldName = 'dataSource',
            withoutField = false,
          } = config
          return (field) => {
            field.loading = true
            const fetch = withoutField
              ? service(...serviceParams)
              : service(field, ...serviceParams)
            fetch.then(
              action.bound((data) => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              }),
            )
          }
        },
        loadAccessNode: async (fieldName, others = {}) => {
          const data = await findAccessNodeInfo()

          const mapNode = (item) => ({
            value: item.processId,
            label: `${item.hostName}（${
              item.status === 'running'
                ? i18n.t('public_status_running')
                : i18n.t('public_agent_status_offline')
            }）`,
            disabled: item.status !== 'running',
            accessNodeType: item.accessNodeType,
          })

          return (
            data
              ?.filter(
                (t) =>
                  t.status === 'running' ||
                  t.accessNodeType ===
                    'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' ||
                  t.processId === others.value,
              )
              ?.map((item) => {
                if (
                  item.accessNodeType ===
                  'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
                ) {
                  return {
                    value: item.processId,
                    label: `${item.accessNodeName}（${i18n.t('public_status_running')}：${
                      item.accessNodes?.filter((ii) => ii.status === 'running')
                        .length || 0
                    }）`,
                    accessNodeType: item.accessNodeType,
                    children: item.accessNodes?.map(mapNode) || [],
                  }
                }
                return mapNode(item)
              }) || []
          )
        },
        loadCommandList: async (filter, val) => {
          try {
            const { $values, command, where = {}, page, size } = filter
            const { pdkHash, id } = this.pdkOptions
            const { __TAPDATA, ...formValues } = $values
            const search = where.label?.like
            const getValues = Object.assign(
              {},
              this.model?.config || {},
              formValues,
            )
            let subscribeIds = []
            if (__TAPDATA.accessNodeProcessId) {
              subscribeIds = [`processId_${__TAPDATA.accessNodeProcessId}`]
            }
            const params = {
              pdkHash,
              connectionId: id || this.commandCallbackFunctionId,
              connectionConfig: isEmpty(formValues)
                ? this.model?.config || {}
                : getValues,
              subscribeIds,
              command,
              type: 'connection',
              action: search ? 'search' : 'list',
              argMap: {
                key: search,
                page,
                size: size || 1000,
              },
            }
            if (!params.pdkHash || !params.connectionId) {
              return { items: [], total: 0 }
            }
            const result = await proxyApi.command(params)
            if (!result.items) {
              return { items: [], total: 0 }
            }
            return result
          } catch (error) {
            console.log('catch', error) // eslint-disable-line
            return { items: [], total: 0 }
          }
        },
        getToken: async (field, params, $form) => {
          const filter = {
            subscribeId: `source#${this.model?.id || this.commandCallbackFunctionId}`,
            service: 'engine',
            expireSeconds: 100000000,
          }
          proxyApi.subscribe(filter).then((data) => {
            const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
            const p = location.origin + location.pathname
            let str = `${p}${isDaas ? '' : 'tm/'}api/proxy/callback/${data.token}`
            if (/^\/\w+/.test(data.token)) {
              str = `${p.replace(/\/$/, '')}${data.token}`
            }
            $form.setValuesIn(field.name, str)
          })
        },
        getCommandAndSetValue: async ($form, others = {}) => {
          const { pdkHash } = this.pdkOptions
          const { __TAPDATA, ...formValues } = $form.values || {}
          const getValues = Object.assign(
            {},
            this.model?.config || {},
            formValues,
          )
          let subscribeIds = []
          if (__TAPDATA.accessNodeProcessId) {
            subscribeIds = [`processId_${__TAPDATA.accessNodeProcessId}`]
          }
          const params = {
            pdkHash,
            connectionId: this.model?.id || this.commandCallbackFunctionId,
            connectionConfig: isEmpty(formValues)
              ? this.model?.config || {}
              : getValues,
            ...others,
            subscribeIds,
            type: 'connection',
          }
          proxyApi.command(params).then((data) => {
            const setValue = data.setValue
            if (setValue) {
              for (const key in setValue) {
                $form.setValuesIn(key, setValue[key]?.data)
              }
            }
          })
        },
        async loadExternalStorage(id) {
          try {
            const filter = {
              where: {},
              limit: 1000,
              skip: 0,
            }
            if (id) {
              const ext = await externalStorageApi.get(id)
              filter.where.type = ext?.type
            }
            const { items = [] } = await externalStorageApi.list({
              filter: JSON.stringify(filter),
            })
            return items.map((item) => {
              return {
                type: item.type,
                label: item.name,
                value: item.id,
                isDefault: item.defaultStorage,
              }
            })
          } catch {
            return []
          }
        },
        goToAuthorized: async (params) => {
          // fromPath 记录进入编辑连接的来源路由，认证回来后设置返回的路由
          const routeQuery = { ...this.$route.query, fromPath: this.pathUrl }
          const routeParams = this.$route.params
          delete routeQuery.connectionConfig
          const routeUrl = this.$router.resolve({
            name: routeParams?.id ? 'connectionsEdit' : 'connectionCreate',
            query: routeQuery,
            params: routeParams,
          })

          const { __TAPDATA, ...__TAPDATA_CONFIG } =
            this.$refs.schemaToForm?.getFormValues?.() || {}
          params.oauthUrl = params?.oauthUrl.replaceAll(
            /@\{(\w+)\}@/g,
            function (val, sub) {
              return __TAPDATA_CONFIG[sub]
            },
          )
          const data = Object.assign({}, params, {
            url: location.origin + location.pathname + routeUrl.href,
            connectionConfig: {
              __TAPDATA,
              __TAPDATA_CONFIG,
            },
          })
          submitForm(params?.target, data)
        },
        shareCDCExternalStorageIdOnChange: (val, $form) => {
          $form.setFieldState(
            '__TAPDATA.shareCDCExternalStorageIdTips',
            (state) => {
              state.display =
                this.connectionLogCollectorTaskData.total &&
                val !== this.model.shareCDCExternalStorageId
                  ? 'visible'
                  : 'hidden'
            },
          )
        },
        getShareCDCExternalStorageIdDisabled: () => {
          return !!this.connectionLogCollectorTaskData.total
        },
        handleLogCollectorTaskDialog: async () => {
          this.connectionLogCollectorTaskDialog = true
        },
        handleJsDebug: (path = []) => {
          const properties = this.schemaData?.properties || {}
          const fieldObj = {}
          path.forEach((p) => {
            const { key, data } = this.getOptionByPath(properties, p)
            fieldObj[key] = data
          })
          this.jsDebugSchemaData = fieldObj
          this.showJsDebug = true
        },
        handleGetGenerateRefreshToken: ($index, $record, items, others) => {
          if (
            items
              .filter((t, i) => i !== $index)
              .some((t) => t.supplierKey === $record.supplierKey)
          ) {
            return this.$message.error(
              this.$t('packages_form_message_exists_name'),
            )
          }
          const params = Object.assign(
            {
              supplierKey: $record.supplierKey,
              randomId: $record.randomId,
              subscribeId: `source#${this.model?.id || this.commandCallbackFunctionId}`,
              service: 'engine',
            },
            others,
          )
          proxyApi.generateRefreshToken(params).then((data = {}) => {
            const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
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
        },
      },
      status: '',
      model: {
        config: null,
      },
      commandCallbackFunctionId: '',
    }
  },
  computed: {
    docUrl() {
      return `https://docs.tapdata.${
        !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en'
          ? 'io'
          : 'net'
      }/prerequisites/allow-access-network`
    },
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    },
  },
  async created() {
    await this.getPdkForm()
  },
  methods: {
    async startTest() {
      this.buried('connectionTest')
      this.checkAgent(() => {
        this.schemaFormInstance.validate().then(
          () => {
            this.startTestPdk()
          },
          () => {
            this.$el
              .querySelector('.formily-element-form-item-error')
              .scrollIntoView()
          },
        )
      }).catch(() => {
        this.buried('connectionTestAgentFail')
      })
    },

    startTestPdk() {
      const formValues = this.$refs.schemaToForm?.getFormValues?.()
      const { __TAPDATA } = formValues
      formValues.__connectionType = __TAPDATA.connection_type
      Object.assign(this.model, __TAPDATA)
      delete formValues.__TAPDATA
      this.model.config = formValues
      this.model.pdkType = 'pdk'
      this.model.pdkHash = this.pdkOptions.pdkHash
      this.model.database_type = this.pdkOptions.pdkId
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
        result: data.status === 'ready',
      })
    },

    async getPdkForm() {
      if (this.connector) {
        this.pdkOptions = this.connector
      } else {
        this.pdkOptions = await databaseTypesApi.pdkHash(this.pdkHash)
      }

      // const data = await databaseTypesApi.pdkHash(this.pdkHash)
      const id = this.id
      // this.pdkOptions = data || {}

      if (
        this.pdkOptions.capabilities?.some(
          (t) => t.id === 'command_callback_function',
        )
      ) {
        this.commandCallbackFunctionId = await proxyApi.getId()
      }

      let { connectionType } = this.pdkOptions
      let hideConnectionType = false

      if (this.connectionType) {
        hideConnectionType = true
        connectionType = this.connectionType
      }

      const typeEnum = ['source', 'target'].includes(connectionType)
        ? [
            {
              label: this.$t(`public_connection_type_${connectionType}`),
              value: connectionType,
              tip: this.$t(
                `packages_business_connection_form_${connectionType}_tip`,
              ),
            },
          ]
        : [
            {
              label: this.$t('public_connection_type_source_and_target'),
              value: 'source_and_target',
              tip: this.$t(
                'packages_business_connection_form_source_and_target_tip',
              ),
            },
            {
              label: this.$t('public_connection_type_source'),
              value: 'source',
              tip: this.$t('packages_business_connection_form_source_tip'),
            },
            {
              label: this.$t('public_connection_type_target'),
              value: 'target',
              tip: this.$t('packages_business_connection_form_target_tip'),
            },
          ]

      const endProperties = {}

      // 是否支持共享挖掘
      if (
        !this.lockedFeature.sharedMiningList &&
        this.pdkOptions.capabilities?.some(
          (t) => t.id === 'stream_read_function',
        )
      ) {
        Object.assign(endProperties, {
          shareCdcEnable: {
            type: 'boolean',
            default: false,
            title: this.$t('packages_business_connection_form_shared_mining'),
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              tooltip: this.$t(
                'packages_business_connection_form_shared_mining_tip',
              ),
            },
            'x-component': 'Switch',
            'x-component-props': {
              placeholder: this.$t(
                'packages_business_connection_form_shared_mining_tip',
              ),
            },
          },
          shareCDCExternalStorageId: {
            title: this.$t('packages_business_external_storage'), //外存配置
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            'x-component-props': {
              onChange: `{{ val => shareCDCExternalStorageIdOnChange(val, $form) }}`,
              disabled: `{{ getShareCDCExternalStorageIdDisabled() }}`,
            },
            'x-reactions': [
              {
                dependencies: ['__TAPDATA.shareCdcEnable'],
                fulfill: {
                  state: {
                    display: '{{$deps[0] ? "visible" : "hidden"}}',
                  },
                },
              },
              '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true}, $values.id ? $self.value : null)}}',
              {
                dependencies: ['__TAPDATA.shareCdcEnable'],
                fulfill: {
                  state: {
                    value: `{{ $deps[0] ? $self.value || $self.dataSource?.find(item => item.isDefault)?.value : '' }}`,
                  },
                },
              },
            ],
          },
          shareCDCExternalStorageIdTips: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              colon: false,
              className: 'mt-n6',
            },
            'x-component': 'Space',
            'x-reactions': [
              {
                fulfill: {
                  state: {
                    display: `{{ getShareCDCExternalStorageIdDisabled() ? "visible" : "hidden" }}`,
                  },
                },
              },
            ],
            properties: {
              tips: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Text',
                'x-component-props': {
                  content: i18n.t(
                    'packages_business_connections_databaseform_dangqianlianjiede',
                  ),
                  class: 'color-danger',
                },
              },
              Link: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Button',
                'x-component-props': {
                  type: 'text',
                  class: 'text-decoration-underline',
                  onClick: '{{handleLogCollectorTaskDialog}}',
                },
                'x-content': i18n.t(
                  'packages_business_connections_databaseform_chakanwajueren',
                ),
              },
            },
          },
        })
      }

      // 是否支持包含表
      if (
        this.pdkOptions.capabilities?.some(
          (t) => t.id === 'get_table_names_function',
        )
      ) {
        Object.assign(endProperties, {
          loadAllTables: {
            type: 'boolean',
            default: true,
            title: i18n.t(
              'packages_business_connections_databaseform_baohanbiao',
            ),
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            enum: [
              {
                label: i18n.t('public_select_option_all'),
                value: true,
              },
              {
                label: i18n.t(
                  'packages_business_connections_databaseform_zidingyi',
                ),
                value: false,
              },
            ],
          },
          table_filter: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              placeholder: this.$t(
                'packages_business_connection_form_database_owner_tip',
              ),
            },
            'x-decorator-props': {
              colon: false,
            },
            'x-reactions': {
              dependencies: ['__TAPDATA.loadAllTables'],
              fulfill: {
                state: {
                  display: '{{$deps[0] ? "hidden" : "visible"}}',
                },
              },
            },
          },
          openTableExcludeFilter: {
            title: i18n.t(
              'packages_business_connections_databaseform_paichubiao',
            ),
            type: 'boolean',
            default: false,
            'x-decorator-props': {
              feedbackLayout: 'none',
            },
            'x-decorator': 'FormItem',
            'x-component': 'Switch',
          },
          openTableExcludeFilterTips: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              colon: false,
            },
            'x-component': 'Text',
            'x-component-props': {
              icon: 'info',
              content: i18n.t(
                'packages_business_connections_databaseform_keyicongbaohan',
              ),
            },
          },
          tableExcludeFilter: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              placeholder: this.$t(
                'packages_business_connection_form_database_owner_tip',
              ),
            },
            'x-decorator-props': {
              colon: false,
              style: {
                'margin-top': '-22px',
              },
            },
            'x-reactions': {
              dependencies: ['__TAPDATA.openTableExcludeFilter'],
              fulfill: {
                state: {
                  display: '{{ $deps[0] ? "visible" : "hidden"}}',
                },
              },
            },
          },
        })
      }

      Object.assign(endProperties, {
        accessNodeType: {
          type: 'string',
          title: this.$t('packages_business_connection_form_access_node'),
          default: 'AUTOMATIC_PLATFORM_ALLOCATION',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            tooltip: this.$t(
              'packages_business_connection_form_access_node_tip',
            ),
          },
          'x-component': 'Select',
          enum: [
            {
              label: this.$t('packages_business_connection_form_automatic'),
              value: 'AUTOMATIC_PLATFORM_ALLOCATION',
            },
            {
              label: this.$t('packages_business_connection_form_manual'),
              value: 'MANUALLY_SPECIFIED_BY_THE_USER',
            },
          ],
          'x-reactions': [
            {
              dependencies: ['__TAPDATA.shareCdcEnable'],
              fulfill: {
                state: {
                  value: `{{!$isDaas && $deps[0] ? 'MANUALLY_SPECIFIED_BY_THE_USER' : $self.value}}`,
                  dataSource: `{{!$isDaas && $deps[0] ? [
                    { label: '${this.$t(
                      'packages_business_connection_form_automatic',
                    )}', value: 'AUTOMATIC_PLATFORM_ALLOCATION', disabled: true },
                    { label: '${this.$t(
                      'packages_business_connection_form_manual',
                    )}', value: 'MANUALLY_SPECIFIED_BY_THE_USER' }
                  ] : !$isDaas ? [
                    { label: '${this.$t(
                      'packages_business_connection_form_automatic',
                    )}', value: 'AUTOMATIC_PLATFORM_ALLOCATION' },
                    { label: '${this.$t(
                      'packages_business_connection_form_manual',
                    )}', value: 'MANUALLY_SPECIFIED_BY_THE_USER' }
                  ] : [
                    { label: '${this.$t(
                      'packages_business_connection_form_automatic',
                    )}', value: 'AUTOMATIC_PLATFORM_ALLOCATION' },
                    { label: '${this.$t(
                      'packages_business_connection_form_manual',
                    )}', value: 'MANUALLY_SPECIFIED_BY_THE_USER' },
                    {
                      label: '${this.$t('packages_business_connection_form_group')}',
                      value: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
                    }
                  ]}}`,
                },
              },
            },
            {
              target: '__TAPDATA.accessNodeProcessId',
              effects: ['onFieldInputValueChange'],
              fulfill: {
                state: {
                  value: '',
                  // value: `{{console.log("$target.dataSource", $target.dataSource), $target.value ? '' : $target.dataSource && $target.dataSource[0] ? $target.dataSource[0].value : ''}}`
                },
              },
            },
          ],
        },
        accessNodeOption: {
          type: 'string',
          'x-display': 'hidden',
          'x-reactions': [
            {
              dependencies: ['.accessNodeType'],
              fulfill: {
                state: {
                  visible:
                    "{{['MANUALLY_SPECIFIED_BY_THE_USER', 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'].includes($deps[0])}}",
                },
              },
            },
            '{{useAsyncDataSource(loadAccessNode, "dataSource", {value: $self.value})}}',
          ],
        },
        agentWrap: {
          type: 'void',
          'x-component': 'Space',
          'x-component-props': {
            class: 'w-100 align-items-start',
          },
          'x-reactions': {
            dependencies: ['.accessNodeType'],
            fulfill: {
              state: {
                visible:
                  "{{['MANUALLY_SPECIFIED_BY_THE_USER', 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'].includes($deps[0])}}",
              },
            },
          },
          properties: {
            accessNodeProcessId: {
              type: 'string',
              description: `{{$values.__TAPDATA.shareCdcEnable ? '${this.$t(
                'packages_business_agent_select_not_found_for_rocksdb',
              )}' : ''}}`,
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                colon: false,
                class: 'flex-1',
              },
              'x-component': 'Select',
              'x-component-props': {
                onChange: `{{ () => $self.setSelfErrors('') }}`,
              },
              'x-reactions': [
                // '{{useAsyncDataSource(loadAccessNode, "dataSource", {value: $self.value})}}',
                // 根据下拉数据判断是否存在已选的agent
                {
                  dependencies: [
                    '.accessNodeType',
                    '.accessNodeOption#dataSource',
                  ],
                  fulfill: {
                    state: {
                      title: `{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0] ? '${i18n.t(
                        'packages_business_choose_agent_group',
                      )}': '${i18n.t('packages_business_choose_agent')}'}}`,
                    },
                    run: `
                console.log('$deps[1]', $deps)
                if (!$deps[1]) return
                $self.dataSource = $deps[1].filter(item => item.accessNodeType === $deps[0])
                if ($self.dataSource?.length) {
                // $self.dataSource = $deps[1].filter(item => item.accessNodeType === $deps[0])
                if ($self.value) {
                  const current = $self.dataSource.find(item => item.value === $self.value)
                  if (!current) {
                    $self.setSelfErrors('${this.$t('packages_business_agent_select_not_found')}')
                  }
                }
              }`,
                  },
                },
              ],
              // 校验下拉数据判断是否存在已选的agent
              'x-validator': `{{(value, rule, ctx)=> {
            if (!value) {
              let msg = '${this.$t('packages_business_agent_select_placeholder')}'
              const {shareCDCExternalStorageId} = $values.__TAPDATA
              if (shareCDCExternalStorageId) {
                const dataSource = $form.query('__TAPDATA.shareCDCExternalStorageId').get('dataSource')
                const type = dataSource.find(item => item.value === shareCDCExternalStorageId)?.type
                if (type === 'rocksdb') msg = '${this.$t('packages_business_agent_select_not_found_for_rocksdb')}'
              }
              return msg
            } else if (value && ctx.field.dataSource?.length) {
              const current = ctx.field.dataSource.find(item => item.value === value)
              if (!current) {
                $self.setSelfErrors('')
                return '${this.$t('packages_business_agent_select_not_found')}'
              }
            }
          }}}`,
            },
            priorityProcessId: {
              title: i18n.t('packages_business_priorityProcessId'),
              type: 'string',
              default: '',
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                class: 'flex-1',
              },
              'x-component': 'Select',
              'x-reactions': {
                dependencies: [
                  '.accessNodeType',
                  '.accessNodeOption#dataSource',
                  '.accessNodeProcessId',
                ],
                fulfill: {
                  state: {
                    visible:
                      "{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0]}}",
                  },
                  run: `
                    let children = []

                    if ($deps[1] && $deps[2]) {
                      children = $deps[1].find(item => item.accessNodeType === $deps[0] && item.value === $deps[2]).children || []
                    }

                    $self.dataSource = [
                      {
                        label:'${i18n.t('packages_business_connection_form_automatic')}',
                        value: ''
                      }
                    ].concat(children)

                    if ($self.value && !children.find(item => item.value === $self.value)) {
                      $self.value = ''
                    }
                  `,
                },
              },
            },
          },
        },

        schemaUpdateHour: {
          type: 'string',
          title: i18n.t(
            'packages_business_connections_databaseform_moxingjiazaipin',
          ),
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-decorator-props': {
            tooltip: i18n.t(
              'packages_business_connections_databaseform_shujuyuanzhongmo',
            ),
          },
          default: '02:00',
          enum: [
            {
              label: i18n.t(
                'packages_business_connections_databaseform_bujiazai',
              ),
              value: 'false',
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
            '23:00',
          ],
        },
        heartbeatObject: !this.pdkOptions.tags?.includes('NoHeartbeat')
          ? {
              type: 'void',
              'x-component': 'Space',
              title: i18n.t(
                'packages_business_connections_databaseform_kaiqixintiaobiao',
              ),
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                tooltip: i18n.t(
                  'packages_business_connections_databaseform_dakaixintiaobiao',
                ),
              },
              properties: {
                heartbeatEnable: {
                  type: 'boolean',
                  default: false,
                  'x-component': 'Switch',
                },
              },
              'x-reactions': {
                dependencies: ['__TAPDATA.connection_type'],
                fulfill: {
                  state: {
                    display:
                      '{{$deps[0] === "source_and_target" ? "visible":"hidden"}}',
                  },
                },
              },
            }
          : undefined,
      })

      if (this.isDaas) {
        endProperties.schemaUpdateHour.default = 'default'
        endProperties.schemaUpdateHour.enum.unshift({
          label: i18n.t('packages_business_connections_databaseform_system'),
          value: 'default',
        })
        endProperties.accessNodeType.enum.push({
          label: this.$t('packages_business_connection_form_group'),
          value: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
        })
      }

      const connectionProperties =
        this.pdkOptions?.properties?.connection?.properties || {}
      const { OPTIONAL_FIELDS } = connectionProperties
      delete connectionProperties.OPTIONAL_FIELDS

      const result = {
        type: 'object',
        'x-component-props': {
          width: 500,
        },
        properties: {
          START: {
            type: 'void',
            'x-index': 0,
            'x-reactions': import.meta.env.VUE_APP_HIDE_CONNECTOR_SCHEMA
              ? {
                  target: import.meta.env.VUE_APP_HIDE_CONNECTOR_SCHEMA,
                  fulfill: {
                    state: {
                      display: 'hidden',
                    },
                  },
                }
              : undefined,
            properties: {
              __TAPDATA: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    title: this.$t('public_connection_name'),
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-validator': {
                      pattern:
                        /^([\u4E00-\u9FA5A-Z])([\w\s\-.\u4E00-\u9FA5])*$/i,
                      message: i18n.t(
                        'packages_business_connections_databaseform_mingchengguizezhong',
                      ),
                    },
                  },
                  connection_type: {
                    type: 'string',
                    title: this.$t('public_connection_type'),
                    required: true,
                    default: connectionType,
                    enum: typeEnum,
                    'x-hidden': hideConnectionType,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      feedbackLayout: 'none',
                    },
                    'x-component': 'Radio.Group',
                    'x-component-props': {
                      optionType: 'button',
                    },
                  },
                  connection_form_source_and_target_tip: {
                    type: 'void',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false,
                    },
                    'x-component': 'Text',
                    'x-component-props': {
                      icon: 'info',
                      content: this.$t(
                        'packages_business_connection_form_source_and_target_tip',
                      ),
                    },
                    'x-reactions': {
                      dependencies: ['__TAPDATA.connection_type'],
                      fulfill: {
                        schema: {
                          'x-decorator-props.style.display':
                            '{{$deps[0]==="source_and_target" ? null:"none"}}',
                        },
                      },
                    },
                  },
                  connection_form_source_tip: {
                    type: 'void',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false,
                    },
                    'x-component': 'Text',
                    'x-component-props': {
                      icon: 'info',
                      content: this.$t(
                        'packages_business_connection_form_source_tip',
                      ),
                    },
                    'x-reactions': {
                      dependencies: ['__TAPDATA.connection_type'],
                      fulfill: {
                        schema: {
                          'x-decorator-props.style.display':
                            '{{$deps[0]==="source" ? null:"none"}}',
                        },
                      },
                    },
                  },
                  connection_form_target_tip: {
                    type: 'void',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      colon: false,
                    },
                    'x-component': 'Text',
                    'x-component-props': {
                      icon: 'info',
                      content: this.$t(
                        'packages_business_connection_form_target_tip',
                      ),
                    },
                    'x-reactions': {
                      dependencies: ['__TAPDATA.connection_type'],
                      fulfill: {
                        schema: {
                          'x-decorator-props.style.display':
                            '{{$deps[0]==="target" ? null:"none"}}',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ...connectionProperties,
          END: {
            type: 'void',
            'x-index': 1000000,
            'x-component': 'FormCollapse',
            'x-component-props': {
              // class: 'border-bottom-0',
              activeKey: [],
            },
            properties: {
              advance: {
                type: 'void',
                'x-component': 'FormCollapse.Item',
                'x-component-props': {
                  title: i18n.t('public_advanced_settings'),
                },
                properties: {
                  OPTIONAL_FIELDS,
                  __TAPDATA: {
                    type: 'object',
                    // 'x-index': 1000000,
                    properties: endProperties,
                  },
                },
              },
              ssl: this.pdkOptions.tags?.includes('ssl')
                ? {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('public_ssl_settings'),
                    },
                    properties: {
                      useSSL: {
                        // 使用 SSL
                        title: i18n.t('packages_business_use_ssl'),
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'item-control-horizontal',
                          layout: 'horizontal',
                        },
                        'x-component': 'Switch',
                      },
                      sslCa: {
                        // CA 文件
                        title: i18n.t(
                          'packages_business_certificate_authority',
                        ),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'TextFileReader',
                        'x-component-props': {
                          base64: true,
                        },
                        fileNameField: 'sslCAFile',
                      },
                      sslCert: {
                        // 客户端证书文件
                        title: i18n.t('packages_business_client_certificate'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'TextFileReader',
                        'x-component-props': {
                          base64: true,
                        },
                        fileNameField: 'sslCertFile',
                      },
                      sslKey: {
                        // 客户端密钥文件
                        title: i18n.t('packages_business_client_key'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'TextFileReader',
                        'x-component-props': {
                          base64: true,
                        },
                        fileNameField: 'sslKeyFile',
                      },
                      sslKeyPassword: {
                        // 客户端密钥密码
                        title: i18n.t('packages_business_client_key_password'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Password',
                      },
                    },
                  }
                : undefined,
              ssh: this.pdkOptions.tags?.includes('ssh')
                ? {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('public_ssh_settings'),
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
                              layout: 'horizontal',
                            },
                            'x-component': 'Switch',
                          },
                          sshHost: {
                            // 主机名
                            title: i18n.t('packages_business_ssh_host'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Input',
                          },
                          sshPort: {
                            // 端口
                            title: i18n.t('packages_business_ssh_port'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                          },
                          sshUsername: {
                            // 用户名
                            title: i18n.t('packages_business_ssh_username'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Input',
                          },
                          sshPassword: {
                            // 密码
                            title: i18n.t('packages_business_ssh_password'),
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Password',
                          },
                        },
                      },
                    },
                  }
                : undefined,
            },
          },
        },
      }

      if (id) {
        await this.getPdkData(id)
        // 开启了共享挖掘
        const { shareCdcEnable, shareCDCExternalStorageId } = this.model
        if (shareCdcEnable && shareCDCExternalStorageId) {
          this.connectionLogCollectorTaskData =
            await connectionsApi.usingDigginTaskByConnectionId(id)
        }
        delete result.properties.START.properties.__TAPDATA.properties.name
      }

      // this.setConnectionConfig()

      this.schema = result
      this.loading = false
    },

    async save() {
      this.buried('connectionSubmit')
      await this.schemaFormInstance?.validate()
      // 保存数据源
      const id = this.id
      const { pdkOptions } = this
      const formValues = this.$refs.schemaToForm?.getFormValues?.()
      const { __TAPDATA } = formValues

      formValues.__connectionType = __TAPDATA.connection_type
      delete formValues.__TAPDATA

      const params = {
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
        config: formValues,
      }

      let promise = null

      if (id) {
        params.id = id
        promise = connectionsApi.updateById(id, params)
      } else {
        const { commandCallbackFunctionId } = this
        params.status = this.status ? this.status : 'testing' //默认值 0 代表没有点击过测试
        promise = connectionsApi.create(params, {
          id: commandCallbackFunctionId,
        })
      }

      return promise
        .then((data) => {
          this.buried('connectionSubmit', '', {
            result: true,
          })
          this.$message.success(this.$t('public_message_save_ok'))
          this.$emit('saved', data)
          return data
        })
        .catch(() => {
          this.buried('connectionSubmit', '', {
            result: false,
          })
        })
        .finally(() => {
          this.submitBtnLoading = false
          this.saveAndMoreLoading = false
        })
    },
  },
}
</script>

<template>
  <div class="flex gap-4 h-100">
    <div
      class="flex flex-column gap-4 flex-1 rounded-lg min-h-0 overflow-y-auto overflow-x-hidden"
    >
      <div class="p-4 bg-white rounded-lg">
        <slot name="header" />
        <div
          v-if="showIpTips"
          class="flex flex-column gap-2 mb-4 rounded-lg p-2 bg-color-primary-light-9"
        >
          <div class="flex align-items-start gap-1">
            <div class="p-1">
              <VIcon class="color-primary" :size="22">info</VIcon>
            </div>
            <div class="lh-base p-1 fw-sub">
              {{ $t('packages_business_agent_ip_tips_prefix') }}:
            </div>
          </div>

          <el-collapse
            value="1"
            class="rounded-lg overflow-hidden rounded-collapse"
          >
            <el-collapse-item title="TapData IP addresses" name="1">
              <ul class="ml-6 font-color-dark">
                <li>34.92.78.86</li>
                <li>39.106.147.20</li>
                <li>47.242.39.227</li>
              </ul>
            </el-collapse-item>
          </el-collapse>
        </div>

        <slot name="prepend" />
        <SchemaToForm
          ref="schemaToForm"
          class="pdk-schema-form form-wrap"
          :schema="schema"
          :scope="scope"
          layout="vertical"
          label-width="100%"
          feedback-layout="loose"
        />
      </div>

      <div
        class="position-sticky mt-auto z-index bottom-0 p-4 border backdrop-filter-light z-10 rounded-lg"
      >
        <slot name="footer" />
      </div>
    </div>
    <div class="flex-1 bg-white rounded-lg overflow-hidden">
      <ConnectorDoc
        v-if="pdkOptions"
        :pdk-hash="pdkOptions.pdkHash"
        :pdk-id="pdkOptions.pdkId"
      />
    </div>

    <Test ref="test" :connection="model" @return-test-data="returnTestData">
      <template #cancel="scope">
        <slot name="test-cancel" v-bind="scope" />
      </template>
    </Test>
  </div>
</template>

<style scoped lang="scss">
.rounded-collapse {
  :deep(.el-collapse-item__header) {
    height: 38px;
    padding: 0 16px;
    gap: 8px;
    font-weight: 400;
    &.is-active {
      color: var(--color-primary);
    }
  }
  :deep(.el-collapse-item__arrow) {
    order: -1;
    margin: 0;
  }
  :deep(.el-collapse-item__content) {
    padding: 0 16px 16px;
  }
}
.form-wrap {
  :deep(.formily-element-form-item-feedback-layout-loose) {
    margin-bottom: 20px;
  }

  :deep(.formily-element-form-item-layout-vertical) {
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

  :deep(.formily-element-form-collapse) {
    &.border-bottom-0 {
      :deep(.el-collapse-item__header) {
        border-bottom: none;
      }
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 0;
    }
  }

  // 覆盖数字输入框的宽度
  :deep(.formily-element-form-item) {
    font-size: var(--font-base-title);
    .formily-element-form-item-label {
      label {
        color: var(--text-light);
      }
    }
    .el-input-number {
      width: 180px;
    }
    .el-input-number--small {
      width: 130px;
    }

    .formily-element-form-item-help,
    .formily-element-form-item-extra {
      white-space: pre-wrap;
    }
  }

  :deep(.formily-element-form-item-layout-vertical) {
    .formily-element-form-item-label-tooltip {
      height: 40px;

      i {
        line-height: 1;
      }
    }
  }

  :deep(.formily-element-form-item-control) {
    .formily-element-space-horizontal {
      vertical-align: top;
    }
  }

  :deep(.formily-element-form-item:not(.form-item-text) + .form-item-text) {
    margin-top: 16px;
  }

  :deep(
    .form-item-dense
      .formily-element-form-item-control
      .formily-element-form-item-control-content
      .formily-element-form-item-control-content-component
  ) {
    min-height: unset;
    line-height: normal;
  }

  :deep(.form-item-text) {
    & + .form-item-text {
      margin-top: 8px;
    }
    margin-bottom: 0;
    .formily-element-form-item-label-content {
      min-height: unset;
      line-height: 1;
      label {
        line-height: 1;
      }
    }
  }
}
</style>
