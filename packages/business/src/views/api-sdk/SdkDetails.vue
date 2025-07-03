<script setup lang="ts">
import { fetchApiClients, fetchApiModules, useRequest } from '@tap/api'
import { RightBoldOutlined } from '@tap/component/src/RightBoldOutlined'
import { ref, toRefs } from 'vue'
import PageContainer from '../../components/PageContainer.vue'

const props = defineProps<{
  id: string
}>()

const { id } = toRefs(props)

const sdk = ref<any>(null)
const showList = ref(false)
const showSearch = ref(false)
const filterText = ref('')
const searchInput = ref<any>(null)
const table = ref<any>(null)
const dragState = ref<any>(null)
const pendingSelection = ref<any>([])
const versionList = ref<any>([
  {
    id: '1',
    name: '1.0.0',
    publishedApiCount: 10,
    apiCount: 10,
  },
  {
    id: '2',
    name: '2.0.0',
    apiCount: 5,
  },
])

const selectedVersion = ref<any>(versionList.value[0])

const mapApi = (item: any) => {
  const pathJoin: string[] = []
  item.apiVersion && pathJoin.push(item.apiVersion)
  item.prefix && pathJoin.push(item.prefix)
  item.basePath && pathJoin.push(item.basePath)
  item.baseUrl = `/${pathJoin.join('/')}`
  item.label = item.name

  return item
}

const { data: apiList, run: runFetchApiList } = useRequest(
  async () => {
    const res = await fetchApiModules({
      order: 'createAt DESC',
      limit: 1000,
      where: { status: 'active' },
    })

    return res.items.map(mapApi)
  },
  {
    // manual: true,
    initialData: [],
  },
)

const openSearch = () => {
  showSearch.value = !showSearch.value
}

const handleVersionSelect = (version: any) => {
  selectedVersion.value = version
}
</script>

<template>
  <PageContainer>
    <template #title>
      <span class="fs-5 font-color-dark lh-8 ellipsis"> TapData - sdk </span>
      <el-tag class="ml-2">
        <span class="flex align-center gap-1">
          <VIcon size="16">Versions</VIcon>
          <span>{{ selectedVersion.name }}</span>
        </span>
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
                  version === selectedVersion,
              }"
              @click="handleVersionSelect(version)"
            >
              <div class="flex flex-column gap-1 flex-1 min-w-0">
                <div class="flex align-center gap-2">
                  <VIcon size="16">Versions</VIcon>
                  <span class="ellipsis lh-6" :title="version.value">{{
                    version.name
                  }}</span>
                </div>
                <div class="flex align-center gap-2 text-caption">
                  <span class="text-caption">
                    {{ version.apiCount }}
                    APIs
                  </span>
                  <el-divider direction="vertical" class="mx-0" />
                  <span class="text-caption">
                    <el-icon class="align-middle mr-1">
                      <i-lucide:clock />
                    </el-icon>
                    <span class="align-middle">3 hours ago</span>
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
                  <span>io.tapdata</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:hard-drive />
                    </el-icon>
                    包大小
                  </span>
                  <span>2MB</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:server />
                    </el-icon>
                    客户端
                  </span>
                  <span>io.tapdata</span>
                </div>
                <div class="flex flex-column gap-2 desc-item">
                  <span class="text-caption flex align-center gap-2">
                    <el-icon>
                      <i-lucide:calendar />
                    </el-icon>
                    发布时间
                  </span>
                  <span>2021-01-01 12:00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-light rounded-xl min-h-0 flex flex-column">
          <div class="px-4 py-2 fs-6 lh-8">服务列表</div>
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
