<template>
	<div class="collection-aggregation">
		<div class="pipeline">
			<div class="title">
				Pipeline
				<el-button type="primary" size="mini" class="pipeline-button" @click="handlePreview">{{
					$t('editor.cell.data_node.collection.form.aggregation.preview')
				}}</el-button>
			</div>
			<!-- [ <el-input class="e-textarea" type="textarea" v-model="script"></el-input>] -->
			[<JsonEditor :code.sync="script" ref="jsEditor" :width.sync="width" v-if="!disabled"></JsonEditor>]
		</div>
		<div class="preview">
			<div class="title">{{ $t('editor.cell.data_node.collection.form.aggregation.previewSampleData') }}</div>
			<div class="preview-box">
				<template v-if="returnFalg == 'success'">
					<div class="json-box" v-for="(item, index) in previewData" :key="index">
						<pre>{{ JSON.stringify(item, null, 2) }}</pre>
					</div>
				</template>

				<div class="return-data">
					<span class="error" v-if="returnFalg == 'error'">
						<p>{{ errorMessage }}</p>
					</span>
					<span class="add" v-if="returnFalg == 'add'">
						<p>{{ $t('editor.cell.data_node.collection.form.aggregation.addTextTip') }}</p>
						<p>{{ $t('editor.cell.data_node.collection.form.aggregation.addTextTip1') }}</p>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import ws from '@/api/ws';
import JsonEditor from '@/components/jsonEditor';
export default {
	name: 'collectionAggregation',
	components: { JsonEditor },
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
			previewData: [],
			errorMessage: '',
			returnFalg: 'add',
			script: ''
		};
	},

	created() {
		this.script = this.scriptVal == '[]' ? '' : this.scriptVal;
		// if (this.script) {
		// 	this.handlePreview();
		// }
	},

	methods: {
		// 预览
		handlePreview() {
			let script = this.script;
			if (!this.script.startsWith('[')) {
				script = '[' + script;
			}
			if (!this.script.endsWith(']')) {
				script = script + ']';
			}

			let params = {
				type: 'aggregatePreview',
				data: {
					connectionId: this.modelData.connectionId,
					tableName: this.modelData.tableName,
					pipeline: script
				}
			};
			if (ws.ws.readyState == 1) ws.send(params);

			let self = this,
				templeSchema = null;
			ws.on('aggregatePreviewResult', res => {
				if (res.status === 'SUCCESS' && !!res.result) {
					if (res.result.previewResult && res.result.previewResult.length) {
						self.previewData = res.result.previewResult;
					}
					if (res.result.relateDataBaseTable) {
						templeSchema = res.result.relateDataBaseTable;
					}

					self.returnFalg = 'success';
				} else if (res.status === 'ERROR') {
					self.errorMessage = res.error;
					self.returnFalg = 'error';
				}
				this.$emit('backAggregateResult', script, self.returnFalg, templeSchema);
			});
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
		height: 478px;
		margin-left: 20px;
		.preview-box {
			width: 100%;
			height: calc(100% - 28px);
			display: flex;
			flex-direction: row;
			overflow: auto;
			padding: 20px;
			box-sizing: border-box;
			.json-box {
				width: 260px;
				height: 100%;
				margin-right: 10px;
				box-sizing: border-box;
				border: 1px solid #dedee4;
				pre {
					width: 260px;
					white-space: pre-wrap;
				}
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
	.view-lines {
		width: 100% !important;
		// height: 410px !important;
	}
	.monaco {
		border: 0 !important;
		height: 410px !important;
	}
	.monaco-editor {
		width: 100% !important;
		height: 410px !important;
	}
	.el-textarea__inner {
		width: 100%;
		height: 400px;
		border: 0;
		font-size: 12px;
	}
}
</style>
