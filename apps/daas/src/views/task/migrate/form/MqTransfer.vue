<template>
  <div class="mq-transfer">
    <ElTransfer
      class="topic-transfer"
      filterable
      v-model="topicData"
      :titles="topicTitles"
      :data="data1"
      @left-check-change="firstLeftCheckedFnc"
      @change="firstChangeFnc"
    >
      <template #default="{ option }">
        <div>
          <span v-if="topicData.includes(option.key)">{{ table_prefix }}</span>
          <span>{{ option.label }}</span>
          <span v-if="topicData.includes(option.key)">{{ table_suffix }}</span>
        </div>
      </template>
    </ElTransfer>
    <ElTransfer
      class="queue-transfer"
      v-model="queueData"
      filterable
      :titles="queueTitles"
      :data="data2"
      :left-default-checked="secondLeftCheckedArr"
      :right-default-checked="secondRightCheckedArr"
      @right-check-change="secondRightCheckedFnc"
      @change="secondChangeFnc"
    >
      <template #default="{ option }">
        <div>
          <span v-if="queueData.includes(option.key)">{{ table_prefix }}</span>

          <span>{{ option.label }}</span>
          <span v-if="queueData.includes(option.key)">{{ table_suffix }}</span>
        </div>
      </template>
    </ElTransfer>
  </div>
</template>

<script>
export default {
  props: {
    source: {
      type: Array,
      default: () => {
        return []
      }
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      table_prefix: '',
      table_suffix: '',
      data: [], // 总数据
      data1: [], // 第一穿梭框 源数据
      topicData: [], // 第一穿梭框 穿梭过去的数据
      data2: [], // 第二穿梭框 源数据
      queueData: [], // 第二穿梭框 穿梭过去的数据
      secondLeftCheckedArr: [], // 第二穿梭框 左侧选中的内容
      secondRightCheckedArr: [], // 第二穿梭框 右侧选中的内容
      topicTitles: [this.$t('editor.cell.link.migrationObjece'), 'Topic'],
      queueTitles: [this.$t('editor.cell.link.migrationObjece'), 'Queue']
    }
  },
  watch: {
    source: {
      deep: true,
      handler() {
        this.init()
      }
    },
    topicData: {
      deep: true,
      handler() {
        this.returnValue()
      }
    },
    queueData: {
      deep: true,
      handler() {
        this.returnValue()
      }
    },
    'value.table_prefix'(val) {
      this.table_prefix = val
    },
    'value.table_suffix'(val) {
      this.table_suffix = val
    }
  },
  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      this.data = [...this.source]
      // // 一开始设置全部数据
      this.data2 = [...this.data]
      this.topicData = this.value?.topicData || []
      this.queueData = this.value?.queueData || []
      this.table_prefix = this.value?.table_prefix || ''
      this.table_suffix = this.value?.table_suffix || ''
      if (this.queueData.length) {
        let items = this.data.filter(item => this.queueData.indexOf(item.key) === -1)
        this.data1 = [...items]
      } else {
        this.data1 = [...this.data]
      }
    },
    // 第一个穿梭框 右侧选中的函数
    firstLeftCheckedFnc(value = []) {
      this.secondLeftCheckedArr = value
      this.secondRightCheckedArr = [] // 清空其他选中
    },
    firstChangeFnc() {
      this.secondLeftCheckedArr = [] // 清空其他选中
    },
    // 第二个穿梭框
    secondChangeFnc(value) {
      let secondRightCheckedArr = this.secondRightCheckedArr
      let isLeft = secondRightCheckedArr.length > 0
      // 右移
      if (!isLeft) {
        // 减少 源数据
        let items = this.data1.filter(item => value.indexOf(item.key) === -1)
        this.data1 = [...items]
        this.topicData = this.topicData.filter(item => value.indexOf(item) === -1)
      } else {
        // 左移
        // 添加左移的数据
        let items = this.data.filter(item => secondRightCheckedArr.indexOf(item.key) > -1) // 正在穿梭数据的源数据
        this.data1 = this.data1.concat(items)
      }
    },
    // 用于标记，第二穿梭框的右侧--左移还是右移？
    secondRightCheckedFnc(value) {
      this.secondRightCheckedArr = value
    },
    returnValue() {
      this.$emit('input', {
        topicData: this.topicData,
        queueData: this.queueData,
        table_prefix: this.table_prefix,
        table_suffix: this.table_suffix
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mq-transfer {
  position: relative;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  ::v-deep {
    .el-transfer {
      overflow: initial;
    }
    .topic-transfer,
    .queue-transfer {
      height: 100%;
      .el-transfer-panel {
        height: 100%;
      }
      .el-transfer__buttons {
        display: flex;
        width: 122px;
        flex-direction: row;
        box-sizing: border-box;
        & > button {
          margin: 0;
        }
        & > :last-child {
          margin-left: 10px;
        }
      }
    }
    .topic-transfer {
      display: flex;
      z-index: 2;
      & > div:last-child {
        top: 0;
        height: 48%;
      }
      .el-transfer__buttons {
        height: 48%;
      }
    }
    .queue-transfer {
      position: absolute;
      width: calc(50% + 61px);
      right: 0;
      bottom: 0;
      height: 50%;
      z-index: 3;
      & > div:first-child {
        display: none;
      }
      & > div:last-child {
        bottom: 0;
        width: calc(100% - 122px);
      }
    }
  }
}
</style>
