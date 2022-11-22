<template>
  <div>
    <span @click="batchFieldTypeForm.visible = true">点击设置</span>
    <ElDialog
      width="800px"
      append-to-body
      title="规则设置"
      custom-class="batch-field-type-maping-table-dialog"
      :visible.sync="batchFieldTypeForm.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <ElRow>
          <ElCol :span="9">源类型</ElCol>
          <ElCol :span="3">&nbsp;</ElCol>
          <ElCol :span="9">目标类型</ElCol>
          <ElCol :span="3" class="text-center">操作</ElCol>
        </ElRow>
        <ElRow v-for="(item, index) in batchFieldTypeForm.list" :key="index" class="mt-4">
          <ElCol :span="9">
            <ElInput v-model="item.accept" :disabled="index !== batchFieldTypeForm.list.length - 1" readonly></ElInput>
          </ElCol>
          <ElCol :span="3">
            <div class="flex justify-content-center align-items-center" style="height: 32px">
              <VIcon size="16" class="color-primary">d-arrow-right</VIcon>
            </div>
          </ElCol>
          <ElCol :span="9">
            <ElInput v-model="item.result"></ElInput>
          </ElCol>
          <ElCol :span="3">
            <div class="flex justify-content-center align-items-center" style="height: 32px">
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
            <span class="color-primary">添加</span>
          </span>
        </div>
        <div class="flex align-items-center mt-4">
          <VIcon class="color-primary">info</VIcon>
          <span class="fs-8">实际可用长度取决于目标数据库类型定义，请按需设置</span>
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
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'Dialog',

  props: ['visible'],

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion']),

    icon() {
      return this.getIcon(this.activeNode)
    },

    showPanel() {
      return this.onlyNode ? this.activeType === 'node' : this.activeType
    }
  },

  data() {
    return {
      dialogVisible: false,
      loadingSave: false,
      columns: [
        {
          label: '序号',
          prop: 'index',
          width: 180
        },
        {
          label: '作用域',
          prop: 'scop',
          width: 180
        },
        {
          label: '初始',
          prop: 'accept',
          width: 180
        },
        {
          label: '结果',
          prop: 'result',
          width: 180
        }
        // {
        //   label: '操作',
        //   prop: 'operation',
        //   slotName: 'operation',
        //   width: 60
        // }
      ],
      list: [
        {
          id: 'id',
          index: 1,
          scop: 'Node',
          namespace: 'nodeId',
          type: 'DataType',
          accept: 'decimal(30,2)',
          result: 'varchar(32)'
        }
      ],
      batchFieldTypeForm: {
        visible: false,
        list: [
          {
            id: 'id',
            index: 1,
            scop: 'Node',
            namespace: 'nodeId',
            type: 'DataType',
            accept: 'decimal(30,2)',
            result: 'varchar(32)'
          }
        ],
        options: []
      }
    }
  },

  mounted() {
    console.log('mounted')
    this.loadCustomTypeMappingsData()
  },

  methods: {
    save() {
      this.loadingSave = true
      this.$refs.fieldMappingList.save(true)
    },
    updateVisible() {
      this.loadingSave = false
      this.$emit('update:visible', false)
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
    getBatchFieldTypeItem() {
      return {
        sourceType: '',
        targetType: '',
        precision: undefined,
        length: undefined
      }
    },
    fieldTypeChangeAddItem(index = 0) {
      this.batchFieldTypeForm.list.splice(index + 1, 0, this.getBatchFieldTypeItem())
    },
    loadCustomTypeMappingsData() {
      console.log('loadCustomTypeMappingsData，恢复数据', this.activeNode)
      const fieldChangeRules = this.activeNode?.changeFieldRules || {}
      const { nodeRules = [], fieldRules = [] } = fieldChangeRules
      // let arr = JSON.parse(JSON.stringify(this.customTypeMappings)).map(t => Object.assign(t, { disabled: true }))
      this.batchFieldTypeForm.list = JSON.parse(JSON.stringify(nodeRules))
    },
    batchFieldTypeFormCancel() {
      this.loadCustomTypeMappingsData()
      this.batchFieldTypeForm.visible = false
    },
    batchFieldTypeFormDisabled() {
      return false
      // let flag = false
      // flag = !this.batchFieldTypeForm.list.every(t => t.sourceType && t.targetType)
      // if (flag) {
      //   return flag
      // }
      // let getCustomTypeMappings = this.getCustomTypeMappings()
      // flag = JSON.stringify(getCustomTypeMappings) === JSON.stringify(this.customTypeMappings)
      // return flag
    },
    batchFieldTypeFormSave() {
      console.log('batchFieldTypeFormSave')
      this.batchFieldTypeForm.visible = false
      this.batchFieldTypeForm.list.forEach(el => {
        el.disabled = true
      })
      // this.updateParentMetaData('customTypeMappings', this.getCustomTypeMappings())
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .field-mapping-table-dialog {
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
