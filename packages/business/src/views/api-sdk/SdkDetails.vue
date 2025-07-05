<script setup lang="ts">
import {
  deleteSdkVersion,
  fetchApiClients,
  fetchApiModules,
  fetchSdk,
  fetchSdkVersionApiList,
  fetchSdkVersions,
  useRequest,
  type ApiClientVo,
} from '@tap/api'
import { Modal } from '@tap/component/src/modal'
import { RightBoldOutlined } from '@tap/component/src/RightBoldOutlined'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import { debounce } from 'lodash-es'
import { computed, nextTick, ref, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import { dayjs } from '../../shared/dayjs'
import ApiDrawer from '../data-server/Drawer.vue'
import SdkDialog from './SdkDialog.vue'
import Status from './Status.vue'

const { t } = useI18n()

const router = useRouter()

const { id } = toRefs(router.currentRoute.value.params)

const showSearch = ref(false)
const filterText = ref('')
const searchInput = ref<any>(null)
const apiDrawer = ref<any>(null)
const sdkDialog = ref<any>(null)

const selectedVersion = ref<any>()

const statusMap = {
  FAILED: {
    text: '失败',
    type: 'danger',
  },
  GENERATED: {
    text: '已生成',
    type: 'success',
  },
  GENERATING: {
    text: '生成中',
    type: '',
  },
}

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

const { data: sdk } = useRequest(
  async () => {
    const res = await fetchSdk(router.currentRoute.value.params.id as string)
    return res
  },
  {
    initialData: null,
  },
)

const { data: allVersionList, runAsync: runFetchSdkVersions } = useRequest(
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
    pollingInterval: 10000,
  },
)

// 前端搜索过滤的版本列表
const versionList = computed(() => {
  if (!filterText.value.trim()) {
    return allVersionList.value
  }

  const searchText = filterText.value.toLowerCase()
  return allVersionList.value.filter((version) => {
    return version.version.toLowerCase().includes(searchText)
  })
})

const {
  data: apiList,
  run: runFetchApiList,
  loading: apiListLoading,
} = useRequest(
  async () => {
    if (!selectedVersion.value) {
      return []
    }

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
  if (showSearch.value) {
    // 当打开搜索时，聚焦到搜索框
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    // 当关闭搜索时，清空搜索内容
    filterText.value = ''
  }
}

const handleVersionSelect = (version: any) => {
  selectedVersion.value = version
  runFetchApiList()
}

const openApiDrawer = (item?: any) => {
  apiDrawer.value?.open(item)
}

const handleDownload = (gridfsId: string) => {
  window.open(`/api/SDK/download/${gridfsId}`, '_blank')
}

// 防抖搜索函数
const debouncedSearch = debounce((value: string) => {
  filterText.value = value
}, 300)

const handleSearchVersion = (value: string) => {
  debouncedSearch(value)
}

const handleAddVersion = () => {
  sdkDialog.value.open(sdk.value)
}

const handleDeleteVersion = async () => {
  const res = await Modal.confirm({
    title: t('public_delete_version'),
    message: t('public_delete_version_message', {
      version: selectedVersion.value.version,
    }),
  })

  if (res) {
    await deleteSdkVersion(selectedVersion.value.id)
    await runFetchSdkVersions()

    ElMessage.success(t('public_message_delete_ok'))

    if (allVersionList.value.length > 0) {
      handleVersionSelect(allVersionList.value[0])
    } else {
      selectedVersion.value = null
    }
  }
}
</script>

<template>
  <PageContainer>
    <template #title>
      <span class="fs-5 font-color-dark lh-8 ellipsis">{{
        sdk?.artifactId
      }}</span>
      <el-tag v-if="selectedVersion" class="ml-2 is-code">
        <VIcon class="align-middle mr-1" size="14">Versions</VIcon>
        <span class="align-middle">{{ selectedVersion.version }}</span>
      </el-tag>
    </template>

    <template v-if="selectedVersion" #actions>
      <el-button
        v-if="selectedVersion.zipGridfsId"
        @click="handleDownload(selectedVersion.zipGridfsId)"
      >
        <el-icon class="mr-1">
          <i-mingcute:download-2-line />
        </el-icon>
        {{ $t('public_button_download') }} ZIP
      </el-button>

      <el-button
        v-if="selectedVersion.jarGridfsId"
        @click="handleDownload(selectedVersion.jarGridfsId)"
      >
        <el-icon class="mr-1">
          <i-mingcute:download-2-line />
        </el-icon>
        {{ $t('public_button_download') }} JAR
      </el-button>

      <el-dropdown trigger="click">
        <el-button circle class="rounded-lg">
          <el-icon size="16">
            <i-mingcute:more-1-fill />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="is-danger" @click="handleDeleteVersion">
              <el-icon class="mr-2">
                <i-lucide:trash-2 />
              </el-icon>
              {{ $t('public_button_delete') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
            <span>{{ $t('public_history_version') }}</span>
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
          <el-button text @click="handleAddVersion">
            <template #icon>
              <i-mingcute:add-line />
            </template>
          </el-button>
        </div>
        <div v-if="showSearch" class="px-2 pb-2">
          <ElInput
            ref="searchInput"
            v-model="filterText"
            clearable
            :placeholder="$t('public_search_version')"
            @input="handleSearchVersion"
          >
            <template #prefix>
              <VIcon size="14">magnify</VIcon>
            </template>
          </ElInput>
        </div>

        <el-scrollbar class="flex-1 min-h-0" wrap-class="p-2 pt-0">
          <div
            v-if="filterText && versionList.length === 0"
            class="text-center py-8 text-disabled"
          >
            <el-icon size="24" class="mb-2">
              <i-mingcute:search-line />
            </el-icon>
            <div>{{ $t('public_no_match_version') }}</div>
          </div>
          <div
            v-else-if="filterText && versionList.length > 0"
            class="text-caption text-disabled px-2 py-1 mb-2"
          >
            {{ $t('public_find_version', { count: versionList.length }) }}
          </div>

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
                  <span class="text-caption flex align-center gap-1">
                    <el-icon>
                      <i-lucide:clock />
                    </el-icon>
                    <span class="fs-8">{{ version.updatedFromNow }}</span>
                  </span>
                  <Status
                    v-if="
                      version.generateStatus &&
                      version.generateStatus !== 'GENERATED'
                    "
                    size="small"
                    class="ml-auto"
                    :status="version.generateStatus"
                    :error-message="version.generationErrorMessage"
                  />

                  <!-- <el-tag
                    v-if="
                      version.generateStatus &&
                      version.generateStatus !== 'GENERATED'
                    "
                    size="small"
                    class="ml-auto"
                    :type="statusMap[version.generateStatus].type"
                  >
                    {{ statusMap[version.generateStatus].text }}
                  </el-tag> -->
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <div class="flex-1 flex flex-column gap-4">
        <div class="bg-light rounded-xl">
          <div class="px-4 py-2 fs-6 lh-8">{{ $t('public_version_info') }}</div>
          <div class="px-2 pb-2">
            <div
              v-if="sdk && selectedVersion"
              class="bg-white rounded-xl p-3"
              style="border: 1px solid #f2f4f7"
            >
              <div class="flex align-center gap-4">
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:package />
                    </el-icon>
                    {{ $t('public_package_name') }}
                  </span>
                  <span>{{ sdk.packageName }}</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:hard-drive />
                    </el-icon>
                    {{ $t('public_zip_package') }}
                  </span>
                  <span>{{
                    selectedVersion.zipGridfsId ? selectedVersion.zipSize : '-'
                  }}</span>
                  <!-- <span class="flex align-center gap-2">
                    <el-button
                      v-if="selectedVersion.zipGridfsId"
                      text
                      @click="handleDownload(selectedVersion.zipGridfsId)"
                    >
                      <el-icon class="mr-1">
                        <i-mingcute:arrow-to-down-line />
                      </el-icon>
                      下载
                      <span class="text-caption ml-1">{{
                        selectedVersion.zipSize
                      }}</span>
                    </el-button>
                    <span v-else>-</span>
                  </span> -->
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:hard-drive />
                    </el-icon>
                    {{ $t('public_jar_package') }}
                  </span>
                  <span>{{
                    selectedVersion.jarGridfsId ? selectedVersion.jarSize : '-'
                  }}</span>
                  <!-- <span class="flex align-center gap-2">
                    <el-button
                      v-if="selectedVersion.jarGridfsId"
                      text
                      @click="handleDownload(selectedVersion.jarGridfsId)"
                    >
                      <el-icon class="mr-1">
                        <i-mingcute:arrow-to-down-line />
                      </el-icon>
                      下载
                      <span class="text-caption ml-1">{{
                        selectedVersion.jarSize
                      }}</span>
                    </el-button>
                    <Status
                      v-else-if="selectedVersion.jarGenerationErrorMessage"
                      status="FAILED"
                      :error-message="selectedVersion.jarGenerationErrorMessage"
                    />
                    <span v-else>-</span>
                  </span> -->
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:server />
                    </el-icon>
                    {{ $t('public_client') }}
                  </span>
                  <span>{{ clientName }}</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:calendar />
                    </el-icon>
                    {{ $t('public_release_time') }}
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
          <div class="px-4 py-2 fs-6 lh-8">{{ $t('public_api_list') }}</div>
          <div class="px-2 pb-2 flex-1 min-h-0">
            <div
              class="bg-white rounded-xl p-2 h-100"
              style="border: 1px solid #f2f4f7"
            >
              <el-table
                v-loading="apiListLoading"
                :data="apiList"
                class="w-100"
                height="100%"
                row-class-name="cursor-pointer"
                @row-click="openApiDrawer"
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

        <ApiDrawer ref="apiDrawer" />
      </div>
    </div>

    <SdkDialog ref="sdkDialog" @success="runFetchSdkVersions" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.desc-item {
  min-width: 140px;
}
</style>
