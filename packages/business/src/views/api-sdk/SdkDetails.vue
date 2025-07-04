<script setup lang="ts">
import {
  fetchApiClients,
  fetchApiModules,
  fetchSdk,
  fetchSdkVersionApiList,
  fetchSdkVersions,
  useRequest,
  type ApiClientVo,
} from '@tap/api'
import { RightBoldOutlined } from '@tap/component/src/RightBoldOutlined'
import { calcUnit } from '@tap/shared'
import { computed, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import { dayjs } from '../../shared/dayjs'

const router = useRouter()

const { id } = toRefs(router.currentRoute.value.params)

const showList = ref(false)
const showSearch = ref(false)
const filterText = ref('')
const searchInput = ref<any>(null)
const table = ref<any>(null)
const dragState = ref<any>(null)
const pendingSelection = ref<any>([])

const selectedVersion = ref<any>()

const mapApi = (item: any) => {
  const pathJoin: string[] = []
  item.apiVersion && pathJoin.push(item.apiVersion)
  item.prefix && pathJoin.push(item.prefix)
  item.basePath && pathJoin.push(item.basePath)
  item.baseUrl = `/${pathJoin.join('/')}`
  item.label = item.name

  return item
}

const {
  data: clientMap,
  loading: apiClientsLoading,
  run: runFetchApiClients,
} = useRequest(
  async () => {
    const res = await fetchApiClients({
      limit: 1000,
    })

    if (res.items.length === 0) {
      return {}
    }

    return res.items.reduce(
      (acc, item) => {
        acc[item.clientId] = item
        return acc
      },
      {} as Record<string, ApiClientVo>,
    )
  },
  {
    initialData: {},
  },
)

const { data: sdk, run: runFetchSdk } = useRequest(
  async () => {
    const res = await fetchSdk(router.currentRoute.value.params.id as string)
    return res
  },
  {
    initialData: null,
  },
)

const { data: versionList, run: runFetchSdkVersions } = useRequest(
  async () => {
    const res = await fetchSdkVersions({
      order: 'createTime DESC',
      limit: 1000,
      where: {
        sdkId: router.currentRoute.value.params.id as string,
      },
    })

    const list = res.items.map((item) => {
      item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
      item.last_updated = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
      item.updatedFromNow = dayjs(item.createTime).fromNow()

      item.zipSize = calcUnit(item.zipSizeOfByte, 'byte', 2)
      item.jarSize = calcUnit(item.jarSizeOfByte, 'byte', 2)
      return item
    })

    if (!selectedVersion.value) {
      handleVersionSelect(list[0])
    }

    return list
  },
  {
    initialData: [],
  },
)

const { data: apiList, run: runFetchApiList } = useRequest(
  async () => {
    const res = await fetchSdkVersionApiList({
      order: 'createAt DESC',
      limit: 1000,
      where: {
        sdkVersionId: selectedVersion.value.id,
        sdkId: router.currentRoute.value.params.id as string,
      },
    })

    return res.items.map(mapApi)
  },
  {
    manual: true,
    initialData: [],
  },
)

const clientName = computed(() => {
  return clientMap.value[sdk.value?.clientId]?.name
})

const openSearch = () => {
  showSearch.value = !showSearch.value
}

const handleVersionSelect = (version: any) => {
  selectedVersion.value = version
  runFetchApiList()
}
</script>

<template>
  <PageContainer>
    <template #title>
      <span class="fs-5 font-color-dark lh-8 ellipsis"> TapData - sdk </span>
      <el-tag v-if="selectedVersion" class="ml-2 is-code">
        <VIcon class="align-middle mr-1" size="14">Versions</VIcon>
        <span class="align-middle">{{ selectedVersion.version }}</span>
      </el-tag>
    </template>

    <div class="flex w-100 h-100 gap-4">
      <div
        class="py-0 bg-light rounded-xl flex flex-column h-100"
        style="width: 240px"
      >
        <div
          class="lh-8 flex align-center gap-1 py-2 pl-4 pr-2"
          style="--btn-space: 0"
        >
          <div class="fs-6 flex-1">
            <span>历史版本</span>
          </div>
          <el-button
            text
            :class="{ 'is-active': showSearch }"
            @click="openSearch"
          >
            <template #icon>
              <i-mingcute:search-line />
            </template>
          </el-button>
          <el-button text>
            <template #icon>
              <i-mingcute:add-line />
            </template>
          </el-button>
        </div>
        <div v-if="showSearch" class="px-2 pb-2">
          <ElInput ref="searchInput" v-model="filterText" clearable>
            <template #prefix>
              <VIcon size="14">magnify</VIcon>
            </template>
          </ElInput>
        </div>

        <el-scrollbar class="flex-1 min-h-0" wrap-class="p-2 pt-0">
          <div class="flex flex-column gap-1">
            <div
              v-for="version in versionList"
              :key="version.id"
              class="list-item-hover rounded-lg p-2 flex align-center gap-2 cursor-pointer font-color-light position-relative"
              :class="{
                'bg-white shadow-sm font-color-dark':
                  version.id === selectedVersion.id,
              }"
              @click="handleVersionSelect(version)"
            >
              <div class="flex flex-column gap-1 flex-1 min-w-0">
                <div class="flex align-center gap-2">
                  <VIcon size="16">Versions</VIcon>
                  <span class="ellipsis lh-6">{{ version.version }}</span>
                </div>
                <div class="flex align-center gap-2 text-caption">
                  <!-- <span class="text-caption">
                    {{ version.apiCount }}
                    APIs
                  </span>
                  <el-divider direction="vertical" class="mx-0" /> -->
                  <span class="text-caption">
                    <el-icon class="align-middle mr-1">
                      <i-lucide:clock />
                    </el-icon>
                    <span class="align-middle">{{
                      version.updatedFromNow
                    }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <div class="flex-1 flex flex-column gap-4">
        <div class="bg-light rounded-xl">
          <div class="px-4 py-2 fs-6 lh-8">版本信息</div>
          <div class="px-2 pb-2">
            <div
              v-if="sdk"
              class="bg-white rounded-xl p-3"
              style="border: 1px solid #f2f4f7"
            >
              <div class="flex align-center gap-4">
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:package />
                    </el-icon>
                    包名
                  </span>
                  <span>{{ sdk.packageName }}</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-mingcute:folder-zip-line />
                    </el-icon>
                    zip包
                  </span>
                  <span class="flex align-center gap-2">
                    <el-button text>
                      <el-icon class="mr-1">
                        <i-mingcute:arrow-to-down-line />
                      </el-icon>
                      下载
                      <span class="text-caption ml-1">{{
                        selectedVersion.zipSize
                      }}</span>
                    </el-button>
                  </span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-mingcute:folder-zip-line />
                    </el-icon>
                    jar包
                  </span>
                  <span class="flex align-center gap-2">
                    <el-button text>
                      <el-icon class="mr-1">
                        <i-mingcute:arrow-to-down-line />
                      </el-icon>
                      下载
                      <span class="text-caption ml-1">{{
                        selectedVersion.jarSize
                      }}</span>
                    </el-button>
                  </span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:server />
                    </el-icon>
                    客户端
                  </span>
                  <span>{{ clientName }}</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:calendar />
                    </el-icon>
                    发布时间
                  </span>
                  <span>{{ selectedVersion.createTime }}</span>
                </div>
                <!-- <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:calendar />
                    </el-icon>
                    更新时间
                  </span>
                  <span>{{ selectedVersion.last_updated }}</span>
                </div> -->
              </div>
            </div>
          </div>
        </div>

        <div class="bg-light rounded-xl min-h-0 flex flex-column">
          <div class="px-4 py-2 fs-6 lh-8">API 列表</div>
          <div class="px-2 pb-2 flex-1 min-h-0">
            <div
              class="bg-white rounded-xl p-2 h-100"
              style="border: 1px solid #f2f4f7"
            >
              <el-table
                :data="apiList"
                class="w-100"
                height="100%"
                row-class-name="cursor-pointer"
              >
                <el-table-column
                  prop="name"
                  :label="
                    $t('packages_business_data_server_list_fuwumingcheng')
                  "
                />
                <el-table-column
                  :label="$t('public_connection_type')"
                  prop="connectionType"
                  :min-width="120"
                />
                <el-table-column
                  :label="$t('public_connection_name')"
                  prop="connectionName"
                  :min-width="200"
                />
                <el-table-column
                  :label="
                    $t('packages_business_data_server_list_guanlianduixiang')
                  "
                  prop="tableName"
                  :min-width="180"
                />
                <el-table-column
                  :label="$t('daas_data_server_drawer_path')"
                  prop="baseUrl"
                  :min-width="130"
                >
                  <template #default="{ row }">
                    <el-tag type="info" class="is-code" disable-transitions>{{
                      row.baseUrl
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column width="52" align="right">
                  <template #default="{ row }">
                    <el-button text>
                      <template #icon>
                        <i-mingcute:right-line />
                      </template>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.desc-item {
  min-width: 160px;
}
</style>
