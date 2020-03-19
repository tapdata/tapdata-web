<template>
	<div class="e-table">
		<el-form label-position="right" label-width="130px" :model="model" ref="form">
			<el-form-item label="Database" prop="connectionId" :rules="rules" required>
				<el-select v-model="model.connectionId" :placeholder="`Please select RDBMS database`" @change="handlerConnectionChange">
					<el-option
							v-for="(item, idx) in databases"
							:label="`${item.name} (${item.status})`"
							:value="item.id"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Table" prop="tableName" :rules="rules" required>
				<el-select v-model="model.tableName" :placeholder="`Please select a table`">
					<el-option
							v-for="(item, idx) in schemas"
							:label="`${item.table_name}`"
							:value="item.table_name"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item required label="Exists data">
				<el-select
						v-model="model.dropTable"
						:placeholder="`Please select a collection`">
					<el-option
							label="Keep exists data"
							:value="false"></el-option>
					<el-option
							label="Remove exists data at before sync"
							:value="true"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Custom SQL" prop="sql" :rules="rules" >
				<el-input type="textarea" rows="10" v-model="model.sql" placeholder="Please input you custom sql"></el-input>
			</el-form-item>

		</el-form>
		<div class="e-entity-wrap" style="padding-left: 130px;">
			<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
		</div>
	</div>
</template>

<script>
	import { convertSchemaToTreeData } from "../../editor/util/Schema";
	import Entity from './components/Entity';
	import _ from 'lodash';
	import log from '../../log';
	import factory from '../../api/factory';
	let connectionApi = factory('connections');

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
							schema = schema && schema.length > 0 ? schema[0] : {};
							let fields = schema.fields || [];
							this.model.primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name).join(',');
							this.$emit('schemaChange', _.cloneDeep(schema));
						}
					}
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
					dropTable: false,
					type: 'table',
					primaryKeys: ''
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
				let result = await connectionApi.get({
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
				connectionApi.get([connectionId]).then(result => {
					if( result.data ){
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

			setData(data, cell, vueAdapter){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}

				this.mergedSchema = cell.getOutputSchema();
				cell.on('change:outputSchema', () => {
					this.mergedSchema = cell.getOutputSchema();
				});
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			},
		}
	};
</script>

<style lang="less" scoped>
	.e-table {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;

		.e-entity-wrap {
			flex: 1;
			overflow: auto;
		}
	}
</style>
