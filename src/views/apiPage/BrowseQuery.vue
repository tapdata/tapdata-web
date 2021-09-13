<template>
  <el-dialog
    width="900px"
    custom-class="browse_query"
    :before-close="handleClose"
    :title="$t('dataExplorer_query')"
    :close-on-click-modal="false"
    :append-to-body="true"
    :visible.sync="dialogFormVisible"
  >
    <div class="dialog-content">
      <!-- 过滤条件 -->
      <QueryBuild
        v-model="condition"
        :fields="fields"
        :max-level="3"
        field-label="text"
        field-value="value"
      ></QueryBuild>
      <div>
        <el-button type="primary" @click="handleFavorite()" size="small">
          {{ $t('dataExplorer_add_favorite') }}
        </el-button>
        <el-button type="primary" @click="search(1)" size="small">
          {{ $t('dataExplorer_query') }}
        </el-button>
      </div>
    </div>
    <div>
      <h3>{{ $t('dataExplorer_show_column') }}</h3>
      <el-checkbox :indeterminate="isIndeterminate" v-model="showAllColumn" @change="showAllColumns">全选</el-checkbox>
      <div style="margin: 15px 0"></div>
      <el-checkbox-group v-model="selectionRow" @change="handleCheckedFieldChange">
        <el-checkbox v-for="item in fields" :label="item.value" :key="item.value">{{ item.text }}</el-checkbox>
      </el-checkbox-group>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="handleClose()" size="small">
        {{ $t('message.cancel') }}
      </el-button>
      <el-button type="primary" @click="save()" size="small">{{ $t('message.save') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import QueryBuild from '@/components/QueryBuild'
export default {
  name: 'BrowseQuery',
  components: { QueryBuild },
  props: {
    fieldData: {
      required: true,
      value: Array
    },
    conditionData: {
      required: true,
      value: Object
    },
    dialogVisible: {
      required: true,
      value: Boolean
    }
  },
  data() {
    return {
      dialogFormVisible: this.dialogVisible || false,
      condition: null,
      isIndeterminate: true,
      showAllColumn: true,
      selectionRow: []
    }
  },
  created() {
    this.condition = this.conditionData
    console.log('fieldData', this.fieldData)
    this.fieldData.forEach(v => {
      if (v.show) {
        this.selectionRow.push(v.value)
      }
    })
  },
  computed: {
    fields() {
      let _this = this
      let fieldData = _this.fieldData.map(item => {
        if (item) {
          item.field_name = item.alias_name ? item.alias_name + ' ( ' + item.field_name + ' ) ' : item.field_name
          item.javaType = item.data_type || item.javaType
          return item
        }
      })
      return fieldData
    }
  },
  watch: {
    'model.requiredQueryField'() {
      this.handlerQueryField()
    }
  },
  methods: {
    // 全选
    showAllColumns(val) {
      this.selectionRow = val
        ? this.fields.map(item => {
            return item.value
          })
        : []
      this.isIndeterminate = false
      this.fields.forEach(item => (item.show = true))
      // setTimeout(() => {
      //   this.querysavefn()
      // }, 2000)
    },
    // 显示列选中
    handleCheckedFieldChange(value) {
      let checkedCount = value.length
      this.showAllColumn = checkedCount === this.fields.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length
      this.fields.forEach(v => {
        if (value.includes(v.value)) {
          v.show = true
        }
      })
      // setTimeout(() => {
      //   this.querysavefn()
      // }, 2000)
    },

    // 关闭弹窗
    handleClose() {
      this.dialogFormVisible = false
      this.$emit('dialogVisible', false)
    }
  }
}
</script>

<style lang="scss">
.browse_query {
  height: 90%;
  margin: 50px auto 0 !important;
  overflow: hidden;
  .el-dialog__body {
    height: calc(100% - 126px);
    padding: 10px 20px 0;
    overflow-y: auto;
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}
</style>
