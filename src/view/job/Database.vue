<template>
	<el-form label-position="right" :model="model" ref="form">
		<el-form-item label="Database" prop="connectionId" :rules="rules" required>
			<el-select v-model="model.connectionId" :placeholder="`Please select database`">
				<el-option
						v-for="(item, idx) in databases"
						:label="`${item.name} (${item.status})`"
						:value="item.id"
						v-bind:key="idx"></el-option>
			</el-select>
		</el-form-item>
	</el-form>
</template>

<script>
	import factory from '../../api/factory';
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
						{required: true, trigger: 'blur', message: `Please select database`},
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
					}
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
				return JSON.parse(JSON.stringify(this.model));
			}
		}
	};
</script>

<style scoped>

</style>
