<template>
	<div>
		<el-form label-position="right" label-width="130px" :model="model" ref="form">
			<el-form-item :required="true" label="node name">
				<el-input  v-model="model.name" class="formitem-width" placeholder="please enter node name"></el-input>
			</el-form-item>
			<el-form-item  label="description">
				<el-input type="textarea"  v-model="model.description" class="formitem-width" placeholder="please enter node description"></el-input>
			</el-form-item>
		</el-form>
		<div class="contentbox">
			<div class="contentbase contentbox-left">
				<entity ref="sourceEntity" :schema="schema" :editable="true"></entity>
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
	import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "../../editor/util/Schema";
	import _ from 'lodash';
	import log from '../../log';
	import factory from '../../api/factory';
	let connections = factory('connections');
	export default {
		name: "Table",
		components: {Entity},
		props: {
			database_types: {
				type: Array,
				default: function(){
					return ['mysql', 'oracle', 'sqlserver', 'sybase ase', 'gbase-8s', 'db2', 'gaussdb200', 'postgres'];
				}
			}
		},

		watch: {
			model: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.getData());
				}
			},
			'model.connectionId': {
				immediate: true,
				handler(){
					this.loadDataModels(this.model.connectionId);
				}
			},
			'model.tableName': {
				immediate: true,
				handler(){
					if( this.schemas.length > 0 ){
						if( this.model.tableName){
							let schema = this.schemas.filter( s => s.table_name === this.model.tableName);
							this.model.schema = schema && schema.length > 0 ? schema[0] : {};
							let fields = this.model.schema.fields || [];
							this.model.primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name).join(',');
						} else {
							this.model.schema = {};
						}
					}
				}
			},
			'model.schema': {
				deep: true,
				handler(){
					this.renderSchema();
				}
			}
		},

		data(){
			return {
				databases: [],
				schema:{"name":"字段名 字段类型 操作 ","type":"collection","fields":[{"id":"Logs__id","label":"_id","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_contextMap","label":"contextMap","type":"Map","isActiveName":false,"isActiveDataType":false,"isDisable":false,"children":[{"id":"Logs_contextMap_app","label":"app","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_contextMap_jobId","label":"jobId","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_contextMap_jobName","label":"jobName","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_contextMap_userId","label":"userId","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,}]},{"id":"Logs_contextStack","label":"contextStack","type":"Array","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_date","label":"date","type":"Date","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_ip","label":"ip","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_last_updated","label":"last_updated","type":"Date","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_level","label":"level","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_loggerName","label":"loggerName","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_message","label":"message","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_millis","label":"millis","type":"Double","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_threadId","label":"threadId","type":"Integer","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_threadName","label":"threadName","type":"String","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_threadPriority","label":"threadPriority","type":"Integer","isActiveName":false,"isActiveDataType":false,"isDisable":false,},{"id":"Logs_thrown","label":"thrown","type":"Null","isActiveName":false,"isActiveDataType":false,"isDisable":false,}]},			
					rules: {				
					connectionId: [
						{required: true, trigger: 'blur', message: `Please select database`},
					]
				},

				model: {
					connectionId: "",
					databaseType: '',
					tableName: "",
					sql: '',
					schema: {},
					dropTable: false,
					type: 'table',
				},

				mergedSchema: null
			};
		},

		async mounted() {
			await this.loadDataSource();
		},

		methods: {
			convertSchemaToTreeData,

			async loadDataSource() {
				let result = await connections.get({
					filter: JSON.stringify({
						where: {
							database_type: {in: this.database_types}
						},
						fields: {
							name: 1, id: 1, database_type: 1, connection_type: 1, status: 1
						}
					})
				});

				if( result.data ){
					this.databases = result.data;
				}
			},

			loadDataModels(connectionId){

				if( !connectionId ){
					return;
				}
				let self = this;
				connections.get([connectionId]).then(result => {
					if( result && result.data ) {
						self.schemas = result.data.schema && result.data.schema.tables || [];
					}
				});

			},

			handlerConnectionChange(){
				this.model.tableName = '';
				for (let i = 0; i < this.databases.length; i++) {
					if( this.model.connectionId === this.databases[i].id){
						this.model.databaseType = this.databases[i]['database_type'];
					}
				}
			},

			setData(data, cell, allCell, graphLib, vueAdapter){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}

				this.joinTables = vueAdapter.getJoinTablesForTargetCell(cell, allCell);
				this.renderSchema();
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			},

			renderSchema() {
				let mergedSchema = _.cloneDeep(this.model.schema);
				mergeJoinTablesToTargetSchema(mergedSchema, _.cloneDeep(this.joinTables));
				this.mergedSchema = mergedSchema;
				this.$emit('changeSchema', _.cloneDeep(mergedSchema));
				log.log('Table.renderSchema:', mergedSchema);
			}
		}
	};
</script>

<style scoped>
.formitem-width{
	width: 300px;
}
.contentbase{
	float: left;
}
.contentbox{
	margin-left: 130px;
	margin-right: 20px;
}
.contentbox-left{
	width: 100%;
}
.contentbox-right{
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
.hight-color{
	color: #c51916;
}
.text-color{
	color: #0068b7;
}
</style>
