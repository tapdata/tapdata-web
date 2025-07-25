<script>
import { delayTrigger } from '@tap/shared'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import rollback from '@tap/assets/icons/svg/rollback.svg'
import refresh from '@tap/assets/icons/svg/refresh.svg'
import fieldMapping_table from '@tap/assets/images/fieldMapping_table.png'
import fieldMapping_table_error from '@tap/assets/images/fieldMapping_table_error.png'
import noData from '@tap/assets/images/noData.png'
import { metadataInstancesApi, taskApi, typeMappingApi } from '@tap/api'
import { mapState } from 'vuex'

export default {
  components: {
    OverflowTooltip,
  },
  name: 'List',
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
        count: 1,
      },
      currentOperationType: '',
      editValueType: {
        sourceFieldType: '',
        defaultValue: '',
      },
      titleType: {
        sourceFieldType: this.$t('packages_form_dag_dialog_field_mapping_tittle_data_type'),
        defaultValue: this.$t('packages_form_dag_dialog_field_mapping_tittle_value'),
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
      noData,
    }
  },
  mounted() {
    this.dataFlow = this.getDataFlow()
    this.dataFlow['id'] = this.dataFlow.taskId
    this.dataFlow['nodeId'] = this.dataFlow.activeNodeId
    this.getMetadataTransformer() //不需要推演 直接拿推演结果
  },
  computed: {
    ...mapState('dataflow', ['transformLoading']),
  },
  watch: {
    updateList() {
      this.getMetadataTransformer()
    },
    // 推演加载完成后，主动请求最新模型
    transformLoading(v) {
      if (!v) {
        this.getMetadataTransformer()
      }
    },
  },
  methods: {
    getDataFlow() {
      const dag = this.$store.getters['dataflow/dag']
      const editVersion = this.$store.state.dataflow.editVersion
      let dataflow = this.$store.state.dataflow
      return {
        dag,
        editVersion,
        ...dataflow,
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
        pageSize: size,
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
        .then((res) => {
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
        delayTrigger(() => {
          if (this.searchField.trim()) {
            this.searchField = this.searchField.trim().toString() //去空格
            this.viewTableData = this.target.filter((v) => {
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
        nodeId: this.dataFlow?.nodeId,
      }
      this.searchField = ''
      metadataInstancesApi.resetTable(data).then(() => {
        this.getMetadataTransformer() //更新整个数据
      })
    },
    updateTargetView(id, key, value) {
      this.viewTableData.forEach((field) => {
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
          defaultValue: type === 'defaultValue' ? this.editValueType[this.currentOperationType] : this.editDataValue,
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
              defaultValue:
                type === 'defaultValue' ? this.editValueType[this.currentOperationType] : this.editDataValue,
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
        nodeId: this.dataFlow?.nodeId,
        tableName: this.selectRow?.sourceObjectName,
        fields: this.editFields || [],
      }
      metadataInstancesApi.saveTable(data).then(() => {
        if (val) {
          this.closeDialog()
          this.$emit('updateVisible')
        }
      })
    },
    closeDialog() {
      this.searchField = ''
      this.searchTable = ''
    },
    /*更新target 数据*/
    //获取typeMapping
    getTypeMapping() {
      typeMappingApi.pdkDataType('Mysql').then((res) => {
        let targetObj = JSON.parse(res || '{}')
        for (let key in targetObj) {
          this.typeMapping.push({
            dbType: key,
            rules: targetObj[key],
          })
        }
      })
    },
    initDataType(val) {
      let target = this.typeMapping.filter((type) => type.dbType === val)
      if (target?.length > 0) {
        this.currentTypeRules = target[0]?.rules || []
      } else this.currentTypeRules = '' //清除上一个字段范围
    },
    querySearchPdkType(queryString, cb) {
      let result = this.typeMapping.map((t) => {
        return {
          value: t.dbType,
        }
      })
      cb(result)
    },
    getPdkEditValueType() {
      let findOne = this.typeMapping.find((t) => t.dbType === this.editValueType[this.currentOperationType])
      return findOne?.rules || ''
    },
  },
  emits: ['update-visible'],
}
</script>

<template>
  <section v-loading="transformLoading">
    <div class="node-field-mapping flex flex-column">
      <div class="task-form-body">
        <div class="task-form-left flex flex-column">
          <div class="flex mb-2 ml-2 mr-2">
            <div class="flex">
              <ElInput
                v-model="searchTable"
                :placeholder="$t('packages_form_field_mapping_list_qingshurubiaoming')"
                clearable
                @input="getMetadataTransformer(searchTable, 'search')"
              >
                <template #suffix>
                  <ElIcon><ElIconSearch /></ElIcon>
                </template>
              </ElInput>
            </div>
          </div>
          <div class="flex bg-main justify-content-between mb-2 pl-2">
            <span class="table-name ml-1">{{ $t('packages_form_field_mapping_list_biaoming') }}</span>
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
              <div class="table__empty_img" style="margin-top: 22%">
                <img style="" :src="noData" />
              </div>
              <div class="noData">{{ $t('public_data_no_data') }}</div>
            </div>
          </div>
          <ElPagination
            small
            class="flex mt-3 din-font"
            layout="total, prev, slot, next"
            v-model:current-page="page.current"
            v-model:page-size="page.size"
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
                :placeholder="$t('packages_form_field_mapping_list_qingshuruziduan')"
                v-model="searchField"
                clearable
                @input="search()"
              >
                <template #suffix>
                  <ElIcon><ElIconSearch /></ElIcon>
                </template>
              </ElInput>
            </div>
            <div class="item ml-2">
              <ElButton plain class="btn-refresh" @click="rest">
                <VIcon>refresh</VIcon>
              </ElButton>
              <ElButton v-if="!readOnly" text class="btn-rest" @click="updateMetaData">
                {{ $t('public_button_reset') }}
              </ElButton>
            </div>
          </div>
          <ElTable
            class="field-mapping-table table-border"
            height="100%"
            :data="viewTableData"
            v-loading="loadingTable"
          >
            <ElTableColumn
              type="index"
              width="55"
              :label="$t('packages_form_field_mapping_list_xuhao')"
            ></ElTableColumn>
            <ElTableColumn
              show-overflow-tooltip
              :label="$t('packages_form_dag_dialog_field_mapping_field')"
              prop="field_name"
            >
              <template #default="{ row }">
                <span v-if="row.primary_key_position > 0" :show-overflow-tooltip="true"
                  >{{ row.targetFieldName }}
                  <VIcon size="12" class="color-darkorange">key</VIcon>
                </span>
                <span v-else class="item" :show-overflow-tooltip="true">{{ row.targetFieldName }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('packages_form_dag_dialog_field_mapping_type')" prop="sourceFieldType">
              <template #default="{ row }">
                <div>
                  <span :show-overflow-tooltip="true">{{ row.sourceFieldType }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('packages_form_meta_table_default')">
              <template #default="{ row }">
                <div class="cursor-pointer" v-if="!readOnly" @click="edit(row, 'defaultValue')">
                  <ElTooltip class="item" effect="dark" :content="row.defaultValue" placement="left">
                    <span class="field-mapping-table__default_value">{{ row.defaultValue }}</span>
                  </ElTooltip>
                  <el-icon class="field-mapping__icon"><Edit /></el-icon>
                </div>
                <div v-else>{{ row.defaultValue }}</div>
              </template>
            </ElTableColumn>
            <template v-slot:empty>
              <div class="field-mapping-table__empty">
                <div class="table__empty_img" style="margin-left: 30%">
                  <img style="" :src="noData" />
                </div>
                <div class="noData">{{ $t('public_data_no_data') }}</div>
              </div>
            </template>
          </ElTable>
        </div>
      </div>
    </div>
    <ElDialog
      :title="titleType[currentOperationType]"
      v-model="dialogVisible"
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
              <div v-if="index === 0">
                {{ $t('packages_form_dag_dialog_field_mapping_range_precision') }}
              </div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div v-if="item.maxScale && item.minScale !== item.maxScale" style="margin-top: 10px">
              <div>
                {{ $t('packages_form_dag_dialog_field_mapping_range_scale') }}
              </div>
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
      <template v-slot:footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose()">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton type="primary" @click="editSave()">{{ $t('public_button_confirm') }}</ElButton>
        </span>
      </template>
    </ElDialog>
  </section>
</template>

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
    color: var(--color-primary);
  }
}
</style>

<style lang="scss" scoped>
.node-field-mapping {
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon-error {
    color: red;
  }
  .icon-color {
    color: var(--icon-n2);
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
    color: var(--bg-special);
  }
  .page__current {
    width: 22px;
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: var(--color-primary);
    line-height: 22px;
    background-color: var(--bg-pageCount);
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
      border-color: var(--color-primary);
      background-color: var(--color-white);
    }
  }
  .task-form-body {
    display: flex;
    height: 60vh;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    .task-form-left {
      padding-top: 8px;
      border-right: 1px solid var(--border-light);
      .table-name {
        height: 40px;
        line-height: 42px;
        font-size: 12px;
        color: var(--text-normal);
        font-weight: 500;
      }
    }
    .task-form-left__ul {
      flex: 1;
      max-width: 210px;
      overflow-x: hidden;
      overflow-y: auto;
      li {
        background: var(--color-white);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-bottom: 1px solid var(--border-light);
        display: flex;
        padding: 10px 0 10px 10px;
        &:hover {
          background: var(--bg-disactive);
          cursor: pointer;
          border-left: 2px solid var(--color-primary);
        }
        &.active {
          background: var(--bg-disactive);
          border-left: 2px solid var(--color-primary);
          cursor: pointer;
        }
        .task-form-text-box {
          margin-left: 10px;
          //width: 140px;
          .target {
            font-size: 12px;
            font-weight: 400;
            color: var(--text-normal);
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
      color: var(--color-primary);
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
    :deep(.el-table) {
      border: none;
    }

    :deep(.el-table__empty-block) {
      height: 100% !important;
    }

    :deep(.el-table__header) {
      .el-table__cell {
        border-right: 0;
        &.is-leaf {
          border-bottom: 0;
        }
        &:hover {
          border-right: 1px solid var(--border-light);
        }
      }
      th {
        color: var(--text-normal);
        font-weight: 500;
        white-space: nowrap;
        background-color: var(--bg-normal);
      }
    }

    :deep(.el-table__body) {
      td {
        color: var(--text-light);
      }
    }

    &:after {
      width: 0;
    }
  }
}
</style>
