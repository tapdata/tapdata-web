<template>
  <section class="function-list-wrapper section-wrap">
    <TablePage ref="table" class="h-100" :remoteMethod="getData" @sort-change="handleSortTable">
      <ul class="search-bar" slot="search">
        <li class="item">
          <ElRadioGroup v-model="searchParams.type" size="small" @input="table.fetch(1)">
            <ElRadioButton label="">{{ $t('select_option_all') }}</ElRadioButton>
            <ElRadioButton v-for="(label, value) in typeMapping" :key="value" :label="value"
              >{{ label }}
            </ElRadioButton>
          </ElRadioGroup>
        </li>
        <li class="item">
          <ElButton plain class="btn-refresh" size="mini" @click="table.fetch()">
            <i class="el-icon-refresh"></i>
          </ElButton>
        </li>
      </ul>
      <div slot="operation">
        <ElButton
          class="ml-4 btn-create"
          size="mini"
          @click="
            $router.push({
              name: 'FunctionImport'
            })
          "
        >
          <span>{{ $t('function_button_import_jar') }}</span>
        </ElButton>
        <ElButton
          class="btn-create"
          type="primary"
          size="mini"
          @click="
            $router.push({
              name: 'FunctionCreate'
            })
          "
        >
          <span>{{ $t('button_create') }}</span>
        </ElButton>
      </div>
      <ElTableColumn :label="$t('function_name_label')" prop="function_name" min-width="300"> </ElTableColumn>
      <ElTableColumn :label="$t('function_type_label')" prop="typeFmt" width="160"> </ElTableColumn>
      <ElTableColumn :label="$t('function_describe_label')" prop="describe" min-width="300"> </ElTableColumn>
      <ElTableColumn
        :label="$t('function_last_update_label')"
        prop="last_updated"
        sortable="last_updated"
        min-width="180"
      >
        <template slot-scope="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </ElTableColumn>

      <ElTableColumn width="180" :label="$t('column_operation')">
        <template #default="{ row }">
          <ElLink
            size="mini"
            type="primary"
            :underline="false"
            @click="$router.push({ name: 'FunctionDetails', params: { id: row.id } })"
            >{{ $t('button_check') }}</ElLink
          >
          <template v-if="row.type !== 'system'">
            <ElDivider direction="vertical"></ElDivider>
            <ElLink type="primary" size="mini" :underline="false" @click="toEdit(row)">{{ $t('button_edit') }}</ElLink>
            <ElDivider direction="vertical"></ElDivider>
            <ElLink type="primary" size="mini" :underline="false" @click="remove(row)">{{
              $t('button.delete')
            }}</ElLink>
          </template>
        </template>
      </ElTableColumn>
    </TablePage>
  </section>
</template>

<script>
import dayjs from 'dayjs'
import { javascriptFunctionsApi } from '@tap/api'
import { TablePage } from '@tap/business'

export default {
  components: { TablePage },
  data() {
    return {
      searchParams: {
        type: ''
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
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { type } = this.searchParams
      let { current, size } = page
      let where = {}
      type && (where.type = type)
      let filter = {
        where,
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return javascriptFunctionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map(item => {
              item.typeFmt = this.typeMapping[item.type]
              item.lastUpdatedFmt = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },
    remove(item) {
      this.$confirm(this.$t('function_message_delete_content'), this.$t('function_message_delete_title'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        javascriptFunctionsApi.delete(item.id).then(() => {
          this.table.fetch()
        })
      })
    },
    toEdit(row) {
      this.$router.push({
        name: 'FunctionEdit',
        params: {
          id: row.id
        }
      })
    },
    toCreate() {
      this.$router.push({
        name: 'FunctionCreate'
      })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>

<style scoped lang="scss">
.function-list-wrapper {
  .search-bar {
    display: flex;

    .item {
      margin-right: 10px;
    }
    .btn-refresh {
      padding: 0;
      height: 32px;
      line-height: 32px;
      width: 32px;
      min-width: 32px;
      font-size: 16px;
    }
  }
}
</style>
