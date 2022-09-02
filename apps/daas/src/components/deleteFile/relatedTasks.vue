<template>
  <div class="relatedTasks">
    <el-popover placement="top" width="400" popper-class="taskLink-popover" trigger="click">
      <template v-if="taskList.length > 0">
        <div v-for="item in taskList" :key="item.id" class="text item" @click="handleTask(item)">
          {{ item.name }}
        </div>
      </template>

      <div v-else class="noData">{{ $t('message_noRelatedTask') }}</div>

      <el-button class="e-button" slot="reference">{{ $t('message_clickRelatedTasks') }}</el-button>
    </el-popover>
  </div>
</template>
<script>
import { dataFlowsApi } from '@tap/api'

export default {
  props: {
    taskData: {
      type: Object
    }
  },
  data() {
    return {
      taskList: []
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.getTaskData()
    })
  },

  watch: {
    taskData: {
      handler() {
        this.getTaskData()
      },
      deep: true
    }
  },

  methods: {
    getTaskData() {
      let params = {
        connectionID: this.taskData.id,
        tableName: this.taskData.tableName
      }
      dataFlowsApi.relatedDataFlows(params).then(data => {
        if (data) {
          this.taskList = data
        }
      })
    },
    /***
     * 选择任务
     */
    handleTask(data) {
      if (this.taskData.id !== data.id) {
        window.open(window.location.href.split('=')[0] + '=' + data.id, 'monitor_' + data.id)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.relatedTasks {
  position: absolute;
  bottom: 0;
  width: 100%;
  .e-button {
    width: 100%;
  }
}
</style>
<style lang="scss">
.taskLink-popover {
  min-width: 500px !important;
  max-height: 300px;
  overflow: auto;
  .item {
    padding: 0 0 10px 20px;
    cursor: pointer;
  }
  .item:hover {
    color: map-get($color, primary);
  }
  .noData {
    text-align: center;
  }
}
</style>
