<template>
  <el-dialog
    width="800px"
    append-to-body
    :title="$t('task_mapping_batch_change_table_title')"
    custom-class="field-mapping-table-dialog"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :before-close="handleTableClose"
  >
    <div class="table-box">
      <el-form
        :rules="rules"
        ref="fieldForm"
        :model="form"
        :disabled="stateIsReadonly"
        label-position="top"
        class="table-form"
        label-width="120px"
      >
        <el-form-item :label="$t('task_mapping_dialog_table_name_case')">
          <el-select size="mini" v-model="form.tableNameTransform">
            <el-option :label="$t('task_mapping_dialog_constant')" value=""></el-option>
            <el-option :label="$t('task_mapping_dialog_to_uppercase')" value="toUpperCase"></el-option>
            <el-option :label="$t('task_mapping_dialog_lowercase')" value="toLowerCase"></el-option>
          </el-select>
        </el-form-item>
        <div class="tip">{{ $t('task_mapping_dialog_rule_note') }}</div>
        <el-form-item :label="$t('task_mapping_dialog_enter_prefix')" prop="tablePrefix">
          <el-input size="mini" v-model="form.tablePrefix" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <div class="tip">
          <span>{{ $t('task_mapping_dialog_english_letter') }}</span>
          <div>{{ $t('task_mapping_dialog_not_allow_system') }}</div>
        </div>
        <el-form-item :label="$t('task_mapping_dialog_enter_suffix')" prop="tableSuffix">
          <el-input size="mini" v-model="form.tableSuffix" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <div class="tip">
          <span>{{ $t('task_mapping_dialog_underscore_begin') }}</span>
        </div>
      </el-form>
      <div class="table-example">
        <h3>{{ $t('task_mapping_dialog_example') }}:</h3>
        <p>{{ $t('task_mapping_dialog_original_table_name') }}: tableName</p>
        <p>{{ $t('task_mapping_dialog_after_modify') }}: {{ tableName }}</p>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handleTableClose()">{{ $t('button_cancel') }}</el-button>
      <el-button size="mini" type="primary" :disabled="stateIsReadonly" @click="handleTableNameSave()">{{
        $t('button_confirm')
      }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'TableFieldRenameDialog',
  props: ['visible', 'transform'],
  data() {
    var validatePrefix = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!/^[a-zA-Z]([a-zA-Z0-9_\-.])*$/.test(value)) {
        callback(new Error(this.$t('task_mapping_dialog_rule_input')))
      } else if (/^(system).*/.test(value)) {
        callback(new Error(this.$t('task_mapping_dialog_rule_input')))
      } else {
        callback()
      }
    }
    var validateSuffix = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_\-.]*$/.test(value)) {
        callback(new Error(this.$t('task_mapping_dialog_rule_input')))
      } else {
        callback()
      }
    }
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      form: {},
      currentForm: {},
      rules: {
        tablePrefix: [{ validator: validatePrefix, trigger: 'blur' }],
        tableSuffix: [{ validator: validateSuffix, trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.form = {
        tableNameTransform: this.transform.tableNameTransform || '',
        fieldsNameTransform: this.transform.fieldsNameTransform,
        tablePrefix: this.transform.tablePrefix,
        tableSuffix: this.transform.tableSuffix
      }
      this.currentForm = JSON.parse(JSON.stringify(this.form))
    })
  },
  computed: {
    tableName() {
      let tableName = ''
      if (this.form.tableNameTransform === 'toUpperCase') {
        tableName = (this.form.tablePrefix + 'tableName' + this.form.tableSuffix).toUpperCase()
      } else if (this.form.tableNameTransform === 'toLowerCase') {
        tableName = (this.form.tablePrefix + 'tableName' + this.form.tableSuffix).toLowerCase()
      } else {
        tableName = this.form.tablePrefix + 'tableName' + this.form.tableSuffix
      }
      return tableName
    }
  },
  methods: {
    /*表改名称弹窗取消*/
    /*copy 当前form*/
    copyForm() {
      this.currentForm = JSON.parse(JSON.stringify(this.form))
    },
    handleTableClose() {
      this.form.tableNameTransform = this.currentForm.tableNameTransform
      this.form.tablePrefix = this.currentForm.tablePrefix
      this.form.tableSuffix = this.currentForm.tableSuffix
      this.$emit('update:visible', false)
    },
    handleTableNameSave() {
      this.$refs.fieldForm.validate(valid => {
        if (valid) {
          this.copyForm()
          this.$emit('save', this.form)
        }
      })
    }
  }
}
</script>

<style scoped></style>
