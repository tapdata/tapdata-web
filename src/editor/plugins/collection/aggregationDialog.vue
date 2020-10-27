<template>
	<div class="collection-aggregation">
		<div class="pipeline">
			<div class="title">
				Pipeline
				<el-button type="primary" size="mini">{{
					$t('editor.cell.data_node.collection.form.aggregation.preview')
				}}</el-button>
			</div>
			<JsEditor :code.sync="script" ref="jsEditor" :width.sync="width" v-if="!disabled"></JsEditor>
		</div>
		<div class="preview">
			<div class="title">{{ $t('editor.cell.data_node.collection.form.aggregation.previewSampleData') }}</div>
			<div class="preview-box">
				<div class="preview-main">
					<el-input
						class="e-textarea"
						type="textarea"
						v-for="item in previewData"
						:key="item"
						v-model="item.script"
					></el-input>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import JsEditor from '@/components/JsEditor';
export default {
	name: 'collectionAggregation',
	components: {
		JsEditor
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
			script: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}'
		};
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
	}
	.preview {
		width: calc(100% - 420px);
		height: 100%;
		margin-left: 20px;
		.preview-box {
			.preview-main {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: row;
				overflow: auto;
				padding: 20px;
				box-sizing: border-box;
				.e-textarea {
					width: 260px;
					height: 400px;
					margin-right: 10px;
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
		height: 450px !important;
	}
	.monaco-editor {
		width: 100% !important;
		height: 448px !important;
	}
	.el-textarea__inner {
		width: 260px;
		height: 100%;
		font-size: 12px;
	}
}
</style>
