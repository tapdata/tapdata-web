<template>
	<div class="e-field-process">
		<div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div>
		<el-form
			class="e-form"
			label-position="right"
			label-width="130px"
			:disabled="disabled"
			:model="model"
			ref="form"
		>
			<el-form-item :required="true" :label="$t('editor.cell.processor.field.form.name.label')">
				<el-input
					v-model="model.name"
					size="mini"
					:placeholder="$t('editor.cell.processor.field.form.name.placeholder')"
				></el-input>
			</el-form-item>
			<el-form-item :label="$t('editor.cell.processor.field.form.description.label')">
				<el-input
					type="textarea"
					v-model="model.description"
					:placeholder="$t('editor.cell.processor.field.form.description.placeholder')"
				></el-input>
			</el-form-item>
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
			<!-- <div class="schema-editor-wrap schema-editor-container-right">
				<ul class="info-list">
					<li>
						<span class="text-color">name</span>
						<span class="hight-color">改名为</span>
						<span class="text-color">names</span>
						<span class="iconfont icon-return"></span>

					</li>
					<li>
						<span class="text-color">name</span>
						<span class="hight-color">改名为</span>
						<span class="text-color">names</span>
						<span class="iconfont icon-return"></span>

					</li>
				</ul>
			</div> -->
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

		setData(data, cell, isSourceDataNode, vueAdapter) {
			this.model = {
				operations: [],
				scripts: [],
				name: 'Field Process',
				type: 'field_processor'
			};

			this.originalSchema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema());
			let schema = _.cloneDeep(this.originalSchema);

			if (data) {
				// clear invalid field operations and scripts
				if (schema && schema.fields) {
					let fieldIds = schema.fields.map(field => field.id);
					data.operations = data.operations || [];
					for (let i = 0; i < data.operations.length; i++) {
						if (data.operations[i].op === 'CREATE' && data.operations[i].tableName === schema.table_name) {
							fieldIds.push(data.operations[i].id);
							continue;
						}

						if (!fieldIds.includes(data.operations[i].id)) {
							data.operations.splice(i, 1);
							i--;
						}
					}
					for (let i = 0; i < data.scripts.length; i++) {
						if (!fieldIds.includes(data.scripts[i].id)) {
							data.scripts.splice(i, 1);
							i--;
						}
					}
				} else {
					data.operations = [];
					data.scripts = [];
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

<style lang="less" scoped>
.e-field-process {
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
	padding: 10px;
	.e-form {
		.el-input,
		.el-select,
		.el-textarea {
			max-width: 400px;
			width: 80%;
		}
	}

	.schema-editor-wrap {
		margin: 0 auto;
		width: 400px;
		max-width: 700px;
		min-width: 300px;
	}

	.schema-editor-container {
		flex: 1;
		overflow-y: auto;
	}

	.schema-editor-container-left {
		/*width: 100%;*/
	}

	.schema-editor-container-right {
		/*width: 49%;*/
	}

	.info-list li {
		font-size: 11px;
		border: 1px solid #dedee4;
		background: #f6f6f6;
		line-height: 30px;
		padding-left: 10px;
		margin-bottom: 5px;
	}

	.hight-color {
		color: #c51916;
	}

	.text-color {
		color: #0068b7;
	}
}
</style>
