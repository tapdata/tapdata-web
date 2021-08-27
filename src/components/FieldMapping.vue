<template>
  <div>
    <el-button size="mini" v-if="showBtn" @click="fieldProcess()">字段映射</el-button>
    <el-dialog
      width="85%"
      title="映射配置"
      :visible.sync="dialogFieldProcessVisible"
      :modal-append-to-body="false"
      custom-class="database-filed-mapping-dialog"
      :close-on-click-modal="false"
      v-if="dialogFieldProcessVisible"
    >
      <FieldMapping
        ref="fieldMappingDom"
        class="custom-field-mapping"
        :remoteMethod="intiFieldMappingTableData"
        :typeMappingMethod="getTypeMapping"
        :fieldProcessMethod="updateFieldProcess"
        :fieldMappingNavData="fieldMappingNavData"
        :field_process="field_process"
        :hiddenFieldProcess="hiddenFieldProcess"
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
  props: ['dataFlow', 'showBtn', 'hiddenFieldProcess', 'stageId'],
  data() {
    return {
      //表设置
      fieldMappingNavData: '',
      fieldMappingTableData: '',
      dialogFieldProcessVisible: false,
      field_process: []
    }
  },
  methods: {
    //表设置
    fieldProcess() {
      if (!this.dataFlow) return
      delete this.dataFlow['rollback']
      delete this.dataFlow['rollbackTable']
      if (this.stageId) {
        this.dataFlow['stageId'] = this.stageId //任务同步目标节点stageID 推演
      }
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
      if (!this.dataFlow) return
      if (rollback === 'all') {
        this.dataFlow['rollback'] = rollback
        //删除整个字段处理器
        this.field_process = []
      } else if (rollbackTable) {
        this.dataFlow['rollback'] = rollback
        this.dataFlow['rollbackTable'] = rollbackTable
        for (let i = 0; i < this.field_process.length; i++) {
          // 删除操作
          let ops = this.field_process[i]
          if (ops.table_id === id) {
            this.field_process.splice(i, 1)
          }
        }
      }
      this.$emit('returnFieldMapping', this.field_process)
      let promise = await this.$api('DataFlows').getMetadata(this.dataFlow)
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
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      //源表 目标表数据组合
      let fieldMappingTableData = []
      source.forEach(item => {
        target.forEach(field => {
          let node = {
            t_id: field.id,
            t_field_name: field.field_name,
            t_data_type: field.data_type,
            t_scale: field.scale,
            t_precision: field.precision,
            is_deleted: field.is_deleted, //目标决定这个字段是被删除？
            t_isPrecisionEdit: true, //默认不能编辑
            t_isScaleEdit: true //默认不能编辑
          }
          if (item.field_name === field.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
          //先检查是否被改过名 任务同步不需要检测字段处理器
          if (this.hiddenFieldProcess) return
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
      let deleteLen = returnData.target.filter(v => !v.is_deleted)
      if (deleteLen.length === 0) {
        this.$message.error('当前表被删除了所有字段，不允许保存操作')
        return //所有字段被删除了 不可以保存任务
      }
      this.saveOperations(returnData.row, returnData.operations, returnData.target)
      this.dialogFieldProcessVisible = false
    },
    //保存字段处理器
    saveOperations(row, operations, target) {
      if (!target || target?.length === 0) return
      let where = {
        qualified_name: row.sinkQulifiedName
      }
      let data = {
        fields: target
      }
      this.$api('MetadataInstances').update(where, data)
      if (this.hiddenFieldProcess) return //任务同步 没有字段处理器
      this.field_process = this.$refs.fieldMappingDom.saveFileOperations()
      this.$emit('returnFieldMapping', this.field_process)
    },
    //job 字段映射逻辑 自动推演 //保存前 自动推演
    autoFiledProcess(data) {
      this.dialogFieldProcessVisible = true
      this.fieldMappingNavData = data
    }
  }
}
</script>

<style scoped lang="scss">
.database-filed-mapping-dialog {
  height: 800px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  .custom-field-mapping {
    height: 500px;
  }
  .el-dialog__body {
    display: flex;
    flex: 1;
    overflow: hidden;
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
