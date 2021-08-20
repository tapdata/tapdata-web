<template>
  <div>
    <el-button size="mini" @click="fieldProcess()">字段映射</el-button>
    <el-dialog
      width="85%"
      title="映射配置"
      :visible.sync="dialogFieldProcessVisible"
      :modal-append-to-body="false"
      custom-class="databaseLinkDialog"
      :close-on-click-modal="false"
      v-if="dialogFieldProcessVisible"
    >
      <FieldMapping
        ref="fieldMappingDom"
        :remoteMethod="intiFieldMappingTableData"
        :typeMappingMethod="getTypeMapping"
        :fieldProcessMethod="updateFieldProcess"
        :fieldMappingNavData="fieldMappingNavData"
        :field_process="field_process"
        @row-click="saveOperations"
        @update-nav="updateFieldMappingNavData"
      ></FieldMapping>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveReturnData">{{ $t('dataVerify.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FiledMapping',
  props: ['dataFlow', 'parentFieldProcess'],
  data() {
    return {
      //表设置
      fieldMappingNavData: '',
      fieldMappingTableData: '',
      dialogFieldProcessVisible: false,
      scope: '',
      field_process: []
    }
  },
  mounted() {
    this.field_process = this.parentFieldProcess
  },
  methods: {
    //表设置
    fieldProcess() {
      if (!this.dataFlow) return
      let promise = this.$api('DataFlows').getMetadata(this.dataFlow)
      promise
        .then(data => {
          this.dialogFieldProcessVisible = true
          this.fieldMappingNavData = data?.data
        })
        .catch(() => {
          this.$message.error('接口请求失败')
        })
    },
    async updateFieldProcess(rollback, rollbackTable, id) {
      let data = this.scope.getDataFlowData()
      if (!data) return
      if (rollback === 'all') {
        data['rollback'] = rollback
        //删除整个字段处理器
        this.field_process = []
      } else if (rollbackTable) {
        data['rollback'] = rollback
        data['rollbackTable'] = rollbackTable
        for (let i = 0; i < this.field_process.length; i++) {
          // 删除操作
          let ops = this.field_process[i]
          if (ops.table_id === id) {
            this.field_process.splice(i, 1)
          }
        }
      }
      let promise = await this.$api('DataFlows').getMetadata(data)
      return promise?.data
    },
    //更新左边导航
    updateFieldMappingNavData(data) {
      this.fieldMappingNavData = data
    },
    //获取表设置
    async intiFieldMappingTableData(row) {
      let source = await this.$api('MetadataInstances').originalData(row.sourceQualifiedName)
      source = source.data && source.data.length > 0 ? source.data[0].fields : []
      let target = await this.$api('MetadataInstances').originalData(row.sinkQulifiedName, '&isTarget=true')
      target = target.data && target.data.length > 0 ? target.data[0].fields : []
      //源表 目标表数据组合
      let fieldMappingTableData = []
      source.forEach(item => {
        target.forEach(field => {
          //先检查是否被改过名
          let node = {
            t_id: field.id,
            t_field_name: field.field_name,
            t_data_type: field.data_type,
            t_scale: field.scale,
            t_precision: field.precision,
            is_deleted: field.is_deleted //目标决定这个字段是被删除？
          }
          if (item.field_name === field.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
          let ops = this.handleFieldName(row, field.field_name)
          if (!ops || ops?.length === 0) return
          ops = ops[0]
          if (ops.operand === field.field_name && ops.field === item.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
        })
      })
      return {
        data: fieldMappingTableData,
        target: target
      }
    },
    //获取字段处理器
    getFieldOperations(row) {
      let operations = []
      if (!this.field_process || this.field_process.length === 0) return
      let field_process = this.field_process.filter(process => process.table_id === row.sourceQualifiedName)
      if (field_process.length > 0) {
        operations = field_process[0].operations ? JSON.parse(JSON.stringify(field_process[0].operations)) : []
      }
      return operations || []
    },
    //判断是否改名
    handleFieldName(row, fieldName) {
      let operations = this.getFieldOperations(row)
      if (!operations) return
      let ops = operations.filter(op => op.operand === fieldName && op.op === 'RENAME')
      return ops
    },
    //获取typeMapping
    async getTypeMapping(row) {
      let promise = await this.$api('TypeMapping').getId(row.sinkDbType)
      return promise?.data
    },
    saveReturnData() {
      //保存字段映射
      let returnData = this.$refs.fieldMappingDom.returnData()
      if (!returnData.valid) return //检验不通过
      this.saveOperations(returnData.row, returnData.operations, returnData.target)
      this.dialogFieldProcessVisible = false
    },
    //保存字段处理器
    saveOperations(row, operations, target) {
      if (!operations || operations?.length === 0 || !target || target?.length === 0) return
      let where = {
        qualified_name: row.sinkQulifiedName
      }
      let data = {
        fields: target
      }
      this.$api('MetadataInstances').update(where, data)
      this.field_process = this.$refs.fieldMappingDom.saveFileOperations()
    },
    //返回field_process
    returnFieldProcess() {
      return this.field_process
    }
  }
}
</script>

<style scoped lang="scss">
.databaseLinkDialog {
  height: 800px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  .el-dialog__body {
    display: flex;
    flex: 1;
  }
  .e-row {
    padding: 0 50px;
  }
  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
