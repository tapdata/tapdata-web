<template>
  <div>
    <ElDialog
      width="600px"
      append-to-body
      title="目标默认推演类型"
      custom-class="batch-field-type-maping-table-dialog"
      :visible.sync="ruleForm.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <ElRow>
          <ElCol :span="9">目标默认推演类型</ElCol>
          <ElCol :span="3">&nbsp;</ElCol>
          <ElCol :span="9">修改后的类型</ElCol>
          <ElCol :span="3" class="text-center">操作</ElCol>
        </ElRow>
        <ElRow v-for="(item, index) in ruleForm.list" :key="index" class="mt-4">
          <ElCol :span="9">
            <ElInput v-model="item.accept" placeholder="参考格式: varchar(32)"></ElInput>
          </ElCol>
          <ElCol :span="3">
            <div class="flex justify-content-center align-items-center" style="height: 32px">
              <VIcon size="16" class="color-primary">d-arrow-right</VIcon>
            </div>
          </ElCol>
          <ElCol :span="9" class="flex align-items-center">
            <ElInput
              v-model="item.result.dataType"
              placeholder="参考格式: varchar(32)"
              :errormessage="item.result.tapType === null"
              class="mr-1"
            ></ElInput>
            <VIcon v-if="item.result.tapType === null" class="color-danger">error</VIcon>
            <VIcon v-else :class="[!item.result.tapType ? 'color-disable' : 'color-success']">success</VIcon>
            <!--            <span v-show="item.result.tapType === null" class="color-danger">错误</span>-->
          </ElCol>
          <ElCol :span="3">
            <div class="flex justify-content-center align-items-center" style="height: 32px">
              <VIcon size="16" class="cursor-pointer color-primary" @click="ruleForm.list.splice(index, 1)"
                >minus-circle</VIcon
              >
            </div>
          </ElCol>
        </ElRow>
        <!--        <div class="mt-4">-->
        <!--          <span class="inline-flex align-items-center cursor-pointer" @click="handleAdd(ruleForm.list.length)">-->
        <!--            <VIcon size="16" class="mr-1 cursor-pointer color-primary">plus-circle</VIcon>-->
        <!--            <span class="color-primary">添加</span>-->
        <!--          </span>-->
        <!--        </div>-->
        <!--        <div class="flex align-items-center mt-4">-->
        <!--          <VIcon class="color-primary">info</VIcon>-->
        <!--          <span class="fs-8">实际可用长度取决于目标数据库类型定义，请按需设置</span>-->
        <!--        </div>-->
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleCancel">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" :disabled="getSubmitDisabled()" @click="submit">{{
          $t('button_confirm')
        }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'FieldTypeRules',

  props: {
    form: {
      type: Object
    },
    visible: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion'])
  },

  data() {
    return {
      ruleForm: {
        visible: false,
        list: [],
        options: []
      },
      fieldChangeRules: []
    }
  },

  watch: {
    visible(v) {
      this.ruleForm.visible = v
      v && this.loadData()
    }
  },

  methods: {
    ...mapMutations('dataflow', ['updateNodeProperties']),
    ...mapActions('dataflow', ['updateDag']),

    getItem() {
      return {
        scope: 'Node',
        namespace: [this.activeNode?.id],
        type: 'DataType',
        accept: '',
        result: { dataType: '', tapType: '' }
      }
    },
    handleAdd(index = 0) {
      this.ruleForm.list.splice(index + 1, 0, this.getItem())
    },
    loadData() {
      this.fieldChangeRules = this.form.getValuesIn('fieldChangeRules') || []
      this.ruleForm.list = this.fieldChangeRules
    },
    handleCancel() {
      this.loadData()
      this.ruleForm.visible = false
      this.$emit('update:visible', this.ruleForm.visible)
    },
    getSubmitDisabled() {
      return (
        this.ruleForm.list.some(t => !t.accept || !t.result?.dataType) ||
        JSON.stringify(this.nodeRules) === JSON.stringify(this.ruleForm.list)
      )
    },
    handleUpdate() {
      const { fieldChangeRules } = this
      this.form.setValuesIn('fieldChangeRules', JSON.parse(JSON.stringify(fieldChangeRules)))
      this.ruleForm.visible = false
    },
    submit() {
      const { activeNode = {} } = this
      const { list } = this.ruleForm
      if (!list.length) {
        this.handleUpdate()
        return
      }
      const dataTypes = list.map(t => t.result.dataType)
      const params = {
        databaseType: activeNode.databaseType,
        dataTypes
      }
      metadataInstancesApi.dataType2TapType(params).then(data => {
        const result = list.map(t => {
          const val = data[t.result.dataType]
          t.result.tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          return t
        })
        if (result.some(t => !t.result?.tapType)) {
          this.$message.error('存在错误格式')
          return
        }
        this.handleUpdate()
      })
    }
  }
}
</script>
