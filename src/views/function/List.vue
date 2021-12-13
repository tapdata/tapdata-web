<template>
  <section class="function-list-wrapper">
    <TablePage ref="table" class="h-100" :title="$t('menu_title_function')" :remoteMethod="getData">
      <ul class="search-bar" slot="search">
        <li class="item">
          <ElSelect v-model="searchParams.type" size="small" @input="table.fetch(1)">
            <ElOption :label="$t('select_option_all')" value=""></ElOption>
            <ElOption v-for="(label, value) in typeMapping" :key="value" :label="label" :value="value"> </ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElButton plain class="btn-refresh" size="small" @click="table.fetch()">
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
      <ElTableColumn :label="$t('function_type_label')" prop="typeFmt"> </ElTableColumn>
      <ElTableColumn :label="$t('function_parameters_label')" prop="parameters"> </ElTableColumn>
      <ElTableColumn :label="$t('function_body_label')" prop="function_body"> </ElTableColumn>
      <ElTableColumn :label="$t('function_last_update_label')" prop="last_updated"> </ElTableColumn>

      <ElTableColumn :label="$t('column_operation')">
        <template #default="{ row }">
          <ElButton
            size="mini"
            type="text"
            @click="$router.push({ name: 'FunctionDetails', params: { id: row.id } })"
            >{{ $t('button_check') }}</ElButton
          >
          <ElButton size="mini" type="text" @click="toEdit(row)">{{ $t('button_edit') }}</ElButton>
          <ElButton size="mini" type="text" style="color: #f56c6c" @click="remove(row)">{{
            $t('button.delete')
          }}</ElButton>
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
      }
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
        where: where,
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return Promise.all([
        this.$api('Javascript_functions').count({ where: where }),
        this.$api('Javascript_functions').get({
          filter: filter
        })
      ]).then(([countRes, res]) => {
        return {
          total: countRes.data.count,
          data: res.data.map(item => {
            item.typeFmt = this.typeMapping[item.type]
            return item
          })
        }
      })
    },
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message_delete_confirm') + ' ',
        h('span', { style: { color: '#409EFF' } }, item.function_name)
      ])
      this.$confirm(message, this.$t('message_title_prompt'), {
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
  height: 100%;
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
      font-size: 16px;
    }
  }
}
</style>
