<template>
  <ElDialog
    :visible="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="80%"
    top="10vh"
    custom-class="connection-dialog ldp-connection-dialog flex flex-column"
    destroy-on-close
    @open="handleOpen"
    @close="handleClose"
  >
    <div slot="title" class="flex font-color-dark fs-6 fw-sub position-relative align-center">
      <template v-if="!showForm">
        <span>{{ title }}</span>
        <ElInput
          v-model="search"
          class="position-absolute start-50 top-50 translate-middle ldp-connection-search-input"
          size="small"
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
        <IconButton @click="showForm = false" class="mr-2">left</IconButton>
        <DatabaseIcon class="mr-2" :size="24" :item="formParams"></DatabaseIcon>
        <span>{{ formParams.name }}</span>
      </template>
    </div>
    <div v-if="!showForm" class="flex border-top flex-1 min-h-0">
      <div
        class="flex flex-column border-end scene-name-list-wrap overflow-x-hidden pt-4 pb-2"
        :class="{
          'is-en': $i18n.locale === 'en'
        }"
      >
        <div class="scene-name-list overflow-y-auto">
          <div
            class="scene-name-item px-4 rounded-4 user-select-none ellipsis cursor-pointer"
            :class="{ active: (currentScene === item.key || currentScene === item.name) && !search }"
            v-for="(item, i) in options"
            :key="i"
            @click="handleSelectScene(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div ref="connectorContainer" v-loading="loading" class="flex-1 bg-light p-4 overflow-y-auto">
        <div v-if="sceneDatabases.length" class="connector-list grid gap-4">
          <div
            v-for="item in sceneDatabases"
            :key="item.pdkId"
            class="connector-item rounded-4 p-3 overflow-hidden bg-white clickable"
            :class="{ active: item.pdkId === selected.pdkId }"
            @click="handleSelect(item)"
          >
            <div class="flex gap-3">
              <DatabaseIcon :size="38" :item="item"></DatabaseIcon>
              <div class="connector-item-content flex-1 overflow-hidden">
                <div class="connector-item-title font-color-dark flex align-center">
                  <span class="ellipsis mr-1">{{ item.name }}</span>
                  <VIcon v-if="item.qcType === 'GA'" size="24" class="ml-auto color-success">verified</VIcon>
                  <ElTag v-else-if="item.qcType" size="mini" class="text-uppercase ml-auto px-1 connector-item-tag">{{
                    item.qcType
                  }}</ElTag>
                </div>
              </div>
            </div>
            <div v-if="currentScene === 'recommended' && !search" class="font-color-light fs-8 mt-2">
              {{ connectorDescMap[item.type] }}
            </div>
          </div>
        </div>
        <VEmpty v-else></VEmpty>
      </div>
    </div>
    <div v-else class="form__content flex flex-column h-100 overflow-hidden border-top">
      <ServeForm
        v-if="['apiServices'].includes(activeTab)"
        :params="formParams"
        :selector-type="selectorType"
        class="flex-fill"
      ></ServeForm>
      <ConnectionForm
        v-else
        :params="formParams"
        :selector-type="selectorType"
        class="flex-fill"
        @back="init"
        @success="handleSuccess"
        @saveAndMore="handleSaveAndMore"
      ></ConnectionForm>
    </div>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'

import ConnectionForm from './SceneForm'
import ServeForm from './ServeForm'
import { VEmpty, IconButton } from '@tap/component'
import { databaseTypesApi } from '@tap/api'
import { getIcon } from '@tap/assets'
import { DatabaseIcon } from '../DatabaseIcon'

export default {
  name: 'SceneDialog',
  components: {
    ConnectionForm,
    ServeForm,
    VEmpty,
    DatabaseIcon,
    IconButton
  },
  props: {
    visible: {
      required: true,
      value: Boolean
    },
    type: {
      type: String,
      default: 'scene' // tag
    },
    selectorType: String
  },
  data() {
    return {
      search: '',
      formParams: {
        name: '',
        pdkHash: null
      },
      selected: {},
      showForm: false,
      timer: null,
      activeTab: '',
      database: [],
      loading: false,
      showDialog: this.visible,
      sceneList: [
        {
          key: 'all',
          name: i18n.t('public_select_option_all')
        },
        {
          key: 'recommended',
          name: i18n.t('packages_business_create_connection_scenedialog_tuijianchangjing'),
          types: ['BigQuery', 'Tablestore', 'MongoDB', 'Redis', 'SelectDB']
        },
        {
          name: 'API 发布',
          types: ['RESTful API', 'GraphQL']
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
            'Databend'
          ]
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_chaxunjiasu'),
          types: ['MongoDB', 'Redis', 'Elasticsearch']
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_shujukutongbu'),
          types: ['MongoDB']
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_guochantidai'),
          types: ['Dameng', 'GBase-8a', 'KingBaseES-R3', 'KingBaseES-R6', 'Tidb', 'Oceanbase']
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_duiliegongshu'),
          types: ['Kafka', 'ActiveMQ', 'RocketMQ', 'RabbitMQ']
        },
        {
          name: 'Reverse ETL',
          types: ['vika', 'QingCloud']
        },
        {
          name: i18n.t('packages_business_create_connection_scenedialog_gongzuoliu'),
          types: ['Lark-IM', 'LarkTask']
        }
      ],
      connectorDescMap: {
        BigQuery:
          'BigQuery是Google Cloud提供的托管式数据仓库，以高速、可扩展和安全著称，可以处理PB级数据，与多个工具集成，适用于各种数据分析和挖掘场景。',
        MongoDB:
          'MongoDB是一种非关系型数据库，具有灵活性、高性能、易用性和可扩展性，适用于需要处理大量非结构化数据和需要快速查询和可扩展性的应用场景。',
        Redis:
          'Redis是一种高性能内存数据库，支持多种数据结构和持久化方式，具有可扩展性和可靠性，适用于缓存、会话管理、排行榜、消息队列等应用场景。',
        SelectDB:
          'SelectDB Cloud是一种基于Apache Doris内核的全托管实时数据仓库服务，具有高可靠性、高性能、易用性和低成本等优点，适用于处理海量数据的查询和分析需求。',
        Tablestore:
          'Tablestore是一种高可靠性、高性能、灵活性和可扩展性的分布式NoSQL数据存储服务，适用于实时数据查询和分析等应用场景。'
      },
      currentScene: 'recommended',
      tagList: [
        {
          key: 'all',
          name: i18n.t('public_select_option_all')
        },
        {
          name: 'Databases',
          key: 'Database'
        },
        {
          name: 'SaaS',
          key: 'SaaS'
        },
        {
          name: 'File',
          key: 'File'
        },
        {
          name: 'My Connectors',
          key: 'Custom'
        }
      ]
    }
  },
  computed: {
    sceneMap() {
      return this.sceneList.reduce((obj, item) => {
        obj[item.key || item.name] = item.types
        return obj
      }, {})
    },
    sceneDatabases() {
      if (this.search) {
        let search = this.search.toLowerCase()
        return this.database.filter(db => db.name.toLowerCase().includes(search))
      }

      if (this.currentScene === 'all') {
        return this.database
      }

      if (this.selectorType === 'target') {
        const types = this.sceneMap[this.currentScene]
        return this.database.filter(db => types.includes(db.type))
      }

      return this.database.filter(db => db.tags?.includes(this.currentScene))
    },
    options() {
      if (this.selectorType === 'target') {
        return this.sceneList
      }
      return this.tagList
    },
    title() {
      if (this.selectorType === 'target') {
        return this.$t('packages_business_create_connection_scenedialog_qingxuanzeninde')
      }
      return this.$t('packages_business_create_connection_title_select_type')
    }
  },
  watch: {
    visible(v) {
      this.showDialog = v
      if (v) {
        console.log('visible', this.selectorType) // eslint-disable-line
        this.search = ''
        this.currentScene = this.selectorType === 'target' ? 'recommended' : 'all'
        this.getData()
      }
    },
    showDialog(v) {
      this.$emit('update:visible', v)
    }
  },

  mounted() {
    const { type, pdkHash } = this.$route.query

    // add-source/add-target
    if (type?.startsWith('add-')) {
      this.$emit('update:selectorType', type.split('-').pop())
      this.showDialog = true
      this.$nextTick(() => {
        this.formParams.pdkHash = pdkHash
        this.showForm = true
      })
    }
  },

  methods: {
    getIcon,
    init() {
      this.showForm = false
      Object.assign(this.formParams, { name: '', pdkHash: null })
      this.activeTab = ''
    },

    handleOpen() {
      this.init()
    },

    handleClose() {
      this.$emit('visible', false)
      this.$emit('update:visible', false)
    },

    handleSelect(item) {
      if (this.selectorType === 'source_and_target') {
        this.$emit('selected', item)
        return
      }
      this.selected = item
      switch (this.activeTab) {
        case 'apiServices':
          // TODO apiServices
          break
        default:
          this.formParams = { pdkHash: item.pdkHash, name: item.name }
          break
      }
      this.showForm = true
    },

    handleSuccess() {
      this.$emit('success', ...arguments)
      this.init()
      this.handleClose()
    },

    handleSaveAndMore() {
      this.$emit('saveAndMore', ...arguments)
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
          authentication: 'All'
        }
      }
      if (!noLoading) this.loading = true
      const res = await databaseTypesApi.getDatabases({ filter: JSON.stringify(params) })
      const data =
        this.selectorType !== 'source_and_target'
          ? res?.filter(t => t.connectionType.includes(this.selectorType) && !!t.pdkHash) || []
          : res
      this.database = data
      this.loading = false
    },

    handleSearchInput() {
      this.resetScroll()
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
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
      padding: 0;
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
      width: 196px;

      &.is-en {
        width: 218px;
      }
    }

    .scene-name-list {
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
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
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
        box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12),
          0 5px 12px 4px rgba(0, 0, 0, 0.09);
      }
    }
  }
}
.form__content {
  height: 640px;
}
</style>
