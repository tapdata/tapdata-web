<template>
  <section class="preview-list-wrap">
    <TablePage ref="table" row-key="id" class="metadata-list" :remoteMethod="getData" @sort-change="handleSortTable">
      <div slot="operation">
        <el-button class="btn btn-create" size="mini" @click="handleQuery">
          <span>{{ $t('metadata_details_query') }}</span>
        </el-button>
      </div>
      <!-- <el-table ref="table" class="metadata-list" :data="previewTableData"> -->
      <el-table-column
        :label="item.text"
        :prop="item.text"
        v-for="item in tableHeader"
        :key="item.value"
        :formatter="formatBoolean"
      >
        <!-- <template slot-scope="scope">
        {{scope.row[.]}}
      </template> -->
      </el-table-column>
      <!-- </el-table> -->
      <!-- <el-pagination
      align="center"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageCurrent"
      :page-sizes="[1, 5, 10, 20]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageTotal"
    >
    </el-pagination> -->
    </TablePage>
  </section>
</template>

<script>
import { previewDataApi } from '@tap/api'
import { TablePage } from '@tap/business'

export default {
  props: {
    validaData: {
      type: Object,
      required: true
    }
  },
  components: {
    TablePage
  },
  data() {
    return {
      previewTableData: [],
      tableHeader: [],
      createDialogVisible: false,
      pageSize: 20,
      pageCurrent: 1,
      pageTotal: 0
    }
  },
  mounted() {},
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 查询
    handleQuery() {
      this.getData({ page: { current: 1, size: 20 } })
    },
    // 表格转换布尔值
    formatBoolean(row, column, cellValue) {
      if (typeof cellValue === 'boolean') {
        let flag = cellValue ? 'true' : 'false'
        return flag
      } else if (typeof cellValue === 'object') {
        return 'null'
      } else if (typeof cellValue === 'undefined') {
        return 'undefined'
      } else {
        return cellValue
      }
    },
    // 获取预览表格数据
    getData({ page }) {
      let { current, size } = page
      let header = {}
      if (this.validaData.fields) {
        for (let i = 0; i < this.validaData.fields.length; i++) {
          if (this.validaData.fields[i].alias_name && this.validaData.fields[i].alias_name !== '') {
            header[this.validaData.fields[i].field_name] = this.validaData.fields[i].alias_name
          }
        }
      }
      let where = {
        id: this.validaData.id,
        limit: size,
        skip: (current - 1) * size
      }
      return previewDataApi.post(where).then(data => {
        this.tableHeader = data?.head
        return {
          total: data?.total,
          data: data?.items
        }
      })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.preview-list-wrap {
  height: 100%;
  .btn-create {
    float: right;
  }
}
</style>
