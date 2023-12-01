<template>
  <ElDialog
    :title="$t('packages_form_field_inference_list_ziduanleixingtiao')"
    append-to-body
    :close-on-click-modal="false"
    v-model="editDataTypeVisible"
    width="35%"
  >
    <ElForm ref="dataTypeForm" label-width="140px" label-position="left" :model="currentData" @submit.prevent>
      <ElRadioGroup v-if="!!originType" v-model="modeType" class="mb-3">
        <ElRadio label="custom">{{ $t('packages_dag_field_inference_list_zidingyitiaozheng') }}</ElRadio>
        <ElRadio label="coefficient">{{ $t('packages_dag_field_inference_list_anxishutiaozheng') }}</ElRadio>
      </ElRadioGroup>
      <template v-if="modeType === 'custom'">
        <ElFormItem :label="$t('packages_form_field_inference_list_tuiyanchudelei')">
          <span>{{ currentData.dataTypeTemp }}</span>
        </ElFormItem>
        <ElFormItem
          :label="$t('packages_form_field_inference_list_yaotiaozhengweide')"
          prop="newDataType"
          :error="currentData.errorMessage"
          inline-message
          required
        >
          <ElAutocomplete
            class="inline-input"
            v-model="currentData.newDataType"
            :fetch-suggestions="querySearch"
            :placeholder="$t('public_input_placeholder')"
            @select="handleAutocomplete"
          ></ElAutocomplete>
        </ElFormItem>
        <div v-if="!hideBatch">
          <ElCheckbox v-model="currentData.useToAll">{{
            $t('packages_form_field_inference_list_duidangqiantuiyan')
          }}</ElCheckbox>
          <div v-show="currentData.useToAll" class="mt-2 color-danger fs-8">
            {{ $t('packages_form_field_inference_list_piliangyingyonghui') }}
          </div>
        </div>
      </template>
      <template v-else>
        <ElFormItem :label="$t('packages_form_field_inference_list_tuiyanchudelei')">
          <span>{{ originType + ' (n)' }}</span>
        </ElFormItem>
        <ElFormItem :label="$t('packages_dag_field_inference_list_anzhaoxishu')">
          <div class="flex align-items-center">
            <span>{{ originType }}</span>
            <span>(</span>
            <ElInputNumber
              v-model="currentData.coefficient"
              controls-position="right"
              :min="0.1"
              class="coefficient-input mx-2"
            ></ElInputNumber>
            <span>* n )</span>
          </div>
        </ElFormItem>
        <div class="flex align-items-center mt-n3 mb-3">
          <VIcon class="color-primary mr-3">info</VIcon>
          <span>{{ $t('packages_dag_field_inference_list_anzhaoxishu_tip') }}</span>
        </div>
      </template>
    </ElForm>
    <template v-slot:footer>
      <span class="dialog-footer">
        <ElButton @click="editDataTypeVisible = false">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" :disabled="!currentData.newDataType" :loading="editBtnLoading" @click="submitEdit">{{
          $t('public_button_confirm')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'
import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'DataTypeDialog',

  props: {
    data: Object,
    activeNode: Object,
    fieldChangeRules: [],
    getDataType: Function,
  },

  data() {
    return {
      editDataTypeVisible: false,
      currentData: {
        changeRuleId: '',
        fieldName: '',
        dataTypeTemp: '',
        dataType: '',
        newDataType: '',
        selectDataType: '',
        useToAll: false,
        errorMessage: '',
        source: {},
        canUseDataTypes: [],
        coefficient: 1,
      },
      editBtnLoading: false,
      rules: [],
      modeType: 'custom',
      originType: '',
    }
  },

  methods: {
    async open(row) {
      const { source = {}, canUseDataTypes = [] } = row || {}
      this.currentData.changeRuleId = row.changeRuleId
      this.currentData.dataType = this.getDataType(row)
      this.currentData.dataTypeTemp = row.dataTypeTemp
      this.currentData.fieldName = row.field_name
      this.currentData.newDataType = this.currentData.dataType
      this.currentData.useToAll = false
      this.currentData.errorMessage = ''
      this.currentData.source = source
      this.currentData.canUseDataTypes = canUseDataTypes
      const findRule = this.fieldChangeRules.find((t) => t.id === this.currentData.changeRuleId)
      this.currentData.selectDataType = findRule?.result?.selectDataType || ''
      this.currentData.coefficient = findRule?.multiple || 1

      const dataTypeCheckMultiple = await metadataInstancesApi.dataTypeCheckMultiple({
        databaseType: this.activeNode.databaseType,
        dataType: this.currentData.dataType,
      })

      let modeType = 'custom'
      if (dataTypeCheckMultiple?.result) {
        this.originType = dataTypeCheckMultiple.originType
        this.fieldChangeRules.forEach((item = {}) => {
          const { namespace = [] } = item
          if (item.type === 'MutiDataType' && item.accept === this.originType) {
            this.currentData.coefficient = item.multiple
            modeType = 'coefficient'
          } else {
            const flag =
              namespace[0] === this.data.nodeId &&
              (namespace.length === 1 ||
                (namespace[1] === this.data.qualified_name && namespace[2] === this.currentData.fieldName))
            if (flag) {
              modeType = 'custom'
            }
          }
        })
      } else {
        this.originType = ''
      }

      this.modeType = modeType
      this.editDataTypeVisible = true
    },

    submitEdit() {
      const { qualified_name, nodeId } = this.data
      const { changeRuleId, fieldName, dataType, dataTypeTemp, newDataType, useToAll, selectDataType, coefficient } =
        this.currentData
      const params = {
        databaseType: this.activeNode.databaseType,
        dataTypes: [newDataType],
      }

      if (this.modeType === 'coefficient') {
        const f = this.findInRulesById(changeRuleId)
        let ruleId = f?.id
        let ruleAccept = f?.accept
        if (f) {
          f.multiple = coefficient
          f.accept = this.originType
          f.result = {
            dataType: `${this.originType}(${coefficient}n)`,
            dataTypeTemp,
          }
          const index = this.rules.findIndex((t) => t.id === ruleId)
          this.rules.splice(index, 1)
          this.rules.push(f)
        } else {
          const op = {
            id: uuid(),
            scope: 'Node',
            namespace: [nodeId],
            type: 'MutiDataType',
            accept: this.originType,
            multiple: coefficient,
            result: {
              dataType: `${this.originType}(${coefficient}n)`,
              dataTypeTemp,
            },
          }
          ruleId = op.id
          ruleAccept = op.accept
          this.rules.push(op)
        }

        this.handleUpdate()
        this.data.fields.find((t) => {
          if (t.dataTypeTemp === ruleAccept) {
            t.changeRuleId = ruleId
          }
        })
        this.$message.success(i18n.t('public_message_operation_success'))
        this.editDataTypeVisible = false
        return
      }

      this.editBtnLoading = true
      this.currentData.errorMessage = ''
      metadataInstancesApi
        .dataType2TapType(params)
        .then((data) => {
          const val = data[newDataType]
          const tapType = val && val.type !== 7 ? JSON.stringify(val) : null
          if (!tapType) {
            this.currentData.errorMessage = i18n.t('packages_form_field_inference_list_geshicuowu')
            this.editBtnLoading = false
            return
          }
          const f = this.findInRulesById(changeRuleId)
          let ruleId = f?.id
          let ruleAccept = f?.accept
          if (f?.scope === 'Field') {
            if (useToAll) {
              let batchRule = this.findNodeRuleByType(f.accept)
              if (batchRule) {
                // 删除节点规则
                this.deleteRuleById(f.id)
                // 修改批量规则
                batchRule.result = {
                  dataType: newDataType,
                  tapType,
                  selectDataType,
                }
                ruleId = batchRule.id
                ruleAccept = newDataType
              } else {
                // 修改规则为批量规则 scope、namespace
                f.scope = 'Node'
                f.namespace = [nodeId]
                f.result = { dataType: newDataType, tapType, selectDataType }
                ruleAccept = newDataType
              }
            } else {
              // 修改字段规则
              f.result = { dataType: newDataType, tapType, selectDataType }
              ruleAccept = newDataType
            }
            const index = this.rules.findIndex((t) => t.id === ruleId)
            this.rules.splice(index, 1)
            this.rules.push(f)
          } else {
            const op = {
              id: uuid(),
              scope: useToAll ? 'Node' : 'Field',
              namespace: useToAll ? [nodeId] : [nodeId, qualified_name, fieldName],
              type: 'DataType',
              accept: dataTypeTemp,
              result: { dataType: newDataType, tapType, selectDataType },
            }
            ruleId = op.id
            ruleAccept = dataTypeTemp
            this.rules.push(op)
          }
          this.handleUpdate()
          this.data.fields.find((t) => {
            if ((useToAll && t.dataTypeTemp === ruleAccept) || t.field_name === fieldName) {
              t.changeRuleId = ruleId
            }
          })
          this.editBtnLoading = false
          this.$message.success(i18n.t('public_message_operation_success'))
          this.editDataTypeVisible = false
        })
        .catch(() => {
          this.editBtnLoading = false
        })
    },

    querySearch(val, cb) {
      cb(
        this.currentData.canUseDataTypes?.map((t) => {
          return { value: t }
        }) || [],
      )
    },

    handleAutocomplete(item) {
      this.currentData.selectDataType = item.value
    },
  },
}
</script>
