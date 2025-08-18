<script setup lang="ts">
import {
  createEncryption,
  deleteEncryption,
  fetchEncryptionList,
  updateEncryption,
  type Encryption,
  type Filter,
} from '@tap/api'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import { ref, shallowRef, useTemplateRef } from 'vue'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { dayjs } from '../../shared/dayjs'
import RuleDialog from './RuleDialog.vue'
import TestDialog from './TestDialog.vue'

const { t } = useI18n()

const tableRef = useTemplateRef<InstanceType<typeof TablePage>>('tableRef')
const searchParams = ref({
  keyword: '',
})
const dialogOpen = ref(false)
const testDialogOpen = ref(false)
const editingRule = shallowRef<Encryption>()

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
      like: keyword,
      options: 'i',
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

  await deleteEncryption(row.id)
  fetchData(1)
}

const fetchData = (...args: any[]) => {
  tableRef.value?.fetch(...args)
}
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
      <ElTableColumn :label="$t('public_rule_name')" prop="name" />
      <ElTableColumn :label="$t('public_rule_content')" prop="regex">
        <template #default="{ row }">
          <div class="flex align-center gap-2">
            <el-tag type="info" size="small" class="is-code">
              {{ row.regex }}
            </el-tag>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_replace_char')" prop="outputChar" />
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
          <ElButton text type="primary" @click="handleEdit(row)">
            {{ $t('public_button_edit') }}
          </ElButton>
          <ElButton text type="danger" @click="handleDelete(row)">
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
