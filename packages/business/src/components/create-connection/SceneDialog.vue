<template>
  <ElDialog
    :visible="visible"
    :append-to-body="true"
    width="80%"
    top="10vh"
    custom-class="connection-dialog ldp-connection-dialog flex flex-column"
    destroy-on-close
    @open="handleOpen"
    @close="handleClose"
  >
    <div slot="title" class="flex font-color-dark fs-6 fw-sub position-relative align-center">
      <template v-if="!showForm">
        <span>请选择您的使用场景</span>
        <ElInput
          v-model="search"
          class="position-absolute start-50 top-50 translate-middle ldp-connection-search-input"
          size="small"
          clearable
          :placeholder="$t('public_input_placeholder_search')"
        >
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </ElInput>
      </template>
      <template v-else>
        <IconButton @click="showForm = false" class="mr-2">left</IconButton>
        <DatabaseIcon class="mr-2" :size="24" :item="selected"></DatabaseIcon>
        <span>{{ selected.name }}</span>
      </template>
    </div>
    <div v-if="!showForm" class="flex border-top flex-1 min-h-0">
      <div class="flex flex-column border-end scene-name-list-wrap overflow-x-hidden pt-4 pb-2">
        <div class="scene-name-list overflow-y-auto">
          <div
            class="scene-name-item px-4 rounded-4 user-select-none ellipsis cursor-pointer"
            :class="{ active: (currentScene === item.key || currentScene === item.name) && !search }"
            v-for="(item, i) in sceneList"
            :key="i"
            @click="handleSelectScene(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div v-loading="loading" class="flex-1 bg-light p-3 overflow-y-auto">
        <ul v-if="sceneDatabases.length" class="overflow-auto inline-block">
          <li
            v-for="(item, index) in sceneDatabases"
            :key="item.pdkId"
            class="float-start cursor-pointer text-center database-item"
            :class="{ active: item.pdkId === selected.pdkId }"
            @click="handleSelect(item)"
          >
            <div class="img-box inline-flex justify-content-center align-items-center rounded-circle">
              <DatabaseIcon :size="42" :item="item"></DatabaseIcon>
            </div>
            <ElTooltip class="mt-2" effect="dark" :content="item.name" placement="bottom">
              <div class="ellipsis text-center font-color-normal">{{ item.name }}</div>
            </ElTooltip>
          </li>
        </ul>
        <VEmpty v-else></VEmpty>
      </div>
    </div>
    <div v-else class="form__content flex flex-column h-100 overflow-hidden border-top">
      <ServeForm v-if="['apiServices'].includes(activeTab)" :params="formParams" class="flex-fill"></ServeForm>
      <ConnectionForm
        v-else
        :params="formParams"
        class="flex-fill"
        @back="init"
        @success="handleSuccess"
        @saveAndMore="handleSaveAndMore"
      ></ConnectionForm>
    </div>
  </ElDialog>
</template>

<script>
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
    }
  },
  data() {
    return {
      search: '',
      formParams: {},
      selected: {},
      showForm: false,
      timer: null,
      activeTab: '',
      database: [],
      loading: false,
      sceneList: [
        {
          key: 'all',
          name: '全部'
        },
        {
          key: 'recommended',
          name: '推荐场景',
          types: ['BigQuery', 'Tablestore', 'MongoDB', 'Redis', 'SelectDB']
        },
        /*{
          name: 'API 发布',
          types: ['RESTful API', 'GraphQL']
        },*/
        {
          name: '入数仓',
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
          name: '查询加速',
          types: ['MongoDB', 'Redis', 'Elasticsearch']
        },
        {
          name: '数据库同步',
          types: ['MongoDB']
        },
        {
          name: '国产替代',
          types: ['Dameng', 'GBase-8a', 'KingBaseES-R3', 'KingBaseES-R6', 'Tidb', 'Oceanbase']
        },
        {
          name: '队列供数',
          types: ['Kafka', 'ActiveMQ', 'RocketMQ', 'RabbitMQ']
        },
        {
          name: 'Reverse ETL',
          types: ['vika', 'QingCloud']
        },
        {
          name: '工作流',
          types: ['Lark-IM', 'LarkTask']
        }
      ],
      currentScene: 'recommended'
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
      const types = this.sceneMap[this.currentScene]
      return this.database.filter(db => types.includes(db.type))
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.getData()
      }
    }
  },
  methods: {
    getIcon,
    init() {
      this.showForm = false
      this.formParams = {}
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
      this.selected = item
      switch (this.activeTab) {
        case 'apiServices':
          // TODO apiServices
          break
        default:
          this.formParams = { pdkHash: item.pdkHash }
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
      this.currentScene = item.key || item.name
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
      const data = res?.filter(t => t.connectionType.includes('target') && !!t.pdkHash) || []
      this.database = data
      this.loading = false
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
    }

    .scene-name-list {
    }

    .scene-name-item {
      margin: 0px 8px 1px;
      height: 36px;
      line-height: 36px;

      &:hover {
        background-color: rgba(31, 35, 41, 0.08);
      }

      &.active {
        color: map-get($color, primary);
        background-color: #f0f4ff;
      }
    }
  }
}
.form__content {
  height: 640px;
}
</style>
