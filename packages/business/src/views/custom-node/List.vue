<script setup lang="tsx">
import {
  checkCustomNodeUsed,
  createCustomNode,
  deleteCustomNode,
  fetchCustomNodes,
} from '@tap/api/src/core/custom-node'
import { FilterBar } from '@tap/component/src/filter-bar'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { makeStatusAndDisabled } from '../../shared'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const tableRef = ref<InstanceType<typeof TablePage>>()

const filterItems = [
  {
    placeholder: t('packages_business_custom_node_placeholder'),
    key: 'name',
    type: 'input',
  },
]

const searchParams = ref({
  name: '',
})

const order = ref('last_updated DESC')

watch(
  () => route.query,
  () => {
    tableRef.value?.fetch(1)
  },
)

// 获取列表数据
function getData({ page }: { page: { current: number; size: number } }) {
  const { name } = searchParams.value
  const { current, size } = page
  const where: Record<string, any> = {}
  name && (where.name = { like: name, options: 'i' })
  const filter = {
    where,
    order: order.value,
    limit: size,
    skip: (current - 1) * size,
  }
  return fetchCustomNodes(filter).then(({ total, items }: any) => {
    return {
      total,
      data: items.map((item: any) => {
        item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
        item.last_updated = dayjs(item.last_updated).format(
          'YYYY-MM-DD HH:mm:ss',
        )
        return item
      }),
    }
  })
}

function copy(row: any) {
  const { name, desc, formSchema, template } = row
  createCustomNode({ name: `${name}_copy`, desc, formSchema, template }).then(
    () => {
      tableRef.value?.fetch(1)
    },
  )
}

function remove(item: any) {
  Modal.confirm(
    t('public_message_title_prompt'),
    t('public_message_delete_confirm'),
  ).then((resFlag: any) => {
    if (!resFlag) {
      return
    }
    deleteCustomNode(item.id).then(() => {
      tableRef.value?.fetch(1)
    })
  })
}

async function toEdit(row: any) {
  const open = () =>
    window.open(
      router.resolve({
        name: 'NodeEditor',
        params: {
          id: row.id,
        },
      }).href,
    )
  const usedTaskData = await checkCustomNodeUsed(row.id)
  if (usedTaskData?.length) {
    const arr = ['starting', 'running']
    const filterData = usedTaskData
      .map(makeStatusAndDisabled)
      .filter((item: any) => {
        return arr.includes(item.status)
      })
    if (!filterData.length) {
      open()
      return
    }
    Modal.confirm(
      t('dataFlow_importantReminder'),
      <div class="w-100">
        <div>{t('packages_business_custom_node_edit_confirm')}</div>
        <div class="p-3 mt-3" style="background: #FAFAFA; font-size: 12px;">
          {filterData.map((item: any) => {
            return (
              <a
                class="block link-primary"
                style="line-height: 1.5;"
                target="_blank"
                href={
                  router.resolve({
                    name:
                      item.syncType === 'migrate'
                        ? 'MigrationMonitor'
                        : 'TaskMonitor',
                    params: {
                      id: item.id,
                    },
                  }).href
                }
              >
                {item.name}
              </a>
            )
          })}
        </div>
      </div>,
      {
        customClass: 'custom-node-edit-confirm',
        confirmButtonText: t('dataFlow_continueEditing'),
      },
    ).then((resFlag: any) => {
      if (!resFlag) return
      open()
    })
  } else {
    open()
  }
}

function toCreate() {
  window.open(
    router.resolve({
      name: 'NodeNew',
    }).href,
  )
}

// 筛选条件
function handleSortTable({
  order: sortOrder,
  prop,
}: {
  order: string
  prop: string
}) {
  order.value = `${sortOrder ? prop : 'last_updated'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  tableRef.value?.fetch(1)
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton type="primary" class="btn-create" @click="toCreate">
        <span>{{ t('public_button_add') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="tableRef"
      class="h-100"
      :remote-method="getData"
      @sort-change="handleSortTable"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="tableRef?.fetch(1)"
        />
      </template>

      <ElTableColumn :label="t('public_node_name')" prop="name" />
      <ElTableColumn :label="t('public_description')" prop="desc" />

      <ElTableColumn prop="createTime" :label="t('public_create_time')" />
      <ElTableColumn
        prop="last_updated"
        sortable="last_updated"
        :label="t('public_update_time')"
      />

      <ElTableColumn width="200" :label="t('public_operation')">
        <template #default="{ row }">
          <ElButton text type="primary" @click="toEdit(row)">{{
            t('public_button_edit')
          }}</ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton text type="primary" @click="copy(row)">{{
            t('public_button_copy')
          }}</ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton text type="primary" @click="remove(row)">{{
            t('public_button_delete')
          }}</ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
  </PageContainer>
</template>

<style lang="scss">
.custom-node-edit-confirm {
  width: 480px !important;
}
</style>
