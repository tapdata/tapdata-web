<template>
  <section class="function-list-wrapper section-wrap">
    <TablePage ref="table" class="h-100" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton type="primary" class="btn-create" size="mini" @click="toCreate">
          <span>{{ $t('button_button') }}</span>
        </ElButton>
      </div>
      <ElTableColumn :label="$t('custom_node_name')" prop="name"> </ElTableColumn>
      <ElTableColumn :label="$t('function_describe_label')" prop="desc"> </ElTableColumn>

      <ElTableColumn prop="createTime" :label="$t('column_create_time')"></ElTableColumn>
      <ElTableColumn prop="last_updated" :label="$t('function_last_update_label')"></ElTableColumn>

      <ElTableColumn width="150" :label="$t('column_operation')">
        <template #default="{ row }">
          <ElLink type="primary" @click="toEdit(row)">{{ $t('button_edit') }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" @click="remove(row)">{{ $t('button.delete') }}</ElLink>
        </template>
      </ElTableColumn>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import FilterBar from '../../components/filter-bar/Main'
import { CustomNode } from '@daas/api'

const api = new CustomNode()

export default {
  components: { FilterBar, TablePage },
  data() {
    return {
      filterItems: [
        {
          placeholder: this.$t('custom_node_name_placeholder'),
          key: 'name',
          type: 'input'
        }
      ],
      searchParams: {
        name: ''
      },
      typeMapping: {
        custom: this.$t('function_type_option_custom'),
        jar: this.$t('function_type_option_jar'),
        system: this.$t('function_type_option_system')
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
      return api
        .get({
          filter: JSON.stringify(filter)
        })
        .then(({ total, items }) => {
          return {
            total,
            data: items.map(item => {
              item.createTime = this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              item.last_updated = this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
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
        api.delete(item.id).then(res => {
          this.table.fetch()
        })
      })
    },
    toEdit(row) {
      window.open(
        this.$router.resolve({
          name: 'NodeEditor',
          params: {
            id: row.id
          }
        }).href
      )
    },
    toCreate() {
      window.open(
        this.$router.resolve({
          name: 'NodeNew'
        }).href
      )
    }
  }
}
</script>

<style scoped lang="scss"></style>
