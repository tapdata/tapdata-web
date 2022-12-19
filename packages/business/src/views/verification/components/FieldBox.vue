<template>
  <div class="field-box">
    <div class="setting-item mt-4">
      <label class="item-label">{{ $t('packages_business_verification_indexField') }}: </label>
      <MultiSelection
        v-if="isEdit"
        v-model="item.source.sortColumn"
        class="item-select"
        :class="{ red: !item.source.sortColumn }"
        :options="sourceFields"
        :id="'item-source-' + index"
        @focus="handleFocus"
      ></MultiSelection>
      <span v-else :class="['item-value-text', { 'color-danger': !item.source.sortColumn }]">{{
        item.source.sortColumn || $t('packages_business_statistics_schedule_qingxuanze')
      }}</span>
      <span class="item-icon"></span>
      <MultiSelection
        v-if="isEdit"
        v-model="item.target.sortColumn"
        class="item-select"
        :class="{ red: !item.target.sortColumn }"
        :options="targetFields"
        @focus="handleFocus"
      ></MultiSelection>
      <span v-else :class="['item-value-text', { 'color-danger': !item.target.sortColumn }]">{{
        item.target.sortColumn || $t('packages_business_statistics_schedule_qingxuanze')
      }}</span>
    </div>
    <div v-if="isEdit" class="setting-item align-items-center mt-4">
      <label class="item-label">{{ $t('packages_business_components_fieldbox_daijiaoyanmoxing') }}:</label>
      <ElRadioGroup v-model="item.modeType" :disabled="getModeTypeDisabled(item)" @change="handleChangeModeType">
        <ElRadio label="all">{{ $t('packages_business_components_fieldbox_quanziduan') }}</ElRadio>
        <ElRadio label="custom">{{ $t('packages_business_connections_databaseform_zidingyi') }}</ElRadio>
      </ElRadioGroup>
    </div>
    <div v-if="item.modeType === 'custom' && isEdit" class="mt-4">
      <div>
        <div class="mb-4">
          <ElInput
            class="search-input"
            v-model="keyword"
            prefix-icon="el-icon-search"
            :placeholder="$t('packages_business_components_fieldbox_qingshuruziduan')"
            clearable
          ></ElInput>
        </div>
        <div v-loading="loading" class="position-relative">
          <div class="list-table__header flex justify-content-between">
            <span>{{ $t('packages_business_components_fieldbox_ziduan') }}</span>
            <ElButton type="text" class="ml-4 color-primary" @click="handleAdd">
              <VIcon> plus</VIcon>{{ $t('packages_business_components_fieldbox_tianjiahang') }}</ElButton
            >
          </div>
          <div class="list-table__content" :id="'list-table__content' + index">
            <div
              v-for="(fItem, fIndex) in getFilterList()"
              :key="fIndex"
              class="list-table__line flex mt-3 align-items-center"
            >
              <span class="px-2">{{ fIndex + 1 }}</span>
              <ElSelect
                v-model="fItem.source"
                :class="['flex-fill', { 'empty-data': !fItem.source }]"
                allow-create
                filterable
                class="flex-fill"
                @change="handleChange"
              >
                <ElOption
                  v-for="op in sourceFields"
                  :key="op.field_name + 'source'"
                  :label="op.field_name"
                  :value="op.field_name"
                ></ElOption>
              </ElSelect>
              <ElSelect
                v-model="fItem.target"
                :class="['flex-fill ml-5', { 'empty-data': !fItem.target }]"
                allow-create
                filterable
                @change="handleChange"
              >
                <ElOption
                  v-for="op in targetFields"
                  :key="op.field_name + 'target'"
                  :label="op.field_name"
                  :value="op.field_name"
                ></ElOption>
              </ElSelect>
              <ElButton type="text" class="mx-2 px-2 color-primary" @click="handleDelete(fIndex)">
                <VIcon> delete</VIcon>
              </ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MultiSelection from '../MultiSelection'
import { uuid } from '@tap/shared'
import { TABLE_PARAMS } from './const'
import { cloneDeep } from 'lodash'
import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'FieldBox',

  components: { MultiSelection },

  props: {
    item: {
      type: Object,
      default: () => {
        return this.getItemOptions()
      }
    },
    index: [String, Number],
    editId: String,
    isEdit: {
      type: Boolean,
      default: false
    },
    dynamicSchemaMap: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      keyword: '',
      loading: false,
      list: [],
      sourceFields: [],
      targetFields: []
    }
  },

  watch: {
    sourceSelect(v1, v2) {
      if (v1 !== v2) {
        this.handleFieldList([], this.item)
        this.init()
      }
    },
    targetSelect(v1, v2) {
      if (v1 !== v2) {
        this.handleFieldList([], this.item)
        this.init()
      }
    }
  },

  computed: {
    sourceSelect() {
      return this.item.source.connectionId + this.item.source.table
    },
    targetSelect() {
      return this.item.target.connectionId + this.item.target.table
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    async init() {
      await this.loadFieldsList()
      this.item.modeType === 'custom' && this.loadList()
    },

    loadFieldsList() {
      this.getFieldListOptions()?.sourceNodeId ? this.loadFieldsInNode() : this.loadFields()
    },

    getFieldListOptions() {
      const { item } = this
      let opt = {
        sourceNodeId: item.source.nodeId,
        targetNodeId: item.target.nodeId,
        sourceId: item.source.connectionId,
        targetId: item.target.connectionId,
        sourceTable: item.source.table,
        targetTable: item.target.table
      }
      if (this.taskId) {
        opt.sourceId = opt.sourceId?.split('/')?.[1]
        opt.targetId = opt.targetId?.split('/')?.[1]
      }
      return opt
    },

    getFieldListData() {
      const { item } = this
      return {
        source: item.source.columns,
        target: item.target.columns
      }
    },

    getItemOptions() {
      return {
        id: uuid(),
        source: Object.assign({}, TABLE_PARAMS),
        target: Object.assign({}, TABLE_PARAMS),
        showAdvancedVerification: false,
        script: '', //后台使用 需要拼接function头尾
        webScript: '', //前端使用 用于页面展示
        jsEngineName: 'graal.js',
        modeType: 'all' // 待校验模型的类型
      }
    },

    getModeTypeDisabled(item) {
      return !(item.source.connectionId && item.source.table && item.target.connectionId && item.target.table)
    },

    handleFieldList(data) {
      this.$emit('change', data)
    },

    loadList() {
      const { source, target } = this.getFieldListData()

      if (source?.length) {
        let list = []
        source.forEach((el, i) => {
          list.push({
            source: el,
            target: target[i]
          })
        })
        this.list = list.filter(t => t.source || t.target)
        return
      }

      const sourceFields = this.sourceFields.map(t => t.field_name)
      const targetFields = this.targetFields.map(t => t.field_name)
      let sourceList = cloneDeep(sourceFields)
      let targetList = cloneDeep(targetFields).map(t => {
        return {
          name: t,
          used: false
        }
      })

      let list = sourceList.map((t, i) => {
        let findTarget = targetList.find(tar => tar.name.toLowerCase() === t.toLowerCase())
        let opt = {
          source: t,
          target: ''
        }
        if (findTarget) {
          opt.target = findTarget.name
          findTarget.used = true
        }
        return opt
      })

      targetList
        .filter(t => t.name && !t.used)
        .forEach(el => {
          list.push({
            source: '',
            target: el.name
          })
        })

      this.list = list
      this.handleChange()
    },

    getItem() {
      return {
        source: '',
        target: ''
      }
    },

    handleChange() {
      this.handleFieldList(this.list, this.item)
    },

    handleDelete(index) {
      this.list.splice(index, 1)
      this.handleChange()
    },

    handleAdd() {
      this.list.unshift(this.getItem())
      this.handleChange()
    },

    async loadFields() {
      const { sourceId, targetId, sourceTable, targetTable } = this.getFieldListOptions()

      this.loading = true
      if (sourceId) {
        const params = {
          where: {
            meta_type: 'table',
            sourceType: 'SOURCE',
            original_name: sourceTable,
            'source._id': sourceId
          },
          limit: 1
        }
        const res = await this.getTapTablesApi(params)
        this.sourceFields = Object.values(res.items[0]?.nameFieldMap || {}).map(t => {
          return {
            id: t.id,
            field_name: t.fieldName,
            primary_key_position: t.primaryKeyPosition
          }
        })
      }

      if (targetId) {
        const params = {
          where: {
            meta_type: 'table',
            sourceType: 'SOURCE',
            original_name: targetTable,
            'source._id': targetId
          },
          limit: 1
        }
        const res = await this.getTapTablesApi(params)
        this.targetFields = Object.values(res.items[0]?.nameFieldMap || {}).map(t => {
          return {
            id: t.id,
            field_name: t.fieldName,
            primary_key_position: t.primaryKeyPosition
          }
        })
      }

      this.loading = false
    },

    async loadFieldsInNode() {
      const { sourceNodeId, targetNodeId, sourceTable, targetTable } = this.getFieldListOptions()

      this.loading = true
      if (sourceTable) {
        const params = {
          nodeId: sourceNodeId,
          tableFilter: sourceTable,
          fields: ['original_name', 'fields', 'qualified_name'],
          pageSize: 20
        }
        const res = await this.getNodeSchemaPageApi(params)
        this.sourceFields = (res.items[0]?.fields || []).map(t => {
          return {
            id: t.id,
            field_name: t.field_name,
            primary_key_position: t.primary_key_position
          }
        })
      }

      if (targetTable) {
        const params = {
          nodeId: targetNodeId,
          tableFilter: targetTable,
          fields: ['original_name', 'fields', 'qualified_name'],
          pageSize: 20
        }
        const res = await this.getNodeSchemaPageApi(params)
        this.targetFields = (res.items[0]?.fields || []).map(t => {
          return {
            id: t.id,
            field_name: t.field_name,
            primary_key_position: t.primary_key_position
          }
        })
      }

      this.loading = false
    },

    getTapTablesApi(params) {
      return metadataInstancesApi.tapTables({
        filter: JSON.stringify(params)
      })
    },

    getNodeSchemaPageApi(params) {
      return metadataInstancesApi.nodeSchemaPage(params)
    },

    getFilterList() {
      const { keyword } = this
      return this.list.filter(t => (t.source + t.target).includes(keyword))
    },

    handleChangeModeType(val) {
      if (val === 'custom') this.init()
    },

    handleFocus() {
      if (!this.sourceFields.length || !this.targetFields.length) {
        this.init()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-item {
  display: flex;
  margin-bottom: 0;
  .el-form-item__content {
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .item-label {
    width: 80px;
    line-height: 32px;
    text-align: left;
  }
  .item-icon {
    margin: 0 10px;
    width: 80px;
    line-height: 32px;
    color: map-get($fontColor, light);
    font-size: 16px;
    text-align: center;
  }
  .item-time-picker,
  .item-input,
  .item-select,
  .item-filter {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-filter-body {
    padding: 16px;
    background: map-get($fontColor, normal);
    border-radius: 2px;
    color: map-get($fontColor, slight);
    .filter-example-label {
      margin-top: 8px;
      color: #bfd0ff;
      line-height: 17px;
    }
    .filter-example {
      margin-top: 8px;
      padding: 8px;
      line-height: 30px;
      background: #262838;
      color: #82b290;
    }
  }
  .item-value-text {
    flex: 1;
    line-height: 32px;
    padding: 0 16px;
  }
  .item-script {
    margin: 0;
    padding: 16px 24px;
    width: 100%;
    max-height: 130px;
    overflow: auto;
    border-radius: 5px;
    border-left: 5px solid map-get($color, primary);
    background: #eff1f4;
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.6);
    line-height: 17px;
  }
}
.search-input {
  width: 350px;
}
.list-table__content {
  max-height: 300px;
  overflow-y: auto;
}
.list-table__header {
  padding-left: 40px;
  padding-right: 16px;
  line-height: 32px;
  background: #fafafa;
}
.el-select {
  &.empty-data {
    ::v-deep {
      .el-input__inner {
        border-color: #d44d4d;
      }
    }
  }
}
</style>
