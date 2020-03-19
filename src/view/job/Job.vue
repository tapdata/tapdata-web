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
	import { FORM_DATA_KEY } from "../../editor/vue-adapter";

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

				let cells = graphData.cells ? graphData.cells : [];
				let edgeCells = {};
				let nodeCells = {};
				cells.forEach(cell => {
					if( cell.type === 'app.Link')
						edgeCells[cell.id] = cell;
					else
						nodeCells[cell.id] = cell;
				});

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
				Object.values(nodeCells).forEach(cell => {

					let stage = stages[cell.id] = Object.assign({
						id: cell.id,
						inputLanes: [],
						outputLanes: [],
						syncType: "initial_sync+cdc",
					}, cell[FORM_DATA_KEY] || {});

					if( ['app.Database'].includes(cell.type) ){

						postData.mappingTemplate = 'cluster-clone';

						Object.assign(stage, {
							type: "database",
							readCdcInterval: 500,
							readBatchSize: 25000,
						});

					} else if( ['app.Table', 'app.Collection'].includes(cell.type)){

						postData.mappingTemplate = 'custom';

						Object.assign(stage, {
							dataQualityTag:false,
							joinTables: Object.values(edgeCells)
								.filter(edge => edge.target && edge.target.id === cell.id )
								.map( edge => edge[FORM_DATA_KEY] && edge[FORM_DATA_KEY].joinTable)
						});
					}
				});

				Object.values(edgeCells).forEach(cell => {
					if( 'app.Link' === cell.type){
						let sourceId = cell.source.id;
						let targetId = cell.target.id;

						stages[sourceId].outputLanes.push(targetId);
						stages[targetId].inputLanes.push(sourceId);
					}
				});

				postData.stages = Object.values(stages);
				log('Job.saveData:', postData);
				dataFlowsApi.post(postData).then((result) => {
					//console.log(result);
				}).catch(e => {
					throw new Error(e);
				});
			}
		}
	};
</script>

<style lang="less">
	@import "../../editor/style/editor";
</style>
