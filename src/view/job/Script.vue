<template>
	<el-form label-position="right" label-width="130px" :model="model" ref="form">

		<el-form-item :required="true" label="Name">
			<el-input v-model="model.name" class="form-item-width" placeholder="Please enter node name"></el-input>
		</el-form-item>

		<el-form-item :required="true" label="Script Type">
			<el-select v-model="model.type" placeholder="Type of script" value="js_processor">
				<el-option
						v-for="(item, idx) in scriptTypes"
						:label="item.label"
						:value="item.value"
						v-bind:key="idx"
				></el-option>
			</el-select>
		</el-form-item>

		<el-form-item :required="true" label="Script">
			<el-input type="textarea" rows="10" v-model="model.script"></el-input>
		</el-form-item>
	</el-form>
</template>

<script>
	export default {
		name: "Script",

		data() {
			return {
				scriptTypes: [{
					label: 'JavaScript',
					value: 'js_processor'
				}, {
					label: 'Java',
					value: 'java_processor'
				}],

				databases: [],
				rules: {
					connectionId: [
						{required: true, trigger: 'blur', message: `Please select ${this.connection_type} database`},
					]
				},
				model: {
					name: 'JavaScript',
					type: "js_processor",
					script: "function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}"
				}
			};
		},

		watch: {
			model: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.getData());
				}
			},
		},

		methods:{
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
	.form-item-width {
		width: 300px;
	}
</style>
