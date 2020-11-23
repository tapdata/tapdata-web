<template>
	<div class="nodeStyle">
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div>
			<el-form
				class="e-form"
				label-position="top"
				label-width="130px"
				:model="model"
				:disabled="disabled"
				ref="form"
			>
				<el-form-item :required="true" :label="$t('editor.cell.processor.field.form.name.label')" size="mini">
					<el-input
						v-model="model.name"
						class="form-item-width"
						:placeholder="$t('editor.cell.processor.field.form.name.placeholder')"
					></el-input>
				</el-form-item>
				<!--			<el-form-item :label="$t('editor.cell.processor.field.form.description.label')">-->
				<!--				<el-input-->
				<!--					type="textarea"-->
				<!--					v-model="model.description"-->
				<!--					:placeholder="$t('editor.cell.processor.field.form.description.placeholder')"-->
				<!--				></el-input>-->
				<!--			</el-form-item>-->
			</el-form>
			<div class="schema-editor-container">
				<div class="schema-editor-wrap schema-editor-container-left">
					<schema-editor
						ref="entity"
						:originalSchema="convertSchemaToTreeData(originalSchema)"
						:schema="convertSchemaToTreeData(schema)"
						:editable="true"
						:disabledMode="disabled"
					></schema-editor>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import SchemaEditor from './SchemaEditor';
import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema, uuid } from '../../util/Schema';
import log from '../../../log';
import _ from 'lodash';
let editorMonitor = null;
export default {
	name: 'FieldProcess',
	components: { SchemaEditor },

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	data() {
		return {
			disabled: false,
			databases: [],

			model: {
				operations: [],
				scripts: [],
				description: '',
				name: 'Field Process',
				type: 'field_processor'
			},

			originalSchema: null,
			schema: null
		};
	},

	async mounted() {
		this.$refs.entity.$on('dataChanged', model => {
			log('FieldProcess.SchemaEditor.dataChanged', model);
			this.model.operations = model.operations;
			this.model.scripts = model.scripts;
		});
	},

	methods: {
		convertSchemaToTreeData,

		setData(data, cell, dataNodeInfo, vueAdapter) {
			this.originalSchema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema());
			let schema = _.cloneDeep(this.originalSchema);
			if (data) {
				//模型改变 数据的兼容处理
				if (schema && schema.fields) {
					let fieldOriginalNames = schema.fields.map(field => field.field_name);
					data.operations = data.operations || [];
					for (let i = 0; i < data.operations.length; i++) {
						let index = data.operations[i].field.lastIndexOf('.');
						let parentNode = '';
						if (index !== -1) {
							parentNode = data.operations[i].field.substr(0, index);
						}
						if (
							data.operations[i].op === 'CREATE' &&
							fieldOriginalNames.includes(data.operations[i].field)
						) {
							data.operations.splice(i, 1);
							i--;
							continue;
						}
						if (
							data.operations[i].op === 'CREATE' &&
							!fieldOriginalNames.includes(parentNode) &&
							index !== -1
						) {
							data.operations.splice(i, 1);
							i--;
							continue;
						}
						if (
							['REMOVE', 'CONVERT'].includes(data.operations[i].op) &&
							!fieldOriginalNames.includes(data.operations[i].field)
						) {
							data.operations.splice(i, 1);
							i--;
							continue;
						}

						if (
							data.operations[i].op === 'RENAME' &&
							!fieldOriginalNames.includes(data.operations[i].field)
						) {
							let fieldId = uuid();
							data.operations[i].field = data.operations[i].operand;
							data.operations[i].op = 'CREATE';
							data.operations[i].id = fieldId;
							data.operations[i]['action'] = 'create_sibling';
							data.operations[i]['triggerFieldId'] = data.operations[i].id;
							data.operations[i]['level'] = 0;
							data.operations[i]['javaType'] = data.operations[i].type;
							i--;
							continue;
						}
					}
					data.scripts = data.scripts || [];
					for (let i = 0; i < data.scripts.length; i++) {
						if (data.scripts[i].op === 'js' && !fieldOriginalNames.includes(data.scripts[i].field)) {
							data.scripts.splice(i, 1);
							i--;
						}
					}
				}
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
			}

			// apply operations to schema
			if (this.model.operations && schema && schema.fields) {
				this.$refs.entity.setOperations(_.cloneDeep(this.model.operations));
				this.$refs.entity.setScripts(_.cloneDeep(this.model.scripts));

				this.schema = cell.mergeOutputSchema(schema, false);

				log('FieldProcess.setData.applyOperations', this.originalSchema, this.schema, this.model.operations);
			}
			editorMonitor = vueAdapter.editor;
		},

		getData() {
			return _.cloneDeep(this.model);
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>
