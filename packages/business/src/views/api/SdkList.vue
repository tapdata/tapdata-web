<script setup lang="ts">
import { fetchSdkList } from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import i18n from '@tap/i18n'
import { ref } from 'vue'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import SdkDialog from './SdkDialog.vue'

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
      @sort-change="handleSortTable"
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
      >
        <template #default="{ row }">
          <ElLink
            v-readonlybtn="'SYNC_job_edition'"
            type="primary"
            underline="never"
            @click="handleDetails(row)"
          >
            {{ row.name }}
          </ElLink>
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        :label="$t('public_latest_version')"
        prop="latestVersion"
      />
      <el-table-column
        min-width="160"
        :label="$t('public_status')"
        prop="status"
      />
      <el-table-column
        prop="createTime"
        min-width="160"
        :label="$t('public_update_time')"
        sortable
      />
      <el-table-column
        width="220"
        fixed="right"
        :label="$t('public_operation')"
      >
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              :disabled="row.readOnly"
              type="primary"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              @click="handleDetails(row)"
            >
              {{ $t('public_button_details') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </TablePage>
  </PageContainer>
</template>
