<script>
import {
  fetchDatabases,
  fetchDatabaseTypes,
} from '@tap/api/src/core/database-types'
import {
  getConnectorRegistrationImpact,
  getConnectorRegistrationJob,
  getConnectorReleases,
  registerConnectorRelease,
} from '@tap/api/src/core/pdk'
import { getConnectorImage, getIcon } from '@tap/assets'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { IconButton } from '@tap/component/src/icon-button'

import i18n from '@tap/i18n'
import { mapGetters } from 'vuex'
import { DatabaseIcon } from '../DatabaseIcon'
import connectorCatalog from './connectorCatalog.json'
import ConnectorQualityBadge from './ConnectorQualityBadge.vue'
import ConnectorReleaseDialog from './ConnectorReleaseDialog.vue'
import RequestDialog from './RequestDialog.vue'
import ConnectionForm from './SceneForm'
import ServeForm from './ServeForm'

function compareConnectorVersions(left, right) {
  if (!left || !right) return 0
  const normalize = (version) =>
    String(version)
      .replace(/-SNAPSHOT.*$/i, '')
      .split('.')
      .map(Number)
  const leftParts = normalize(left)
  const rightParts = normalize(right)
  if ([...leftParts, ...rightParts].some((part) => !Number.isFinite(part))) {
    return 0
  }
  for (
    let index = 0;
    index < Math.max(leftParts.length, rightParts.length);
    index++
  ) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0)
    if (difference) return difference > 0 ? 1 : -1
  }
  return /-SNAPSHOT/i.test(right) && !/-SNAPSHOT/i.test(left) ? 1 : 0
}

export default {
  name: 'SceneDialog',
  components: {
    ConnectorQualityBadge,
    ConnectorReleaseDialog,
    RequestDialog,
    ConnectionForm,
    ServeForm,
    VEmpty,
    DatabaseIcon,
    IconButton,
  },
  inject: ['openLocked'],
  props: {
    visible: {
      required: true,
      value: Boolean,
    },
    type: {
      type: String,
      default: 'scene', // tag
    },
    selectorType: String,
    fixedPdkId: String,
    dialogMode: Boolean,
    width: { type: String, default: '80%' },
  },
  emits: [
    'update:visible',
    'update:selectorType',
    'visible',
    'selected',
    'success',
    'saveAndMore',
  ],
  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    const isCommunity = import.meta.env.VUE_APP_MODE === 'community'
    return {
      isDaas,
      isCommunity,
      search: '',
      formParams: {
        id: '',
        name: '',
        pdkHash: null,
        pdkId: null,
        md: null,
        isDemo: false,
      },
      selected: {},
      showForm: false,
      timer: null,
      activeTab: '',
      database: [],
      demoDatabase: [],
      databaseTypeMap: {},
      connectorReleaseRequestId: 0,
      connectorCatalogLoading: false,
      loading: false,
      releaseDialogVisible: false,
      releaseLoading: false,
      releaseImpactLoading: false,
      releaseItem: null,
      releaseImpactRequestId: 0,
      releaseImpactError: '',
      releaseRequestError: '',
      connectorPollingDisposed: false,
      releaseImpact: { tasks: [], inspects: [] },
      connectorJobs: {},
      connectorJobTimers: {},
      connectorJobsStorageKey: 'tapdata.connectorRegistrationJobs',
      showDialog: this.visible,
      sceneList: [
        {
          key: 'all',
          name: i18n.t('public_select_option_all'),
        },
        {
          key: 'recommend',
          name: i18n.t(
            'packages_business_create_connection_scenedialog_tuijianchangjing',
          ),
          types: [
            'Mysql',
            'Oracle',
            'SQL Server',
            'MongoDB',
            'MongoDB Atlas',
            'PostgreSQL',
            'Clickhouse',
            'Kafka-Enhanced',
            'Doris',
          ],
        },
        {
          key: 'api',
          name: i18n.t('packages_business_api_publish'),
          hidden: !isDaas /*,
        types: ['RESTful API', 'GraphQL']*/,
        },
        {
          name: i18n.t(
            'packages_business_create_connection_scenedialog_rushucang',
          ),
          types: [
            'BigQuery',
            'SelectDB',
            'Aliyun ADB MySQL', // pdk 里面仅支持作为源
            'Aliyun ADB PostgreSQL',
            'Tablestore',
            'Doris',
            'Clickhouse',
            'Databend',
          ],
        },
        {
          name: i18n.t(
            'packages_business_create_connection_scenedialog_chaxunjiasu',
          ),
          types: ['MongoDB', 'Redis', 'Elasticsearch'],
        },
        {
          key: 'Database',
          name: i18n.t(
            'packages_business_create_connection_scenedialog_shujukutongbu',
          ),
          types: ['MongoDB'],
        },
        {
          name: i18n.t(
            'packages_business_create_connection_scenedialog_guochantidai',
          ),
          types: [
            'Dameng',
            'GBase-8a',
            'KingBaseES-R3',
            'KingBaseES-R6',
            'Tidb',
            'Oceanbase',
          ],
        },
        {
          name: i18n.t(
            'packages_business_create_connection_scenedialog_duiliegongshu',
          ),
          types: ['Kafka', 'ActiveMQ', 'RocketMQ', 'RabbitMQ'],
        },
        {
          name: 'Reverse ETL',
          types: ['vika', 'QingCloud'],
        },
        {
          name: i18n.t(
            'packages_business_create_connection_scenedialog_gongzuoliu',
          ),
          types: ['Lark-IM', 'LarkTask'],
        },
      ],
      connectorDescMap: {
        BigQuery: i18n.t(
          'packages_business_create_connection_scenedialog_bigQu',
        ),
        MongoDB: i18n.t(
          'packages_business_create_connection_scenedialog_mongo',
        ),
        Redis: i18n.t('packages_business_create_connection_scenedialog_redis'),
        SelectDB: i18n.t(
          'packages_business_create_connection_scenedialog_selec',
        ),
        Tablestore: i18n.t(
          'packages_business_create_connection_scenedialog_table',
        ),
        Mysql: i18n.t('packages_business_create_connection_mysql_desc'),
        Oracle: i18n.t('packages_business_create_connection_oracle_desc'),
        'SQL Server': i18n.t(
          'packages_business_create_connection_sqlserver_desc',
        ),
        PostgreSQL: i18n.t(
          'packages_business_create_connection_postgresql_desc',
        ),
        Clickhouse: i18n.t(
          'packages_business_create_connection_clickhouse_desc',
        ),
        Elasticsearch: i18n.t(
          'packages_business_create_connection_elasticsearch_desc',
        ),
        Dummy: i18n.t('packages_business_create_connection_dummy_desc'),
        'Kafka-Enhanced': i18n.t(
          'packages_business_create_connection_kafka_desc',
        ),
        Doris: i18n.t('packages_business_create_connection_doris_desc'),
        'MongoDB Atlas': i18n.t(
          'packages_business_create_connection_mongodbatlas_desc',
        ),
      },
      currentScene: isDaas && !isCommunity ? 'installed' : 'recommend',
      lockedTypes:
        import.meta.env.VUE_APP_MODE === 'community'
          ? [
              {
                type: 'Aliyun RDS MySQL',
                name: 'Aliyun RDS MySQL',
                qcType: 'Alpha',
                icon: 'aliyun_rds_mssql.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'Dameng',
                name: 'Dameng',
                qcType: 'Beta',
                icon: 'dameng.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'DB2',
                name: 'DB2',
                qcType: 'Beta',
                icon: 'db2.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'GBase-8a',
                name: 'GBase-8a',
                qcType: 'Alpha',
                icon: 'gbase8a.png',
                tags: ['Database'],
                connectionType: 'target',
              },
              {
                type: 'GBase-8s',
                name: 'GBase-8s',
                qcType: 'Alpha',
                icon: 'gbase8s.png',
                tags: ['Database'],
                connectionType: 'target',
              },
              {
                type: 'Informix',
                name: 'Informix',
                qcType: 'GA',
                icon: 'informix.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'KingBaseES-R3',
                name: 'KingBaseES-R3',
                qcType: 'Alpha',
                icon: 'kingbaser3.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'KingBaseES-R6',
                name: 'KingBaseES-R6',
                qcType: 'Beta',
                icon: 'kingbaser6.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'Oracle',
                name: 'Oracle',
                qcType: 'GA',
                icon: 'oracle.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'SQL Server',
                name: 'SQL Server',
                qcType: 'GA',
                icon: 'mssql.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'Sybase',
                name: 'Sybase',
                qcType: 'Beta',
                icon: 'sybase.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'TencentDB SQL Server',
                name: 'TencentDB SQL Server',
                qcType: 'Alpha',
                icon: 'tencent_db_mssql.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'TencentDB TD-SQL',
                name: 'TencentDB TD-SQL',
                qcType: 'Alpha',
                icon: 'tencent_db_mysql.png',
                tags: ['Database'],
                connectionType: 'source_and_target',
              },
              {
                type: 'Alibaba 1688',
                name: 'Alibaba 1688',
                qcType: 'Alpha',
                icon: 'alibaba.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'BesChannels',
                name: 'BesChannels',
                qcType: 'Alpha',
                icon: 'bes-channels.png',
                tags: ['SaaS'],
                connectionType: 'target',
              },
              {
                type: 'Coding',
                name: 'Coding',
                qcType: 'Beta',
                icon: 'coding.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Feishu-Bitable',
                name: 'Feishu-Bitable',
                qcType: 'Alpha',
                icon: 'bitable.png',
                tags: ['SaaS'],
                connectionType: 'source_and_target',
              },
              {
                type: 'HubSpot',
                name: 'HubSpot',
                qcType: 'Beta',
                icon: 'hubspot.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Lark Approval',
                name: 'Lark Approval',
                qcType: 'Alpha',
                icon: 'task.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Lark Doc',
                name: 'Lark Doc',
                qcType: 'Alpha',
                icon: 'lark-doc.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Lark-IM',
                name: 'Lark-IM',
                qcType: 'Beta',
                icon: 'lark.png',
                tags: ['SaaS'],
                connectionType: 'target',
              },
              {
                type: 'LarkTask',
                name: 'LarkTask',
                qcType: 'Beta',
                icon: 'task.png',
                tags: ['SaaS'],
                connectionType: 'target',
              },
              {
                type: 'Salesforce',
                name: 'Salesforce',
                qcType: 'Beta',
                icon: 'Salesforce-Logo.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Shein',
                name: 'Shein',
                qcType: 'Alpha',
                icon: 'shein.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Zoho-CRM',
                name: 'Zoho-CRM',
                qcType: 'Alpha',
                icon: 'zoho.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
              {
                type: 'Zoho-Desk',
                name: 'Zoho-Desk',
                qcType: 'Beta',
                icon: 'zoho_desk.png',
                tags: ['SaaS'],
                connectionType: 'source',
              },
            ]
          : [],
      tagList: [
        {
          key: 'all',
          name: i18n.t('public_select_option_all'),
        },
        {
          key: 'recommend',
          name: i18n.t('public_recommend'),
        },
        {
          name: i18n.t('public_database'),
          key: 'Database',
        },
        {
          name: 'SaaS',
          key: 'SaaS',
        },
        {
          name: i18n.t('public_file'),
          key: 'File',
        },
        {
          name: i18n.t(
            'packages_business_components_connectiontypeselectorsort_wodeshujuyuan',
          ),
          key: 'Custom',
        },
      ],
      specialScene: {
        api: [
          {
            key: 'apiApp',
            icon: 'mini-app',
            name: this.$t('public_api_group'),
            md: this.$t('packages_business_api_application_md'),
          },
        ],
      },
      modalClass: '',
      requestVisible: false,
      requestMeta: {
        type: '',
        version: '',
        qcType: '',
      },
      onlyForm: false,
    }
  },
  computed: {
    ...mapGetters('feature', ['isControlEnabled', 'connectors']),
    usesConnectorCatalog() {
      return this.isDaas && !this.isCommunity
    },
    installedConnectorCount() {
      return this.database.filter((item) => !item.requiresDownload).length
    },
    startingTour() {
      return this.$store.getters.startingTour
    },
    pausedGuide() {
      return this.$store.getters.pausedGuide
    },
    sceneMap() {
      return this.sceneList.reduce((obj, item) => {
        obj[item.key || item.name] = item.types
        return obj
      }, {})
    },
    sceneDatabases() {
      if (this.search) {
        const search = this.search.toLowerCase()
        return this.database.filter((db) =>
          db.name.toLowerCase().includes(search),
        )
      }

      const { currentScene } = this

      if (this.usesConnectorCatalog && currentScene === 'installed') {
        return this.database.filter((item) => !item.requiresDownload)
      }

      if (currentScene === 'all') {
        return this.database
      }

      if (currentScene === 'locked') {
        return this.lockedTypes
      }

      if (
        currentScene === 'recommend' ||
        (!this.usesConnectorCatalog &&
          this.selectorType === 'target' &&
          currentScene !== 'Database')
      ) {
        const types = this.sceneMap[this.currentScene] || []
        const arr = []

        if (!types.length) return arr

        types.forEach((type) => {
          const item = this.databaseTypeMap[type]
          item && arr.push(item)
        })

        return arr
      }

      return this.database.filter((db) => db.tags?.includes(currentScene))
    },
    connectorSections() {
      if (!this.sceneDatabases.length) return []
      if (!this.usesConnectorCatalog || !this.search) {
        return [{ key: 'current', items: this.sceneDatabases }]
      }
      return [
        {
          key: 'installed',
          title: 'packages_business_connector_installed',
          items: this.sceneDatabases.filter((item) => !item.requiresDownload),
        },
        {
          key: 'available',
          title: 'packages_business_connector_available',
          items: this.sceneDatabases.filter((item) => item.requiresDownload),
        },
      ].filter((section) => section.items.length)
    },
    showSpecialScene() {
      return (
        !!this.specialScene?.[this.currentScene] &&
        (!this.usesConnectorCatalog || !this.search)
      )
    },
    connectorListLoading() {
      return (
        this.loading ||
        (this.usesConnectorCatalog &&
          this.connectorCatalogLoading &&
          (this.currentScene !== 'installed' || !!this.search) &&
          !this.showSpecialScene &&
          this.sceneDatabases.length === 0)
      )
    },
    showInstalledEmptyState() {
      return (
        this.usesConnectorCatalog &&
        this.currentScene === 'installed' &&
        !this.search &&
        !this.loading &&
        this.installedConnectorCount === 0
      )
    },
    connectorEmptyMessage() {
      return this.$t(
        this.showInstalledEmptyState
          ? 'packages_business_connector_none_installed'
          : 'packages_business_connector_no_matches',
      )
    },
    canResetConnectorFilters() {
      return this.currentScene !== 'all' || !!this.search
    },
    options() {
      const list =
        !this.usesConnectorCatalog && this.selectorType === 'target'
          ? this.sceneList
          : this.tagList
      const options = list.filter((item) => !item.hidden)
      if (this.usesConnectorCatalog) {
        if (this.selectorType === 'target') {
          options.push(
            ...this.sceneList.filter(
              (item) => item.key === 'api' && !item.hidden,
            ),
          )
        }
        return options.map((item) =>
          item.key === 'all'
            ? {
                ...item,
                name: this.$t('packages_business_connector_all_types'),
              }
            : item,
        )
      }
      return options
    },
    title() {
      if (this.selectorType === 'target') {
        return this.$t(
          'packages_business_create_connection_scenedialog_qingxuanzeninde',
        )
      }
      return this.$t('packages_business_create_connection_title_select_type')
    },

    showDemoConnection() {
      return (
        !this.usesConnectorCatalog &&
        this.startingTour &&
        !this.pausedGuide &&
        this.currentScene === 'recommend' &&
        !this.search
      )
    },
  },
  watch: {
    async visible(v) {
      this.showDialog = v
      this.showForm = false
      Object.assign(this.formParams, {
        id: '',
        name: '',
        pdkHash: null,
        pdkId: null,
        pdkOptions: null,
      })
      if (v) {
        this.modalClass = ''
        this.resetConnectorBrowser()

        if (this.fixedPdkId) {
          this.onlyForm = true
          this.loading = true
          this.showForm = true
          const pdk = await this.getPdkById(this.fixedPdkId)

          if (!pdk) return

          this.formParams.pdkHash = pdk.pdkHash
          this.formParams.pdkId = pdk.pdkId
        } else {
          this.onlyForm = false
          this.getData()
        }
      }
    },
    showDialog(v) {
      this.$emit('update:visible', v)
    },
  },
  mounted() {
    if (this.isDaas && !this.isCommunity) this.restoreConnectorJobs()
    const { type, pdkHash, pdkId } = this.$route.query

    // add-source/add-target
    if (type?.startsWith('add-') && this.selectorType !== 'source_and_target') {
      this.$emit('update:selectorType', type.split('-').pop())
      this.showDialog = true
      this.$nextTick(() => {
        this.formParams.pdkHash = pdkHash
        this.formParams.pdkId = pdkId
        this.showForm = true
      })
    }
  },
  beforeUnmount() {
    this.connectorPollingDisposed = true
    Object.values(this.connectorJobTimers).forEach(clearTimeout)
  },
  methods: {
    getReleaseErrorMessage(error) {
      return (
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        this.$t('packages_business_connector_release_failed')
      )
    },

    getConnectorImage,
    getIcon,
    init() {
      this.showForm = false
      Object.assign(this.formParams, {
        id: '',
        name: '',
        pdkHash: null,
        pdkId: null,
        pdkOptions: null,
      })
    },

    editConnection(data) {
      this.$emit('update:visible', true)

      this.$nextTick(() => {
        this.showForm = true
        this.formParams.pdkHash = data.pdkHash
        this.formParams.pdkId = data.pdkId
        this.formParams.id = data.id
        this.onlyForm = true
      })
    },

    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },

    restoreConnectorJobs() {
      try {
        const jobs = JSON.parse(
          window.localStorage.getItem(this.connectorJobsStorageKey) || '{}',
        )
        if (!jobs || typeof jobs !== 'object' || Array.isArray(jobs)) return
        this.connectorJobs = Object.fromEntries(
          Object.entries(jobs).filter(
            ([, job]) =>
              job &&
              typeof job.jobId === 'string' &&
              !['completed', 'failed'].includes(job.status),
          ),
        )
        Object.entries(this.connectorJobs).forEach(([pdkId, job]) => {
          this.pollConnectorRegistration(job.jobId, pdkId)
        })
      } catch (error) {
        console.warn('Unable to restore connector registration progress', error)
        this.connectorJobs = {}
      }
    },

    persistConnectorJobs(jobs = this.connectorJobs) {
      const activeJobs = Object.fromEntries(
        Object.entries(jobs).filter(
          ([, job]) => !['completed', 'failed'].includes(job.status),
        ),
      )
      try {
        if (Object.keys(activeJobs).length) {
          window.localStorage.setItem(
            this.connectorJobsStorageKey,
            JSON.stringify(activeJobs),
          )
        } else {
          window.localStorage.removeItem(this.connectorJobsStorageKey)
        }
      } catch (error) {
        console.warn('Unable to persist connector registration progress', error)
      }
    },

    removeConnectorJob(pdkId) {
      const remainingJobs = { ...this.connectorJobs }
      delete remainingJobs[pdkId]
      this.connectorJobs = remainingJobs
      this.persistConnectorJobs(remainingJobs)
    },

    onClosed() {
      this.showForm = false
    },

    async handleSelect(item, isDemo = false) {
      if (item.licenseLocked) {
        this.openLocked()
        return
      }
      const job = this.getConnectorJob(item)
      if (job && !['completed', 'failed'].includes(job.status)) {
        this.handleReleaseAction(item)
        return
      }
      if (item.requiresDownload) {
        this.handleReleaseAction(item)
        return
      }

      if (item.locked) {
        this.openLocked()
        return
      }

      if (item.qcType !== 'GA' && !this.isDaas) {
        Object.assign(this.requestMeta, {
          qcType: item.qcType,
          type: item.type,
          version: item.version,
        })
        const time = Date.now()
        const msg = this.$message.info(this.$t('public_please_wait'))
        const ifOpen = await this.$refs.requestDialog.handleOpen()
        // 延迟关闭，避免消息一闪而过
        setTimeout(
          () => {
            msg.close()
          },
          Math.max(600 - (Date.now() - time), 0),
        )
        if (ifOpen) return
      }

      if (this.selectorType === 'source_and_target' && !this.dialogMode) {
        this.$emit('selected', item)
        return
      }

      Object.assign(this.formParams, {
        name: item.name,
        icon: null,
        pdkHash: item.pdkHash,
        pdkId: item.pdkId,
        pdkOptions: item,
        isDemo,
      })
      this.selected = item
      this.showForm = true

      if (isDemo) {
        this.$nextTick(() => {
          setTimeout(() => {
            const { demoDatabase } = this.$store.state.config
            this.$refs.connectionForm.schemaFormInstance.setValues({
              __TAPDATA: {
                name: `${item.name}Demo`,
              },
              ...demoDatabase[item.pdkId],
            })
            this.$refs.connectionForm.schemaFormInstance.setFieldState(
              '*(!START.__TAPDATA.name)',
              {
                disabled: true,
              },
            )
          }, 0)
        })
      }
    },

    handleSelectSpecial(item) {
      Object.assign(this.formParams, {
        ...item,
        pdkHash: null,
        pdkId: null,
        pdkOptions: null,
      })
      this.showForm = true
    },

    handleSuccess(...args) {
      this.$emit('success', ...args)
      this.init()
      this.handleClose()
    },

    handleSaveAndMore(...args) {
      this.$emit('saveAndMore', ...args)
      this.init()
    },

    handleSelectScene(item) {
      this.search = ''
      this.currentScene = item.key || item.name
      this.resetScroll()
    },

    resetConnectorBrowser() {
      this.search = ''
      this.currentScene = this.usesConnectorCatalog ? 'installed' : 'recommend'
    },

    getConnectorJob(item) {
      const job = this.connectorJobs[item.pdkId]
      return job?.status === 'completed' &&
        item.updateAvailable &&
        job.releaseVersion !== item.releaseVersion
        ? undefined
        : job
    },

    showConnectorAction(item) {
      const job = this.getConnectorJob(item)
      return (
        job?.status !== 'completed' &&
        Boolean(job || item.requiresDownload || item.updateAvailable)
      )
    },

    connectorJobProgress(item) {
      return Math.max(
        0,
        Math.min(100, Number(this.getConnectorJob(item)?.progress) || 0),
      )
    },

    connectorActionLabel(item) {
      const job = this.getConnectorJob(item)
      if (job?.status === 'failed') return this.$t('public_button_retry')
      if (job)
        return new Intl.NumberFormat(this.$i18n.locale, {
          style: 'percent',
          maximumFractionDigits: 0,
        }).format((Number(job.progress) || 0) / 100)
      return this.$t(
        item.requiresDownload
          ? 'packages_business_connector_install'
          : 'packages_business_connector_update_available',
      )
    },

    connectorActionDisabledReason(item) {
      if (item.licenseLocked)
        return this.$t('packages_business_connector_license_required')
      if (!item.releaseAvailable && !this.getConnectorJob(item))
        return this.$t('packages_business_connector_no_release')
      return ''
    },

    async handleReleaseAction(item) {
      if (item.licenseLocked) {
        this.openLocked()
        return
      }
      if (this.releaseLoading) return
      const job = this.getConnectorJob(item)
      if (!job && !item.releaseAvailable) return
      this.releaseItem = {
        ...item,
        requiresDownload: job?.operation
          ? job.operation === 'install'
          : item.requiresDownload,
      }
      this.releaseDialogVisible = true
      this.releaseRequestError = ''
      this.releaseImpactError = ''
      if (job) {
        this.releaseImpactLoading = false
        return
      }
      // A new formal release can supersede a result retained in this session.
      if (this.connectorJobs[item.pdkId]) this.removeConnectorJob(item.pdkId)
      const requestId = ++this.releaseImpactRequestId
      this.releaseImpact = { tasks: [], inspects: [] }
      this.releaseImpactLoading = true
      try {
        const impact = await getConnectorRegistrationImpact(
          item.pdkId,
          item.artifactId,
        )
        if (
          requestId !== this.releaseImpactRequestId ||
          this.releaseItem?.pdkId !== item.pdkId
        )
          return
        this.releaseImpact = {
          tasks: impact?.tasks || [],
          inspects: impact?.inspects || [],
        }
      } catch (error) {
        if (
          requestId === this.releaseImpactRequestId &&
          this.releaseItem?.pdkId === item.pdkId
        )
          this.releaseImpactError = this.getReleaseErrorMessage(error)
      } finally {
        if (
          requestId === this.releaseImpactRequestId &&
          this.releaseItem?.pdkId === item.pdkId
        )
          this.releaseImpactLoading = false
      }
    },

    async retryConnectorRelease() {
      if (!this.releaseItem) return
      const pdkId = this.releaseItem.pdkId
      const job = this.connectorJobs[pdkId]
      const item = {
        ...this.releaseItem,
        ...this.database?.find((db) => db.pdkId === pdkId),
      }
      if (!item.releaseAvailable && job?.releaseVersion) {
        item.releaseAvailable = true
        item.releaseVersion = job.releaseVersion
        item.artifactId = job.artifactId
      }
      this.removeConnectorJob(pdkId)
      await this.handleReleaseAction(item)
    },

    async resumeConnectorPolling() {
      const pdkId = this.releaseItem?.pdkId
      const job = this.connectorJobs[pdkId]
      if (job) {
        this.connectorJobs = {
          ...this.connectorJobs,
          [pdkId]: { ...job, pollError: '' },
        }
        await this.pollConnectorRegistration(job.jobId, pdkId)
      }
    },

    async registerRelease(stopTasks) {
      if (
        !this.releaseItem ||
        this.releaseLoading ||
        this.releaseImpactLoading ||
        this.releaseImpactError
      )
        return
      const releaseItem = this.releaseItem
      const activeJob = this.connectorJobs[releaseItem.pdkId]
      if (activeJob && !['completed', 'failed'].includes(activeJob.status))
        return
      this.releaseLoading = true
      this.releaseRequestError = ''
      try {
        const job = await registerConnectorRelease({
          pdkId: releaseItem.pdkId,
          artifactId: releaseItem.artifactId,
          stopTasks,
          ignoreInFlightResources:
            !stopTasks &&
            (this.releaseImpact.tasks.length > 0 ||
              this.releaseImpact.inspects.length > 0),
        })
        this.connectorJobs = {
          ...this.connectorJobs,
          [releaseItem.pdkId]: {
            ...job,
            artifactId: releaseItem.artifactId,
            operation: releaseItem.requiresDownload ? 'install' : 'update',
            version: releaseItem.version,
            releaseVersion: releaseItem.releaseVersion,
            name: releaseItem.name,
            icon: releaseItem.icon,
            stopTasks,
          },
        }
        this.persistConnectorJobs()
        if (!this.releaseDialogVisible)
          this.$message.info(
            this.$t('packages_business_connector_release_started'),
          )
        this.pollConnectorRegistration(job.jobId, releaseItem.pdkId)
      } catch (error) {
        this.releaseRequestError = this.getReleaseErrorMessage(error)
        if (!this.releaseDialogVisible)
          this.$message.error(this.releaseRequestError)
      } finally {
        this.releaseLoading = false
      }
    },

    async pollConnectorRegistration(jobId, pdkId, retryCount = 0) {
      clearTimeout(this.connectorJobTimers[pdkId])
      delete this.connectorJobTimers[pdkId]
      if (this.connectorPollingDisposed) return
      try {
        const job = await getConnectorRegistrationJob(jobId)
        if (
          this.connectorPollingDisposed ||
          this.connectorJobs[pdkId]?.jobId !== jobId
        )
          return
        const activeJob = this.connectorJobs[pdkId]
        this.connectorJobs = {
          ...this.connectorJobs,
          [pdkId]: { ...activeJob, ...job, pollError: '' },
        }
        this.persistConnectorJobs()
        if (job.status === 'completed') {
          if (!this.releaseDialogVisible || this.releaseItem?.pdkId !== pdkId)
            this.$message.success(
              this.$t('packages_business_connector_release_success'),
            )
          await this.getData(true).catch((error) =>
            console.warn('Unable to refresh installed connectors', error),
          )
          if (
            this.usesConnectorCatalog &&
            activeJob.operation === 'install' &&
            this.releaseDialogVisible &&
            this.releaseItem?.pdkId === pdkId
          ) {
            this.handleSelectScene({ key: 'installed' })
          }
          return
        }
        if (job.status === 'failed') {
          if (job.errorCode === 'RESOURCE_IMPACT_CHANGED') {
            if (
              this.releaseLoading ||
              (this.releaseDialogVisible && this.releaseItem?.pdkId !== pdkId)
            ) {
              this.$message.error(
                job.error ||
                  this.$t('packages_business_connector_impact_changed'),
              )
              return
            }
            // Recovery belongs to this job, even if another connector was selected meanwhile.
            const item = {
              ...connectorCatalog.find((db) => db.pdkId === pdkId),
              ...this.database?.find((db) => db.pdkId === pdkId),
              pdkId,
              releaseAvailable: true,
              artifactId: activeJob.artifactId,
              releaseVersion: activeJob.releaseVersion,
              requiresDownload: activeJob.operation === 'install',
            }
            this.removeConnectorJob(pdkId)
            await this.handleReleaseAction(item)
            this.releaseRequestError = this.$t(
              'packages_business_connector_impact_changed',
            )
            return
          }
          if (!this.releaseDialogVisible || this.releaseItem?.pdkId !== pdkId)
            this.$message.error(
              job.error ||
                this.$t('packages_business_connector_release_failed'),
            )
          return
        }
      } catch (error) {
        if (
          this.connectorPollingDisposed ||
          this.connectorJobs[pdkId]?.jobId !== jobId
        )
          return
        const status = error?.response?.status || error?.status || error?.code
        if (status === 404 || status === '404') {
          this.connectorJobs = {
            ...this.connectorJobs,
            [pdkId]: {
              ...this.connectorJobs[pdkId],
              status: 'failed',
              error: this.$t('packages_business_connector_job_unavailable'),
            },
          }
          this.persistConnectorJobs()
          return
        }
        if (retryCount >= 10) {
          this.connectorJobs = {
            ...this.connectorJobs,
            [pdkId]: {
              ...this.connectorJobs[pdkId],
              pollError: this.$t(
                'packages_business_connector_poll_unavailable',
              ),
            },
          }
          this.persistConnectorJobs()
          return
        }
        console.warn('Unable to read connector registration progress', error)
        this.connectorJobTimers[pdkId] = setTimeout(
          () => this.pollConnectorRegistration(jobId, pdkId, retryCount + 1),
          1200,
        )
        return
      }
      if (!this.connectorPollingDisposed)
        this.connectorJobTimers[pdkId] = setTimeout(
          () => this.pollConnectorRegistration(jobId, pdkId, 0),
          1200,
        )
    },

    resetScroll() {
      if (this.$refs?.connectorContainer)
        this.$refs.connectorContainer.scrollTop = 0
    },

    async getData(noLoading = false) {
      const params = {
        where: {
          tag: 'All',
          authentication: 'All',
        },
        order: 'name ASC',
      }
      if (!noLoading) this.loading = true
      const res = await fetchDatabases(params)
      const registeredData =
        this.selectorType !== 'source_and_target'
          ? res?.filter(
              (t) =>
                t.connectionType.includes(this.selectorType) && !!t.pdkHash,
            ) || []
          : res

      let data = registeredData
      const enterpriseCatalog = this.isDaas && !this.isCommunity
      const releaseRequestId = enterpriseCatalog
        ? ++this.connectorReleaseRequestId
        : 0
      if (enterpriseCatalog) {
        data = this.buildEnterpriseConnectorList(res || [])
      }

      this.databaseTypeMap = data.reduce(
        (map, db) => ((map[db.type] = db), map),
        {},
      )

      const sortFn = (o1, o2) => {
        const qcTypeLevel = {
          GA: 1,
          Beta: 2,
          Alpha: 3,
        }
        const o1Level = qcTypeLevel[o1.qcType] || 4
        const o2Level = qcTypeLevel[o2.qcType] || 4

        if (o1Level === o2Level) {
          return o1.name.localeCompare(o2.name)
        }

        return o1Level - o2Level
      }

      if (this.isDaas && !this.isCommunity) {
        this.lockedTypes = data.filter((item) => item.licenseLocked)
      } else if (this.isControlEnabled) {
        this.lockedTypes = data.filter((item) => {
          const enabled = this.connectors.includes(item.type)

          if (!enabled) {
            item.locked = true
          }

          return !enabled
        })
      } else {
        // 过滤掉已注册的
        this.lockedTypes = this.lockedTypes
          .filter((item) => {
            item.locked = true // 标记上锁
            return (
              !this.databaseTypeMap[item.type] &&
              ((this.selectorType !== 'source_and_target' &&
                item.connectionType.includes(this.selectorType)) ||
                this.selectorType === 'source_and_target')
            )
          })
          .sort(sortFn)

        // 合并到已注册
        data.push(...this.lockedTypes)
      }

      this.database = data.sort(sortFn)

      if (this.selectorType === 'source') {
        this.demoDatabase = [data.find((t) => t.pdkId === 'mysql')]
      } else if (this.selectorType === 'target') {
        this.demoDatabase = [data.find((t) => t.pdkId === 'mongodb')]
      }

      this.loading = false

      // Nexus is optional for rendering the connection list. Fetch its release
      // metadata after the locally available connectors are already usable.
      if (enterpriseCatalog) {
        this.connectorCatalogLoading = true
        getConnectorReleases()
          .then((releases) => {
            if (releaseRequestId !== this.connectorReleaseRequestId) return
            this.database = this.buildEnterpriseConnectorList(
              res || [],
              releases,
            ).sort(sortFn)
            this.lockedTypes = this.database.filter(
              (item) => item.licenseLocked,
            )
            this.databaseTypeMap = this.database.reduce(
              (map, db) => ((map[db.type] = db), map),
              {},
            )
          })
          .catch((error) => {
            if (releaseRequestId !== this.connectorReleaseRequestId) return
            console.warn(
              'Unable to load the Nexus connector release catalog',
              error,
            )
          })
          .finally(() => {
            if (releaseRequestId === this.connectorReleaseRequestId)
              this.connectorCatalogLoading = false
          })
      }
    },

    buildEnterpriseConnectorList(registeredData, releases = []) {
      const installedById = new Map(
        registeredData.map((item) => [item.pdkId, item]),
      )
      const releaseByArtifact = new Map(
        (releases || []).map((release) => [release.artifactId, release]),
      )
      const knownPdkIds = new Set()
      const catalogItems = connectorCatalog.map((metadata) => {
        const installed = installedById.get(metadata.pdkId)
        knownPdkIds.add(metadata.pdkId)
        const release = releaseByArtifact.get(metadata.artifactId)
        return {
          ...metadata,
          ...installed,
          pdkId: metadata.pdkId,
          releaseVersion: release?.version,
          releaseAvailable: !!release,
          requiresDownload: !installed,
          locked: !installed,
          updateAvailable:
            !!installed &&
            !!release &&
            compareConnectorVersions(release.version, installed.version) > 0,
        }
      })

      // Keep manually registered or custom connectors even when the catalog
      // does not know their artifact id, or Nexus is unavailable.
      const unlistedInstalled = registeredData.filter(
        (item) => !knownPdkIds.has(item.pdkId),
      )
      return [...catalogItems, ...unlistedInstalled]
        .filter(
          (item) =>
            !item.requiresDownload ||
            item.releaseAvailable ||
            !!this.connectorJobs[item.pdkId],
        )
        .filter(
          (item) =>
            this.selectorType === 'source_and_target' ||
            (item.connectionType?.includes(this.selectorType) &&
              (item.requiresDownload || !!item.pdkHash)),
        )
        .map((item) => {
          const licenseLocked =
            this.isControlEnabled && !this.connectors.includes(item.type)
          return {
            ...item,
            licenseLocked,
            locked: licenseLocked || item.locked,
            updateAvailable: !licenseLocked && item.updateAvailable,
          }
        })
    },

    handleSearchInput() {
      this.resetScroll()
    },

    async getPdkById(id) {
      this.loading = true
      const data = await fetchDatabaseTypes({
        where: {
          pdkId: id,
        },
      })
      this.loading = false
      return data?.[0]
    },

    beforeClose(done) {
      if (this.startingTour) {
        this.modalClass = 'dialog-zoom-transition' // 暂停引导让 dialog 有缩放动画
        const icon = document.querySelector('#user-guide-icon')
        if (icon) {
          const windowWidth = document.documentElement.clientWidth
          const windowHeight = document.documentElement.clientHeight
          const iconStyle = window.getComputedStyle(icon)
          const iconX =
            Number.parseInt(iconStyle.left) +
            Number.parseInt(iconStyle.width) / 2
          const iconY =
            windowHeight -
            Number.parseInt(iconStyle.bottom) -
            Number.parseInt(iconStyle.height) / 2
          const dialog = this.$refs.dialogWrapper.dialogContentRef.$el
          const computedStyle = window.getComputedStyle(dialog)
          let width = computedStyle.width
          if (width.endsWith('px')) {
            width = Number.parseInt(width)
          } else if (width.endsWith('%')) {
            width = (Number.parseInt(width) / 100) * windowWidth
          }
          const transformOriginX = iconX - (windowWidth - width) / 2
          const transformOriginY =
            iconY - Number.parseInt(computedStyle.marginTop)
          dialog.style.transformOrigin = `${transformOriginX}px ${transformOriginY}px`
        }
        this.$store.commit('pauseTour')
        this.$store.commit('pauseGuide')
      }

      done()
    },

    openGithub() {
      window.open('https://github.com/tapdata/tapdata-connectors', '_blank')
    },
  },
}
</script>

<template>
  <ElDialog
    ref="dialogWrapper"
    :model-value="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="width"
    top="10vh"
    :modal-class="modalClass"
    class="ldp-connection-dialog flex flex-column p-0"
    :before-close="beforeClose"
    @close="handleClose"
    @closed="onClosed"
  >
    <template #header>
      <div
        class="flex px-6 h-100 font-color-dark fs-6 fw-sub position-relative align-center"
      >
        <template v-if="!showForm">
          <span>{{ title }}</span>
          <ElInput
            v-model="search"
            class="position-absolute start-50 top-50 translate-middle ldp-connection-search-input"
            clearable
            :placeholder="$t('public_input_placeholder_search')"
            @input="handleSearchInput"
          >
            <template #prefix>
              <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
            </template>
          </ElInput>
        </template>
        <template v-else>
          <IconButton v-if="!onlyForm" class="mr-2" @click="showForm = false"
            >left</IconButton
          >
          <DatabaseIcon
            v-if="formParams.pdkHash"
            class="mr-2"
            :size="24"
            :item="formParams"
          />
          <VIcon v-else class="mr-2" :size="24">{{ formParams.icon }}</VIcon>
          <span>{{ formParams.name }}</span>
        </template>
      </div>
    </template>
    <div v-if="!showForm" class="flex flex-1 min-h-0 border-top">
      <div
        class="flex flex-column border-end scene-name-list-wrap overflow-x-hidden pt-4 pb-2"
        :class="{
          'is-en': $i18n.locale === 'en',
        }"
      >
        <div class="scene-name-list overflow-y-auto">
          <button
            v-if="usesConnectorCatalog"
            type="button"
            class="scene-name-item connector-installed-option px-4 rounded-lg user-select-none cursor-pointer flex align-center"
            :class="{ active: currentScene === 'installed' && !search }"
            :aria-pressed="currentScene === 'installed' && !search"
            @click="handleSelectScene({ key: 'installed' })"
          >
            <span>{{ $t('packages_business_connector_installed') }}</span>
          </button>
          <div
            v-if="lockedTypes.length"
            class="scene-name-item px-4 rounded-lg user-select-none ellipsis cursor-pointer flex align-center"
            :class="{ active: currentScene === 'locked' && !search }"
            @click="
              handleSelectScene({
                key: 'locked',
              })
            "
          >
            <VIcon size="18" class="mr-1">lock-circle</VIcon>
            {{ $t('packages_business_paid_connector') }}
          </div>

          <template v-if="isCommunity">
            <div
              class="scene-name-item px-4 rounded-lg user-select-none ellipsis cursor-pointer flex align-center"
              @click="openGithub"
            >
              <VIcon size="16" class="mr-1">github</VIcon>
              {{ $t('packages_business_more_free_connector') }}
              <VIcon size="16" class="ml-1">open-in-new</VIcon>
            </div>

            <div class="px-2">
              <ElDivider class="my-2" />
            </div>
          </template>

          <div
            v-for="(item, i) in options"
            :key="i"
            class="scene-name-item px-4 rounded-lg user-select-none ellipsis cursor-pointer"
            :class="{
              active:
                (currentScene === item.key || currentScene === item.name) &&
                !search,
            }"
            @click="handleSelectScene(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div
        ref="connectorContainer"
        v-loading="connectorListLoading"
        class="flex-1 bg-light dark:bg-card p-4 overflow-y-auto"
      >
        <div
          v-if="showSpecialScene"
          class="connector-list grid gap-4"
          :class="{ 'connector-list--catalog': usesConnectorCatalog }"
        >
          <div
            v-for="item in specialScene[currentScene]"
            :key="item.key"
            class="connector-item rounded-xl p-3 overflow-hidden bg-card dark:bg-white/10 clickable"
            @click="handleSelectSpecial(item)"
          >
            <div class="flex gap-3">
              <VIcon size="38">{{ item.icon }}</VIcon>
              <div class="connector-item-content flex-1 overflow-hidden">
                <div
                  class="connector-item-title font-color-dark flex align-center"
                >
                  <span class="ellipsis mr-1">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="connectorSections.length" class="connector-sections">
          <section
            v-for="section in connectorSections"
            :key="section.key"
            class="connector-section"
          >
            <div
              v-if="usesConnectorCatalog && search"
              class="connector-section-heading"
            >
              <h3>{{ $t(section.title) }}</h3>
              <span>{{ section.items.length }}</span>
            </div>
            <div
              class="connector-list grid gap-4"
              :class="{ 'connector-list--catalog': usesConnectorCatalog }"
            >
              <template v-if="showDemoConnection">
                <div
                  v-for="item in demoDatabase"
                  :key="`demo-${item.pdkId}`"
                  class="connector-item rounded-xl p-3 overflow-hidden bg-white clickable"
                  :class="{ active: item.pdkId === selected.pdkId }"
                  :data-qc="
                    ['GA', 'Beta', 'Alpha'].includes(item.qcType)
                      ? item.qcType
                      : undefined
                  "
                  @click="handleSelect(item, true)"
                >
                  <div class="flex gap-3">
                    <DatabaseIcon :size="38" :item="item" />
                    <div class="connector-item-content flex-1 overflow-hidden">
                      <div
                        class="connector-item-title font-color-dark flex align-center"
                      >
                        <span class="ellipsis mr-1"
                          >{{ item.name }}
                          <span class="color-warning">Demo</span></span
                        >
                        <ElTag
                          type="warning"
                          class="text-uppercase ml-auto px-1 connector-item-tag"
                          >DEMO</ElTag
                        >
                      </div>
                    </div>
                  </div>
                  <div class="font-color-light fs-8 mt-2">
                    {{ item.name }}
                    {{ $t('packages_business_demo_database_desc') }}
                  </div>
                </div>
              </template>
              <div
                v-for="item in section.items"
                :key="item.type"
                class="connector-item rounded-xl p-3 overflow-hidden bg-card dark:bg-white/10 clickable"
                :class="{ active: item.pdkId === selected.pdkId }"
                :data-qc="
                  ['GA', 'Beta', 'Alpha'].includes(item.qcType)
                    ? item.qcType
                    : undefined
                "
                @click="handleSelect(item)"
              >
                <ConnectorQualityBadge :quality="item.qcType" />
                <div class="flex gap-3">
                  <DatabaseIcon
                    v-if="!item.locked || !item.icon.includes('.')"
                    :size="38"
                    :item="item"
                    :class="{
                      'connector-icon--unregistered':
                        item.requiresDownload && !usesConnectorCatalog,
                    }"
                  />
                  <ElImage
                    v-else
                    style="width: 38px; height: 38px"
                    :src="getConnectorImage(item.icon)"
                    :class="{
                      'connector-icon--unregistered':
                        item.requiresDownload && !usesConnectorCatalog,
                    }"
                  />
                  <div class="connector-item-content flex-1 overflow-hidden">
                    <div
                      class="connector-item-title font-color-dark flex align-center"
                      :class="{
                        'connector-item-title--updatable':
                          showConnectorAction(item),
                        'connector-item-title--versioned':
                          item.pdkHash &&
                          !item.requiresDownload &&
                          item.version,
                      }"
                    >
                      <span class="connector-item-name ellipsis">{{
                        item.name
                      }}</span>
                      <span
                        v-if="
                          item.pdkHash && !item.requiresDownload && item.version
                        "
                        class="connector-item-version"
                        >{{ item.version }}</span
                      >
                    </div>
                  </div>
                </div>
                <ElButton
                  v-if="showConnectorAction(item)"
                  size="small"
                  class="connector-release-action"
                  :type="
                    getConnectorJob(item)?.status === 'failed'
                      ? 'danger'
                      : item.requiresDownload
                        ? 'primary'
                        : undefined
                  "
                  :plain="
                    item.requiresDownload ||
                    getConnectorJob(item)?.status === 'failed'
                  "
                  :disabled="!!connectorActionDisabledReason(item)"
                  :title="
                    connectorActionDisabledReason(item) || item.releaseVersion
                  "
                  @click.stop="handleReleaseAction(item)"
                >
                  <ElIcon v-if="getConnectorJob(item)?.status === 'failed'"
                    ><i-lucide-circle-alert
                  /></ElIcon>
                  <ElIcon
                    v-else-if="getConnectorJob(item)"
                    class="connector-release-loader"
                    ><i-lucide-loader-circle
                  /></ElIcon>
                  <ElIcon v-else-if="item.requiresDownload"
                    ><i-lucide-download
                  /></ElIcon>
                  <ElIcon v-else><i-lucide-arrow-up /></ElIcon>
                  {{ connectorActionLabel(item) }}
                  <span
                    v-if="
                      item.updateAvailable &&
                      !item.requiresDownload &&
                      !getConnectorJob(item)
                    "
                    class="connector-release-dot"
                    aria-hidden="true"
                  />
                </ElButton>
                <div
                  v-if="
                    getConnectorJob(item) &&
                    !['completed', 'failed'].includes(
                      getConnectorJob(item).status,
                    )
                  "
                  class="connector-release-track"
                >
                  <span
                    :style="{
                      transform: `scaleX(${connectorJobProgress(item) / 100})`,
                    }"
                  />
                </div>
                <div
                  v-if="currentScene === 'recommend' && !search"
                  class="font-color-light fs-8 mt-2"
                >
                  {{ connectorDescMap[item.type] }}
                </div>
              </div>
            </div>
          </section>
        </div>
        <ElEmpty
          v-else-if="usesConnectorCatalog && !connectorListLoading"
          :description="connectorEmptyMessage"
        >
          <template v-if="canResetConnectorFilters" #default>
            <ElButton
              type="primary"
              plain
              @click="handleSelectScene({ key: 'all' })"
              >{{
                $t(
                  showInstalledEmptyState
                    ? 'packages_business_connector_add_data_source'
                    : 'packages_business_connector_view_all',
                )
              }}</ElButton
            >
          </template>
        </ElEmpty>
        <VEmpty v-else-if="!connectorListLoading" />
      </div>
    </div>
    <div
      v-else
      v-loading="loading"
      element-loading-background="#fff"
      class="form__content flex flex-column h-100 overflow-hidden border-top"
    >
      <ServeForm
        v-if="!formParams.pdkHash"
        :params="formParams"
        :selector-type="selectorType"
        class="flex-fill"
        @success="handleSuccess"
        @save-and-more="handleSaveAndMore"
      />
      <ConnectionForm
        v-else
        ref="connectionForm"
        :params="formParams"
        :selector-type="selectorType"
        :hide-connection-type="!!fixedPdkId"
        class="flex-fill"
        @back="init"
        @success="handleSuccess"
        @save-and-more="handleSaveAndMore"
      />
    </div>

    <RequestDialog
      v-if="!isDaas"
      ref="requestDialog"
      :visible="requestVisible"
      :meta="requestMeta"
      @update:visible="(val) => (requestVisible = val)"
    />
  </ElDialog>
  <ConnectorReleaseDialog
    v-if="releaseItem"
    v-model:visible="releaseDialogVisible"
    :item="releaseItem"
    :impact="releaseImpact"
    :job="connectorJobs[releaseItem.pdkId]"
    :pending="releaseLoading"
    :impact-loading="releaseImpactLoading"
    :impact-error="releaseImpactError"
    :request-error="releaseRequestError"
    @start="registerRelease"
    @retry="retryConnectorRelease"
    @retry-impact="handleReleaseAction(releaseItem)"
    @retry-poll="resumeConnectorPolling"
  />
</template>

<style lang="scss">
.ldp-connection-dialog.el-dialog {
  margin-top: 32px !important;
  margin-bottom: 32px !important;
  height: calc(100% - 64px);
  overflow: hidden;

  .el-dialog__header {
    height: 64px;
    min-height: 64px;
    padding-bottom: 0;
  }

  .ldp-connection-search-input {
    width: 340px;
  }

  .el-dialog__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 !important;
    margin: 0;
    height: 0;

    .img-box {
      width: 65px;
      height: 65px;
      border: 1px solid rgba(221, 221, 221, 0.4);
      background-color: #fff;
    }

    .database-item {
      width: 80px;
      flex: 1;
      margin-right: 53px;
      margin-bottom: 48px;
      &.active,
      &:hover {
        .img-box {
          background: rgba(201, 205, 212, 0.3);
        }
      }

      &.disable {
        .img-box {
          background-color: rgba(242, 242, 242, 0.2);
        }
      }
    }
  }

  .scene-name-list-wrap {
    min-width: 196px;

    &.is-en {
      min-width: 218px;
    }
  }

  .scene-name-item {
    margin: 0 8px 1px;
    height: 36px;
    line-height: 36px;
    transition: background 0.2s;

    &:hover {
      background-color: var(--fill-hover);
    }

    &.active {
      color: var(--el-menu-active-color);
      background-color: var(--primary-hover-light);
    }
  }

  .connector-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .connector-list--catalog {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  }

  .connector-installed-option {
    width: calc(100% - 16px);
    border: 0;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    text-align: left;
  }

  .connector-section + .connector-section {
    margin-top: 24px;
  }

  .connector-section-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;

    h3 {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .connector-item {
    position: relative;
    box-shadow:
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02);
    transition: box-shadow 0.2s;

    &-title {
      font-size: 15px;
      line-height: 38px;

      &--versioned {
        gap: 12px;
      }

      &--updatable {
        > .connector-item-name {
          padding-right: 88px;
        }

        &.connector-item-title--versioned {
          flex-wrap: wrap;
          gap: 0;
          line-height: 20px;

          > .connector-item-name {
            flex-basis: 100%;
          }

          > .connector-item-version {
            line-height: 18px;
          }
        }
      }
    }

    &-name {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
    }

    &-version {
      flex: none;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      font-variant-numeric: tabular-nums;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
    }

    &-tag {
      height: 18px;
      line-height: 16px;
    }

    &:hover {
      box-shadow:
        0 1px 2px -2px rgba(0, 0, 0, 0.16),
        0 3px 6px 0 rgba(0, 0, 0, 0.12),
        0 5px 12px 4px rgba(0, 0, 0, 0.09);
    }
  }
}

.form__content {
  height: 640px;
}

.connector-icon--unregistered {
  filter: grayscale(1);
  opacity: 0.45;
}

.connector-release-action.el-button {
  position: absolute;
  right: 12px;
  top: 12px;
  margin: 0;
  height: 24px;
  padding: 0 7px;
  border-radius: 8px;
  font-size: 12px;
  overflow: visible;
}
.connector-release-action.el-button > span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.connector-release-action .el-icon {
  font-size: 12px;
}
.connector-item[data-qc] .connector-release-action.el-button {
  top: 28px;
}
.connector-release-dot {
  position: absolute !important;
  right: -2px;
  top: -2px;
  width: 7px;
  height: 7px;
  box-sizing: border-box;
  border: 1.5px solid var(--el-bg-color);
  border-radius: 50%;
  background: var(--el-color-danger);
  pointer-events: none;
}
.connector-release-track {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 2px;
  background: var(--el-border-color-lighter);
  overflow: hidden;
}
.connector-release-track > span {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--el-color-primary);
  transform-origin: left;
  transition: transform 0.6s ease;
}
.connector-release-loader {
  animation: connector-release-rotate 1.3s linear infinite;
}
@keyframes connector-release-rotate {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .connector-release-loader {
    animation: none;
  }
  .connector-release-track > span {
    transition: none;
  }
}
</style>
