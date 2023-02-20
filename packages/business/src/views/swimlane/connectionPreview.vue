<template>
  <Drawer class="sw-connection-drawer" :visible.sync="visible" width="850px">
    <section v-if="viewData">
      <header>
        <div>
          <span class="fs-6 mb-2 ellipsis">{{ viewData.name }}</span>
          <span class="color-primary ml-4">改名</span>
          <span class="ml-4">{{ viewData.status }}</span>
        </div>
        <div class="color-info">{{ viewData.connection_type }}</div>
        <div class="flex justify-content-end mt-4 mb-4">
          <el-button type="primary" size="mini">加载Schema</el-button>
          <el-button>编辑</el-button>
          <el-button>加载Schema</el-button>
        </div>
      </header>
      <section class="basics-info text-center">
        <el-row>
          <el-col :span="4">
            <div>包含表数量</div>
            <div class="mt-2">235</div>
          </el-col>
          <el-col :span="4">
            <div>模型更新时间</div>
            <div class="mt-2">235</div>
          </el-col>
          <el-col :span="4">
            <div>创建时间</div>
            <div class="mt-2">235</div>
          </el-col>
          <el-col :span="4">
            <div>修改时间</div>
            <div class="mt-2">235</div>
          </el-col>
          <el-col :span="4">
            <div>Schema 状态</div>
            <div class="mt-2">235</div>
          </el-col>
        </el-row>
      </section>
      <section class="detailed-info">
        <el-row class="mb-2">
          <el-col :span="12">
            <span class="label inline-block">数据库地址：</span>
            <span>192.168.1.183</span>
          </el-col>
          <el-col :span="12">
            <span class="label inline-block">数据库端口：</span>
            <span>33063</span>
          </el-col>
        </el-row>
        <el-row class="mb-2">
          <el-col :span="12"><span class="label inline-block">账号：</span><span>root</span></el-col>
          <el-col :span="12"><span class="label inline-block">Schema:</span><span>192.168.1.2</span></el-col>
        </el-row>
        <el-row class="mb-2">
          <el-col :span="12"><span class="label inline-block">其它连接串参数:</span><span>charset=utf8</span></el-col>
          <el-col :span="12"><span class="label inline-block">时间类型的时区:</span><span>+08:00</span></el-col>
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
export default {
  name: 'connectionPreview',
  props: ['connectionId', 'viewData'],
  components: { Drawer },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    open(row) {
      this.visible = true
      this.viewData = row
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
