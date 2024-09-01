<template>
  <div class="h-100">
    <div v-if="!connectorSelected" class="flex flex-column gap-4">
      <div class="p-4 bg-white rounded-lg">
        <div class="flex gap-6 lh-base">
          <div
            v-for="(item, i) in options"
            :key="i"
            :class="{
              active: item.key === optionSelected
            }"
            class="flex flex-column flex-1 position-relative cursor-pointer overflow-hidden rounded-lg border active-group"
            @click="optionSelected = item.key"
          >
            <div class="flex p-4">
              <div>
                <div class="fs-6 fw-bold mb-1 font-color-dark">{{ item.title }}</div>
                <div class="font-color-light">{{ item.desc }}</div>
              </div>
            </div>
            <div class="is-active position-absolute top-0 end-0">
              <div class="is-active-triangle"></div>
              <VIcon size="16" class="is-active-icon">check-bold</VIcon>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-white rounded-lg">
        <div class="title-prefix-bar mb-4 position-relative">
          <span>选择一个连接器</span>

          <ElInput
            v-model="search"
            class="position-absolute start-50 top-50 translate-middle"
            style="width: 400px"
            size="small"
            clearable
            placeholder="搜索连接器"
            @input="handleSearchInput"
          >
            <template #prefix>
              <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
            </template>
          </ElInput>
        </div>

        <div class="bg-slight p-4 rounded-lg">
          <template v-if="connectionIdSelected && optionSelected === 'has-connection'">
            <div class="mb-4">
              <span class="fw-sub">当前已选</span>
            </div>

            <div class="connector-list grid gap-4 mb-4">
              <el-skeleton :loading="!connectionSelected" animated>
                <template #template>
                  <div class="rounded-lg p-3 overflow-hidden bg-white flex gap-3 align-center">
                    <el-skeleton-item variant="image" style="width: 38px; height: 38px" />
                    <div class="flex-1">
                      <div class="flex align-center justify-content-between gap-3 mb-2">
                        <el-skeleton-item variant="h3" />
                        <el-skeleton-item variant="h3" style="width: 28%" />
                      </div>
                      <el-skeleton-item variant="text" style="width: 50%" />
                    </div>
                  </div>
                </template>
                <template>
                  <div
                    v-if="connectionSelected"
                    class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
                  >
                    <div class="flex gap-3 align-center">
                      <DatabaseIcon :size="38" :item="connectionSelected"></DatabaseIcon>
                      <div class="connector-item-content flex-1 overflow-hidden lh-base">
                        <div class="flex align-center font-color-dark ellipsis">
                          <span class="fs-6 ellipsis mr-1">{{ connectionSelected.name }}</span>
                          <span
                            class="ml-auto rounded-4 p-1 lh-1 min-w-0"
                            :class="['status-connection-' + connectionSelected.status, 'status-block']"
                          >
                            {{ getStatus(connectionSelected.status) }}
                          </span>
                        </div>
                        <div class="font-color-sslight ellipsis">{{ connectionSelected.connectionString }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
            <el-divider></el-divider>
          </template>

          <div v-if="optionSelected === 'has-connection'" class="connector-list grid gap-4">
            <div
              v-for="item in connectionList"
              :key="item.type"
              class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
              @click="handleConnectionSelect(item)"
            >
              <div class="flex gap-3 align-center">
                <DatabaseIcon :size="38" :item="item"></DatabaseIcon>
                <div class="connector-item-content flex-1 overflow-hidden lh-base">
                  <div class="flex align-center font-color-dark ellipsis">
                    <span class="fs-6 ellipsis mr-1">{{ item.name }}</span>
                    <span
                      class="ml-auto rounded-4 p-1 lh-1 min-w-0"
                      :class="['status-connection-' + item.status, 'status-block']"
                    >
                      {{ getStatus(item.status) }}
                    </span>
                  </div>
                  <div class="font-color-sslight ellipsis">{{ item.connectionString }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="connector-list grid gap-4">
            <div
              v-for="item in connectorList"
              :key="item.type"
              class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
              @click="handleConnectorSelect(item)"
            >
              <div class="flex gap-3">
                <DatabaseIcon v-if="!item.locked" :size="38" :item="item"></DatabaseIcon>
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
                    <ElTag v-else-if="item.qcType" size="mini" class="text-uppercase ml-auto px-1 connector-item-tag"
                      >{{ item.qcType }}
                    </ElTag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="position-sticky z-index bottom-0 p-4 rounded-lg backdrop-filter-light z-10">
        <!--<el-button>取消</el-button>-->
        <el-button v-if="currentStep > 0" @click="handlePrev">上一步</el-button>
        <el-button v-if="connectionIdSelected" @click="$emit('next', true)" type="primary">下一步</el-button>
      </div>
    </div>

    <ConnectorForm v-else ref="connectorForm" :connector="connectorSelected" show-ip-tips :connection-type="type">
      <template #header>
        <div class="title-prefix-bar mb-4 flex align-center gap-2">
          <span class="flex-1">创建源连接</span>
          <DatabaseIcon :pdk-hash="connectorSelected.pdkHash" :size="20"></DatabaseIcon>
          <span class="fw-normal">{{ connectorSelected.name }}</span>
        </div>
      </template>
      <template #footer>
        <div>
          <el-button @click="handleCancelCreate">返回</el-button>
          <!--<el-button>上一步</el-button>-->
          <el-button type="primary" @click="handleTest">测试连接以进行下一步</el-button>
          <!--<el-button type="primary" @click="$emit('next')">测试连接以进行下一步</el-button>-->
        </div>
      </template>

      <template #test-cancel="{ status, close }">
        <div style="display: contents" v-if="status === 'ready'">
          <el-button @click="close">关闭</el-button>
          <el-button type="primary" @click="handleSaveAndNext">下一步</el-button>
        </div>
        <el-button v-else type="primary" @click="close">关闭</el-button>
      </template>
    </ConnectorForm>
  </div>
</template>

<script>
import { defineComponent, ref, computed, nextTick, provide, inject, reactive } from '@vue/composition-api'
import { ConnectorForm, DatabaseIcon, verify, CONNECTION_STATUS_MAP } from '@tap/business'
import { connectionsApi, databaseTypesApi } from '@tap/api'
import ConnectorFormItem from './ConnectorFormItem.vue'
import { getInitialValuesInBySchema } from '../../../../form'
import dayjs from 'dayjs'

export default defineComponent({
  name: 'SourceStep',
  props: {
    type: {
      type: String,
      default: 'source'
    }
  },
  components: { DatabaseIcon, ConnectorForm, ConnectorFormItem },
  setup(props, { refs, root, emit }) {
    const pdkHash = ref('')
    const pdkId = ref('')
    const connectorName = ref('')
    const hasConnector = ref(true)
    const search = ref('')
    const connectorList = ref([])
    const connectionList = ref([])
    const connectorSelected = ref()

    const taskRef = inject('task')
    const nodeRef = inject(props.type)
    const currentStepRef = inject('currentStep')
    console.log('nodeRef', nodeRef.value)
    // const buried = inject('buried')
    // const checkAgent = inject('checkAgent')
    const optionSelected = ref(nodeRef.value.connectionId ? 'has-connection' : 'has-connector')
    const connectionIdSelected = ref(nodeRef.value.connectionId)
    const connectionSelected = ref(null)

    const filterConnectorList = computed(() => {
      const list = optionSelected.value !== 'has-connector' ? demoConnectorList.value : connectorList.value

      if (search.value) {
        let query = search.value.toLowerCase()
        return list.filter(db => db.name.toLowerCase().includes(query))
      }
      return list
    })

    const map = {
      source: ['mysql', 'mock-source'],
      target: ['mongodb', 'mock-target']
    }

    const demoConnectorList = computed(() => {
      return connectorList.value.filter(t => map[props.type].includes(t.pdkId))
    })

    const loadConnectorList = async () => {
      const params = {
        where: {
          tag: 'All',
          authentication: 'All'
        },
        order: 'name ASC'
      }

      let data = await databaseTypesApi.getDatabases({ filter: JSON.stringify(params) })

      data = data.filter(item => item.connectionType.includes('source'))

      const sortFn = (o1, o2) => {
        const qcTypeLevel = {
          GA: 1,
          Beta: 2,
          Alpha: 3
        }
        const o1Level = qcTypeLevel[o1.qcType]
        const o2Level = qcTypeLevel[o2.qcType]

        if (o1Level === o2Level) {
          return o1.name.localeCompare(o2.name)
        }

        return o1Level - o2Level
      }

      connectorList.value = data.sort(sortFn)
    }

    const connectionPage = reactive({
      page: 1,
      size: 20
    })

    const loadConnectionList = async () => {
      let { page, size } = connectionPage
      let where = {
        createType: {
          $ne: 'System'
        },
        connection_type: {
          $ne: props.type === 'source' ? 'target' : 'source'
        }
      }
      let filter = {
        page,
        size,
        noSchema: 1,
        where
      }

      if (search.value.trim()) {
        where.name = { like: search.value, options: 'i' }
      }

      const data = await connectionsApi.get({
        filter: JSON.stringify(filter)
      })

      let list = data?.items || []

      list = list.map(item => {
        if (item.connectionString) {
          item.connectionUrl = item.connectionString
        } else {
          if (item.config?.uri) {
            const regResult =
              /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/gm.exec(
                item.config.uri
              )
            if (regResult && regResult.groups && regResult.groups.password) {
              const { username, host, database, query } = regResult.groups
              item.connectionUrl = `mongodb://${username}:***@${host}/${database}${query ? '/' + query : ''}`
            } else {
              item.connectionUrl = item.config.uri
            }
          } else if (item.config) {
            const { host, port, database, schema } = item.config
            item.connectionUrl = host
              ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
              : ''
          }
        }

        item.lastUpdateTime = item.last_updated = item.last_updated
          ? dayjs(item.last_updated).format('YY-MM-DD HH:mm:ss')
          : '-'
        item.loadSchemaTimeLabel = item.loadSchemaTime ? dayjs(item.loadSchemaTime).format('YY-MM-DD HH:mm:ss') : '-'
        item.disabledLoadSchema = false
        return item
      })

      connectionList.value = list
    }

    const loadConnection = async () => {
      const id = nodeRef.value.connectionId
      if (id) {
        const connection = await connectionsApi.getNoSchema(id)
        connectionSelected.value = connection
      }
    }

    const handleConnectorSelect = item => {
      connectorSelected.value = item

      if (optionSelected.value === 'no-connector') {
        nextTick(() => {
          setTimeout(() => {
            const { demoDatabase } = root.$store.state.config
            refs.connectorForm.schemaFormInstance.setValues({
              __TAPDATA: {
                name: `${item.name} Demo`
              },
              ...(demoDatabase[item.pdkId] || {})
            })
            refs.connectorForm.schemaFormInstance.setFieldState('*(!START.__TAPDATA.name)', {
              disabled: true
            })
          }, 0)
        })
      }
    }

    const handleConnectionSelect = data => {
      setNodeConnection(data)
    }

    const handleSearchInput = () => {}

    const handleCancelCreate = () => {
      connectorSelected.value = null
    }

    const handleTest = () => {
      refs.connectorForm.startTest()
    }

    const setNodeConnection = data => {
      const attrs = {
        connectionName: data.name,
        connectionType: data.connection_type,
        accessNodeProcessId: data.accessNodeProcessId,
        priorityProcessId: data.priorityProcessId,
        pdkType: data.pdkType,
        pdkHash: data.pdkHash,
        capabilities: data.capabilities || [],
        db_version: data.db_version
      }

      Object.assign(nodeRef.value, {
        name: data.name,
        databaseType: data.database_type,
        connectionId: data.id,
        migrateTableSelectType: 'custom',
        attrs
      })

      emit('next')
    }

    const handleSaveAndNext = async () => {
      const data = await refs.connectorForm.save()
      setNodeConnection(data)
    }

    const options = ref([
      {
        key: 'has-connection',
        title: '选择已有数据源',
        desc: '自己创建的连接/数据源'
      },
      {
        key: 'has-connector',
        title: '添加我自己的数据源',
        desc: '从TapData的连接列表中配置新的数据源'
      },
      {
        key: 'no-connector',
        title: '我没有数据源',
        desc: 'TapDat提供 2个数据源和2个目的地的Demo库'
      }
    ])

    loadConnectorList()
    loadConnectionList()
    loadConnection()

    const getStatus = status => {
      return CONNECTION_STATUS_MAP[status]?.text || '-'
    }

    const handlePrev = () => {
      emit('prev')
    }

    const handleNext = () => {
      emit('next')
    }

    return {
      pdkHash,
      pdkId,
      connectorName,
      options,
      hasConnector,
      optionSelected,
      search,
      connectorSelected,
      connectorList: filterConnectorList,
      demoConnectorList,
      connectionList,
      connectionSelected,
      currentStep: currentStepRef,
      connectionIdSelected,

      handleConnectorSelect,
      handleSearchInput,
      handleCancelCreate,
      handleTest,
      handleSaveAndNext,
      getStatus,
      handleConnectionSelect,
      handlePrev,
      handleNext
    }
  }
})
</script>

<style scoped lang="scss">
.connector-input {
  .el-input__inner {
    padding-left: 32px;
    padding-right: 40px;
  }
}

.active-group {
  .is-active {
    display: none;
  }

  &.active {
    $primary: map-get($color, primary);
    border-color: $primary !important;
    box-shadow: 0 2px 16px rgba(44, 101, 255, 0.2);

    .is-active {
      display: block;

      &-triangle {
        width: 0;
        height: 0;
        border-top: 18px solid $primary;
        border-left: 18px solid transparent;
        border-bottom: 18px solid transparent;
        border-right: 18px solid $primary;
      }

      &-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        color: #fff;
      }
    }
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
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
  }
}
</style>
