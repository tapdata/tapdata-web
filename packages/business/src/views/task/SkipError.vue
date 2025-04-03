<template>
  <ElDialog
    :title="`${$t('packages_business_dataFlow_skipError_title')} - ${taskName}`"
    :model-value="visible"
    @update:visible="visible = $event"
    width="60%"
  >
    <div class="lh-base mb-3">
      <ElAlert
        :title="$t('packages_business_dataFlow_skipError_attention')"
        :description="$t('packages_business_dataFlow_skipError_tip')"
        type="warning"
        :closable="false"
      ></ElAlert>
    </div>

    <ul class="error-list rounded-lg bg-subtle">
      <span class="check-all"
        ><el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
          $t('packages_business_dataFlow_selectAll')
        }}</el-checkbox></span
      >
      <el-checkbox-group v-model="checkedData" @change="handleCheckedDataChange" class="list-box">
        <li v-for="item in errorEvents" :key="item.id">
          <el-checkbox :label="item.id" class="flex">
            <div class="error-content rounded-4">
              <span class="error-msg"><span style="color: red">[ERROR]</span> {{ item.message }}</span>
            </div>
          </el-checkbox>
        </li>
      </el-checkbox-group>
    </ul>
    <div class="pt-2">
      {{ errorTotal }} {{ checkedData.length }}
      {{ $t('packages_business_dataFlow_skipError_strip') }}
    </div>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="visible = false" size="mini">{{ $t('public_button_cancel') }}</el-button>
        <el-button :loading="skipping" type="primary" size="mini" @click="skipErrorData">{{
          $t('packages_business_dataFlow_skipError_startJob')
        }}</el-button>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { taskApi } from '@tap/api'
export default {
  name: 'SkipError',
  props: {
    // visible: Boolean
  },
  data() {
    return {
      skipping: false,
      taskName: '',
      taskId: '',
      visible: false,
      errorEvents: [],
      checkAll: false,
      checkedData: [],
      errorTotal: this.$t('packages_business_dataFlow_skipError_errorTotal'),
    }
  },
  computed: {
    isIndeterminate() {
      return this.checkedData.length > 0 && this.checkedData.length < this.errorEvents.length
    },
  },
  methods: {
    async checkError(task) {
      if (task.status === 'error') {
        const errorEvents = await taskApi.getErrorEvents(task.id)

        if (!errorEvents?.length) return

        this.visible = true
        this.checkAll = false
        this.checkedData = []
        this.taskId = task.id
        this.taskName = task.name
        this.errorEvents = errorEvents.map((item) => {
          if (process.env.VUE_APP_KEYWORD && item.message) {
            item.message = item.message.replace(/tapdata\s?/gi, process.env.VUE_APP_KEYWORD)
          }
          delete item.stacks // stacks is too long
          return item
        })
        this.errorTotal = this.errorTotal.replace('XX', this.errorEvents.length)
        return true
      }
    },
    handleCheckAllChange(val) {
      this.checkedData = val
        ? this.errorEvents.map((item) => {
            return item.id
          })
        : []
    },
    handleCheckedDataChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.errorEvents.length
    },
    async skipErrorData() {
      this.skipping = true
      await taskApi.skipErrorEvents(this.taskId, this.checkedData)
      this.skipping = false
      this.visible = false
      this.$emit('skip', this.taskId)
    },
  },
  emits: ['skip'],
}
</script>

<style lang="scss">
.error-list {
  .el-checkbox__input {
    vertical-align: top;
  }
}
</style>

<style lang="scss" scoped>
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
    margin-left: 12px;
    margin-right: 12px;
    .error-content {
      background-color: map-get($bgColor, white);
      border: 1px solid #dedee4;
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
    ::v-deep {
      .el-checkbox__label {
        flex: 1;
      }
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
.task-name-wrapper {
  position: relative;
  padding-left: 12px;
  &::before {
    position: absolute;
    content: '';
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 8px;
    background-color: map-get($color, primary);
  }
}
</style>
