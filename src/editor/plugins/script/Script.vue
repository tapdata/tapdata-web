<template>
	<div class="nodeStyle">
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t("dataFlow.button.viewMonitoring") }}
				</el-button>
			</div>
			<el-form
				class="e-form"
				label-position="top"
				label-width="130px"
				:model="model"
				:disabled="disabled"
				ref="form"
			>
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
			<el-button class="btn-debug" type="primary" size="mini" @click="showDebug">
				{{ $t("editor.cell.processor.script.debug_button_label") }}
			</el-button>
		</div>
		<Debug ref="debug"></Debug>
	</div>
</template>

<script>
import JsEditor from "../../../components/JsEditor";
import log from "../../../log";
import { EditorEventType } from "../../lib/events";
import Debug from "./Debug";
import ws, { EventName } from "../../../api/ws";
let editorMonitor = null;

const gData = {};
export default {
	name: "Script",
	components: {
		JsEditor,
		Debug
	},
	data() {
		return {
			disabled: false,
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
		setData(data, cell, isSourceDataNode, vueAdapter) {
			if (data) {
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
				log("model script", this.model);
			}
			gData.stageId = cell.id;
			gData.dataFlowId = arguments[3].editor.scope.dataFlowId;

			editorMonitor = vueAdapter.editor;
		},
		getData() {
			return JSON.parse(JSON.stringify(this.model));
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		},

		showDebug() {
			log("Connect to Test Server");
			if (!gData.dataFlowId) {
				this.$message.error(this.$t("editor.cell.processor.script.warning_for_not_save"));
				return;
			}
			ws.getAgentId((err, id) => {
				if (!err && id) {
					let params = this.model;
					ws.sendPipe(
						{
							type: "execute_script",
							script: params.script,
							script_type: params.type,
							dataFlowId: gData.dataFlowId,
							stageId: gData.stageId
						},
						id
					);
				} else {
					this.$message.error(this.$t("editor.cell.processor.script.connect_server_fail"));
				}
			});

			this.$refs.debug.show(cb => {
				ws.once(EventName.EXECUTE_SCRIPT_RESULT, function(msg) {
					log("Job.ReceiveMessage", msg);
					cb(msg);
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
