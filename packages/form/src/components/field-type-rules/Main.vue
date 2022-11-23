<template>
  <div>
    <ElLink type="primary" @click="form.visible = true">批量修改字段类型</ElLink>
    <ElDialog
      width="800px"
      append-to-body
      title="规则设置"
      custom-class="batch-field-type-maping-table-dialog"
      :visible.sync="form.visible"
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
        <ElRow v-for="(item, index) in form.list" :key="index" class="mt-4">
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
              <VIcon size="16" class="cursor-pointer hover-primary" @click="form.list.splice(index, 1)"
                >minus-circle</VIcon
              >
            </div>
          </ElCol>
        </ElRow>
        <div class="mt-4">
          <span class="inline-flex align-items-center cursor-pointer" @click="handleAdd(form.list.length)">
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

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion'])
  },

  data() {
    return {
      form: {
        visible: false,
        list: [],
        options: []
      },
      nodeRules: [],
      fieldRules: {}
    }
  },

  mounted() {
    this.loadData()
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
      this.form.list.splice(index + 1, 0, this.getItem())
    },
    loadData() {
      const fieldChangeRules = this.activeNode?.fieldChangeRules || {}
      const { nodeRules = [], fieldRules = {} } = fieldChangeRules
      this.fieldRules = fieldRules
      this.nodeRules = JSON.parse(JSON.stringify(nodeRules))
      this.form.list = JSON.parse(JSON.stringify(nodeRules))
    },
    handleCancel() {
      this.loadData()
      this.form.visible = false
    },
    getSubmitDisabled() {
      return (
        this.form.list.some(t => !t.accept || !t.result?.dataType) ||
        JSON.stringify(this.nodeRules) === JSON.stringify(this.form.list)
      )
    },
    handleUpdate() {
      this.updateNodeProperties({
        id: this.activeNode?.id,
        properties: {
          fieldChangeRules: {
            nodeRules: JSON.parse(JSON.stringify(this.form.list)),
            fieldRules: this.fieldRules
          }
        }
      })
      this.updateDag()
      this.form.visible = false
    },
    submit() {
      const { activeNode = {} } = this
      const { list } = this.form
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
