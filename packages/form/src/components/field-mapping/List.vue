<template>
  <section>
    <div class="node-field-mapping flex flex-column">
      <div class="task-form-body">
        <div class="task-form-left flex flex-column">
          <div class="flex mb-2 ml-2 mr-2">
            <div class="flex">
              <ElInput
                v-model="searchTable"
                size="mini"
                placeholder="请输入表名"
                suffix-icon="el-icon-search"
                clearable
                @input="getMetadataTransformer(searchTable)"
              ></ElInput>
            </div>
          </div>
          <div class="bg-main flex justify-content-between mb-2 ml-2">
            <span class="table-name ml-1">表名</span>
            <span class="mr-4" v-if="progress.showProgress"
              ><i class="el-icon-loading link-primary mx-2"></i>
              <span class="link-primary"> {{ progress.finished }} / {{ progress.total }} </span></span
            >
          </div>
          <div class="task-form-left__ul flex flex-column" v-loading="loadingNav">
            <ul v-if="navData.length > 0">
              <li
                v-for="(item, index) in navData"
                :key="index"
                :class="{ active: position === index }"
                @click="select(item, index)"
              >
                <div class="task-form__img" v-if="item.invalid">
                  <img :src="fieldMapping_table_error" alt="" />
                </div>
                <div class="task-form__img" v-else>
                  <img :src="fieldMapping_table" alt="" />
                </div>
                <div class="task-form-text-box">
                  <OverflowTooltip
                    class="w-100 text-truncate source"
                    :text="item.sourceObjectName"
                    placement="right"
                    :open-delay="400"
                  />
                  <OverflowTooltip
                    class="w-100 text-truncate target"
                    :text="item.sinkObjectName"
                    placement="right"
                    :open-delay="400"
                  />
                  <div class="select">
                    {{
                      `${t('dag_dialog_field_mapping_selected')} ${
                        position === index ? fieldCount : item.sourceFieldCount - item.userDeletedNum
                      }/${item.sourceFieldCount}`
                    }}
                  </div>
                </div>
              </li>
            </ul>
            <div class="task-form-left__ul flex flex-column align-items-center" v-else>
              <div class="table__empty_img" style="margin-top: 22%"><img style="" :src="noData" /></div>
              <div class="noData">{{ t('dag_dialog_field_mapping_no_data') }}</div>
            </div>
          </div>
          <ElPagination
            small
            class="flex mt-3 din-font"
            layout="total, prev, slot, next"
            :current-page.sync="page.current"
            :page-size.sync="page.size"
            :total="page.total"
            :pager-count="5"
            @current-change="getMetadataTransformer"
          >
            <div class="text-center">
              <span class="page__current" style="min-width: 22px">{{ page.current }}</span>
              <span class="icon-color" style="min-width: 22px">/</span>
              <span class="icon-color" style="min-width: 22px">{{ page.count }}</span>
            </div>
          </ElPagination>
        </div>
        <div class="main">
          <div class="flex ml-2 text-start" style="margin-bottom: 8px">
            <div class="flex">
              <ElInput
                v-model="searchField"
                size="mini"
                placeholder="请输入字段名"
                suffix-icon="el-icon-search"
                @input="search()"
              ></ElInput>
            </div>
            <div class="item ml-2">
              <ElButton plain class="btn-refresh" @click="rest">
                <VIcon>refresh</VIcon>
              </ElButton>
              <ElButton v-if="!readOnly" type="text" class="btn-rest" @click="updateMetaData">
                {{ t('button_reset') }}
              </ElButton>
            </div>
          </div>
          <ElTable
            class="field-mapping-table table-border"
            height="100%"
            :data="viewTableData"
            v-loading="loadingTable"
          >
            <ElTableColumn show-overflow-tooltip :label="t('dag_dialog_field_mapping_field')" prop="field_name">
              <template #default="{ row }">
                <span v-if="row.primary_key_position > 0" :show-overflow-tooltip="true"
                  >{{ row.field_name }}
                  <VIcon size="12" class="color-darkorange">key</VIcon>
                </span>
                <span v-else class="item" :show-overflow-tooltip="true">{{ row.field_name }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('dag_dialog_field_mapping_type')" prop="data_type">
              <template #default="{ row }">
                <div class="cursor-pointer" v-if="!row.is_deleted && !readOnly" @click="edit(row, 'data_type')">
                  <span :show-overflow-tooltip="true">{{ row.data_type }}</span>
                  <i v-if="!row.data_type" class="icon-error el-icon-warning"></i>
                  <i class="field-mapping__icon el-icon-arrow-down"></i>
                </div>
                <div v-else>
                  <span :show-overflow-tooltip="true">{{ row.data_type }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('meta_table_default')">
              <template #default="{ row }">
                <div class="cursor-pointer" v-if="!readOnly" @click="edit(row, 'default_value')">
                  <ElTooltip class="item" effect="dark" :content="row.default_value" placement="left">
                    <span class="field-mapping-table__default_value">{{ row.default_value }}</span>
                  </ElTooltip>
                  <i class="field-mapping__icon el-icon-edit-outline"></i>
                </div>
                <div v-else>{{ row.default_value }}</div>
              </template>
            </ElTableColumn>
            <div class="field-mapping-table__empty" slot="empty">
              <div class="table__empty_img" style="margin-left: 30%"><img style="" :src="noData" /></div>
              <div class="noData">{{ t('dag_dialog_field_mapping_no_data') }}</div>
            </div>
          </ElTable>
        </div>
      </div>
    </div>
    <ElDialog
      :title="titleType[currentOperationType]"
      :visible.sync="dialogVisible"
      width="30%"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <ElInput
        v-model="editValueType[currentOperationType]"
        v-if="['field_name'].includes(currentOperationType)"
      ></ElInput>
      <div v-if="['precision', 'scale'].includes(currentOperationType)">
        <ElInputNumber v-model="editValueType[currentOperationType]"></ElInputNumber>
        <div class="field-mapping-data-type" v-if="currentTypeRules.length > 0">
          <div v-for="(item, index) in currentTypeRules" :key="item.dbType">
            <div
              v-if="
                item.maxPrecision && currentOperationType === 'precision' && item.minPrecision !== item.maxPrecision
              "
            >
              <div v-if="index === 0">{{ t('dag_dialog_field_mapping_range_precision') }}</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div
              v-if="item.maxScale && currentOperationType === 'scale' && item.minScale !== item.maxScale"
              style="margin-top: 10px"
            >
              <div>{{ t('dag_dialog_field_mapping_range_scale') }}</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="['data_type'].includes(currentOperationType)">
        <ElAutocomplete
          v-model="editValueType[currentOperationType]"
          class="inline-input"
          style="width: 350px"
          :fetch-suggestions="querySearchPdkType"
        ></ElAutocomplete>
        <div class="mt-3 fs-8">{{ getPdkEditValueType() }}</div>
        <div class="field-mapping-data-type" v-if="currentTypeRules.length > 0">
          <div v-for="(item, index) in currentTypeRules" :key="item.dbType">
            <div v-if="item.maxPrecision && item.minPrecision !== item.maxPrecision">
              <div v-if="index === 0">{{ t('dag_dialog_field_mapping_range_precision') }}</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div v-if="item.maxScale && item.minScale !== item.maxScale" style="margin-top: 10px">
              <div>{{ t('dag_dialog_field_mapping_range_scale') }}</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ElInput
        type="textarea"
        v-model="editValueType[currentOperationType]"
        v-if="['default_value'].includes(currentOperationType)"
      ></ElInput>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="handleClose()">{{ t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="editSave()">{{ t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import rollback from 'web-core/assets/icons/svg/rollback.svg'
import refresh from 'web-core/assets/icons/svg/refresh.svg'
import fieldMapping_table from 'web-core/assets/images/fieldMapping_table.png'
import fieldMapping_table_error from 'web-core/assets/images/fieldMapping_table_error.png'
import noData from 'web-core/assets/images/noData.png'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { metadataInstancesApi, metadataTransformerApi, taskApi, typeMappingApi } from '@tap/api'
import Locale from '../../mixins/locale'

export default {
  name: 'List',
  components: { VIcon, OverflowTooltip },
  mixins: [Locale],
  props: ['isMetaData', 'readOnly'],
  data() {
    return {
      searchTable: '',
      searchField: '',
      dataFlow: '',
      navData: [],
      target: [],
      viewTableData: [],
      loadingTable: true,
      loadingNav: true,
      progress: {
        total: 0,
        finished: '0',
        progress: '0',
        showProgress: false
      },
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1
      },
      position: 0,
      selectRow: '',
      currentOperationType: '',
      currentOperationData: '',
      editValueType: {
        field_name: '',
        data_type: '',
        precision: '',
        scale: '',
        default_value: ''
      },
      titleType: {
        field_name: this.t('dag_dialog_field_mapping_tittle_field_name'),
        data_type: this.t('dag_dialog_field_mapping_tittle_data_type'),
        precision: this.t('dag_dialog_field_mapping_tittle_precision'),
        scale: this.t('dag_dialog_field_mapping_tittle_scale'),
        default_value: this.t('dag_dialog_field_mapping_tittle_value')
      },
      typeMapping: [],
      dialogVisible: false,
      rollback,
      fieldMapping_table_error,
      fieldMapping_table,
      refresh,
      noData
    }
  },
  mounted() {
    this.dataFlow = this.getDataFlow()
    this.dataFlow['id'] = this.dataFlow.taskId
    this.dataFlow['nodeId'] = this.dataFlow.activeNodeId
    if (this.isMetaData) {
      this.getMetaData() //触发推演接口则需要等待ws 第一次回消息刷新页面 以免拿到没有上次没有推演完的结果
    }
    this.getMetadataTransformer() //不需要推演 直接拿推演结果
    //接收数据
    let id = this.dataFlow.nodeId
    let self = this
    this.$ws.on('metadataTransformerProgress', function (res) {
      if (res?.data?.stageId === id) {
        let { finished, total, status } = res?.data
        self.progress.finished = finished
        self.progress.total = total
        self.page.total = total
        self.page.count = Math.ceil(finished / 10) === 0 ? 1 : Math.ceil(finished / 10)
        if (self.navData?.length < self.page.size && self.page.current === 1 && total > self.page.size) {
          //第一页 navData.length < page.size && total > page.size
          self.getMetadataTransformer()
        }
        if (status !== 'done') {
          self.progress.showProgress = true
        } else {
          self.progress.showProgress = false
        }
      }
    })
  },
  methods: {
    getDataflowDataToSave() {
      const dag = this.$store.getters['dataflow/dag']
      const editVersion = this.$store.state.dataflow.editVersion
      let dataflow = this.$store.state.dataflow
      return {
        dag,
        editVersion,
        ...dataflow
      }
    },
    getDataFlow() {
      const data = this.getDataflowDataToSave()
      return data
    },
    /*
     * 模型推演
     * 新建任务，首次全部恢复默认
     * 过滤条件：当前目标节点 nodeId
     * 触发父组件：首次条件
     * */
    getMetaData() {
      //任务同步目标节点nodeId 推演
      let promise = taskApi.getMetadata(this.dataFlow)
      promise
        .then(() => {
          this.initWSSed() //发送ws 监听schema进度
        })
        .finally(() => {
          this.loadingNav = false
          this.loadingTable = false
        })
    },
    async select(item, index) {
      if (!this.readOnly) {
        //先保存
        await this.save()
      }
      this.position = '' //再次点击清空去一个样式
      this.searchField = ''
      this.fieldCount = 0
      this.selectRow = item
      this.fieldCount = item.sourceFieldCount - item.userDeletedNum || 0
      this.position = index
      this.intiFieldMappingTableData(this.selectRow)
    },
    async intiFieldMappingTableData(row) {
      if (!row.sinkQulifiedName) return
      this.loadingTable = true
      let data = await metadataInstancesApi.originalData(row.sinkQulifiedName)
      this.target = data && data.length > 0 ? data[0].fields : []
      //添加edit
      for (let i = 0; i < this.target.length; i++) {
        if (!this.target[i]['default_value']) {
          this.target[i]['default_value'] = ''
        }
      }
      this.viewTableData = this.target
      if (!this.readOnly) {
        this.getTypeMapping(this.selectRow)
      }

      this.loadingTable = false
    },
    getMetadataTransformer(value) {
      let { size, current } = this.page
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let where = {
        dataFlowId: id,
        sinkNodeId: this.dataFlow['nodeId'] //todo 返回是否为sinkNodeId
      }
      if (value && current !== value) {
        let filterObj = { like: value, options: 'i' }
        where['or'] = [{ sinkQulifiedName: filterObj }, { sourceObjectName: filterObj }]
      }
      let filter = {
        where: where,
        limit: size || 10,
        skip: (current - 1) * size > 0 ? (current - 1) * size : 0
      }
      this.loadingNav = true
      this.loadingTable = true
      metadataTransformerApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let { total, items } = res
          this.page.total = total
          this.page.count = Math.ceil(total / 10) === 0 ? 1 : Math.ceil(total / 10)
          this.navData = items
          //请求左侧table数据
          this.selectRow = this.navData?.[0] || {}
          this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
          this.initWSSed()
          this.intiFieldMappingTableData(this.selectRow)
        })
        .finally(() => {
          this.loadingNav = false
          this.loadingTable = false
        })
    },
    search() {
      this.$nextTick(() => {
        const { delayTrigger } = this.$util
        delayTrigger(() => {
          if (this.searchField.trim()) {
            this.searchField = this.searchField.trim().toString() //去空格
            this.viewTableData = this.target.filter(v => {
              let str = (v.field_name + '' + v.field_name).toLowerCase()
              return str.indexOf(this.searchField.toLowerCase()) > -1
            })
          } else {
            this.viewTableData = this.target
          }
        }, 100)
      })
    },
    rest() {
      this.searchField = ''
      this.searchTable = ''
      this.position = 0
      this.getMetadataTransformer()
    },
    //获取typeMapping
    getTypeMapping(row) {
      typeMappingApi.pdkDataType(row.sinkDbType).then(res => {
        let targetObj = JSON.parse(res?.data || '{}')
        for (let key in targetObj) {
          this.typeMapping.push({
            dbType: key,
            rules: targetObj[key]
          })
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.currentOperationType = ''
      this.currentOperationData = ''
      this.editValueType = {
        field_name: '',
        data_type: '',
        precision: '',
        scale: '',
        default_value: ''
      }
    },
    //table字段操作区域
    /*字段操作统一弹窗
     * 操作:修改字段名、修改字段长度、修改字段精度、修改字段类型*/
    edit(row, type) {
      this.dialogVisible = true
      this.editValueType[type] = row[type]

      this.currentOperationType = type
      this.currentOperationData = row
      //初始化
      this.initDataType(row[`data_type`])
    },
    editSave() {
      //元数据-字段操作
      let id = this.currentOperationData.id
      let key = this.currentOperationType
      let value = this.editValueType[this.currentOperationType]
      let verify = true
      if (key === 'data_type') {
        let option = this.target.filter(v => v.id === id)
        if (option.length === 0) return
        option = option[0]
        if (value === option.data_type) {
          this.handleClose() //类型无改变
          return
        }
        //如果是改类型 需要手动修改字段的长度以及精度
        this.updateTargetView(id, 'tapType', '')
      } else if (key === 'precision') {
        let isPrecision = this.currentTypeRules.filter(v => v.minPrecision < v.maxPrecision)
        if (isPrecision.length === 0) {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision === r.maxPrecision && value !== r.maxPrecision) {
              this.$message.error(this.t('dag_dialog_field_mapping_error_range'))
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision < r.maxPrecision) {
              if (r.minPrecision > value || value > r.maxPrecision) {
                verify = false
                this.$message.error(this.t('dag_dialog_field_mapping_error_range'))
              }
            }
          })
        }
        if (!verify) {
          return
        }
      } else if (key === 'scale') {
        let isScale = this.currentTypeRules.filter(v => v.minScale < v.maxScale)
        if (isScale.length === 0) {
          this.currentTypeRules.forEach(r => {
            if (r.minScale === r.maxScale && value !== r.maxScale) {
              this.$message.error(this.t('dag_dialog_field_mapping_error_range'))
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minScale < r.maxScale) {
              if (r.minScale > value || value > r.maxScale) {
                verify = false
                this.$message.error(this.t('dag_dialog_field_mapping_error_range'))
              }
            }
          })
        }
      }
      if (!verify) {
        return
      }
      //触发target更新
      this.updateTarget(id, key, value)
      this.checkTable() //消除感叹号
      this.handleClose()
    },

    /*更新target 数据*/
    updateTarget(id, key, value) {
      this.target.forEach(field => {
        if (field.id === id && field.is_deleted !== 'true' && field.is_deleted !== true) {
          field[key] = value
          field['source'] = 'manual'
          field['is_auto_allowed'] = false
        }
      })
    },
    //保存校验
    checkTable() {
      //左边所有invalid 为false 右边所有目标字段有类型
      let checkDataType = false
      this.target.forEach(field => {
        if (!field.data_type && !field.is_deleted) {
          checkDataType = true
        }
      })
      //当前表 所有字段类型通过 将当前表的invalid 设置为false 校验通过
      this.navData.forEach(table => {
        if (table.sinkObjectName === this.selectRow.sinkObjectName) {
          //当前表
          if (!checkDataType) {
            table.invalid = false
          } else table.invalid = true
        }
      })

      let checkInvalid = false
      let count = 0
      this.navData.forEach(table => {
        if (table.invalid) {
          checkInvalid = true
          count += 1
        }
      })
      return {
        checkInvalid: checkInvalid,
        checkDataType: checkDataType,
        count: count
      }
    },
    //只是视图更新 field['source'] = 'manual' 不动
    updateTargetView(id, key, value) {
      this.target.forEach(field => {
        if (field.id === id && field.is_deleted !== 'true' && field.is_deleted !== true) {
          field[key] = value
        }
      })
    },
    showScaleEdit(id, data) {
      let isScale = data.filter(v => v.minScale < v.maxScale)
      if (isScale.length !== 0) {
        //固定值
        this.updateTargetView(id, 'isScaleEdit', true)
      } else {
        this.updateTargetView(id, 'isScaleEdit', false)
      }
    },
    showPrecisionEdit(id, data) {
      let isPrecision = data.filter(v => v.minPrecision < v.maxPrecision)
      if (isPrecision.length !== 0) {
        //固定值
        this.updateTargetView(id, 'isPrecisionEdit', true)
      } else {
        this.updateTargetView(id, 'isPrecisionEdit', false)
      }
    },
    initDataType(val) {
      let target = this.typeMapping.filter(type => type.dbType === val)
      if (target?.length > 0) {
        this.currentTypeRules = target[0]?.rules || []
      } else this.currentTypeRules = '' //清除上一个字段范围
    },
    querySearchPdkType(queryString, cb) {
      let result = this.typeMapping.map(t => {
        return {
          value: t.dbType
        }
      })
      cb(result)
    },
    getPdkEditValueType() {
      let findOne = this.typeMapping.find(t => t.dbType === this.editValueType[this.currentOperationType])
      return findOne?.rules || ''
    },
    //重置
    updateMetaData() {
      if (!this.dataFlow) return
      this.dataFlow['rollback'] = 'all'
      this.loadingNav = true
      this.loadingTable = true
      taskApi.getMetadata(this.dataFlow).then(() => {
        this.getMetadataTransformer() //更新整个数据
      })
    },
    save(val) {
      if (!this.target || !this.selectRow.sinkQulifiedName) return
      let where = {
        qualified_name: this.selectRow.sinkQulifiedName
      }
      let data = {
        fields: this.target
      }
      metadataInstancesApi.update(where, data)
      if (val) {
        this.closeDialog()
      }
    },
    closeDialog() {
      this.searchField = ''
      this.searchTable = ''
    },
    //实时获取schema加载进度
    initWSSed() {
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let msg = {
        type: 'metadataTransformerProgress',
        data: {
          dataFlowId: id,
          stageId: this.dataFlow['nodeId']
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
.node-field-mapping {
  .el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
  }
  .field-mapping-data-type {
    margin-top: 10px;
    font-size: 12px;
    color: #999;
  }
  .el-pagination button:hover {
    color: map-get($color, primary);
  }
}
</style>
<style scoped lang="scss">
.node-field-mapping {
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon-error {
    color: red;
  }
  .icon-color {
    color: map-get($iconFillColor, normal);
  }
  .table__empty_img {
    width: 80px;
    height: 80px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .noData {
    font-size: 12px;
    color: map-get($bgColor, special);
  }
  .page__current {
    width: 22px;
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: map-get($color, primary);
    line-height: 22px;
    background-color: map-get($bgColor, pageCount);
  }
  .task-form__text {
    display: inline-block;
    width: 130px;
    text-align: left;
  }
  .btn-rest {
    height: 28px;
    width: 28px;
  }
  .btn-refresh {
    padding: 0;
    height: 28px;
    width: 28px;
    min-width: 28px;
    font-size: 16px;
    &:hover,
    &.is-plain:focus:hover {
      border-color: map-get($color, primary);
      background-color: map-get($color, white);
    }
  }
  .task-form-body {
    display: flex;
    height: 60vh;
    border: 1px solid map-get($borderColor, light);
    border-radius: 4px;
    .task-form-left {
      padding-top: 8px;
      border-right: 1px solid map-get($borderColor, light);
      .table-name {
        height: 40px;
        line-height: 42px;
        font-size: 12px;
        color: map-get($fontColor, normal);
        font-weight: 500;
      }
    }
    .task-form-left__ul {
      flex: 1;
      max-width: 210px;
      overflow-x: hidden;
      overflow-y: auto;
      li {
        background: map-get($bgColor, white);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-bottom: 1px solid map-get($borderColor, light);
        display: flex;
        padding: 16px 0 10px 10px;
        &:hover {
          background: map-get($bgColor, disactive);
          cursor: pointer;
          border-left: 2px solid map-get($color, primary);
        }
        &.active {
          background: map-get($bgColor, disactive);
          border-left: 2px solid map-get($color, primary);
          cursor: pointer;
        }
        .task-form__img {
          width: 20px;
          height: 42px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .task-form-text-box {
          margin-left: 10px;
          width: 140px;
          .source {
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            line-height: 10px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .target {
            font-size: 12px;
            font-weight: 400;
            color: #ef9868;
            line-height: 20px;
            margin-top: 17px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .select {
            font-size: 12px;
            font-weight: 400;
            color: #86909c;
            line-height: 5px;
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
    .main {
      display: flex;
      flex: 1;
      overflow: hidden;
      flex-direction: column;
      padding-top: 8px;
    }
    .color-darkorange {
      color: darkorange;
    }
    .field-mapping__icon {
      color: map-get($color, primary);
    }
    .field-mapping-table__default_value {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 15px;
    }
  }
  .field-mapping-table {
    ::v-deep {
      .el-table {
        border: none;
      }
      .el-table__empty-block {
        height: 100% !important;
      }
      .el-table__header {
        .el-table__cell {
          border-right: 0;
          &.is-leaf {
            border-bottom: 0;
          }
          &:hover {
            border-right: 1px solid map-get($borderColor, light);
          }
        }
        th {
          color: map-get($fontColor, normal);
          font-weight: 500;
          white-space: nowrap;
          background-color: map-get($bgColor, normal);
        }
      }
      .el-table__body {
        td {
          color: map-get($fontColor, light);
        }
      }
      &:after {
        width: 0;
      }
    }
  }
}
</style>
