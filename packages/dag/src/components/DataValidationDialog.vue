<template>
  <ElDialog
    :visible.sync="dialogVisible"
    :title="$t('public_data_validation')"
    append-to-body
    width="500px"
    custom-class="data-validation-dialog"
    @close="handleClose"
  >
    <div v-loading="loading">
      <div class="validation-header gap-3">
        <div class="header-label">{{ $t('packages_dag_enable_validation') }}</div>
        <div class="switch-container">
          <ElSwitch v-model="validationEnabled" />
        </div>
      </div>

      <div class="validation-content" v-if="validationEnabled">
        <div class="validation-option">
          <ElRadio v-model="validationType" label="cdc">
            <span class="radio-label">{{ $t('packages_dag_incremental_validation') }}</span>
          </ElRadio>
        </div>

        <div class="validation-frequency">
          <div class="font-color-dark mb-4">{{ $t('packages_dag_validation_frequency') }}</div>
          <div class="frequency-inputs">
            <span class="frequency-text">{{ $t('packages_dag_every') }}</span>
            <div class="input-number-container">
              <ElInputNumber v-model="frequencyTime" :min="1" controls-position="right" />
            </div>
            <span class="frequency-text">{{ $t('packages_dag_seconds') }}</span>
            <div class="input-number-container">
              <ElInputNumber v-model="frequencyRecords" :min="1" controls-position="right" />
            </div>
            <span class="frequency-text">{{ $t('packages_dag_records') }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="handleClose">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton type="primary" @click="handleSave">{{ $t('public_button_save') }}</ElButton>
    </template>
  </ElDialog>
</template>

<script>
import { taskInspectApi } from '@tap/api'

export default {
  name: 'DataValidationDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },
    validationSettings: {
      type: Object,
      default: () => ({
        enabled: false,
        type: 'incremental',
        frequency: {
          time: 1,
          records: 10
        }
      })
    }
  },

  data() {
    return {
      loading: false,
      saving: false,
      validationEnabled: false,
      validationType: 'cdc',
      frequencyTime: 1,
      frequencyRecords: 10
    }
  },

  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.initFormData()
      }
    }
  },

  methods: {
    async initFormData() {
      this.loading = true
      const res = await taskInspectApi.getConfig(this.taskId)
      this.validationEnabled = res.mode && res.mode !== 'CLOSE'
      this.frequencyTime = res.custom.cdc.sample.interval
      this.frequencyRecords = res.custom.cdc.sample.limit
      this.loading = false
    },

    handleClose() {
      this.dialogVisible = false
    },

    async handleSave() {
      const settings = {
        mode: this.validationEnabled ? 'CUSTOM' : 'CLOSE',
        custom: {
          cdc: {
            enable: true,
            sample: { interval: this.frequencyTime, limit: this.frequencyRecords }, // 采样间隔和数量
            type: 'SAMPLE' // 采样类型
          }
        }
      }

      this.saving = true

      await taskInspectApi.putConfig(this.taskId, settings)

      this.dialogVisible = false
      this.saving = false
      this.$message.success(this.$t('public_message_save_ok'))
    }
  }
}
</script>

<style lang="scss" scoped>
.data-validation-dialog {
  border-radius: 12px;
  overflow: hidden;

  ::v-deep .el-dialog__header {
    display: none;
  }

  ::v-deep .el-dialog__body {
    padding: 0;
  }

  ::v-deep .el-dialog__footer {
    display: none;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;

  .dialog-title {
    font-size: 18px;
    font-weight: 500;
    color: #1f2329;
  }

  .close-button {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.validation-container {
  padding: 24px;
}

.validation-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  .switch-container {
    ::v-deep .el-switch__core {
      height: 24px;
      border-radius: 12px;
      width: 50px !important;

      &::after {
        height: 20px;
        width: 20px;
        top: 1px;
      }
    }

    ::v-deep .el-switch.is-checked .el-switch__core::after {
      margin-left: -21px;
    }
  }
}

.validation-content {
  margin-top: 24px;
}

.validation-option {
  margin-bottom: 24px;

  .custom-radio {
    display: flex;
    align-items: center;

    ::v-deep .el-radio__input {
      .el-radio__inner {
        width: 20px;
        height: 20px;
        border-color: #d9d9d9;

        &::after {
          width: 10px;
          height: 10px;
          background-color: #5764f6;
        }
      }

      &.is-checked {
        .el-radio__inner {
          border-color: #5764f6;
          background: #ffffff;
        }
      }
    }

    .radio-label {
      font-size: 15px;
      color: #1f2329;
      margin-left: 4px;
    }
  }
}

.validation-frequency {
  background-color: #f7f8fa;
  padding: 20px;
  border-radius: 8px;

  .frequency-inputs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .frequency-text {
      font-size: 14px;
      color: #3e4152;
      margin: 0 8px;
    }

    .input-number-container {
      .custom-input-number {
        width: 100px;

        ::v-deep .el-input__inner {
          height: 36px;
          border-color: #e4e7ed;
          border-radius: 6px;
          text-align: center;
        }

        ::v-deep .el-input-number__decrease,
        ::v-deep .el-input-number__increase {
          background-color: #f5f7fa;
          border-color: #e4e7ed;
          color: #606266;

          &:hover {
            color: #5764f6;
          }
        }
      }
    }
  }
}
</style>
