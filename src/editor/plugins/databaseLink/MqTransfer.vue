<template>
  <div class="mq-transfer">
    <el-transfer
      class="topic-transfer"
      v-model="topicData"
      filterable
      :titles="topicTitles"
      :data="data1"
      @left-check-change="firstLeftCheckedFnc"
      @change="firstChangeFnc"
    >
      <template #default="{ option }">
        <div v-if="topicData.includes(option.label)">
          <template v-if="tableNameTransform === 'toLowerCase'">
            <span>{{ table_prefix.toLowerCase() + option.label.toLowerCase() + table_suffix.toLowerCase() }}</span>
          </template>
          <template v-else-if="tableNameTransform === 'toUpperCase'">
            <span>{{ table_prefix.toUpperCase() + option.label.toUpperCase() + table_suffix.toUpperCase() }}</span>
          </template>
          <template v-else>
            <span>{{ table_prefix + option.label + table_suffix }}</span>
          </template>
        </div>
        <div v-else>
          {{ option.label }}
        </div>
      </template>
    </el-transfer>
    <el-transfer
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
        <div v-if="queueData.includes(option.label)">
          <template v-if="tableNameTransform === 'toLowerCase'">
            <span>{{ table_prefix.toLowerCase() + option.label.toLowerCase() + table_suffix.toLowerCase() }}</span>
          </template>
          <template v-else-if="tableNameTransform === 'toUpperCase'">
            <span>{{ table_prefix.toUpperCase() + option.label.toUpperCase() + table_suffix.toUpperCase() }}</span>
          </template>
          <template v-else>
            <span>{{ table_prefix + option.label + table_suffix }}</span>
          </template>
        </div>
        <div v-else>
          {{ option.label }}
        </div>
      </template>
    </el-transfer>
    <!-- <div style="position: fixed; top: 0; left: 0; z-index: 99; font-size: 12px">
      <div>data: {{ data }}</div>
      <div style="background-color: darkorange; color: #fff">
        data1: {{ data1 }}
      </div>
      <div style="background-color: darkorange; color: #fff">
        queueData: {{ queueData }}
      </div>
      <div style="background-color: darkgreen; color: #fff">
        data2: {{ data2 }}
      </div>
      <div style="background-color: darkgreen; color: #fff">
        topicData: {{ topicData }}
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'MqTransfer',
  props: {
    source: {
      type: Array,
      default: () => {
        return []
      }
    },
    tableNameTransform: {
      type: String,
      default: () => {
        return ''
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
    tableNameTransform(val) {
      this.tableNameTransform = val
      console.log(this.tableNameTransform)
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
      this.data = this.data.map(item => ({ key: item.original_name, label: item.original_name }))

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
  height: 100%;
  ::v-deep {
    .topic-transfer,
    .queue-transfer {
      & > div:last-child {
        position: absolute;
        height: 48% !important;
      }
    }
    .topic-transfer {
      z-index: 2;
      & > div:last-child {
        top: 0;
      }
      .el-transfer__buttons {
        padding-top: 100px !important;
        vertical-align: top;
      }
    }
    .queue-transfer {
      position: absolute;
      top: 0;
      width: 0;
      z-index: 1;
      & > div:first-child {
        visibility: hidden;
      }
      & > div:last-child {
        bottom: 0;
      }
      .el-transfer__buttons {
        padding-bottom: 100px !important;
        vertical-align: bottom;
      }
    }
  }
}
</style>
