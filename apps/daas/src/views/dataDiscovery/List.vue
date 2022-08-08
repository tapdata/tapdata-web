<template>
  <section class="object-list-wrap section-wrap">
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <el-table-column min-width="250" :label="$t('object_list_name')" prop="name" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="cursor-pointer" @click.stop="handlePreview">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120" :label="$t('object_list_classification')"></el-table-column>
      <el-table-column min-width="150" :label="$t('object_list_type')"> </el-table-column>
      <el-table-column min-width="110" :label="$t('object_list_source_type')"></el-table-column>
      <el-table-column min-width="210" :label="$t('object_list_source_information')"> </el-table-column>
    </TablePage>
    <Drawer class="object-drawer-wrap" :width="'800px'" :visible.sync="isShowDetails">
      <div class="flex align-items-center ml-4">
        <header class="font-weight-bold mr-4">
          <span class="drawer__header_text inline-block">对象详情</span>
        </header>
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="概览" name="first"></el-tab-pane>
          <el-tab-pane label="预览" name="second"></el-tab-pane>
        </el-tabs>
      </div>
      <div class="ml-4" v-if="activeName === 'first'">
        <div class="user">
          <span class="mr-4">管理员</span>
          <el-select v-model="activeUser">
            <el-option label="admin" value="admin"></el-option>
          </el-select>
        </div>
        <div class="details_data_info mt-4 p-5">
          <el-row class="mt-2">
            <el-col
              ><span class="drawer__header_text inline-block">数据表</span><span class="ml-2">Personinfo</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">创建时间</span><span class="ml-2">2022-06-08</span></el-col
            >
            <el-col :span="8"
              ><span class="max-label inline-block">变更时间</span><span class="ml-2">2022-06-08</span></el-col
            >
            <el-col :span="8"><span class="max-label inline-block">数据项</span><span class="ml-2">7</span></el-col>
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"><span class="max-label inline-block">数据量</span><span class="ml-2">1000</span></el-col>
            <el-col :span="8"><span class="max-label inline-block">来源信息</span><span class="ml-2">无</span></el-col>
            <el-col :span="8"
              ><span class="max-label inline-block">来源类型</span><span class="ml-2">数据连接</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">连接名</span><span class="ml-2">fannie_test</span></el-col
            >
            <el-col :span="8"
              ><span class="max-label inline-block">连接类型</span><span class="ml-2">Orcale</span></el-col
            >
            <el-col :span="8"
              ><span class="max-label inline-block">连接描述</span><span class="ml-2">地址、端口</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">业务名称</span><span class="ml-2">1234</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">业务描述</span><span class="ml-2">3456</span></el-col
            >
          </el-row>
        </div>
        <div class="mt-4">
          <span class="drawer__header_text inline-block">数据项</span>
          <TableList :columns="columns" :hide-on-single-page="true"> </TableList>
        </div>
      </div>
      <div class="ml-4" v-if="activeName === 'second'">
        <div class="user">
          <span class="mr-4">管理员</span>
          <el-select v-model="activeUser">
            <el-option label="admin" value="admin"></el-option>
          </el-select>
        </div>
        <div class="details_data_info mt-4 p-5">
          <el-row class="mt-2">
            <el-col
              ><span class="drawer__header_text inline-block">数据表</span><span class="ml-2">Personinfo</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">创建时间</span><span class="ml-2">2022-06-08</span></el-col
            >
            <el-col :span="8"
              ><span class="max-label inline-block">变更时间</span><span class="ml-2">2022-06-08</span></el-col
            >
            <el-col :span="8"><span class="max-label inline-block">数据项</span><span class="ml-2">7</span></el-col>
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"><span class="max-label inline-block">数据量</span><span class="ml-2">1000</span></el-col>
            <el-col :span="8"><span class="max-label inline-block">来源信息</span><span class="ml-2">无</span></el-col>
            <el-col :span="8"
              ><span class="max-label inline-block">来源类型</span><span class="ml-2">数据连接</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">连接名</span><span class="ml-2">fannie_test</span></el-col
            >
            <el-col :span="8"
              ><span class="max-label inline-block">连接类型</span><span class="ml-2">Orcale</span></el-col
            >
            <el-col :span="8"
              ><span class="max-label inline-block">连接描述</span><span class="ml-2">地址、端口</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">业务名称</span><span class="ml-2">1234</span></el-col
            >
          </el-row>
          <el-row class="mt-2">
            <el-col :span="8"
              ><span class="max-label inline-block">业务描述</span><span class="ml-2">3456</span></el-col
            >
          </el-row>
        </div>
        <div class="mt-4">
          <span class="drawer__header_text inline-block">数据预览</span>
          <TableList :columns="columns" :hide-on-single-page="true"> </TableList>
        </div>
      </div>
    </Drawer>
  </section>
</template>

<script>
import { FilterBar, Drawer, TableList } from '@tap/component'
import { TablePage } from '@tap/business'
import { logcollectorApi } from '@tap/api'

let timeout = null
export default {
  components: {
    TablePage,
    FilterBar,
    Drawer,
    TableList
  },
  data() {
    return {
      searchParams: {
        taskName: '',
        connectionName: ''
      },
      activeName: 'first',
      activeUser: 'admin',
      isShowDetails: false,
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
      ],
      columns: [
        {
          label: this.$t('task_name'),
          prop: 'parameter1'
        },
        {
          label: this.$t('task_info_running_time'),
          prop: 'createTime',
          dataType: 'time'
        },
        {
          label: this.$t('task_info_operator'),
          prop: 'username'
        },
        {
          label: this.$t('task_info_operator_content'),
          prop: 'desc',
          slotName: 'desc'
        }
      ]
    }
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000000)
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
  beforeDestroy() {
    clearInterval(timeout)
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
    },
    handlePreview() {
      this.isShowDetails = true
    }
  }
}
</script>
<style lang="scss" scoped>
.object-list-wrap {
  height: 100%;
}
.object-drawer-wrap {
  .drawer__header_text {
    height: 22px;
    font-size: 14px;
    line-height: 7px;
    font-weight: 500;
  }
  .max-label {
    width: 50px;
  }
  .details_data_info {
    background: #fafafa;
    border-radius: 4px;
  }
}
</style>
