<template>
	<div class="e-table">
		<el-form label-position="right" label-width="160px" :model="model" ref="form">
			<el-form-item :label="$t('editor.cell.data_node.table.form.database.label')" prop="connectionId" :rules="rules" required>
				<el-select filterable v-model="model.connectionId" :placeholder="$t('editor.cell.data_node.table.form.database.placeholder')" @change="handlerConnectionChange">
					<el-option
							v-for="(item, idx) in databases"
							:label="`${item.name} (${item.status})`"
							:value="item.id"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item :label="$t('editor.cell.data_node.table.form.table.label')" prop="tableName" :rules="rules" required>
				<el-select filterable v-model="model.tableName" :placeholder="$t('editor.cell.data_node.table.form.table.placeholder')">
					<el-option
							v-for="(item, idx) in schemas"
							:label="`${item.table_name}`"
							:value="item.table_name"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item :label="$t('editor.cell.data_node.collection.form.pk.label')" required>
				<el-input
						v-model="model.primaryKeys"
						:placeholder="$t('editor.cell.data_node.collection.form.pk.placeholder')"  class="formitem-width"></el-input>
			</el-form-item>

			<el-form-item required :label="$t('editor.cell.data_node.collection.form.dropTable.label')" v-if="!isSourceDataNode">
				<el-select
						v-model="model.dropTable">
					<el-option
							:label="$t('editor.cell.data_node.collection.form.dropTable.keep')"
							:value="false"></el-option>
					<el-option
							:label="$t('editor.cell.data_node.collection.form.dropTable.remove')"
							:value="true"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item :label="$t('editor.cell.data_node.table.form.custom_sql.label')" prop="sql" :rules="rules" >
				<el-input type="textarea" rows="10" v-model="model.sql" :placeholder="$t('editor.cell.data_node.table.form.custom_sql.placeholder')"></el-input>
			</el-form-item>

		</el-form>
		<div class="e-entity-wrap" style="text-align: center;">
			<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
		</div>
	</div>
</template>

<script>
	import { convertSchemaToTreeData } from "../../editor/util/Schema";
	import Entity from './components/Entity';
	import _ from 'lodash';
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
							/*let fields = schema.fields || [];
							let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name).join(',');
							if( primaryKeys) this.model.primaryKeys = primaryKeys;*/
							this.$emit('schemaChange', _.cloneDeep(schema));
						}
					}
				}
			},
			mergedSchema: {
				handler(){
					if( this.mergedSchema && this.mergedSchema.fields && this.mergedSchema.fields.length > 0){
						let primaryKeys = this.mergedSchema.fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
						let unique = {};
						primaryKeys.forEach( key => unique[key] = 1);
						primaryKeys = Object.keys(unique);
						if( primaryKeys.length > 0) this.model.primaryKeys = primaryKeys.join(',');
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

				isSourceDataNode: false,

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
						let schemas = result.data.schema && result.data.schema.tables || [];
						schemas = schemas.sort((t1, t2) => t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1);
						self.schemas = schemas;
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

			setData(data, cell, isSourceDataNode, vueAdapter){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
				this.isSourceDataNode = isSourceDataNode;

				this.mergedSchema = cell.getOutputSchema();
				cell.on('change:outputSchema', () => {
					this.mergedSchema = cell.getOutputSchema();
				});
			},
			getData(){
				let result = _.cloneDeep(this.model);
				result.name = result.tableName || 'Table';
				if( this.isSourceDataNode ){
					delete result.dropTable;
				}
				return result;
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

		.formitem-width {
			width: 225px;
		}

		.e-entity-wrap {
			flex: 1;
			overflow: auto;
		}
	}
</style>
