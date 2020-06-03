<template>
	<div class="e-data-filter">
		<el-button class="e-button" v-if="disabled" type="primary" @click="seeMonitor">
			{{ $t("dataFlow.button.viewMonitoring") }}
		</el-button>
		<el-form class="e-form" label-position="top" label-width="130px" :model="model" ref="form" :disabled="disabled">
			<el-form-item :required="true" :label="$t('editor.cell.processor.dataFilter.form.name.label')" size="mini">
				<el-input
					v-model="model.name"
					:placeholder="$t('editor.cell.processor.dataFilter.form.name.placeholder')"
				></el-input>
			</el-form-item>

			<el-form-item :required="true" size="mini">
				<template slot="label">
					{{ $t("editor.cell.processor.dataFilter.form.expression.label") }}
					<el-tooltip placement="right-end">
						<div slot="content">
							{{ $t("editor.cell.processor.dataFilter.form.expression.labelTip") }}
						</div>
						<i class="e-primary el-icon-warning-outline"></i>
					</el-tooltip>
				</template>
				<JsEditor :code.sync="model.expression" :width.sync="width"></JsEditor>
				<!--				<el-input-->
				<!--					type="textarea"-->
				<!--					v-model="model.expression"-->
				<!--					rows="3"-->
				<!--					:placeholder="$t('editor.cell.processor.dataFilter.form.expression.placeholder')"-->
				<!--					:title="$t('editor.cell.processor.dataFilter.form.expression.labelTip')"-->
				<!--				></el-input>-->
				<div style="color: #888888; font-size: 0.8em;">
					<h3 style="font-size: 1.1em; font-weight: bold;">
						{{ $t("editor.cell.processor.dataFilter.form.expressionExample.label") }}:
					</h3>
					<p style="text-indent: 2em;">
						{{ $t("editor.cell.processor.dataFilter.form.expressionExample.tip") }}
					</p>
					<p style="text-indent: 2em;">
						<span style="color: red;">(</span> record.gender <span style="color: #F5AF3F;">==</span> 0
						<span style="color: #F5AF3F;">&&</span> record.age <span style="color: #F5AF3F;">&gt;</span> 50
						<span style="color: red;">)</span>
						<span style="color: #F5AF3F;">|| </span>
						<span style="color: red;">(</span> record.age <span style="color: #F5AF3F;">&ge;</span>30
						<span style="color: #F5AF3F;">&&</span> record.salary
						<span style="color: #F5AF3F;">&le;</span> 10000
						<span style="color: red;">)</span>
					</p>

					<h3 style="font-size: 1.1em; font-weight: bold;">
						{{ $t("editor.cell.processor.dataFilter.form.symbol.label") }}:
					</h3>
					<table>
						<tr>
							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">&gt;, &lt;</span>
								<span style="color: #F5AF3F;"></span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.gtLt") }}
							</td>

							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">&ge;, &le;</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.geLe") }}
							</td>
						</tr>
						<tr>
							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">==</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.eq") }}
							</td>

							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">!</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.not") }}
							</td>
						</tr>
						<tr>
							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">&&</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.and") }}
							</td>

							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">||</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.or") }}
							</td>
						</tr>
						<tr>
							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">/^.*$/.test( )</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.regexp") }}
							</td>

							<td style="width: 60px; text-align: center;">
								<span style="color: #F5AF3F;">( )</span>
							</td>
							<td style="width: 140px; text-align: left;">
								{{ $t("editor.cell.processor.dataFilter.form.symbol.group") }}
							</td>
						</tr>
					</table>
				</div>
			</el-form-item>

			<el-form-item
				:required="true"
				size="mini"
				:label="$t('editor.cell.processor.dataFilter.form.action.label')"
			>
				<el-select v-model="model.action">
					<el-option
						value="retain"
						:label="$t('editor.cell.processor.dataFilter.form.action.retain')"
					></el-option>
					<el-option
						value="discard"
						:label="$t('editor.cell.processor.dataFilter.form.action.discard')"
					></el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import JsEditor from "../../../components/JsEditor";
import { EditorEventType } from "../../lib/events";

let editorMonitor = null;
export default {
	name: "DataFilterAttribute",
	components: { JsEditor },
	data() {
		return {
			disabled: false,
			model: {
				type: "row_filter_processor",
				name: "Row Filter",
				expression: "//code",
				action: "retain" // discard,retain
			},
			width: "500"
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
	mounted() {
		let self = this;
		self.$on(EditorEventType.RESIZE, width => {
			self.width = width;
		});
	},
	methods: {
		setData(data, cell, isSourceDataNode, vueAdapter) {
			if (data) {
				Object.keys(data).forEach(key => (this.model[key] = data[key]));
			}

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
	}
};
</script>

<style lang="less" scoped>
@primaryColor: #f5af3f;

.e-data-filter {
	.e-form {
		padding: 10px 20px;

		.e-primary {
			color: @primaryColor;
		}

		.el-input,
		.el-select,
		.el-textarea {
			max-width: 400px;
			width: 80%;
		}
	}
}
</style>
