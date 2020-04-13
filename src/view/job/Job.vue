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
			>{{$t('dataFlow.state')}}: {{$t('dataFlow.status.' + status.replace(/ /g, '_'))}}</el-tag>
			<el-button
				size="mini" type="default"
				@click="showDataVerify">
				dataVerify
			</el-button>
			<el-button
					v-if="['draft', 'paused', 'error'].includes(status)"
					size="mini" type="default"
					@click="showSetting">{{$t('dataFlow.button.setting')}}</el-button>
			<el-button
					v-if="dataFlowId && 'draft' !== status"
					size="mini" type="default"
					@click="showLogs">{{$t('dataFlow.button.logs')}}</el-button>
			<el-button
					v-if="!['scheduled', 'stopping', 'force stopping'].includes(status) && executeMode === 'normal'"
					size="mini" type="default"
					@click="capture">{{$t('dataFlow.button.capture')}}</el-button>
			<el-button
					v-if="!['scheduled', 'stopping', 'force stopping'].includes(status) && executeMode !== 'normal'"
					size="mini" type="default"
					@click="stopCapture">{{$t('dataFlow.button.stop_capture')}}</el-button>
			<el-button
					v-if="dataFlowId !== null && ['draft', 'paused', 'error'].includes(status)"
					size="mini" type="success"
					@click="start">{{$t('dataFlow.button.start')}}</el-button>
			<el-button
					v-if="dataFlowId !== null && ['scheduled', 'running'].includes(status)"
					size="mini" type="danger"
					@click="stop(false)">{{$t('dataFlow.button.stop')}}</el-button>
			<el-button
					v-if="dataFlowId !== null && ['stopping'].includes(status)"
					size="mini" type="danger"
					@click="stop(true)">{{$t('dataFlow.button.force_stop')}}</el-button>
			<el-button
					v-if="dataFlowId !== null && !['scheduled', 'running', 'stopping', 'force stopping'].includes(status)"
					size="mini" type="default"
					@click="reset">{{$t('dataFlow.button.reset')}}</el-button>
			<el-button
					v-if="!['scheduled', 'running', 'stopping', 'force stopping'].includes(status)"
					size="mini" type="primary"
					@click="save">{{$t('dataFlow.button.save')}}</el-button>
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
	import _ from 'lodash';

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
				disabledDataVerify:false,
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

		beforeDestroy(){
			if( this.timeoutId ){
				clearTimeout(this.timeoutId);
			}
			this.editor.destroy();
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
						self.$message.error(self.$t('message.api.get.error'));
					}

					self.loading = false;
				}).catch((err) => {
					log(err);
					self.$message.error(self.$t('message.api.get.error'));
					self.loading = false;
				});
			},

			polling(){
				let self = this;
				if( self.dataFlowId ){
					if( !['scheduled', 'running', 'stopping'].includes(self.status))
						return;

					dataFlowsApi.get([self.dataFlowId], {
						fields: ['id', 'status', 'last_updated', 'createTime', 'executeMode', 'stopOnError', 'user_id', 'user', 'startTime', 'stats', 'pingTime', 'stopTime']
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
							Object.assign(this.dataFlow, result.data);
							self.editor.emit('dataFlow:updated', _.cloneDeep(result.data));
						}
					}).catch( err => {
						log(err);
						self.$message.error(self.$t('message.api.get.error'));
					});
				}
			},

			getDataFlowData() {
				// validate
				let verified = this.editor.validate();
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
					status: this.status || "draft",		// draft/scheduled/running/paused/stopping/error/force stopping
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

				const _doSave = function(){
					let promise = data.id ?
						dataFlowsApi.patch(data):
						dataFlowsApi.post(data);

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
						self.loading = false;
						if( typeof cb === "function"){
							cb(e, null);
						}
					});
				};

				if( data.name ){
					let params = {
						name: data.name
					};
					if( data.id ){
						params.id = {
							neq: data.id
						};
					}
					self.loading = true;
					dataFlowsApi.count({where: JSON.stringify(params)}).then(result => {
						if( result && result.data && result.data.count > 0 ){
							this.$message.error(`${self.$t('message.exists_name')}: ${data.name}`);
							self.loading = false;
						} else {
							_doSave();
						}
					}).catch(e => {
						self.loading = false;
						if( typeof cb === "function"){
							cb(e, null);
						}
					});
				} else {
					_doSave();
				}
			},

			save(){
				let self = this,
					data = this.getDataFlowData();

				if( data ){

					if( data.id )
						delete data.status;

					self.doSave(data, (err, entityData) => {
						if( err ){
							this.$message.error(self.$t('message.saveFail'));
						} else {
							this.$message.success(self.$t('message.saveOK'));
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
						this.$message.error(self.$t('message.saveFail'));
					} else {
						this.$message.success(self.$t('message.saveOK'));
						self.setEditable(false);
					}
				});
			},

			stop(forceStop){
				let self = this,
					data = {
						id: self.dataFlowId,
						status: forceStop === true ? 'force stopping' : 'stopping'
					};

				self.$confirm(
					forceStop === true ?
						self.$t('dataFlow.stop_job.force_stop_msg') :
						self.$t('dataFlow.stop_job.msg'), self.$t('dataFlow.stop_job.tip'), {
					confirmButtonText: forceStop === true ?
						self.$t('dataFlow.button.force_stop') : self.$t('dataFlow.button.stop'),
					cancelButtonText: self.$t('message.cancel'),
					type: 'warning'
				}).then(() => {
					self.doSave(data, (err, dataFlow) => {
						if( err ){
							this.$message.error(self.$t('message.saveFail'));
						} else {
							// self.$message.success('Stop success');
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
							this.$message.error(self.$t('message.saveFail'));
						} else {
							this.$message.success(self.$t('message.saveOK'));
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
							this.$message.error(self.$t('message.saveFail'));
						} else {
							this.$message.success(self.$t('message.saveOK'));
							// this.showCapture();
						}
					});
				}
			},

			reset() {
				let self = this,
					data = this.getDataFlowData();

				if( data.id ){

					self.$confirm(self.$t('dataFlow.reset_job.msg'), self.$t('dataFlow.reset_job.tip'), {
						confirmButtonText: self.$t('dataFlow.button.reset'),
						cancelButtonText: self.$t('message.cancel'),
						type: 'warning'
					}).then(() => {
						dataFlowsApi.reset(data.id).then(res => {
							if (res.statusText === "OK" || res.status === 200) {
								self.$message.success(self.$t('message.resetOk'));
							} else {
								self.$message.error(self.$t('message.resetFailed'));
							}
						});
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
			showDataVerify(){
				this.disabledDataVerify =!this.disabledDataVerify;
				console.log(this.disabledDataVerify);
				this.editor.showDataVerify(this.disabledDataVerify);
			},
			setEditable(editable){
				log('Job.setEditable', editable, this.dataFlow);
				if( this.dataFlow ){
					delete this.dataFlow.editorData;
					this.editor.setEditable(editable, this.dataFlow);
				} else {
					this.$message.error(this.$t('message.save_before_running'));
				}
			}
		}
	};
</script>

<style lang="less">
	@import "../../editor/style/editor";
</style>
