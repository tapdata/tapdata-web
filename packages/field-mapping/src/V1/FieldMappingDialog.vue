<template>
  <div class="field-mapping flex flex-column" v-loading="loadingPage">
    <div class="field-mapping__desc text-start lh-base">
      <strong>{{ $t('dag_dialog_field_mapping_table_setting') }}</strong
      >: {{ $t('dag_dialog_field_mapping_tip') }}
      <div class="float-end mt-5">
        <ElButton
          v-if="modeMapping[transform.mode]['batch_field_rename']"
          size="mini"
          @click="dialogFieldVisible = true"
          >{{ $t('dag_dialog_field_mapping_field_rename') }}</ElButton
        >
        <ElButton v-if="modeMapping[transform.mode]['batch_field_type']" size="mini" @click="handleBatchDataType">
          {{ $t('dag_dialog_field_mapping_change_type_field_rename') }}</ElButton
        >
        <ElButton
          v-if="modeMapping[transform.mode]['batch_rollback']"
          class="mr-5"
          size="mini"
          type="primary"
          @click="rollbackAll"
          >{{ $t('dag_dialog_field_mapping_rollback_all') }}</ElButton
        >
      </div>
    </div>
    <div class="task-form-body">
      <div class="task-form-left flex flex-column">
        <div class="flex mb-2 ml-6">
          <div class="flex">
            <span class="task-form__text"> {{ $t('dag_dialog_field_mapping_search_table') }}：</span>
            <ElInput v-model="searchTable" clearable size="mini" @input="search('table')"></ElInput>
          </div>
        </div>
        <div class="mb-2 ml-6" v-if="progress.showProgress">
          {{ progress.finished }} / {{ progress.total }} <VIcon size="12">loading</VIcon
          ><span>{{ $t('dag_dialog_field_mapping_loading_schema') }}</span>
        </div>
        <ul class="task-form-left__ul flex flex-column">
          <li
            v-for="(item, index) in fieldMappingNavData"
            :key="index"
            :class="{ active: position === index }"
            @click.prevent="select(item, index)"
          >
            <div class="task-form__img" v-if="item.invalid">
              <img :src="fieldMapping_table_error" alt="" />
            </div>
            <div class="task-form__img" v-else>
              <img :src="fieldMapping_table" alt="" />
            </div>
            <div class="task-form-text-box">
              <div class="source">{{ item.sourceObjectName }}</div>
              <div class="target">{{ item.sinkObjectName }}</div>
              <div class="select">
                {{
                  `${$t('dag_dialog_field_mapping_selected')} ${
                    position === index ? fieldCount : item.sourceFieldCount - item.userDeletedNum
                  }/${item.sourceFieldCount}`
                }}
              </div>
            </div>
          </li>
        </ul>
        <ElPagination
          small
          class="flex mt-3"
          layout="total, prev, pager, next"
          :current-page.sync="page.current"
          :page-size.sync="page.size"
          :total="page.total"
          :pager-count="5"
          @current-change="initNavData"
        >
        </ElPagination>
      </div>
      <div class="main">
        <div class="flex mb-2 ml-2 text-start">
          <div class="flex align-items-center">
            <span class="task-form__text"> {{ $t('dag_dialog_field_mapping_search_field') }} : </span>
            <ElInput v-model="searchField" size="mini" @input="search('field')"></ElInput>
          </div>
          <div class="item ml-5">
            <ElButton
              v-if="modeMapping[transform.mode]['rollback']"
              size="mini"
              style="padding: 6px 15px"
              @click.stop="rollbackTable(selectRow.sinkObjectName, selectRow.sourceTableId)"
            >
              <ElTooltip effect="dark" :content="$t('dag_dialog_field_mapping_rollback_field')" placement="top-start">
                <VIcon class="color-primary" size="14">rollback</VIcon>
              </ElTooltip>
            </ElButton>
          </div>
        </div>
        <ElTable
          class="field-mapping-table table-border"
          height="100%"
          border
          :data="fieldMappingTableData"
          :row-class-name="tableRowClassName"
          v-loading="loading"
        >
          <ElTableColumn show-overflow-tooltip :label="$t('dag_dialog_field_mapping_source_field')" prop="field_name">
            <template slot-scope="scope">
              <span v-if="scope.row.primary_key_position > 0" :show-overflow-tooltip="true"
                >{{ scope.row.field_name }}
                <VIcon size="12" class="color-darkorange">key</VIcon>
              </span>
              <span v-else class="item" :show-overflow-tooltip="true">{{ scope.row.field_name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('dag_dialog_field_mapping_source_type')"
            prop="data_type"
            width="150"
          ></ElTableColumn>
          <!--          <ElTableColumn-->
          <!--            :label="$t('dag_dialog_field_mapping_source_precision')"-->
          <!--            prop="precision"-->
          <!--            width="150"-->
          <!--          >-->
          <!--            <template slot-scope="scope">-->
          <!--              <span>{{ scope.row.precision === -1 ? '' : scope.row.precision }}</span>-->
          <!--            </template>-->
          <!--          </ElTableColumn>-->
          <!--          <ElTableColumn-->
          <!--            :label="$t('dag_dialog_field_mapping_source_scale')"-->
          <!--            prop="scale"-->
          <!--            width="100"-->
          <!--          ></ElTableColumn>-->
          <ElTableColumn :label="$t('dag_dialog_field_mapping_target_field')">
            <template slot-scope="scope">
              <div
                class="cursor-pointer"
                v-if="!scope.row.is_deleted && modeMapping[transform.mode]['field_rename']"
                @click="edit(scope.row, 'field_name')"
              >
                <span :show-overflow-tooltip="true"
                  >{{ scope.row.t_field_name }}<i class="icon el-icon-edit-outline"></i
                ></span>
              </div>
              <span v-else :show-overflow-tooltip="true">{{ scope.row.t_field_name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('dag_dialog_field_mapping_target_type')" width="150">
            <template slot-scope="scope">
              <div
                class="cursor-pointer"
                v-if="!scope.row.is_deleted && modeMapping[transform.mode]['field_type']"
                @click="edit(scope.row, 'data_type')"
              >
                <span>{{ scope.row.t_data_type }}</span>
                <i v-if="!scope.row.t_data_type" class="icon-error el-icon-warning"></i>
                <i class="icon el-icon-arrow-down"></i>
              </div>
              <div v-else>
                <span>{{ scope.row.t_data_type }}</span>
              </div>
            </template>
          </ElTableColumn>
          <!--          <ElTableColumn :label="$t('dag_dialog_field_mapping_target_precision')" width="150">-->
          <!--            <template slot-scope="scope">-->
          <!--              <div-->
          <!--                class="cursor-pointer"-->
          <!--                v-if="!scope.row.is_deleted && scope.row.t_isPrecisionEdit && modeMapping[transform.mode]['precision']"-->
          <!--                @click="edit(scope.row, 'precision')"-->
          <!--              >-->
          <!--                <span>{{ scope.row.t_precision }}</span>-->
          <!--                <i class="icon el-icon-edit-outline"></i>-->
          <!--              </div>-->
          <!--              <div v-else>-->
          <!--                <span>{{ scope.row.t_precision === -1 ? '' : scope.row.t_precision }}</span>-->
          <!--              </div>-->
          <!--            </template>-->
          <!--          </ElTableColumn>-->
          <!--          <ElTableColumn :label="$t('dag_dialog_field_mapping_target_scale')" width="100">-->
          <!--            <template slot-scope="scope">-->
          <!--              <div-->
          <!--                class="cursor-pointer"-->
          <!--                v-if="!scope.row.is_deleted && scope.row.t_isScaleEdit && modeMapping[transform.mode]['scale']"-->
          <!--                @click="edit(scope.row, 'scale')"-->
          <!--              >-->
          <!--                <span>{{ scope.row.t_scale }}</span>-->
          <!--                <i class="icon el-icon-edit-outline"></i>-->
          <!--              </div>-->
          <!--              <div v-else>-->
          <!--                <span>{{ scope.row.t_scale }}</span>-->
          <!--              </div>-->
          <!--            </template>-->
          <!--          </ElTableColumn>-->
          <ElTableColumn :label="$t('meta_table_default')" width="180">
            <template slot-scope="scope">
              <div class="cursor-pointer" @click="edit(scope.row, 'default_value')">
                <span class="field-mapping-table__default_value">{{ scope.row.t_default_value }}</span>
                <i class="icon el-icon-edit-outline"></i>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('dag_dialog_field_mapping_operate')"
            :width="100"
            fixed="right"
            v-if="modeMapping[transform.mode]['field_table_ops']"
          >
            <template slot-scope="scope">
              <ElLink type="primary" v-if="!scope.row.is_deleted" @click="del(scope.row.t_id, true)">
                {{ $t('button_delete') }}
              </ElLink>
              <ElLink type="primary" v-else @click="del(scope.row.t_id, false)"> {{ $t('button_reduction') }} </ElLink>
            </template>
          </ElTableColumn>
          <div class="field-mapping-table__empty" slot="empty">
            <i class="el-icon-folder-opened"></i>
            <span class="ml-1">{{ $t('dag_dialog_field_mapping_no_data') }}</span>
          </div>
        </ElTable>
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
              <div v-if="index === 0">{{ $t('dag_dialog_field_mapping_range_precision') }}</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div
              v-if="item.maxScale && currentOperationType === 'scale' && item.minScale !== item.maxScale"
              style="margin-top: 10px"
            >
              <div>{{ $t('dag_dialog_field_mapping_range_scale') }}</div>
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
        v-model="editValueType[currentOperationType]"
        v-if="['default_value'].includes(currentOperationType)"
      ></ElInput>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="handleClose()">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="editSave()">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <ElDialog
      width="600px"
      append-to-body
      :title="$t('dag_dialog_field_mapping_batch_field_name')"
      custom-class="field-maping-table-dialog"
      :visible.sync="dialogFieldVisible"
      :close-on-click-modal="false"
      :before-close="handleFieldClose"
    >
      <div class="table-box">
        <ElForm ref="form" class="table-form" :model="form" label-width="120px">
          <ElFormItem :label="$t('dag_data_node_label_database_link_field')">
            <ElSelect size="mini" v-model="form.fieldsNameTransform">
              <ElOption :label="$t('dag_data_node_label_database_link_unchang')" value=""></ElOption>
              <ElOption :label="$t('dag_data_node_label_database_link_to_uppercase')" value="toUpperCase"></ElOption>
              <ElOption :label="$t('dag_data_node_label_database_link_to_lowercase')" value="toLowerCase"></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleFieldClose">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="handleFieldSave()">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <ElDialog
      width="600px"
      append-to-body
      :title="$t('dag_dialog_field_mapping_batch_change_type')"
      custom-class="field-maping-table-dialog"
      :visible.sync="dialogDataTypeVisible"
      :close-on-click-modal="false"
      :before-close="handleDataTypeClose"
    >
      <div class="table-box flex flex-row mb-3">
        <span class="inline-block font-weight-bold" style="width: 190px">{{
          $t('dag_dialog_field_mapping_batch_change_type_source')
        }}</span>
        <span class="inline-block font-weight-bold" style="width: 334px">{{
          $t('dag_dialog_field_mapping_batch_change_type_target')
        }}</span>
      </div>
      <div class="table-box flex flex-column">
        <template v-if="form.batchOperationList && form.batchOperationList.length !== 0">
          <div
            class="flex flex-row flex-1 mb-3 align-items-center"
            v-for="(ops, index) in form.batchOperationList"
            :key="index"
          >
            <ElSelect class="mr-3" size="mini" v-model="ops.sourceType" :disabled="true">
              <ElOption
                :label="item.dbType"
                :value="item.dbType"
                v-for="(item, index) in sourceTypeMapping"
                :key="index"
              ></ElOption>
            </ElSelect>
            <VIcon class="color-primary mr-3">right</VIcon>
            <ElSelect size="mini" v-model="ops.targetType" filterable>
              <ElOption
                :label="item.dbType"
                :value="item.dbType"
                v-for="(item, index) in typeMapping"
                :key="index"
              ></ElOption>
            </ElSelect>
            <VIcon v-if="index === 0 && showAddBtn" class="ml-3 clickable" @click="handleBatchOperation">add</VIcon>
          </div>
        </template>
        <div class="flex flex-row flex-1 mb-3 align-items-center" v-for="(ops, index) in batchOperation" :key="index">
          <ElSelect
            class="mr-3"
            size="mini"
            clearable
            filterable
            v-model="ops.sourceType"
            @visible-change="handleChangeSourceType"
          >
            <ElOption
              :label="item.dbType"
              :value="item.dbType"
              v-for="(item, index) in sourceList"
              :key="index"
            ></ElOption>
          </ElSelect>
          <VIcon class="mr-3 color-primary">right</VIcon>
          <ElSelect size="mini" clearable filterable v-model="ops.targetType">
            <ElOption
              :label="item.dbType"
              :value="item.dbType"
              v-for="(item, index) in typeMapping"
              :key="index"
            ></ElOption>
          </ElSelect>
          <VIcon v-if="index === 0 && !showAddBtn" class="ml-3 clickable" @click="handleBatchOperation">add</VIcon>
          <VIcon
            v-if="index !== 0 || (index === 0 && showAddBtn)"
            class="ml-3 clickable"
            @click="removeBatchOperation(index)"
            >remove</VIcon
          >
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleDataTypeClose">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="handleDataTypeSave()">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import rollback from 'web-core/assets/icons/svg/rollback.svg'
import fieldMapping_table from 'web-core/assets/images/fieldMapping_table.png'
import fieldMapping_table_error from 'web-core/assets/images/fieldMapping_table_error.png'
import { delayTrigger } from 'web-core/util'
import { modeMapping } from './const'

export default {
  name: 'FieldMappingDialog',
  components: { VIcon },
  props: {
    remoteMethod: Function,
    typeMappingMethod: Function,
    fieldProcessMethod: Function,
    updateMetadata: Function,
    getNavDataMethod: Function,
    fieldProcess: Array,
    transform: Object,
    getDataFlow: Function
  },
  data() {
    return {
      selectRow: '',
      searchField: '',
      searchTable: '',
      loading: false,
      loadingPage: false,
      typeMapping: [],
      currentTypeRules: [],
      defaultFieldMappingNavData: '',
      defaultFieldMappingTableData: '',
      position: 0,
      fieldCount: '', //当前选中总数
      fieldMappingTableData: [],
      fieldMappingNavData: [],
      dialogVisible: false,
      currentOperationType: '',
      currentOperationData: '',
      target: [],
      editValueType: {
        field_name: '',
        data_type: '',
        precision: '',
        scale: '',
        default_value: ''
      },
      titleType: {
        field_name: this.$t('dag_dialog_field_mapping_tittle_field_name'),
        data_type: this.$t('dag_dialog_field_mapping_tittle_data_type'),
        precision: this.$t('dag_dialog_field_mapping_tittle_precision'),
        scale: this.$t('dag_dialog_field_mapping_tittle_scale'),
        default_value: this.$t('dag_dialog_field_mapping_tittle_value')
      },
      page: {
        size: 10,
        current: 1,
        total: 0
      },
      progress: {
        total: 0,
        finished: '0',
        progress: '0',
        showProgress: false
      },
      operations: [], //字段操作
      dialogTableVisible: false,
      dialogFieldVisible: false,
      dialogDataTypeVisible: false,
      form: {},
      currentForm: {},
      sourceTableName: 'tableName',
      rollback,
      fieldMapping_table,
      fieldMapping_table_error,
      //批量修改字段
      batchOperation: [
        {
          sourceType: '',
          targetType: ''
        }
      ],
      sourceList: [],
      showAddBtn: false, //展示新增按钮
      oldBatchOperationList: [],
      sourceTypeMapping: [],
      modeMapping
    }
  },
  created() {
    if (!this.transform?.mode || this.transform?.mode === '') {
      this.transform.mode = 'all' //没有特殊处理都是全部功能打开
    }
  },
  mounted() {
    if (modeMapping[this.transform.mode] !== 'readOnly' && this.transform) {
      this.form = {
        fieldsNameTransform: this.transform.fieldsNameTransform,
        batchOperationList: this.transform?.batchOperationList || [] //类型操作
      }
      this.currentForm = JSON.parse(JSON.stringify(this.form))
    }
    this.initNavData()
    //接收数据
    let id = this.transform.nodeId
    let self = this
    this.$ws.on('metadataTransformerProgress', function (res) {
      if (res?.data?.stageId === id) {
        let { finished, total, status } = res?.data
        self.progress.finished = finished
        self.progress.total = total
        self.page.total = finished
        if (status !== 'done') {
          self.progress.showProgress = true
          if (self.fieldMappingNavData?.length < self.page.size && self.page.current === 1) {
            self.initNavData()
          }
        } else {
          self.progress.showProgress = false
          self.initNavData()
        }
      }
    })
  },
  methods: {
    //数据处理区域
    /*初始化table数据*/
    initTableData() {
      this.loading = true
      this.$nextTick(() => {
        this.remoteMethod &&
          this.remoteMethod(this.selectRow)
            .then(({ data = [], target = [] }) => {
              this.target = target
              this.fieldMappingTableData = data
              this.initShowEdit()
              this.defaultFieldMappingTableData = JSON.parse(JSON.stringify(this.fieldMappingTableData)) //保留一份原始数据 查询用
            })
            .finally(() => {
              this.loading = false
            })
      })
    },
    /* 初始化字段类型列表*/
    initTypeMapping() {
      this.$nextTick(() => {
        this.typeMappingMethod &&
          this.typeMappingMethod(this.selectRow).then(({ sourceData, targetData }) => {
            this.sourceTypeMapping = sourceData || []
            this.typeMapping = targetData || []
          })
      })
    },
    /* 初始化左边列表*/
    initNavData() {
      //获取第一页推演结果
      this.loadingPage = true
      this.$nextTick(() => {
        this.getNavDataMethod &&
          this.getNavDataMethod(this.page)
            .then(({ data, total }) => {
              if (data?.[0]) {
                this.fieldMappingNavData = data
                this.selectRow = data[this.position] || data?.[0]
                this.fieldCount = this.selectRow?.sourceFieldCount - this.selectRow?.userDeletedNum || 0
              }
              this.page.total = total
              //初始化右侧列表
              this.initTableData()
              this.initTypeMapping()
            })
            .finally(() => {
              this.loadingPage = false
            })
      })
    },
    /* 初始化目标字段、长度是否可编辑*/
    initShowEdit() {
      let data = this.fieldMappingTableData
      if (this.fieldMappingTableData?.length === 0) return
      for (let i = 0; i < data.length; i++) {
        let rules = this.typeMapping.filter(v => v.dbType === data[i].t_data_type)
        if (rules?.length > 0) {
          rules = rules[0].rules
          this.showPrecisionEdit(data[i].t_id, rules || [])
          this.showScaleEdit(data[i].t_id, rules || [])
        }
      }
    },
    /*页面刷新 兼容只读模式*/
    updateView(data) {
      //只读模式初始化
      if (data) {
        this.defaultFieldMappingNavData = JSON.parse(JSON.stringify(data))
        this.selectRow = data[0]
        this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
      }
      this.updateData()
    },
    /*数据重新加载*/
    updateData() {
      this.initTableData()
      this.initTypeMapping()
      this.clearSearch()
      //重新更新左边导航
      this.page.current = 1
      this.initNavData()
      this.operations = []
      if (this.fieldProcess?.length > 0) {
        this.getFieldProcess()
      }
    },
    /*更新左边被删除字段*/
    updateFieldCount(type) {
      let id = this.selectRow.sinkQulifiedName
      if (this.fieldMappingNavData) {
        for (let i = 0; i < this.fieldMappingNavData.length; i++) {
          if (this.fieldMappingNavData[i].sinkQulifiedName === id && type === 'remove') {
            this.fieldMappingNavData[i].userDeletedNum = this.fieldMappingNavData[i].userDeletedNum + 1
          } else if (this.fieldMappingNavData[i].sinkQulifiedName === id && type === 'add') {
            this.fieldMappingNavData[i].userDeletedNum = this.fieldMappingNavData[i].userDeletedNum - 1
          }
        }
      }
    },
    /*更新table数据*/
    updateTableData(id, key, value) {
      this.fieldMappingTableData.forEach(field => {
        if (field.t_id === id) {
          //改目标表
          field[key] = value
        }
      })
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
      //触发页面重新渲染
      this.updateTableData(id, `t_${key}`, value)
    },
    //只是视图更新 field['source'] = 'manual' 不动
    updateTargetView(id, key, value) {
      this.target.forEach(field => {
        if (field.id === id && field.is_deleted !== 'true' && field.is_deleted !== true) {
          field[key] = value
        }
      })
      //触发页面重新渲染
      this.updateTableData(id, `t_${key}`, value)
    },
    /*更新左边表导航 重新推演*/
    updateParentMetaData(type, data, batchOperation) {
      this.loadingPage = true
      this.$nextTick(() => {
        this.updateMetadata &&
          this.updateMetadata(type, data, batchOperation)
            .then(data => {
              this.$emit('update-nav', data)
              this.selectRow = data[this.position]
            })
            .finally(() => {
              this.loadingPage = false
              this.updateView()
            })
      })
    },
    /*更新schema 加载进度*/
    metadataTransformerProgress(data) {
      let { finished, total } = data
      this.progress.finished = finished
      this.progress.finished = total
    },
    //全局操作区域
    /*打开表改名弹窗*/
    handleChangTableName() {
      this.dialogTableVisible = true
    },
    handleBatchDataType() {
      //锁定源表字段去重
      this.dialogDataTypeVisible = true
      if (this.form.batchOperationList?.length === 0) {
        this.intiBatchOperation()
        this.showAddBtn = false
      } else {
        this.batchOperation = [] //二次渲染清空当前操作
        this.showAddBtn = true
      }
      this.filterBatchOperationList()
      this.oldBatchOperationList = JSON.parse(JSON.stringify(this.form.batchOperationList))
    },
    /*字段改名弹窗取消*/
    handleFieldClose() {
      this.dialogFieldVisible = false
      this.form.fieldsNameTransform = this.currentForm.fieldsNameTransform
    },
    /*字段改名弹窗取消*/
    handleDataTypeClose() {
      this.dialogDataTypeVisible = false
      this.form.batchOperationList = this.currentForm.batchOperationList
    },
    filterBatchOperationList() {
      //每次源表都需要过滤
      if (this.form.batchOperationList?.length === 0 || !this.form.batchOperationList) {
        this.sourceList = this.sourceTypeMapping
      } else {
        this.form.batchOperationList.forEach(item => {
          this.sourceList = this.sourceTypeMapping.filter(v => v.dbType !== item.sourceType)
        })
      }
      if (this.batchOperation?.length >= 0 && this.batchOperation) {
        this.batchOperation.forEach(item => {
          this.sourceList = this.sourceList.filter(v => v.dbType !== item.sourceType)
        })
      }
    },
    handleBatchOperation() {
      let node = {
        sourceType: '',
        targetType: ''
      }
      this.batchOperation.push(node)
    },
    removeBatchOperation(index) {
      this.batchOperation.splice(index, 1)
    },
    handleChangeSourceType(val) {
      if (val) {
        //下拉框打开重新过滤去重sourceList
        this.filterBatchOperationList()
      }
    },
    /*表改名弹窗保存*/
    handleTableNameSave() {
      this.dialogTableVisible = false
      this.copyForm()
      this.updateParentMetaData('table', this.form)
    },
    /*字段名弹窗保存*/
    handleFieldSave() {
      this.dialogFieldVisible = false
      this.copyForm()
      this.updateParentMetaData('field', this.form)
    },
    /*字段类型弹窗保存*/
    handleDataTypeSave() {
      let verify = true
      this.batchOperation.forEach(v => {
        if (v.sourceType === '') {
          verify = false
        }
      })
      if (!verify) {
        this.$message.error(this.$t('dag_dialog_field_mapping_batch_change_type_error_tip'))
        return
      }
      this.dialogDataTypeVisible = false
      this.copyForm()
      //将新增push到batchOperationList
      this.form.batchOperationList = this.form.batchOperationList || []
      let oldObj = {} //是否对已有的数据有修改
      this.form.batchOperationList.push(...this.batchOperation)
      this.batchOperation = []
      if (this.oldBatchOperationList?.length > 0) {
        this.oldBatchOperationList.forEach(item => {
          oldObj[item.sourceType] = item.targetType
        })
      }
      if (this.form.batchOperationList?.length > 0) {
        this.form.batchOperationList.forEach(item => {
          if (!oldObj[item.sourceType] || oldObj[item.sourceType] !== item.targetType) {
            this.batchOperation.push(item)
          }
        })
      }
      this.updateParentMetaData('dataType', this.form, this.batchOperation)
      this.intiBatchOperation()
    },
    intiBatchOperation() {
      this.batchOperation = [
        {
          sourceType: '',
          targetType: ''
        }
      ]
    },
    /*copy 当前form*/
    copyForm() {
      this.currentForm = JSON.parse(JSON.stringify(this.form))
    },
    /* 恢复默认全部*/
    rollbackAll() {
      this.$confirm(
        this.$t('dag_dialog_field_mapping_error_rollback_all'),
        this.$t('dag_dialog_field_mapping_error_tip'),
        {
          type: 'warning'
        }
      ).then(resFlag => {
        if (resFlag) {
          this.form = {
            fieldsNameTransform: '',
            batchOperationList: []
          }
          this.intiBatchOperation()
          this.copyForm()
          this.$nextTick(() => {
            this.loadingPage = true
            this.fieldProcessMethod &&
              this.fieldProcessMethod('all')
                .then(data => {
                  this.$emit('update-nav', data)
                  this.updateData()
                  this.selectRow = data[this.position]
                })
                .finally(() => {
                  this.loadingPage = false
                })
          })
        }
      })
    },

    //左边导航区域
    /*切换表*/
    select(item, index) {
      if (modeMapping[this.transform.mode] !== 'readOnly') {
        let data = JSON.parse(JSON.stringify(this.target))
        let deleteLen = data.filter(v => !v.is_deleted)
        if (deleteLen.length === 0 && this.target?.length > 0) {
          this.$message.error(this.$t('dag_link_field_mapping_error_all_deleted'))
          return //所有字段被删除了 不可以保存任务
        }
        this.$emit('row-click', this.selectRow, this.operations, this.target)
      }
      this.position = '' //再次点击清空去一个样式
      this.searchField = ''
      this.fieldCount = 0
      this.selectRow = item
      this.fieldCount = item.sourceFieldCount - item.userDeletedNum || 0
      this.position = index
      this.operations = []
      if (this.fieldProcess?.length > 0) {
        this.getFieldProcess()
      }
      this.initTableData()
      this.initTypeMapping()
    },

    //右边table数据区域
    /*
     * 按表搜索 按字段名搜索
     * */
    search(type) {
      if (type === 'table') {
        //获取第一页推演结果
        this.loadingPage = true
        this.$nextTick(() => {
          delayTrigger(() => {
            this.getNavDataMethod &&
              this.getNavDataMethod(this.page, this.searchTable)
                .then(({ data, total }) => {
                  this.fieldMappingNavData = data || []
                  if (!data || data?.length === 0) {
                    //无表则清空右边的表
                    this.fieldMappingTableData = []
                    return
                  }
                  this.selectRow = data[0]
                  this.fieldCount = this.selectRow.sourceFieldCount - this.selectRow.userDeletedNum || 0
                  this.page.total = total
                  //初始化右侧列表
                  this.initTableData()
                  this.initTypeMapping()
                })
                .finally(() => {
                  this.loadingPage = false
                })
          }, 100)
        })
      } else {
        this.$nextTick(() => {
          delayTrigger(() => {
            if (this.searchField.trim()) {
              this.searchField = this.searchField.trim().toString() //去空格
              this.fieldMappingTableData = this.defaultFieldMappingTableData.filter(v => {
                let str = (v.field_name + '' + v.t_field_name).toLowerCase()
                return str.indexOf(this.searchField.toLowerCase()) > -1
              })
            } else {
              this.fieldMappingTableData = this.defaultFieldMappingTableData
            }
          }, 100)
        })
      }
    },
    /*清空搜索条件*/
    clearSearch() {
      this.searchField = ''
      this.searchTable = ''
    },
    /*恢复默认单表*/
    rollbackTable(name, id) {
      this.$confirm(this.$t('dag_dialog_field_mapping_error_rollback'), this.$t('dag_dialog_field_mapping_error_tip'), {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.loadingPage = true
          this.$nextTick(() => {
            this.fieldProcessMethod &&
              this.fieldProcessMethod('table', name, id)
                .then(data => {
                  this.$emit('update-nav', data)
                  this.updateData()
                })
                .finally(() => {
                  this.loadingPage = false
                })
          })
        }
      })
    },

    //table字段操作区域
    /*字段操作统一弹窗
     * 操作:修改字段名、修改字段长度、修改字段精度、修改字段类型*/
    edit(row, type) {
      this.dialogVisible = true
      this.editValueType[type] = row[`t_${type}`]

      this.currentOperationType = type
      this.currentOperationData = row
      //初始化
      this.initDataType(row[`t_data_type`])
    },
    editSave() {
      //元数据-字段操作
      let id = this.currentOperationData.t_id
      let key = this.currentOperationType
      let value = this.editValueType[this.currentOperationType]
      let verify = true
      //任务-字段处理器
      if (key === 'field_name') {
        let option = this.target.filter(v => v.id === id && !v.is_deleted)
        if (option.length === 0) return
        option = option[0]
        //字段名限制
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
          this.$message.error('以英文字母、下划线开头，仅支持英文、数字、下划线，限1~50字符')
          return
        }
        if (value === option.field_name && !option.is_deleted) {
          this.handleClose() //名字无改变
          return
        }
        let existsName = this.handleExistsName(value) //检查是否重名
        if (existsName) {
          return
        }
        this.fieldProcessRename(id, key, value)
      } else if (key === 'data_type') {
        let option = this.target.find(v => v.id === id)
        if (!option) {
          return
        }
        if (value === option.data_type) {
          this.handleClose() //类型无改变
          return
        }
        //如果是改类型 需要手动修改字段的长度以及精度
        // this.influences(id, this.currentTypeRules || [])
        this.updateTargetView(id, 'tapType', '')
      } else if (key === 'precision') {
        let isPrecision = this.currentTypeRules.filter(v => v.minPrecision < v.maxPrecision)
        if (isPrecision.length === 0) {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision === r.maxPrecision && value !== r.maxPrecision) {
              this.$message.error(this.$t('dag_dialog_field_mapping_error_range'))
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision < r.maxPrecision) {
              if (r.minPrecision > value || value > r.maxPrecision) {
                verify = false
                this.$message.error(this.$t('dag_dialog_field_mapping_error_range'))
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
              this.$message.error(this.$t('dag_dialog_field_mapping_error_range'))
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minScale < r.maxScale) {
              if (r.minScale > value || value > r.maxScale) {
                verify = false
                this.$message.error(this.$t('dag_dialog_field_mapping_error_range'))
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
    //改类型影响字段长度 精度
    influences(id, rules) {
      this.showScaleEdit(id, rules)
      this.showPrecisionEdit(id, rules)
      this.influencesScale(id, rules)
      this.influencesPrecision(id, rules)
    },
    influencesScale(id, rules) {
      rules.forEach(r => {
        if (r.minScale || r.minScale === 0) {
          this.updateTarget(id, 'scale', r.minScale < 0 ? 0 : r.minScale)
        } else {
          this.updateTarget(id, 'scale', null)
        }
      })
    },
    influencesPrecision(id, rules) {
      rules.forEach(r => {
        if (r.minPrecision || r.minPrecision === 0) {
          this.updateTarget(id, 'precision', r.minPrecision < 0 ? 0 : r.minPrecision)
        } else {
          this.updateTarget(id, 'precision', null)
        }
      })
    },
    showScaleEdit(id, data) {
      if (data instanceof Object) {
        return
      }
      let isScale = data.filter(v => v.minScale < v.maxScale)
      if (isScale.length !== 0) {
        //固定值
        this.updateTargetView(id, 'isScaleEdit', true)
      } else {
        this.updateTargetView(id, 'isScaleEdit', false)
      }
    },
    showPrecisionEdit(id, data) {
      if (data instanceof Object) {
        return
      }
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
    //字段删除
    del(id, value) {
      //任务-字段处理器
      if (value) {
        this.fieldProcessRemove(id)
      } else {
        this.fieldProcessCancelRemove(id)
      }
      //元数据-字段操作
      this.target.forEach(field => {
        if (field.id === id) {
          field.is_deleted = value
          field['source'] = 'manual'
          field['is_auto_allowed'] = false
        }
      })
      //触发页面重新渲染
      this.updateTableData(id, 'is_deleted', value)
      this.checkTable() //消除感叹号
    },
    //目标任务 字段处理器
    //rename操作
    fieldProcessRename(id, key, value) {
      let option = this.target.filter(v => v.id === id)
      if (option.length === 0) return
      option = option[0]
      if (value === option.original_field_name || option.field) {
        this.restRename(id) //用户手动改为最原始的名字
        return
      }
      //rename类型
      let op = {
        op: 'RENAME',
        id: option.id,
        field: option.field_name,
        operand: value, //改过名的字段
        table_name: option.table_name,
        type: option.data_type,
        primary_key_position: option.primary_key_position,
        label: value,
        original_field_name: option.original_field_name
      }
      let ops = this.operations.filter(v => v.id === option.id && v.op === 'RENAME')
      if (ops.length === 0) {
        this.operations.push(op)
      } else {
        op = ops[0]
        op.operand = value
        op.label = value
      }
    },
    handleExistsName(value) {
      // 改名前查找同级中是否重名，若有则return且还原改动并提示
      let exist = false
      let filterData = this.target.filter(v => value === v.field_name && !v.is_deleted)
      if (filterData.length > 0) {
        this.$message.error(value + this.$t('message.exists_name'))
        exist = true
      }
      return exist
    },
    //删除操作
    fieldProcessRemove(id) {
      this.restOperation(id) //先还原被操作
      for (let i = 0; i < this.operations.length; i++) {
        // 删除所有的rename convert的操作
        let ops = this.operations[i]
        if (ops.id === id && ['RENAME'].includes(ops.op)) {
          this.operations.splice(i, 1)
        }
      }
      //删除类型
      let option = this.target.filter(v => v.id === id)
      if (option.length === 0) return
      option = option[0]
      let op = {
        op: 'REMOVE',
        id: option.id,
        field: option.field_name,
        operand: true,
        table_name: option.table_name,
        type: option.data_type,
        primary_key_position: option.primary_key_position,
        label: option.field_name,
        original_field_name: option.original_field_name
      }
      this.operations.push(op)
      //更新当前选中行数
      this.fieldCount = this.fieldCount - 1
      this.updateFieldCount('remove')
    },
    //还原
    fieldProcessCancelRemove(id) {
      this.restOperation(id)
      for (let i = 0; i < this.operations.length; i++) {
        // 撤销删除操作
        let ops = this.operations[i]
        if (ops.id === id && ops.op === 'REMOVE') {
          this.operations.splice(i, 1)
        }
      }
      //更新当前选中行数
      this.fieldCount = this.fieldCount + 1
      this.updateFieldCount('add')
    },
    restRename(id) {
      for (let i = 0; i < this.operations.length; i++) {
        // 还原改名
        let ops = this.operations[i]
        if (ops.id === id && ops.op === 'RENAME') {
          this.operations.splice(i, 1)
        }
      }
    },
    /*获取字段处理器*/
    getFieldProcess() {
      this.operations = []
      let fieldProcess = this.fieldProcess.filter(process => process.table_id === this.selectRow.sourceTableId)
      if (fieldProcess.length > 0) {
        this.operations = fieldProcess[0].operations ? JSON.parse(JSON.stringify(fieldProcess[0].operations)) : []
      }
    },
    restOperation(id) {
      let opr = this.operations.filter(v => v.id === id && v.op === 'RENAME')
      if (opr.length > 0) {
        //元数据-字段操作
        this.updateTarget(id, 't_field_name', opr[0].original_field_name || opr[0].field)
      }
    },
    saveFileOperations() {
      let field_process = {
        table_id: this.selectRow.sourceTableId, //存源表名 兼容旧版字段处理器
        table_name: this.selectRow.sourceObjectName,
        operations: this.operations
      }
      if (this.field_process && this.field_process.length > 0) {
        let process = this.field_process.filter(fields => fields.table_id === this.selectRow.sourceTableId)
        if (process.length > 0) {
          for (let i = 0; i < this.field_process.length; i++) {
            if (this.field_process[i].table_id === this.selectRow.sourceTableId) {
              this.field_process[i].operations = this.operations
            }
          }
        } else {
          this.field_process.push(field_process)
        }
      } else {
        this.field_process = []
        this.field_process.push(field_process)
      }
      return this.field_process
    },
    returnData(hiddenMsg) {
      let result = this.checkTable()
      if (result.checkDataType || result.checkInvalid) {
        if (!hiddenMsg) {
          this.$message.error(
            `${this.$t('dag_dialog_field_mapping_error_save_prefix')}
            ${result.count}
            ${this.$t('dag_dialog_field_mapping_error_save_suffix')}`
          )
        }
        return {
          valid: false,
          row: '',
          operations: '',
          target: []
        }
      }
      let changNameData = {
        fieldsNameTransform: this.form.fieldsNameTransform,
        batchOperationList: this.form?.batchOperationList || []
      }
      return {
        valid: true,
        row: this.selectRow,
        operations: this.operations,
        target: this.target,
        changNameData: changNameData
      }
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
      this.fieldMappingNavData.forEach(table => {
        if (table.sinkObjectName === this.selectRow.sinkObjectName) {
          //当前表
          if (!checkDataType) {
            table.invalid = false
          } else table.invalid = true
        }
      })

      let checkInvalid = false
      let count = 0
      this.fieldMappingNavData.forEach(table => {
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
    //动态样式
    tableRowClassName({ row }) {
      if (row.is_deleted) {
        return 'delete-row'
      }
      return ''
    },
    returnForm() {
      return this.form
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
      if (findOne?.rules) {
        findOne.rules.value?.forEach((el, i) => {
          if (Math.abs(el) === Infinity) {
            findOne.rules.value[i] = el + ''
          }
        })
      }
      return findOne?.rules || ''
    }
  }
}
</script>

<style lang="scss">
.field-mapping {
  .el-table .delete-row {
    background: #f2f2f2;
  }
  .el-table .error-row {
    background: rgba(255, 0, 0, 0.3);
    color: #fff;
  }
  .el-table th {
    background: #f4f5f7;
  }
}
.field-mapping-data-type {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}
</style>
<style scoped lang="scss">
.field-mapping {
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon {
    color: #6dc5e8;
  }
  .icon-error {
    color: red;
  }
  .task-form__text {
    display: inline-block;
    width: 130px;
    text-align: left;
  }
  .task-form-body {
    display: flex;
    flex: 1;
    margin-top: 20px;
    height: 0;
    .task-form-left__ul {
      flex: 1;
      border-top: 1px solid #f2f2f2;
      border-right: 1px solid #f2f2f2;
      overflow-y: auto;
      li {
        // height: 93px;
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        border-bottom: 1px solid #f2f2f2;
        display: flex;
        padding: 16px 0 10px 10px;
        &:hover {
          background: rgba(44, 101, 255, 0.05);
          cursor: pointer;
          border-left: 2px solid #2c65ff;
        }
        &.active {
          background: rgba(44, 101, 255, 0.05);
          border-left: 2px solid #2c65ff;
          cursor: pointer;
        }
        .task-form__img {
          width: 34px;
          height: 50px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .task-form-text-box {
          margin-left: 16px;
          width: 190px;
          .source {
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            line-height: 17px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .target {
            font-size: 12px;
            font-weight: 400;
            color: #ef9868;
            line-height: 17px;
            margin-top: 16px;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .select {
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            line-height: 17px;
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
    }
    .color-darkorange {
      color: darkorange;
    }
    .field-mapping-table__default_value {
      display: inline-block;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 9px;
    }
  }
}
::v-deep {
  .field-maping-table-dialog {
    .table-box {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .table-form {
        width: 56%;
        .el-form-item {
          margin-bottom: 12px;
        }
        .tip {
          padding-left: 40px;
        }
      }
      .table-example {
        width: 36%;
        h3 {
          padding-bottom: 20px;
        }
        p {
          padding-bottom: 10px;
        }
      }
    }
  }
}
</style>
