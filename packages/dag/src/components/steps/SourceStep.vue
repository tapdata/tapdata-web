<script>
import { connectionsApi, databaseTypesApi } from '@tap/api'
import { getConnectorImage } from '@tap/assets'
import {
  CONNECTION_STATUS_MAP,
  ConnectorForm,
  DatabaseIcon,
  verify,
} from '@tap/business'
import { VEmpty } from '@tap/component'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  provide,
  reactive,
  ref,
} from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'SourceStep',
  components: { VEmpty, DatabaseIcon, ConnectorForm },
  props: {
    type: {
      type: String,
      default: 'source',
    },
  },
  setup(props, { refs, emit }) {
    const store = useStore()
    const pdkHash = ref('')
    const pdkId = ref('')
    const connectorName = ref('')
    const hasConnector = ref(true)
    const search = ref('')
    const connectorList = ref([])
    const connectionList = ref([])
    const connectorSelected = ref()

    const connectorForm = ref()

    const taskRef = inject('task')
    const isGuide = inject('isGuide')
    const nodeRef = inject(props.type)
    const currentStepRef = inject('currentStep')
    console.log('nodeRef', nodeRef.value)
    // const buried = inject('buried')
    // const checkAgent = inject('checkAgent')
    const optionSelected = ref(
      nodeRef.value.connectionId ? 'has-connection' : 'has-connector',
    )
    const connectionIdSelected = ref(nodeRef.value.connectionId)
    const connectionSelected = ref(null)

    const filterConnectorList = computed(() => {
      const list =
        optionSelected.value !== 'has-connector'
          ? demoConnectorList.value
          : connectorList.value

      if (search.value) {
        const query = search.value.toLowerCase()
        return list.filter((db) => db.name.toLowerCase().includes(query))
      }
      return list
    })

    const map = {
      source: ['mysql', 'mock-source'],
      target: ['mongodb', 'mock-target'],
    }

    const demoConnectorList = computed(() => {
      return connectorList.value.filter((t) =>
        map[props.type].includes(t.pdkId),
      )
    })

    const loadConnectorList = async () => {
      const params = {
        where: {
          tag: 'All',
          authentication: 'All',
        },
        order: 'name ASC',
      }

      let data = await databaseTypesApi.getDatabases({
        filter: JSON.stringify(params),
      })

      data = data.filter((item) => item.connectionType.includes(props.type))

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

      connectorList.value = data.sort(sortFn)
    }

    const connectionPage = reactive({
      page: 1,
      size: 21,
      total: 0,
    })

    const moreLoading = ref(false)

    const loading = ref(false)

    const noMore = computed(() => {
      return (
        connectionPage.page >=
        Math.ceil(connectionPage.total / connectionPage.size)
      )
    })

    const moreDisabled = computed(() => {
      return loading.value || noMore.value || moreLoading.value
    })

    const loadConnectionList = async (loadMore) => {
      if (loadMore) {
        connectionPage.page++
        moreLoading.value = true
      } else {
        loading.value = true
        connectionPage.page = 1
        connectionPage.total = 0
      }

      const { page, size } = connectionPage
      const where = {
        createType: {
          $ne: 'System',
        },
        connection_type: {
          $ne: props.type === 'source' ? 'target' : 'source',
        },
      }
      const filter = {
        page,
        size,
        noSchema: 1,
        where,
      }

      if (search.value.trim()) {
        where.name = { like: search.value, options: 'i' }
      }

      const data = await connectionsApi.get({
        filter: JSON.stringify(filter),
      })

      let list = data?.items || []

      list = list.map((item) => {
        if (item.connectionString) {
          item.connectionUrl = item.connectionString
        } else if (item.config?.uri) {
          const regResult =
            /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
              item.config.uri,
            )
          if (regResult && regResult.groups && regResult.groups.password) {
            const { username, host, database, query } = regResult.groups
            item.connectionUrl = `mongodb://${username}:***@${host}/${database}${query ? `/${query}` : ''}`
          } else {
            item.connectionUrl = item.config.uri
          }
        } else if (item.config) {
          const { host, port, database, schema } = item.config
          item.connectionUrl = host
            ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
            : ''
        }

        item.lastUpdateTime = item.last_updated = item.last_updated
          ? dayjs(item.last_updated).format('YY-MM-DD HH:mm:ss')
          : '-'
        item.loadSchemaTimeLabel = item.loadSchemaTime
          ? dayjs(item.loadSchemaTime).format('YY-MM-DD HH:mm:ss')
          : '-'
        item.disabledLoadSchema = false
        return item
      })

      if (loadMore) {
        // 防止重复push
        list.forEach((item) => {
          connectionList.value.push(item)
        })
        moreLoading.value = false
      } else {
        connectionList.value = list
        loading.value = false
      }

      connectionPage.total = data.total
    }

    const loadMoreConnection = () => {
      if (moreDisabled.value || optionSelected.value !== 'has-connection')
        return

      loadConnectionList(true)
    }

    const loadConnection = async () => {
      const id = nodeRef.value.connectionId
      if (id) {
        const connection = await connectionsApi.getNoSchema(id)
        connectionSelected.value = connection
      }
    }

    const handleConnectorSelect = (item) => {
      connectorSelected.value = item

      if (optionSelected.value === 'no-connector') {
        nextTick(() => {
          setTimeout(() => {
            const { demoDatabase } = store.state.config
            connectorForm.value.schemaFormInstance.setValues({
              __TAPDATA: {
                name: `${item.name} Demo`,
              },
              ...(demoDatabase[item.pdkId] || {}),
            })
            connectorForm.value.schemaFormInstance.setFieldState(
              '*(!START.__TAPDATA.name)',
              {
                disabled: true,
              },
            )
          }, 0)
        })
      }
    }

    const handleConnectionSelect = (data) => {
      setNodeConnection(data)
    }

    const handleSearchInput = () => {
      if (optionSelected.value === 'has-connection') {
        loadConnectionList()
      }
    }

    const handleCancelCreate = () => {
      connectorSelected.value = null
    }

    const handleTest = () => {
      connectorForm.value.startTest()
    }

    const setNodeConnection = (data) => {
      const attrs = {
        connectionName: data.name,
        connectionType: data.connection_type,
        accessNodeProcessId: data.accessNodeProcessId,
        priorityProcessId: data.priorityProcessId,
        pdkType: data.pdkType,
        pdkHash: data.pdkHash,
        capabilities: data.capabilities || [],
        db_version: data.db_version,
      }

      Object.assign(nodeRef.value, {
        name: data.name,
        databaseType: data.database_type,
        connectionId: data.id,
        migrateTableSelectType: 'custom',
        attrs,
      })

      emit('next')
    }

    const handleSaveAndNext = async () => {
      const data = await connectorForm.value.save()
      setNodeConnection(data)
    }

    const options = computed(() => {
      if (isGuide.value && !connectionIdSelected.value) {
        return [
          {
            key: 'has-connector',
            title: i18n.t(
              props.type === 'source'
                ? 'packages_dag_add_own_datasource'
                : 'packages_dag_add_own_target_datasource',
            ),
            desc: i18n.t('packages_dag_add_own_datasource_desc'),
          },
          {
            key: 'no-connector',
            title: i18n.t(
              props.type === 'source'
                ? 'packages_dag_no_datasource'
                : 'packages_dag_no_target_datasource',
            ),
            desc: i18n.t('packages_dag_no_datasource_desc'),
          },
        ]
      }

      return [
        {
          key: 'has-connection',
          title: i18n.t('packages_dag_have_connection'),
          desc: i18n.t('packages_dag_have_connection_desc'),
        },
        {
          key: 'has-connector',
          title: i18n.t('packages_dag_add_new_connection'),
          desc: i18n.t('packages_dag_add_own_datasource_desc'),
        },
      ]
    })

    loadConnectorList()
    loadConnectionList()
    loadConnection()

    const getStatus = (status) => {
      return CONNECTION_STATUS_MAP[status]?.text || '-'
    }

    const handlePrev = () => {
      emit('prev')
    }

    const handleNext = () => {
      emit('next')
    }

    const getIconSrc = (icon) => {
      return getConnectorImage(icon)
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
      connectorForm,

      moreDisabled,
      moreLoading,
      loadMoreConnection,
      loadConnection,
      loadConnectorList,

      handleConnectorSelect,
      ElMessage,
      handleCancelCreate,
      handleTest,
      handleSaveAndNext,
      getStatus,
      handleConnectionSelect,
      handlePrev,
      handleNext,
      getIconSrc,
    }
  },
})
</script>

<template>
  <div class="h-100">
    <div
      v-if="!connectorSelected"
      v-infinite-scroll="loadMoreConnection"
      class="flex flex-column gap-4 h-100 overflow-y-auto"
      :infinite-scroll-disabled="moreDisabled"
    >
      <div class="p-4 bg-white rounded-lg">
        <div class="flex gap-6 lh-base">
          <div
            v-for="(item, i) in options"
            :key="i"
            :class="{
              active: item.key === optionSelected,
            }"
            class="flex flex-column flex-1 position-relative cursor-pointer overflow-hidden rounded-lg border active-group"
            @click="optionSelected = item.key"
          >
            <div class="flex p-4">
              <div>
                <div class="fs-6 fw-bold mb-1 font-color-dark">
                  {{ item.title }}
                </div>
                <div class="font-color-light">{{ item.desc }}</div>
              </div>
            </div>
            <div class="is-active position-absolute top-0 end-0">
              <div class="is-active-triangle" />
              <VIcon size="16" class="is-active-icon">check-bold</VIcon>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg">
        <div class="title-prefix-bar mb-4 position-relative">
          <span style="line-height: 32px">{{
            $t(
              optionSelected === 'has-connection'
                ? 'packages_dag_select_connection'
                : 'packages_dag_select_datasource',
            )
          }}</span>

          <ElInput
            v-model="search"
            class="position-absolute start-50 top-50 translate-middle"
            style="width: 400px"
            clearable
            :placeholder="
              $t(
                optionSelected === 'has-connection'
                  ? 'packages_dag_search_connection'
                  : 'packages_dag_search_datasource',
              )
            "
            @input="handleSearchInput"
          >
            <template #prefix>
              <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
            </template>
          </ElInput>
        </div>

        <div class="rounded-lg px-4">
          <template
            v-if="connectionIdSelected && optionSelected === 'has-connection'"
          >
            <div class="mb-4">
              <span class="fw-sub">{{
                $t('packages_dag_current_selected')
              }}</span>
            </div>

            <div class="connector-list grid gap-4 mb-4">
              <el-skeleton :loading="!connectionSelected" animated>
                <template #template>
                  <div
                    class="rounded-lg p-3 overflow-hidden bg-white flex gap-3 align-center"
                  >
                    <el-skeleton-item
                      variant="image"
                      style="width: 38px; height: 38px"
                    />
                    <div class="flex-1">
                      <div
                        class="flex align-center justify-content-between gap-3 mb-2"
                      >
                        <el-skeleton-item variant="h3" />
                        <el-skeleton-item variant="h3" style="width: 28%" />
                      </div>
                      <el-skeleton-item variant="text" style="width: 50%" />
                    </div>
                  </div>
                </template>
                <template #default>
                  <div
                    v-if="connectionSelected"
                    class="connector-item rounded-lg p-3 overflow-hidden bg-white border"
                  >
                    <div class="flex gap-3 align-center">
                      <DatabaseIcon :size="38" :item="connectionSelected" />
                      <div
                        class="connector-item-content flex-1 overflow-hidden lh-base"
                      >
                        <div class="flex align-center font-color-dark ellipsis">
                          <span class="fs-6 ellipsis mr-1">{{
                            connectionSelected.name
                          }}</span>
                          <span
                            class="ml-auto rounded-4 p-1 lh-1 min-w-0"
                            :class="[
                              `status-connection-${connectionSelected.status}`,
                              'status-block',
                            ]"
                          >
                            {{ getStatus(connectionSelected.status) }}
                          </span>
                        </div>
                        <div class="font-color-sslight ellipsis">
                          {{ connectionSelected.connectionString }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
            <el-divider />
          </template>

          <div
            v-if="optionSelected === 'has-connection'"
            class="connector-list grid gap-4"
          >
            <div
              v-for="item in connectionList"
              :key="item.type"
              class="connector-item rounded-lg p-3 overflow-hidden bg-white clickable"
              @click="handleConnectionSelect(item)"
            >
              <div class="flex gap-3 align-center">
                <DatabaseIcon :size="38" :item="item" />
                <div
                  class="connector-item-content flex-1 overflow-hidden lh-base"
                >
                  <div class="flex align-center font-color-dark ellipsis">
                    <span class="fs-6 ellipsis mr-1">{{ item.name }}</span>
                    <span
                      class="ml-auto rounded-4 p-1 lh-1 min-w-0"
                      :class="[
                        `status-connection-${item.status}`,
                        'status-block',
                      ]"
                    >
                      {{ getStatus(item.status) }}
                    </span>
                  </div>
                  <div class="font-color-sslight ellipsis">
                    {{ item.connectionString }}
                  </div>
                </div>
              </div>
            </div>
            <div style="grid-column: 1 / 4">
              <VEmpty v-if="!connectionList.length" />
              <div
                v-if="moreLoading"
                class="text-center text-black-50 fs-8 p-2"
              >
                {{ $t('packages_dag_loading') }}<span class="dotting" />
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
                <DatabaseIcon v-if="!item.locked" :size="38" :item="item" />
                <ElImage
                  v-else
                  style="width: 38px; height: 38px"
                  :src="getIconSrc(item.icon)"
                />
                <div class="connector-item-content flex-1 overflow-hidden">
                  <div
                    class="connector-item-title font-color-dark flex align-center"
                  >
                    <span class="ellipsis mr-1">{{ item.name }}</span>
                    <VIcon v-if="item.locked" size="24">lock-circle</VIcon>
                    <VIcon
                      v-if="item.qcType === 'GA'"
                      size="24"
                      class="ml-auto color-success"
                      >verified</VIcon
                    >
                    <ElTag
                      v-else-if="item.qcType"
                      class="text-uppercase ml-auto px-1 connector-item-tag"
                      >{{ item.qcType }}
                    </ElTag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="step-footer flex align-center position-sticky z-index bottom-0 p-4 mt-auto rounded-lg backdrop-filter-light z-10 border"
      >
        <el-button v-if="currentStep > 0" @click="handlePrev">{{
          $t('public_button_previous')
        }}</el-button>
        <el-button
          v-if="connectionIdSelected"
          type="primary"
          @click="$emit('next', true)"
          >{{ $t('public_button_next') }}</el-button
        >
        <el-divider class="mx-4" direction="vertical" />
        <slot name="help" />
      </div>
    </div>

    <ConnectorForm
      v-else
      ref="connectorForm"
      :connector="connectorSelected"
      show-ip-tips
      :connection-type="type"
    >
      <template #header>
        <div class="title-prefix-bar mb-4 flex align-center gap-2">
          <span class="flex-1">{{
            $t(
              type === 'source'
                ? 'public_create_source_connection'
                : 'public_create_target_connection',
            )
          }}</span>
          <DatabaseIcon :pdk-hash="connectorSelected.pdkHash" :size="20" />
          <span class="fw-normal">{{ connectorSelected.name }}</span>
        </div>
      </template>
      <template #footer>
        <div>
          <el-button @click="handleCancelCreate">{{
            $t('public_button_back')
          }}</el-button>
          <el-button type="primary" @click="handleTest">{{
            $t('public_test_and_continue')
          }}</el-button>
          <el-divider class="mx-4" direction="vertical" />
          <slot name="help" />
        </div>
      </template>

      <template #test-cancel="{ status, close }">
        <div v-if="status === 'ready'" style="display: contents">
          <el-button @click="close">{{ $t('public_button_close') }}</el-button>
          <el-button type="primary" @click="handleSaveAndNext">{{
            $t('public_button_next')
          }}</el-button>
        </div>
        <el-button v-else type="primary" @click="close">{{
          $t('public_button_close')
        }}</el-button>
      </template>
    </ConnectorForm>
  </div>
</template>

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
    $primary: var(--color-primary);
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
</style>
