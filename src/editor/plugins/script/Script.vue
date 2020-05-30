<template>
	<div class="nodeStyle">
		<div class="nodeBody">
			<el-form class="e-form" label-position="top" label-width="130px" :model="model" ref="form">
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

				<el-form-item
					:required="true"
					:label="$t('editor.cell.processor.script.form.script.label')"
					size="mini"
				>
					<JsEditor :code.sync="model.script" ref="jsEditor" :width.sync="width"></JsEditor>
				</el-form-item>
			</el-form>
			<el-button class="btn-debug" type="primary" size="mini" @click="showDebug">连接测试</el-button>
		</div>
		<Debug ref="debug"></Debug>
	</div>
</template>

<script>
import JsEditor from "../../../components/JsEditor";
import log from "../../../log";
import { EditorEventType } from "../../lib/events";
import Debug from "./Debug";
import ws, {EventName} from "../../../api/ws";

export default {
	name: "Script",
	components: {
		JsEditor,
		Debug
	},
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
			},
			width: "500"
		};
	},
	mounted() {
		let self = this;
		self.$on(EditorEventType.RESIZE, width => {
			self.width = width;
			this.$refs.debug.resize(width);
		});
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
				log("model script", this.model);
			}
		},
		getData() {
			return JSON.parse(JSON.stringify(this.model));
		},
		showDebug() {
			ws.send({
				type: "execute_script",
				script: "function process(record){ return record;}",
				script_type: "",
				agentId: "c327696c-2892-4966-94d3-1c1229d53e7c",
				dataFlowId: "",
				stageId: ""
			});

			this.$refs.debug.show(cb => {
				ws.once(EventName.EXECUTE_SCRIPT_RESULT, function(msg){
					log("Job.ReceiveMessage", msg);
					cb(msg)
				});
			});
		}
	}
};
</script>

<style lang="less" scoped>
.btn-debug {
	float: right;
}
</style>
