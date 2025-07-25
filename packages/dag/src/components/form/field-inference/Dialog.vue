<script>
import { metadataInstancesApi } from '@tap/api'
import noData from '@tap/assets/images/noData.png'
import i18n from '@tap/i18n'
import { cloneDeep } from 'lodash-es'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'FieldInferenceDialog',
  props: {
    form: {
      type: Object,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    fieldChangeRules: {
      type: Array,
      default: () => [],
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('dataflow', [
      'activeType',
      'activeNode',
      'nodeById',
      'stateIsReadonly',
    ]),
    ...mapState('dataflow', ['editVersion']),
  },
  data() {
    return {
      ruleForm: {
        visible: false,
        list: [],
        options: [],
      },
      editBtnLoading: false,
      noData,
    }
  },
  watch: {
    visible(v) {
      this.ruleForm.visible = v
      v && this.loadData()
    },
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
        result: { dataType: '', tapType: '' },
      }
    },
    handleAdd(index = 0) {
      this.ruleForm.list.splice(index + 1, 0, this.getItem())
    },
    loadData() {
      this.ruleForm.list = cloneDeep(
        this.fieldChangeRules.filter((t) => t.scope === 'Node'),
      )
    },
    handleCancel() {
      this.loadData()
      this.ruleForm.visible = false
      this.$emit('update:visible', this.ruleForm.visible)
    },
    getSubmitDisabled() {
      return (
        this.readonly ||
        this.ruleForm.list.some((t) => !t.accept || !t.result?.dataType) ||
        JSON.stringify(this.nodeRules) === JSON.stringify(this.ruleForm.list)
      )
    },
    handleUpdate() {
      this.form.setValuesIn('fieldChangeRules', this.ruleForm.list)
      this.ruleForm.visible = false
      const result = [
        ...this.fieldChangeRules.filter((t) => t.scope === 'Field'),
        ...this.ruleForm.list,
      ]
      this.$emit('update:fieldChangeRules', result)
      this.$emit('update:visible', this.ruleForm.visible)
    },
    submit() {
      const { activeNode = {} } = this
      const { list } = this.ruleForm
      if (!list.length) {
        this.handleUpdate()
        return
      }
      const dataTypes = list.map((t) => t.result.dataType)
      const params = {
        databaseType: activeNode.databaseType,
        dataTypes,
      }
      this.editBtnLoading = true
      metadataInstancesApi
        .dataType2TapType(params)
        .then((data) => {
          const result = list.map((t) => {
            const val = data[t.result.dataType]
            t.result.tapType =
              val && val.type !== 7 ? JSON.stringify(val) : null
            return t
          })
          if (result.some((t) => !t.result?.tapType)) {
            this.$message.error(
              i18n.t('packages_form_field_inference_list_geshicuowu'),
            )
            this.editBtnLoading = false
            return
          }
          this.handleUpdate()
          this.$message.success(i18n.t('public_message_operation_success'))
        })
        .finally(() => {
          this.editBtnLoading = false
        })
    },
  },
  emits: ['update:visible', 'update:fieldChangeRules'],
}
</script>

<template>
  <ElDialog
    v-model="ruleForm.visible"
    width="600px"
    append-to-body
    :title="$t('packages_form_field_inference_dialog_mubiaoleixingpi')"
    class="batch-field-type-maping-table-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div v-if="ruleForm.list.length">
      <ElRow>
        <ElCol :span="9">{{
          $t('packages_form_field_inference_dialog_mubiaomorentui')
        }}</ElCol>
        <ElCol :span="3">&nbsp;</ElCol>
        <ElCol :span="9">{{
          $t('packages_form_field_inference_dialog_xiugaihoudelei')
        }}</ElCol>
        <ElCol v-if="!readonly" :span="3" class="text-center">{{
          $t('public_operation')
        }}</ElCol>
      </ElRow>
      <ElRow v-for="(item, index) in ruleForm.list" :key="index" class="mt-4">
        <ElCol :span="9">
          <ElInput
            v-model="item.accept"
            :placeholder="
              $t('packages_form_field_inference_dialog_cankaogeshiv')
            "
            disabled
          />
        </ElCol>
        <ElCol :span="3">
          <div
            class="flex justify-content-center align-items-center"
            style="height: 32px"
          >
            <VIcon size="16" class="color-primary">d-arrow-right</VIcon>
          </div>
        </ElCol>
        <ElCol :span="9" class="flex align-items-center">
          <ElInput
            v-model="item.result.dataType"
            :placeholder="
              $t('packages_form_field_inference_dialog_cankaogeshiv')
            "
            disabled
            class="mr-1"
          />
          <VIcon v-if="item.result.tapType === null" class="color-danger"
            >error</VIcon
          >
          <VIcon
            v-else
            :class="[!item.result.tapType ? 'color-disable' : 'color-success']"
            >success</VIcon
          >
          <!--            <span v-show="item.result.tapType === null" class="color-danger">错误</span>-->
        </ElCol>
        <ElCol v-if="!readonly" :span="3">
          <div
            class="flex justify-content-center align-items-center"
            style="height: 32px"
          >
            <VIcon
              size="16"
              class="cursor-pointer color-primary"
              @click="ruleForm.list.splice(index, 1)"
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
    <div v-else class="flex flex-column align-items-center">
      <img width="120px" :src="noData" />
      <div class="noData">{{ $t('public_data_no_data') }}</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          type="primary"
          :disabled="getSubmitDisabled()"
          :loading="editBtnLoading"
          @click="submit"
          >{{ $t('public_button_confirm') }}</ElButton
        >
      </span>
    </template>
  </ElDialog>
</template>
