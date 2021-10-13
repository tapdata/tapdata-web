<template>
  <el-container class="task-details-container flex-column p-6">
    <div class="task-info flex justify-content-between bg-white p-6">
      <div class="task-info__left flex">
        <div>
          <img src="" alt="" />
        </div>
        <div>
          <div>name</div>
          <div class="flex align-items-center mt-4">
            <div v-for="(item, index) in infoItems" :key="index" :class="[{ 'ml-6': index !== 0 }]">
              <VIcon size="12">{{ item.icon }}</VIcon>
              <span class="ml-1">{{ item.label }}</span>
              <span>{{ task[item.key] }}</span>
            </div>
            <VIcon size="12" class="ml-4">edit-outline</VIcon>
          </div>
          <div class="operation-row mt-3">
            <ElButton type="primary" size="mini">启动</ElButton>
            <ElButton size="mini">停止</ElButton>
            <ElButton size="mini">重置</ElButton>
            <ElButton size="mini">强制停止</ElButton>
          </div>
        </div>
      </div>
      <div class="task-info__right flex align-items-center">
        <div v-for="(item, index) in ouputItems" :key="index" class="flex align-items-center ml-6">
          <span>{{ item.label }}</span>
          <span class="ml-4 fs-4 color-primary">{{ task[item.key] || 0 }}</span>
        </div>
      </div>
    </div>
    <div class="sub-task mt-6"></div>
  </el-container>
</template>

<script>
import VIcon from '@/components/VIcon'

export default {
  name: 'TaskDetails',
  components: { VIcon },
  data() {
    return {
      task: {},
      infoItems: [
        {
          key: 'creator',
          icon: 'account',
          label: '创建人：sindy'
        },
        {
          key: 'creator',
          icon: 'account',
          label: '修改时间：2021–09-11'
        },
        {
          key: 'creator',
          icon: 'account',
          label: '同步类型：全量'
        },
        {
          key: 'creator',
          icon: 'account',
          label: '描述：描述内容'
        }
      ],
      ouputItems: [
        {
          key: 'output',
          label: '总输出'
        },
        {
          key: 'input',
          label: '总输入'
        }
      ]
    }
  }
}
</script>
