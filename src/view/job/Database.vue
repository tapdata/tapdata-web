<template>
	<el-form label-position="right" :model="model" ref="form">
		<el-form-item class="e-form" :label="$t('editor.cell.data_node.database.form.label')" prop="connectionId" :rules="rules" required>
			<el-select filterable v-model="model.connectionId" :placeholder="$t('editor.cell.data_node.database.form.placeholder')">
				<el-option
          v-for="(item, idx) in databases"
          :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
          :value="item.id"
          v-bind:key="idx"></el-option>
			</el-select>
		</el-form-item>
	</el-form>
</template>

<script>
	import factory from '../../api/factory';
	import _ from 'lodash';
	let connections = factory('connections');

	export default {
		name: "Database",

		props: {
			connection_type: {
				type: String,
				default: 'source'
			}
		},

		watch: {
			model: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.getData());
				}
			}
		},

		data(){
			return {
				databases: [],
				rules: {
					connectionId: [
						{required: true, trigger: 'blur', message: this.$t('editor.cell.data_node.database.form.placeholder')},
					]
				},
				model: {
					connectionId: ""
				}
			};
		},

		async mounted() {
			let result = await connections.get({
				filter: JSON.stringify({
					/*where: {
						connection_type: {regex: this.connection_type}
					},*/
					fields: {
						name: 1, id: 1, database_type: 1, connection_type: 1, status: 1
					},
					order: 'name ASC'
				})
			});

			if( result.data ){
				this.databases = result.data;
			}
		},

		methods: {
			setData(data){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
			},
			getData(){
				let result = _.cloneDeep(this.model);
				if( result.connectionId){
					let database = this.databases.filter( db => db.id === result.connectionId);
					if( database && database.length > 0){
						result.name = database[0].name;
					}
				}
				return result;
			}
		}
	};
</script>

<style scoped>

</style>
