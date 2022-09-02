<template>
  <section class="history-list-wrap">
    <div class="history-head">
      <div>{{ $t('metadata_details_version_currentVersion') }} V{{ currentVersionNum }}</div>
      <div>{{ $t('metadata_details_version_version') }} V{{ versionNum }}</div>
    </div>
    <div class="attributes-table">
      <div class="left-table">
        <el-table border :data="properties" class="table-page-table" height="100%">
          <el-table-column :label="$t('metadata_details_attrName')" prop="key">
            <template slot-scope="scope">
              <div v-if="scope.row.result !== 'del'">
                <span :class="{ activeColor: scope.row.result !== 'eq' }" v-if="!scope.row.isCustom">{{
                  $t('metadata.details.' + scope.row.key)
                }}</span>
                <span :class="{ activeColor: scope.row.result !== 'eq' }" v-else>{{ scope.row.key }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_attrKey')" prop="baseValue"> </el-table-column>
          <el-table-column :label="$t('metadata_details_attrName')" prop="key">
            <template slot-scope="scope">
              <div v-if="scope.row.result !== 'add'">
                <span :class="{ activeColor: scope.row.result !== 'eq' }" v-if="!scope.row.isCustom">{{
                  $t('metadata.details.' + scope.row.key)
                }}</span>
                <span :class="{ activeColor: scope.row.result !== 'eq' }" v-else>{{ scope.row.key }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_attrKey')" prop="compareValue">
            <template slot-scope="scope">
              <span
                :class="{
                  activeColor: scope.row.baseValue != scope.row.compareValue
                }"
              >
                {{ scope.row.compareValue }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="field-table">
        <el-table border :data="fieldsItems" class="table-page-table" height="100%">
          <el-table-column :label="$t('metadata_details_alias')" prop="base_alias_name">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.alias_name_result !== 'eq' }">
                {{ scope.row.base_alias_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_name')" prop="base_field_name">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.field_name_result !== 'eq' }">
                {{ scope.row.base_field_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_data_type')" prop="base_java_type">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.java_type_result !== 'eq' }">
                {{ scope.row.base_java_type }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_precision')" prop="base_precision">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.precision_result !== 'eq' }">
                {{ scope.row.base_precision }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_columnSize')" prop="base_columnSize">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.precision_result !== 'eq' }">
                {{ scope.row.base_columnSize }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_scale')" prop="base_scale">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.scale_result !== 'eq' }">
                {{ scope.row.base_scale }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_autoincrement')" prop="base_autoincrement">
            <template slot-scope="scope">
              <span
                v-if="scope.row.base_autoincrement"
                :class="{
                  checkedActive: scope.row.autoincrement_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_primary_key_position')" prop="base_primary_key_position">
            <template slot-scope="scope">
              <span
                v-if="scope.row.base_primary_key_position"
                :class="{
                  checkedActive: scope.row.primary_key_position_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_foreign_key_position')" prop="base_foreign_key_position">
            <template slot-scope="scope">
              <span
                v-if="scope.row.base_foreign_key_position"
                :class="{
                  checkedActive: scope.row.foreign_key_position_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_is_nullable')" prop="base_is_nullable">
            <template slot-scope="scope">
              <span
                v-if="scope.row.base_is_nullable"
                :class="{
                  checkedActive: scope.row.is_nullable_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_unique')" prop="base_unique">
            <template slot-scope="scope">
              <span
                v-if="scope.row.base_unique"
                :class="{
                  checkedActive: scope.row.unique_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
        </el-table>
        <el-table border :data="fieldsItems" class="table-page-table" height="100%">
          <el-table-column :label="$t('metadata_details_alias')" prop="compare_field_name">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.alias_name_result !== 'eq' }">
                {{ scope.row.compare_alias_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_name')" prop="compare_field_name">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.field_name_result !== 'eq' }">
                {{ scope.row.compare_field_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_data_type')" prop="compare_java_type">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.java_type_result !== 'eq' }">
                {{ scope.row.compare_java_type }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_precision')" prop="compare_precision">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.precision_result !== 'eq' }">
                {{ scope.row.compare_precision }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_columnSize')" prop="compare_columnSize">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.precision_result !== 'eq' }">
                {{ scope.row.compare_columnSize }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_scale')" prop="compare_scale">
            <template slot-scope="scope">
              <span :class="{ activeColor: scope.row.scale_result !== 'eq' }">
                {{ scope.row.compare_scale }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_autoincrement')" prop="compare_autoincrement">
            <template slot-scope="scope">
              <span
                v-if="scope.row.compare_autoincrement"
                :class="{
                  checkedActive: scope.row.autoincrement_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_primary_key_position')" prop="compare_primary_key_position">
            <template slot-scope="scope">
              <span
                v-if="scope.row.compare_primary_key_position"
                :class="{
                  checkedActive: scope.row.primary_key_position_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_foreign_key_position')" prop="compare_foreign_key_position">
            <template slot-scope="scope">
              <span
                v-if="scope.row.compare_foreign_key_position"
                :class="{
                  checkedActive: scope.row.foreign_key_position_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_is_nullable')" prop="compare_is_nullable">
            <template slot-scope="scope">
              <span
                v-if="scope.row.compare_is_nullable"
                :class="{
                  checkedActive: scope.row.is_nullable_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
          <el-table-column :label="$t('metadata_details_unique')" prop="compare_unique">
            <template slot-scope="scope">
              <span
                v-if="scope.row.compare_unique"
                :class="{
                  checkedActive: scope.row.unique_result !== 'eq'
                }"
                >✔</span
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </section>
</template>
<script>
import { metadataInstancesApi } from '@tap/api'
export default {
  components: {
    // TablePage
  },
  props: {
    comparedData: {
      type: Object,
      required: true
    },
    currentVersion: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      properties: [],
      fieldsItems: [],
      versionNum: '',
      currentVersionNum: ''
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    metaType() {
      let metaType = this.searchParams.metaType
      if (metaType) {
        return [metaType]
      } else {
        return this.$route.meta.types || []
      }
    }
  },
  created() {
    this.currentVersionNum = this.currentVersion
    this.versionNum = this.comparedData.version
    this.getData()
  },
  methods: {
    getData() {
      let params = {
        historyVersion: this.comparedData.version
      }
      metadataInstancesApi.compareHistory([this.comparedData.id], { params: params }).then(data => {
        this.properties = data?.properties
        this.fieldsItems = data?.fields

        this.fieldsItems.forEach(tableItem => {
          if (tableItem.base_field_name) {
            tableItem.base_is_nullable = !tableItem.base_is_nullable
          } else {
            tableItem.base_is_nullable = false
          }

          if (tableItem.compare_field_name) {
            tableItem.compare_is_nullable = !tableItem.compare_is_nullable
          } else {
            tableItem.compare_is_nullable = false
          }

          if (tableItem.base_primary_key_position > 0) tableItem.base_primary_key_position = true
          if (tableItem.base_foreign_key_position > 0) tableItem.base_foreign_key_position = true
          if (tableItem.compare_primary_key_position > 0) tableItem.compare_primary_key_position = true
          if (tableItem.compare_foreign_key_position > 0) tableItem.compare_foreign_key_position = true
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.history-list-wrap {
  height: calc(100% - 20px);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .history-head {
    display: flex;
    width: 100%;
    height: 40px;
    line-height: 40px;
    border: 1px solid #ebeef5;
    border-bottom: 0;
    background: rgba(242, 246, 249, 1);
    box-sizing: border-box;
    div {
      flex: 1;
      font-size: 14px;
      color: map-get($fontColor, dark);
      text-align: center;
    }
    div:first-child {
      border-right: 1px solid #ebeef5;
    }
  }
  .attributes-table {
    // display: flex;
    // & > div {
    //   flex: 1;
    // }
    .field-table {
      display: flex;
      .table-page-table {
        flex: 1;
      }
    }
  }
  .activeColor {
    color: red;
  }
  .checkedActive {
    color: red;
  }
}
</style>
<style lang="scss">
.history-list-wrap {
  .table-page-table {
    .el-table__body-wrapper {
      height: auto !important;
    }
    border-bottom: 1px solid #ebeef5;
    td,
    th {
      padding: 3px 0;
    }
    td {
      border-right: 1px solid #ebeef5 !important;
      border-bottom: 1px solid #ebeef5;
      .cell {
        min-height: 23px;
      }
      .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
        border-color: #337dff;
        background-color: #337dff;
      }
      .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
        border-color: #fff;
      }
    }
  }
}
</style>
