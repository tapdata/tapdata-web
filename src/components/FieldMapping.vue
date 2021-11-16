<template>
  <div>
    <el-button
      size="mini"
      class="e-button"
      v-if="showBtn"
      :loading="loading"
      :disabled="isDisable"
      @click="fieldProcess()"
      >字段映射</el-button
    >
    <el-dialog
      v-if="dialogFieldProcessVisible"
      width="85%"
      title="映射配置"
      :visible.sync="dialogFieldProcessVisible"
      :modal-append-to-body="false"
      custom-class="database-filed-mapping-dialog"
      :close-on-click-modal="false"
    >
      <FieldMapping
        ref="fieldMappingDom"
        class="custom-field-mapping"
        :remoteMethod="intiFieldMappingTableData"
        :typeMappingMethod="getTypeMapping"
        :fieldProcessMethod="updateFieldProcess"
        :updateMetadata="updateMetadata"
        :fieldMappingNavData="fieldMappingNavData"
        :field_process="field_process"
        :transform="transform"
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
  props: [
    'dataFlow',
    'databaseFieldProcess',
    'showBtn',
    'hiddenFieldProcess',
    'stageId',
    'isFirst',
    'mappingType',
    'selectSourceArr',
    'transform',
    'getDataFlow',
    'isDisable'
  ],
  data() {
    return {
      //表设置
      fieldMappingNavData: '', //左边导航
      fieldMappingTableData: '', //右边table
      dialogFieldProcessVisible: false,
      loading: false,
      field_process: this.databaseFieldProcess
    }
  },
  methods: {
    /*
     * 模型推演
     * 新建任务，首次全部恢复默认
     * 过滤条件：当前目标节点 stageId
     * 触发父组件：首次条件
     * */
    fieldProcess() {
      //点击按钮重新拿值
      if (this.getDataFlow) {
        this.dataFlow = this.getDataFlow()
      }

      if (!this.dataFlow) return
      //迁移任务需要同步字段处理器
      if (this.mappingType && this.mappingType === 'cluster-clone') {
        this.dataFlow = this.updateAutoFieldProcess(this.dataFlow)
        //是否有选中的表
        if (
          this.transform?.topicData?.length === 0 &&
          this.transform?.queueData?.length === 0 &&
          this.transform.transferFlag //mq判断
        ) {
          this.$message.error('请先选择需要迁移的表')
          return
        } else if (this.selectSourceArr?.length === 0 && !this.transform.transferFlag) {
          this.$message.error('请先选择需要迁移的表') //其他数据源
          return
        }
      }
      this.loading = true
      let dataFlowId = this.dataFlow.id
      if (this.isFirst && !dataFlowId) {
        this.dataFlow['rollback'] = 'all' //新建任务重置恢复默认
      } else {
        delete this.dataFlow['rollback']
        delete this.dataFlow['rollbackTable']
      }
      if (this.stageId) {
        this.dataFlow['stageId'] = this.stageId //任务同步目标节点stageID 推演
      }
      let promise = this.$api('DataFlows').getMetadata(this.dataFlow)
      promise
        .then(data => {
          this.dialogFieldProcessVisible = true
          this.fieldMappingNavData = data?.data
          this.$emit('update-first', false) //新建任务 第一次需要恢复默认
        })
        .catch(() => {
          this.$message.error('字段推演失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    //任务迁移需要主动更新
    updateAutoFieldProcess(data) {
      for (let i = 0; i < data.stages.length; i++) {
        if (data.stages[i].outputLanes?.length > 0) {
          data['stages'][i].field_process = this.field_process
        }
      }
      return data
    },
    /*
     * 子模块-恢复默认操作
     * 对应清空字段处理器
     * 更新父组件 fromData 字段处理器
     * 触发模型重新推演
     * 清空表改名 字段改名
     * */
    async updateFieldProcess(rollback, rollbackTable, id) {
      if (!this.dataFlow) return
      if (rollback === 'all') {
        this.dataFlow['rollback'] = rollback
        //删除整个字段处理器
        this.field_process = []
        //清空表改名 字段改名
        this.clearTransform()
      } else if (rollbackTable) {
        this.dataFlow['rollback'] = rollback
        this.dataFlow['rollbackTable'] = rollbackTable
        if (this.field_process?.length > 0) {
          for (let i = 0; i < this.field_process.length; i++) {
            // 删除操作
            let ops = this.field_process[i]
            if (ops.table_id === id) {
              this.field_process.splice(i, 1)
            }
          }
        }
        let result = this.$refs.fieldMappingDom.returnForm()
        this.updateAutoTransform('', result)
      }
      this.$emit('returnFieldMapping', this.field_process)
      //迁移任务需要同步字段处理器
      if (this.mappingType && this.mappingType === 'cluster-clone') {
        this.dataFlow = this.updateAutoFieldProcess(this.dataFlow)
      }
      let promise = await this.$api('DataFlows').getMetadata(this.dataFlow)
      return promise?.data
    },
    //清空表改名 字段改名
    clearTransform() {
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i].id === this.stageId) {
          this.dataFlow['stages'][i].fieldsNameTransform = ''
          this.dataFlow['stages'][i].tableNameTransform = ''
          this.dataFlow['stages'][i].table_suffix = ''
          this.dataFlow['stages'][i].table_prefix = ''
        }
      }
    },
    updateAutoTransform(type, data) {
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i].id === this.stageId) {
          this.dataFlow['stages'][i].fieldsNameTransform = data.fieldsNameTransform
          this.dataFlow['stages'][i].tableNameTransform = data.tableNameTransform
          this.dataFlow['stages'][i].table_prefix = data.table_prefix
          this.dataFlow['stages'][i].table_suffix = data.table_suffix
        }
      }
    },
    checkTransform() {
      let result = this.$refs.fieldMappingDom.returnForm()
      return result.fieldsNameTransform
    },
    //获取左边导航数据 - 表
    async updateMetadata(type, data) {
      this.updateAutoTransform(type, data) //更新当前form
      let promise = await this.$api('DataFlows').getMetadata(this.dataFlow)
      return promise?.data
    },
    //更新左边导航
    updateFieldMappingNavData(data) {
      this.fieldMappingNavData = data
    },
    /*
     * 初始化右边table数据
     * 请求参数：QualifiedName 分别获取源表字段、目标表字段
     * 过滤：不支持嵌套字段
     * 数据组合：目标字段表示 "t_"标识 (is_deleted 目标表数据)
     * 数据匹配 源表所有字段过处理器 源表所有字段过字段改名 匹配后的数据再与目标表数据匹配
     * */
    async intiFieldMappingTableData(row) {
      let source = await this.$api('MetadataInstances').originalData(row.sourceQualifiedName)
      source = source.data && source.data.length > 0 ? source.data[0].fields : []
      let target = await this.$api('MetadataInstances').originalData(row.sinkQulifiedName, '&isTarget=true')
      target = target.data && target.data.length > 0 ? target.data[0].fields : []
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      //是否有字段处理器
      let operations = this.getFieldOperations(row)
      if (operations?.length > 0) {
        source.forEach(item => {
          let original_field_name = item.original_field_name || item.field_name
          let ops = operations.filter(op => op.original_field_name === original_field_name && op.op === 'RENAME')
          if (!ops || ops?.length === 0) {
            item.temporary_field_name = item.field_name
            return
          }
          ops = ops[0]
          item.temporary_field_name = ops.operand
        })
      } else {
        source.forEach(item => {
          item.temporary_field_name = item.field_name
        })
      }
      //是否有批量字段改名操作
      let fieldsNameTransform = this.checkTransform()
      if (fieldsNameTransform !== '') {
        source.forEach(item => {
          if (fieldsNameTransform === 'toUpperCase') {
            item.temporary_field_name = item.temporary_field_name.toUpperCase() || item.field_name.toUpperCase()
          } else if (fieldsNameTransform === 'toLowerCase') {
            item.temporary_field_name = item.temporary_field_name.toLowerCase() || item.field_name.toLowerCase()
          }
        })
      }
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
            t_isPrecisionEdit: true, //默认能编辑
            t_isScaleEdit: true //默认能编辑
          }
          //检查当前name个数
          if (item.temporary_field_name === field.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
        })
      })
      return {
        data: fieldMappingTableData,
        target: target
      }
    },
    checkFieldName(field_name, target) {
      return target.filter(field => field_name === field.original_field_name)
    },
    //获取字段处理器
    getFieldOperations(row) {
      let operations = []
      if (!this.field_process || this.field_process.length === 0) return
      let field_process = this.field_process.filter(process => process.table_id === row.sourceTableId)
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
      this.$emit('returnPreFixSuffix', returnData.changNameData)
      this.saveOperations(returnData.row, returnData.operations, returnData.target, returnData.changNameData)
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
.e-button {
  padding: 4px 10px;
  color: #666;
  background-color: #f5f5f5;
  margin-left: 10px;
}
</style>
