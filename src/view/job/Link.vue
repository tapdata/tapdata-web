<template>
	<div class="e-link-wrap">

		<el-form label-position="right" label-width="150px" :model="model" ref="form">

			<el-form-item label="Data write model:" required>
				<el-select v-model="model.joinTable.joinType" :placeholder="`Please select Data Write model`">
					<el-option
							v-for="(item, idx) in writeModels"
							:label="`${item.label}`"
							:value="item.value"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Association condition:">
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
	const JOIN_TABLE_TPL = {
		sourceNodeIds: [],
		tableName: '',
		joinType: 'upsert',
		joinPath: '',
		joinKeys: [{
			source: '',
			target: ''
		}]
	};
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
					value: 'match_embed'  // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
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
			},
			'model.joinTable': {
				deep: true,
				handler(){
					this.joinTable = this.joinTable || {};
					Object.assign(this.joinTable, {
						joinPath: this.model.joinTable.joinPath,
						joinType: this.model.joinTable.joinType,
						joinKeys: _.cloneDeep(this.model.joinTable.joinKeys),
					});
					this.renderSchema();
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

			setData(data, cell, allCell, graphLib, vueAdapter){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
				this.$emit(EditorEventType.RESIZE);

				this.showMapping(cell, allCell, graphLib, vueAdapter);
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			},

			canShow(cell, allCell){
				if(cell && cell.type === 'app.Link' && allCell){
					let targetId = cell.target.id;
					if( !targetId) return false;
					let cells = allCell.cells ? allCell.cells : [];
					let targetCell = cells.filter((cel) => cel.id === targetId);
					if( targetCell && targetCell.length > 0 && targetCell[0] )
						return ['app.Table', 'app.Collection'].includes(targetCell[0].type);
				}

				return false;
			},

			showMapping(cell, allCell, graphLib, vueAdapter) {
				// 1 Show mapping when target is a table or collection.
				// 2 Remove Match-Embed when target is table
				// 3 Find the model in the data node forward and backward
				// 4 join table
				// 5 render schema and mapping

				let canShow = this.canShow(cell, allCell);
				if( !canShow ) return null;

				let cells = allCell.cells ? allCell.cells : [];
				let edgeCells = {};
				let nodeCells = {};
				cells.forEach(cell => {
					if( cell.type === 'app.Link')
						edgeCells[cell.id] = cell;
					else
						nodeCells[cell.id] = cell;
				});

				let targetNode = nodeCells[cell.target.id];
				let sourceNode = nodeCells[cell.source.id];
				if( !targetNode ) return null;

				this.initByType(targetNode.type);

				const dataNodeTypes = ['app.Table', 'app.Collection'];
				const preDataNodes = [];
				const recursive = function(currentNodeId, forward = true){

					let nodeCell = nodeCells[currentNodeId];
					if( nodeCell ){
						if( dataNodeTypes.includes(nodeCell.type) ){
							preDataNodes.push(nodeCell);
						} else {
							let nextNodes = forward ?
								graphLib.successors(currentNodeId) :
								graphLib.predecessors(currentNodeId);
							if( nextNodes && nextNodes.length > 0 ){
								nextNodes.forEach((nodeId) => recursive(nodeId, forward));
							}
						}
					}
				};
				recursive(sourceNode.id, false);

				// validate
				let verified = 0;
				preDataNodes.forEach(( nodeCell ) => {
					if( vueAdapter.validate(nodeCell) ){
						verified++;
					} else {
						this.$message( 'Validate fail for node ' + nodeCell.type);
					}
				});
				if( verified !== preDataNodes.length){
					return false;
				}

				let sourceSchemas = preDataNodes.map( n => vueAdapter.getSchemaForCell(n) || {}).filter( s => !!s);
				let targetSchema = vueAdapter.getSchemaForCell(targetNode) || {};
				let joinTable = vueAdapter.getJoinTableForCell(cell);

				joinTable = Object.assign(_.cloneDeep(JOIN_TABLE_TPL), joinTable || {}, {
					sourceNodeIds: preDataNodes.map(n => n.id),
					tableName: sourceSchemas.map(t => t.table_name).join('_'),
					joinPath: sourceSchemas.map(t => t.table_name).join('_'),
					sourceSchemas: sourceSchemas
				});

				let otherJoinTables = (vueAdapter.getJoinTablesForTargetCell(targetNode, allCell) || [])
					.filter((jt) => _.difference(jt.sourceNodeIds, joinTable.sourceNodeIds).length !== 0);

				this.targetSchema = targetSchema;
				this.joinTable = joinTable;
				this.otherJoinTables = otherJoinTables;
				this.renderSchema();

				// store joinTable to link
				Object.keys(joinTable).filter( k => k !== 'sourceSchemas').forEach( k => {
					this.model.joinTable[k] = _.cloneDeep(joinTable[k]);
				});
			},

			renderSchema(){
				this.$refs.mappingComp.setSchema(this.targetSchema, this.joinTable, this.otherJoinTables);
			},

			initByType(type){
				if( type === 'app.Table'){
					for (let i = 0; i < this.writeModels.length; i++) {
						if( this.writeModels[i].value === 'match_embed'){
							this.writeModels.splice(i, 1);
							i--;
						}
					}
				}
			}
		},

		destroyed() {
		}
	};
</script>

<style lang="less" scoped>

	.e-link-wrap {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;

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
