<template>
	<div class="editor-container">
		<div class="action-buttons">
			<el-button>Preview</el-button>
			<el-button @click="doSave">Save</el-button>
		</div>
	</div>
</template>

<script>
	import $ from 'jquery';
	import factory from "../../api/factory";
	import editor from '../../editor/index';
	import log from '../../log';

	const dataFlowsApi = factory('DataFlows');
	export default {
		name: "Job",
		data() {
			return {};
		},
		mounted() {
			this.editor = editor({
				container: $('.editor-container'),
				actionBarEl: $('.editor-container .action-buttons')
			});
		},

		methods: {
			doSave(){
				let editorData = this.editor.getData();
				let graphData = editorData.graphData;
				// let graphLib = editorData.graphLib;

				let postData = Object.assign({
					name: editorData.name,
					description: "",
					status: "scheduled",
					executeMode: "normal",
					category: "数据库克隆",
					stopOnError: false,
					mappingTemplate: "cluster-clone",
					emailWaring: {edited: true, started: false, error: true, paused: false},
					stages: [/*{
				id: "database-oracle",
				type: "database",
				syncType: "initial_sync+cdc",
				readCdcInterval: 500,
				readBatchSize: 25000,
				connectionId: "5d78edca36923953ff2f68c9",
				inputLanes: [],
				ouputLanes: ["database-mongodb"]
			}, {
				id: "database-mongodb",
				type: "database",
				dataQualityTag: false,
				dropTable: false,
				connectionId: "5ddde24de601f925314bf7ed",
				inputLanes: ["database-oracle"],
				ouputLanes: []
			}*/]
				}, {
					editorData: JSON.stringify(graphData)
				});

				let stages = {};
				graphData.cells.forEach(cell => {

					let stage = stages[cell.id] = Object.assign({
						id: cell.id,
						inputLanes: [],
						ouputLanes: []
					}, cell['form_data'] || {});

					if( ['app.SourceDB', 'app.TargetDB'].includes(cell.type) ){

						postData.mappingTemplate = 'cluster-clone';

						Object.assign(stage, {
							type: "database",
							syncType: "initial_sync+cdc",
							readCdcInterval: 500,
							readBatchSize: 25000,
							inputLanes: [],
							ouputLanes: []
						});

					} else if( ['app.Table', 'app.Collection'].includes(cell.type)){

						postData.mappingTemplate = 'custom';

						Object.assign(stage, {
							type:"collection",
							"dropTable": true,
							"inputLanes":[
								"processor_js_processor_1",
								"processor_js_processor_2"
							],
							"outputLanes":[
								"data_node_collection_2"
							],
							"tableName":"CUSTOMER",
							"syncType":"initial_sync+cdc",
							"dataQualityTag":false,
							"primaryKeys":"CUSTOMER_ID",
							"connectionId":"5d6dd74736923953ff2d3a5c",
							"joinTables":[
								{
									"tableName":"CUSTOMER",
									"joinType":"upsert",
									"joinPath":"",
									"joinKeys":[
										{
											"source":"CUSTOMER_ID",
											"target":"CUSTOMER_ID"
										}
									],
									"primaryKeys":"CUSTOMER_ID",
									"fieldProcesses":[
										{
											"op":"REMOVE",
											"field":"payDate"
										}
									]
								},
								{
									"tableName":"POLICY",
									"joinType":"merge_embed",
									"joinPath":"policy",
									"joinKeys":[
										{
											"source":"CUSTOMER_ID",
											"target":"CUSTOMER_ID"
										}
									],
									"primaryKeys":"POLICY_ID",
									"fieldProcesses":[
										{
											"op":"RENAME",
											"operand":"policyStatus",
											"field":"POLICY_STATUS"
										}
									]
								}
							]
						});

					}
				});

				graphData.cells.forEach(cell => {
					if( 'app.Link' === cell.type){
						let sourceId = cell.source.id;
						let targetId = cell.target.id;

						stages[sourceId].ouputLanes.push(targetId);
						stages[targetId].ouputLanes.push(sourceId);
					}
				});

				postData.stages = Object.values(stages);
				log.log('saveData:', postData);
				if( `1` !== '1') {
					dataFlowsApi.post(postData).then((result) => {
						//console.log(result);
					}).catch(e => {
						throw new Error(e);
					});
				}
			}
		}
	};
</script>

<style lang="less">
	@import "../../editor/style/editor";
</style>
