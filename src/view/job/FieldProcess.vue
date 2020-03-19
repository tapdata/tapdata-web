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
				<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
			</div>
			<div class="contentbase contentbox-right">
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
			</div>
		</div>
		
	</div>
</template>

<script>
	import Entity from './components/Entity';
	import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "./components/Schema";
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
				schemas: [],

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
.contentbox-left{
	width: 49%;
}
.contentbox-right{
	width: 49%;
	margin-left: 10px;
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
