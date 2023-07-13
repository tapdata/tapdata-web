<script>
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  components: { VIcon },
  props: ['scenes'],
  data() {
    return {
      list: [
        {
          label: '跨云数据实时同步',
          value: 'Real-time synchronization of cross-cloud data'
        },
        {
          label: '数据入仓，加速查询',
          value: 'Data warehousing to speed up query'
        },
        {
          label: '本地数据上云',
          value: 'Local data to the cloud'
        },
        {
          label: '异构数据库同步',
          value: 'Heterogeneous database synchronization'
        },
        {
          label: '其他场景',
          value: 'other scenes'
        },
        {
          label: '没有特定的需求',
          value: 'no specific needs'
        }
      ]
    }
  }
}
</script>

<template>
  <div class="scenes">
    <div class="flex justify-content-center align-items-center">
      <VIcon size="450px" style="width: 450px; height: 235px">guide-top-header</VIcon>
    </div>
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">2、您想通过本产品完成您的什么需求呢？。</div>
    <el-checkbox-group
      class="scenes-wrap flex flex-column mt-4"
      v-model="scenes"
      size="small"
      @change="$emit('handleScenes', scenes)"
    >
      <el-checkbox class="mb-4" v-for="(item, index) in list" :key="index" :label="item.value" border>{{
        item.label
      }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<style scoped lang="scss">
.scenes-wrap {
  ::v-deep {
    .el-checkbox {
      margin-right: 0;
    }
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
      margin-left: 0;
    }
  }
}
</style>
