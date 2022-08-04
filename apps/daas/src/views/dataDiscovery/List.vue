<template>
  <section class="share-list-wrap section-wrap">
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <el-table-column
        min-width="250"
        :label="$t('object_list_name')"
        prop="name"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column min-width="120" :label="$t('object_list_classification')"></el-table-column>
      <el-table-column min-width="150" :label="$t('object_list_type')"> </el-table-column>
      <el-table-column min-width="110" :label="$t('object_list_source_type')"></el-table-column>
      <el-table-column min-width="210" :label="$t('object_list_source_information')"> </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import { TablePage, FilterBar } from '@tap/component'
import { logcollectorApi } from '@tap/api'

let timeout = null
export default {
  components: {
    TablePage,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        taskName: '',
        connectionName: ''
      },
      filterItems: [
        {
          label: '对象分类',
          key: 'status',
          type: 'select-inner',
          items: [],
          selectedWidth: '200px'
        },
        {
          label: '对象类型',
          key: 'type',
          type: 'select-inner',
          items: []
        },
        {
          label: '来源类型',
          key: 'type',
          type: 'select-inner',
          items: []
        },
        {
          label: '来源分类',
          key: 'type',
          type: 'select-inner',
          items: []
        },
        {
          placeholder: '对象名/来源名',
          key: 'connectionName',
          type: 'input'
        }
      ]
    }
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
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
      let { current, size } = page
      let { taskName, connectionName } = this.searchParams
      let where = {}
      taskName && (where.taskName = taskName)
      connectionName && (where.connectionName = connectionName)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return logcollectorApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total || 0,
            data: [
              {
                id: 1,
                name: '测试数据'
              }
            ]
          }
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.share-list-wrap {
  height: 100%;
  .refresh {
    color: map-get($color, primary);
    font-weight: normal;
    font-size: 12px;
    cursor: pointer;
  }
  .share-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
    .btn {
      i.iconfont {
        font-size: 12px;
      }
      &.btn-dropdowm {
        margin-left: 5px;
      }
      &.btn-create {
        margin-left: 5px;
      }
    }
    .metadata-name {
      .name {
        color: map-get($color, primary);
        a {
          color: inherit;
          cursor: pointer;
        }
      }
      .name:hover {
        text-decoration: underline;
      }
      .tag {
        margin-left: 5px;
        color: map-get($fontColor, slight);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .parent {
        color: map-get($fontColor, slight);
      }
    }
  }
  ::v-deep {
    .el-dialog__body {
      padding: 10px 20px;
      .el-form {
        .el-form-item {
          .el-form-item__label {
            font-size: 12px;
          }
          .el-select,
          .el-date-editor {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
