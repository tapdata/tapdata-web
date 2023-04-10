<template>
  <div v-loading="loading" class="metadata-list-wrap">
    <List
      ref="table"
      v-bind="$attrs"
      :data="selected"
      :readonly="stateIsReadonly || !isTarget"
      :fieldChangeRules.sync="fieldChangeRules"
      :type="isTarget ? 'target' : isSource ? 'source' : ''"
      hide-batch
      @update-rules="handleUpdateRules"
    ></List>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import List from './form/field-inference/List'
import mixins from './form/field-inference/mixins.js'
import { getCanUseDataTypes, getMatchedDataTypeLevel, errorFiledType } from '@tap/dag/src/util'

export default {
  name: 'MetaPane',

  components: { List },

  mixins: [mixins],

  props: {
    isShow: Boolean,
    form: Object
  },

  data() {
    return {
      selected: {},
      tableData: [],
      loading: false,
      data: '',
      fieldChangeRules: []
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'taskSaving', 'transformLoading']),
    ...mapGetters('dataflow', ['activeNode', 'stateIsReadonly']),

    showLoading() {
      return this.loading
    },

    isSource() {
      const { type, $inputs } = this.activeNode || {}
      return (type === 'database' || type === 'table') && !$inputs.length
    },

    isTarget() {
      const { type, $outputs } = this.activeNode || {}
      return (type === 'database' || type === 'table') && !$outputs.length
    }
  },

  watch: {
    activeNodeId() {
      this.unwatchTaskSaving?.()
      if (this.isShow) {
        if (this.taskSaving) {
          this.loading = true
          // 防止新增节点立刻展示元数据时，task自动保存中，出现的空指针以及空数据
          this.unwatchTaskSaving = this.$watch('taskSaving', () => {
            this.loadFields()
            this.unwatchTaskSaving()
          })
        } else {
          this.loadFields()
        }
      }
    },
    // 推演加载完成后，主动请求最新模型
    transformLoading(v) {
      if (!v && this.isShow) {
        this.loadFields()
      }
    },

    isShow(v) {
      if (v) {
        this.loadFields()
      }
    }
  },

  methods: {
    async loadFields() {
      this.$refs.table?.doLayout()
      this.loading = true
      this.loadFieldChangeRules()
      try {
        const { items } = await this.getData()
        this.selected =
          items.map(t => {
            const { fields = [], findPossibleDataTypes = {} } = t
            //如果findPossibleDataTypes = {}，不做类型校验
            if (this.isTarget) {
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
            } else {
              // 源节点 JSON.parse('{\"type\":7}').type==7
              fields.forEach(el => {
                const { dataTypes = [], lastMatchedDataType = '' } = findPossibleDataTypes[el.field_name] || {}
                el.canUseDataTypes = getCanUseDataTypes(dataTypes, lastMatchedDataType) || []
                el.matchedDataTypeLevel = errorFiledType(el)
              })
            }
            return t
          })?.[0] || {}
      } catch (e) {
        // catch
      }

      this.loading = false
    },

    loadFieldChangeRules() {
      this.fieldChangeRules = this.form.getValuesIn('fieldChangeRules') || []
      this.$refs.table.setRules(this.fieldChangeRules)
    },

    handleUpdateRules(val = []) {
      this.fieldChangeRules = val
      this.form?.setValuesIn?.('fieldChangeRules', this.fieldChangeRules)
    }
  }
}
</script>

<style lang="scss" scoped>
.metadata-list-wrap {
  height: 100%;
  overflow: auto;
}
</style>
