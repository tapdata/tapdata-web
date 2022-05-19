<template>
  <el-dialog
    title="编辑推演结果"
    :visible.sync="visible"
    width="70%"
    append-to-body
    custom-class="database-filed-mapping-dialog"
    :close-on-click-modal="false"
  >
    <div class="field-mapping flex flex-column">
      <div class="task-form-body">
        <div class="task-form-left flex flex-column">
          <div class="flex mb-2">
            <div class="flex">
              <ElInput
                v-model="searchTable"
                size="mini"
                placeholder="请输入表名"
                suffix-icon="el-icon-search"
                clearable
              ></ElInput>
            </div>
          </div>
          <ul class="task-form-left__ul flex flex-column">
            <li
              v-for="(item, index) in navData"
              :key="index"
              :class="{ active: position === index }"
              @click.prevent="select(item, index)"
            >
              <div class="task-form__img" v-if="item.invalid">
                <img src="web-core/assets/images/fieldMapping-table-error.png" alt="" />
              </div>
              <div class="task-form__img" v-else>
                <img src="web-core/assets/images/fieldMapping-table.png" alt="" />
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
            @current-change="getMetadataTransformer"
          >
          </ElPagination>
        </div>
        <div class="main">
          <div class="flex mb-2 ml-2 text-start">
            <div class="flex align-items-center">
              <ElInput
                v-model="searchField"
                size="mini"
                placeholder="请输入字段名"
                suffix-icon="el-icon-search"
                @input="getMetadataTransformer(searchField)"
              ></ElInput>
            </div>
            <div class="item ml-2">
              <ElButton plain class="btn-refresh" @click="getMetadataTransformer">
                <VIcon class="text-primary">refresh</VIcon>
              </ElButton>
              <ElButton type="text" @click="getMetadataTransformer"> 重置 </ElButton>
            </div>
          </div>
          <ElTable class="field-mapping-table table-border" height="100%" border :data="target">
            <ElTableColumn show-overflow-tooltip :label="$t('dag_dialog_field_mapping_source_field')" prop="field_name">
              <template #default="{ row }">
                <span v-if="row.primary_key_position > 0" :show-overflow-tooltip="true"
                  >{{ row.field_name }}
                  <VIcon size="12" class="color-darkorange">key</VIcon>
                </span>
                <span v-else class="item" :show-overflow-tooltip="true">{{ row.field_name }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('dag_dialog_field_mapping_source_type')" prop="data_type">
              <template #default="{ row }">
                <div class="cursor-pointer" v-if="!row.is_deleted" @click="edit(row, 'data_type')">
                  <span>{{ row.data_type }}</span>
                  <i v-if="!row.data_type" class="icon-error el-icon-warning"></i>
                  <i class="icon el-icon-arrow-down"></i>
                </div>
                <div v-else>
                  <span>{{ row.data_type }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('dag_dialog_field_mapping_source_precision')" prop="precision">
              <template #default="{ row }">
                <div
                  class="cursor-pointer"
                  v-if="!row.is_deleted && row.isPrecisionEdit"
                  @click="edit(row, 'precision')"
                >
                  <span>{{ row.precision }}</span>
                  <i class="icon el-icon-edit-outline"></i>
                </div>
                <div v-else>
                  <span>{{ row.precision === -1 ? '' : row.precision }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('dag_dialog_field_mapping_source_scale')" prop="scale">
              <template #default="{ row }">
                <div class="cursor-pointer" v-if="!row.is_deleted && row.isScaleEdit" @click="edit(row, 'scale')">
                  <span>{{ row.scale }}</span>
                  <i class="icon el-icon-edit-outline"></i>
                </div>
                <div v-else>
                  <span>{{ row.scale }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="$t('meta_table_default')" prop="default_value">
              <template #default="{ row }">
                <div class="cursor-pointer" @click="edit(row, 'default_value')">
                  <span class="field-mapping-table__default_value">{{ row.default_value }}</span>
                  <i class="icon el-icon-edit-outline"></i>
                </div>
              </template>
            </ElTableColumn>
            <div class="field-mapping-table__empty" slot="empty">
              <i class="el-icon-folder-opened"></i>
              <span class="ml-1">{{ $t('dag_dialog_field_mapping_no_data') }}</span>
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
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import rollback from 'web-core/assets/icons/svg/rollback.svg'
import refresh from 'web-core/assets/icons/svg/refresh.svg'
import { TypeMapping } from '@tap/api'
const typeMappingApi = new TypeMapping()

export default {
  name: 'Dialog',
  components: { VIcon },
  props: ['target', 'navData', 'visible'],
  data() {
    return {
      searchTable: '',
      searchField: '',
      page: {
        size: 10,
        current: 1,
        total: 0
      },
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
        field_name: this.$t('dag_dialog_field_mapping_tittle_field_name'),
        data_type: this.$t('dag_dialog_field_mapping_tittle_data_type'),
        precision: this.$t('dag_dialog_field_mapping_tittle_precision'),
        scale: this.$t('dag_dialog_field_mapping_tittle_scale'),
        default_value: this.$t('dag_dialog_field_mapping_tittle_value')
      },
      typeMapping: [],
      dialogVisible: false,
      rollback,
      refresh
    }
  },
  mounted() {
    this.selectRow = this.navData?.[0] || ''
    this.getTypeMapping(this.selectRow)
  },
  methods: {
    getMetadataTransformer() {},
    //获取typeMapping
    getTypeMapping(row) {
      typeMappingApi.dataType(row.sinkDbType).then(res => {
        this.typeMapping = res.data
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
        this.influences(id, this.currentTypeRules || [])
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
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    min-width: 32px;
    font-size: 16px;
    &:hover,
    &.is-plain:focus:hover {
      border-color: map-get($color, primary);
      background-color: map-get($color, disable);
    }
  }
  .task-form-body {
    display: flex;
    flex: 1;
    height: 0;
    min-height: 350px;
    .task-form-left__ul {
      flex: 1;
      border-top: 1px solid #f2f2f2;
      border-right: 1px solid #f2f2f2;
      max-width: 190px;
      overflow-x: hidden;
      overflow-y: auto;
      li {
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
            line-height: 10px;
            margin-top: 13px;
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
