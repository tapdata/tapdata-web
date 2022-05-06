<template>
  <div class="field-mapping" v-loading="loadingPage">
    <div class="field-mapping__desc text-start lh-base">
      <strong>{{ $t('task_mapping_table_setting') }}</strong
      >:
      {{ $t('task_mapping_table_setting_tip') }}
      <ElLink type="primary" target="_blank" href="https://www.yuque.com/knbase/tapdata-cloud/mtbmta">{{
        $t('task_mapping_table_setting_tip1')
      }}</ElLink>
      <div class="float-end">
        <ElButton v-if="!readOnly && !targetIsVika && !targetIsQingflow" size="mini" @click="handleChangTableName">{{
          $t('task_mapping_table_rename')
        }}</ElButton>
        <ElButton
          v-if="!readOnly && !targetIsVika && !targetIsQingflow"
          size="mini"
          @click="handleBatchChangeFieldType"
          >{{ $t('task_mapping_table_field_type_change') }}</ElButton
        >
        <ElButton
          v-if="!readOnly && !targetIsVika && !targetIsQingflow"
          size="mini"
          @click="dialogFieldVisible = true"
          >{{ $t('task_mapping_table_field_rename') }}</ElButton
        >
        <ElButton
          v-if="!readOnly && !targetIsVika && !targetIsQingflow"
          class="mr-5"
          size="mini"
          type="primary"
          @click="rollbackAll"
          >{{ $t('task_mapping_table_restore_default') }}</ElButton
        >
      </div>
    </div>
    <div class="task-form-body">
      <div class="flex flex-column">
        <div class="flex mb-5 ml-6">
          <div class="flex">
            <span class="text">
              {{ $t('task_mapping_table_search_table') }}{{ $t('field_mapping_field_mapping_dialog_') }}</span
            >
            <ElInput v-model="searchTable" size="mini" @change="search('table')"></ElInput>
          </div>
        </div>
        <ul class="task-form-left__ul flex-column">
          <li
            v-for="(item, index) in fieldMappingNavData"
            :key="index"
            :class="{ active: position === index }"
            @click.prevent="select(item, index)"
          >
            <div class="task-form__img" v-if="getItemInvalid(item)">
              <img src="../../assets/image/fieldMapping-table-error.png" alt="" />
            </div>
            <div class="task-form__img" v-else>
              <img src="../../assets/image/fieldMapping-table.png" alt="" />
            </div>
            <div class="task-form-text-box">
              <div class="source">{{ item.sourceObjectName }}</div>
              <div class="target">
                <span class="target-span">{{ item.sinkObjectName }}</span>
                <VIcon
                  v-if="!readOnly"
                  class="color-primary ml-2"
                  size="14"
                  @click.stop.prevent="showChangeTableNameModal(item, index)"
                  >edit-outline</VIcon
                >
              </div>
              <div class="select">
                {{
                  `${$t('task_mapping_table_selected')} ${
                    position === index ? fieldCount : item.sinkAvailableFieldCount - item.userDeletedNum
                  }/${item.sinkAvailableFieldCount}`
                }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="main">
        <div class="search mb-5 ml-2">
          <div class="item">
            <span> {{ $t('task_mapping_table_search_field') }}{{ $t('field_mapping_field_mapping_dialog_') }}</span>
            <ElInput v-model="searchField" size="mini" @change="search('field')"></ElInput>
          </div>
          <div class="item ml-5" v-if="!readOnly && !targetIsVika && !targetIsQingflow">
            <ElTooltip effect="dark" :content="$t('task_mapping_table_restore_default_fields')" placement="top-start">
              <ElButton
                size="mini"
                style="padding: 6px 15px"
                @click.stop="rollbackTable(selectRow.sinkObjectName, selectRow.sourceTableId)"
              >
                <VIcon class="color-primary" size="14">rollback</VIcon>
              </ElButton>
            </ElTooltip>
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
          <ElTableColumn
            show-overflow-tooltip
            :label="$t('task_mapping_table_source_table_field')"
            prop="field_name"
            width="150"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.primary_key_position > 0" :show-overflow-tooltip="true"
                >{{ scope.row.field_name }}
                <VIcon size="12" class="color-darkorange">key</VIcon>
              </span>
              <span v-else class="item" :show-overflow-tooltip="true">{{ scope.row.field_name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('task_mapping_table_source_table_type')" prop="data_type"></ElTableColumn>
          <ElTableColumn :label="$t('task_mapping_table_source_table_length')" prop="precision" width="150">
            <template slot-scope="scope">
              <span v-if="scope.row.precision < 0"></span>
              <span v-else>{{ scope.row.precision }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="$t('task_mapping_table_source_table_accuracy')"
            prop="scale"
            width="100"
          ></ElTableColumn>
          <ElTableColumn :label="$t('task_mapping_table_target_table_field')" width="260">
            <template slot-scope="scope">
              <div
                v-if="!scope.row.is_deleted && !hiddenFieldProcess && !readOnly"
                @click="edit(scope.row, 'field_name')"
              >
                <span :show-overflow-tooltip="true" :class="{ 'color-danger': !scope.row.t_field_name }"
                  >{{ scope.row.t_field_name || $t('task_mapping_table_field_name_empty_edit_vika')
                  }}<i class="icon el-icon-edit-outline"></i
                ></span>
              </div>
              <span v-else :show-overflow-tooltip="true">{{ scope.row.t_field_name }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('task_mapping_table_target_type')" width="150">
            <template slot-scope="scope">
              <div
                v-if="!scope.row.is_deleted && !readOnly && !targetIsVika && !targetIsQingflow"
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
          <ElTableColumn :label="$t('task_mapping_table_target_length')" width="150">
            <template slot-scope="scope">
              <div
                v-if="
                  !scope.row.is_deleted &&
                  scope.row.t_isPrecisionEdit &&
                  !readOnly &&
                  !targetIsVika &&
                  !targetIsQingflow
                "
                @click="edit(scope.row, 'precision')"
              >
                <span v-if="scope.row.t_precision < 0"></span>
                <span v-else>{{ scope.row.t_precision }}</span>
                <i class="icon el-icon-edit-outline"></i>
              </div>
              <div v-else>
                <span v-if="scope.row.t_precision < 0"></span>
                <span v-else>{{ scope.row.t_precision }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('task_mapping_table_target_accuracy')" width="100">
            <template slot-scope="scope">
              <div
                v-if="
                  !scope.row.is_deleted && scope.row.t_isScaleEdit && !readOnly && !targetIsVika && !targetIsQingflow
                "
                @click="edit(scope.row, 'scale')"
              >
                <span>{{ scope.row.t_scale }}</span>
                <i class="icon el-icon-edit-outline"></i>
              </div>
              <div v-else>
                <span>{{ scope.row.t_scale }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('list_operation')" width="80" v-if="!hiddenFieldProcess && !readOnly">
            <template slot-scope="scope">
              <div v-if="scope.row.notDataTypeSupport">
                <span>{{ $t('field_mapping_field_mapping_dialog_buZhiChi') }}</span>
              </div>
              <div v-else>
                <ElLink type="primary" v-if="!scope.row.is_deleted" @click="del(scope.row.t_id, true, scope.row)">
                  {{ $t('button_delete') }}
                </ElLink>
                <ElLink type="primary" v-else @click="del(scope.row.t_id, false, scope.row)">
                  {{ $t('task_mapping_table_reduction') }}
                </ElLink>
              </div>
            </template>
          </ElTableColumn>
          <div class="field-mapping-table__empty" slot="empty">
            <i class="el-icon-folder-opened"></i>
            <span v-if="targetIsVika" class="ml-1">{{ $t('task_mapping_table_no_data_vika') }}</span>
            <span v-else-if="targetIsQingflow" class="ml-1">{{ $t('task_mapping_table_no_data_qingflow') }}</span>
            <span v-else class="ml-1">{{ $t('task_mapping_table_no_data') }}</span>
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
      <ElSelect
        v-if="['field_name'].includes(currentOperationType) && (targetIsVika || targetIsQingflow)"
        v-model="editValueType[currentOperationType]"
        filterable
      >
        <ElOption
          v-for="(item, index) in target"
          :label="item.field_name"
          :value="item.field_name"
          :disabled="!!fieldMappingTableData.find(t => t.t_field_name === item.field_name)"
          :key="index"
        ></ElOption>
      </ElSelect>
      <ElInput
        v-model="editValueType[currentOperationType]"
        v-else-if="['field_name'].includes(currentOperationType)"
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
              <div v-if="index === 0">{{ $t('task_mapping_table_length_range') }}</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div
              v-if="item.maxScale && currentOperationType === 'scale' && item.minScale !== item.maxScale"
              style="margin-top: 10px"
            >
              <div>{{ $t('task_mapping_table_accuracy_range') }}</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="['data_type'].includes(currentOperationType)">
        <ElSelect v-model="editValueType[currentOperationType]" filterable @change="initDataType">
          <ElOption
            :label="item.dbType"
            :value="item.dbType"
            v-for="(item, index) in typeMapping"
            :key="index"
          ></ElOption>
        </ElSelect>
        <div class="field-mapping-data-type" v-if="currentTypeRules.length > 0">
          <div v-for="(item, index) in currentTypeRules" :key="item.dbType">
            <div v-if="item.maxPrecision && item.minPrecision !== item.maxPrecision">
              <div v-if="index === 0">{{ $t('task_mapping_table_length_range') }}</div>
              <div>
                {{ `[ ${item.minPrecision} , ${item.maxPrecision} ]` }}
              </div>
            </div>
            <div v-if="item.maxScale && item.minScale !== item.maxScale" style="margin-top: 10px">
              <div>{{ $t('task_mapping_table_accuracy_range') }}</div>
              <div>
                {{ `[ ${item.minScale} , ${item.maxScale} ]` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton @click="handleClose()">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" @click="editSave()">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <ElDialog
      width="800px"
      append-to-body
      :title="$t('task_mapping_batch_change_table_title')"
      custom-class="field-maping-table-dialog"
      :visible.sync="dialogTableVisible"
      :close-on-click-modal="false"
      :before-close="handleTableClose"
    >
      <div class="table-box">
        <ElForm
          :rules="rules"
          ref="fieldForm"
          :model="form"
          label-position="top"
          class="table-form"
          label-width="120px"
        >
          <ElFormItem :label="$t('task_mapping_dialog_table_name_case')">
            <ElSelect size="mini" v-model="form.tableNameTransform">
              <ElOption :label="$t('task_mapping_dialog_constant')" value=""></ElOption>
              <ElOption :label="$t('task_mapping_dialog_to_uppercase')" value="toUpperCase"></ElOption>
              <ElOption :label="$t('task_mapping_dialog_lowercase')" value="toLowerCase"></ElOption>
            </ElSelect>
          </ElFormItem>
          <div class="tip">{{ $t('task_mapping_dialog_rule_note') }}</div>
          <ElFormItem :label="$t('task_mapping_dialog_enter_prefix')" prop="table_prefix">
            <ElInput size="mini" v-model="form.table_prefix" maxlength="50" show-word-limit></ElInput>
          </ElFormItem>
          <div class="tip">
            <span>{{ $t('task_mapping_dialog_english_letter') }}</span>
            <div>{{ $t('task_mapping_dialog_not_allow_system') }}</div>
          </div>
          <ElFormItem :label="$t('task_mapping_dialog_enter_suffix')" prop="table_suffix">
            <ElInput size="mini" v-model="form.table_suffix" maxlength="50" show-word-limit></ElInput>
          </ElFormItem>
          <div class="tip">
            <span>{{ $t('task_mapping_dialog_underscore_begin') }}</span>
          </div>
        </ElForm>
        <div class="table-example">
          <h3>{{ $t('task_mapping_dialog_example') }}:</h3>
          <p>{{ $t('task_mapping_dialog_original_table_name') }}: tableName</p>
          <p>{{ $t('task_mapping_dialog_after_modify') }}: {{ tableName }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleTableClose()">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="handleTableNameSave()">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
    <ElDialog
      width="600px"
      append-to-body
      :title="$t('task_mapping_batch_change_field_title')"
      custom-class="field-maping-table-dialog"
      :visible.sync="dialogFieldVisible"
      :close-on-click-modal="false"
      :before-close="handleFieldClose"
    >
      <div class="table-box">
        <ElForm ref="form" class="table-form" :model="form" label-width="120px">
          <ElFormItem :label="$t('task_mapping_dialog_field_name_case')">
            <ElSelect size="mini" v-model="form.fieldsNameTransform">
              <ElOption :label="$t('task_mapping_dialog_constant')" value=""></ElOption>
              <ElOption :label="$t('task_mapping_dialog_to_uppercase')" value="toUpperCase"></ElOption>
              <ElOption :label="$t('task_mapping_dialog_lowercase')" value="toLowerCase"></ElOption>
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
      width="500px"
      append-to-body
      :title="$t('task_mapping_dialog_rename_a_single_table_title')"
      custom-class="field-maping-table-dialog"
      :visible.sync="changeTableNameForm.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="table-box">
        <ElForm
          :rules="changeTableNameFormRules"
          ref="changeTableNameFormRef"
          :model="changeTableNameForm"
          label-position="top"
          style="width: 100%"
          @submit.prevent.stop
        >
          <ElFormItem props="new">
            <ElInput
              v-model="changeTableNameForm.new"
              size="mini"
              maxlength="50"
              show-word-limit
              class="mb-3"
            ></ElInput>
            <VIcon class="color-primary" size="14">info</VIcon>
            <span>{{ $t('task_mapping_dialog_rename_a_single_table_input_desc') }}</span>
          </ElFormItem>
        </ElForm>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="changeTableNameForm.visible = false">{{ $t('button_cancel') }}</ElButton>
        <ElButton
          size="mini"
          type="primary"
          :disabled="changeTableNameForm.new && changeTableNameForm.old === changeTableNameForm.new"
          @click="handleOneTableNameSave()"
          >{{ $t('button_confirm') }}</ElButton
        >
      </span>
    </ElDialog>
    <!-- vika{{$t('field_mapping_field_mapping_dialog_muLu')}} -->
    <ElDialog
      width="500px"
      append-to-body
      :title="$t('field_mapping_field_mapping_dialog_muLu')"
      custom-class="vika-field-maping-table-dialog"
      :visible.sync="vikaForm.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <ElForm label-position="top" :model="vikaForm" style="width: 100%" @submit.prevent.stop>
          <ElFormItem :label="$t('field_mapping_field_mapping_dialog_muBiao')" props="table" class="mb-0">
            <ElInput
              v-model="vikaForm.table"
              size="mini"
              maxlength="50"
              show-word-limit
              class="mb-3"
              readonly
            ></ElInput>
          </ElFormItem>
        </ElForm>
        <div style="border: 1px solid #ccc">
          <ElTree
            v-loading="this.vikaForm.loading"
            highlight-current
            lazy
            accordion
            check-on-click-node
            ref="vikaTree"
            :props="{
              label: 'name',
              children: 'children',
              isLeaf: 'leaf'
            }"
            :load="loadNode"
            @node-click="vikaNodeClick"
          ></ElTree>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="vikaForm.visible = false">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" :disabled="vikaSaveTableDisabled()" @click="vikaSaveTable()">{{
          $t('button_confirm')
        }}</ElButton>
      </span>
    </ElDialog>
    <!-- {{$t('field_mapping_field_mapping_dialog_piLiangXiuGaiZi')}} -->
    <ElDialog
      width="800px"
      append-to-body
      :title="$t('field_mapping_field_mapping_dialog_piLiangXiuGaiZi')"
      custom-class="batch-field-type-maping-table-dialog"
      :visible.sync="batchFieldTypeForm.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <ElRow>
          <ElCol :span="7">{{ $t('field_mapping_field_mapping_dialog_yuanZiDuanLeiXing') }}</ElCol>
          <ElCol :span="6">{{ $t('field_mapping_field_mapping_dialog_muBiaoZiDuanLei') }}</ElCol>
          <ElCol :span="4">{{ $t('field_mapping_field_mapping_dialog_changDu') }}</ElCol>
          <ElCol :span="4">{{ $t('field_mapping_field_mapping_dialog_jingDu') }}</ElCol>
          <ElCol :span="3">{{ $t('list_operation') }}</ElCol>
        </ElRow>
        <ElRow v-for="(item, index) in batchFieldTypeForm.list" :key="index" class="mt-4">
          <ElCol :span="7" class="flex">
            <ElSelect v-model="item.sourceType" :disabled="item.disabled" filterable required clearable>
              <ElOption
                v-for="(item, index) in typeMappingSource"
                :key="index"
                :label="item.dbType"
                :value="item.dbType"
                :disabled="!!batchFieldTypeForm.list.find(t => t.sourceType === item.dbType)"
              ></ElOption>
            </ElSelect>
            <div class="flex justify-content-center align-items-center px-2" style="height: 32px">
              <VIcon size="14" class="color-primary">d-arrow-right</VIcon>
            </div>
          </ElCol>
          <ElCol :span="6" class="flex pr-2">
            <ElSelect
              v-model="item.targetType"
              filterable
              required
              clearable
              @change="initBatchDataType(arguments[0], item)"
            >
              <ElOption
                v-for="(item, index) in typeMapping"
                :label="item.dbType"
                :value="item.dbType"
                :key="index"
              ></ElOption>
            </ElSelect>
          </ElCol>
          <ElCol :span="4" class="flex pr-2">
            <ElTooltip :content="item.lengthTooltip" :disabled="!item.lengthTooltip" placement="bottom" effect="light">
              <ElInputNumber
                v-model="item.length"
                controls-position="right"
                :disabled="item.lengthDisabled"
                :min="item.minPrecision"
                :max="item.maxPrecision"
              ></ElInputNumber>
            </ElTooltip>
          </ElCol>
          <ElCol :span="4" class="flex pr-2">
            <ElTooltip
              :content="item.precisionTooltip"
              :disabled="!item.precisionTooltip"
              placement="bottom"
              effect="light"
            >
              <ElInputNumber
                v-model="item.precision"
                controls-position="right"
                :disabled="item.precisionDisabled"
                :min="item.minScale"
                :max="item.maxScale"
              ></ElInputNumber>
            </ElTooltip>
          </ElCol>
          <ElCol :span="3" class="flex">
            <div class="flex align-items-center justify-content-center pl-2" style="height: 32px">
              <VIcon size="16" class="cursor-pointer hover-primary" @click="batchFieldTypeForm.list.splice(index, 1)"
                >minus-circle</VIcon
              >
            </div>
          </ElCol>
        </ElRow>
        <div class="mt-4">
          <span
            class="inline-flex align-items-center cursor-pointer"
            @click="fieldTypeChangeAddItem(batchFieldTypeForm.list.length)"
          >
            <VIcon size="16" class="mr-1 cursor-pointer color-primary">plus-circle</VIcon>
            <span class="color-primary">{{ $t('field_mapping_field_mapping_dialog_tianJia') }}</span>
          </span>
        </div>
        <div class="flex align-items-center mt-4">
          <VIcon class="color-primary">info</VIcon>
          <span class="fs-8">{{ $t('task_mapping_dialog_batch_change_field_type_desc') }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="batchFieldTypeFormCancel">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" :disabled="batchFieldTypeFormDisabled()" @click="batchFieldTypeFormSave">{{
          $t('button_confirm')
        }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@/i18n'

import VIcon from '../VIcon'
export default {
  name: 'FieldMapping',
  components: { VIcon },
  props: {
    fieldMappingNavData: Array,
    field_process: Array,
    remoteMethod: Function,
    typeMappingMethod: Function,
    fieldProcessMethod: Function,
    updateMetadata: Function,
    transform: Object,
    hiddenFieldProcess: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    dataSourceModel: {
      type: Object,
      default: () => {}
    },
    customTypeMappings: {
      type: Array,
      default: () => []
    }
  },
  data() {
    var validatePrefix = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!/^[a-zA-Z]([a-zA-Z0-9_\-.])*$/.test(value)) {
        callback(new Error(this.$t('task_mapping_dialog_rule_input')))
      } else if (/^(system).*/.test(value)) {
        callback(new Error(this.$t('task_mapping_dialog_rule_input')))
      } else {
        callback()
      }
    }
    var validateSuffix = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_\-.]*$/.test(value)) {
        callback(new Error(this.$t('task_mapping_dialog_rule_input')))
      } else {
        callback()
      }
    }
    return {
      selectRow: '',
      searchField: '',
      searchTable: '',
      loading: false,
      loadingPage: false,
      sourceTypeMappingCurrent: [],
      targetTypeMappingCurrent: [],
      typeMapping: [],
      typeMappingSource: [],
      currentTypeRules: [],
      defaultFieldMappingNavData: '',
      defaultFieldMappingTableData: '',
      position: 0,
      fieldCount: '', //当前选中总数
      fieldMappingTableData: [],
      dialogVisible: false,
      currentOperationType: '',
      currentOperationData: '',
      target: [],
      editValueType: {
        field_name: '',
        data_type: '',
        precision: '',
        scale: ''
      },
      titleType: {
        field_name: this.$t('task_mapping_dialog_modify_target_field_name'),
        data_type: this.$t('task_mapping_dialog_modify_target_field_type'),
        precision: this.$t('task_mapping_dialog_modify_target_field_length'),
        scale: this.$t('task_mapping_dialog_modify_target_field_accuracy')
      },
      operations: [], //字段操作
      dialogTableVisible: false,
      dialogFieldVisible: false,
      form: {},
      currentForm: {},
      sourceTableName: 'tableName',
      rules: {
        table_prefix: [{ validator: validatePrefix, trigger: 'blur' }],
        table_suffix: [{ validator: validateSuffix, trigger: 'blur' }]
      },
      changeTableNameFormRules: {
        new: [
          { required: true, message: i18n.t('field_mapping_field_mapping_dialog_qingShuRuBiaoMing'), trigger: 'blur' }
        ]
      },
      changeTableNameForm: {
        old: '',
        new: '',
        visible: false
      },
      model: {
        connectionId: '',
        type: 'vika',
        dataBaseType: 'vika',
        tableName: '',
        tableId: '',
        field_process: [],
        isFirst: true,
        vikaNodes: [],
        vika_space_id: '',
        database_host: '',
        plain_password: ''
      },
      vikaForm: {
        visible: false,
        originalTableName: '',
        table: '',
        agentId: '',
        currentNode: {},
        loading: false
      },
      batchFieldTypeForm: {
        visible: false,
        list: [],
        options: []
      }
    }
  },
  destroyed() {
    this.clearWs()
  },
  mounted() {
    if (this.fieldMappingNavData) {
      this.defaultFieldMappingNavData = JSON.parse(JSON.stringify(this.fieldMappingNavData))
      this.selectRow = this.fieldMappingNavData[0]
      this.fieldCount = this.selectRow.sinkAvailableFieldCount - this.selectRow.userDeletedNum || 0
    }
    this.$nextTick(() => {
      if (!this.readOnly && this.transform) {
        this.form = {
          tableNameTransform: this.transform.tableNameTransform || '',
          fieldsNameTransform: this.transform.fieldsNameTransform,
          table_prefix: this.transform.table_prefix,
          table_suffix: this.transform.table_suffix,
          tableOperations: this.transform.tableOperations || [],
          vikaMappings: this.transform.vikaMappings || {},
          qingFlowMappings: this.transform.qingFlowMappings || {}
        }
        this.currentForm = JSON.parse(JSON.stringify(this.form))
        this.loadCustomTypeMappingsData()
      }
    })
    this.updateView()
    if (this.targetIsVika || this.targetIsQingflow) {
      this.loadConnection()
    }
  },
  computed: {
    tableName() {
      let tableName = ''
      if (this.form.tableNameTransform === 'toUpperCase') {
        tableName = (this.form.table_prefix + this.sourceTableName + this.form.table_suffix).toUpperCase()
      } else if (this.form.tableNameTransform === 'toLowerCase') {
        tableName = (this.form.table_prefix + this.sourceTableName + this.form.table_suffix).toLowerCase()
      } else {
        tableName = this.form.table_prefix + this.sourceTableName + this.form.table_suffix
      }
      return tableName
    },
    targetIsVika() {
      return this.dataSourceModel?.target_databaseType === 'vika'
    },
    targetIsQingflow() {
      return this.dataSourceModel?.target_databaseType === 'qingflow'
    }
  },
  methods: {
    //数据处理区域
    /*初始化table数据*/
    initTableData() {
      this.loading = true
      this.$nextTick(() => {
        this.remoteMethod &&
          this.remoteMethod(this.selectRow)
            .then(({ data, target, source }) => {
              this.target = target
              this.fieldMappingTableData = data
              this.sourceTypeMappingCurrent = this.getTypeMapping(source)
              this.targetTypeMappingCurrent = this.getTypeMapping(target)
              this.initShowEdit()
              this.defaultFieldMappingTableData = JSON.parse(JSON.stringify(this.fieldMappingTableData)) //保留一份原始数据 查询用
            })
            .finally(() => {
              this.loading = false
            })
      })
    },
    getTypeMapping(data = []) {
      let result = []
      let obj = {}
      data.forEach(el => {
        if (obj[el.data_type]) {
          obj[el.data_type].precision.push(el.precision)
          obj[el.data_type].scale.push(el.scale)
        } else {
          obj[el.data_type] = {
            dbType: el.data_type,
            precision: [el.precision],
            scale: [el.scale]
          }
        }
      })
      for (let key in obj) {
        let item = obj[key]
        result.push(item)
      }
      return result
    },
    /* 初始化字段类型列表*/
    initTypeMapping() {
      this.$nextTick(() => {
        this.typeMappingMethod &&
          this.typeMappingMethod(this.selectRow).then(({ source, target }) => {
            this.typeMappingSource = source
            this.typeMapping = target
            this.initShowEdit()
          })
      })
    },
    /* 初始化目标字段、长度是否可编辑*/
    initShowEdit() {
      let data = this.fieldMappingTableData
      if (this.fieldMappingTableData?.length === 0) return
      for (let i = 0; i < data.length; i++) {
        let rules = this.typeMapping.filter(v => v.dbType === data[i].t_data_type)
        rules = rules?.[0]?.rules || []
        this.showPrecisionEdit(data[i].t_id, rules)
        this.showScaleEdit(data[i].t_id, rules)
      }
    },
    /*页面刷新 兼容只读模式*/
    updateView(data) {
      //只读模式初始化
      if (data) {
        this.defaultFieldMappingNavData = JSON.parse(JSON.stringify(data))
        this.selectRow = data[0]
        this.fieldCount = this.selectRow.sinkAvailableFieldCount - this.selectRow.userDeletedNum || 0
      }
      this.updateData()
    },
    /*数据重新加载*/
    updateData() {
      this.initTableData()
      this.initTypeMapping()
      this.clearSearch()
      this.operations = []
      this.fieldCount = this.selectRow.sinkAvailableFieldCount - this.selectRow.userDeletedNum || 0
      if (this.field_process?.length > 0) {
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
    updateParentMetaData(type, data) {
      this.loadingPage = true
      this.$nextTick(() => {
        this.updateMetadata &&
          this.updateMetadata(type, data, this.selectRow, this.operations)
            .then(res => {
              this.$emit('update-nav', res)
              this.selectRow = res[this.position]
            })
            .finally(() => {
              this.loadingPage = false
              this.updateView()
            })
      })
    },
    //全局操作区域
    /*打开表改名弹窗*/
    handleChangTableName() {
      this.dialogTableVisible = true
    },
    /*表改名称弹窗取消*/
    handleTableClose() {
      this.dialogTableVisible = false
      this.form.tableNameTransform = this.currentForm.tableNameTransform
      this.form.table_prefix = this.currentForm.table_prefix
      this.form.table_suffix = this.currentForm.table_suffix
    },
    /*单个表改名称弹窗显示*/
    showChangeTableNameModal(item = {}, index) {
      if (this.targetIsVika || this.targetIsQingflow) {
        if (index !== this.position && this.fieldMappingTableData.some(t => !t.t_field_name && !t.is_deleted)) {
          this.$message.error(this.$t('task_mapping_table_field_name_empty_check'))
          return
        }
      }
      this.select(item, index)
      if (this.targetIsVika || this.targetIsQingflow) {
        this.vikaForm.visible = true
        this.vikaForm.table = item.sinkObjectName
        this.vikaForm.originalTableName = item.sourceObjectName
        return
      }
      this.changeTableNameForm.visible = true
      this.changeTableNameForm.old = item.sourceObjectName
      this.changeTableNameForm.new = item.sinkObjectName
    },
    /*字段改名弹窗取消*/
    handleFieldClose() {
      this.dialogFieldVisible = false
      this.form.fieldsNameTransform = this.currentForm.fieldsNameTransform
    },
    /*表改名弹窗保存*/
    handleTableNameSave() {
      this.$refs.fieldForm.validate(valid => {
        if (valid) {
          this.dialogTableVisible = false
          this.copyForm()
          this.updateParentMetaData('table', this.form)
        }
      })
    },
    /*单个表改名弹窗保存*/
    handleOneTableNameSave() {
      this.$refs.changeTableNameFormRef.validate(valid => {
        if (valid) {
          this.changeTableNameForm.visible = false
          let isInclude = false
          this.form.tableOperations.forEach(el => {
            if (el.originalTableName === this.changeTableNameForm.old) {
              el.tableName = this.changeTableNameForm.new
              isInclude = true
            }
          })
          if (!isInclude) {
            this.form.tableOperations.push({
              type: 'rename',
              originalTableName: this.changeTableNameForm.old,
              tableName: this.changeTableNameForm.new
            })
          }
          this.copyForm()
          this.updateParentMetaData('table', this.form)
        }
      })
    },
    /*字段名弹窗保存*/
    handleFieldSave() {
      this.dialogFieldVisible = false
      this.copyForm()
      this.updateParentMetaData('field', this.form)
    },
    /*copy 当前form*/
    copyForm() {
      this.currentForm = JSON.parse(JSON.stringify(this.form))
    },
    /* 恢复默认全部*/
    rollbackAll() {
      this.$confirm(this.$t('task_mapping_dialog_all_restore_defaults'), this.$t('task_mapping_dialog_hint'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.form = {
            tableNameTransform: '',
            fieldsNameTransform: '',
            table_prefix: '',
            table_suffix: '',
            tableOperations: [],
            vikaMappings: {},
            qingFlowMappings: {}
          }
          this.copyForm()
          this.$nextTick(() => {
            this.loadingPage = true
            this.fieldProcessMethod &&
              this.fieldProcessMethod('all')
                .then(data => {
                  this.$emit('update-nav', data)
                  this.selectRow = data[this.position]
                  this.updateData()
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
      if (!this.readOnly) {
        let data = JSON.parse(JSON.stringify(this.target))
        let deleteLen = data.filter(v => !v.is_deleted)
        if (deleteLen.length === 0 && this.target?.length > 0) {
          this.$message.error(this.$t('task_mapping_dialog_delete_all_field_tip'))
          return //所有字段被删除了 不可以保存任务
        }
        if (this.targetIsVika || this.targetIsQingflow) {
          if (index === this.position) {
            return
          }
          if (this.fieldMappingTableData.some(t => !t.t_field_name && !t.is_deleted)) {
            this.$message.error(this.$t('task_mapping_table_field_name_empty_check'))
            return
          }
        }
        this.$emit('row-click', this.selectRow, this.operations, this.target)
      }
      this.position = '' //再次点击清空去一个样式
      this.searchField = ''
      this.fieldCount = 0
      this.selectRow = item
      this.fieldCount = item.sinkAvailableFieldCount - item.userDeletedNum || 0
      this.position = index
      this.updateView()
    },

    //右边table数据区域
    /*
     * 按表搜索 按字段名搜索
     * */
    search(type) {
      if (type === 'table') {
        if (this.searchTable.trim()) {
          this.searchTable = this.searchTable.trim().toString() //去空格
          this.fieldMappingNavData = this.defaultFieldMappingNavData.filter(v => {
            let str = (v.sourceObjectName + '' + v.sinkObjectName).toLowerCase()
            return str.indexOf(this.searchTable.toLowerCase()) > -1
          })
        } else {
          this.fieldMappingNavData = this.defaultFieldMappingNavData
        }
      } else {
        if (this.searchField.trim()) {
          this.searchField = this.searchField.trim().toString() //去空格
          this.fieldMappingTableData = this.defaultFieldMappingTableData.filter(v => {
            let str = (v.field_name + '' + v.t_field_name).toLowerCase()
            return str.indexOf(this.searchField.toLowerCase()) > -1
          })
        } else {
          this.fieldMappingTableData = this.defaultFieldMappingTableData
        }
      }
    },
    /*清空搜索条件*/
    clearSearch() {
      this.searchField = ''
      this.searchTable = ''
    },
    /*恢复默认单表*/
    rollbackTable(name, id) {
      this.$confirm(this.$t('task_mapping_dialog_restore_defaults'), this.$t('task_mapping_dialog_hint'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.loadingPage = true
          this.$nextTick(() => {
            this.fieldProcessMethod &&
              this.fieldProcessMethod('table', name, id)
                .then(data => {
                  this.$emit('update-nav', data)
                  this.selectRow = data[this.position]
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
        // vika 需要更新：字段名、字段类型、长度、精度
        if (this.targetIsVika || this.targetIsQingflow) {
          if (!verify) {
            return
          }
          let findOne = this.target.find(t => t.field_name === value) || {}
          //触发target更新
          this.fieldProcessRenameVika(id, key, value)
          this.updateTableData(id, `t_field_name`, findOne.field_name)
          this.updateTableData(id, `t_data_type`, findOne.data_type)
          this.updateTableData(id, `t_precision`, findOne.precision)
          this.updateTableData(id, `t_scale`, findOne.scale)
          this.checkTable() //消除感叹号
          this.handleClose()
          return
        }
        let option = this.target.filter(v => v.id === id && !v.is_deleted)
        if (option.length === 0) return
        option = option[0]
        //字段名限制
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
          this.$message.error(this.$t('task_mapping_dialog_field_name_restrictions_tip'))
          return
        }
        if (value === option.field_name && !option.is_deleted) {
          this.handleClose() //名字无改变
          return
        }
        let existsName = this.handleExistsName(value, this.currentOperationData?.table_name) //检查是否重名
        if (existsName) {
          return
        }
        let fieldsNameTransform = this.form.fieldsNameTransform
        if (fieldsNameTransform === 'toUpperCase') {
          value = value?.toUpperCase()
        } else if (fieldsNameTransform === 'toLowerCase') {
          value = value?.toLowerCase()
        }
        this.fieldProcessRename(id, key, value)
      } else if (key === 'data_type') {
        let option = this.target.filter(v => v.id === id)
        if (option.length === 0) return
        option = option[0]
        if (value === option.data_type) {
          this.handleClose() //类型无改变
          return
        }
        //如果是改类型 需要手动修改字段的长度以及精度
        this.influences(id, this.currentTypeRules || [])
      } else if (key === 'precision') {
        let isPrecision = this.currentTypeRules.filter(v => v.minPrecision < v.maxPrecision)
        if (isPrecision.length === 0) {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision === r.maxPrecision && value !== r.maxPrecision) {
              this.$message.error(this.$t('task_mapping_dialog_field_range_check'))
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minPrecision < r.maxPrecision) {
              if (r.minPrecision > value || value > r.maxPrecision) {
                verify = false
                this.$message.error(this.$t('task_mapping_dialog_field_range_check'))
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
              this.$message.error(this.$t('task_mapping_dialog_field_range_check'))
              verify = false
            }
          })
        } else {
          this.currentTypeRules.forEach(r => {
            if (r.minScale < r.maxScale) {
              if (r.minScale > value || value > r.maxScale) {
                verify = false
                this.$message.error(this.$t('task_mapping_dialog_field_range_check'))
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
      if (!data || data?.length === 0) {
        this.updateTargetView(id, 'isScaleEdit', false)
      } else {
        let isScale = data.filter(v => v.minScale < v.maxScale)
        if (isScale.length !== 0) {
          //固定值
          this.updateTargetView(id, 'isScaleEdit', true)
        } else {
          this.updateTargetView(id, 'isScaleEdit', false)
        }
      }
    },
    showPrecisionEdit(id, data) {
      if (!data || data?.length === 0) {
        this.updateTargetView(id, 'isPrecisionEdit', false)
      } else {
        let isPrecision = data.filter(v => v.minPrecision < v.maxPrecision)
        if (isPrecision.length !== 0) {
          //固定值
          this.updateTargetView(id, 'isPrecisionEdit', true)
        } else {
          this.updateTargetView(id, 'isPrecisionEdit', false)
        }
      }
    },
    initDataType(val) {
      let target = this.typeMapping.filter(type => type.dbType === val)
      if (target?.length > 0) {
        this.currentTypeRules = target[0]?.rules || []
      } else this.currentTypeRules = '' //清除上一个字段范围
    },
    initBatchDataType(val, item) {
      let { typeMapping, targetTypeMappingCurrent } = this
      let target = Object.assign(
        {},
        targetTypeMappingCurrent.find(type => type.dbType === val) || {},
        typeMapping.find(type => type.dbType === val) || {}
      )
      if (!target) {
        return
      }
      let rule = target.rules[0] || {}
      // 长度
      item.lengthDisabled = rule.minPrecision === undefined || rule.maxPrecision === undefined
      let maxLength = target.precision?.length > 0 ? Math.max(...target.precision) : null
      item.length = maxLength || rule.maxPrecision
      if (!item.lengthDisabled) {
        item.lengthTooltip =
          this.$t('task_mapping_table_length_range') + `[ ${rule.minPrecision} , ${rule.maxPrecision} ]`
      } else {
        item.lengthTooltip = null
      }
      // 精度
      item.precisionDisabled = rule.minScale === undefined || rule.maxScale === undefined
      let maxPrecision = target.scale?.length > 0 ? Math.max(...target.scale) : null
      item.precision = maxPrecision || rule.maxScale
      if (!item.precisionDisabled) {
        item.precisionTooltip = this.$t('task_mapping_table_accuracy_range') + `[ ${rule.minScale} , ${rule.maxScale} ]`
      } else {
        item.precisionTooltip = null
      }
    },
    handleClose() {
      this.dialogVisible = false
      this.currentOperationType = ''
      this.currentOperationData = ''
      this.editValueType = {
        field_name: '',
        data_type: '',
        precision: '',
        scale: ''
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
    //目标任务 字段处理器
    //rename操作
    fieldProcessRenameVika(id, key, value) {
      let option = this.target.find(v => v.field_name === value)
      let findSource = this.fieldMappingTableData.find(v => v.id === id)
      if (!option || !findSource) return
      // if (value === option.original_field_name || option.field) {
      //   this.restRenameVika(id) //用户手动改为最原始的名字
      //   return
      // }
      //rename类型
      let op = this.getFieldProcessItem(id, option, findSource, value, 'RENAME')
      let ops = this.operations.filter(v => v.id === option.id && v.op === 'RENAME')
      if (ops.length === 0) {
        this.operations.push(op)
      } else {
        op = ops[0]
        op.operand = value
        op.label = value
      }
    },
    handleExistsName(value, table_name) {
      // 改名前查找同级中是否重名，若有则return且还原改动并提示
      let exist = false
      let filterData = this.target.filter(v => value === v.field_name && !v.is_deleted && table_name === v.table_name)
      if (filterData.length > 0) {
        this.$message.error(value + this.$t('message_exists_name'))
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
      if (this.targetIsVika || this.targetIsQingflow) {
        option = this.fieldMappingTableData.filter(v => v.t_id === id)
      }
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
      if (this.targetIsVika || this.targetIsQingflow) {
        op.data_type = option.t_data_type
        op.precision = option.t_precision
        op.scale = option.t_scale
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
      let field_process = this.field_process.filter(process => process.table_id === this.selectRow.sourceTableId)
      if (field_process.length > 0) {
        this.operations = field_process[0].operations ? JSON.parse(JSON.stringify(field_process[0].operations)) : []
      }
    },
    restOperation(id) {
      let opr = this.operations.filter(v => v.id === id && v.op === 'RENAME')
      if (opr.length > 0) {
        //元数据-字段操作
        this.updateTarget(id, 't_field_name', opr[0].original_field_name || opr[0].field)
      }
    },
    returnData(hiddenMsg) {
      let result = this.checkTable()
      // 清理多余数据，切换选择table导致的
      let getAllSourceTables = this.fieldMappingNavData.map(t => t.sourceObjectName)
      this.form.tableOperations = this.form.tableOperations.filter(t =>
        getAllSourceTables.includes(t.originalTableName)
      )
      if (this.targetIsQingflow) {
        for (let key in this.form.qingFlowMappings) {
          if (!getAllSourceTables.includes(key)) {
            delete this.form.qingFlowMappings[key]
          }
        }
      } else if (this.targetIsVika) {
        for (let key in this.form.vikaMappings) {
          if (!getAllSourceTables.includes(key)) {
            delete this.form.vikaMappings[key]
          }
        }
      }
      let changNameData = {
        table_prefix: this.form.table_prefix,
        table_suffix: this.form.table_suffix,
        tableNameTransform: this.form.tableNameTransform,
        fieldsNameTransform: this.form.fieldsNameTransform,
        tableOperations: this.form.tableOperations,
        vikaMappings: this.form.vikaMappings,
        qingFlowMappings: this.form.qingFlowMappings
      }
      let flag = (result.checkDataType || result.checkInvalid) && result.noFieldsTable === 0
      if (this.targetIsVika || this.targetIsQingflow) {
        flag = flag || this.fieldMappingTableData.some(t => !t.t_field_name && !t.is_deleted)
      }
      if (flag) {
        if (!hiddenMsg) {
          let arr = this.$t('task_mapping_dialog_field_type_problem').split('XXX')
          let msg = arr[0] + result.count + arr[1]
          this.$message.error(msg)
        }
        return {
          valid: false,
          row: '',
          operations: '',
          target: [],
          changNameData: changNameData
        }
      } else if (result.noFieldsTable > 0) {
        if (!hiddenMsg) {
          let arr = this.$t('task_mapping_dialog_target_no_fields_problem').split('XXX')
          let msg = arr[0] + result.noFieldsTable + arr[1]
          this.$message.error(msg)
        }
        return {
          valid: false,
          row: '',
          operations: '',
          target: [],
          changNameData: changNameData
        }
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
      let checkDataType = this.fieldMappingTableData.some(t => (!t.t_data_type || !t.t_field_name) && !t.is_deleted)
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
      let noFieldsTable = 0
      this.fieldMappingNavData.forEach(table => {
        if (table.sinkAvailableFieldCount === 0) {
          checkInvalid = true
          noFieldsTable += 1
        }
      })
      return {
        checkInvalid: checkInvalid,
        checkDataType: checkDataType,
        count: count,
        noFieldsTable: noFieldsTable
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
    vikaSaveTableDisabled() {
      return !this.vikaForm.table
    },
    vikaSaveTable() {
      let isInclude = false
      this.form.tableOperations.forEach(el => {
        if (el.originalTableName === this.vikaForm.originalTableName) {
          el.tableName = this.vikaForm.table
          isInclude = true
          // 清空字段处理器
          this.$emit('update:field_process', [])
        }
      })
      if (!isInclude) {
        this.form.tableOperations.push({
          type: 'rename',
          originalTableName: this.vikaForm.originalTableName,
          tableName: this.vikaForm.table,
          nodeId: this.vikaForm.currentNode.data.id
        })
      }
      if (this.targetIsQingflow) {
        this.form.qingFlowMappings[this.vikaForm.originalTableName] = {
          appKey: this.vikaForm.currentNode.data.id,
          appName: this.vikaForm.table
        }
      } else {
        this.form.vikaMappings[this.vikaForm.originalTableName] = {
          id: this.vikaForm.currentNode.data.id,
          name: this.vikaForm.table
        }
      }
      this.vikaForm.visible = false
      this.copyForm()
      this.updateParentMetaData('table', this.form)
    },
    fieldTypeChangeSaveTable() {
      this.batchFieldTypeForm.visible = false
    },
    getTreeData(data) {
      let result = JSON.parse(JSON.stringify(data))
      return result.map(t => {
        return Object.assign({}, t, {
          label: t.name
        })
      })
    },
    loadConnection() {
      this.$axios.get('tm/api/Connections/' + this.dataSourceModel.target_connectionId).then(data => {
        if (data) {
          this.model.database_host = data?.database_host
          this.model.plain_password = data?.plain_password
          this.model.connectionId = this.dataSourceModel.target_connectionId
          this.setAgentId(val => {
            this.vikaForm.agentId = val
          })
          if (this.targetIsVika) {
            this.model.vika_space_id = data?.vika_space_id
          } else if (this.targetIsQingflow) {
            this.model.qingFlowTagId = data?.qingFlowTagId
            this.model.qingFlowUserId = data?.qingFlowUserId
          }
        }
      })
    },
    vikaNodeClick(data, node) {
      if (node.isLeaf) {
        this.vikaForm.table = data.name
        this.vikaForm.currentNode = node
      }
    },
    // agentId
    setAgentId(callback) {
      let filter = { where: { status: { $in: ['Running'] } }, size: 10, page: 1, sort: ['createAt desc'] }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(({ items }) => {
        // agentId = items[0]?.tmInfo?.agentId
        callback?.(items[0]?.tmInfo?.agentId)
      })
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        if (this.targetIsQingflow) {
          this.$ws.once('loadQingFlowResult', data => {
            resolve(data.result?.map(t => Object.assign(t, { leaf: true, id: t.appKey, name: t.appName })) || [])
            this.vikaForm.loading = false
          })
          let obj = {
            type: 'pipe',
            receiver: this.vikaForm.agentId,
            data: {
              type: 'loadQingFlow',
              load_type: 'app',
              database_host: this.model.database_host,
              userId: this.model.qingFlowUserId,
              accessToken: this.model.plain_password,
              id: this.model.connectionId
            }
          }
          this.$ws.send(obj)
          this.vikaForm.loading = true
          return
        }
        this.$ws.once('loadVikaResult', data => {
          this.loadRootNode(data, node, resolve)
          this.vikaForm.loading = false
        })
        let obj = {
          type: 'pipe',
          receiver: this.vikaForm.agentId,
          data: {
            type: 'loadVika',
            load_type: 'node',
            space_id: this.model.vika_space_id,
            database_host: this.model.database_host,
            api_token: this.model.plain_password,
            id: this.model.connectionId
          }
        }
        this.$ws.send(obj)
        this.vikaForm.loading = true
        return
      }
      this.$ws.once('loadVikaResult', data => {
        this.setChildNode(data, node, resolve)
      })
      let obj = {
        type: 'pipe',
        receiver: this.vikaForm.agentId,
        data: {
          type: 'loadVika',
          load_type: 'node',
          node_id: node?.data?.id,
          space_id: this.model.vika_space_id,
          database_host: this.model.database_host,
          api_token: this.model.plain_password,
          id: this.model.connectionId
        }
      }
      this.$ws.send(obj)
    },
    loadRootNode(data, node, resolve) {
      //过滤目录结构
      let result = data.result
      result = result.filter(v => v.type === 'Datasheet' || v.type === 'Folder')
      for (let i = 0; i < result.length; i++) {
        if (result[i].type === 'Datasheet') {
          result[i]['leaf'] = true
        } else {
          result[i]['leaf'] = false
        }
      }
      console.log('loadRootNode', result)
      resolve(result)
    },
    setChildNode(data, node, resolve) {
      if (data.status === 'SUCCESS') {
        let children = data?.result.children || []
        children = children.filter(v => v.type === 'Datasheet' || v.type === 'Folder')
        for (let i = 0; i < children.length; i++) {
          if (children[i].type === 'Datasheet') {
            children[i]['leaf'] = true
          } else {
            children[i]['leaf'] = false
          }
        }
        resolve(data?.result.children)
      }
    },
    clearWs() {
      if (!this.$ws) {
        return
      }
      this.$ws.off('loadVikaResult')
      this.$ws.off('loadQingFlowResult')
    },
    fieldTypeChangeAddItem(index = 0) {
      this.batchFieldTypeForm.list.splice(index + 1, 0, this.getBatchFieldTypeItem())
    },
    getBatchFieldTypeItem() {
      return {
        sourceType: '',
        targetType: '',
        precision: undefined,
        length: undefined
      }
    },
    getItemInvalid(item) {
      if (this.targetIsVika || this.targetIsQingflow) {
        return (
          item.invalid ||
          this.fieldMappingTableData.some(
            t => t.table_name === item.sourceObjectName && !t.t_field_name && !t.is_deleted
          )
        )
      }
      return item.invalid
    },
    handleBatchChangeFieldType() {
      this.loadCustomTypeMappingsData()
      let { batchFieldTypeForm } = this
      if (!batchFieldTypeForm.list.length) {
        batchFieldTypeForm.list = [this.getBatchFieldTypeItem()]
      } else {
        batchFieldTypeForm.list.forEach(item => {
          this.initBatchDataType(item.targetType, item)
        })
      }
      batchFieldTypeForm.visible = true
    },
    batchFieldTypeFormCancel() {
      this.loadCustomTypeMappingsData()
      this.batchFieldTypeForm.visible = false
    },
    // 批量修改字段类型
    batchFieldTypeFormSave() {
      this.batchFieldTypeForm.visible = false
      this.batchFieldTypeForm.list.forEach(el => {
        el.disabled = true
      })
      this.updateParentMetaData('customTypeMappings', this.getCustomTypeMappings())
    },
    getCustomTypeMappings() {
      let arr = ['sourceType', 'targetType', 'precision', 'length']
      return this.batchFieldTypeForm.list.map(t => {
        let result = {}
        let obj = t || {}
        for (let key in obj) {
          if (arr.includes(key)) {
            result[key] = obj[key]
          }
        }
        return result
      })
    },
    batchFieldTypeFormDisabled() {
      let flag = false
      flag = !this.batchFieldTypeForm.list.every(t => t.sourceType && t.targetType)
      if (flag) {
        return flag
      }
      let getCustomTypeMappings = this.getCustomTypeMappings()
      flag = JSON.stringify(getCustomTypeMappings) === JSON.stringify(this.customTypeMappings)
      return flag
    },
    loadCustomTypeMappingsData() {
      let arr = JSON.parse(JSON.stringify(this.customTypeMappings)).map(t => Object.assign(t, { disabled: true }))
      this.batchFieldTypeForm.list = arr
    },
    getFieldProcessItem(id = '', target = {}, source = {}, value = '', op = 'RENAME') {
      return {
        op: op,
        id: id,
        field: source.field_name,
        operand: value, //改过名的字段
        table_name: '',
        type: target.data_type,
        primary_key_position: source.primary_key_position,
        label: value,
        original_field_name: source.original_field_name,
        data_type: target.data_type,
        precision: target.precision,
        scale: target.scale
      }
    },
    addOperations() {
      this.operations.push(this.getFieldProcessItem(...arguments))
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
.vika-field-maping-table-dialog {
  .el-form-item__label {
    padding: 0;
  }
}
</style>
<style scoped lang="scss">
.field-mapping {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
  .icon {
    color: #6dc5e8;
  }
  .icon-error {
    color: red;
  }
  .search {
    display: flex;
    justify-content: flex-start;
    text-align: left;
    .item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      span {
        display: inline-block;
        width: 115px;
        text-align: left;
      }
    }
  }
  .text {
    display: inline-block;
    width: 80px;
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
      padding-bottom: 47px;
      li {
        height: 93px;
        background: #ffffff;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        border-bottom: 1px solid #f2f2f2;
        display: flex;
        padding-top: 16px;
        padding-left: 10px;
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
          width: 200px;
          .source {
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            line-height: 17px;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .target {
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 400;
            color: #ef9868;
            line-height: 17px;
            margin-top: 16px;
            text-align: left;
            //overflow: hidden;
            //text-overflow: ellipsis;
            //white-space: nowrap;
            .target-span {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
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
          font-size: 12px;
          line-height: 20px;
          margin-top: 20px;
          color: map-get($fontColor, slight);
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
.hover-primary {
  &:hover {
    color: map-get($color, primary);
  }
}
</style>
