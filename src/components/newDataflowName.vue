<template>
  <el-dialog
    class="sp-setting"
    :title="'STEP4: ' + $t('editor.ui.sidebar.setting')"
    :visible.sync="dialogVisibleSetting"
    width="40%"
    :close-on-click-modal="false"
    :show-close="false"
    :before-close="handleClose"
  >
    <el-form label-width="150px">
      <el-form-item :label="$t('dataFlow.taskName')">
        <el-input v-model="dataflow.name" maxlength="50" show-word-limit class="task-name"></el-input>
      </el-form-item>
    </el-form>
    <setting ref="setting"></setting>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('dataFlow.previous') }}</el-button>
      <el-button type="primary" @click="save">{{ $t('dataFlow.execution') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import setting from '../views/job/Setting'

export default {
  name: 'newDataFlow',
  components: { setting },
  watch: {
    dialogVisibleSetting: {
      handler() {
        this.dataflow.name = this.$parent.dataFlow.name
        this.dataflow.setting = this.$parent.editor.graph.getSettingData() || this.$parent.dataFlow.setting
      }
    }
  },
  data() {
    return {
      dataflow: {
        name: '',
        setting: {
          sync_type: '',
          stopOnError: '',
          needToCreateIndex: ''
        }
      },
      loading: false,
      dialogVisibleSetting: true
    }
  },
  mounted() {
    this.dataflow.name = this.$parent.editor.ui.getName()
    this.dataflow.setting = this.$parent.editor.graph.getSettingData() || this.$parent.dataFlow.setting
    this.$nextTick(() => {
      this.$refs.setting.isSimple = true
      this.$refs.setting.showMore = false
      this.$refs.setting.editor = this.$parent.editor
      this.$refs.setting.setData(this.dataflow.setting)
    })
  },
  methods: {
    handleClose() {
      this.dialogVisibleSetting = false
      this.$parent.editor.ui.setName(this.dataflow.name)
      this.$parent.editor.graph.setSettingData(this.$refs.setting.getData())
      this.$parent.$refs.simpleScene.prevStep()
    },
    save() {
      this.$parent.editor.ui.setName(this.dataflow.name)
      this.$parent.editor.graph.setSettingData(this.$refs.setting.getData())
      this.$parent.start()
    }
  }
}
</script>

<style lang="scss">
.advance-setting {
  color: #409eff;
  cursor: pointer;
}
.sp-setting {
  .el-input__inner {
    height: 28px;
  }
  .el-form-item {
    font-size: 12px;
    margin-bottom: 0;
  }
  .task-name {
    width: 480px;
  }
  .el-form-item__label {
    font-size: 12px;
  }
  .data-flow-setting .e-form {
    padding: 0;
  }
}
</style>
