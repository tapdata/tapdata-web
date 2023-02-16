<template>
  <section class="px-6 pb-6 h-100">
    <TablePage ref="table" class="h-100" :remoteMethod="getData" @sort-change="handleSortTable">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton type="primary" class="btn-create" size="mini" @click="toCreate">
          <span>{{ $t('packages_business_new') }}</span>
        </ElButton>
      </div>
      <ElTableColumn :label="$t('packages_business_custom_node_name')" prop="name"> </ElTableColumn>
      <ElTableColumn :label="$t('packages_business_desc')" prop="desc"> </ElTableColumn>

      <ElTableColumn prop="createTime" :label="$t('packages_business_column_create_time')"></ElTableColumn>
      <ElTableColumn
        prop="last_updated"
        sortable="last_updated"
        :label="$t('packages_business_last_updated')"
      ></ElTableColumn>

      <ElTableColumn width="150" :label="$t('packages_business_column_operation')">
        <template #default="{ row }">
          <ElLink type="primary" @click="toEdit(row)">{{ $t('button_edit') }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" @click="remove(row)">{{ $t('button_delete') }}</ElLink>
        </template>
      </ElTableColumn>
    </TablePage>
  </section>
</template>

<script>
import dayjs from 'dayjs'
import { customNodeApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage } from '../../components'
import { makeStatusAndDisabled } from '../../shared'

export default {
  components: { FilterBar, TablePage },
  data() {
    return {
      filterItems: [
        {
          placeholder: this.$t('packages_business_custom_node_placeholder'),
          key: 'name',
          type: 'input'
        }
      ],
      searchParams: {
        name: ''
      },
      order: 'last_updated DESC'
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },

  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },

  methods: {
    // 获取列表数据
    getData({ page }) {
      let { name } = this.searchParams
      let { current, size } = page
      let where = {}
      name && (where.name = { like: name, options: 'i' })
      let filter = {
        where: where,
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return customNodeApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(({ total, items }) => {
          return {
            total,
            data: items.map(item => {
              item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              item.last_updated = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },
    remove(item) {
      this.$confirm(this.$t('message_delete_confirm'), this.$t('message_title_prompt'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        customNodeApi.delete(item.id).then(() => {
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
              id: row.id
            }
          }).href
        )
      let usedTaskData = await customNodeApi.checkUsed(row.id)
      if (usedTaskData?.length) {
        const arr = ['starting', 'running']
        const filterData = usedTaskData.map(makeStatusAndDisabled).filter(item => {
          return arr.includes(item.status)
        })
        if (!filterData.length) {
          open()
          return
        }
        this.$confirm(
          <div class="w-100">
            <div>检测到以下运行中的任务调用了该节点，如需配置生效请重新启动任务</div>
            <div class="p-3 mt-3" style="background: #FAFAFA; font-size: 12px;">
              {filterData.map(item => {
                return (
                  <a
                    class="block link-primary"
                    style="line-height: 1.5;"
                    target="_blank"
                    href={
                      this.$router.resolve({
                        name: 'dataflowDetailsContainer',
                        params: {
                          id: item.id
                        }
                      }).href
                    }
                  >
                    {item.name}
                  </a>
                )
              })}
            </div>
          </div>,
          this.$t('dataFlow_importantReminder'),
          {
            customClass: 'custom-node-edit-confirm',
            confirmButtonText: this.$t('dataFlow_continueEditing'),
            type: 'warning'
          }
        ).then(resFlag => {
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
          name: 'NodeNew'
        }).href
      )
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>

<style lang="scss">
.custom-node-edit-confirm {
  width: 480px !important;
}
</style>
