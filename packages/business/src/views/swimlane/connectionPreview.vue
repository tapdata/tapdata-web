<template>
  <Drawer class="sw-connection-drawer" :visible.sync="visible" width="850px">
    <section v-if="viewData">
      <header>
        <div class="flex justify-content-between">
          <div class="connection-name mb-2 ellipsis">{{ viewData.name }}</div>
          <div class="flex justify-content-end mt-4 mb-4">
            <el-button size="mini" type="primary">加载Schema</el-button>
            <el-button size="mini" @click="edit">编辑</el-button>
            <el-button size="mini">测试连接</el-button>
          </div>
        </div>
        <div class="color-info mb-4">
          {{ $t('packages_business_connection_type_' + viewData.connection_type) }}
          <span :class="['status-connection-' + viewData.status, 'status-block', 'ml-4']">
            {{ $t('packages_business_connection_status_' + viewData.status) }}
          </span>
        </div>
      </header>
      <section class="basics-info">
        <el-row>
          <el-col :span="8">
            <span class="table-dec-label">包含表数量 : </span> <span class="mt-2 ml-2">{{ viewData.tableCount }}</span>
          </el-col>
          <el-col :span="8">
            <span class="table-dec-label">模型更新时间 :</span>
            <span class="mt-2 ml-2">{{ viewData.loadSchemaTime }}</span>
          </el-col>
          <el-col :span="8">
            <span class="table-dec-label">创建时间 : </span>
            <span class="mt-2 ml-2">{{ viewData.createTime }}</span>
          </el-col>
        </el-row>
        <el-row class="mt-4">
          <el-col :span="8">
            <span class="table-dec-label">修改时间 : </span>
            <span class="mt-2 ml-2">{{ viewData.last_updated }}</span>
          </el-col>
          <el-col :span="8" class="flex items-center">
            <span class="table-dec-label">Schema状态 : </span>
            <span class="ml-2" v-if="isFileSource(viewData.database_type)">-</span>
            <span class="ml-2" v-else>
              <SchemaProgress :data="viewData"></SchemaProgress>
            </span>
          </el-col>
        </el-row>
      </section>
      <section class="detailed-info" v-if="viewData.config">
        <el-row class="mb-2">
          <el-col :span="12">
            <span class="table-dec-label inline-block">数据库地址：</span>
            <span>{{ viewData.config.host || viewData.config.uri }}</span>
          </el-col>
          <el-col :span="12">
            <span class="table-dec-label inline-block">数据库端口：</span>
            <span>{{ viewData.config.port || '-' }}</span>
          </el-col>
        </el-row>
        <el-row class="mb-2">
          <el-col :span="12"
            ><span class="table-dec-label inline-block">账号：</span
            ><span>{{ viewData.config.user || '-' }}</span></el-col
          >
          <el-col :span="12"
            ><span class="table-dec-label inline-block">Schema:</span
            ><span>{{ viewData.config.schema || '-' }}</span></el-col
          >
        </el-row>
        <el-row class="mb-2">
          <el-col :span="12"
            ><span class="table-dec-label inline-block">其它连接串参数:</span
            ><span>{{ viewData.config.additionalString || '-' }}</span></el-col
          >
          <el-col :span="12"
            ><span class="table-dec-label inline-block">时间类型的时区:</span
            ><span>{{ viewData.config.database_datetype_without_timezone || '-' }}</span></el-col
          >
        </el-row>
      </section>
      <section class="table-info mt-4">
        <header class="header flex justify-content-between mb-4">
          <div class="table-info-name">以该连接作为源/目标的任务</div>
          <el-button type="primary" size="mini">新建</el-button>
        </header>
        <VTable :columns="columns" :data="tableFields" :has-pagination="false">
          <div slot="empty">{{ $t('packages_dag_dag_dialog_field_mapping_no_data') }}</div>
        </VTable>
      </section>
    </section>
  </Drawer>
</template>

<script>
import { Drawer, VTable } from '@tap/component'
import { SchemaProgress } from '../../components'
import dayjs from 'dayjs'

export default {
  name: 'connectionPreview',
  props: ['connectionId', 'viewData'],
  components: { Drawer, SchemaProgress, VTable },
  data() {
    return {
      visible: false,
      columns: [
        {
          label: '任务名称',
          prop: 'name'
        },
        {
          label: '任务类型',
          prop: 'dataType'
        },
        {
          label: '任务状态',
          prop: 'businessDesc'
        },
        {
          label: '增量时间点',
          prop: 'businessDesc'
        },
        {
          label: '上次运行时间',
          prop: 'businessDesc'
        }
      ]
    }
  },
  methods: {
    open(row) {
      this.visible = true
      this.viewData = row
      //组装数据
      this.viewData['last_updated'] = dayjs(row.last_updated).format('YYYY-MM-DD HH:mm:ss')
      this.viewData['createTime'] = dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')
      this.viewData['loadSchemaTime'] = dayjs(row.loadSchemaTime).format('YYYY-MM-DD HH:mm:ss')
    },
    edit() {
      const { id, pdkHash } = this.viewData
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionsEdit',
        params: {
          id
        },
        query
      })
    },
    isFileSource(database_type) {
      return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(database_type)
    }
  }
}
</script>

<style scoped lang="scss">
.sw-connection-drawer {
  padding: 24px;
  .connection-name {
    font-weight: 500;
    font-size: 32px;
    color: #1d2129;
  }
  .basics-info {
    padding: 24px 0;
    border-bottom: 1px solid map-get($borderColor, normal);
    border-top: 1px solid map-get($borderColor, normal);
  }
  .table-dec-label {
    font-weight: 400;
    color: #535f72;
  }
  .table-dec-txt {
    font-weight: 400;
    color: #1d2129;
  }
  .detailed-info {
    border-bottom: 1px solid map-get($borderColor, normal);
    padding: 24px 0;
    .label {
      width: 150px;
    }
  }
  .table-info {
    .table-info-name {
      font-weight: 600;
      font-size: 18px;
      color: #1d2129;
    }
  }
}
</style>
