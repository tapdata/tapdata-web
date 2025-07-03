<script setup lang="ts">
import { fetchSdkList } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import { RightBoldOutlined } from '@tap/component/src/RightBoldOutlined'
import i18n from '@tap/i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import SdkDialog from './SdkDialog.vue'

const router = useRouter()

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
    data: items,
    total,
  }
}

const dialogVisible = ref(false)

const handleDetails = (row: any) => {
  router.push({
    name: 'apiSdkDetails',
    params: {
      id: row.id,
    },
  })
}
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

    <SdkDialog v-model="dialogVisible" />

    <TablePage
      ref="table"
      :remote-method="getData"
      row-class-name="cursor-pointer"
      @sort-change="handleSortTable"
      @row-click="handleDetails"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
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
        prop="latestVersion"
      />
      <el-table-column
        min-width="160"
        :label="$t('public_status')"
        prop="status"
      >
        <template #default="{ row }">
          <el-tag> 构建中 </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
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
