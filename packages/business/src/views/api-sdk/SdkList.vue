<script setup lang="ts">
import { deleteSdk, fetchSdkList } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import { escapeRegExp } from 'lodash-es'
import {
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { dayjs } from '../../shared/dayjs'
import SdkDialog from './SdkDialog.vue'
import Status from './Status.vue'
import type { InputInstance } from 'element-plus'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const tableRef = useTemplateRef<InstanceType<typeof TablePage>>('tableRef')

const getData = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const { current, size } = page
  const filter = {
    limit: size,
    skip: (current - 1) * size,
    where: {},
    order: tableOrder.value,
  }

  let { keyword } = searchParams.value

  if (keyword) {
    keyword = escapeRegExp(keyword)
    filter.where.$or = [
      {
        artifactId: {
          like: keyword,
          options: 'i',
        },
      },
      {
        packageName: {
          like: keyword,
          options: 'i',
        },
      },
    ]
  }

  const { items, total } = await fetchSdkList(filter)

  return {
    data: items.map((item) => {
      item.lastGenerationTime = dayjs(item.lastGenerationTime).format(
        'YYYY-MM-DD HH:mm:ss',
      )
      return item
    }),
    total,
  }
}

const dialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const confirmInputRef = useTemplateRef<InputInstance>('confirmInputRef')
const sdkDialogRef =
  useTemplateRef<InstanceType<typeof SdkDialog>>('sdkDialogRef')
const searchParams = ref({
  keyword: '',
})
const filterItems = ref([
  {
    placeholder: `${t('public_sdk_name')} / ${t('public_package_name')}`,
    key: 'keyword',
    type: 'input',
    id: 'name-filter-input',
    width: '240px',
  },
])

const currentSdk = reactive({
  id: '',
  artifactId: '',

  confirmInput: '',
  deleteLoading: false,
})

watch(
  () => route.query,
  () => {
    Object.assign(searchParams.value, route.query)
    fetch(1)
  },
)

const handleDetails = (row: any, column: any) => {
  if (column.property === 'operation') {
    return
  }

  router.push({
    name: 'apiSdkDetails',
    params: {
      id: row.id,
    },
  })
}

const fetch = (...args: any[]) => {
  tableRef.value?.fetch(...args)
}

const handleDownload = (gridfsId: string) => {
  window.open(`/api/SDK/download/${gridfsId}`, '_blank')
}

const handleCreate = () => {
  sdkDialogRef.value?.open(null)
}

const handleNewVersion = (row: any) => {
  sdkDialogRef.value?.open(row)
}

const handleDelete = (row: any) => {
  confirmDialogVisible.value = true
  currentSdk.id = row.id
  currentSdk.artifactId = row.artifactId
  currentSdk.confirmInput = ''
}

const onConfirmDialogOpened = () => {
  confirmInputRef.value?.focus()
}

const handleDeleteConfirm = async () => {
  currentSdk.deleteLoading = true
  await deleteSdk(currentSdk.id)
  currentSdk.deleteLoading = false
  confirmDialogVisible.value = false
  fetch(1)
  ElMessage.success(t('public_message_delete_ok'))
}

const tableOrder = ref('lastGenerationTime DESC')

const handleSortTable = ({ order, prop }: { order: string; prop: string }) => {
  tableOrder.value = `${order ? prop : 'lastGenerationTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
  fetch(1)
}

const interval = setInterval(() => {
  fetch(null, 0, true)
}, 8000)

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-readonlybtn="'new_model_creation'"
        type="primary"
        @click="handleCreate"
      >
        <span>{{ $t('public_create_sdk') }}</span>
      </ElButton>
    </template>

    <SdkDialog ref="sdkDialogRef" v-model="dialogVisible" @success="fetch(1)" />

    <TablePage
      ref="tableRef"
      row-key="id"
      :remote-method="getData"
      :default-sort="{ prop: 'lastGenerationTime', order: 'descending' }"
      row-class-name="cursor-pointer"
      @sort-change="handleSortTable"
      @row-click="handleDetails"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="fetch(1)"
        />
      </template>
      <el-table-column
        min-width="250"
        :label="$t('public_sdk_name')"
        :show-overflow-tooltip="true"
        prop="artifactId"
      />
      <el-table-column
        min-width="160"
        :label="$t('public_package_name')"
        prop="packageName"
      />
      <el-table-column
        min-width="160"
        :label="$t('public_latest_version')"
        prop="lastGeneratedVersion"
      >
        <template #default="{ row }">
          <el-tag
            v-if="row.lastGeneratedVersion"
            class="is-code"
            disable-transitions
          >
            <VIcon class="align-middle" size="14">Versions</VIcon>
            <span class="ml-1 align-middle">{{
              row.lastGeneratedVersion
            }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        :label="$t('public_status')"
        prop="status"
      >
        <template #default="{ row }">
          <Status
            :status="row.lastGenerateStatus"
            :error-message="row.generationErrorMessage"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="lastGenerationTime"
        width="172"
        :label="$t('public_update_time')"
        sortable
      />
      <el-table-column min-width="200">
        <template #header>
          <div class="flex align-center">
            <el-icon class="mr-1" size="16">
              <i-mingcute:download-2-line />
            </el-icon>
            {{ $t('public_button_download') }}
          </div>
        </template>
        <template #default="{ row }">
          <el-button-group style="--btn-space: 0" size="small">
            <el-button
              v-if="row.lastZipGridfsId"
              style="--el-button-size: 26px"
              @click.stop="handleDownload(row.lastZipGridfsId)"
            >
              ZIP {{ calcUnit(row.lastZipSizeOfByte, 'byte', 1) }}
            </el-button>
            <el-button
              v-if="row.lastJarGridfsId"
              style="--el-button-size: 26px"
              @click.stop="handleDownload(row.lastJarGridfsId)"
            >
              JAR {{ calcUnit(row.lastJarSizeOfByte, 'byte', 1) }}
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column
        width="180"
        align="center"
        prop="operation"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            text
            type="primary"
            :disabled="row.lastGenerateStatus === 'generating'"
            @click.stop="handleNewVersion(row)"
          >
            <el-icon class="mr-1">
              <i-lucide:rocket />
            </el-icon>
            {{ $t('public_new_release') }}
          </el-button>
          <el-dropdown trigger="click">
            <el-button text>
              <template #icon>
                <el-icon size="16">
                  <i-mingcute:more-1-fill />
                </el-icon>
              </template>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item class="is-danger" @click="handleDelete(row)">
                  <el-icon class="mr-2">
                    <i-lucide:trash-2 />
                  </el-icon>
                  {{ $t('public_button_delete') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      v-model="confirmDialogVisible"
      width="420"
      :show-close="false"
      @opened="onConfirmDialogOpened"
    >
      <template #header="{ titleClass }">
        <div class="flex align-center gap-4" :class="titleClass">
          <el-icon size="24" class="color-warning">
            <i-mingcute:warning-fill />
          </el-icon>
          {{ $t('public_delete_sdk_message', { sdk: currentSdk.artifactId }) }}
        </div>
      </template>
      <div class="flex flex-column gap-2 w-100 bg-subtle p-3 rounded-xl">
        <i18n-t tag="p" keypath="public_type_to_confirm">
          <template #val>
            <strong>{{ currentSdk.artifactId }}</strong>
          </template>
        </i18n-t>
        <el-input
          ref="confirmInputRef"
          v-model="currentSdk.confirmInput"
          autofocus
          @keyup.enter="handleDeleteConfirm"
        />
      </div>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button
          :loading="currentSdk.deleteLoading"
          type="danger"
          :disabled="currentSdk.confirmInput !== currentSdk.artifactId"
          @click="handleDeleteConfirm"
        >
          {{ $t('public_button_delete') }}
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
