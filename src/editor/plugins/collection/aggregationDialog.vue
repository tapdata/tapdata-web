<template>
	<div class="collection-aggregation">
		<div class="pipeline">
			<div class="title">
				Pipeline
				<el-button type="primary" size="mini" class="pipeline-button" @click="handlePreview">{{
					$t('editor.cell.data_node.collection.form.aggregation.preview')
				}}</el-button>
			</div>
			[<JsEditor :code.sync="script" ref="jsEditor" :width.sync="width" v-if="!disabled"></JsEditor>]
		</div>
		<div class="preview">
			<div class="title">{{ $t('editor.cell.data_node.collection.form.aggregation.previewSampleData') }}</div>
			<div class="preview-box">
				<!-- <el-input
						class="e-textarea"
						type="textarea"
						v-for="item in previewData"
						:key="item"
						v-model="item.script"
					></el-input> -->
				<div class="return-data">
					<!-- <span class="error">
							<p>{{ errorMessage }}</p>
						</span> -->
					<span class="add">
						<p>{{ $t('editor.cell.data_node.collection.form.aggregation.addTextTip') }}</p>
						<p>{{ $t('editor.cell.data_node.collection.form.aggregation.addTextTip1') }}</p>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import JsEditor from '@/components/JsEditor';
import ws from '@/api/ws';
export default {
	name: 'collectionAggregation',
	components: {
		JsEditor
	},
	props: {
		scriptVal: {
			type: String
		},
		modelData: {
			type: Object
		}
	},
	data() {
		return {
			disabled: false,
			width: '500',
			previewData: [
				{ script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}' },
				{ script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}' },
				{ script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}' },
				{ script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}' },
				{ script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}' },
				{ script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}' }
			],
			errorMessage: 'adfasdfadfadsfasdf adsfasdf asd'
		};
	},

	created() {
		this.script = this.scriptVal;
	},

	methods: {
		handlePreview() {
			let params = {
				type: 'collectionAggregation',
				data: {
					tables: [
						{
							connId: this.modelData.connectionId,
							tableName: this.modelData.tableName,
							aggregationFunc: this.script,
							userId: this.$cookie.get('user_id')
						}
					]
				}
			};
			if (ws.ws.readyState == 1) ws.send(params);
			// let templeSchema = null,
			// 	schema = null;
			// ws.on('aggregation_schema_result', res => {
			// 	if (res.status === 'SUCCESS' && res.result && res.result.length) {
			// 		templeSchema = res.result;
			// 	}
			// 	if (templeSchema) {

			// 	}
			// });
		}
	}
};
</script>
<style scoped lang="less">
.collection-aggregation {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	& > div {
		width: 100%;
		color: #333;
		border: 1px solid #dedee4;
		.title {
			width: 100%;
			height: 28px;
			line-height: 27px;
			padding: 0 20px;
			font-size: 12px;
			color: #333;
			box-sizing: border-box;
			background: #f5f5f5;
			border-bottom: 1px solid #dedee4;
		}
	}
	.pipeline {
		width: 400px;
		height: 478px;
		.pipeline-button {
			float: right;
			height: 20px;
			margin-top: 4px;
			padding: 0 10px;
		}
	}
	.preview {
		width: calc(100% - 420px);
		height: 100%;
		margin-left: 20px;
		.preview-box {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: row;
			overflow: auto;
			padding: 20px;
			box-sizing: border-box;
			.e-textarea {
				width: 260px;
				height: 410px;
				margin-right: 10px;
			}
			.return-data {
				height: 410px;
				.error {
					font-size: 12px;
					color: #f56c6c;
				}
				.add {
					font-size: 12px;
					color: #666;
				}
			}
		}
	}
}
</style>
<style lang="less">
.collection-aggregation {
	.monaco,
	.margin,
	.monaco-editor,
	.monaco-scrollable-element,
	.margin-view-overlays,
	.view-lines {
		width: 100% !important;
		height: 410px !important;
	}
	.monaco {
		border: 0 !important;
	}
	.monaco-editor {
		width: 100% !important;
		height: 410px !important;
	}
	.el-textarea__inner {
		width: 260px;
		height: 100%;
		font-size: 12px;
	}
}
</style>
