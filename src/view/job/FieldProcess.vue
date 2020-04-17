<template>
	<div class="e-field-process">
		<el-form class="e-form" label-position="right" label-width="130px" :model="model" ref="form">
			<el-form-item :required="true" :label="$t('editor.cell.processor.field.form.name.label')">
				<el-input v-model="model.name" size="mini" :placeholder="$t('editor.cell.processor.field.form.name.placeholder')"></el-input>
			</el-form-item>
			<el-form-item :label="$t('editor.cell.processor.field.form.description.label')">
				<el-input
						type="textarea" v-model="model.description"
						:placeholder="$t('editor.cell.processor.field.form.description.placeholder')"></el-input>
			</el-form-item>
		</el-form>
		<div class="schema-editor-container">
			<div class="schema-editor-wrap schema-editor-container-left">
				<schema-editor ref="entity" :originalSchema="convertSchemaToTreeData(originalSchema)"
						:schema="convertSchemaToTreeData(schema)" :editable="true"></schema-editor>
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
	import SchemaEditor from './components/SchemaEditor';
	import {convertSchemaToTreeData, mergeJoinTablesToTargetSchema} from "../../editor/util/Schema";
	import log from "../../log";
	import _ from 'lodash';

	export default {
		name: "FieldProcess",
		components: {SchemaEditor},

		watch: {
			model: {
				deep: true,
				handler() {
					this.$emit('dataChanged', this.getData());
				}
			},

		},

		data() {
			return {
				databases: [],

				model: {
					operations: [],
					scripts: [],
					name: 'Field Process',
					type: 'field_processor',
				},

				originalSchema: null,
				schema: null,
			};
		},

		async mounted() {

			this.$refs.entity.$on('dataChanged', (model) => {
				log('FieldProcess.SchemaEditor.dataChanged', model);
				this.model.operations = model.operations;
				this.model.scripts = model.scripts;
			});
		},

		methods: {
			convertSchemaToTreeData,

			setData(data, cell, isSourceDataNode, vueAdapter) {
				log('FieldProcess.setData', arguments);
				if (data) {
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}

				this.originalSchema = mergeJoinTablesToTargetSchema(null, cell.getInputSchema());
				let schema = _.cloneDeep(this.originalSchema);

				// apply operations to schema
				if (this.model.operations && schema && schema.fields) {

					this.$refs.entity.setOperations(_.cloneDeep(this.model.operations));
					this.$refs.entity.setScripts(_.cloneDeep(this.model.scripts));

					this.schema = cell.mergeOutputSchema(schema, false);

					log('FieldProcess.setData.applyOperations', this.originalSchema, this.schema, this.model.operations);
				}
			},
			getData() {
				return _.cloneDeep(this.model);
			},

		}
	};
</script>

<style lang="less" scoped>
	.e-field-process {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;

		.e-form {
			.el-input, .el-select, .el-textarea {
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
