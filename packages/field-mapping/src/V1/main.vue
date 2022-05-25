<template>
  <div>
    <el-button
      v-if="transform.showBtn"
      type="primary"
      size="mini"
      :loading="loading"
      :disabled="isDisable"
      @click="getMetaData()"
      >{{ $t('dag_link_button_field_mapping') }}</el-button
    >
    <el-dialog
      v-if="dialogFieldProcessVisible"
      width="85%"
      :title="$t('dag_link_button_mapping_configuration')"
      :visible.sync="dialogFieldProcessVisible"
      append-to-body
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
        :fieldProcess="transform.fieldProcess"
        :transform="transform"
        :getDataFlow="getDataFlow"
        @row-click="saveOperations"
        @update-nav="updateFieldMappingNavData"
      ></FieldMappingDialog>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="this.transform.mode !== 'readOnly'" @click="saveReturnData">{{
          $t('dataVerify.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FieldMappingDialog from './FieldMappingDialog'
import { Task } from '@tap/api'

const taskApi = new Task()
export default {
  name: 'FieldMapping',
  components: { FieldMappingDialog },
  props: ['mappingType', 'transform', 'getDataFlow', 'isDisable'],
  data() {
    return {
      //表设置
      fieldMappingNavData: '', //左边导航
      fieldMappingTableData: '', //右边table
      dialogFieldProcessVisible: false,
      loading: false,
      fieldProcess: this.transform.fieldProcess
    }
  },
  mounted() {
    //点击按钮重新拿值
    if (this.getDataFlow) {
      this.dataFlow = this.getDataFlow()
      this.dataFlow.id = this.dataFlow.id || this.dataFlow?.taskId
    }
  },
  methods: {
    /*
     * 模型推演
     * 新建任务，首次全部恢复默认
     * 过滤条件：当前目标节点 nodeId
     * 触发父组件：首次条件
     * */
    getMetaData() {
      //点击按钮重新拿值
      if (this.getDataFlow) {
        this.dataFlow = this.getDataFlow()
        this.dataFlow.id = this.dataFlow.id || this.dataFlow?.taskId
      }

      if (!this.dataFlow) return
      if (this.transform.nodeId) {
        this.dataFlow['nodeId'] = this.transform.nodeId //任务同步目标节点nodeId 推演
      }
      //迁移任务需要同步字段处理器
      if (this.transform?.syncType === 'migrate') {
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
      let promise = taskApi.getMetadata(this.dataFlow)
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
        dataFlowId: id,
        sinkNodeId: this.transform.nodeId //todo 返回是否为sinkNodeId
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
      for (let i = 0; i < data['dag']['nodes'].length; i++) {
        if (data['dag']['edges']['target'] === data['dag']['nodes'][i].id) {
          data['dag']['nodes'][i].fieldProcess = this.fieldProcess
        }
      }
      return data
    },
    //是否目标有connectionID
    hasConnectionId(data) {
      let result = false
      for (let i = 0; i < data['dag']['nodes'].length; i++) {
        if (data['dag']['nodes'][i].id === this.transform.nodeId && data['dag']['nodes'][i].connectionId !== '') {
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
        this.fieldProcess = []
        //清空表改名 字段改名
        this.clearTransform()
      } else if (rollbackTable) {
        this.dataFlow['rollback'] = rollback
        this.dataFlow['rollbackTable'] = rollbackTable
        if (this.fieldProcess?.length > 0) {
          for (let i = 0; i < this.fieldProcess.length; i++) {
            // 删除操作
            let ops = this.fieldProcess[i]
            if (ops.table_id === id) {
              this.fieldProcess.splice(i, 1)
            }
          }
        }
        let result = this.$refs.fieldMappingDom.returnForm()
        this.updateAutoTransform('', result)
      }
      this.$emit('returnFieldMapping', this.fieldProcess)
      //迁移任务需要同步字段处理器
      if (this.mappingType && this.mappingType === 'cluster-clone') {
        this.dataFlow = this.updateAutoFieldProcess(this.dataFlow)
      }
      let data = ''
      taskApi
        .getMetadata(this.dataFlow)
        .then(res => {
          data = res
          this.initWSSed() //发送ws 监听schema进度
        })
        .catch(e => {
          this.$message.error(e)
        })
      return data
    },
    //清空表改名 字段改名
    clearTransform() {
      for (let i = 0; i < this.dataFlow['dag']['nodes'].length; i++) {
        if (this.dataFlow['dag']['nodes'][i].id === this.transform.nodeId) {
          this.dataFlow['dag']['nodes'][i].fieldsNameTransform = ''
          this.dataFlow['batchOperation'] = []
        }
      }
    },
    updateAutoTransform(type, data) {
      for (let i = 0; i < this.dataFlow['dag']['nodes'].length; i++) {
        if (this.dataFlow['dag']['nodes'][i].id === this.transform.nodeId) {
          this.dataFlow['dag']['nodes'][i].fieldsNameTransform = data.fieldsNameTransform
          this.dataFlow['dag']['nodes'][i].batchOperationList = data.batchOperationList
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
      let promise = await taskApi.getMetadata(this.dataFlow)
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
      if (!this.$refs.fieldMappingDom || !row) {
        return {
          data: [],
          target: []
        }
      } //打开弹窗才能请求弹窗列表数据
      let source = await this.$api('MetadataInstances').originalData(row.sourceQualifiedName)
      source = source.data && source.data.length > 0 ? source.data[0].fields : []
      let target = await this.$api('MetadataInstances').originalData(row.sinkQulifiedName, '&isTarget=true')
      target = target.data && target.data.length > 0 ? target.data[0].fields : []
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      //映射关系
      let fieldsMapping = row.fieldsMapping
      //源表 目标表数据组合
      let sourceMapping = {}
      source.forEach(item => {
        if (!sourceMapping[item.field_name]) {
          sourceMapping[item.field_name] = item
        } else if (sourceMapping[item.field_name].is_deleted) {
          sourceMapping[item.field_name] = item
        }
      })
      let targetMapping = {}
      target.forEach(item => {
        if (!targetMapping[item.field_name]) {
          targetMapping[item.field_name] = item
        } else if (targetMapping[item.field_name].is_deleted) {
          targetMapping[item.field_name] = item
        }
      })
      let fieldMappingTableData = []
      //fieldsMapping
      if (fieldsMapping.length > 0) {
        fieldsMapping.forEach(item => {
          let source = sourceMapping[item.sourceFieldName]
          let target = targetMapping[item.targetFieldName]
          let node = {}
          if (!source) {
            if (!target.is_delete) {
              node = {
                id: '',
                field_name: '',
                data_type: '',
                scale: '',
                precision: '',
                deleted: '', //目标决定这个字段是被删除？
                t_id: target.id,
                t_field_name: target.field_name,
                t_data_type: target.data_type,
                t_scale: target.scale,
                t_precision: target.precision,
                t_default_value: target?.default_value || '',
                is_deleted: target.is_deleted, //目标决定这个字段是被删除？
                t_isPrecisionEdit: true, //默认能编辑
                t_isScaleEdit: true //默认能编辑
              }
              fieldMappingTableData.push(Object.assign({}, source, node))
            }
          } else {
            node = {
              t_id: target.id,
              t_field_name: target.field_name,
              t_data_type: target.data_type,
              t_scale: target.scale,
              t_precision: target.precision,
              t_default_value: target?.default_value || '',
              is_deleted: target.is_deleted, //目标决定这个字段是被删除？
              t_isPrecisionEdit: true, //默认能编辑
              t_isScaleEdit: true //默认能编辑
            }
            fieldMappingTableData.push(Object.assign({}, source, node))
          }
        })
      }
      //源端不是mongodb 目标端是mongodb 则_id 不显示
      if (row.sinkDbType === 'mongodb' && row.sourceDbType !== 'mongodb') {
        fieldMappingTableData = fieldMappingTableData.filter(v => v.t_field_name !== '_id')
      }
      return {
        data: fieldMappingTableData,
        target: target
      }
    },
    // async intiFieldMappingTableData(row) {
    //   if (!this.$refs.fieldMappingDom) return //打开弹窗才能请求弹窗列表数据
    //   let source = await this.$api('MetadataInstances').originalData(row.sourceQualifiedName)
    //   source = source.data && source.data.length > 0 ? source.data[0].fields : []
    //   let target = await this.$api('MetadataInstances').originalData(row.sinkQulifiedName, '&isTarget=true')
    //   target = target.data && target.data.length > 0 ? target.data[0].fields : []
    //   // 初始化所有字段都映射 只取顶级字段
    //   source = source.filter(field => field.field_name.indexOf('.') === -1)
    //   //是否有字段处理器
    //   let operations = this.getFieldOperations(row)
    //   if (operations?.length > 0) {
    //     source.forEach(item => {
    //       let original_field_name = item.original_field_name || item.field_name
    //       let ops = operations.filter(op => op.original_field_name === original_field_name && op.op === 'RENAME')
    //       if (!ops || ops?.length === 0) {
    //         item.temporary_field_name = item.field_name
    //         return
    //       }
    //       ops = ops[0]
    //       item.temporary_field_name = ops.operand
    //     })
    //   } else {
    //     source.forEach(item => {
    //       item.temporary_field_name = item.field_name
    //     })
    //   }
    //   //是否有批量字段改名操作
    //   let fieldsNameTransform = this.checkTransform()
    //   if (fieldsNameTransform !== '') {
    //     source.forEach(item => {
    //       if (fieldsNameTransform === 'toUpperCase') {
    //         item.temporary_field_name = item.temporary_field_name.toUpperCase() || item.field_name.toUpperCase()
    //       } else if (fieldsNameTransform === 'toLowerCase') {
    //         item.temporary_field_name = item.temporary_field_name.toLowerCase() || item.field_name.toLowerCase()
    //       }
    //     })
    //   }
    //   //源表 目标表数据组合
    //   let fieldMappingTableData = []
    //   source.forEach(item => {
    //     target.forEach(field => {
    //       let node = {
    //         t_id: field.id,
    //         t_field_name: field.field_name,
    //         t_data_type: field.data_type,
    //         t_scale: field.scale,
    //         t_precision: field.precision,
    //         is_deleted: field.is_deleted, //目标决定这个字段是被删除？
    //         t_default_value: field?.default_value || '',
    //         t_isPrecisionEdit: true, //默认能编辑
    //         t_isScaleEdit: true //默认能编辑
    //       }
    //       //检查当前name个数
    //       if (item.temporary_field_name === field.field_name) {
    //         fieldMappingTableData.push(Object.assign({}, item, node))
    //       }
    //     })
    //   })
    //   return {
    //     data: fieldMappingTableData,
    //     target: target
    //   }
    // },
    checkFieldName(field_name, target) {
      return target.filter(field => field_name === field.original_field_name)
    },
    //获取字段处理器
    getFieldOperations(row) {
      let operations = []
      if (!this.fieldProcess || this.fieldProcess.length === 0) return
      let fieldProcess = this.fieldProcess.filter(process => process.table_id === row.sourceTableId)
      if (fieldProcess.length > 0) {
        operations = fieldProcess[0].operations ? JSON.parse(JSON.stringify(fieldProcess[0].operations)) : []
      }
      return operations || []
    },
    //获取typeMapping
    async getTypeMapping(row) {
      if (!row) {
        return {
          sourceData: [],
          targetData: []
        }
      }
      return Promise.all([
        this.$api('TypeMapping').pdkDataType(row.sourceDbType),
        this.$api('TypeMapping').pdkDataType(row.sinkDbType)
      ]).then(res => {
        let sourceData = [],
          targetData = []
        let sourceObj = JSON.parse(res?.[0]?.data || '{}')
        let targetObj = JSON.parse(res?.[1]?.data || '{}')
        for (let key in sourceObj) {
          sourceData.push({
            dbType: key,
            rules: sourceObj[key]
          })
        }
        for (let key in targetObj) {
          targetData.push({
            dbType: key,
            rules: targetObj[key]
          })
        }
        return {
          sourceData: sourceData,
          targetData: targetData
        }
      })
    },
    async saveReturnData() {
      //保存字段映射
      let returnData = this.$refs.fieldMappingDom.returnData()
      if (!returnData.valid) return //检验不通过
      let deleteLen = returnData.target.filter(v => !v.is_deleted)
      if (deleteLen.length === 0) {
        this.$message.error(this.$t('dag_link_field_mapping_error_all_deleted'))
        return //所有字段被删除了 不可以保存任务
      }
      await this.saveOperations(returnData.row, returnData.operations, returnData.target, () => {
        taskApi.getMetadata(this.dataFlow)
      })
      this.$emit('returnPreFixSuffix', returnData.changNameData)
      this.dialogFieldProcessVisible = false
    },
    //保存字段处理器
    saveOperations(row, operations, target, callback) {
      if (!target || target?.length === 0) return
      let where = {
        qualified_name: row.sinkQulifiedName
      }
      let data = {
        fields: target
      }
      this.$api('MetadataInstances')
        .update(where, data)
        .then(() => {
          callback?.()
        })
      if (this.transform.hiddenFieldProcess) return //任务同步 没有字段处理器
      this.fieldProcess = this.$refs.fieldMappingDom.saveFileOperations()
      this.$emit('returnFieldMapping', this.fieldProcess)
    },
    //实时获取schema加载进度
    initWSSed() {
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let msg = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: id,
          stageId: this.transform.nodeId
        }
      }
      this.$ws.ready(() => {
        this.$ws.send(msg)
      }, true)

      //总任务
      let msgData = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: id
        }
      }
      this.$ws.ready(() => {
        this.$ws.send(msgData)
      }, true)
    }
  }
}
</script>

<style lang="scss">
.database-filed-mapping-dialog {
  height: 600px;
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
</style>
