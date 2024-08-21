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
            v-model="connectorSearch"
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
          <div class="connector-list grid gap-4">
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
        <el-button>取消</el-button>
        <!--<el-button type="primary" @click="$emit('next')">启动任务</el-button>-->
      </div>
    </div>
    <ConnectorForm v-else ref="connectorForm" :connector="connectorSelected" show-ip-tips>
      <template #header>
        <div class="title-prefix-bar mb-4 flex align-center gap-2">
          <span class="flex-1">创建源连接</span>
          <DatabaseIcon :pdk-hash="connectorSelected.pdkHash" :size="20"></DatabaseIcon>
          <span class="fw-normal">{{ connectorSelected.name }}</span>
        </div>
      </template>
      <!--<template #prepend>
        <ConnectorFormItem
          :pdk-hash="connectorSelected.pdkHash"
          :connector-name="connectorSelected.name"
        ></ConnectorFormItem>
      </template>-->
      <template #footer>
        <div>
          <el-button @click="handleCancelCreate">返回</el-button>
          <!--<el-button>上一步</el-button>-->
          <el-button type="primary" @click="handleTest">测试连接以进行下一步</el-button>
          <!--<el-button type="primary" @click="$emit('next')">测试连接以进行下一步</el-button>-->
        </div>
      </template>

      <template #test-cancel="{ status, close }">
        <el-button v-if="status === 'ready'" type="primary">下一步</el-button>
        <el-button v-else type="primary" @click="close">关闭</el-button>
      </template>
    </ConnectorForm>
  </div>
</template>

<script>
import { defineComponent, ref, computed, nextTick, provide, inject } from '@vue/composition-api'
import { ConnectorForm, DatabaseIcon } from '@tap/business'
import { databaseTypesApi } from '@tap/api'
import ConnectorFormItem from './ConnectorFormItem.vue'

export default defineComponent({
  name: 'SourceStep',
  props: {
    type: {
      type: String,
      default: 'source'
    }
  },
  components: { DatabaseIcon, ConnectorForm, ConnectorFormItem },
  setup(props, { refs, root }) {
    const pdkHash = ref('')
    const pdkId = ref('')
    const connectorName = ref('')
    const hasConnector = ref(true)
    const optionSelected = ref('has-connector')
    const connectorSearch = ref('')
    const connectorList = ref([])
    const connectorSelected = ref()

    const filterConnectorList = computed(() => {
      const list = optionSelected.value !== 'has-connector' ? demoConnectorList.value : connectorList.value

      if (connectorSearch.value) {
        let search = connectorSearch.value.toLowerCase()
        return list.filter(db => db.name.toLowerCase().includes(search))
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

    const handleSearchInput = () => {}

    const handleCancelCreate = () => {
      connectorSelected.value = null
    }

    const buried = inject('buried')
    const checkAgent = inject('checkAgent')

    const handleTest = () => {
      refs.connectorForm.startTest()
    }

    const options = ref([
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

    return {
      pdkHash,
      pdkId,
      connectorName,
      options,
      hasConnector,
      optionSelected,
      connectorSearch,
      connectorSelected,
      connectorList: filterConnectorList,
      demoConnectorList,

      handleConnectorSelect,
      handleSearchInput,
      handleCancelCreate,
      handleTest
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
