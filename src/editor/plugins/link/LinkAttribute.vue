<template>
	<div class="e-link-wrap">

		<el-form class="e-form" label-position="right" label-width="160px" :model="model" ref="form" action="javascript:void(0);">

			<el-form-item :label="$t('editor.cell.link.form.label.label')">
				<el-input
						v-model="model.label"
						:placeholder="$t('editor.cell.link.form.label.placeholder')"
						size="mini">
				</el-input>
			</el-form-item>

		</el-form>

		<el-form class="e-form" label-position="right" label-width="160px" :model="model" ref="form" v-show="configJoinTable" action="javascript:void(0);">

			<!--<el-form-item label="Table name" required>
				<el-input
						v-model="model.joinTable.tableName"
						placeholder="please enter table name"></el-input>
			</el-form-item>

			<el-form-item label="Table primary key" required>
				<el-input
						v-model="model.joinTable.primaryKeys"
						placeholder="please enter primary key"></el-input>
			</el-form-item>-->

			<el-form-item :label="$t('editor.cell.link.form.joinType.label')" required>
				<el-select
						v-model="model.joinTable.joinType"
						:placeholder="$t('editor.cell.link.form.joinType.placeholder')"
						@change="handlerJoinTypeChanged"
						size="mini">
					<el-option
							v-for="(item, idx) in writeModels"
							:label="`${item.label}`"
							:value="item.value"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item :label="$t('editor.cell.link.form.joinPath.label')" v-if="supportEmbedArray() && ['upsert', 'update', 'merge_embed'].includes(model.joinTable.joinType)">
				<el-input
						v-model="model.joinTable.joinPath"
						:placeholder="$t('editor.cell.link.form.joinPath.placeholder')"  size="mini"></el-input>
			</el-form-item>

			<el-form-item :label="$t('editor.cell.link.form.joinKeys.label')" required v-if="!['append'].includes(model.joinTable.joinType)">
				<table class="e-table">
					<thead>
						<tr>
							<th>{{$t('editor.cell.link.form.joinKeys.sourceField')}}</th>
							<th>{{$t('editor.cell.link.form.joinKeys.targetField')}}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, idx) in model.joinTable.joinKeys" v-bind:key="idx">
							<td>
								<input type="text" v-model="item.source">
							</td>
							<td>
								<input type="text" v-model="item.target">
								<div class="e-action-bar">
									<el-button
											v-if="model.joinTable.joinKeys.length > 1"
											type="text" class="el-icon-close" size="mini"
											@click="removeCondition(idx)"></el-button>
									<el-button
											v-if="idx === model.joinTable.joinKeys.length - 1"
											type="text" class="el-icon-plus" size="mini"
											@click="addCondition"></el-button>
								</div>
							</td>

						</tr>
					</tbody>
				</table>
			</el-form-item>
		</el-form>

		<div class="e-mapping-wrap" v-show="configJoinTable">
			<Mapping ref="mappingComp"></Mapping>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import {EditorEventType} from "../../lib/events";
	import Mapping from './Mapping';
	import log from "../../../log";
	import {JOIN_TABLE_TPL} from "../../constants";

	export default {
		name: "Link",
		components: {Mapping},

		data(){
			return {

				writeModels: [],

				sourceSchema: [],
				targetSchema: [],
				targetCellType: '',

				configJoinTable: false,

				model: {
					label: '',
					joinTable: _.cloneDeep(JOIN_TABLE_TPL)
				}
			};
		},

		watch: {
			model: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.getData());
				}
			},
			targetCellType: {
				handler() {
					this.writeModels.splice(0, this.writeModels.length);
					if(this.supportEmbedArray()) {
						this.WRITE_MODELS.forEach( model => this.writeModels.push(model));
					} else {
						this.WRITE_MODELS.filter(model => model.value !== 'merge_embed').forEach( model => this.writeModels.push(model));
					}
				}
			}
		},

		created(){
			this.WRITE_MODELS = [{
				label: this.$t('editor.cell.link.writeMode.append'),
				value: 'append' // insert				{source: ''} + {target: ''}  =  {source: '', target: ''}
			}, {
				label: this.$t('editor.cell.link.writeMode.upsert'),
				value: 'upsert'  // OneOne				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
			}, {
				label: this.$t('editor.cell.link.writeMode.update'),
				value: 'update'  // OneMany				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
			}, {
				label: this.$t('editor.cell.link.writeMode.merge_embed'),
				value: 'merge_embed'  // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
			}];
		},

		mounted() {
			let self = this;
			self.$on(EditorEventType.RESIZE, () => {
				self.$refs.mappingComp.$emit(EditorEventType.RESIZE);
			});

			this.$on(EditorEventType.HIDE, () => {
				this.$refs.mappingComp.hide();
			});
			this.$on(EditorEventType.SHOW, () => {
				this.$refs.mappingComp.show();
			});
		},

		methods: {
			supportEmbedArray(){
				return !['app.Table'].includes(this.targetCellType);
			},
			removeCondition(idx) {
				this.model.joinTable.joinKeys.splice(idx, 1);
				this.$emit(EditorEventType.RESIZE);
			},
			addCondition(){
				this.model.joinTable.joinKeys.push({source: '', target: ''});
				this.$emit(EditorEventType.RESIZE);
			},

			setData(data, cell, isSourceDataNode, vueAdapter){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}

				this.configJoinTable = cell.configJoinTable && cell.configJoinTable();

				if( !this.configJoinTable )
					return;

				if( cell.getSourceCell()) {
					let sourceCell = cell.getSourceCell();
					let firstDataNode = typeof sourceCell.getFirstDataNode === 'function' ? sourceCell.getFirstDataNode() : [];
					this.model.joinTable.stageId = firstDataNode.length > 0 ? firstDataNode[0].id : '';
					//this.model.joinTable.stageId = cell.getSourceCell().id;
				}

				this.$emit(EditorEventType.RESIZE);

				this.showMapping(data, cell, vueAdapter);
			},
			getData(){
				let data = JSON.parse(JSON.stringify(this.model));
				/*if( data.joinTable.joinKeys.length > 0 ){
					let joinKeys = data.joinTable.joinKeys.filter( key => key.source && key.target);
					data.joinTable.joinKeys = joinKeys;
				}*/
				if( !this.configJoinTable) {
					delete data.joinTable;
				}
				if(data.joinType === 'append')
					delete data.joinPath;
				return data;
			},

			/**
			 * show current link source schema, target schema and config mapping
			 * @param cell
			 * @param vueAdapter
			 */
			showMapping(data, cell, vueAdapter) {
				this.cell = cell;
				this.targetCell = this.cell.getTargetCell();
				this.targetCellType = this.targetCell.get('type');

				this.unwatch = this.$watch('model.joinTable', () => {
					log('Link.showMapping.watchJoinTable', arguments);
					this.targetCell.updateOutputSchema();
				}, {deep: true});

				this.targetCell.on('change:outputSchema', this.renderSchema, this);

				this.renderSchema();
			},

			renderSchema() {
				if( this.cell ){
					let sourceCell = this.cell.getSourceCell(),
						targetCell = this.cell.getTargetCell(),
						sourceSchema = sourceCell ? sourceCell.getOutputSchema() : null
						/*targetInputSchema = targetCell ? targetCell.getInputSchema() : null,
						targetSchema = targetCell ? targetCell.getSchema() : {
							meta_type: this.targetCell.get('type') === 'app.Collection' ? 'collection' : 'table'
						}*/
					;

					let mergedTargetSchema = targetCell && typeof targetCell.getOutputSchema === 'function' ? targetCell.getOutputSchema() : null; //mergeJoinTablesToTargetSchema(targetSchema, targetInputSchema);

					let targetSchemaFields = mergedTargetSchema && mergedTargetSchema.fields || [];
					let targetJoinFields = targetSchemaFields.filter( field => field.field_name === this.model.joinTable.joinPath);
					let isArray = targetJoinFields && targetJoinFields.length > 0 && targetJoinFields[0].javaType === 'Array';
					if( this.model.joinTable.isArray !== isArray ) this.model.joinTable.isArray = isArray;

					this.$refs.mappingComp.setSchema(sourceSchema, mergedTargetSchema);
					log('Link.renderSchema', sourceSchema, mergedTargetSchema);
				}
			},

			initByType(type){
				if( type === 'app.Table'){
					for (let i = 0; i < this.writeModels.length; i++) {
						if( this.writeModels[i].value === 'merge_embed'){
							this.writeModels.splice(i, 1);
							i--;
						}
					}
				}
			},

			handlerJoinTypeChanged(){
				if(!this.model.joinTable.joinPath && ['merge_embed', 'update'].includes(this.model.joinTable.joinType)){
					this.model.joinTable.joinPath = this.model.joinTable.tableName;
				}
				this.$refs.mappingComp.$emit(EditorEventType.RESIZE);
			}
		},

		destroyed() {
			log('Link.destroyed');
			if( this.unwatch )
				this.unwatch();
			if( this.targetCell ){
				this.targetCell.off('change:outputSchema', this.renderSchema, this);
			}
			delete this.unwatch;
			delete this.cell;
			delete this.targetCell;
		}
	};
</script>

<style lang="less" scoped>

	.e-link-wrap {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;

		.e-form {
			.el-input, .el-select {
				max-width: 400px;
				width: 80%;
			}
		}

		.e-table {
			display: inline-block;
			font-size: 0.9em;
			color: #606266;

			thead {
				background: whitesmoke;
			}
			th {
				font-weight: normal;
			}
			tr, td, th {
				border-collapse: collapse;
				border: 1px solid #ccc;
			}
			td {
				position: relative;
			}

			input {
				color: #606266;
				width: 198px;
				height: 20px;
				outline: none;
				border: none;
				padding: 0 10px;
				box-sizing: border-box;
			}

			.e-action-bar {
				position: absolute;
				right: -56px;
				top: 0;
				width: 50px;
			}
		}

		.e-mapping-wrap {
			flex: 1;
			height: 50%;
		}
	}
</style>
<style lang="less">
	.e-link-wrap .el-form .el-radio-group{
		display: flex;
		justify-content: center;
		align-items: baseline;
		flex-flow: column;
		padding-left: 55px;
	}
</style>
