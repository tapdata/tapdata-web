<template>
	<div>
		<el-form label-position="right" label-width="130px" :model="model" ref="form">
			<el-form-item :required="true" label="Name">
				<el-input v-model="model.name" class="formitem-width" placeholder="please enter node name"></el-input>
			</el-form-item>
			<el-form-item label="description">
				<el-input
						type="textarea" v-model="model.description" class="formitem-width"
						placeholder="please enter node description"></el-input>
			</el-form-item>
		</el-form>
		<div class="contentbox">
			<div class="contentbase contentbox-left">
				<entity ref="entity" :originalSchema="convertSchemaToTreeData(originalSchema)"
						:schema="convertSchemaToTreeData(schema)" :editable="true"></entity>
			</div>
			<!-- <div class="contentbase contentbox-right">
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
	import Entity from './components/Entity1';
	import {convertSchemaToTreeData, mergeJoinTablesToTargetSchema} from "../../editor/util/Schema";
	import log from "../../log";
	import _ from 'lodash';

	export default {
		name: "FieldProcess",
		components: {Entity},

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
					name: 'Field Process',
					type: 'field_processor',
				},

				originalSchema: null,
				schema: null,
			};
		},

		async mounted() {

			this.$refs.entity.$on('dataChanged', (operations) => {
				log('FieldProcess.operations.changed', arguments);
				this.model.operations = operations;
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

					let operations = {};
					this.model.operations.forEach(p => operations[p.id] = p);

					schema.fields.forEach((field => {
						let operation = operations[field.id];
						if (operation) {
							if (operation.op === 'RENAME') {
								let fieldName = field.field_name.split('.');
								fieldName[fieldName.length - 1] = operation.operand;
								field.field_name = fieldName.join('.');
							} else if (operation.op === 'CONVERT') {
								field.javaType = operation.operand;
							//} else if (operation.op === 'REMOVE'){
							}
						}
					}));
					this.schema = schema;
					log('FieldProcess.setData.applyOperations', schema, operations);
				}
			},
			getData() {
				return _.cloneDeep(this.model);
			},

		}
	};
</script>

<style scoped>
	.formitem-width {
		width: 300px;
	}

	.contentbase {
		float: left;
	}

	.contentbox {
		margin-left: 130px;
		margin-right: 20px;
	}

	.contentbox-left {
		width: 100%;
	}

	.contentbox-right {
		width: 49%;
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
</style>
