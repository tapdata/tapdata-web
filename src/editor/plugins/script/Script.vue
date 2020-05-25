<template>
	<el-form label-position="right" label-width="130px" :model="model" ref="form">
		<el-form-item :required="true" :label="$t('editor.cell.processor.script.form.name.label')" size="mini">
			<el-input
				v-model="model.name"
				class="form-item-width"
				:placeholder="$t('editor.cell.processor.script.form.name.placeholder')"
			></el-input>
		</el-form-item>

		<el-form-item :required="true" :label="$t('editor.cell.processor.script.form.type.label')" size="mini">
			<el-select
				v-model="model.type"
				:placeholder="$t('editor.cell.processor.script.form.type.placeholder')"
				value="js_processor"
			>
				<el-option
					v-for="(item, idx) in scriptTypes"
					:label="item.label"
					:value="item.value"
					v-bind:key="idx"
				></el-option>
			</el-select>
		</el-form-item>

		<el-form-item :required="true" :label="$t('editor.cell.processor.script.form.script.label')" size="mini">
			<JsEditor :code.sync="model.script"></JsEditor>
			<!--			<el-input type="textarea" rows="10" v-model="model.script"></el-input>-->
		</el-form-item>
	</el-form>
</template>

<script>
import JsEditor from "../../../components/JsEditor";
import log from "../../../log";
export default {
	name: "Script",
	components: { JsEditor },
	data() {
		return {
			scriptTypes: [
				{
					label: "JavaScript",
					value: "js_processor"
				},
				{
					label: "Java",
					value: "java_processor"
				}
			],

			databases: [],
			rules: {
				connectionId: [
					{
						required: true,
						trigger: "blur",
						message: `Please select ${this.connection_type} database`
					}
				]
			},
			model: {
				name: "JavaScript",
				type: "js_processor",
				script: "function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}"
			}
		};
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit("dataChanged", this.getData());
			}
		}
	},

	methods: {
		setData(data) {
			if (data) {
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
			}
		},
		getData() {
			log("model script", this.model);
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
