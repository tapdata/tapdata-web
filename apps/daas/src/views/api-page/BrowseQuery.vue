<template>
  <el-dialog
    width="900px"
    custom-class="browse_query"
    :before-close="handleClose"
    :title="$t('dataExplorer_query')"
    :close-on-click-modal="false"
    :append-to-body="true"
    v-model="dialogFormVisible"
  >
    <div class="dialog-content">
      <!-- 过滤条件 -->
      <QueryBuild
        v-model:value="condition"
        :fields="fields"
        :max-level="3"
        field-label="text"
        field-value="value"
      ></QueryBuild>
      <div class="browse_button">
        <el-button @click="handleFavorite()" size="mini">
          {{ $t('dataExplorer_add_favorite') }}
        </el-button>
        <!-- <el-button type="primary" @click="search(1)" size="small">
              {{ $t('dataExplorer_query') }}
            </el-button> -->
      </div>
    </div>
    <div class="browse_rows">
      <h3 class="pb-4">{{ $t('dataExplorer_show_column') }}</h3>
      <el-checkbox :indeterminate="isIndeterminate" v-model="showAllColumn" @change="showAllColumns">{{
        $t('role_all_check')
      }}</el-checkbox>
      <div style="margin: 15px 0"></div>
      <el-checkbox-group v-model="selectionRow" @change="handleCheckedFieldChange">
        <el-checkbox
          v-for="item in header.filter(v => v.value !== '__operation' && v.value !== '__tapd8' && v.value !== '_id')"
          :label="item.text"
          :key="item.value"
          >{{ item.text }}</el-checkbox
        >
      </el-checkbox-group>
    </div>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button class="cancel" @click="handleClose()" size="mini">
          {{ $t('button_cancel') }}
        </el-button>
        <el-button type="primary" @click="save()" size="mini">{{ $t('button_confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import QueryBuild from '@/components/QueryBuild'
import { usersApi } from '@tap/api'
export default {
  name: 'BrowseQuery',
  components: { QueryBuild },
  props: {
    fieldData: {
      required: true,
      value: Array
    },
    header: {
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
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.fields.length
      this.fields.forEach(v => {
        if (value.includes(v.value)) {
          v.show = true
        }
      })
      // setTimeout(() => {
      //   this.querysavefn()
      // }, 2000)
    },
    // 保存
    save() {
      this.dialogFormVisible = false
      $emit(this, 'backShowColumn', this.selectionRow, this.condition)
      $emit(this, 'backDialogVisible', false)
    },

    // 收藏
    handleFavorite() {
      this.$prompt('', this.$t('dataExplorer_add_favorite_name'), {
        customClass: 'change-name-prompt',
        inputValue: this.favoriteName
      }).then(flag => {
        if (flag) {
          let exists = false
          usersApi.get().then(data => {
            if (data) {
              let collect = data.favorites.filter(v => v.meta.title === this.favoriteName)
              exists = collect.length > 0
            }
            if (exists) {
              this.$message.error('dataExplorer_exists')
            }
          })
        }
      })
    },
    // 查询条件
    serializationToRestFilter(key, val) {
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          let result = []
          for (let i = 0; i < val.length; i++) result.push(this.serializationToRestFilter(`${key}[${i}]`, val[i]))
          return result.join('&')
        } else {
          let result = []
          for (let name in val) {
            if (name && val.hasOwnProperty(name)) {
              let temp = this.serializationToRestFilter(`${key}[${name}]`, val[name])
              if (temp) result.push(temp)
            }
          }
          return result.join('&')
        }
      } else {
        return `${key}=${typeof val === 'string' ? val.trim() : val}`
      }
    },
    // 关闭弹窗
    handleClose() {
      this.dialogFormVisible = false
      $emit(this, 'backDialogVisible', false)
    }
  },
  emits: ['backShowColumn', 'backDialogVisible']
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
  .browse_rows {
    padding-top: 10px;
  }
  .browse_button {
    padding-top: 10px;
    text-align: right;
  }
}
.change-name-prompt {
  .el-message-box__header {
    padding: 15px 15px 0;
    .el-message-box__title {
      padding-left: 0;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 400;
    }
  }
  .el-message-box__content {
    padding-bottom: 0;
    .el-message-box__input {
      padding-top: 0;
    }
  }
}
</style>
