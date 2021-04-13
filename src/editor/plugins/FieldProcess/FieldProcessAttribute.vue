<template>
  <div class="nodeStyle">
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form class="e-form" label-position="top" label-width="130px" :model="model" :disabled="disabled" ref="form">
        <el-form-item :required="true" :label="$t('editor.cell.processor.field.form.name.label')" size="mini">
          <el-input
            v-model="model.name"
            class="form-item-width"
            :placeholder="$t('editor.cell.processor.field.form.name.placeholder')"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="schema-editor-container">
        <div class="schema-editor-wrap schema-editor-container-left">
          <schema-editor
            ref="entity"
            :originalSchemaFiled="model.originalSchema"
            :originalSchema="convertSchemaToTreeData(model.originalSchema)"
            :schema="convertSchemaToTreeData(schema)"
            :editable="true"
            :disabledMode="disabled"
            :showUndefined="showUndefined"
          ></schema-editor>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SchemaEditor from './SchemaEditor'
import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from '../../util/Schema'
import log from '../../../log'
import _ from 'lodash'
import { getFieldsIds, handleOperation, getUrlSearch } from './util'
// let editorMonitor = null;
export default {
  name: 'FieldProcess',
  components: { SchemaEditor },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    }
  },

  data() {
    return {
      disabled: false,
      showUndefined: false,
      databases: [],

      model: {
        operations: [],
        scripts: [],
        description: '',
        name: 'Field Process',
        type: 'field_processor',
        originalSchema: '',
        keep: true
      },
      schema: null
    }
  },

  async mounted() {
    this.$refs.entity.$on('dataChanged', (model) => {
      log('FieldProcess.SchemaEditor.dataChanged', model)
      this.model.operations = model.operations
      this.model.scripts = model.scripts
    })
  },

  methods: {
    convertSchemaToTreeData,
    setData(data, cell) {
      if (data) {
        //模型改变 数据的兼容处理
        Object.keys(data).forEach((key) => (this.model[key] = data[key]))
      }
      this.model.originalSchema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema())
      cell.on('change:outputSchema', () => {
        this.model.originalSchema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema())
        let schema = _.cloneDeep(this.model.originalSchema)
        this.schema = cell.mergeOutputSchema(schema, false)
      })
      let schema = _.cloneDeep(this.model.originalSchema)
      let isMoniting = getUrlSearch('isMoniting') || false
      if (!isMoniting) {
        let ids = getFieldsIds(schema.fields) || []
        //先检车schema是否无ID属性
        if (ids || ids.length > 0) {
          ids.forEach((id) => {
            if (!id) {
              this.showUndefined = true
            }
          })
        }
      }
      // apply operations to schema
      if (this.model.originalSchema && schema && schema.fields) {
        //查找是否有被删除的字段且operation有操作
        let temporary = handleOperation(this.model.originalSchema.fields, _.cloneDeep(this.model.operations))
        this.$refs.entity.setOriginalOperations(this.model.operations)
        this.$refs.entity.setOperations(_.cloneDeep(temporary))
        this.$refs.entity.setScripts(_.cloneDeep(this.model.scripts))

        this.schema = cell.mergeOutputSchema(schema, false)
        log('FieldProcess.setData.applyOperations', this.model.originalSchema, this.schema, this.model.operations)
      }
      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      return _.cloneDeep(this.model)
    },

    setDisabled(disabled) {
      this.disabled = disabled
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>
