<script>
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  components: { VIcon },
  data() {
    return {
      scenes: '',
      list: [
        {
          label: '跨云数据实时同步',
          value: '1'
        },
        {
          label: '数据入仓，加速查询',
          value: '2'
        },
        {
          label: '本地数据上云',
          value: '3'
        },
        {
          label: '异构数据库同步',
          value: '4'
        },
        {
          label: '其他场景',
          value: '5'
        },
        {
          label: '没有特定的需求',
          value: '6'
        }
      ]
    }
  }
}
</script>

<template>
  <div class="account">
    <VIcon>guide-top-header</VIcon>
    <header>2、为了账号安全和数据任务状态能快速通知到您，请您绑定手机号。</header>
    <el-checkbox-group v-model="scenes" size="small">
      <el-checkbox v-for="(item, index) in list" :key="index" :label="item.label" border></el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<style scoped lang="scss"></style>
