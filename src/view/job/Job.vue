<template>
	<div class="editor-container">
		<div class="action-buttons">
			<el-button
					v-if="dataFlowId !== null && ['scheduled', 'running'].includes(status)"
					size="mini" type="danger"
					@click="stop">Stop</el-button>
			<el-button
					v-if="dataFlowId !== null && ['draft', 'paused', 'error'].includes(status)"
					size="mini" type="success"
					@click="start">Start</el-button>
			<el-button
					size="mini" type="default"
					@click="capture">Capture</el-button>
			<el-button
					v-if="!['scheduled', 'running'].includes(status)"
					size="mini" type="primary"
					@click="save">Save</el-button>
			<!--<el-button size="mini" type="primary" @click="switchModel">Model</el-button>-->
		</div>
	</div>
</template>

<script>
	import $ from 'jquery';
	import factory from "../../api/factory";
	import editor from '../../editor/index';
	import log from '../../log';
	import {FORM_DATA_KEY} from "../../editor/constants";

	const dataFlowsApi = factory('DataFlows');
	export default {
		name: "Job",
		dataFlow: null,

		data() {
			return {
				// run model: editable,readonly
				model: 'editable',

				dataFlowId: null,
				status: 'draft'
			};
		},
		mounted() {
			this.editor = editor({
				container: $('.editor-container'),
				actionBarEl: $('.editor-container .action-buttons')
			});
		},

		methods: {

			getDataFlowData() {
				// validate
				let verified = this.editor.graph.validate();
				if( verified !== true) {
					this.$message.error(verified);
					return;
				}

				let editorData = this.editor.getData();
				let graphData = editorData.graphData;

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
					status: "draft",		// draft/scheduled/running/paused/stopping/error
					executeMode: "normal",
					category: "数据库克隆",
					stopOnError: false,
					mappingTemplate: "cluster-clone",
					emailWaring: {edited: true, started: false, error: true, paused: false},
					stages: []
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

				log('Job.getDataFlowData: ', postData);

				if( this.dataFlowId )
					postData.id = this.dataFlowId;

				return postData;
			},

			doSave(data, cb){
				let self = this;

				let promise = data.id ?
					dataFlowsApi.patch(data):
					dataFlowsApi.post(data);

				promise.then((result) => {
					if( result && result.data ){
						let dataFlow = result.data;

						self.dataFlowId = dataFlow.id;
						self.status = dataFlow.status;

						self.dataFlow = dataFlow;

						if( typeof cb === "function"){
							cb(null, dataFlow);
						}
					} else {
						if( typeof cb === "function"){
							cb(result, null);
						}
					}
				}).catch(e => {
					if( typeof cb === "function"){
						cb(e, null);
					}
				});
			},

			save(){
				let self = this,
					data = this.getDataFlowData();

				if( data ){
					self.doSave(data, (err, entityData) => {
						if( err ){
							this.$message.error('Save failed');
						} else {
							this.$message.success('Save success');
						}
					});
				}
			},

			start(){
				let self = this,
					data = this.getDataFlowData();

				if( data.id ) {
					data = {
						id: data.id,
						status: 'scheduled'
					};
				}
				data.status = 'scheduled';
				self.doSave(data, (err, dataFlow) => {
					if( err ){
						this.$message.error('Start failed');
					} else {
						this.$message.success('Start success');
						self.setEditable(false);
					}
				});
			},

			stop(){
				let self = this,
					data = {
						id: this.dataFlowId,
						status: 'stopping'
					};

				self.doSave(data, (err, dataFlow) => {
					if( err ){
						this.$message.error('Stop failed');
					} else {
						this.$message.success('Stop success');
						self.setEditable(true);
					}
				});
			},

			capture() {
				let self = this,
					data = this.getDataFlowData();

				if( data.id ) {
					data = {
						id: data.id,
						status: ['scheduled', 'running'].includes(data.status) ? data.status : 'scheduled',
						executeMode: 'running' === data.status ? 'running_debug' : 'editing_debug'
					};
				} else {
					Object.assign(data, {
						status: 'scheduled',
						executeMode: 'editing_debug'
					});
				}
				self.doSave(data, (err, dataFlow) => {
					if( err ){
						this.$message.error('Save failed');
					} else {
						this.$message.success('Save success');
						self.setEditable(false);
					}
				});
			},

			setEditable(editable){
				if( this.dataFlow ){
					delete this.dataFlow.editorData;
					this.editor.setEditable(editable, this.dataFlow);
				} else {
					this.$message.error('Please save the task before running');
				}
			}
		}
	};
</script>

<style lang="less">
	@import "../../editor/style/editor";
</style>
