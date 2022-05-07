<template>
  <section class="shared-cache-list-wrap section-wrap">
    <TablePage ref="table" row-key="id" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="mini" @click="create">
          <span> {{ $t('shared_cache_button_create') }}</span>
        </ElButton>
      </div>
      <ElTableColumn prop="name" :label="$t('shared_cache_name')">
        <template #default="{ row }">
          <ElLink type="primary" @click.stop="checkDetails(row)">{{ row.name }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="connectionName" :label="$t('column_connection')"></ElTableColumn>
      <ElTableColumn prop="tableName" :label="$t('column_table')"></ElTableColumn>
      <ElTableColumn :label="$t('shared_cache_status')">
        <template #default="{ row }">
          <span :class="['status-' + row.statusResult, 'status-block']">
            {{ $t('task_preview_status_' + row.statusResult) }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createTimeFmt" :label="$t('column_create_time')"></ElTableColumn>
      <ElTableColumn prop="cacheTimeAtFmt" :label="$t('shared_cache_time')"></ElTableColumn>
      <ElTableColumn :label="$t('column_operation')">
        <template #default="{ row }">
          <!-- <ElLink type="primary" @click="edit(row.id)">{{ $t('button_edit') }}</ElLink> -->
          <!-- <ElDivider direction="vertical"></ElDivider> -->
          <ElLink type="primary" @click.stop="checkDetails(row)">{{ $t('button_check') }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" @click="del(row.id)">{{ $t('button_delete') }}</ElLink>
        </template>
      </ElTableColumn>
    </TablePage>
    <Drawer class="shared-cache-details" :visible.sync="isShowDetails">
      <div v-if="details.id" class="shared-cache-details--header flex pb-3">
        <VIcon class="icon">text</VIcon>
        <div class="flex-fill ml-4">
          <div class="fs-6">{{ details.name }}</div>
          <span :class="['status-' + details.statusResult, 'status-block', 'mt-2']">
            {{ $t('task_preview_status_' + details.statusResult) }}
          </span>
        </div>
      </div>
      <ul class="mt-2">
        <li v-for="item in info" :key="item.label" class="drawer-info__item">
          <VIcon class="fs-7 mt-2">{{ item.icon }}</VIcon>
          <div class="body ml-4">
            <label class="label">{{ item.label }}</label>
            <p class="value mt-2">{{ item.value }}</p>
          </div>
        </li>
      </ul>
      <div class="shared-cache--keys">
        <div class="title">{{ $t('shared_cache_keys') }}</div>
        <div class="content">
          <span v-for="key in details.cacheKeysArr" :key="key">{{ key }}</span>
        </div>
      </div>
      <div class="shared-cache--keys">
        <div class="title">{{ $t('shared_cache_fields') }}</div>
        <div class="content">
          <div v-for="key in details.fields" :key="key" class="mt-2">{{ key }}</div>
        </div>
      </div>
    </Drawer>
  </section>
</template>
<style lang="scss" scoped>
.shared-cache-list-wrap {
  overflow: hidden;
}
.icon-status {
  display: block;
  width: 60px;
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.icon-status--success {
    color: #178061;
    background: #c4f3cb;
  }
  &.icon-status--warning {
    color: #d5760e;
    background: #ffe9cf;
  }
  &.icon-status--danger {
    color: map-get($color, danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: 12px;
      color: #000000;
    }
  }
}
.shared-cache--keys {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #edeeee;
  .title {
    padding: 0 16px;
    height: 38px;
    line-height: 38px;
    background: map-get($bgColor, normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: map-get($bgColor, white);
  }
}
</style>
<script>
import TablePage from '@/components/TablePage'
import FilterBar from '@/components/filter-bar'
import Drawer from '@/components/Drawer'
import { toRegExp } from '@/utils/util'
import { getSubTaskStatus } from '@/utils/util'

export default {
  components: { TablePage, FilterBar, Drawer },
  data() {
    return {
      searchParams: {
        name: '',
        connectionName: ''
      },
      filterItems: [
        {
          placeholder: this.$t('shared_cache_placeholder_task_name'),
          key: 'name',
          type: 'input'
        },
        {
          placeholder: this.$t('shared_cache_placeholder_connection_name'),
          key: 'connectionName',
          type: 'input'
        }
      ],
      details: {},
      info: [],
      isShowDetails: false
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
      let { name, connectionName } = this.searchParams
      let where = {}
      name && (where.name = { like: toRegExp(name), options: 'i' })
      connectionName && (where.connectionName = { like: toRegExp(connectionName), options: 'i' })
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

              let statuses = item.statuses
              item.statusResult = getSubTaskStatus(statuses)[0].status
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
    checkDetails(row) {
      row.cacheKeysArr = row.cacheKeys?.split(',') || []
      this.details = row
      this.info = [
        { label: this.$t('column_creator'), value: row.createUser, icon: 'createUser' },
        { label: this.$t('column_create_time'), value: row.cacheTimeAtFmt, icon: 'cacheTimeAtFmt' },
        { label: this.$t('column_connection'), value: row.connectionName, icon: 'connectionName' },
        { label: this.$t('column_table'), value: row.tableName, icon: 'table' },
        { label: this.$t('shared_cache_max_rows'), value: row.maxRows, icon: 'record' },
        {
          label: this.$t('shared_cache_ttl'),
          value: `${row.ttl / 86400}${this.$t('shared_cache_ttl_unit')}`,
          icon: 'taskLastHour'
        }
      ]
      this.isShowDetails = true
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
              this.table.fetch()
            })
        }
      })
    }
  }
}
</script>
