<template>
  <Drawer class="sw-connection-drawer" :visible.sync="visible" width="850px">
    <section v-if="viewData">
      <header>
        <div>
          <span class="fs-6 mb-2 ellipsis">{{ viewData.name }}</span>
          <span class="color-primary ml-4">改名</span>
          <span class="ml-4">
            <span :class="['status-connection-' + viewData.status, 'status-block']">
              {{ $t('packages_business_connection_status_' + viewData.status) }}
            </span>
          </span>
        </div>
        <div class="color-info">{{ $t('packages_business_connection_type_' + viewData.connection_type) }}</div>
        <div class="flex justify-content-end mt-4 mb-4">
          <el-button type="primary" size="mini">加载Schema</el-button>
          <el-button @click="edit">编辑</el-button>
          <el-button>测试连接</el-button>
        </div>
      </header>
      <section class="basics-info text-center">
        <el-row>
          <el-col :span="3">
            <div>包含表数量</div>
            <div class="mt-2">{{ viewData.tableCount }}</div>
          </el-col>
          <el-col :span="6">
            <div>模型更新时间</div>
            <div class="mt-2">{{ viewData.loadSchemaTime }}</div>
          </el-col>
          <el-col :span="6">
            <div>创建时间</div>
            <div class="mt-2">{{ viewData.createTime }}</div>
          </el-col>
          <el-col :span="6">
            <div>修改时间</div>
            <div class="mt-2">{{ viewData.last_updated }}</div>
          </el-col>
          <el-col :span="3">
            <div>Schema 状态</div>
            <div class="mt-2" v-if="isFileSource(viewData.database_type)">-</div>
            <div class="flex justify-content-center mt-2" v-else>
              <SchemaProgress :data="viewData"></SchemaProgress>
            </div>
          </el-col>
        </el-row>
      </section>
      <section class="detailed-info" v-if="viewData.config">
        <el-row class="mb-2">
          <el-col :span="12">
            <span class="label inline-block">数据库地址：</span>
            <span>{{ viewData.config.host || viewData.config.uri }}</span>
          </el-col>
          <el-col :span="12">
            <span class="label inline-block">数据库端口：</span>
            <span>{{ viewData.config.port || '-' }}</span>
          </el-col>
        </el-row>
        <el-row class="mb-2">
          <el-col :span="12"
            ><span class="label inline-block">账号：</span><span>{{ viewData.config.user || '-' }}</span></el-col
          >
          <el-col :span="12"
            ><span class="label inline-block">Schema:</span><span>{{ viewData.config.schema || '-' }}</span></el-col
          >
        </el-row>
        <el-row class="mb-2">
          <el-col :span="12"
            ><span class="label inline-block">其它连接串参数:</span
            ><span>{{ viewData.config.additionalString || '-' }}</span></el-col
          >
          <el-col :span="12"
            ><span class="label inline-block">时间类型的时区:</span
            ><span>{{ viewData.config.database_datetype_without_timezone || '-' }}</span></el-col
          >
        </el-row>
      </section>
      <section class="table-info">
        <header class="header flex justify-content-between">
          <div>以该连接作为源/目标的任务</div>
          <div class="color-primary">新建任务</div>
        </header>
      </section>
    </section>
  </Drawer>
</template>

<script>
import { Drawer } from '@tap/component'
import { SchemaProgress } from '../../components'
import dayjs from 'dayjs'

export default {
  name: 'connectionPreview',
  props: ['connectionId', 'viewData'],
  components: { Drawer, SchemaProgress },
  data() {
    return {
      visible: false
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
  .basics-info {
    padding: 24px 0;
    border-bottom: 1px solid map-get($borderColor, normal);
    border-top: 1px solid map-get($borderColor, normal);
  }
  .detailed-info {
    border-bottom: 1px solid map-get($borderColor, normal);
    padding: 24px 0;
    .label {
      width: 150px;
    }
  }
  .table-info {
    .header {
      padding: 8px;
      border: 1px solid map-get($borderColor, normal);
    }
  }
}
</style>
