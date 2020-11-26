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
				<!--				<el-form-item :label="$t('editor.cell.processor.field.form.description.label')">-->
				<!--					<el-input-->
				<!--						type="textarea"-->
				<!--						v-model="model.keep"-->
				<!--						:placeholder="$t('editor.cell.processor.field.form.description.placeholder')"-->
				<!--					></el-input>-->
				<!--				</el-form-item>-->
			</el-form>
			<div class="schema-editor-container">
				<div class="schema-editor-wrap schema-editor-container-left">
					<schema-editor
						ref="entity"
						:originalSchema="convertSchemaToTreeData(model.originalSchema)"
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
import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from '../../util/Schema';
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
				type: 'field_processor',
				originalSchema: '',
				keep: true
			},
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
			if (data) {
				//模型改变 数据的兼容处理
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
			}
			this.model.originalSchema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema());
			let schema = _.cloneDeep(this.model.originalSchema);
			// let testFiled = {
			// 	autoincrement: false,
			// 	columnPosition: 12,
			// 	columnSize: 40,
			// 	dataType: 12,
			// 	data_type: "VARCHAR2",
			// 	field_name: "fannieTest",
			// 	id: "5fa22f48459ce7baf31f5d57",
			// 	is_nullable: true,
			// 	javaType: "String",
			// 	original_field_name: "ZIP",
			// 	precision: 0,
			// 	primary_key_position: 0,
			// 	scale: 0,
			// 	table_name: "CUSTOMER",
			// 	isDeleted: true,
			// }
			// this.model.originalSchema.fields.push(testFiled)
			//查找是否有被删除的字段且operation有操作
			let fieldOriginalIsDeleted = this.model.originalSchema.fields
				.filter(field => field.isDeleted)
				.map(n => n.id);
			let temporary = _.cloneDeep(this.model.operations);
			if (temporary.length > 0) {
				for (let i = 0; i < temporary.length; i++) {
					if (fieldOriginalIsDeleted.includes(temporary[i].id) && !temporary[i]['keep']) {
						temporary.splice(i, 1);
					}
				}
			}
			// apply operations to schema
			if (schema && schema.fields) {
				this.$refs.entity.setOperations(_.cloneDeep(temporary));
				this.$refs.entity.setScripts(_.cloneDeep(this.model.scripts));

				this.schema = cell.mergeOutputSchema(schema, false);

				log(
					'FieldProcess.setData.applyOperations',
					this.model.originalSchema,
					this.schema,
					this.model.operations
				);
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
