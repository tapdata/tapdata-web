<template>
  <section class="shared-cache-list-wrap section-wrap">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="small" @click="create">
          <span> {{ $t('shared_cache_button_create') }}</span>
        </ElButton>
      </div>
      <ElTableColumn prop="name" :label="$t('shared_cache_name')"></ElTableColumn>
      <ElTableColumn prop="connectionName" :label="$t('column_connection')"></ElTableColumn>
      <ElTableColumn prop="tableName" :label="$t('column_table')"></ElTableColumn>
      <ElTableColumn :label="$t('shared_cache_status')">
        <template #default="{ row }">
          {{ row.status }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createTimeFmt" :label="$t('column_create_time')"></ElTableColumn>
      <ElTableColumn prop="cacheTimeAtFmt" :label="$t('shared_cache_time')"></ElTableColumn>
      <ElTableColumn :label="$t('column_operation')">
        <template #default="{ row }">
          <ElLink type="primary" @click="edit(row.id)">{{ $t('button_edit') }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" @click="del(row.id)">{{ $t('button_delete') }}</ElLink>
        </template>
      </ElTableColumn>
    </TablePage>
  </section>
</template>
<script>
import TablePage from '@/components/TablePage'
import FilterBar from '@/components/filter-bar'
import { toRegExp } from '@/utils/util'

export default {
  components: { TablePage, FilterBar },
  data() {
    return {
      searchParams: {
        taskName: '',
        connectionName: ''
      },
      filterItems: [
        {
          placeholder: this.$t('shared_cache_placeholder_task_name'),
          key: 'taskName',
          type: 'input'
        },
        {
          placeholder: this.$t('shared_cache_placeholder_connection_name'),
          key: 'connectionName',
          type: 'input'
        }
      ]
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
    getData({ page }) {
      let { current, size } = page
      let { taskName, connectionName } = this.searchParams
      let where = {}
      taskName && (where.name = { like: toRegExp(taskName), options: 'i' })
      connectionName && (where.name = { like: toRegExp(connectionName), options: 'i' })
      let filter = {
        order: 'createTime DESC',
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return this.$api('shareCache')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let list = res.data?.items || []
          return {
            total: res.data?.total,
            data: list.map(item => {
              item.createTimeFmt = this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              item.cacheTimeAtFmt = this.$moment(item.cacheTimeAt).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },
    create() {
      this.$router.push({
        name: 'sharedCacheCreate'
      })
    },
    edit(id) {
      this.$router.push({
        name: 'sharedCacheEdit',
        params: {
          id
        }
      })
    },
    del(id) {
      this.$confirm(this.$t('message_delete_confirm'), this.$t('message_title_prompt'), {
        type: 'warning'
      }).then(flag => {
        if (flag) {
          this.$api('shareCache')
            .delete(id)
            .then(() => {
              this.$$message.success(this.$t('message_delete_ok'))
            })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.shared-cache-list-wrap {
  overflow: hidden;
}
</style>
