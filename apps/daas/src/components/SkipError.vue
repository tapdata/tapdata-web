<template>
  <el-dialog :title="$t('dataFlow.skipError.title')" :visible.sync="dialogVisible" width="60%">
    <div class="skip-tip">{{ $t('dataFlow.skipError.tip') }}</div>
    <div class="skip-tip">{{ $t('dataFlow.skipError.attention') }}</div>
    <div class="skip-name">
      {{ `${$t('dataFlow.skipError.taskName')}:` }}
      <span class="link-primary">{{ task.name }}</span>
    </div>
    <ul class="error-list">
      <span class="check-all"
        ><el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
          $t('dataFlow.selectAll')
        }}</el-checkbox></span
      >
      <el-checkbox-group v-model="checkedData" @change="handleCheckedDataChange" class="list-box">
        <li v-for="(item, index) in errorEvents" :key="item.index">
          <el-checkbox :label="index">
            <div class="error-content">
              <span class="error-msg"><span style="color: red">[ERROR]</span> {{ item.message }}</span>
            </div>
          </el-checkbox>
        </li>
      </el-checkbox-group>
    </ul>
    <div class="total">
      {{ errorTotal }} {{ checkedData.length }}
      {{ $t('dataFlow.skipError.strip') }}
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false" size="mini">{{ $t('dataFlow.skipError.cancel') }}</el-button>
      <el-button type="primary" size="mini" @click="skipErrorData">{{ $t('dataFlow.skipError.startJob') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { dataFlowsApi } from '@tap/api'
export default {
  name: 'SkipError',
  data() {
    return {
      dialogVisible: false,
      errorEvents: [],
      isIndeterminate: true,
      checkAll: false,
      checkedData: [],
      task: {},
      errorTotal: this.$t('dataFlow.skipError.errorTotal')
    }
  },
  methods: {
    async checkError(task, callback) {
      let errorEvents = []
      if (!task.status || task.status === 'error') {
        let data = await dataFlowsApi.get([task.id])
        data = data || {}
        if (data.status === 'error' && data.setting.stopOnError && data.errorEvents && data.errorEvents.length > 0) {
          this.dialogVisible = true
          this.task = data
          errorEvents = data.errorEvents
          this.errorEvents = errorEvents
          this.errorTotal = this.errorTotal.replace('XX', this.errorEvents.length)
          return
        }
      }
      if (callback) {
        callback()
      }
    },
    handleCheckAllChange(val) {
      let ids = this.errorEvents.map((item, index) => {
        return index
      })
      this.checkedData = val ? ids : []
      this.isIndeterminate = false
    },
    handleCheckedDataChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.errorEvents.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.errorEvents.length
      this.checkedData = value
    },
    skipErrorData() {
      if (this.checkedData.length > 0) {
        let data = []
        this.checkedData.forEach(item => {
          data.push(this.errorEvents[item])
        })
        this.checkedData = data
      } else {
        this.checkedData = []
      }
      this.$emit('skip', this.task.id, this.checkedData)
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
.error-list {
  .el-checkbox__input {
    vertical-align: top;
  }
}
</style>
<style scoped lang="scss">
.error-list {
  background: #fefefe;
  border: 1px solid #dedee4;
  vertical-align: bottom;
  font-size: 12px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  li {
    margin-top: 10px;
    margin-left: 10px;
    .error-content {
      font-size: 12px;
      background-color: map-get($bgColor, white);
      border: 1px solid #dedee4;
      width: 96%;
      padding: 5px 10px;
    }
    .error-msg {
      font-size: 12px;
      display: inline-block;
      line-height: 20px;
      word-break: normal;
      white-space: normal;
      user-select: text;
    }
  }
  li:last-child {
    margin-bottom: 10px;
  }
  .check-all {
    display: inline-block;
    margin-left: 10px;
    margin-top: 10px;
  }
}
.skip-name {
  width: 98%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  margin-top: 18px;
  margin-bottom: 10px;
}
.skip-tip {
  font-size: 12px;
  color: map-get($fontColor, slight);
}
.total {
  padding-top: 5px;
  font-size: 12px;
}
</style>
