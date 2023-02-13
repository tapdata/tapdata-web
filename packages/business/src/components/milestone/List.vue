<template>
  <div class="flex h-100">
    <NodeList v-model="activeNodeId"></NodeList>
    <div v-if="activeNodeId" class="flex-fill"></div>
    <div v-else class="flex-fill">
      <div class="mt-4">整体进度: 3/5,全量数据同步中</div>
      <div v-for="(item, index) in items" :key="index" class="pro-line mt-4">
        <VIcon class="color-success">success</VIcon>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import NodeList from '../nodes/List'

export default {
  name: 'List',

  components: { NodeList },

  data() {
    return {
      activeNodeId: '',
      items: [
        {
          label: '任务调度',
          status: 'finish'
        },
        {
          label: '连接测试与权限检测',
          status: 'finish'
        },
        {
          label: '表结构迁移',
          status: 'finish'
        },
        {
          label: '全量数据迁移',
          status: 'finish'
        },
        {
          label: '增量数据迁移',
          status: 'finish'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.pro-line {

}
</style>
