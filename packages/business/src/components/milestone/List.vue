<template>
  <div class="flex h-100">
    <NodeList v-model="activeNodeId" title="整体进度"></NodeList>
    <div v-if="activeNodeId" class="flex-fill overflow-auto">

    </div>
    <div v-else class="flex-fill overflow-auto">
      <div v-for="(item, index) in items" :key="index" class="pro-line flex mt-4">
        <VIcon v-if="item.type === 'whole'" size="18">auto-layout</VIcon>
        <VIcon v-else class="color-success" size="18">success</VIcon>
        <div class="ml-4 flex-fill">
          <span class="font-color-normal fw-bold">{{ item.label }}</span>
          <div v-if="item.desc" class="mt-2 color-info">{{ item.desc }}</div>
          <ElProgress v-if="item.percentage" :percentage="item.percentage" class="mt-1"></ElProgress>
        </div>
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
          type: 'whole',
          label: '整体进度',
          status: 'finish',
          icon: 'auto-layout',
          desc: '3/5完成，全量数据同步中',
          percentage: 50
        },
        {
          label: '任务调度',
          status: 'finish',
          desc: '完成'
        },
        {
          label: '连接测试与权限检测',
          status: 'finish',
          desc: '完成'
        },
        {
          label: '表结构迁移',
          status: 'finish',
          desc: '完成'
        },
        {
          label: '全量数据迁移',
          status: 'finish',
          desc: '完成'
        },
        {
          label: '增量数据迁移',
          status: 'finish',
          desc: '完成'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.pro-line {
  width: 400px;
}
</style>
