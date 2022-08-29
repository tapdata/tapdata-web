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
                @input="getMetadataTransformer(searchTable, 'search')"
              ></ElInput>
            </div>
          </div>
          <div class="flex bg-main justify-content-between mb-2 pl-2">
            <span class="table-name ml-1">表名</span>
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
                <div class="task-form-text-box">
                  <OverflowTooltip
                    class="w-100 text-truncate target"
                    :text="item.sinkObjectName"
                    placement="right"
                    :open-delay="400"
                  />
                </div>
              </li>
            </ul>
            <div class="task-form-left__ul flex flex-column align-items-center" v-else>
              <div class="table__empty_img" style="margin-top: 22%"><img style="" :src="noData" /></div>
              <div class="noData">{{ $t('dag_dialog_field_mapping_no_data') }}</div>
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
                size="mini"
                placeholder="请输入字段名"
                suffix-icon="el-icon-search"
                v-model="searchField"
                clearable
                @input="search()"
              ></ElInput>
            </div>
            <div class="item ml-2">
              <ElButton plain class="btn-refresh" @click="rest">
                <VIcon>refresh</VIcon>
              </ElButton>
              <ElButton v-if="!readOnly" type="text" class="btn-rest" @click="updateMetaData">
                {{ $t('button_reset') }}
              </ElButton>
            </div>
          </div>
          <ElTable
            class="field-mapping-table table-border"
            height="100%"
            :data="viewTableData"
            v-loading="loadingTable"
          >
            <ElTableColumn type="index" width="55" label="序号"></ElTableColumn>
            <ElTableColumn show-overflow-tooltip :label="$t('dag_dialog_field_mapping_field')" prop="field_name">
              <template #default="{ row }">
                <span v-if="row.primary_key_position > 0" :show-overflow-tooltip="true"
                  >{{ row.targetFieldName }}
                  <VIcon size="12" class="color-darkorange">key</VIcon>
                </span>
                <span v-else class="item" :show-overflow-tooltip="true">{{ row.targetFieldName }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('dag_dialog_field_mapping_type')" prop="sourceFieldType">
              <template #default="{ row }">
                <div>
                  <span :show-overflow-tooltip="true">{{ row.sourceFieldType }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('meta_table_default')">
              <template #default="{ row }">
                <div class="cursor-pointer" v-if="!readOnly" @click="edit(row, 'defaultValue')">
                  <ElTooltip class="item" effect="dark" :content="row.defaultValue" placement="left">
                    <span class="field-mapping-table__default_value">{{ row.defaultValue }}</span>
                  </ElTooltip>
                  <i class="field-mapping__icon el-icon-edit-outline"></i>
                </div>
                <div v-else>{{ row.defaultValue }}</div>
              </template>
            </ElTableColumn>
            <div class="field-mapping-table__empty" slot="empty">
              <div class="table__empty_img" style="margin-left: 30%"><img style="" :src="noData" /></div>
              <div class="noData">{{ $t('dag_dialog_field_mapping_no_data') }}</div>
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
      <div v-if="['sourceFieldType'].includes(currentOperationType)">
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
              <div v-if="index === 0">{{ $t('dag_dialog_field_mapping_range_precision') }}</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div v-if="item.maxScale && item.minScale !== item.maxScale" style="margin-top: 10px">
              <div>{{ $t('dag_dialog_field_mapping_range_scale') }}</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ElInput
        type="textarea"
        v-if="['defaultValue'].includes(currentOperationType)"
        v-model="editValueType[currentOperationType]"
      ></ElInput>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="handleClose()">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="editSave()">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>

<script>
import { VIcon } from '@tap/component'
import rollback from 'web-core/assets/icons/svg/rollback.svg'
import refresh from 'web-core/assets/icons/svg/refresh.svg'
import fieldMapping_table from 'web-core/assets/images/fieldMapping_table.png'
import fieldMapping_table_error from 'web-core/assets/images/fieldMapping_table_error.png'
import noData from 'web-core/assets/images/noData.png'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { metadataInstancesApi, taskApi, typeMappingApi } from '@tap/api'

export default {
  name: 'List',
  components: { VIcon, OverflowTooltip },
  props: ['isMetaData', 'readOnly', 'updateList'],
  data() {
    return {
      searchTable: '',
      searchField: '',
      dataFlow: '',
      navData: [],
      target: [],
      editFields: [],
      viewTableData: [],
      loadingTable: true,
      loadingNav: true,
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1
      },
      currentOperationType: '',
      editValueType: {
        sourceFieldType: '',
        defaultValue: ''
      },
      titleType: {
        sourceFieldType: this.$t('dag_dialog_field_mapping_tittle_data_type'),
        defaultValue: this.$t('dag_dialog_field_mapping_tittle_value')
      },
      position: 0,
      selectRow: '',
      currentOperationData: '',
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
    this.getMetadataTransformer() //不需要推演 直接拿推演结果
  },
  watch: {
    updateList() {
      this.getMetadataTransformer()
    }
  },
  methods: {
    getDataFlow() {
      const dag = this.$store.getters['dataflow/dag']
      const editVersion = this.$store.state.dataflow.editVersion
      let dataflow = this.$store.state.dataflow
      return {
        dag,
        editVersion,
        ...dataflow
      }
    },
    async select(item, index) {
      if (!this.readOnly && this.editFields?.length > 0) {
        //先保存
        await this.save()
      }
      this.position = '' //再次点击清空去一个样式
      this.searchField = ''
      this.fieldCount = 0
      this.editFields = []
      this.selectRow = item
      this.target = this.selectRow?.fieldsMapping
      this.viewTableData = this.target
      this.fieldCount = item.sourceFieldCount - item.userDeletedNum || 0
      this.position = index
    },
    getMetadataTransformer(value, type) {
      if (type === 'search') {
        this.page.current = 1
      }
      let { size, current } = this.page
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let where = {
        taskId: id,
        nodeId: this.dataFlow['nodeId'],
        //todo 返回是否为sinkNodeId
        page: current,
        pageSize: size
      }
      if (value && current !== value) {
        where.searchTable = value
      } else {
        where.searchTable = this.searchTable
      }
      this.loadingNav = true
      this.loadingTable = true
      taskApi
        .getNodeTableInfo(where)
        .then(res => {
          let { total, items } = res
          this.page.total = total
          this.page.count = Math.ceil(total / 10) === 0 ? 1 : Math.ceil(total / 10)
          this.navData = items || []
          //请求左侧table数据
          this.selectRow = this.navData?.[this.position] || {}
          this.target = this.selectRow?.fieldsMapping
          this.viewTableData = this.target
          this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
          if (!this.readOnly) {
            this.getTypeMapping(this.selectRow)
          }
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
              let str = (v.sourceFieldName + '' + v.targetFieldName).toLowerCase()
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
    handleClose() {
      this.dialogVisible = false
      this.currentOperationData = ''
      this.editDataValue = ''
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
      this.initDataType(row[`sourceFieldType`])
    },
    editSave() {
      //触发target更新
      let id = this.currentOperationData.sourceFieldName
      let key = this.currentOperationType === 'sourceFieldType' ? 'sourceFieldType' : 'defaultValue'
      let value = this.editValueType[this.currentOperationType]
      this.updateTargetView(id, key, value)
      this.updateTarget(this.currentOperationData, key)
      this.handleClose()
    },
    //重置
    updateMetaData() {
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let data = {
        taskId: id,
        nodeId: this.dataFlow?.nodeId
      }
      metadataInstancesApi.resetTable(data).then(() => {
        this.getMetadataTransformer() //更新整个数据
      })
    },
    updateTargetView(id, key, value) {
      this.viewTableData.forEach(field => {
        if (field.sourceFieldName === id) {
          field[key] = value
        }
      })
    },
    updateTarget(row, type) {
      if (this.editFields?.length === 0) {
        let field = {
          fieldName: row.sourceFieldName,
          fieldType: type === 'sourceFieldType' ? this.editValueType[this.currentOperationType] : row.sourceFieldType,
          defaultValue: type === 'defaultValue' ? this.editValueType[this.currentOperationType] : this.editDataValue
        }
        this.editFields.push(field)
      } else {
        for (let i = 0; i < this.editFields.length; i++) {
          if (this.editFields[i].fieldName === row.sourceFieldName) {
            if (type === 'defaultValue') {
              this.editFields[i].defaultValue = this.editValueType[this.currentOperationType] || ''
            } else {
              this.editFields[i].fieldType = this.editValueType[this.currentOperationType] || ''
            }
          } else {
            let field = {
              fieldName: row.sourceFieldName,
              fieldType:
                type === 'sourceFieldType' ? this.editValueType[this.currentOperationType] : row.sourceFieldType,
              defaultValue: type === 'defaultValue' ? this.editValueType[this.currentOperationType] : this.editDataValue
            }
            this.editFields.push(field)
          }
        }
      }
    },
    save(val) {
      let id = this.dataFlow?.id || this.dataFlow?.taskId
      let data = {
        taskId: id,
        tableName: this.selectRow?.sourceObjectName,
        fields: this.editFields || []
      }
      metadataInstancesApi.saveTable(data).then(() => {
        this.$emit('updateVisible')
      })
      if (val) {
        this.closeDialog()
      }
    },
    closeDialog() {
      this.searchField = ''
      this.searchTable = ''
    },
    /*更新target 数据*/
    //获取typeMapping
    getTypeMapping() {
      typeMappingApi.pdkDataType('Mysql').then(res => {
        let targetObj = JSON.parse(res || '{}')
        for (let key in targetObj) {
          this.typeMapping.push({
            dbType: key,
            rules: targetObj[key]
          })
        }
      })
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
        padding: 10px 0 10px 10px;
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
        .task-form-text-box {
          margin-left: 10px;
          width: 140px;
          .target {
            font-size: 12px;
            font-weight: 400;
            color: map-get($color, normal);
            line-height: 20px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
