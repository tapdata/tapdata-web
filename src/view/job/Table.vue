<template>
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

		<el-form-item label="Table" prop="tableId" :rules="rules" required>
			<el-select v-model="model.tableId" :placeholder="`Please select a table`">
				<el-option
						v-for="(item, idx) in schema"
						:label="`${item.table_name}`"
						:value="item.table_name"
						v-bind:key="idx"></el-option>
			</el-select>
		</el-form-item>

		<el-form-item label="Custom SQL" prop="sql" :rules="rules" >
			<el-input type="textarea" rows="10" v-model="model.sql" placeholder="Please input you custom sql"></el-input>
		</el-form-item>

	</el-form>
</template>

<script>
	import factory from '../../api/factory';
	let connections = factory('connections');

	export default {
		name: "Table",

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
			}
		},

		data(){
			return {
				databases: [],
				schema: [],

				rules: {
					connectionId: [
						{required: true, trigger: 'blur', message: `Please select database`},
					]
				},

				model: {
					connectionId: "",
					tableId: "",
					sql: ''
				}
			};
		},

		async mounted() {
			await this.loadDataSource();
		},

		methods: {

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
						self.schema = result.data.schema && result.data.schema.tables;
					}
				});

			},

			handlerChange(){
				this.model.tableId = '';
			},

			setData(data){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			}
		}
	};
</script>

<style scoped>

</style>
