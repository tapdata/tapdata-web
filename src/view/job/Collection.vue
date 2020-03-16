<template>
	<div class="e-collection">
		<el-form label-position="right" label-width="130px" :model="model" ref="form">
			<el-form-item label="Database" prop="connectionId" :rules="rules" required>
				<el-select v-model="model.connectionId" :placeholder="`Please select MongoDB database`" @change="handlerChange">
					<el-option
							v-for="(item, idx) in databases"
							:label="`${item.name} (${item.status})`"
							:value="item.id"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Collection" prop="dataModelId" :rules="rules" required>
				<el-select
						v-model="model.dataModelId"
						filterable
						allow-create
						default-first-option
						clearable
						:placeholder="`Please select a collection`">
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

		</el-form>
		<div class="e-entity-wrap" style="padding-left: 130px;">
			<entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
		</div>
	</div>
</template>

<script>
	import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "./components/Schema";
	import Entity from './components/Entity';
	import _ from 'lodash';
	import factory from '../../api/factory';
	let connectionApi = factory('connections');

	export default {
		name: "Collection",
		components: {Entity},
		props: {
			database_types: {
				type: Array,
				default: function(){
					return ['mongodb'];
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
					schema: null,
					dropTable: false,
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

<style lang="less" scoped>
	.e-collection {
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
