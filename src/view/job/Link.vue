<template>
	<div class="e-link-wrap">

		<el-form label-position="right" label-width="160px" :model="model" ref="form">

			<el-form-item label="Table name" required>
				<el-input
						v-model="model.joinTable.tableName"
						placeholder="please enter table name"  class="formitem-width"></el-input>
			</el-form-item>

			<el-form-item label="Table primary key" required>
				<el-input
						v-model="model.joinTable.primaryKeys"
						placeholder="please enter primary key"  class="formitem-width"></el-input>
			</el-form-item>

			<el-form-item label="Data write model:" required>
				<el-select v-model="model.joinTable.joinType" :placeholder="`Please select Data Write model`" @change="handlerJoinTypeChanged">
					<el-option
							v-for="(item, idx) in writeModels"
							:label="`${item.label}`"
							:value="item.value"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Join Path" required v-if="['update', 'merge_embed'].includes(model.joinTable.joinType)">
				<el-input
						v-model="model.joinTable.joinPath"
						placeholder="please enter Join path"  class="formitem-width"></el-input>
			</el-form-item>

			<el-form-item label="Association condition:" required>
				<table class="e-table">
					<thead>
						<tr>
							<th>Source Field</th>
							<th>Target Field</th>
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

		<div class="e-mapping-wrap">
			<Mapping ref="mappingComp"></Mapping>
		</div>
	</div>
</template>

<script>
	import _ from 'lodash';
	import {EditorEventType} from "../../editor/lib/events";
	import Mapping from './components/Mapping';
	import {mergeJoinTablesToTargetSchema} from "../../editor/util/Schema";
	import log from "../../log";
	import {JOIN_TABLE_TPL} from "../../editor/constants";

	export default {
		name: "Link",
		components: {Mapping},

		data(){
			return {

				writeModels: [{
					label: 'Append into Target',
					value: 'append' // insert				{source: ''} + {target: ''}  =  {source: '', target: ''}
				}, {
					label: 'Match and Merge or Insert New',
					value: 'upsert'  // OneOne				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
				}, {
					label: 'Match and Merge',
					value: 'update'  // OneMany				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
				}, {
					label: 'Match then Embed as Array in target',
					value: 'merge_embed'  // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
				}],

				sourceSchema: [],
				targetSchema: [],

				model: {
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
			}
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
			removeCondition(idx) {
				this.model.joinTable.joinKeys.splice(idx, 1);
				this.$emit(EditorEventType.RESIZE);
			},
			addCondition(){
				this.model.joinTable.joinKeys.push({source: '', target: ''});
				this.$emit(EditorEventType.RESIZE);
			},

			setData(data, cell, vueAdapter){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
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
						sourceSchema = sourceCell ? sourceCell.getOutputSchema() : null,
						targetInputSchema = targetCell ? targetCell.getInputSchema() : null,
						targetSchema = targetCell ? targetCell.getSchema() : null
					;

					let mergedTargetSchema = mergeJoinTablesToTargetSchema(targetSchema, targetInputSchema);

					this.$refs.mappingComp.setSchema(sourceSchema, mergedTargetSchema);
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
				if(['merge_embed', 'update'].includes(this.model.joinTable.joinType)){
					this.model.joinTable.joinPath = this.model.joinTable.tableName;
				}
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

		.formitem-width {
			width: 225px;
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
				width: 90px;
				height: 20px;
				outline: none;
				border: none;
				padding: 0 10px;
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
