<template>
  <section class="function-list-wrapper section-wrap">
    <TablePage ref="table" class="h-100" :remoteMethod="getData">
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
          <span>{{ $t('function_button_create_custom_function') }}</span>
        </ElButton>
      </div>
      <ElTableColumn :label="$t('function_name_label')" prop="function_name"> </ElTableColumn>
      <ElTableColumn :label="$t('function_type_label')" prop="typeFmt" width="120"> </ElTableColumn>
      <ElTableColumn :label="$t('function_describe_label')" prop="describe"> </ElTableColumn>
      <ElTableColumn :label="$t('function_last_update_label')" prop="lastUpdatedFmt"> </ElTableColumn>

      <ElTableColumn width="150" :label="$t('column_operation')">
        <template #default="{ row }">
          <ElButton
            size="mini"
            type="text"
            @click="$router.push({ name: 'FunctionDetails', params: { id: row.id } })"
            >{{ $t('button_check') }}</ElButton
          >
          <template v-if="row.type !== 'system'">
            <ElButton size="mini" type="text" @click="toEdit(row)">{{ $t('button_edit') }}</ElButton>
            <ElButton size="mini" type="text" style="color: #f56c6c" @click="remove(row)">{{
              $t('button.delete')
            }}</ElButton>
          </template>
        </template>
      </ElTableColumn>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'

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
      return this.$api('Javascript_functions')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let list = res?.data?.items || []
          return {
            total: res.data?.total,
            data: list.map(item => {
              item.typeFmt = this.typeMapping[item.type]
              item.lastUpdatedFmt = this.$moment(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
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
        this.$api('Javascript_functions')
          .delete(item.id)
          .then(res => {
            if (res) this.table.fetch()
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
