<script lang="tsx">
import {
  checkCustomNodeUsed,
  deleteCustomNode,
  fetchCustomNodes,
} from '@tap/api'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { makeStatusAndDisabled } from '../../shared'

export default {
  components: { PageContainer, FilterBar, TablePage },
  data() {
    return {
      filterItems: [
        {
          placeholder: this.$t('packages_business_custom_node_placeholder'),
          key: 'name',
          type: 'input',
        },
      ],
      searchParams: {
        name: '',
      },
      order: 'last_updated DESC',
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },

  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
  },

  methods: {
    // 获取列表数据
    getData({ page }) {
      const { name } = this.searchParams
      const { current, size } = page
      const where = {}
      name && (where.name = { like: name, options: 'i' })
      const filter = {
        where,
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
      }
      return fetchCustomNodes(filter).then(({ total, items }) => {
        return {
          total,
          data: items.map((item) => {
            item.createTime = dayjs(item.createTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )
            item.last_updated = dayjs(item.last_updated).format(
              'YYYY-MM-DD HH:mm:ss',
            )
            return item
          }),
        }
      })
    },
    remove(item) {
      this.$confirm(
        this.$t('public_message_title_prompt'),
        this.$t('public_message_delete_confirm'),
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        deleteCustomNode(item.id).then(() => {
          this.table.fetch()
        })
      })
    },
    async toEdit(row) {
      const open = () =>
        window.open(
          this.$router.resolve({
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
          .filter((item) => {
            return arr.includes(item.status)
          })
        if (!filterData.length) {
          open()
          return
        }
        this.$confirm(
          this.$t('dataFlow_importantReminder'),
          <div class="w-100">
            <div>{this.$t('packages_business_custom_node_edit_confirm')}</div>
            <div class="p-3 mt-3" style="background: #FAFAFA; font-size: 12px;">
              {filterData.map((item) => {
                return (
                  <a
                    class="block link-primary"
                    style="line-height: 1.5;"
                    target="_blank"
                    href={
                      this.$router.resolve({
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
            confirmButtonText: this.$t('dataFlow_continueEditing'),
          },
        ).then((resFlag) => {
          if (!resFlag) return
          open()
        })
      } else {
        open()
      }
    },
    toCreate() {
      window.open(
        this.$router.resolve({
          name: 'NodeNew',
        }).href,
      )
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton type="primary" class="btn-create" @click="toCreate">
        <span>{{ $t('public_button_add') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      class="h-100"
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

      <ElTableColumn :label="$t('public_node_name')" prop="name" />
      <ElTableColumn :label="$t('public_description')" prop="desc" />

      <ElTableColumn prop="createTime" :label="$t('public_create_time')" />
      <ElTableColumn
        prop="last_updated"
        sortable="last_updated"
        :label="$t('public_update_time')"
      />

      <ElTableColumn width="150" :label="$t('public_operation')">
        <template #default="{ row }">
          <ElButton text type="primary" @click="toEdit(row)">{{
            $t('public_button_edit')
          }}</ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton text type="primary" @click="remove(row)">{{
            $t('public_button_delete')
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
