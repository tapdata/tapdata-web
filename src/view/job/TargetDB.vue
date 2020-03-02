<template>
	<el-form label-position="right" :model="model">
		<el-form-item label="Source Target" prop="connectionId" :rules="rules">
			<el-select v-model="model.connectionId" placeholder="Please select target database">
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
		name: "TargetDB",

		props: {
			connection_type: {
				type: String,
				default: 'target'
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
						{required: true, trigger: 'blur', message: 'Please select target database'},
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
					where: {
						connection_type: {regex: this.connection_type}
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

		methods: {
			setData(data){
				if( data ){
					this.model.connectionId = data.connectionId;
				}
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			},
			async validate(){
				return new Promise((resolve) => {
					this.$refs.form.validate(resolve);
				});
			}
		}
	};
</script>

<style scoped>

</style>
