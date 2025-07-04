<script setup lang="ts">
import { fetchSdkList } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import { onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { dayjs } from '../../shared/dayjs'
import SdkDialog from './SdkDialog.vue'

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
        class="btn btn-create"
        @click="dialogVisible = true"
      >
        <span>{{ $t('public_create_sdk') }}</span>
      </ElButton>
    </template>

    <SdkDialog v-model="dialogVisible" @success="fetch(1)" />

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
          <el-tag
            :type="statusMap[row.lastGenerateStatus].type"
            disable-transitions
          >
            <el-icon
              v-if="row.lastGenerateStatus === 'GENERATING'"
              class="is-loading"
            >
              <i-lucide:loader />
            </el-icon>
            {{ statusMap[row.lastGenerateStatus].text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="lastGenerationTime"
        min-width="160"
        :label="$t('public_update_time')"
        sortable
      />
      <el-table-column width="100" align="right">
        <template #default="{ row }">
          <ElButton text @click="handleDetails(row)">
            <template #icon>
              <i-mingcute:right-line />
            </template>
          </ElButton>
        </template>
      </el-table-column>
    </TablePage>
  </PageContainer>
</template>
