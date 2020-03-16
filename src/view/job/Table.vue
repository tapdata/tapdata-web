<template>
	<div>
		<el-form label-position="right" label-width="130px" :model="model" ref="form">
			<el-form-item label="Database" prop="connectionId" :rules="rules" required>
				<el-select v-model="model.connectionId" :placeholder="`Please select RDBMS database`" @change="handlerChange">
					<el-option
							v-for="(item, idx) in databases"
							:label="`${item.name} (${item.status})`"
							:value="item.id"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Table" prop="dataModelId" :rules="rules" required>
				<el-select v-model="model.dataModelId" :placeholder="`Please select a table`">
					<el-option
							v-for="(item, idx) in schemas"
							:label="`${item.table_name}`"
							:value="item.table_name"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Custom SQL" prop="sql" :rules="rules" >
				<el-input type="textarea" rows="10" v-model="model.sql" placeholder="Please input you custom sql"></el-input>
			</el-form-item>

		</el-form>

		<div style="padding-left: 130px;">
			<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
		</div>
	</div>
</template>

<script>
	import Entity from './components/Entity';
	import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "./components/Schema";
	import _ from 'lodash';
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
			'model.dataModelId': {
				immediate: true,
				handler(){
					if( this.schemas.length > 0 ){
						if( this.model.dataModelId){
							let schema = this.schemas.filter( s => s.table_name === this.model.dataModelId);
							this.model.schema = schema && schema.length > 0 ? schema[0] : null;
						} else {
							this.model.schema = null;
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
					dataModelId: "",
					sql: '',
					schema: null
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
						self.schemas = result.data.schema && result.data.schema.tables;
					}
				});

			},

			handlerChange(){
				this.model.dataModelId = '';
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
			}
		}
	};
</script>

<style scoped>

</style>
