<template>
  <div class="field-inference h-100" v-loading="transformLoading">
    <div class="field-inference__main flex h-100">
      <div class="field-inference__nav flex flex-column">
        <ElInput
          v-model="searchTable"
          size="mini"
          :placeholder="$t('packages_form_field_mapping_list_qingshurubiaoming')"
          suffix-icon="el-icon-search"
          clearable
          class="p-2"
          @input="handleSearchTable"
        ></ElInput>
        <div v-loading="navLoading" ref="navList" class="nav-list flex-fill font-color-normal">
          <ul v-if="navList.length">
            <li
              v-for="(item, index) in navList"
              :key="index"
              :class="{ active: position === index }"
              class="flex align-items-center justify-content-between"
              @click="handleSelect(index)"
            >
              <div class="task-form-text-box pl-4 inline-block">
                <OverflowTooltip class="w-100 text-truncate target" :text="item.name" placement="right" />
              </div>
            </li>
          </ul>
          <div v-else class="task-form-left__ul flex flex-column align-items-center">
            <VEmpty></VEmpty>
          </div>
        </div>
        <ElPagination
          small
          class="flex p-2 din-font mx-auto"
          layout="total, prev, slot, next"
          :current-page.sync="page.current"
          :page-size.sync="page.size"
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
      <div class="field-inference__content flex-fill flex flex-column">
        <div class="flex align-items-center p-2">
          <ElInput
            v-model="searchField"
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
          :fieldChangeRules.sync="fieldChangeRules"
          readonly
          :ignore-error="!isTarget"
          class="content__list flex-fill"
          @update-rules="handleUpdateRules"
        ></List>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters, mapState } from 'vuex'
import { debounce, cloneDeep } from 'lodash'

import { VEmpty } from '@tap/component'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import { getCanUseDataTypes, getMatchedDataTypeLevel } from '../../util'
import { mapFieldsData } from '@tap/form'
import mixins from '../form/field-inference/mixins'
import { SchemaFieldList as List } from '../form/field-inference'

export default {
  name: 'MigrateMetaPane',

  components: { OverflowTooltip, List, VEmpty },

  mixins: [mixins],

  props: {
    form: Object,
    isShow: Boolean,
    readOnly: Boolean
  },

  data() {
    return {
      navLoading: false,
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
    ...mapState('dataflow', ['activeNodeId', 'taskSaving', 'transformLoading']),
    ...mapGetters('dataflow', ['activeNode', 'stateIsReadonly']),

    batchRuleCounts() {
      return this.fieldChangeRules.filter(t => t.scope === 'Node').length
    },

    readonly() {
      return this.stateIsReadonly
    },

    isErrorSelect() {
      const { hasPrimaryKey, hasUnionIndex, hasUpdateField } = this.selected || {}
      return !(hasPrimaryKey || hasUnionIndex || hasUpdateField)
    },

    isTarget() {
      const { type, $outputs } = this.activeNode || {}
      return (type === 'database' || type === 'table') && !$outputs.length
    }
  },

  watch: {
    updateExNum(newVal, oldVal) {
      if (oldVal === 1 && newVal === 0) {
        //当前更新异常表全部更新完成
        this.activeClassification = ''
        this.loadData()
      }
    },

    activeNodeId() {
      this.unwatchTaskSaving?.()
      if (this.isShow) {
        if (this.taskSaving) {
          this.loading = true
          // 防止新增节点立刻展示元数据时，task自动保存中，出现的空指针以及空数据
          this.unwatchTaskSaving = this.$watch('taskSaving', () => {
            this.loadData(true)
            this.unwatchTaskSaving()
          })
        } else {
          this.loadData(true)
        }
      }
    },

    isShow(v) {
      if (v) {
        const { height } = this.$refs.navList.getBoundingClientRect()
        this.page.size = Math.max(10, Math.ceil(height / 41))
        this.loadData()
      }
    }
  },

  methods: {
    async loadData(resetSelect = false) {
      this.navLoading = true
      this.fieldChangeRules = this.form.getValuesIn('fieldChangeRules') || []
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
        this.handleSelect()
      } else {
        this.handleSelect(this.position)
      }
      this.navLoading = false
    },

    refresh() {
      this.loadData()
    },

    filterFields() {
      let item = this.navList[this.position]
      let fields = item?.fields
      const findPossibleDataTypes = item?.findPossibleDataTypes || {}
      if (this.searchField) {
        fields = item.fields.filter(t => t.field_name.toLowerCase().includes(this.searchField?.toLowerCase()))
      }
      this.selected = Object.assign({}, item, { fields, findPossibleDataTypes })
      this.updateList = this.updateConditionFieldMap[this.selected.name] || []

      this.selected.fields = mapFieldsData(this.selected).fields
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

    handleUpdateRules(val = []) {
      this.fieldChangeRules = val
      this.handleUpdate()
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
