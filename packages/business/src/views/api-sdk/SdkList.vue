<script setup lang="ts">
import { fetchSdkList } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import { calcUnit } from '@tap/shared'
import { onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { dayjs } from '../../shared/dayjs'
import SdkDialog from './SdkDialog.vue'
import Status from './Status.vue'

const router = useRouter()

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
const sdkDialogRef =
  useTemplateRef<InstanceType<typeof SdkDialog>>('sdkDialogRef')

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

const handleDetails = (row: any) => {
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
      :remote-method="getData"
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
      >
        <!-- <template #default="{ row }">
          <ElLink
            v-readonlybtn="'SYNC_job_edition'"
            type="primary"
            underline="never"
            @click="handleDetails(row)"
          >
            {{ row.artifactId }}
          </ElLink>
        </template> -->
      </el-table-column>
      <el-table-column min-width="160" label="包名" prop="packageName" />
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
        min-width="160"
        :label="$t('public_update_time')"
        sortable
      />
      <el-table-column min-width="200">
        <template #header>
          <el-icon class="ml-1">
            <i-mingcute:download-2-line />
          </el-icon>
          下载
        </template>
        <template #default="{ row }">
          <el-button-group style="--btn-space: 0">
            <el-button
              v-if="row.lastZipGridfsId"
              @click.stop="handleDownload(row.lastZipGridfsId)"
            >
              <!-- <el-icon class="ml-1">
                <i-mingcute:download-2-line />
              </el-icon> -->
              ZIP {{ calcUnit(row.lastZipSizeOfByte, 'byte', 1) }}
            </el-button>
            <el-button
              v-if="row.lastJarGridfsId"
              @click.stop="handleDownload(row.lastJarGridfsId)"
            >
              JAR {{ calcUnit(row.lastJarSizeOfByte, 'byte', 1) }}
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column width="120" align="center">
        <template #default="{ row }">
          <!-- <el-button
            v-if="row.lastZipGridfsId"
            text
            type="primary"
            @click="handleDetails(row)"
          >
            下载 ZIP<el-icon class="ml-1">
              <i-mingcute:download-2-line />
            </el-icon>
          </el-button>
          <el-divider class="mx-1" direction="vertical" />
          <el-button
            v-if="row.lastJarGridfsId"
            text
            type="primary"
            @click="handleDetails(row)"
          >
            下载 JAR<el-icon class="ml-1">
              <i-mingcute:download-2-line />
            </el-icon>
          </el-button>
          <el-divider class="mx-1" direction="vertical" /> -->
          <el-button text type="primary" @click.stop="handleNewVersion(row)">
            发布新版
          </el-button>
          <!-- <el-button text type="primary" @click="handleDetails(row)">
            <template #icon>
              <i-mingcute:right-line />
            </template>
          </el-button> -->
        </template>
      </el-table-column>
    </TablePage>
  </PageContainer>
</template>
