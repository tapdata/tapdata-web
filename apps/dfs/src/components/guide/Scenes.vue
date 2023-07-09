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
          value: '12'
        },
        {
          label: '数据入仓，加速查询',
          value: '23'
        },
        {
          label: '本地数据上云',
          value: '34'
        },
        {
          label: '异构数据库同步',
          value: '45'
        },
        {
          label: '其他场景',
          value: '56'
        },
        {
          label: '没有特定的需求',
          value: '67'
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
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">
      2、为了账号安全和数据任务状态能快速通知到您，请您绑定手机号。
    </div>
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
