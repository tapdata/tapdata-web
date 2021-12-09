<template>
  <section class="function-list-wrapper">
    <TablePage ref="table" class="h-100" :title="$t('menu_title_function')" :remoteMethod="getData">
      <div slot="operation">
        <ElButton class="ml-4 btn-create" size="mini" @click="toCreate('jar')">
          <span>{{ $t('function_button_import_jar') }}</span>
        </ElButton>
        <ElButton class="btn-create" type="primary" size="mini" @click="toCreate('custom')">
          <span>{{ $t('function_button_create_custom_function') }}</span>
        </ElButton>
      </div>
      <ElTableColumn :label="$t('function_name_label')" prop="function_name"> </ElTableColumn>
      <ElTableColumn :label="$t('function_parameters_label')" prop="parameters"> </ElTableColumn>
      <ElTableColumn :label="$t('function_body_label')" prop="function_body"> </ElTableColumn>
      <ElTableColumn :label="$t('function_last_update_label')" prop="last_updated"> </ElTableColumn>

      <ElTableColumn :label="$t('column_operation')">
        <template #default="{ row }">
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
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { current, size } = page
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return Promise.all([
        this.$api('Javascript_functions').count(),
        this.$api('Javascript_functions').get({
          filter: filter
        })
      ]).then(([countRes, res]) => {
        return {
          total: countRes.data.count,
          data: res.data
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
    toCreate(type) {
      this.$router.push({
        name: 'FunctionCreate',
        params: {
          type
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.function-list-wrapper {
  height: 100%;
}
</style>
