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
    class="ldp-connection-dialog flex flex-column"
    :beforeClose="beforeClose"
    @close="handleClose"
    @closed="onClosed"
  >
    <template #header>
      <div class="flex font-color-dark fs-6 fw-sub position-relative align-center">
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
          <IconButton v-if="!onlyForm" @click="showForm = false" class="mr-2">left</IconButton>
          <DatabaseIcon v-if="formParams.pdkHash" class="mr-2" :size="24" :item="formParams"></DatabaseIcon>
          <VIcon v-else class="mr-2" :size="24">{{ formParams.icon }}</VIcon>
          <span>{{ formParams.name }}</span>
        </template>
      </div>
    </template>
    <div v-if="!showForm" class="flex border-top flex-1 min-h-0">
      <div
        class="flex flex-column border-end scene-name-list-wrap overflow-x-hidden pt-4 pb-2"
        :class="{
          'is-en': $i18n.locale === 'en',
        }"
      >
        <div class="scene-name-list overflow-y-auto">
          <div
            v-if="lockedTypes.length"
            class="scene-name-item px-4 rounded-4 user-select-none ellipsis cursor-pointer flex align-center"
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
              class="scene-name-item px-4 rounded-4 user-select-none ellipsis cursor-pointer flex align-center"
              @click="openGithub"
            >
              <VIcon size="16" class="mr-1">github</VIcon>
              {{ $t('packages_business_more_free_connector') }}
              <VIcon size="16" class="ml-1">open-in-new</VIcon>
            </div>

            <div class="px-2">
              <ElDivider class="my-2"></ElDivider>
            </div>
          </template>

          <div
            class="scene-name-item px-4 rounded-4 user-select-none ellipsis cursor-pointer"
            :class="{
              active: (currentScene === item.key || currentScene === item.name) && !search,
            }"
            v-for="(item, i) in options"
            :key="i"
            @click="handleSelectScene(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div ref="connectorContainer" v-loading="loading" class="flex-1 bg-light p-4 overflow-y-auto">
        <div v-if="specialScene[currentScene]" class="connector-list grid gap-4">
          <div
            v-for="item in specialScene[currentScene]"
            :key="item.key"
            class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
            @click="handleSelectSpecial(item)"
          >
            <div class="flex gap-3">
              <VIcon size="38">{{ item.icon }}</VIcon>
              <div class="connector-item-content flex-1 overflow-hidden">
                <div class="connector-item-title font-color-dark flex align-center">
                  <span class="ellipsis mr-1">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="sceneDatabases.length" class="connector-list grid gap-4">
          <template v-if="showDemoConnection">
            <div
              v-for="item in demoDatabase"
              :key="`demo-${item.pdkId}`"
              class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
              :class="{ active: item.pdkId === selected.pdkId }"
              @click="handleSelect(item, true)"
            >
              <div class="flex gap-3">
                <DatabaseIcon :size="38" :item="item"></DatabaseIcon>
                <div class="connector-item-content flex-1 overflow-hidden">
                  <div class="connector-item-title font-color-dark flex align-center">
                    <span class="ellipsis mr-1">{{ item.name }} <span class="color-warning">Demo</span></span>
                    <ElTag type="warning" class="text-uppercase ml-auto px-1 connector-item-tag">DEMO</ElTag>
                  </div>
                </div>
              </div>
              <div class="font-color-light fs-8 mt-2">
                {{ item.name }} {{ $t('packages_business_demo_database_desc') }}
              </div>
            </div>
          </template>
          <div
            v-for="item in sceneDatabases"
            :key="item.type"
            class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
            :class="{ active: item.pdkId === selected.pdkId }"
            @click="handleSelect(item)"
          >
            <div class="flex gap-3">
              <DatabaseIcon v-if="!item.locked || !item.icon.includes('.')" :size="38" :item="item"></DatabaseIcon>
              <ElImage
                v-else
                style="width: 38px; height: 38px"
                :src="require(`@tap/assets/images/connector/${item.icon}`)"
              ></ElImage>
              <div class="connector-item-content flex-1 overflow-hidden">
                <div class="connector-item-title font-color-dark flex align-center">
                  <span class="ellipsis mr-1">{{ item.name }}</span>
                  <VIcon v-if="item.locked" size="24">lock-circle</VIcon>
                  <VIcon v-if="item.qcType === 'GA'" size="24" class="ml-auto color-success">verified</VIcon>
                  <ElTag v-else-if="item.qcType" class="text-uppercase ml-auto px-1 connector-item-tag"
                    >{{ item.qcType }}
                  </ElTag>
                </div>
              </div>
            </div>
            <div v-if="currentScene === 'recommend' && !search" class="font-color-light fs-8 mt-2">
              {{ connectorDescMap[item.type] }}
            </div>
          </div>
        </div>
        <VEmpty v-else></VEmpty>
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
        @saveAndMore="handleSaveAndMore"
      ></ServeForm>
      <ConnectionForm
        v-else
        ref="connectionForm"
        :params="formParams"
        :selector-type="selectorType"
        :hide-connection-type="!!fixedPdkId"
        class="flex-fill"
        @back="init"
        @success="handleSuccess"
        @saveAndMore="handleSaveAndMore"
      ></ConnectionForm>
    </div>

    <RequestDialog
      v-if="!isDaas"
      ref="requestDialog"
      :visible="requestVisible"
      :meta="requestMeta"
      @update:visible="(val) => (requestVisible = val)"
    ></RequestDialog>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { mapGetters } from 'vuex'
import i18n from '@tap/i18n'

import ConnectionForm from './SceneForm'
import ServeForm from './ServeForm'
import { VEmpty, IconButton } from '@tap/component'
import { databaseTypesApi } from '@tap/api'
import { getIcon } from '@tap/assets'
import { DatabaseIcon } from '../DatabaseIcon'
import RequestDialog from './RequestDialog.vue'

export default {
  name: 'SceneDialog',
  inject: ['openLocked'],
  components: {
    RequestDialog,
    ConnectionForm,
    ServeForm,
    VEmpty,
    DatabaseIcon,
    IconButton,
  },
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
  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    const isCommunity = process.env.VUE_APP_MODE === 'community'
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
      loading: false,
      showDialog: this.visible,
      sceneList: [
        {
          key: 'all',
          name: i18n.t('public_select_option_all'),
        },
        {
          key: 'recommend',
          name: i18n.t('packages_business_create_connection_scenedialog_tuijianchangjing'),
          types: [
            'Mysql',
            'Oracle',
            'SQL Server',
            'MongoDB',
            'MongoDB Atlas',
            'PostgreSQL',
            'Clickhouse',
            'Elasticsearch',
            'Dummy',
            'Kafka',
            'Doris',
            'BigQuery',
          ],
        },
        {
          key: 'api',
          name: i18n.t('packages_business_api_publish'),
          hidden: !isDaas /*,
        types: ['RESTful API', 'GraphQL']*/,
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_rushucang'),
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
          name: i18n.t('packages_business_create_connection_scenedialog_chaxunjiasu'),
          types: ['MongoDB', 'Redis', 'Elasticsearch'],
        },
        {
          key: 'Database',
          name: i18n.t('packages_business_create_connection_scenedialog_shujukutongbu'),
          types: ['MongoDB'],
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_guochantidai'),
          types: ['Dameng', 'GBase-8a', 'KingBaseES-R3', 'KingBaseES-R6', 'Tidb', 'Oceanbase'],
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_duiliegongshu'),
          types: ['Kafka', 'ActiveMQ', 'RocketMQ', 'RabbitMQ'],
        },
        {
          name: 'Reverse ETL',
          types: ['vika', 'QingCloud'],
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_gongzuoliu'),
          types: ['Lark-IM', 'LarkTask'],
        },
      ],
      connectorDescMap: {
        BigQuery: i18n.t('packages_business_create_connection_scenedialog_bigQu'),
        MongoDB: i18n.t('packages_business_create_connection_scenedialog_mongo'),
        Redis: i18n.t('packages_business_create_connection_scenedialog_redis'),
        SelectDB: i18n.t('packages_business_create_connection_scenedialog_selec'),
        Tablestore: i18n.t('packages_business_create_connection_scenedialog_table'),
        Mysql: i18n.t('packages_business_create_connection_mysql_desc'),
        Oracle: i18n.t('packages_business_create_connection_oracle_desc'),
        'SQL Server': i18n.t('packages_business_create_connection_sqlserver_desc'),
        PostgreSQL: i18n.t('packages_business_create_connection_postgresql_desc'),
        Clickhouse: i18n.t('packages_business_create_connection_clickhouse_desc'),
        Elasticsearch: i18n.t('packages_business_create_connection_elasticsearch_desc'),
        Dummy: i18n.t('packages_business_create_connection_dummy_desc'),
        Kafka: i18n.t('packages_business_create_connection_kafka_desc'),
        Doris: i18n.t('packages_business_create_connection_doris_desc'),
        'MongoDB Atlas': i18n.t('packages_business_create_connection_mongodbatlas_desc'),
      },
      currentScene: 'recommend',
      lockedTypes:
        process.env.VUE_APP_MODE === 'community'
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
          name: i18n.t('packages_business_components_connectiontypeselectorsort_wodeshujuyuan'),
          key: 'Custom',
        },
      ],
      specialScene: {
        api: [
          {
            key: 'apiApp',
            icon: 'mini-app',
            name: this.$t('packages_business_api_application'),
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
        let search = this.search.toLowerCase()
        return this.database.filter((db) => db.name.toLowerCase().includes(search))
      }

      const { currentScene } = this

      if (currentScene === 'all') {
        return this.database
      }

      if (currentScene === 'locked') {
        return this.lockedTypes
      }

      if (currentScene === 'recommend' || (this.selectorType === 'target' && currentScene !== 'Database')) {
        const types = this.sceneMap[this.currentScene]
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
    options() {
      let list = this.selectorType === 'target' ? this.sceneList : this.tagList
      return list.filter((item) => !item.hidden)
    },
    title() {
      if (this.selectorType === 'target') {
        return this.$t('packages_business_create_connection_scenedialog_qingxuanzeninde')
      }
      return this.$t('packages_business_create_connection_title_select_type')
    },

    showDemoConnection() {
      return this.startingTour && !this.pausedGuide && this.currentScene === 'recommend' && !this.search
    },
  },
  watch: {
    async visible(v) {
      this.showDialog = v
      this.showForm = false
      Object.assign(this.formParams, { id: '', name: '', pdkHash: null, pdkId: null, pdkOptions: null })
      if (v) {
        this.modalClass = ''
        this.search = ''
        this.currentScene = 'recommend'

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
      $emit(this, 'update:visible', v)
    },
  },
  mounted() {
    const { type, pdkHash, pdkId } = this.$route.query

    // add-source/add-target
    if (type?.startsWith('add-') && this.selectorType !== 'source_and_target') {
      $emit(this, 'update:selectorType', type.split('-').pop())
      this.showDialog = true
      this.$nextTick(() => {
        this.formParams.pdkHash = pdkHash
        this.formParams.pdkId = pdkId
        this.showForm = true
      })
    }
  },
  methods: {
    getIcon,
    init() {
      this.showForm = false
      Object.assign(this.formParams, { id: '', name: '', pdkHash: null, pdkId: null, pdkOptions: null })
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
      $emit(this, 'visible', false)
      $emit(this, 'update:visible', false)
    },

    onClosed() {
      this.showForm = false
    },

    async handleSelect(item, isDemo = false) {
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
        $emit(this, 'selected', item)
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
            this.$refs.connectionForm.schemaFormInstance.setFieldState('*(!START.__TAPDATA.name)', {
              disabled: true,
            })
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

    handleSaveAndMore() {
      $emit(this, 'saveAndMore', ...arguments)
      this.init()
    },

    handleSelectScene(item) {
      this.search = ''
      this.currentScene = item.key || item.name
      this.resetScroll()
    },

    resetScroll() {
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
      const res = await databaseTypesApi.getDatabases({
        filter: JSON.stringify(params),
      })
      const data =
        this.selectorType !== 'source_and_target'
          ? res?.filter((t) => t.connectionType.includes(this.selectorType) && !!t.pdkHash) || []
          : res
      this.databaseTypeMap = data.reduce((map, db) => ((map[db.type] = db), map), {})

      const sortFn = (o1, o2) => {
        const qcTypeLevel = {
          GA: 1,
          Beta: 2,
          Alpha: 3,
        }
        const o1Level = qcTypeLevel[o1.qcType]
        const o2Level = qcTypeLevel[o2.qcType]

        if (o1Level === o2Level) {
          return o1.name.localeCompare(o2.name)
        }

        return o1Level - o2Level
      }

      if (this.isControlEnabled) {
        this.lockedTypes = data.filter(item => {
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
              ((this.selectorType !== 'source_and_target' && item.connectionType.includes(this.selectorType)) ||
                this.selectorType === 'source_and_target')
            )
          })
          .sort(sortFn)

        // 合并到已注册
        data.push(...this.lockedTypes)
      }

      console.log('this.lockedTypes', this.lockedTypes)

      this.database = data.sort(sortFn)

      if (this.selectorType === 'source') {
        this.demoDatabase = [data.find((t) => t.pdkId === 'mysql')]
      } else if (this.selectorType === 'target') {
        this.demoDatabase = [data.find((t) => t.pdkId === 'mongodb')]
      }

      this.loading = false
    },

    handleSearchInput() {
      this.resetScroll()
    },

    async getPdkById(id) {
      this.loading = true
      const data = await databaseTypesApi.get({
        filter: JSON.stringify({
          where: {
            pdkId: id,
          },
        }),
      })
      this.loading = false
      return data?.[0]
    },

    beforeClose(done) {
      if (this.startingTour) {
        this.modalClass = 'dialog-zoom-transition' // 暂停引导让 dialog 有缩放动画
        const icon = document.getElementById('user-guide-icon')
        if (icon) {
          const windowWidth = document.documentElement.clientWidth
          const windowHeight = document.documentElement.clientHeight
          const iconStyle = window.getComputedStyle(icon)
          const iconX = parseInt(iconStyle.left) + parseInt(iconStyle.width) / 2
          const iconY = windowHeight - parseInt(iconStyle.bottom) - parseInt(iconStyle.height) / 2
          const dialog = this.$refs.dialogWrapper.dialogContentRef.$el
          const computedStyle = window.getComputedStyle(dialog)
          let width = computedStyle.width
          if (width.endsWith('px')) {
            width = parseInt(width)
          } else if (width.endsWith('%')) {
            width = (parseInt(width) / 100) * windowWidth
          }
          const transformOriginX = iconX - (windowWidth - width) / 2
          const transformOriginY = iconY - parseInt(computedStyle.marginTop)
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
  emits: ['update:visible', 'update:selectorType', 'visible', 'selected', 'success', 'saveAndMore'],
}
</script>

<style lang="scss">
.ldp-connection-dialog {
  margin-top: 32px !important;
  margin-bottom: 32px !important;
  height: calc(100% - 64px);
  overflow: hidden;

  .el-dialog__header {
    height: 64px;
    min-height: 64px;
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
      background-color: rgba(31, 35, 41, 0.08);
    }

    &.active {
      color: map-get($color, primary);
      background-color: #f0f4ff;
    }
  }

  .connector-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .connector-item {
    box-shadow:
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02);
    transition: box-shadow 0.2s;

    &-title {
      font-size: 15px;
      line-height: 38px;
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
</style>
