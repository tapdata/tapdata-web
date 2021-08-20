<template>
  <el-dialog
    width="900px"
    custom-class="customer_form"
    :before-close="handleClose"
    :title="$t('module_form_customer_Api')"
    :close-on-click-modal="false"
    :append-to-body="true"
    :visible.sync="dialogFormVisible"
  >
    <el-form :model="model" ref="form" label-width="120px">
      <el-form-item :label="$t('module_form_describtion')">
        <el-input v-model="model.describtion" size="mini"></el-input>
      </el-form-item>
      <el-form-item :label="$t('module_form_method')">
        <el-select v-model="model.method" placeholder="请选择" size="mini">
          <el-option label="GET" value="GET"></el-option>
          <el-option label="STREAM" value="STREAM"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('module_form_fields')">
        <el-table :data="fields" ref="table" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="45" :reserve-selection="true"> </el-table-column>
          <el-table-column prop="field_name" :label="$t('module_form_fields')"></el-table-column>
          <el-table-column prop="javaType" :label="$t('module_form_datatype')"></el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item :label="$t('module_form_condition')"> </el-form-item>
      <el-form-item :label="$t('module_form_available_query_field')" v-if="model.method !== 'STREAM'">
        <el-select v-model="model.availableQueryField" multiple filterable size="mini">
          <el-option
            v-for="item in model.fields"
            :label="item.field_name"
            :value="item.field_name"
            :key="item.field_name"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('module_form_required_query_field')" v-if="model.method !== 'STREAM'">
        <el-select v-model="model.requiredQueryField" multiple filterable size="mini">
          <el-option
            v-for="item in model.fields"
            :label="item.field_name"
            :value="item.field_name"
            :key="item.field_name"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="handleClose()" size="small">
        {{ $t('message.cancel') }}
      </el-button>
      <el-button type="primary" @click="save()" size="small">{{ $t('message.save') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CustomerApiForm',
  props: {
    apiData: {
      required: true,
      value: Object
    },
    dialogVisible: {
      required: true,
      value: Boolean
    }
  },
  data() {
    return {
      dialogFormVisible: this.dialogVisible || false,
      selectionRow: [],
      model: {
        describtion: '',
        method: 'GET',
        fields: [],
        availableQueryField: '',
        requiredQueryField: ''
      }
    }
  },
  created() {
    console.log(this.apiData)
    this.model = this.apiData
    if (this.model.fields.length) {
      this.model.fields.forEach(item => {
        if (item.visible === undefined) {
          this.$set(item, 'visible', true)
          this.selectionRow.push(item)
        }
      })
    }
    this.$nextTick(() => {
      this.toggleSelection(this.fields)
    })
  },
  computed: {
    fields() {
      let fieldData = this.model.fields.map(item => {
        item.field_name = item.alias_name ? item.alias_name + ' ( ' + item.field_name + ' ) ' : item.field_name
        item.javaType = item.data_type || item.javaType
        return item
      })
      return fieldData
    }
  },
  methods: {
    // 选中字段
    handleSelectionChange(data) {
      this.selectionRow = data
    },
    toggleSelection(rows) {
      rows.forEach(row => {
        if (row.visible) {
          this.$refs.table.toggleRowSelection(row, true)
        }
      })
    },
    // 保存
    save() {
      let _this = this
      this.$refs.form.validate(valid => {
        if (valid) {
          _this.model.fields.forEach(field => {
            field.visible = false
            _this.selectionRow.filter(item => {
              if (field.field_name === item.field_name) {
                field.visible = true
              }
            })
          })
          this.$emit('newApiPath', this.model)
        }
      })
    },
    // 关闭弹窗
    handleClose() {
      this.dialogFormVisible = false
      this.$emit('dialogVisible', false)
    }
  },
  updated() {
    // 在这里调用toggleSelection选中方法
    this.toggleSelection(this.fields)
  }
}
</script>

<style lang="scss">
.customer_form {
  height: 90%;
  margin: 50px auto 0 !important;
  overflow: hidden;
  .el-dialog__body {
    height: calc(100% - 126px);
    padding: 10px 20px 0;
    overflow-y: auto;
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}
</style>
