<template>
  <div class="field-inference">
    <div class="field-inference__header flex justify-content-end">
      <div v-if="batchRuleCounts" class="flex align-items-center cursor-pointer color-primary" @click="visible = true">
        <VIcon>info</VIcon>
        <span>{{ $t('packages_form_field_inference_main_dangqianyou') }}</span>
        <span class="color-warning px-1 fs-6 fw-bold din-font">{{ batchRuleCounts }}</span>
        <span>{{ $t('packages_form_field_inference_main_ge') }}</span>
        <span>{{ $t('packages_form_field_inference_main_gepiliangxiugai') }}</span>
      </div>
      <ElButton v-if="!readonly" type="text" class="ml-3" @click="rollbackAll">{{
        $t('packages_form_field_inference_main_quanbuhuifumo')
      }}</ElButton>
    </div>
    <div class="field-inference__main flex">
      <div class="field-inference__nav flex flex-column">
        <ElInput
          v-model:value="searchTable"
          size="mini"
          :placeholder="$t('packages_form_field_mapping_list_qingshurubiaoming')"
          suffix-icon="el-icon-search"
          clearable
          class="p-2"
          @input="handleSearchTable"
        ></ElInput>
        <div class="nav-filter__list flex text-center lh-1 mb-2">
          <div
            v-for="(item, index) in tableClassification"
            :key="index"
            class="nav-filter__item flex-fill py-1 cursor-pointer"
            :class="[{ active: activeClassification === item.type }, { none: index && !item.total }]"
            @click="handleTableClass(item.type)"
          >
            <div class="mb-2 text-center">{{ item.title }}</div>
            <span :class="[item.total && item.type ? 'color-danger' : 'color-info']">({{ item.total }})</span>
          </div>
        </div>
        <div v-loading="navLoading" class="nav-list flex-fill font-color-normal">
          <ul v-if="navList.length">
            <li
              v-for="(item, index) in navList"
              :key="index"
              :class="{ active: position === index }"
              class="flex align-items-center justify-content-between"
              @click="handleSelect(index)"
            >
              <div class="task-form-text-box pl-2 inline-block flex-1 min-w-0">
                <OverflowTooltip class="w-100 text-truncate target" :text="item.name" placement="right" />
              </div>
              <!--<ElTooltip
                      v-if="item.matchedDataTypeLevel === 'error'"
                      placement="top"
                      transition="tooltip-fade-in"
                      :content="$t('packages_dag_field_inference_main_gaibiaocunzaibu')"
                      class="mr-1"
                    >
                      <VIcon size="16" class="color-warning">warning</VIcon>
                    </ElTooltip>-->
            </li>
          </ul>
          <div v-else class="task-form-left__ul flex flex-column align-items-center">
            <div class="table__empty_img" style="margin-top: 22%">
              <img style="" :src="noData" />
            </div>
            <div class="noData">{{ $t('public_data_no_data') }}</div>
          </div>
        </div>
        <ElPagination
          small
          class="flex mt-3 p-0 din-font mx-auto"
          layout="total, prev, slot, next"
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          :pager-count="5"
          @current-change="loadData"
        >
          <div class="text-center">
            <span class="page__current" style="min-width: 22px">{{ page.current }}</span>
            <span class="icon-color" style="min-width: 22px">/</span>
            <span class="icon-color" style="min-width: 22px">{{ page.count }}</span>
          </div>
        </ElPagination>
      </div>
      <div v-loading="fieldsLoading" class="field-inference__content flex-fill flex flex-column">
        <div class="px-2">
          <span>{{ $t('packages_dag_nodes_table_gengxintiaojianzi') }}</span>
          <ElTooltip
            transition="tooltip-fade-in"
            :content="$t('packages_dag_field_inference_main_xuanzemorengeng')"
            class="ml-2"
          >
            <VIcon size="16" class="color-primary">info</VIcon>
          </ElTooltip>
          <ElSelect
            v-model:value="updateList"
            :disabled="navLoading"
            size="mini"
            allowCreate
            multiple
            filterable
            :placeholder="$t('public_select_option_default')"
            :class="['update-list-select', { error: isErrorSelect }]"
            @visible-change="handleVisibleChange"
            @remove-tag="handleRemoveTag"
          >
            <ElOption v-for="(fItem, fIndex) in selected.fields" :key="fIndex" :value="fItem.field_name">
              <div class="flex align-center">
                {{ fItem.field_name }}
                <VIcon v-if="fItem.primary_key_position > 0" size="12" class="text-warning ml-1"> key </VIcon>
              </div>
            </ElOption>
          </ElSelect>
        </div>
        <div class="flex align-items-center p-2">
          <ElInput
            v-model:value="searchField"
            :placeholder="$t('packages_form_field_mapping_list_qingshuruziduan')"
            size="mini"
            suffix-icon="el-icon-search"
            clearable
            @input="handleSearchField"
          ></ElInput>
          <ElButton size="mini" plain class="btn-refresh ml-2" @click="refresh">
            <VIcon>refresh</VIcon>
          </ElButton>
        </div>
        <List
          ref="list"
          :data="selected"
          :show-columns="['index', 'field_name', 'data_type', 'operation']"
          v-model:fieldChangeRules="fieldChangeRules"
          :readonly="readonly"
          ignore-error
          class="content__list flex-fill"
          @update-rules="handleUpdateRules"
        ></List>
      </div>
    </div>
    <Dialog
      v-model:visible="visible"
      :form="form"
      v-model:fieldChangeRules="fieldChangeRules"
      :readonly="readonly"
    ></Dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { debounce, cloneDeep } from 'lodash'

import i18n from '@tap/i18n'
import noData from '@tap/assets/images/noData.png'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { metadataInstancesApi } from '@tap/api'

import { getCanUseDataTypes, getMatchedDataTypeLevel } from '../../../util'
import mixins from './mixins'
import List from './List'
import Dialog from './Dialog'

export default {
  name: 'FieldInference',

  components: { OverflowTooltip, List, Dialog },

  mixins: [mixins],

  props: {
    form: Object,
    readOnly: Boolean
  },

  data() {
    return {
      navLoading: false,
      fieldsLoading: false,
      position: 0,
      selected: {},
      navList: [],
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1
      },
      searchTable: '',
      searchField: '',
      visible: false,
      fieldChangeRules: [],
      noData,
      updateList: [],
      updateConditionFieldMap: {},
      activeClassification: '',
      tableClassification: [
        {
          type: '',
          title: i18n.t('packages_dag_field_inference_main_quanbubiao'),
          total: 0
        },
        {
          type: 'updateEx',
          title: i18n.t('packages_dag_field_inference_main_gengxintiaojianyi'),
          total: 0
        },
        {
          type: 'transformEx',
          title: i18n.t('packages_dag_field_inference_main_tuiyanyichang'),
          total: 0
        }
      ],
      transformExNum: 0,
      updateExNum: 0
    }
  },

  computed: {
    ...mapGetters('dataflow', ['stateIsReadonly']),

    batchRuleCounts() {
      return this.fieldChangeRules.filter(t => t.scope === 'Node').length
    },

    readonly() {
      return this.stateIsReadonly
    },

    isErrorSelect() {
      const { hasPrimaryKey, hasUnionIndex, hasUpdateField } = this.selected || {}
      return !(hasPrimaryKey || hasUnionIndex || hasUpdateField)
    }
  },

  mounted() {
    this.activeClassification = this.tableClassification[0].type
    this.loadData()
  },
  watch: {
    updateExNum(newVal, oldVal) {
      if (oldVal === 1 && newVal === 0) {
        //当前更新异常表全部更新完成
        this.activeClassification = ''
        this.loadData()
      }
    }
  },

  methods: {
    async loadData(resetSelect = false) {
      this.navLoading = true
      this.fieldsLoading = true
      // TODO 获取原字段类型
      let rules = this.form.getValuesIn('fieldChangeRules') || []
      if (rules.length) {
        let allTableFields = []
        this.navList.forEach(el => {
          allTableFields.push(...el.fields.filter(t => !!t.changeRuleId))
        })
        rules.forEach(el => {
          const f = allTableFields.find(t => t.changeRuleId === el.id)
          if (f && el.accept !== f.dataTypeTemp) {
            el.accept = f.dataTypeTemp
          }
        })
      }
      this.fieldChangeRules = rules
      this.$refs.list.setRules(this.fieldChangeRules)
      this.updateConditionFieldMap = cloneDeep(this.form.getValuesIn('updateConditionFieldMap') || {})
      const { size, current } = this.page
      const res = await this.getData({
        page: current,
        pageSize: size,
        tableFilter: this.searchTable,
        filterType: this.activeClassification
      })
      const { items, total } = res
      this.updateExNum = res.updateExNum
      this.transformExNum = res.transformExNum
      this.navList = items.map(t => {
        const { fields = [], findPossibleDataTypes = {} } = t
        fields.forEach(el => {
          const { dataTypes = [], lastMatchedDataType = '' } = findPossibleDataTypes[el.field_name] || {}
          el.canUseDataTypes = getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
          el.matchedDataTypeLevel = getMatchedDataTypeLevel(
            el,
            el.canUseDataTypes,
            this.fieldChangeRules,
            findPossibleDataTypes
          )
        })
        t.matchedDataTypeLevel = fields.some(f => f.matchedDataTypeLevel === 'error')
          ? 'error'
          : fields.some(f => f.matchedDataTypeLevel === 'warning')
          ? 'warning'
          : ''
        return t
      })

      this.page.total = total
      this.tableClassification.forEach(el => {
        if (!el.type) {
          el.total = res.wholeNum
        } else {
          el.total = res[el.type + 'Num']
        }
      })
      this.page.count = total ? Math.ceil(total / this.page.size) : 1
      if (resetSelect) {
        this.handleSelect(this.position)
      } else {
        this.handleSelect()
      }
      this.navLoading = false
    },

    refresh() {
      this.loadData()
    },

    async filterFields() {
      this.fieldsLoading = true
      let item = this.navList[this.position]
      let fields = item?.fields
      const findPossibleDataTypes = item?.findPossibleDataTypes || {}
      if (this.searchField) {
        fields = item.fields.filter(t => t.field_name.toLowerCase().includes(this.searchField?.toLowerCase()))
      }
      fields = await this.getCurrentTableFields(item, this.fieldChangeRules)
      this.selected = Object.assign({}, item, { fields, findPossibleDataTypes })
      this.updateList = this.updateConditionFieldMap[this.selected.name] || []
      this.fieldsLoading = false
    },

    handleSelect(index = 0) {
      this.position = index
      this.filterFields()
    },

    rollbackAll() {
      this.$confirm(i18n.t('packages_form_field_inference_main_ninquerenyaoquan'), '', {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (resFlag) {
          this.fieldChangeRules = []
          this.handleUpdate()
          this.$message.success(i18n.t('public_message_operation_success'))
        }
      })
    },

    handleUpdate() {
      this.form.setValuesIn('fieldChangeRules', this.fieldChangeRules)
    },

    handleSearchTable: debounce(function () {
      this.loadData()
    }, 200),

    handleSearchField: debounce(function () {
      this.filterFields()
    }, 200),

    handleTableClass(type) {
      if (this.activeClassification === type) return
      this.activeClassification = type
      this.loadData()
    },

    handleVisibleChange(val) {
      !val && this.handleUpdateList()
    },

    handleRemoveTag: debounce(function () {
      this.handleUpdateList()
    }, 1000),

    handleUpdateList() {
      this.updateConditionFieldMap[this.selected.name] = this.updateList
      this.form.setValuesIn('updateConditionFieldMap', cloneDeep(this.updateConditionFieldMap))
    },

    async handleUpdateRules(val = []) {
      this.fieldChangeRules = val
      this.handleUpdate()
      this.updateSelectedAllFields(await this.getCurrentTableFields(this.selected, val))
    },

    updateSelectedAllFields(fields = []) {
      this.selected.fields.forEach(t => {
        const f = fields.find(el => el.field_name === t.field_name)
        if (f) {
          t.data_type = f.data_type
          t.changeRuleId = f.changeRuleId
        }
      })
    },

    async getCurrentTableFields(item = {}, rules = []) {
      const { qualified_name, nodeId, source = {}, fields = [] } = item
      const { database_type } = source
      const params = {
        rules: rules.filter(t => t.namespace.length === 1 || t.namespace.includes(qualified_name)),
        qualifiedName: qualified_name,
        nodeId,
        databaseType: database_type,
        fields
      }
      const data = (await metadataInstancesApi.multiTransform(params)) || {
        fields: []
      }
      return data.fields.length ? data.fields : fields
    }
  }
}
</script>

<style lang="scss" scoped>
.field-inference__header {
  position: relative;
  z-index: 1;
  height: 30px;
}
.field-inference__main {
  height: 60vh;
  border: 1px solid #f2f2f2;
  border-radius: 4px;
}
.field-inference__nav {
  width: 210px;
  border-right: 1px solid #f2f2f2;
}
.field-inference__content {
  width: 0;
}
.nav-list {
  overflow: hidden auto;
  li {
    background-color: map-get($bgColor, white);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid map-get($borderColor, light);
    border-left: 2px solid transparent;
    &:hover,
    &.active {
      background: map-get($bgColor, disactive);
      cursor: pointer;
      border-left-color: map-get($color, primary);
    }
    .task-form-text-box {
      //width: 140px;
      .target {
        height: 40px;
        line-height: 40px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.table__empty_img {
  width: 80px;
  height: 80px;
  img {
    width: 100%;
    height: 100%;
  }
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
.content__list {
  height: 0;
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
.nav-filter__list {
  background-color: #fafafa;
}
.nav-filter__item {
  &.active {
    background: map-get($bgColor, disactive);
  }
}
.update-list-select {
  &.error {
    ::v-deep {
      .el-input__inner {
        border-color: map-get($color, danger);
      }
    }
  }
}
</style>
