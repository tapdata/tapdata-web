<template>
	<div class="editor-container" v-loading="loading">
		<div class="action-buttons">
			<el-tag
					:type="
						status === 'running' ? 'success' :
						status === 'error' ? 'danger' :
						status === 'paused' ? 'warning' : 'info'"
					effect="plain"
					size="small"
					style="margin-right: 50px;"
			>{{$t('dataFlow.state')}}: {{$t('dataFlow.status.' + status)}}</el-tag>
			<el-button size="mini" type="default" v-if="['draft', 'paused', 'error'].includes(status)" @click="showSetting">Setting</el-button>
			<el-button size="mini" type="default" v-if="dataFlowId" @click="showLogs">Logs</el-button>
			<el-button
					v-if="!['scheduled', 'stopping'].includes(status) && executeMode === 'normal'"
					size="mini" type="default"
					@click="capture">Capture</el-button>
			<el-button
					v-if="!['scheduled', 'stopping'].includes(status) && executeMode !== 'normal'"
					size="mini" type="default"
					@click="stopCapture">Stop capture</el-button>
			<el-button
					v-if="dataFlowId !== null && ['draft', 'paused', 'error'].includes(status)"
					size="mini" type="success"
					@click="start">Start</el-button>
			<el-button
					v-if="dataFlowId !== null && ['scheduled', 'running'].includes(status)"
					size="mini" type="danger"
					@click="stop">Stop</el-button>
			<el-button
					v-if="!['scheduled', 'running'].includes(status)"
					size="mini" type="primary"
					@click="save">Save</el-button>
			<!-- <el-button size="mini" type="primary" @click="switchModel">Model</el-button> -->
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
				status: 'draft',
				executeMode: 'normal',

				loading: true,
			};
		},

		watch: {
			/*executeMode: {
				handler(){
					if( this.executeMode !== 'normal') {
						this.showCapture();
					}
				}
			},*/
			/*status: {
				handler(){
					if( ['draft', 'error', 'paused'].includes(this.status)) {
						this.setEditable(true);
					} else {
						this.setEditable(false);
					}
				}
			}*/
		},
		mounted() {
			let self = this;

			self.editor = editor({
				container: $('.editor-container'),
				actionBarEl: $('.editor-container .action-buttons')
			});

			if( self.$route.query && self.$route.query.id){
				self.loadDataFlow(self.$route.query.id);
			} else {
				self.loading = false;
			}

			self.editor.getUI().getBackButtonEl().on('click', () => {
				self.$router.push({path: '/dataFlows'});
			});
		},

		destroy(){
			if( this.timeoutId ){
				clearTimeout(this.timeoutId);
			}
		},

		methods: {

			loadDataFlow(id){
				let self = this;
				dataFlowsApi.get([id]).then((result) => {
					if( result && result.data ) {
						let dataFlow = result.data;

						self.dataFlowId = dataFlow.id;
						self.status = dataFlow.status;
						self.executeMode = dataFlow.executeMode;

						self.dataFlow = dataFlow;

						self.editor.setData(dataFlow);

						if( ['scheduled', 'running', 'stopping'].includes(self.status)){
							self.setEditable(false);
						}
						if( self.executeMode !== 'normal' ){
							self.showCapture();
						}

						self.polling();

					} else {
						log(result);
						self.$message.error('Load data failed');
					}

					self.loading = false;
				}).catch((err) => {
					log(err);
					self.$message.error('Load data failed');
					self.loading = false;
				});
			},

			polling(){
				let self = this;
				if( self.dataFlowId ){
					if( !['scheduled', 'running', 'stopping'].includes(self.status))
						return;

					dataFlowsApi.get([self.dataFlowId], {
						fields: ['id', 'status', 'last_updated', 'createTime', 'executeMode', 'stopOnError', 'user_id', 'user', 'startTime']
					}).then((result) => {
						if( result && result.data ){
							let newStatus = result.data.status;
							if( self.status !== newStatus){
								self.status = newStatus;
							}

							if( self.executeMode !== result.data.executeMode)
								self.executeMode = result.data.executeMode;

							if( ['scheduled', 'running', 'stopping'].includes(newStatus)) {
								if( self.timeoutId )
									clearTimeout(self.timeoutId);
								self.timeoutId = setTimeout(self.polling.bind(self), 2000);
							} else {
								self.executeMode = 'normal';
							}
						}
					}).catch( err => {
						log(err);
						self.$message.error('Load data failed');
					});
				}
			},

			getDataFlowData() {
				// validate
				let verified = this.editor.graph.validate();
				if( verified !== true) {
					this.$message.error(verified);
					return;
				}

				let editorData = this.editor.getData();
				let graphData = editorData.graphData;
				let settingData = editorData.settingData;


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
					status: this.status || "draft",		// draft/scheduled/running/paused/stopping/error
					executeMode: this.executeMode || "normal",
					category: "数据库克隆",
					stopOnError: false,
					mappingTemplate: "cluster-clone",
					emailWaring: {edited: true, started: false, error: true, paused: false},
					stages: [],
					setting:settingData,
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
						if( sourceId && stages[sourceId] ) stages[sourceId].outputLanes.push(targetId);
						if( targetId && stages[targetId] ) stages[targetId].inputLanes.push(sourceId);
					}
				});
				postData.stages = Object.values(stages);

				log('Job.getDataFlowData', graphData, postData);

				if( this.dataFlowId )
					postData.id = this.dataFlowId;

				return postData;
			},

			doSave(data, cb){
				let self = this;

				log('Job.doSave', data);

				let promise = data.id ?
					dataFlowsApi.patch(data):
					dataFlowsApi.post(data);

				self.loading = true;

				promise.then((result) => {
					if( result && result.data ){
						let dataFlow = result.data;

						self.dataFlowId = dataFlow.id;
						self.status = dataFlow.status;
						self.executeMode = dataFlow.executeMode;

						self.dataFlow = dataFlow;

						if( typeof cb === "function"){
							cb(null, dataFlow);
						}

						self.polling();
					} else {
						if( typeof cb === "function"){
							cb(result, null);
						}
					}
					self.loading = false;
				}).catch(e => {
					if( typeof cb === "function"){
						cb(e, null);
					}
					self.loading = false;
				});
			},

			save(){
				let self = this,
					data = this.getDataFlowData();

				if( data ){

					if( data.id )
						delete data.status;

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
						status: 'scheduled',
					};
				}
				data.status = 'scheduled';
				data.executeMode = "normal";
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
						id: self.dataFlowId,
						status: 'stopping'
					};

				self.$confirm('Stop jobs?', 'Tip', {
					confirmButtonText: 'Stop it',
					cancelButtonText: 'Cancel',
					type: 'warning'
				}).then(() => {
					self.doSave(data, (err, dataFlow) => {
						if( err ){
							self.$message.error('Stop failed');
						} else {
							self.$message.success('Stop success');
							self.setEditable(true);
						}
					});
				});
			},

			capture() {
				let self = this,
					data = this.getDataFlowData();

				if( data ){
					if( data && data.id ) {
						data = {
							id: data.id,
							status: ['scheduled', 'running', 'stopping'].includes(data.status) ? data.status : 'scheduled',
							executeMode: ['running_debug', 'editing_debug'].includes(this.executeMode) ? 'normal' :
								['scheduled', 'running', 'stopping'].includes(data.status) ? 'running_debug' : 'editing_debug'
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
							this.showCapture();
						}
					});
				}
			},

			stopCapture(){
				let self = this,
					data = this.getDataFlowData();

				if( data && data.id ){

					self.doSave({
						id: data.id,
						executeMode: 'normal',
					}, (err, dataFlow) => {
						if( err ){
							this.$message.error('Save failed');
						} else {
							this.$message.success('Save success');
							// this.showCapture();
						}
					});
				}
			},
			showSetting(){
				log('Job.showSetting');
				let name = '';
				if(this.$route.query.name){
					name = this.$route.query.name;
				}
				this.editor.showSetting(name);
			},
			showLogs(){
				this.editor.showLogs(this.dataFlow);
			},
			showCapture(){
				this.editor.showCapture(this.dataFlow);
			},

			setEditable(editable){
				log('Job.setEditable', editable, this.dataFlow);
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
