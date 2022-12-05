<template>
  <div v-loading="loading" class="metadata-list-wrap">
    <List
      ref="table"
      v-bind="$attrs"
      :data="selected"
      :form="form"
      :readonly="stateIsReadonly || !isTarget"
      :fieldChangeRules.sync="fieldChangeRules"
      hide-batch
    ></List>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import List from '@tap/form/src/components/field-inference/List'
import mixins from '@tap/form/src/components/field-inference/mixins.js'

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
        this.selected = items?.[0] || {}
      } catch (e) {
        // catch
      }

      this.loading = false
    },

    loadFieldChangeRules() {
      this.fieldChangeRules = this.form.getValuesIn('fieldChangeRules') || []
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
