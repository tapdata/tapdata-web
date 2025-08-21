<script setup lang="ts">
import {
  deleteEncryption,
  fetchEncryptionList,
  type Encryption,
  type Filter,
} from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { onBeforeMount, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { dayjs } from '../../shared/dayjs'
import RuleDialog from './RuleDialog.vue'
import TestDialog from './TestDialog.vue'

const { t } = useI18n()
const route = useRoute()

const tableRef = useTemplateRef<InstanceType<typeof TablePage>>('tableRef')
const searchParams = ref<Record<string, string>>({
  keyword: '',
})
const dialogOpen = ref(false)
const testDialogOpen = ref(false)
const editingRule = shallowRef<Encryption>()
const filterItems = ref([
  {
    placeholder: t('public_rule_name'),
    key: 'keyword',
    type: 'input',
  },
])

watch(
  () => route.query,
  () => {
    fetchData(1)
  },
)

const getData = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const { current, size } = page
  const filter: Filter = {
    order: 'last_updated DESC',
    limit: size,
    skip: (current - 1) * size,
  }
  const { keyword } = searchParams.value

  if (keyword) {
    filter.where = {
      name: keyword,
    }
  }

  const res = await fetchEncryptionList(filter)

  return {
    data: res.items.map((item) => ({
      ...item,
      last_updated: dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss'),
    })),
    total: res.total,
  }
}

const handleCreateRule = () => {
  editingRule.value = undefined
  dialogOpen.value = true
}

const handleTest = (row: Encryption) => {
  editingRule.value = row
  testDialogOpen.value = true
}

const handleEdit = (row: Encryption) => {
  editingRule.value = row
  dialogOpen.value = true
}

const handleDelete = async (row: Encryption) => {
  const res = await Modal.confirm(
    `${t('public_message_delete_confirm')}: ${row.name} ?`,
  )
  if (!res) return

  await deleteEncryption(row.id!)
  fetchData(1)
}

const fetchData = (page: number) => {
  tableRef.value?.fetch(page)
}

onBeforeMount(() => {
  Object.keys(searchParams.value).forEach((key) => {
    if (key in route.query) {
      searchParams.value[key] = route.query[key] as string
    }
  })
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton type="primary" @click="handleCreateRule">
        <span>{{ $t('public_create_rule') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="tableRef"
      class="h-100"
      row-key="id"
      :remote-method="getData"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="fetchData(1)"
        />
      </template>
      <ElTableColumn :label="$t('public_rule_name')" prop="name">
        <template #default="{ row }">
          <div class="flex align-center gap-2">
            {{ row.name }}
            <el-tag
              v-if="row.type === 999"
              class="zoom-xs border-0"
              disable-transitions
              type="primary"
              size="small"
            >
              {{ $t('public_system') }}
            </el-tag>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_rule_content')" prop="regex">
        <template #default="{ row }">
          <span
            class="rounded-lg px-2 py-0.5 inline-block lh-5 font-mono break-all"
            style="background-color: rgba(129, 139, 152, 0.12)"
          >
            {{ row.regex }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_replace_char')" prop="outputChar">
        <template #default="{ row }">
          <span
            class="rounded-lg px-2 py-0.5 inline-block lh-5 break-all"
            style="
              color: var(--el-color-success);
              background-color: var(--el-color-success-light-9);
            "
          >
            {{ row.outputChar }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_description')" prop="description" />
      <ElTableColumn
        :label="$t('public_update_time')"
        prop="last_updated"
        width="172"
      />
      <ElTableColumn :label="$t('public_operation')" width="160">
        <template #default="{ row }">
          <ElButton text type="primary" @click="handleTest(row)">
            {{ $t('public_test') }}
          </ElButton>
          <ElButton text type="primary" v-if="row.type !== 999" @click="handleEdit(row)">
            {{ $t('public_button_edit') }}
          </ElButton>
          <ElButton text type="danger" v-if="row.type !== 999" @click="handleDelete(row)">
            {{ $t('public_button_delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </TablePage>

    <RuleDialog
      v-model="dialogOpen"
      :rule="editingRule"
      @success="fetchData(1)"
    />
    <TestDialog v-model="testDialogOpen" :rule="editingRule" />
  </PageContainer>
</template>
