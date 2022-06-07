<template>
  <div>
    <el-button
      v-if="transform.showBtn"
      size="mini"
      class="e-button"
      :loading="loading"
      :disabled="isDisable"
      @click="fieldProcess()"
      >{{ $t('dag_link_button_field_mapping') }}</el-button
    >
    <el-dialog
      v-if="dialogFieldProcessVisible"
      width="85%"
      :title="$t('dag_link_button_mapping_configuration')"
      :visible.sync="dialogFieldProcessVisible"
      :modal-append-to-body="false"
      custom-class="database-filed-mapping-dialog"
      :close-on-click-modal="false"
    >
      <FieldMappingDialog
        ref="fieldMappingDom"
        class="custom-field-mapping"
        :remoteMethod="intiFieldMappingTableData"
        :typeMappingMethod="getTypeMapping"
        :fieldProcessMethod="updateFieldProcess"
        :getNavDataMethod="getMetadataTransformer"
        :updateMetadata="updateMetadata"
        :field_process="transform.field_process"
        :transform="transform"
        @row-click="saveOperations"
        @update-nav="updateFieldMappingNavData"
      ></FieldMappingDialog>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="false" @click="saveReturnData">{{ $t('dataVerify.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FieldMappingDialog from './FieldMappingDialog'
import ws from '../api/ws'

export default {
  name: 'FiledMapping',
  components: { FieldMappingDialog },
  props: ['mappingType', 'transform', 'getDataFlow', 'isDisable'],
  data() {
    return {
      //表设置
      fieldMappingNavData: '', //左边导航
      fieldMappingTableData: '', //右边table
      dialogFieldProcessVisible: false,
      loading: false,
      field_process: this.transform.field_process
    }
  },
  mounted() {
    //监听ws error 关掉弹窗以及错误提示
    let self = this
    let id = this.transform.stageId
    ws.on('metadataTransformerProgress', function (res) {
      if (res?.data?.stageId === id) {
        let status = res?.data?.status
        if (['error'].includes(status)) {
          self.dialogFieldProcessVisible = false //推演失败 关闭弹窗
          self.$message.error(res?.data?.errorMsg)
        }
      }
    })
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
      if (this.transform.stageId) {
        this.dataFlow['stageId'] = this.transform.stageId //任务同步目标节点stageID 推演
      }
      //迁移任务需要同步字段处理器
      if (this.mappingType && this.mappingType === 'cluster-clone') {
        //是否目标有connectionIDld
        let checkTargetConnectionId = this.hasConnectionId(this.dataFlow)
        if (!checkTargetConnectionId || checkTargetConnectionId === false) {
          this.$message.error(this.$t('dag_link_field_mapping_error_tip'))
          return
        }
        this.dataFlow = this.updateAutoFieldProcess(this.dataFlow)
        //是否有选中的表
        if (
          this.transform?.topicData?.length === 0 &&
          this.transform?.queueData?.length === 0 &&
          this.transform.transferFlag //mq判断
        ) {
          this.$message.error(this.$t('dag_link_field_mapping_error_no_table'))
          return
        } else if (this.transform.selectSourceArr?.length === 0 && !this.transform.transferFlag) {
          this.$message.error(this.$t('dag_link_field_mapping_error_no_table')) //其他数据源
          return
        }
      }
      this.loading = true
      let dataFlowId = this.dataFlow.id
      if (this.transform.isFirst && !dataFlowId) {
        this.dataFlow['rollback'] = 'all' //新建任务重置恢复默认
      } else {
        delete this.dataFlow['rollback']
        delete this.dataFlow['rollbackTable']
      }
      let promise = this.$api('DataFlows').getMetadata(this.dataFlow)
      promise
        .then(() => {
          this.dialogFieldProcessVisible = true
          this.$emit('update-first', false) //新建任务 第一次需要恢复默认
          this.initWSSed() //发送ws 监听schema进度
        })
        .finally(() => {
          this.loading = false
        })
    },
    getMetadataTransformer(page, value) {
      let id = this.dataFlow?.id
      let where = {
        dataFlowId: {
          like: id
        },
        sinkStageId: this.transform.stageId
      }
      if (value) {
        let filterObj = { like: value, options: 'i' }
        where['or'] = [{ sinkQulifiedName: filterObj }, { sourceObjectName: filterObj }]
      }
      let filter = {
        where: where,
        limit: page.size || 10,
        skip: (page.current - 1) * page.size > 0 ? (page.current - 1) * page.size : 0
      }
      return this.$api('metadataTransformer')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res?.data?.total,
            data: res?.data?.items
          }
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
    //是否目标有connectionID
    hasConnectionId(data) {
      let result = false
      for (let i = 0; i < data.stages.length; i++) {
        if (data.stages[i].id === this.transform.stageId && data.stages[i].connectionId !== '') {
          result = true
        }
      }
      return result
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
      let data = ''
      this.$api('DataFlows')
        .getMetadata(this.dataFlow)
        .then(res => {
          data = res
          this.initWSSed() //发送ws 监听schema进度
        })
      return data
    },
    //清空表改名 字段改名
    clearTransform() {
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i].id === this.transform.stageId) {
          this.dataFlow['stages'][i].fieldsNameTransform = 'noOperation'
          this.dataFlow['stages'][i].tableNameTransform = 'noOperation'
          this.dataFlow['stages'][i].table_suffix = ''
          this.dataFlow['stages'][i].table_prefix = ''
          this.dataFlow['stages'][i].batchOperationList = []
          this.dataFlow['batchOperation'] = []
        }
      }
    },
    updateAutoTransform(type, data) {
      for (let i = 0; i < this.dataFlow.stages.length; i++) {
        if (this.dataFlow.stages[i].id === this.transform.stageId) {
          this.dataFlow['stages'][i].fieldsNameTransform = data.fieldsNameTransform
          this.dataFlow['stages'][i].tableNameTransform = data.tableNameTransform
          this.dataFlow['stages'][i].table_prefix = data.table_prefix
          this.dataFlow['stages'][i].table_suffix = data.table_suffix
          this.dataFlow['stages'][i].batchOperationList = data.batchOperationList
        }
      }
    },
    checkTransform() {
      let result = this.$refs.fieldMappingDom.returnForm()
      return result.fieldsNameTransform
    },
    //获取左边导航数据 - 表
    async updateMetadata(type, data, batchOperation) {
      //将表改名 字段改名 rockBackAll
      this.updateAutoTransform(type, data)
      if (type !== 'dataType') {
        this.dataFlow['rollback'] = 'all'
      }
      if (batchOperation) {
        this.dataFlow['batchOperation'] = batchOperation
        delete this.dataFlow['rollback']
      }
      let promise = await this.$api('DataFlows').getMetadata(this.dataFlow)
      this.initWSSed() //发送ws 监听schema进度
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
      if (!this.$refs.fieldMappingDom) return //打开弹窗才能请求弹窗列表数据
      let source = row.sourceFields
      let target = await this.$api('MetadataInstances').originalData(row.sinkQulifiedName, '&isTarget=true')
      target = target.data && target.data.length > 0 ? target.data[0].fields : []
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      //映射关系
      let fieldsMapping = row.fieldsMapping
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
          if (item.field_name === field.sourceFieldName) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
        })
      })
      //fieldsMapping
      let addNodeArray = fieldsMapping.filter(item => item.type !== 'job_analyze')
      if (addNodeArray.length > 0) {
        addNodeArray.forEach(item => {
          target.forEach(field => {
            let node = {
              id: '',
              field_name: '',
              data_type: '',
              scale: '',
              precision: '',
              deleted: '', //目标决定这个字段是被删除？
              t_id: field.id,
              t_field_name: field.field_name,
              t_data_type: field.data_type,
              t_scale: field.scale,
              t_precision: field.precision,
              is_deleted: field.is_deleted, //目标决定这个字段是被删除？
              t_isPrecisionEdit: true, //默认能编辑
              t_isScaleEdit: true //默认能编辑
            }
            if (item.field_name === field.sourceFieldName) {
              fieldMappingTableData.push(node)
            }
          })
        })
      }
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
    //获取typeMapping
    async getTypeMapping(row) {
      if (!row) return
      return Promise.all([
        this.$api('TypeMapping').getId(row.sourceDbType),
        this.$api('TypeMapping').getId(row.sinkDbType)
      ]).then(([sourceData, targetData]) => {
        return {
          sourceData: sourceData?.data,
          targetData: targetData?.data
        }
      })
    },
    saveReturnData() {
      //保存字段映射
      let returnData = this.$refs.fieldMappingDom.returnData()
      if (!returnData.valid) return //检验不通过
      let deleteLen = returnData.target.filter(v => !v.is_deleted)
      if (deleteLen.length === 0) {
        this.$message.error(this.$t('dag_link_field_mapping_error_all_deleted'))
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
      if (this.transform.hiddenFieldProcess) return //任务同步 没有字段处理器
      this.field_process = this.$refs.fieldMappingDom.saveFileOperations()
      this.$emit('returnFieldMapping', this.field_process)
    },
    //实时获取schema加载进度
    initWSSed() {
      let id = this.dataFlow?.id
      let msg = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: id,
          stageId: this.transform.stageId
        }
      }
      ws.ready(() => {
        ws.send(msg)
      }, true)

      //总任务
      let msgData = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: this.dataFlow?.id
        }
      }
      ws.ready(() => {
        ws.send(msgData)
      }, true)
    }
  }
}
</script>

<style scoped lang="scss">
.database-filed-mapping-dialog {
  // height: 800px;
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
    color: map-get($fontColor, light);
  }
}
.e-button {
  padding: 4px 10px;
  color: map-get($fontColor, light);
  background-color: map-get($bgColor, main);
  margin-left: 10px;
}
</style>
