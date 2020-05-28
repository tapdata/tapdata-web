<template>
	<div id="app">
		<MonacoEditor
			height="500"
			width="500"
			class="manocaEditor"
			language="javascript"
			theme="vs"
			:code="editorContent"
			:editorOptions="options"
			@mounted="onMounted"
			@codeChange="onCodeChange"
		>
		</MonacoEditor>
	</div>
</template>

<script>
import MonacoEditor from "vue-monaco-editor";

export default {
	props: {
		code: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			editor: null,
			options: {
				theme: "vs",
				selectOnLineNumbers: true,
				roundedSelection: false,
				readOnly: false,
				automaticLayout: true,
				glyphMargin: true,
				showFoldingControls: "always",
				formatOnPaste: true,
				formatOnType: true,
				folding: true,
				contentLeft: 10,
				contentWidth: 10
			},
			editorContent: this.code
		};
	},
	components: {
		MonacoEditor
	},
	methods: {
		onMounted(editor) {
			this.editor = editor;
		},

		onCodeChange(editor) {
			this.$emit("update:code", this.editor.getValue());

			// this.editor.setValue(this.params) // 参数是编辑器需要展示的json串
			//
			// this.editor.trigger('','editor.action.format') // 触发自动格式化
			//
			// this.editor.setValue(this.editor.getValue()) // 强制刷新一次
			//
			// this.editor.updateOptions({
			//
			//
			//
			// });
		}
	}
};
</script>
<style scoped>
.manocaEditor {
	border: 1px solid #dedee4;
	text-align: left;
	background-color: #fff;
}
.manocaEditor .line-numbers {
	width: 0;
}
</style>
